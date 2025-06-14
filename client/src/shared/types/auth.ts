export type PagePermission = "public" | "wallet-required";

export interface RouteConfig {
  path: string;
  permission: PagePermission;
  redirectTo?: string;
}

export interface AuthState {
  isWalletConnected: boolean;
  walletAddress?: string;
  isLoading: boolean;
}
