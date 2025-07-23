import { useCurrentWallet } from "@mysten/dapp-kit";
import { useLocation } from "react-router-dom";
import { getRouteConfig, requiresAuth } from "../config/routePermissions";
import { AuthState } from "../types/auth";
import { useDemoAuth, DEMO_LOGIN_ENABLED } from "../../features/auth";

export const useAuth = (): AuthState => {
  const { isConnected, currentWallet } = useCurrentWallet();
  const demoAuth = useDemoAuth();
  const location = useLocation();

  const isWalletConnected = isConnected && !!currentWallet?.accounts[0]?.address;
  const walletAddress = currentWallet?.accounts[0]?.address;

  return {
    isWalletConnected,
    walletAddress,
    isLoading: demoAuth.isLoading, // Include demo auth loading state
    // Demo auth integration
    isDemoAuthenticated: DEMO_LOGIN_ENABLED ? demoAuth.isAuthenticated : false,
    demoUser: demoAuth.user,
  };
};

export const useRoutePermission = () => {
  const { isWalletConnected, isDemoAuthenticated } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const routeConfig = getRouteConfig(currentPath);
  const needsAuth = requiresAuth(currentPath);
  
  // Allow access if wallet is connected OR demo is authenticated (when enabled)
  const hasPermission = !needsAuth || isWalletConnected || (DEMO_LOGIN_ENABLED && isDemoAuthenticated);

  return {
    hasPermission,
    needsAuth,
    routeConfig,
    currentPath,
    isDemoMode: DEMO_LOGIN_ENABLED && isDemoAuthenticated,
    // Keep legacy prop for backward compatibility
    needsWallet: needsAuth,
  };
};
