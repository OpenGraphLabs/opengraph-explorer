import { useCurrentWallet } from "@mysten/dapp-kit";
import { useLocation } from "react-router-dom";
import { getRouteConfig, requiresAuth } from "../config/routePermissions";
import { useAuth as useNewAuth } from "../../contexts/data/AuthContext";

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

export const useAuth = (): AuthState => {
  const { isConnected, currentWallet } = useCurrentWallet();
  const newAuth = useNewAuth();
  const location = useLocation();

  const isWalletConnected = isConnected && !!currentWallet?.accounts[0]?.address;
  const walletAddress = currentWallet?.accounts[0]?.address;

  return {
    isWalletConnected,
    walletAddress,
    isLoading: newAuth.isLoading,
    // New auth integration
    isDemoAuthenticated: newAuth.isAuthenticated,
    demoUser: newAuth.user
      ? {
          id: newAuth.user.id,
          username: newAuth.user.email || newAuth.user.id,
          displayName: newAuth.user.name || newAuth.user.email || "User",
        }
      : undefined,
  };
};

export const useRoutePermission = () => {
  const { isWalletConnected, isDemoAuthenticated } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const routeConfig = getRouteConfig(currentPath);
  const needsAuth = requiresAuth(currentPath);

  // Allow access if wallet is connected OR user is authenticated with new auth system
  const hasPermission = !needsAuth || isWalletConnected || isDemoAuthenticated;

  return {
    hasPermission,
    needsAuth,
    routeConfig,
    currentPath,
    isDemoMode: isDemoAuthenticated,
    // Keep legacy prop for backward compatibility
    needsWallet: needsAuth,
  };
};
