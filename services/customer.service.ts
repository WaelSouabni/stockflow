import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function listCustomers(){
  const {companyId}=await requireTenant();
  return prisma.customer.findMany({where:{companyId},orderBy:{createdAt:"desc"}});
}

export async function createCustomer(data:{name:string;email?:string;phone?:string}){
  const {companyId}=await requireTenant();
  return prisma.customer.create({data:{...data,companyId}});
}