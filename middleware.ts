import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const protectedPaths = [
  "/dashboard",
  "/upload",
  "/checkout",
  "/settings",
  "/collections",
];

const authPaths = ["/login", "/signup", "/forgot-password"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  if (isLoggedIn && authPaths.some((p) => path.startsWith(p))) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (!isLoggedIn && protectedPaths.some((p) => path.startsWith(p))) {
    const callbackUrl = encodeURIComponent(path);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|placeholder).*)",
  ],
};
