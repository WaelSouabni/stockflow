import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export type ProductInput = { sku:string; name:string; price:number; costPrice:number; stock:number; minStock:number; description?:string; category?:string; supplier?:string };

export async function listProducts() {
  const { companyId } = await requireTenant();
  return prisma.product.findMany({ where:{companyId}, include:{variants:true}, orderBy:{createdAt:"desc"} });
}

export async function createProduct(input: ProductInput) {
  const { companyId } = await requireTenant();
  return prisma.$transaction(async tx => {
    const product = await tx.product.create({ data:{ ...input, companyId } });
    if(input.stock>0) await tx.stockMovement.create({ data:{ companyId, productId:product.id, type:"IN", quantity:input.stock, reason:"Stock initial" } });
    return product;
  });
}

export async function updateProduct(id:string,input:Partial<Omit<ProductInput,"stock">>) {
  const { companyId } = await requireTenant();
  const result = await prisma.product.updateMany({ where:{id,companyId}, data:input });
  if(result.count!==1) throw new Error("Produit introuvable.");
  return prisma.product.findFirst({where:{id,companyId}});
}

export async function deleteProduct(id:string) {
  const { companyId } = await requireTenant();
  const result = await prisma.product.deleteMany({ where:{id,companyId} });
  if(result.count!==1) throw new Error("Produit introuvable.");
}

export async function createVariant(productId:string,input:{sku:string;name:string;size?:string;color?:string;stock:number;minStock:number}) {
  const { companyId } = await requireTenant();
  return prisma.$transaction(async tx => {
    const product = await tx.product.findFirst({where:{id:productId,companyId},select:{id:true}});
    if(!product) throw new Error("Produit introuvable.");
    const variant = await tx.productVariant.create({data:{companyId,productId,...input}});
    if(input.stock>0) await tx.stockMovement.create({data:{companyId,productId,variantId:variant.id,type:"IN",quantity:input.stock,reason:"Stock initial variante"}});
    return variant;
  });
}

export async function updateVariant(id:string,input:Partial<{sku:string;name:string;size:string;color:string;minStock:number}>) {
  const { companyId } = await requireTenant();
  const result = await prisma.productVariant.updateMany({where:{id,companyId},data:input});
  if(result.count!==1) throw new Error("Variante introuvable.");
  return prisma.productVariant.findFirst({where:{id,companyId}});
}

export async function deleteVariant(id:string) {
  const { companyId } = await requireTenant();
  const result = await prisma.productVariant.deleteMany({where:{id,companyId}});
  if(result.count!==1) throw new Error("Variante introuvable.");
}