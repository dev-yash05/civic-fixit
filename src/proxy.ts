import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// Wrap the auth middleware and export as proxy for Next.js 16
const authProxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedPaths = ["/profile", "/report"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

// Next.js 16 requires the export to be named "proxy"
export function proxy(request: NextRequest) {
  return authProxy(request, {} as any);
}

export const config = {
  matcher: ["/profile/:path*", "/report/:path*"],
};