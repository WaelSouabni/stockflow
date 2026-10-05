import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";

export type InvoiceInput={customerId:string;items:Array<{description:string;quantity:number;unitPrice:number;discount:number;productId?:string}>;taxRate:number;discount:number;type?:"INVOICE"|"QUOTE"};

export async function createInvoice(input:InvoiceInput){
  const {companyId}=await requireTenant();
  return prisma.$transaction(async tx=>{
    const customer=await tx.customer.findFirst({where:{id:input.customerId,companyId},select:{id:true}});
    if(!customer) throw new Error("Client introuvable.");

    for(const item of input.items){
      if(item.productId){
        const product=await tx.product.findFirst({where:{id:item.productId,companyId},select:{id:true}});
        if(!product) throw new Error("Produit introuvable.");
      }
    }

    const settings=await tx.companySettings.findUnique({where:{companyId}});
    const year=new Date().getFullYear();
    const type=input.type??"INVOICE";
    const prefix=type==="QUOTE"?"DEV":settings?.invoicePrefix||"FAC";
    const padding=settings?.invoiceNumberPadding||4;
    const seq=await tx.invoiceSequence.upsert({
      where:{companyId_year_documentType:{companyId,year,documentType:type}},
      create:{companyId,year,documentType:type,lastNumber:1},
      update:{lastNumber:{increment:1}},
    });
    const number=`${prefix}-${year}-${String(seq.lastNumber).padStart(padding,"0")}`;
    const {subtotal,tax,total}=calculateInvoiceTotals(input.items,input.discount,input.taxRate);

    return tx.invoice.create({
      data:{
        companyId,number,customerId:input.customerId,type,status:"DRAFT",subtotal,discount:input.discount,taxRate:input.taxRate,taxAmount:tax,total,
        currency:settings?.currency||"EUR",
        items:{create:input.items.map(i=>({description:i.description,quantity:i.quantity,unitPrice:i.unitPrice,discount:i.discount,total:i.quantity*i.unitPrice-i.discount,productId:i.productId}))},
      },
    });
  });
}

export async function listInvoices(type:"INVOICE"|"QUOTE"="INVOICE"){
  const {companyId}=await requireTenant();
  return prisma.invoice.findMany({where:{companyId,type},include:{customer:true,items:true},orderBy:{issueDate:"desc"}});
}

export const INVOICE_STATUS_TRANSITIONS: Record<string, string[]>={DRAFT:["SENT","CANCELLED"],SENT:["PAID","OVERDUE","CANCELLED"],OVERDUE:["PAID","CANCELLED"],PAID:[],CANCELLED:[]};

export async function updateInvoiceStatus(id:string,status:"DRAFT"|"SENT"|"PAID"|"OVERDUE"|"CANCELLED"){
  const {companyId}=await requireTenant();
  const current=await prisma.invoice.findFirst({where:{id,companyId},select:{status:true}});
  if(!current) throw new Error("Document introuvable.");
  if(current.status===status) return;
  if(!INVOICE_STATUS_TRANSITIONS[current.status]?.includes(status)) throw new Error(`Transition de statut invalide : ${current.status} → ${status}`);
  const result=await prisma.invoice.updateMany({where:{id,companyId,status:current.status},data:{status}});
  if(result.count!==1) throw new Error("Le document a été modifié entre-temps. Veuillez réessayer.");
  return prisma.invoice.findFirst({where:{id,companyId}});
}

export async function getInvoice(id:string){
  const {companyId}=await requireTenant();
  return prisma.invoice.findFirst({where:{id,companyId},include:{customer:true,items:true}});
}