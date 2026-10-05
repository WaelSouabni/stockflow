import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretValue = process.env.AUTH_SECRET;
const secret = secretValue ? new TextEncoder().encode(secretValue) : null;

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") return NextResponse.next();

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Configuration serveur invalide.", { status: 500 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const token = request.cookies.get("stockflow_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/login", request.url));

  try {
    const { payload } = await jwtVerify(token, secret);
    if (
      typeof payload.sub !== "string" ||
      typeof payload.companyId !== "string" ||
      !["ADMIN", "MANAGER", "USER"].includes(String(payload.role))
    ) return NextResponse.redirect(new URL("/login", request.url));

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*","/products/:path*","/stock/:path*","/customers/:path*","/invoices/:path*","/quotes/:path*","/settings/:path*"],
};
