// src/app/api/auth/logout/route.ts
import { serverApiClient } from "@/lib/apiClient";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.info("[Auth:Logout] Calling FastAPI /logout");

    const res = await serverApiClient(request, "/api/auth/logout", {
      method: "POST",
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.info("[Auth:Logout] Logout successful");

      // Forward the Set-Cookie header to delete the cookie
      const setCookieHeader = res.headers.get("set-cookie");
      const response = NextResponse.json({ success: true, data });

      if (setCookieHeader) {
        response.headers.set("set-cookie", setCookieHeader);
      }

      return response;
    }

    console.error("[Auth:Logout] FastAPI returned error", {
      status: res.status,
      message: data.detail,
    });

    return NextResponse.json(
      { success: false, error: "Logout failed. Please try again." },
      { status: res.status },
    );
  } catch (error: any) {
    console.error("[Auth:Logout] Unexpected error", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, error: "Unexpected error occurred" },
      { status: 500 },
    );
  }
}
