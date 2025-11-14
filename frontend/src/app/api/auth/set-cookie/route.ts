// src/app/api/auth/set-cookie/route.ts
import { NextResponse } from "next/server";
import { serverApiClient } from "@/lib/apiClient";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      console.warn("[Auth:SetCookie] Missing Firebase ID token");
      return NextResponse.json(
        { success: false, error: "Missing ID token" },
        { status: 400 },
      );
    }

    console.info("[Auth:SetCookie] Calling FastAPI /users/init");

    const res = await serverApiClient(request, "/api/auth/users/init", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.info("[Auth:SetCookie] Session cookie created successfully");

      // Extract Set-Cookie header from FastAPI response
      const setCookieHeader = res.headers.get("set-cookie");

      const response = NextResponse.json({ success: true, data });

      // Forward the cookie to the browser
      if (setCookieHeader) {
        response.headers.set("set-cookie", setCookieHeader);
      }

      return response;
    }

    console.error("[Auth:SetCookie] FastAPI returned error", {
      status: res.status,
      message: data.detail,
    });

    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: res.status },
    );
  } catch (error: any) {
    console.error("[Auth:SetCookie] Unexpected error", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, error: "Unexpected error occurred" },
      { status: 500 },
    );
  }
}
