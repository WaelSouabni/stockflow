import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";

export type InvoiceInput = { customerId: string; items: Array<{ description: string; quantity: number; unitPrice: number; discount: number; productId?: string }>; taxRate: number; discount: number; type?: "INVOICE" | "QUOTE" };

export async function createInvoice(input: InvoiceInput) {
  return prisma.$transaction(async tx => {
    const settings = await tx.companySettings.findFirst();
    const year = new Date().getFullYear();
    const type = input.type ?? "INVOICE";
    const prefix = type === "QUOTE" ? "DEV" : settings?.invoicePrefix || "FAC";
    const padding = settings?.invoiceNumberPadding || 4;
    const seq = await tx.invoiceSequence.upsert({ where: { year_documentType: { year, documentType: type } }, create: { year, documentType: type, lastNumber: 1 }, update: { lastNumber: { increment: 1 } } });
    const number = `${prefix}-${year}-${String(seq.lastNumber).padStart(padding, "0")}`;
    const { subtotal, tax, total } = calculateInvoiceTotals(input.items, input.discount, input.taxRate);
    return tx.invoice.create({ data: { number, customerId: input.customerId, type, status: "DRAFT", subtotal, discount: input.discount, taxRate: input.taxRate, taxAmount: tax, total, currency: settings?.currency || "EUR", items: { create: input.items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, discount: i.discount, total: i.quantity * i.unitPrice - i.discount, productId: i.productId })) } } });
  });
}
export async function listInvoices(type: "INVOICE" | "QUOTE" = "INVOICE") { return prisma.invoice.findMany({ where: { type }, include: { customer: true }, orderBy: { issueDate: "desc" } }); }
export async function updateInvoiceStatus(id: string, status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED") { return prisma.invoice.update({ where: { id }, data: { status } }); }
export async function getInvoice(id: string) { return prisma.invoice.findUnique({ where: { id }, include: { customer: true, items: true } }); }
