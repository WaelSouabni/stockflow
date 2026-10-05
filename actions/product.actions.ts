"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createProduct,deleteProduct,updateProduct,createVariant,updateVariant,deleteVariant } from "@/services/product.service";
const productCreateSchema=z.object({sku:z.string().trim().min(1).max(80),name:z.string().trim().min(1).max(160),price:z.coerce.number().finite().min(0),costPrice:z.coerce.number().finite().min(0),stock:z.coerce.number().int().min(0),minStock:z.coerce.number().int().min(0),description:z.string().trim().max(2000).optional(),category:z.string().trim().max(120).optional(),supplier:z.string().trim().max(160).optional()});
const productUpdateSchema=productCreateSchema.omit({stock:true}).partial();
const variantCreateSchema=z.object({sku:z.string().trim().min(1).max(80),name:z.string().trim().min(1).max(160),size:z.string().trim().max(80).optional(),color:z.string().trim().max(80).optional(),stock:z.coerce.number().int().min(0),minStock:z.coerce.number().int().min(0)});
const variantUpdateSchema=variantCreateSchema.omit({stock:true}).partial();
function refresh(){revalidatePath("/products");revalidatePath("/stock");revalidatePath("/dashboard");}
export async function createProductAction(formData:FormData){await requireRole("ADMIN","MANAGER");const parsed=productCreateSchema.safeParse(Object.fromEntries(formData));if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||"Produit invalide");await createProduct(parsed.data);refresh();}
export async function updateProductAction(id:string,formData:FormData){await requireRole("ADMIN","MANAGER");const parsed=productUpdateSchema.safeParse(Object.fromEntries(formData));if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||"Produit invalide");await updateProduct(id,parsed.data);refresh();}
export async function deleteProductAction(id:string){await requireRole("ADMIN","MANAGER");await deleteProduct(id);refresh();}
export async function createVariantAction(productId:string,formData:FormData){await requireRole("ADMIN","MANAGER");const parsed=variantCreateSchema.safeParse(Object.fromEntries(formData));if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||"Variante invalide");await createVariant(productId,parsed.data);refresh();}
export async function updateVariantAction(id:string,formData:FormData){await requireRole("ADMIN","MANAGER");const parsed=variantUpdateSchema.safeParse(Object.fromEntries(formData));if(!parsed.success)throw new Error(parsed.error.issues[0]?.message||"Variante invalide");await updateVariant(id,parsed.data);refresh();}
export async function deleteVariantAction(id:string){await requireRole("ADMIN","MANAGER");await deleteVariant(id);refresh();}