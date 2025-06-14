import { useCurrentWallet } from '@mysten/dapp-kit';
import { useLocation } from 'react-router-dom';
import { getRouteConfig, requiresWallet } from '../config/routePermissions';
import { AuthState } from '../types/auth';

export const useAuth = (): AuthState => {
  const { isConnected, currentWallet } = useCurrentWallet();
  const location = useLocation();
  
  const isWalletConnected = isConnected && !!currentWallet?.accounts[0]?.address;
  const walletAddress = currentWallet?.accounts[0]?.address;
  
  return {
    isWalletConnected,
    walletAddress,
    isLoading: false, // Wallet connection state is handled by dapp-kit
  };
};

export const useRoutePermission = () => {
  const { isWalletConnected } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const routeConfig = getRouteConfig(currentPath);
  const needsWallet = requiresWallet(currentPath);
  const hasPermission = !needsWallet || isWalletConnected;
  
  return {
    hasPermission,
    needsWallet,
    routeConfig,
    currentPath,
  };
}; 