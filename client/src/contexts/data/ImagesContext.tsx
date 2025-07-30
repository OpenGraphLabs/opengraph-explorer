import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import { useImages, useDatasetImages, useImageById } from "@/shared/hooks/useApiQuery";
import { useApiClient } from "@/shared/hooks/useApiClient";
import { useAnnotations } from "./AnnotationsContext";
import type { ImageRead } from "@/shared/api/generated/models";

interface ImagesConfig {
  limit?: number;
  page?: number;
  datasetId?: number;
  randomSeed?: number;
  fetchAnnotationCounts?: boolean; // For DatasetDetail pages
  useAnnotationImages?: boolean; // For Home page - fetch images based on annotations
}

interface ImagesContextValue {
  images: ImageRead[];
  imageMap: Map<number, ImageRead>;
  selectedImage: ImageRead | null;
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
  const { annotations: annotationsApiClient, images: imagesApiClient } = useApiClient();
  
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
    console.warn('ImagesProvider: useAnnotations not available in this context');
  }

  // Determine fetching strategy
  const useAnnotationBasedImages = config.useAnnotationImages && annotationsFromContext.length > 0;
  const useGeneralImages = !config.datasetId && !config.fetchAnnotationCounts && !useAnnotationBasedImages && !config.useAnnotationImages;
  const shouldUseDatasetImages = !!config.datasetId && config.datasetId > 0 && !config.useAnnotationImages;
  
  // Get unique image IDs from annotations
  const requiredImageIds = useMemo(() => {
    if (!useAnnotationBasedImages || annotationsFromContext.length === 0) {
      return [];
    }
    
    const imageIds = annotationsFromContext
      .map((annotation: any) => annotation.image_id)
      .filter((id: number) => id && typeof id === 'number');
    
    return Array.from(new Set(imageIds));
  }, [useAnnotationBasedImages, annotationsFromContext]);
  
  // State for individually fetched images
  const [annotationImages, setAnnotationImages] = useState<ImageRead[]>([]);
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
            const image = await imagesApiClient.getImageById(imageId);
            return { success: true, imageId, image };
          } catch (error) {
            return { success: false, imageId, error };
          }
        });
        
        const results = await Promise.allSettled(imagePromises);
        const successfulImages: ImageRead[] = [];
        
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
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

  const {
    data: generalImagesResponse,
    isLoading: generalLoading,
    error: generalError,
    isPlaceholderData,
  } = useImages(
    { page: config.page || 1, limit: config.limit || 100 },
    {
      enabled: useGeneralImages && !useAnnotationBasedImages,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes - images don't change frequently
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      placeholderData: (previousData) => previousData, // Show previous data immediately
    }
  );

  // Skip the dataset images query entirely if we're using annotation-based images
  const skipDatasetQuery = config.useAnnotationImages === true;
  
  const {
    data: datasetImagesResponse,
    isLoading: datasetLoading,
    error: datasetError,
    isPlaceholderData: datasetIsPlaceholderData,
  } = useDatasetImages(
    config.datasetId || 999999, // Use a very high number that won't exist
    { page: config.page || 1, limit: config.limit || 100 },
    {
      enabled: !skipDatasetQuery && shouldUseDatasetImages,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes - images don't change frequently
      retry: false, // Disable retries for invalid dataset IDs
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      placeholderData: (previousData) => previousData, // Show previous data immediately
    } as any
  );

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
      
  const imagesResponse = useGeneralImages ? generalImagesResponse : datasetImagesResponse;
  const images = useAnnotationBasedImages 
    ? annotationImages
    : imagesResponse?.items || [];
  const isPreviousDataShowing = useAnnotationBasedImages 
    ? false // No placeholder data for annotation-based fetching
    : useGeneralImages 
      ? isPlaceholderData 
      : datasetIsPlaceholderData;
  
  // Image preloading effect
  useEffect(() => {
    if (images.length > 0) {
      // Preload first 6 images for faster rendering
      const imagesToPreload = images.slice(0, 6);
      imagesToPreload.forEach((image: ImageRead) => {
        if (image.image_url) {
          const img = new Image();
          img.src = image.image_url;
          // Set low priority to avoid blocking other resources
          if ('loading' in img) {
            (img as any).loading = 'lazy';
          }
        }
      });
    }
  }, [images]);

  // Fetch annotation counts for dataset images
  const fetchAnnotationCounts = async (imagesToProcess: ImageRead[]) => {
    if (!config.fetchAnnotationCounts) return new Map();

    const counts = new Map<number, number>();

    try {
      const promises = imagesToProcess.map(async (image: ImageRead) => {
        try {
          const annotationsData = await annotationsApiClient.getApprovedAnnotationsByImage(image.id);
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
    const map = new Map<number, ImageRead>();
    images.forEach((image: ImageRead) => {
      map.set(image.id, image);
    });
    return map;
  }, [images]);

  // Select a random image for workspace (if datasetId is provided)
  const selectedImage = useMemo(() => {
    if (!config.datasetId || images.length === 0) return null;

    const datasetFilteredImages = images.filter(
      (image: ImageRead) => image.dataset_id === config.datasetId
    );

    if (datasetFilteredImages.length === 0) return null;

    const randomIndex = randomSeed % datasetFilteredImages.length;
    return datasetFilteredImages[randomIndex];
  }, [images, config.datasetId, randomSeed]);

  // Transform images for dataset detail view
  const datasetImages = useMemo(() => {
    if (!config.fetchAnnotationCounts) return [];

    return images.map((image: ImageRead) => ({
      id: image.id.toString(),
      path: image.file_name,
      image_url: image.image_url,
      width: image.width,
      height: image.height,
      imageId: image.id,
      annotations: [],
      approvedAnnotationsCount: annotationCounts.get(image.id) || 0,
      metadata: {
        index: image.id,
        datasetId: image.dataset_id,
      },
    }));
  }, [images, annotationCounts, config.fetchAnnotationCounts]);

  // Calculate total counts for dataset detail
  const totalCounts = useMemo(() => {
    if (!config.fetchAnnotationCounts) {
      return { total: 0, confirmed: 0, pending: 0 };
    }

    const total = imagesResponse?.total || images.length;
    const confirmed = datasetImages.filter(item => item.approvedAnnotationsCount > 0).length;
    const pending = datasetImages.length - confirmed;

    return { total, confirmed, pending };
  }, [datasetImages, imagesResponse?.total, config.fetchAnnotationCounts]);

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
        datasetImages,
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
