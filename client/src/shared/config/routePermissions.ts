import { RouteConfig } from "../types/auth";

export const ROUTE_PERMISSIONS: RouteConfig[] = [
  // Public routes - no wallet required
  { path: "/", permission: "public" },
  { path: "/challenges", permission: "public" },
  { path: "/challenges/:id", permission: "public" },
  { path: "/models", permission: "public" },
  { path: "/datasets", permission: "public" },

  // Wallet required routes
  { path: "/models/upload", permission: "wallet-required", redirectTo: "/" },
  { path: "/models/:id", permission: "wallet-required", redirectTo: "/" },
  { path: "/datasets/upload", permission: "wallet-required", redirectTo: "/" },
  { path: "/datasets/:id", permission: "wallet-required", redirectTo: "/" },
  {
    path: "/challenges/:challengeId/annotate",
    permission: "wallet-required",
    redirectTo: "/challenges",
  },
  {
    path: "/challenges/:challengeId/validate",
    permission: "wallet-required",
    redirectTo: "/challenges",
  },
  { path: "/annotator", permission: "wallet-required", redirectTo: "/" },
  { path: "/profile", permission: "wallet-required", redirectTo: "/" },
];

/**
 * Get route configuration for a specific path
 */
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return ROUTE_PERMISSIONS.find(route => {
    // Handle dynamic routes with parameters
    if (route.path.includes(":")) {
      const routePattern = route.path.replace(/:[^/]+/g, "[^/]+");
      const regex = new RegExp(`^${routePattern}$`);
      return regex.test(path);
    }
    return route.path === path;
  });
};

/**
 * Check if a path requires wallet connection
 */
export const requiresWallet = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config?.permission === "wallet-required";
};
