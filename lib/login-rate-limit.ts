import { prisma } from "@/lib/prisma";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_MS = 15 * 60 * 1000;

export async function assertLoginAllowed(key: string) {
  const now = new Date();
  const state = await prisma.loginRateLimit.findUnique({ where: { key } });

  if (!state || now.getTime() - state.windowStart.getTime() >= WINDOW_MS) return;

  if (state.blockedUntil && state.blockedUntil > now) {
    throw new Error("Trop de tentatives. Réessayez dans quelques minutes.");
  }
}

export async function recordLoginFailure(key: string) {
  const now = new Date();
  const state = await prisma.loginRateLimit.findUnique({ where: { key } });

  if (!state || now.getTime() - state.windowStart.getTime() >= WINDOW_MS) {
    await prisma.loginRateLimit.upsert({
      where: { key },
      create: { key, attempts: 1, windowStart: now },
      update: { attempts: 1, windowStart: now, blockedUntil: null },
    });
    return;
  }

  const attempts = state.attempts + 1;
  await prisma.loginRateLimit.update({
    where: { key },
    data: {
      attempts,
      blockedUntil: attempts >= MAX_ATTEMPTS ? new Date(now.getTime() + BLOCK_MS) : null,
    },
  });
}

export async function clearLoginFailures(key: string) {
  await prisma.loginRateLimit.deleteMany({ where: { key } });
}
