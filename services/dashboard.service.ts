import { prisma } from "@/lib/prisma";
export async function getDashboardData(){
 const [products,unpaid,invoices,movements]=await Promise.all([
  prisma.product.findMany({select:{stock:true,costPrice:true,minStock:true,name:true}}),
  prisma.invoice.aggregate({where:{status:{in:["SENT","OVERDUE"]}},_sum:{total:true}}),
  prisma.invoice.findMany({select:{issueDate:true,total:true,status:true},orderBy:{issueDate:"asc"}}),
  prisma.stockMovement.findMany({select:{createdAt:true,type:true,quantity:true},orderBy:{createdAt:"desc"},take:20})
 ]);
 const stockValue=products.reduce((s,p)=>s+p.stock*Number(p.costPrice),0);
 const alerts=products.filter(p=>p.stock<=p.minStock).length;
 const revenue=invoices.filter(i=>i.status==="PAID").reduce((s,i)=>s+Number(i.total),0);
 return {stockValue,alerts,unpaid:Number(unpaid._sum.total??0),revenue,invoices,movements};
}
