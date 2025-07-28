import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useImages } from '@/shared/hooks/useApiQuery';
import type { ImageRead } from '@/shared/api/generated/models';

interface ImagesConfig {
  limit?: number;
  page?: number;
  datasetId?: number;
  randomSeed?: number;
}

interface ImagesContextValue {
  images: ImageRead[];
  imageMap: Map<number, ImageRead>;
  selectedImage: ImageRead | null;
  isLoading: boolean;
  error: any;
  randomSeed: number;
  setRandomSeed: (seed: number) => void;
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

  const {
    data: imagesResponse,
    isLoading,
    error
  } = useImages(
    { page: config.page || 1, limit: config.limit || 100 },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const images = imagesResponse?.items || [];

  // Create image map for quick lookup
  const imageMap = useMemo(() => {
    const map = new Map<number, ImageRead>();
    images.forEach(image => {
      map.set(image.id, image);
    });
    return map;
  }, [images]);

  // Select a random image for workspace (if datasetId is provided)
  const selectedImage = useMemo(() => {
    if (!config.datasetId || images.length === 0) return null;

    const datasetImages = images.filter(
      image => image.dataset_id === config.datasetId
    );

    if (datasetImages.length === 0) return null;

    const randomIndex = randomSeed % datasetImages.length;
    return datasetImages[randomIndex];
  }, [images, config.datasetId, randomSeed]);

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