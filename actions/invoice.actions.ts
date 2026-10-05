"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createInvoice, updateInvoiceStatus } from "@/services/invoice.service";

const itemSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().finite().positive(),
  unitPrice: z.number().finite().nonnegative(),
  discount: z.number().finite().nonnegative(),
  productId: z.string().min(1).optional(),
}).refine(i => i.discount <= i.quantity * i.unitPrice, {
  message: "La remise d'une ligne ne peut pas dépasser son montant.",
});

const schema = z.object({
  customerId: z.string().min(1),
  items: z.array(itemSchema).min(1).max(200),
  taxRate: z.number().finite().min(0).max(100),
  discount: z.number().finite().nonnegative(),
  type: z.enum(["INVOICE", "QUOTE"]).default("INVOICE"),
}).superRefine((input, ctx) => {
  const subtotal = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice - item.discount, 0);
  if (input.discount > subtotal) ctx.addIssue({ code: "custom", path: ["discount"], message: "La remise globale ne peut pas dépasser le sous-total." });
});

export async function createInvoiceAction(input: unknown) {
  await requireRole("ADMIN", "MANAGER");
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Document invalide");
  const invoice = await createInvoice(parsed.data);
  revalidatePath("/invoices");
  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  return invoice.id;
}

export async function updateInvoiceStatusAction(
  id: string,
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED",
) {
  await requireRole("ADMIN", "MANAGER");
  await updateInvoiceStatus(id, status);
  revalidatePath("/invoices");
  revalidatePath("/quotes");
  revalidatePath("/dashboard");
}
