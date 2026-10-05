import {prisma} from "@/lib/prisma";
export type ProductInput={sku:string;name:string;price:number;costPrice:number;stock:number;minStock:number;description?:string;category?:string;supplier?:string};
export async function listProducts(){return prisma.product.findMany({include:{variants:true},orderBy:{createdAt:"desc"}});}
export async function createProduct(input:ProductInput){return prisma.$transaction(async tx=>{const product=await tx.product.create({data:input});if(input.stock>0)await tx.stockMovement.create({data:{productId:product.id,type:"IN",quantity:input.stock,reason:"Stock initial"}});return product;});}
export async function updateProduct(id:string,input:Partial<Omit<ProductInput,"stock">>){return prisma.product.update({where:{id},data:input});}
export async function deleteProduct(id:string){return prisma.product.delete({where:{id}});}
export async function createVariant(productId:string,input:{sku:string;name:string;size?:string;color?:string;stock:number;minStock:number}){return prisma.$transaction(async tx=>{const variant=await tx.productVariant.create({data:{productId,...input}});if(input.stock>0)await tx.stockMovement.create({data:{productId,variantId:variant.id,type:"IN",quantity:input.stock,reason:"Stock initial variante"}});return variant;});}
export async function updateVariant(id:string,input:Partial<{sku:string;name:string;size:string;color:string;minStock:number}>){return prisma.productVariant.update({where:{id},data:input});}
export async function deleteVariant(id:string){return prisma.productVariant.delete({where:{id}});}