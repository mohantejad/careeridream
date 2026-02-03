"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

type CurrentUser = {
  email: string;
  first_name?: string;
  last_name?: string;
};

type AuthContextValue = {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initials: string;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const buildInitials = (user: CurrentUser | null) => {
  if (!user) return "U";
  const initialsSource = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  if (!initialsSource) return user.email[0]?.toUpperCase() ?? "U";
  return initialsSource
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/auth/users/me/");
      if (response.ok) {
        const data = (await response.json()) as CurrentUser;
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      initials: buildInitials(user),
      refresh,
    };
  }, [user, isLoading, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
