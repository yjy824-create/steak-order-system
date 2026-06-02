"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type AdminAuthContextValue = {
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const logout = () => {
    sessionStorage.removeItem("admin_logged_in");
    document.cookie = "admin_logged_in=; path=/; max-age=0; SameSite=Lax";
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider.");
  }

  return context;
}
