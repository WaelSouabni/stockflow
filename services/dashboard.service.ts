import {prisma} from "@/lib/prisma";
export async function getDashboardData(){
 const [products,unpaid,invoices,movements]=await Promise.all([
  prisma.product.findMany({select:{stock:true,costPrice:true,minStock:true,name:true}}),
  prisma.invoice.aggregate({where:{status:{in:["SENT","OVERDUE"]}},_sum:{total:true}}),
  prisma.invoice.findMany({select:{issueDate:true,total:true,status:true},orderBy:{issueDate:"asc"}}),
  prisma.stockMovement.findMany({select:{createdAt:true,type:true,quantity:true},orderBy:{createdAt:"desc"},take:50})
 ]);
 const stockValue=products.reduce((s,p)=>s+p.stock*Number(p.costPrice),0); const alerts=products.filter(p=>p.stock<=p.minStock).length;
 const revenue=invoices.filter(i=>i.status==="PAID").reduce((s,i)=>s+Number(i.total),0);
 const monthly=Array.from({length:6},(_,index)=>{const d=new Date();d.setMonth(d.getMonth()-(5-index),1);const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;return {month:key,revenue:invoices.filter(i=>{const x=new Date(i.issueDate);return i.status==="PAID"&&`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}`===key}).reduce((s,i)=>s+Number(i.total),0)}});
 return {stockValue,alerts,unpaid:Number(unpaid._sum.total??0),revenue,invoices,movements,monthly};
}