import { useCallback, useMemo } from 'react';

import { ImageData } from '../types/workspace.ts';

interface ImageNavigationProps {
  images: ImageData[];
  currentImage: ImageData | null;
  onImageChange: (image: ImageData) => void;
}

export function useImageNavigation({ images, currentImage, onImageChange }: ImageNavigationProps) {
  const currentImageIndex = useMemo(() => {
    return images.findIndex(img => img.id === currentImage?.id);
  }, [images, currentImage?.id]);

  const progress = useMemo(() => {
    return images.length > 0 ? ((currentImageIndex + 1) / images.length) * 100 : 0;
  }, [currentImageIndex, images.length]);

  const canGoNext = useMemo(() => {
    return currentImageIndex < images.length - 1;
  }, [currentImageIndex, images.length]);

  const canGoPrevious = useMemo(() => {
    return currentImageIndex > 0;
  }, [currentImageIndex]);

  const handleNext = useCallback(() => {
    if (canGoNext) {
      onImageChange(images[currentImageIndex + 1]);
    }
  }, [canGoNext, currentImageIndex, images, onImageChange]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      onImageChange(images[currentImageIndex - 1]);
    }
  }, [canGoPrevious, currentImageIndex, images, onImageChange]);

  const handleNavigate = useCallback((index: number) => {
    if (images[index]) {
      onImageChange(images[index]);
    }
  }, [images, onImageChange]);

  return {
    currentImageIndex,
    progress,
    canGoNext,
    canGoPrevious,
    handleNext,
    handlePrevious,
    handleNavigate,
    totalImages: images.length,
  };
} 