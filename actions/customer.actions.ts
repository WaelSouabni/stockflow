"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createCustomer } from "@/services/customer.service";

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function createCustomerAction(formData: FormData) {
  await requireRole("ADMIN", "MANAGER");

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
  });

  if (!parsed.success) throw new Error("Client invalide.");

  await createCustomer({
    name: parsed.data.name,
    email: parsed.data.email || undefined,
    phone: parsed.data.phone || undefined,
  });

  revalidatePath("/customers");
}
