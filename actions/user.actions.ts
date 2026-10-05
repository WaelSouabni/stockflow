"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateUserRole } from "@/services/user.service";
import { z } from "zod";

const roleSchema = z.enum(["ADMIN", "MANAGER", "USER"]);

export async function updateUserRoleAction(id: string, formData: FormData) {
  const session = await getSession();
  if (session?.role !== "ADMIN") throw new Error("Accès administrateur requis.");

  const parsed = roleSchema.safeParse(formData.get("role"));
  if (!parsed.success) throw new Error("Rôle invalide.");

  await updateUserRole(id, parsed.data);
  revalidatePath("/settings/users");
}