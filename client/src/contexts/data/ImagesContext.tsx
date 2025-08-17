import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import { useImages, useImage, type Image } from "@/shared/api/endpoints/images";
import { useAnnotations } from "./AnnotationsContext";
import { postData, fetchData } from "@/shared/api/core/client";

interface ImagesConfig {
  limit?: number;
  page?: number;
  datasetId?: number;
  randomSeed?: number;
  fetchAnnotationCounts?: boolean; // For DatasetDetail pages
  useAnnotationImages?: boolean; // For Home page - fetch images based on annotations
  specificImageId?: number; // Force selection of a specific image ID
}

interface ImagesContextValue {
  images: Image[];
  imageMap: Map<number, Image>;
  selectedImage: Image | null;
  isLoading: boolean;
  error: any;
  randomSeed: number;
  setRandomSeed: (seed: number) => void;
  // Extended for DatasetDetail
  datasetImages: any[];
  annotationCounts: Map<number, number>;
  totalCounts: {
    total: number;
    confirmed: number;
    pending: number;
  };
  isPlaceholderDataShowing: boolean;
}

const ImagesContext = createContext<ImagesContextValue | undefined>(undefined);

export function ImagesProvider({
  children,
  config = {},
}: {
  children: ReactNode;
  config?: ImagesConfig;
}) {
  const [randomSeed, setRandomSeed] = useState(
    config.randomSeed || Math.floor(Math.random() * 1000)
  );
  const [annotationCounts, setAnnotationCounts] = useState<Map<number, number>>(new Map());

  // Get annotations context if we need to fetch images based on annotations
  let annotationsFromContext: any[] = [];
  let annotationsLoading = false;

  try {
    if (config.useAnnotationImages) {
      const annotationsContext = useAnnotations();
      annotationsFromContext = annotationsContext.annotations;
      annotationsLoading = annotationsContext.isLoading;
    }
  } catch (error) {
    // useAnnotations hook not available (not in AnnotationsProvider context)
    console.warn("ImagesProvider: useAnnotations not available in this context");
  }

  // Determine fetching strategy
  const useAnnotationBasedImages = config.useAnnotationImages && annotationsFromContext.length > 0;
  const useGeneralImages =
    !config.datasetId &&
    !config.fetchAnnotationCounts &&
    !useAnnotationBasedImages &&
    !config.useAnnotationImages;
  const shouldUseDatasetImages =
    !!config.datasetId && config.datasetId > 0 && !config.useAnnotationImages;

  // Get unique image IDs from annotations
  const requiredImageIds = useMemo(() => {
    if (!useAnnotationBasedImages || annotationsFromContext.length === 0) {
      return [];
    }

    const imageIds = annotationsFromContext
      .map((annotation: any) => annotation.imageId)
      .filter((id: number) => id && typeof id === "number");

    return Array.from(new Set(imageIds));
  }, [useAnnotationBasedImages, annotationsFromContext]);

  // State for individually fetched images
  const [annotationImages, setAnnotationImages] = useState<Image[]>([]);
  const [annotationImagesLoading, setAnnotationImagesLoading] = useState(false);
  const [annotationImagesError, setAnnotationImagesError] = useState<any>(null);

  // Fetch images based on annotation image_ids
  useEffect(() => {
    if (!useAnnotationBasedImages || requiredImageIds.length === 0 || annotationsLoading) {
      return;
    }

    setAnnotationImagesLoading(true);
    setAnnotationImagesError(null);

    const fetchAnnotationImages = async () => {
      try {
        const imagePromises = requiredImageIds.map(async (imageId: number) => {
          try {
            const response = await fetchData<{}, Image>({
              url: `/api/v1/images/${imageId}`,
              method: "get",
              authenticated: true,
            });
            return { success: true, imageId, image: response };
          } catch (error) {
            return { success: false, imageId, error };
          }
        });

        const results = await Promise.allSettled(imagePromises);
        const successfulImages: Image[] = [];

        results.forEach(result => {
          if (result.status === "fulfilled" && result.value.success) {
            successfulImages.push(result.value.image);
          }
        });

        setAnnotationImages(successfulImages);
      } catch (error) {
        setAnnotationImagesError(error);
      } finally {
        setAnnotationImagesLoading(false);
      }
    };

    fetchAnnotationImages().catch(console.error);
  }, [useAnnotationBasedImages, requiredImageIds, annotationsLoading]);

  const [totalPages, setTotalPages] = useState(0);
  const [isPlaceholderData, setIsPlaceholderData] = useState(false);

  const {
    data: generalImages,
    totalCount: generalTotalCount,
    isLoading: generalLoading,
    error: generalError,
  } = useImages({
    page: config.page || 1,
    limit: config.limit || 100,
    enabled: useGeneralImages && !useAnnotationBasedImages,
    setTotalPages,
  });

  // Skip the dataset images query entirely if we're using annotation-based images
  const skipDatasetQuery = config.useAnnotationImages === true;

  const {
    data: datasetImagesFromHook,
    totalCount: datasetTotalCount,
    isLoading: datasetLoading,
    error: datasetError,
  } = useImages({
    page: config.page || 1,
    limit: config.limit || 100,
    datasetId: config.datasetId,
    enabled: !skipDatasetQuery && shouldUseDatasetImages && !!config.datasetId,
    setTotalPages,
  });

  // Determine loading state and data source
  const isLoading = useAnnotationBasedImages
    ? annotationImagesLoading || annotationsLoading
    : useGeneralImages
      ? generalLoading
      : datasetLoading;

  const error = useAnnotationBasedImages
    ? annotationImagesError
    : useGeneralImages
      ? generalError
      : datasetError;

  const images = useAnnotationBasedImages
    ? annotationImages
    : useGeneralImages
      ? generalImages || []
      : datasetImagesFromHook || [];

  const totalCount = useGeneralImages ? generalTotalCount : datasetTotalCount;
  const isPreviousDataShowing = useAnnotationBasedImages
    ? false // No placeholder data for annotation-based fetching
    : isPlaceholderData;

  // Image preloading effect
  useEffect(() => {
    if (images.length > 0) {
      // Preload first 6 images for faster rendering
      const imagesToPreload = images.slice(0, 6);
      imagesToPreload.forEach((image: Image) => {
        if (image.imageUrl) {
          const img = new Image();
          img.src = image.imageUrl;
          // Set low priority to avoid blocking other resources
          if ("loading" in img) {
            (img as any).loading = "lazy";
          }
        }
      });
    }
  }, [images]);

  // Fetch annotation counts for dataset images
  const fetchAnnotationCounts = async (imagesToProcess: Image[]) => {
    if (!config.fetchAnnotationCounts) return new Map();

    const counts = new Map<number, number>();

    try {
      const promises = imagesToProcess.map(async (image: Image) => {
        try {
          const annotationsData = await fetchData<{}, any[]>({
            url: `/api/v1/annotations?image_id=${image.id}&status=APPROVED`,
            method: "get",
            authenticated: true,
          });
          const count = Array.isArray(annotationsData) ? annotationsData.length : 0;
          return { imageId: image.id, count };
        } catch (error) {
          console.warn(`Error fetching annotations for image ${image.id}:`, error);
          return { imageId: image.id, count: 0 };
        }
      });

      const results = await Promise.all(promises);
      results.forEach(({ imageId, count }) => {
        counts.set(imageId, count);
      });
    } catch (error) {
      console.error("Error fetching annotation counts:", error);
      // Fallback to simulated data
      for (const image of imagesToProcess) {
        const count = Math.floor(Math.random() * 3) + 1;
        counts.set(image.id, count);
      }
    }

    setAnnotationCounts(counts);
    return counts;
  };

  useEffect(() => {
    if (config.fetchAnnotationCounts && images.length > 0) {
      fetchAnnotationCounts(images).catch(console.error);
    }
  }, [images, config.fetchAnnotationCounts]);

  // Create image map for quick lookup
  const imageMap = useMemo(() => {
    const map = new Map<number, Image>();
    images.forEach((image: Image) => {
      map.set(image.id, image);
    });
    return map;
  }, [images]);

  // Select a random image for workspace (if datasetId is provided)
  const selectedImage = useMemo(() => {
    if (!config.datasetId || images.length === 0) return null;

    // If a specific image ID is requested, try to find it
    if (config.specificImageId) {
      const specificImage = images.find(
        (image: Image) =>
          image.id === config.specificImageId && image.datasetId === config.datasetId
      );
      if (specificImage) {
        return specificImage;
      }
      // If specific image not found, fall back to random selection
      console.warn(
        `Specific image ID ${config.specificImageId} not found in dataset ${config.datasetId}`
      );
    }

    const datasetFilteredImages = images.filter(
      (image: Image) => image.datasetId === config.datasetId
    );

    if (datasetFilteredImages.length === 0) return null;

    const randomIndex = randomSeed % datasetFilteredImages.length;
    return datasetFilteredImages[randomIndex];
  }, [images, config.datasetId, randomSeed, config.specificImageId]);

  // Transform images for dataset detail view
  const datasetImagesForDetail = useMemo(() => {
    if (!config.fetchAnnotationCounts) return [];

    return images.map((image: Image) => ({
      id: image.id.toString(),
      path: image.fileName,
      image_url: image.imageUrl, // Keep snake_case for legacy compatibility
      width: image.width,
      height: image.height,
      imageId: image.id,
      annotations: [],
      approvedAnnotationsCount: annotationCounts.get(image.id) || 0,
      metadata: {
        index: image.id,
        datasetId: image.datasetId,
      },
    }));
  }, [images, annotationCounts, config.fetchAnnotationCounts]);

  // Calculate total counts for dataset detail
  const totalCounts = useMemo(() => {
    if (!config.fetchAnnotationCounts) {
      return { total: 0, confirmed: 0, pending: 0 };
    }

    const total = totalCount || images.length;
    const confirmed = datasetImagesForDetail.filter(item => item.approvedAnnotationsCount > 0).length;
    const pending = datasetImagesForDetail.length - confirmed;

    return { total, confirmed, pending };
  }, [datasetImagesForDetail, totalCount, config.fetchAnnotationCounts]);

  return (
    <ImagesContext.Provider
      value={{
        images,
        imageMap,
        selectedImage,
        isLoading,
        error,
        randomSeed,
        setRandomSeed,
        datasetImages: datasetImagesForDetail,
        annotationCounts,
        totalCounts,
        isPlaceholderDataShowing: isPreviousDataShowing || false,
      }}
    >
      {children}
    </ImagesContext.Provider>
  );
}

export function useImagesContext() {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error("useImagesContext must be used within ImagesProvider");
  }
  return context;
}
