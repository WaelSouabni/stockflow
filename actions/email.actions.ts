"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { sendDocumentEmail } from "@/services/email.service";

const idSchema = z.string().trim().min(1).max(100);

export async function sendDocumentEmailAction(id: string) {
  await requireRole("ADMIN", "MANAGER");
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) throw new Error("Document invalide.");

  const result = await sendDocumentEmail(parsed.data);
  revalidatePath("/invoices");
  revalidatePath("/quotes");
  revalidatePath("/dashboard");
  return result;
}
