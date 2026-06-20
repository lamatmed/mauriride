import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Pages accessibles sans vérification société
  if (pathname.startsWith("/suspended")) {
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  // Already on login page
  if (pathname.startsWith("/login")) {
    if (token) {
      const dest = token.role === "SUPERVISEUR" ? "/supervisor" : "/dashboard";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // Not authenticated → go to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string;

  // SUPERVISEUR → only /supervisor routes
  if (role === "SUPERVISEUR" && !pathname.startsWith("/supervisor")) {
    return NextResponse.redirect(new URL("/supervisor", req.url));
  }

  // Others → cannot access /supervisor
  if (role !== "SUPERVISEUR" && pathname.startsWith("/supervisor")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|sw\\.js|manifest\\.json|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.gif|.*\\.ico).*)",
  ],
};
