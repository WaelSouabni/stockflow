import { getSession } from "@/lib/auth";

export async function requireTenant() {
  const session = await getSession();
  if (!session?.sub || !session.companyId) {
    throw new Error("Contexte entreprise introuvable.");
  }
  return { userId: session.sub, companyId: session.companyId };
}
