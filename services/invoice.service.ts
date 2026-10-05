import { prisma } from "@/lib/prisma";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";

export type InvoiceInput = {
  customerId: string;
  items: Array<{ description: string; quantity: number; unitPrice: number; discount: number; productId?: string }>;
  taxRate: number;
  discount: number;
  type?: "INVOICE" | "QUOTE";
};

export async function createInvoice(input: InvoiceInput) {
  return prisma.$transaction(async tx => {
    const customer = await tx.customer.findUnique({ where: { id: input.customerId }, select: { id: true } });
    if (!customer) throw new Error("Client introuvable.");

    for (const item of input.items) {
      if (item.productId) {
        const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true } });
        if (!product) throw new Error("Produit introuvable.");
      }
    }

    const settings = await tx.companySettings.findFirst();
    const year = new Date().getFullYear();
    const type = input.type ?? "INVOICE";
    const prefix = type === "QUOTE" ? "DEV" : settings?.invoicePrefix || "FAC";
    const padding = settings?.invoiceNumberPadding || 4;
    const seq = await tx.invoiceSequence.upsert({
      where: { year_documentType: { year, documentType: type } },
      create: { year, documentType: type, lastNumber: 1 },
      update: { lastNumber: { increment: 1 } },
    });
    const number = `${prefix}-${year}-${String(seq.lastNumber).padStart(padding, "0")}`;
    const { subtotal, tax, total } = calculateInvoiceTotals(input.items, input.discount, input.taxRate);

    return tx.invoice.create({
      data: {
        number,
        customerId: input.customerId,
        type,
        status: "DRAFT",
        subtotal,
        discount: input.discount,
        taxRate: input.taxRate,
        taxAmount: tax,
        total,
        currency: settings?.currency || "EUR",
        items: {
          create: input.items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
            total: i.quantity * i.unitPrice - i.discount,
            productId: i.productId,
          })),
        },
      },
    });
  });
}

export async function listInvoices(type: "INVOICE" | "QUOTE" = "INVOICE") {
  return prisma.invoice.findMany({ where: { type }, include: { customer: true, items: true }, orderBy: { issueDate: "desc" } });
}

const transitions: Record<string, string[]> = {
  DRAFT: ["SENT", "CANCELLED"],
  SENT: ["PAID", "OVERDUE", "CANCELLED"],
  OVERDUE: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
};

export async function updateInvoiceStatus(id: string, status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED") {
  const current = await prisma.invoice.findUnique({ where: { id }, select: { status: true } });
  if (!current) throw new Error("Document introuvable.");
  if (current.status === status) return;
  if (!transitions[current.status]?.includes(status)) throw new Error(`Transition de statut invalide : ${current.status} → ${status}`);
  const result = await prisma.invoice.updateMany({ where: { id, status: current.status }, data: { status } });
  if (result.count !== 1) throw new Error("Le document a été modifié entre-temps. Veuillez réessayer.");
  return prisma.invoice.findUnique({ where: { id } });
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({ where: { id }, include: { customer: true, items: true } });
}
