"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setIsLogoutLoading(true);
    const res = await fetch("/api/auth/logout", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      await refreshUser();
      router.push("/login");
    }
    setIsLogoutLoading(false);
  };

  if (isLoading) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="font-semibold text-gray-900">Dashboard</h1>
        {user && (
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-700">{user.email}</p>
            <button
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {isLogoutLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
