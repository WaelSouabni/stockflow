"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createProduct,deleteProduct,updateProduct,createVariant,updateVariant,deleteVariant } from "@/services/product.service";

const productSchema=z.object({
  sku:z.string().trim().min(1).max(80), name:z.string().trim().min(1).max(160),
  price:z.coerce.number().min(0), costPrice:z.coerce.number().min(0),
  stock:z.coerce.number().int().min(0), minStock:z.coerce.number().int().min(0),
  description:z.string().max(2000).optional(), category:z.string().max(120).optional(), supplier:z.string().max(160).optional()
});
const variantSchema=z.object({
  sku:z.string().trim().min(1).max(80), name:z.string().trim().min(1).max(160),
  size:z.string().max(80).optional(), color:z.string().max(80).optional(),
  stock:z.coerce.number().int().min(0), minStock:z.coerce.number().int().min(0)
});
function refresh(){revalidatePath("/products");revalidatePath("/dashboard");}

export async function createProductAction(formData:FormData){
  const parsed=productSchema.safeParse(Object.fromEntries(formData));
  if(!parsed.success) throw new Error(parsed.error.issues[0]?.message||"Produit invalide");
  await createProduct(parsed.data); refresh();
}
export async function updateProductAction(id:string,formData:FormData){
  const parsed=productSchema.partial().safeParse(Object.fromEntries(formData));
  if(!parsed.success) throw new Error(parsed.error.issues[0]?.message||"Produit invalide");
  await updateProduct(id,parsed.data); refresh();
}
export async function deleteProductAction(id:string){await deleteProduct(id);refresh();}
export async function createVariantAction(productId:string,formData:FormData){
  const parsed=variantSchema.safeParse(Object.fromEntries(formData));
  if(!parsed.success) throw new Error(parsed.error.issues[0]?.message||"Variante invalide");
  await createVariant(productId,parsed.data);refresh();
}
export async function updateVariantAction(id:string,formData:FormData){
  const parsed=variantSchema.partial().safeParse(Object.fromEntries(formData));
  if(!parsed.success) throw new Error(parsed.error.issues[0]?.message||"Variante invalide");
  await updateVariant(id,parsed.data);refresh();
}
export async function deleteVariantAction(id:string){await deleteVariant(id);refresh();}