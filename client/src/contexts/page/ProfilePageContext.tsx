import React, { createContext, useContext, ReactNode } from 'react';
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useCurrentUserProfile } from "@/shared/hooks/useApiQuery";
import { useAuth } from "@/shared/hooks/useAuth";

interface ProfilePageContextValue {
  // Authentication state
  isAuthenticated: boolean;
  isConnected: boolean;
  isDemoAuthenticated: boolean;
  currentWallet: any;
  
  // Profile data
  userProfile: any;
  profileLoading: boolean;
  profileError: any;
  
  // Computed values
  userAddress: string;
  displayName: string;
  
  // Utility functions
  formatAddress: (address: string) => string;
  formatDate: (dateString: string) => string;
}

const ProfilePageContext = createContext<ProfilePageContextValue | undefined>(undefined);

export function ProfilePageProvider({ children }: { children: ReactNode }) {
  const { isConnected, currentWallet } = useCurrentWallet();
  const { isDemoAuthenticated } = useAuth();
  
  // Check if user is authenticated (either via wallet or demo)
  const isAuthenticated = isConnected || isDemoAuthenticated;
  
  // Fetch user profile data
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useCurrentUserProfile({
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  } as any);

  // Get user's wallet address (fallback to current wallet if profile doesn't have sui_address)
  const userAddress = userProfile?.sui_address || currentWallet?.accounts[0]?.address || "";
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };
  
  // Format user's display name or email
  const displayName = userProfile?.display_name || userProfile?.email || formatAddress(userAddress);
  
  // Format profile creation date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ProfilePageContext.Provider
      value={{
        isAuthenticated,
        isConnected,
        isDemoAuthenticated,
        currentWallet,
        userProfile,
        profileLoading,
        profileError,
        userAddress,
        displayName,
        formatAddress,
        formatDate,
      }}
    >
      {children}
    </ProfilePageContext.Provider>
  );
}

export function useProfilePage() {
  const context = useContext(ProfilePageContext);
  if (!context) {
    throw new Error('useProfilePage must be used within ProfilePageProvider');
  }
  return context;
}