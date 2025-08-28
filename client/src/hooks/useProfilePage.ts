import { useState, useMemo } from "react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useCurrentUserProfile } from "@/shared/api/endpoints/users";
import { useDatasets } from "@/shared/api/endpoints/datasets";
import { useUserApprovedImages } from "@/shared/api/endpoints/images";
import { useAuth } from "@/shared/hooks/useAuth";
import type { UserProfile } from "@/shared/api/endpoints/users";
import type { DatasetWithStats } from "@/shared/api/endpoints/datasets";
import type { Image } from "@/shared/api/endpoints/images";

export interface UseProfilePageOptions {
  datasetsLimit?: number;
  approvedImagesLimit?: number;
}

export function useProfilePage(options: UseProfilePageOptions = {}) {
  const { datasetsLimit = 20, approvedImagesLimit = 12 } = options;

  // Authentication and wallet state
  const { isConnected, currentWallet } = useCurrentWallet();
  const { isDemoAuthenticated } = useAuth();
  const isAuthenticated = isConnected || isDemoAuthenticated;

  // Page-specific UI state
  const [currentDatasetsPage, setCurrentDatasetsPage] = useState(1);
  const [currentImagesPage, setCurrentImagesPage] = useState(1);

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

  // User's approved images for gallery
  const {
    data: approvedImages = [],
    totalCount: totalApprovedImagesCount = 0,
    isLoading: imagesLoading,
    error: imagesError,
  } = useUserApprovedImages(userProfile?.id || 0, {
    page: currentImagesPage,
    limit: approvedImagesLimit,
  });

  // Loading and error states
  const isLoading = userLoading || datasetsLoading || imagesLoading;
  const error = userError || datasetsError || imagesError;

  // Page control handlers
  const handleDatasetsPageChange = (page: number) => {
    setCurrentDatasetsPage(page);
  };

  const handleImagesPageChange = (page: number) => {
    setCurrentImagesPage(page);
  };

  // Calculate total pages
  const totalDatasetsPages = Math.ceil(totalDatasetsCount / datasetsLimit);
  const totalApprovedImagesPages = Math.ceil(totalApprovedImagesCount / approvedImagesLimit);

  // Computed values and utility functions
  const userAddress = userProfile?.suiAddress || currentWallet?.accounts[0]?.address || "";

  const formatAddress = useMemo(
    () => (address: string) => {
      return `${address.slice(0, 8)}...${address.slice(-6)}`;
    },
    []
  );

  const displayName =
    userProfile?.nickname ||
    userProfile?.displayName ||
    userProfile?.email ||
    formatAddress(userAddress);

  const formatDate = useMemo(
    () => (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    []
  );

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

    // Approved images data
    approvedImages,
    totalApprovedImagesCount,
    totalApprovedImagesPages,
    currentImagesPage,

    // Loading states
    isLoading,
    error,

    // Page control
    handleDatasetsPageChange,
    handleImagesPageChange,

    // Utility functions
    formatAddress,
    formatDate,
  };
}
