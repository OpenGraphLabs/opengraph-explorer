import React from "react";
import { useRoutePermission } from "../hooks/useAuth";
import { Login } from "@/pages/Login";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { hasPermission, needsAuth } = useRoutePermission();

  // If no auth is required or user has permission, render children
  if (!needsAuth || hasPermission) {
    return <>{children}</>;
  }

  // If auth is required but not authenticated, show login page
  return <Login />;
};
