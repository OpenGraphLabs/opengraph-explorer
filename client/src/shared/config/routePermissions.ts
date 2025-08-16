export type PagePermission = "public" | "auth-required";

export interface RouteConfig {
  path: string;
  permission: PagePermission;
  redirectTo?: string;
}

export const ROUTE_PERMISSIONS: RouteConfig[] = [
  // All routes now require authentication (wallet or demo login)
  { path: "/", permission: "auth-required" },
  { path: "/models", permission: "auth-required" },
  { path: "/datasets", permission: "auth-required" },
  { path: "/datasets/upload", permission: "auth-required" },
  { path: "/datasets/:id", permission: "auth-required" },
  { path: "/profile", permission: "auth-required" },
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
 * Check if a path requires authentication (wallet or demo login)
 */
export const requiresAuth = (path: string): boolean => {
  const config = getRouteConfig(path);
  return config?.permission === "auth-required";
};
