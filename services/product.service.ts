import { prisma } from "@/lib/prisma";
export async function listProducts(){return prisma.product.findMany({include:{variants:true},orderBy:{createdAt:"desc"}});}
export async function createProduct(input:{sku:string;name:string;price:number;costPrice:number;stock:number;minStock:number;description?:string}){return prisma.product.create({data:{...input}});}
export async function updateProduct(id:string,input:Partial<{sku:string;name:string;price:number;costPrice:number;stock:number;minStock:number;description:string}>){return prisma.product.update({where:{id},data:input});}
export async function deleteProduct(id:string){return prisma.product.delete({where:{id}});}
