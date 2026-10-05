"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { saveSettings } from "@/services/settings.service";

const settingsSchema = z.object({
  companyName: z.string().trim().min(1).max(150),
  address: z.string().trim().max(250).optional(), city: z.string().trim().max(100).optional(), country: z.string().trim().max(100).optional(),
  email: z.string().trim().email().max(150).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(), website: z.string().trim().url().max(250).optional().or(z.literal("")),
  siret: z.string().trim().max(30).optional(), vatNumber: z.string().trim().max(30).optional(),
  bankName: z.string().trim().max(120).optional(), iban: z.string().trim().max(50).optional(), bic: z.string().trim().max(20).optional(),
  currency: z.string().regex(/^[A-Z]{3}$/), locale: z.string().min(2).max(20),
  invoicePrefix: z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9-]+$/),
  invoiceNumberPadding: z.coerce.number().int().min(1).max(8),
  defaultTaxRate: z.coerce.number().min(0).max(100),
  logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
});

function optional(value: FormDataEntryValue | null) { const text = String(value ?? "").trim(); return text || undefined; }

export async function saveSettingsAction(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = settingsSchema.safeParse({
    companyName: formData.get("companyName"), address: optional(formData.get("address")), city: optional(formData.get("city")), country: optional(formData.get("country")),
    email: optional(formData.get("email")), phone: optional(formData.get("phone")), website: optional(formData.get("website")), siret: optional(formData.get("siret")), vatNumber: optional(formData.get("vatNumber")),
    bankName: optional(formData.get("bankName")), iban: optional(formData.get("iban")), bic: optional(formData.get("bic")), currency: formData.get("currency"), locale: formData.get("locale"),
    invoicePrefix: formData.get("invoicePrefix"), invoiceNumberPadding: formData.get("invoiceNumberPadding"), defaultTaxRate: formData.get("defaultTaxRate"), logoUrl: optional(formData.get("logoUrl")),
  });
  if (!parsed.success) throw new Error("Paramètres invalides.");
  await saveSettings(parsed.data);
  revalidatePath("/settings");
}