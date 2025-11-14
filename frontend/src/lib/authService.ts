// src/lib/authService.ts
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Exchange Firebase ID token for FastAPI session cookie.
 */
async function exchangeSessionCookie(idToken: string): Promise<AuthResult> {
  try {
    const res = await fetch("/api/auth/set-cookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.warn("[AuthService] FastAPI cookie exchange failed", data);
      return { success: false, error: data.error || "Login failed" };
    }

    console.info("[AuthService] Session cookie created successfully");
    return { success: true, data: data.data };
  } catch (err: any) {
    console.error("[AuthService] Unexpected error during cookie exchange", err);
    return { success: false, error: "Unable to reach backend" };
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    console.info("[AuthService] Logging in with email/password");

    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCred.user.getIdToken();

    return await exchangeSessionCookie(idToken);
  } catch (error: any) {
    console.warn("[AuthService] Firebase login failed", error.code);
    const map: Record<string, string> = {
      "auth/invalid-credential": "Invalid email or password",
      "auth/user-not-found": "User not found",
      "auth/wrong-password": "Incorrect password",
      "auth/too-many-requests": "Too many attempts. Try again later",
    };
    return { success: false, error: map[error.code] || "Login failed" };
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    console.info("[AuthService] Logging in with Google");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return await exchangeSessionCookie(idToken);
  } catch (error: any) {
    console.warn("[AuthService] Google login failed", error.code);
    return { success: false, error: "Google sign-in failed" };
  }
}

export async function logout(): Promise<AuthResult> {
  try {
    console.info("[AuthService] Logging out");
    const res = await fetch("/api/auth/logout", { method: "POST" });
    const data = await res.json();

    if (!res.ok || !data.success) {
      console.warn("[AuthService] Logout failed", data);
      return { success: false, error: data.error || "Logout failed" };
    }

    await auth.signOut();
    console.info("[AuthService] Logged out successfully");
    return { success: true };
  } catch (err: any) {
    console.error("[AuthService] Unexpected error during logout", err);
    return { success: false, error: "Unexpected error during logout" };
  }
}
