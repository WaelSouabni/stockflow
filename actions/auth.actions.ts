"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { registerUser, loginUser, logoutUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(120).optional(),
  companyName: z.string().trim().min(2).max(150).optional(),
});

function getClientAddress() {
  const h = headers();
  const forwarded = h.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function loginAction(formData: FormData) {
  const parsed = schema.pick({ email: true, password: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Identifiants invalides.");

  const email = parsed.data.email.toLowerCase();
  const rateLimitKey = `login:${getClientAddress()}:${email}`;
  const result = await loginUser(email, parsed.data.password, rateLimitKey);
  redirect(result.onboardingCompleted ? "/dashboard" : "/onboarding");
}

export async function registerAction(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !parsed.data.name) throw new Error("Données d'inscription invalides.");

  await registerUser(parsed.data.name, parsed.data.companyName || "", parsed.data.email, parsed.data.password);
  await loginUser(parsed.data.email, parsed.data.password, `login:${getClientAddress()}:${parsed.data.email.toLowerCase()}`);
  redirect("/onboarding");
}

export async function logoutAction() {
  await logoutUser();
  redirect("/login");
}
