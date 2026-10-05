import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";
import { buildMonthlyRevenue, getPeriodStart, type DashboardPeriod } from "@/lib/dashboard-calculations";

export async function getDashboardData(period:DashboardPeriod=180){
  const {companyId}=await requireTenant();
  const startDate=getPeriodStart(period);
  const [products,unpaid,invoices,movements,settings]=await Promise.all([
    prisma.product.findMany({where:{companyId},select:{id:true,name:true,stock:true,costPrice:true,minStock:true}}),
    prisma.invoice.aggregate({where:{companyId,type:"INVOICE",status:{in:["SENT","OVERDUE"]}},_count:{_all:true},_sum:{total:true}}),
    prisma.invoice.findMany({where:{companyId,issueDate:{gte:startDate}},select:{id:true,number:true,issueDate:true,total:true,status:true,currency:true,customer:{select:{name:true}}},orderBy:{issueDate:"desc"},take:1000}),
    prisma.stockMovement.findMany({where:{companyId,createdAt:{gte:startDate}},select:{id:true,createdAt:true,type:true,quantity:true,product:{select:{name:true}}},orderBy:{createdAt:"desc"},take:50}),
    prisma.companySettings.findUnique({where:{companyId},select:{currency:true,locale:true}}),
  ]);
  const stockValue=products.reduce((sum,product)=>sum+product.stock*Number(product.costPrice),0);
  const lowStockProducts=products.filter(product=>product.stock<=product.minStock).sort((a,b)=>a.stock-b.stock).slice(0,8);
  const revenue=invoices.filter(invoice=>invoice.status==="PAID").reduce((sum,invoice)=>sum+Number(invoice.total),0);
  const invoiceCount=invoices.filter(invoice=>invoice.status!=="CANCELLED"&&invoice.status!=="DRAFT").length;
  return {period,stockValue,alerts:lowStockProducts.length,totalLowStock:products.filter(product=>product.stock<=product.minStock).length,unpaidCount:unpaid._count._all,unpaidAmount:Number(unpaid._sum.total??0),revenue,invoiceCount,monthly:buildMonthlyRevenue(invoices.map(invoice=>({issueDate:invoice.issueDate,total:Number(invoice.total),status:invoice.status})),period===365?12:6),invoices,movements,lowStockProducts,currency:settings?.currency??"EUR",locale:settings?.locale??"fr-FR"};
}