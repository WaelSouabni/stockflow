"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { completeOnboarding } from "@/services/settings.service";

const schema = z.object({
  companyName: z.string().trim().min(2).max(150),
  address: z.string().trim().min(2).max(250),
  city: z.string().trim().min(2).max(100),
  zip: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  siret: z.string().trim().max(30).optional().or(z.literal("")),
  vatNumber: z.string().trim().max(30).optional().or(z.literal("")),
  currency: z.string().regex(/^[A-Z]{3}$/),
  locale: z.string().min(2).max(20),
  invoicePrefix: z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9-]+$/),
  invoiceNumberPadding: z.coerce.number().int().min(1).max(8),
  defaultTaxRate: z.coerce.number().min(0).max(100),
});

export async function completeOnboardingAction(formData: FormData) {
  await requireRole("ADMIN");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || "Configuration invalide.");

  await completeOnboarding({
    ...parsed.data,
    phone: parsed.data.phone || undefined,
    siret: parsed.data.siret || undefined,
    vatNumber: parsed.data.vatNumber || undefined,
  });

  redirect("/dashboard");
}
