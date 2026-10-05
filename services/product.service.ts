import { prisma } from "@/lib/prisma";

export type ProductInput = {
  sku: string; name: string; price: number; costPrice: number; stock: number; minStock: number;
  description?: string; category?: string; supplier?: string;
};

export async function listProducts() {
  return prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: "desc" } });
}
export async function createProduct(input: ProductInput) { return prisma.product.create({ data: input }); }
export async function updateProduct(id: string, input: Partial<ProductInput>) {
  return prisma.product.update({ where: { id }, data: input });
}
export async function deleteProduct(id: string) { return prisma.product.delete({ where: { id } }); }
export async function createVariant(productId: string, input: {sku:string;name:string;size?:string;color?:string;stock:number;minStock:number}) {
  return prisma.productVariant.create({ data: { productId, ...input } });
}
export async function updateVariant(id: string, input: Partial<{sku:string;name:string;size:string;color:string;stock:number;minStock:number}>) {
  return prisma.productVariant.update({ where: { id }, data: input });
}
export async function deleteVariant(id: string) { return prisma.productVariant.delete({ where: { id } }); }