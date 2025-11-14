"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  email: string;
  name?: string;
  picture?: string;
  firebase_uid?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContextReact = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      console.info("[useAuth] Fetching current user");
      const res = await fetch("/api/auth/whoami", { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        setUser(data.data.user || data.data);
      } else {
        console.warn("[useAuth] Session invalid or expired", data.error);
        setUser(null);
      }
    } catch (err: any) {
      console.error("[useAuth] Error fetching user", err.message);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContextReact.Provider
      value={{
        user,
        isLoading,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContextReact.Provider>
  );
}

export const useAuth = () => useContext(AuthContextReact);
