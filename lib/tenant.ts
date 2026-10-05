import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireTenant(options: { requireOnboarding?: boolean } = {}) {
  const session = await getSession();
  if (!session?.sub || !session.companyId) throw new Error("Authentification requise.");

  const user = await prisma.user.findFirst({
    where: { id: session.sub, companyId: session.companyId, active: true },
    select: { id: true, companyId: true, company: { select: { onboardingCompleted: true } } },
  });

  if (!user) throw new Error("Session invalide.");

  if (options.requireOnboarding !== false && !user.company.onboardingCompleted) {
    redirect("/onboarding");
  }

  return { userId: user.id, companyId: user.companyId, onboardingCompleted: user.company.onboardingCompleted };
}
