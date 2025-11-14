// src/lib/apiClient.ts
import { getBackendBaseUrl } from "@/lib/config";

/**
 * Server-side API client that forwards cookies from incoming request to FastAPI.
 * Use this in Next.js API routes (src/app/api/*).
 *
 * @param request - The incoming Next.js request object
 * @param path - The FastAPI endpoint path
 * @param options - Additional fetch options
 */
export async function serverApiClient(
  request: Request,
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const backendBase = getBackendBaseUrl();
  const url = `${backendBase}${path}`;

  // Extract cookies from incoming request
  const cookieHeader = request.headers.get("cookie");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...(cookieHeader && { cookie: cookieHeader }),
    },
  });

  return response;
}

/**
 * Generic helper for making backend requests through FastAPI.
 * Automatically handles cookie forwarding for server-side requests.
 */
// WARNING: cookie forwarding need to be done manually

export async function apiClient(
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const backendBase = getBackendBaseUrl();
  const url = `${backendBase}${path}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include", // Always include cookies for session
  });

  return response;
}
