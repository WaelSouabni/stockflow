"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { updateUserRole } from "@/services/user.service";
import { z } from "zod";

const idSchema = z.string().trim().min(1).max(100);
const roleSchema = z.enum(["ADMIN", "MANAGER", "USER"]);

export async function updateUserRoleAction(id: string, formData: FormData) {
  await requireRole("ADMIN");
  const parsedId = idSchema.safeParse(id);
  if (!parsedId.success) throw new Error("Utilisateur invalide.");
  const parsedRole = roleSchema.safeParse(formData.get("role"));
  if (!parsedRole.success) throw new Error("Rôle invalide.");
  await updateUserRole(parsedId.data, parsedRole.data);
  revalidatePath("/settings/users");
}
