// src/app/api/auth/whoami/route.ts

import { NextResponse } from "next/server";
import { serverApiClient } from "@/lib/apiClient";

export async function GET(request: Request) {
  try {
    console.info("[Auth:WhoAmI] Fetching current user info");

    const res = await serverApiClient(request, "/api/auth/who-am-i", {
      method: "GET",
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      console.info("[Auth:WhoAmI] User verified successfully");
      return NextResponse.json({ success: true, data });
    }

    if (res.status === 401) {
      console.warn("[Auth:WhoAmI] Invalid or expired session");
      return NextResponse.json(
        { success: false, error: "Session expired. Please log in again." },
        { status: 401 },
      );
    }

    console.error("[Auth:WhoAmI] FastAPI error", {
      status: res.status,
      message: data.detail,
    });

    return NextResponse.json(
      { success: false, error: "Unable to verify session" },
      { status: res.status },
    );
  } catch (error: any) {
    console.error("[Auth:WhoAmI] Unexpected error", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, error: "Unexpected error occurred" },
      { status: 500 },
    );
  }
}
