import React from "react";
import { useRoutePermission } from "../hooks/useAuth";
import { Login } from "@/pages/Login";
import { ProfileCompleteGuard } from "./ProfileCompleteGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { hasPermission, needsAuth } = useRoutePermission();

  // If auth is required but not authenticated, show login page
  if (needsAuth && !hasPermission) {
    return <Login />;
  }

  // If authenticated, check profile completion status
  if (!needsAuth || hasPermission) {
    return <ProfileCompleteGuard>{children}</ProfileCompleteGuard>;
  }

  // Fallback to login
  return <Login />;
};
