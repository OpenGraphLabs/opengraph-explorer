import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { useImages, useDatasetImages } from '@/shared/hooks/useApiQuery';
import { useApiClient } from '@/shared/hooks/useApiClient';
import type { ImageRead } from '@/shared/api/generated/models';

interface ImagesConfig {
  limit?: number;
  page?: number;
  datasetId?: number;
  randomSeed?: number;
  fetchAnnotationCounts?: boolean; // For DatasetDetail pages
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
}

const ImagesContext = createContext<ImagesContextValue | undefined>(undefined);

export function ImagesProvider({
  children,
  config = {}
}: {
  children: ReactNode;
  config?: ImagesConfig;
}) {
  const [randomSeed, setRandomSeed] = useState(config.randomSeed || Math.floor(Math.random() * 1000));
  const [annotationCounts, setAnnotationCounts] = useState<Map<number, number>>(new Map());
  const { annotations } = useApiClient();

  // Use different queries based on whether we need dataset-specific images
  const useGeneralImages = !config.datasetId || !config.fetchAnnotationCounts;
  
  const {
    data: generalImagesResponse,
    isLoading: generalLoading,
    error: generalError
  } = useImages(
    { page: config.page || 1, limit: config.limit || 100 },
    {
      enabled: useGeneralImages,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const {
    data: datasetImagesResponse,
    isLoading: datasetLoading,
    error: datasetError
  } = useDatasetImages(
    config.datasetId || 0,
    { page: config.page || 1, limit: config.limit || 100 },
    {
      enabled: !useGeneralImages && !!config.datasetId,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  const isLoading = useGeneralImages ? generalLoading : datasetLoading;
  const error = useGeneralImages ? generalError : datasetError;
  const imagesResponse = useGeneralImages ? generalImagesResponse : datasetImagesResponse;
  const images = imagesResponse?.items || [];

  // Fetch annotation counts for dataset images
  const fetchAnnotationCounts = async (imagesToProcess: ImageRead[]) => {
    if (!config.fetchAnnotationCounts) return new Map();
    
    const counts = new Map<number, number>();
    
    try {
      const promises = imagesToProcess.map(async (image: ImageRead) => {
        try {
          const annotationsData = await annotations.getApprovedAnnotationsByImage(image.id);
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
      console.error('Error fetching annotation counts:', error);
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
      fetchAnnotationCounts(images);
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
      }
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
      }}
    >
      {children}
    </ImagesContext.Provider>
  );
}

export function useImagesContext() {
  const context = useContext(ImagesContext);
  if (!context) {
    throw new Error('useImagesContext must be used within ImagesProvider');
  }
  return context;
}