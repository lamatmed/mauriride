import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth for public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET, // ✅ FIX IMPORTANT
  });

  // login page
  if (pathname.startsWith("/login")) {
    if (token) {
      const dest =
        token.role === "SUPERVISEUR" ? "/supervisor" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;

  if (role === "SUPERVISEUR" && !pathname.startsWith("/supervisor")) {
    return NextResponse.redirect(new URL("/supervisor", req.url));
  }

  if (role !== "SUPERVISEUR" && pathname.startsWith("/supervisor")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};