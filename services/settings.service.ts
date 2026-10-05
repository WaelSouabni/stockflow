import { prisma } from "@/lib/prisma";

export async function getSettings() {
  return prisma.companySettings.findFirst();
}

export type SettingsInput = {
  companyName: string; logoUrl?: string; address?: string; city?: string; country?: string; email?: string; phone?: string; website?: string;
  siret?: string; vatNumber?: string; bankName?: string; iban?: string; bic?: string; currency: string; locale: string;
  invoicePrefix: string; invoiceNumberPadding: number; defaultTaxRate: number;
};

export async function saveSettings(data: SettingsInput) {
  const current = await prisma.companySettings.findFirst();
  return current
    ? prisma.companySettings.update({ where: { id: current.id }, data })
    : prisma.companySettings.create({ data });
}