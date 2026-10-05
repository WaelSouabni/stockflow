import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function getSettings(){
  const {companyId}=await requireTenant();
  return prisma.companySettings.findUnique({where:{companyId}});
}

export type SettingsInput={companyName:string;logoUrl?:string;address?:string;city?:string;country?:string;email?:string;phone?:string;website?:string;siret?:string;vatNumber?:string;bankName?:string;iban?:string;bic?:string;currency:string;locale:string;invoicePrefix:string;invoiceNumberPadding:number;defaultTaxRate:number};

export async function saveSettings(data:SettingsInput){
  const {companyId}=await requireTenant();
  return prisma.companySettings.upsert({where:{companyId},create:{companyId,...data},update:data});
}