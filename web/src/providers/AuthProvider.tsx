"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import app from "../lib/feathersClient";
import { useRouter, usePathname } from "next/navigation";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);

export interface User {
  id: number;
  email: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: Record<string, unknown>) => Promise<void>;
  register: (credentials: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    let cancelled = false;

    // If we already have a user in memory, avoid re-auth loops during client redirects.
    if (user) {
      setLoading(false);
      if (isPublicRoute) {
        router.replace("/dashboard");
      }
      return;
    }

    app.reAuthenticate()
      .then((res) => {
        if (cancelled) {
          return;
        }

        setUser(res.user as User);
        if (isPublicRoute) {
          router.replace("/dashboard");
        }
      })
      .catch(() => {
        if (cancelled) {
          return;
        }

        setUser(null);
        if (!isPublicRoute) {
          router.replace("/login");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isPublicRoute, router, user]);

  const login = async (credentials: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { user } = await app.authenticate({
        strategy: "local",
        ...credentials,
      });
      setUser(user);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: Record<string, unknown>) => {
    setLoading(true);
    try {
      await app.service("users").create(credentials);
      const { user } = await app.authenticate({
        strategy: "local",
        ...credentials,
      });
      setUser(user);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await app.logout();
    setUser(null);
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
           <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
             <span className="material-symbols-outlined text-primary text-3xl">hourglass_empty</span>
           </div>
           <p className="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Securely Loading...</p>
        </div>
      </div>
    );
  }

  // Prevent flash of protected content
  if (!user && !isPublicRoute) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
