import React, { createContext, useContext, ReactNode } from "react";
import { useAdminDashboard } from "@/shared/hooks/pages/useAdminDashboard";
import type { UseAdminDashboardOptions } from "@/shared/hooks/pages/useAdminDashboard";

type AdminDashboardContextType = ReturnType<typeof useAdminDashboard>;
const AdminDashboardContext = createContext<AdminDashboardContextType | null>(null);

interface AdminDashboardProviderProps {
  children: ReactNode;
  options?: UseAdminDashboardOptions;
}

export function AdminDashboardProvider({ children, options = {} }: AdminDashboardProviderProps) {
  const adminDashboardData = useAdminDashboard({
    limit: 25,
    refreshInterval: 30000, // 30 seconds
    ...options,
  });

  return (
    <AdminDashboardContext.Provider value={adminDashboardData}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

export function useAdminDashboardContext() {
  const context = useContext(AdminDashboardContext);
  if (!context) {
    throw new Error("useAdminDashboardContext must be used within AdminDashboardProvider");
  }
  return context;
}
