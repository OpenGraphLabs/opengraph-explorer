import React from "react";
import { useLocation } from "react-router-dom";
import { BuildingPage } from "@/pages/BuildingPage";

interface BuildingModeGuardProps {
  children: React.ReactNode;
}

export function BuildingModeGuard({ children }: BuildingModeGuardProps) {
  const location = useLocation();

  // Check if building mode is enabled from environment variable
  const isBuildingMode = import.meta.env.VITE_APP_BUILDING_MODE === "true";

  // Allow access to admin routes even in building mode
  const isAdminRoute = location.pathname.startsWith("/admin");

  // If building mode is enabled and not an admin route, show building page
  if (isBuildingMode && !isAdminRoute) {
    return <BuildingPage />;
  }

  // Otherwise, render the normal app
  return <>{children}</>;
}
