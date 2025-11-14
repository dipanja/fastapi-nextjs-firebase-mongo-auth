// src/middleware.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBackendBaseUrl } from "@/lib/config";

/**
 * Middleware to protect routes using FastAPI session cookie.
 * Dynamically uses the correct backend (local/cloud).
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const backend = getBackendBaseUrl();
  const whoamiUrl = `${backend}/api/auth/who-am-i`;

  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/login", "/signup"];

  let isAuthenticated = false;

  try {
    const res = await fetch(whoamiUrl, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    if (res.ok) isAuthenticated = true;
  } catch (error: any) {
    console.error("[Middleware] FastAPI verification failed:", {
      message: error.message,
    });
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/login", request.url),
    );
  }

  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup"],
};
