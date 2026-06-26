import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const session = await auth();

  const protectedPaths = ["/profile", "/report"];
  const isProtected = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(
      new URL("/sign-in", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/report/:path*"],
};