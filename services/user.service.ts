import { prisma } from "@/lib/prisma";

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function updateUserRole(id: string, role: "ADMIN" | "MANAGER" | "USER") {
  return prisma.$transaction(async tx => {
    const user = await tx.user.findUnique({ where: { id }, select: { id: true, role: true } });
    if (!user) throw new Error("Utilisateur introuvable.");
    if (user.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await tx.user.count({ where: { role: "ADMIN", active: true } });
      if (adminCount <= 1) throw new Error("Impossible de retirer le dernier administrateur actif.");
    }
    return tx.user.update({ where: { id: user.id }, data: { role } });
  });
}
