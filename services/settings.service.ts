import { prisma } from "@/lib/prisma";
import { requireTenant } from "@/lib/tenant";

export async function getSettings(options: { allowIncomplete?: boolean } = {}) {
  const { companyId } = await requireTenant({ requireOnboarding: !options.allowIncomplete });
  return prisma.companySettings.findUnique({ where: { companyId } });
}

export type SettingsInput = {
  companyName:string; logoUrl?:string; address?:string; city?:string; zip?:string; country?:string;
  email?:string; phone?:string; website?:string; siret?:string; vatNumber?:string;
  bankName?:string; iban?:string; bic?:string; currency:string; locale:string;
  invoicePrefix:string; invoiceNumberPadding:number; defaultTaxRate:number;
};

export async function saveSettings(data: SettingsInput) {
  const { companyId } = await requireTenant();
  return prisma.companySettings.upsert({ where: { companyId }, create: { companyId, ...data }, update: data });
}

export async function completeOnboarding(data: SettingsInput) {
  const { companyId } = await requireTenant({ requireOnboarding: false });
  return prisma.$transaction(async tx => {
    const settings = await tx.companySettings.upsert({
      where: { companyId },
      create: { companyId, ...data },
      update: data,
    });
    await tx.company.update({ where: { id: companyId }, data: { name: data.companyName, onboardingCompleted: true } });
    return settings;
  });
}
