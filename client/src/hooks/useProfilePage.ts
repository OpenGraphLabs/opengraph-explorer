import { useState, useMemo } from "react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useCurrentUserProfile } from "@/shared/api/endpoints/users";
import { useDatasets } from "@/shared/api/endpoints/datasets";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserProfile } from "@/shared/api/endpoints/users";
import type { DatasetWithStats } from "@/shared/api/endpoints/datasets";

export interface UseProfilePageOptions {
  datasetsLimit?: number;
}

export function useProfilePage(options: UseProfilePageOptions = {}) {
  const { datasetsLimit = 20 } = options;

  // Authentication and wallet state
  const { isConnected, currentWallet } = useCurrentWallet();
  const { isDemoAuthenticated } = useAuth();
  const isAuthenticated = isConnected || isDemoAuthenticated;

  // Page-specific UI state
  const [currentDatasetsPage, setCurrentDatasetsPage] = useState(1);

  // API data fetching
  const {
    data: userProfile,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUserProfile({
    enabled: isAuthenticated,
  });

  const {
    data: userDatasets = [],
    totalCount: totalDatasetsCount = 0,
    isLoading: datasetsLoading,
    error: datasetsError,
  } = useDatasets({
    page: currentDatasetsPage,
    limit: datasetsLimit,
    // TODO: Add filter by current user when API supports it
    enabled: true,
  });

  // Loading and error states
  const isLoading = userLoading || datasetsLoading;
  const error = userError || datasetsError;

  // Page control handlers
  const handleDatasetsPageChange = (page: number) => {
    setCurrentDatasetsPage(page);
  };

  // Calculate total pages for datasets
  const totalDatasetsPages = Math.ceil(totalDatasetsCount / datasetsLimit);

  // Computed values and utility functions
  const userAddress = userProfile?.suiAddress || currentWallet?.accounts[0]?.address || "";
  
  const formatAddress = useMemo(() => (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }, []);

  const displayName = userProfile?.displayName || userProfile?.email || formatAddress(userAddress);

  const formatDate = useMemo(() => (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  return {
    // Authentication state
    isAuthenticated,
    isConnected,
    isDemoAuthenticated,
    currentWallet,

    // User data
    userProfile,
    userAddress,
    displayName,

    // Datasets data
    userDatasets,
    totalDatasetsCount,
    totalDatasetsPages,
    currentDatasetsPage,

    // Loading states
    isLoading,
    error,

    // Page control
    handleDatasetsPageChange,

    // Utility functions
    formatAddress,
    formatDate,
  };
}