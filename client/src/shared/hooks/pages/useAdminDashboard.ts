import { useState, useCallback, useMemo, useEffect } from "react";
import { adminApi, AdminApiError } from "@/shared/api/admin";

export interface UseAdminDashboardOptions {
  limit?: number;
  refreshInterval?: number;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export function useAdminDashboard(options: UseAdminDashboardOptions = {}) {
  const { limit = 25, refreshInterval = 30000 } = options;

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCredentials, setAuthCredentials] = useState<AdminCredentials | null>(null);

  // UI state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [processingImages, setProcessingImages] = useState<Set<number>>(new Set());

  // Data state
  const [pendingImagesResponse, setPendingImagesResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch pending images function
  const fetchPendingImages = useCallback(async () => {
    if (!isAuthenticated || !authCredentials) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        limit,
        ...(searchQuery && { search: searchQuery }),
      };

      const response = await adminApi.getPendingImages(params, authCredentials);
      setPendingImagesResponse(response);
    } catch (err: any) {
      console.error("Failed to fetch pending images:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authCredentials, currentPage, limit, searchQuery]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchPendingImages();
  }, [fetchPendingImages]);

  // Auto-refresh interval
  useEffect(() => {
    if (!isAuthenticated || !refreshInterval) {
      return;
    }

    const interval = setInterval(() => {
      fetchPendingImages();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshInterval, fetchPendingImages]);

  // Computed values
  const pendingImages = useMemo(() => {
    return pendingImagesResponse?.items || [];
  }, [pendingImagesResponse]);

  const totalImages = useMemo(() => {
    return pendingImagesResponse?.total || 0;
  }, [pendingImagesResponse]);

  const totalPages = useMemo(() => {
    return pendingImagesResponse?.pages || 1;
  }, [pendingImagesResponse]);

  const filteredImages = useMemo(() => {
    if (!searchQuery) return pendingImages;
    return pendingImages.filter(image =>
      image.file_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pendingImages, searchQuery]);

  // Authentication handlers
  const handleLogin = useCallback(async (credentials: AdminCredentials) => {
    try {
      const isValid = await adminApi.testAuth(credentials);

      if (isValid) {
        setAuthCredentials(credentials);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: "Invalid credentials" };
      }
    } catch (error: any) {
      console.error("Authentication failed:", error);
      return {
        success: false,
        error: error instanceof AdminApiError ? error.message : "Authentication failed",
      };
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setAuthCredentials(null);
    setSelectedImages(new Set());
  }, []);

  // Image action handlers
  const handleApproveImage = useCallback(
    async (imageId: number) => {
      if (!authCredentials) return;

      setProcessingImages(prev => new Set(prev).add(imageId));

      try {
        await adminApi.approveImage(imageId, authCredentials);
        setSelectedImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageId);
          return newSet;
        });
        // Refetch to update the list
        fetchPendingImages();
      } catch (error) {
        console.error("Failed to approve image:", error);
      } finally {
        setProcessingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageId);
          return newSet;
        });
      }
    },
    [authCredentials, fetchPendingImages]
  );

  const handleRejectImage = useCallback(
    async (imageId: number) => {
      if (!authCredentials) return;

      setProcessingImages(prev => new Set(prev).add(imageId));

      try {
        await adminApi.rejectImage(imageId, authCredentials);
        setSelectedImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageId);
          return newSet;
        });
        // Refetch to update the list
        fetchPendingImages();
      } catch (error) {
        console.error("Failed to reject image:", error);
      } finally {
        setProcessingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageId);
          return newSet;
        });
      }
    },
    [authCredentials, fetchPendingImages]
  );

  const handleBulkApprove = useCallback(async () => {
    if (!authCredentials) return;

    const imageIds = Array.from(selectedImages);
    setProcessingImages(prev => new Set([...prev, ...imageIds]));

    try {
      await Promise.all(imageIds.map(id => adminApi.approveImage(id, authCredentials)));
      setSelectedImages(new Set());
      fetchPendingImages();
    } catch (error) {
      console.error("Failed to bulk approve:", error);
    } finally {
      setProcessingImages(prev => {
        const newSet = new Set(prev);
        imageIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [selectedImages, authCredentials, fetchPendingImages]);

  const handleBulkReject = useCallback(async () => {
    if (!authCredentials) return;

    const imageIds = Array.from(selectedImages);
    setProcessingImages(prev => new Set([...prev, ...imageIds]));

    try {
      await Promise.all(imageIds.map(id => adminApi.rejectImage(id, authCredentials)));
      setSelectedImages(new Set());
      fetchPendingImages();
    } catch (error) {
      console.error("Failed to bulk reject:", error);
    } finally {
      setProcessingImages(prev => {
        const newSet = new Set(prev);
        imageIds.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [selectedImages, authCredentials, fetchPendingImages]);

  // Selection handlers
  const handleImageSelect = useCallback((imageId: number, selected: boolean) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(imageId);
      } else {
        newSet.delete(imageId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedImages(new Set(filteredImages.map(img => img.id)));
  }, [filteredImages]);

  const handleDeselectAll = useCallback(() => {
    setSelectedImages(new Set());
  }, []);

  // Navigation handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setSelectedImages(new Set()); // Clear selections when changing pages
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    setSelectedImages(new Set());
  }, []);

  return {
    // Authentication
    isAuthenticated,
    handleLogin,
    handleLogout,

    // Data
    pendingImages: filteredImages,
    totalImages,
    totalPages,
    currentPage,
    searchQuery,

    // Selection
    selectedImages,

    // Actions
    handleApproveImage,
    handleRejectImage,
    handleBulkApprove,
    handleBulkReject,
    handleImageSelect,
    handleSelectAll,
    handleDeselectAll,

    // Navigation
    handlePageChange,
    handleSearchChange,

    // States
    isLoading,
    error,
    processingImages,

    // Utils
    refetchPendingImages: fetchPendingImages,
  };
}
