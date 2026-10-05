import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { assertLoginAllowed, clearLoginFailures, recordLoginFailure } from "@/lib/login-rate-limit";

const secretValue = process.env.AUTH_SECRET;
if (!secretValue && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET est requis en production.");
const secret = new TextEncoder().encode(secretValue || "development-secret-change-me");

type Role = "ADMIN" | "MANAGER" | "USER";

type Session = {
  sub: string;
  companyId: string;
  role: Role;
  email: string;
  name?: string;
};

const SESSION_COOKIE = "stockflow_session";

export async function registerUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();
  if (normalizedName.length < 2 || normalizedName.length > 120) throw new Error("Nom invalide.");
  if (password.length < 8 || password.length > 128) throw new Error("Mot de passe invalide.");

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) throw new Error("Cet email est déjà utilisé.");

  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.$transaction(async tx => {
    const company = await tx.company.create({ data: { name: "Mon entreprise" } });
    await tx.companySettings.create({
      data: { companyId: company.id, companyName: "Mon entreprise", email: normalizedEmail },
    });
    return tx.user.create({
      data: { name: normalizedName, email: normalizedEmail, passwordHash, role: "ADMIN", companyId: company.id },
    });
  });
}

export async function loginUser(email: string, password: string, rateLimitKey?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const key = rateLimitKey?.trim() || `email:${normalizedEmail}`;

  await assertLoginAllowed(key);

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const valid = Boolean(user && user.active && (await bcrypt.compare(password, user.passwordHash)));

  if (!valid) {
    await recordLoginFailure(key);
    throw new Error("Email ou mot de passe incorrect.");
  }

  await clearLoginFailures(key);

  const token = await new SignJWT({
    sub: user.id,
    companyId: user.companyId,
    role: user.role,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function logoutUser() {
  cookies().delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = (await jwtVerify(token, secret)).payload;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.companyId !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "MANAGER" && payload.role !== "USER") ||
      typeof payload.email !== "string"
    ) return null;

    return {
      sub: payload.sub,
      companyId: payload.companyId,
      role: payload.role,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session) throw new Error("Authentification requise.");

  const user = await prisma.user.findFirst({
    where: { id: session.sub, companyId: session.companyId, active: true },
    select: { id: true, companyId: true, role: true, email: true, name: true },
  });

  if (!user || !roles.includes(user.role)) throw new Error("Accès non autorisé.");

  return {
    sub: user.id,
    companyId: user.companyId,
    role: user.role,
    email: user.email,
    name: user.name ?? undefined,
  };
}
