"use server";
import { revalidatePath } from "next/cache";
import { createProduct,deleteProduct,updateProduct } from "@/services/product.service";
export async function createProductAction(formData:FormData){await createProduct({sku:String(formData.get("sku")||""),name:String(formData.get("name")||""),price:Number(formData.get("price")||0),costPrice:Number(formData.get("costPrice")||0),stock:Number(formData.get("stock")||0),minStock:Number(formData.get("minStock")||0),description:String(formData.get("description")||"")});revalidatePath("/products");revalidatePath("/dashboard");}
export async function updateProductAction(id:string,data:Record<string,unknown>){await updateProduct(id,data as never);revalidatePath("/products");revalidatePath("/dashboard");}
export async function deleteProductAction(id:string){await deleteProduct(id);revalidatePath("/products");revalidatePath("/dashboard");}
