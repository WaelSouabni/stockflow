import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        database: "ok",
        uptime: process.uptime(),
        responseTimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
