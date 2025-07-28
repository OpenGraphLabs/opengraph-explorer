export type PagePermission = "public" | "auth-required";

export interface RouteConfig {
  path: string;
  permission: PagePermission;
  redirectTo?: string;
}

export interface AuthState {
  isWalletConnected: boolean;
  walletAddress?: string;
  isLoading: boolean;
  // Demo login integration
  isDemoAuthenticated?: boolean;
  demoUser?: {
    id: string;
    username: string;
    displayName: string;
  };
}
