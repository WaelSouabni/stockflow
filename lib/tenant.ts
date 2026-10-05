import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function requireTenant() {
  const session = await getSession();
  if (!session?.sub || !session.companyId) throw new Error("Authentification requise.");

  const user = await prisma.user.findFirst({
    where: { id: session.sub, companyId: session.companyId, active: true },
    select: { id: true, companyId: true },
  });

  if (!user) throw new Error("Session invalide.");
  return { userId: user.id, companyId: user.companyId };
}
