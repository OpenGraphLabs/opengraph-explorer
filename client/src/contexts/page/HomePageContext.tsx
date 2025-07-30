import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import { useAnnotations } from "../data/AnnotationsContext";
import { useImagesContext } from "../data/ImagesContext";
import { useCategories } from "../data/CategoriesContext";
import type { AnnotationRead, ImageRead } from "@/shared/api/generated/models";

export interface ApprovedAnnotationWithImage extends AnnotationRead {
  image?: ImageRead;
  categoryName?: string;
}

interface HomePageContextValue {
  // Combined data
  annotationsWithImages: ApprovedAnnotationWithImage[];

  // Page-specific UI state
  showGlobalMasks: boolean;
  setShowGlobalMasks: (show: boolean) => void;
  selectedAnnotation: ApprovedAnnotationWithImage | null;
  setSelectedAnnotation: (annotation: ApprovedAnnotationWithImage | null) => void;

  // Loading states
  isLoading: boolean;
  error: any;
  isTransitioning: boolean;

  // Page control
  handlePageChange: (page: number) => void;
  handleAnnotationClick: (annotation: ApprovedAnnotationWithImage) => void;
  handleCloseSidebar: () => void;
}

const HomePageContext = createContext<HomePageContextValue | undefined>(undefined);

export function HomePageProvider({ children }: { children: ReactNode }) {
  // Page-specific UI state
  const [showGlobalMasks, setShowGlobalMasks] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<ApprovedAnnotationWithImage | null>(
    null
  );
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [previousAnnotationsWithImages, setPreviousAnnotationsWithImages] = useState<ApprovedAnnotationWithImage[]>([]);

  // Get data from providers
  const {
    annotations,
    isLoading: annotationsLoading,
    error: annotationsError,
    setCurrentPage,
  } = useAnnotations();

  const { imageMap, isLoading: imagesLoading, error: imagesError, isPlaceholderDataShowing: imagesPreviousData } = useImagesContext();

  const { categoryMap, selectedCategory, isLoading: categoriesLoading } = useCategories();

  // Combine annotations with their images and category names with progressive loading
  const annotationsWithImages = useMemo(() => {
    // Don't wait for all data - process what we have
    // Only skip if we have no annotations AND we're still loading annotations
    if (annotations.length === 0 && annotationsLoading) {
      return [];
    }

    return annotations
      .map(annotation => ({
        ...annotation,
        image: imageMap.get(annotation.image_id),
        categoryName:
          categoryMap.get(annotation.category_id) || `Category ${annotation.category_id}`,
      }))
      .filter(item => item.image) // Only include items with valid images
      .filter(item => {
        // Filter by selected category
        if (selectedCategory) {
          return item.category_id === selectedCategory.id;
        }
        return true;
      });
  }, [annotations, imageMap, categoryMap, selectedCategory, annotationsLoading, imagesLoading]);

  // Track when annotations with images are successfully created
  useEffect(() => {
    if (annotationsWithImages.length > 0 && !annotationsLoading && !imagesLoading) {
      setPreviousAnnotationsWithImages(annotationsWithImages);
      setIsPageTransitioning(false);
    }
  }, [annotationsWithImages, annotationsLoading, imagesLoading]);

  // Progressive loading state logic - show content as soon as possible
  const isDataReady = useMemo(() => {
    // Show data if we have annotationsWithImages, even during transitions
    if (annotationsWithImages.length > 0) {
      return true;
    }

    // Show loading if annotations are loading for the first time
    if (annotationsLoading && annotations.length === 0) {
      return false;
    }

    // Show loading if images are loading for the first time
    if (imagesLoading && imageMap.size === 0) {
      return false;
    }

    // Check if we have annotations but no corresponding images
    if (annotations.length > 0 && annotationsWithImages.length === 0) {
      return false;
    }

    // Default to ready if we have any data
    return annotationsWithImages.length > 0;
  }, [
    annotationsWithImages.length,
    annotationsLoading,
    annotations.length,
    imagesLoading,
    imageMap.size,
  ]);

  // Simplified loading state
  const isLoading = !isDataReady;
  
  // Show transition state for pagination
  const isTransitioning = isPageTransitioning && (annotationsLoading || imagesLoading);
  const error = annotationsError || imagesError;

  // Display data - always show current data, handle transitions smoothly
  const displayAnnotationsWithImages = useMemo(() => {
    // Always prefer current data
    if (annotationsWithImages.length > 0) {
      return annotationsWithImages;
    }
    // Fallback to previous data only if we have no current data and we're transitioning
    if (isPageTransitioning && previousAnnotationsWithImages.length > 0) {
      return previousAnnotationsWithImages;
    }
    return annotationsWithImages;
  }, [annotationsWithImages, isPageTransitioning, previousAnnotationsWithImages]);

  // Page handlers
  const handlePageChange = (newPage: number) => {
    setIsPageTransitioning(true);
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAnnotationClick = (annotation: ApprovedAnnotationWithImage) => {
    setSelectedAnnotation(annotation);
  };

  const handleCloseSidebar = () => {
    setSelectedAnnotation(null);
  };

  return (
    <HomePageContext.Provider
      value={{
        annotationsWithImages: displayAnnotationsWithImages,
        showGlobalMasks,
        setShowGlobalMasks,
        selectedAnnotation,
        setSelectedAnnotation,
        isLoading,
        error,
        isTransitioning,
        handlePageChange,
        handleAnnotationClick,
        handleCloseSidebar,
      }}
    >
      {children}
    </HomePageContext.Provider>
  );
}

export function useHomePage() {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error("useHomePage must be used within HomePageProvider");
  }
  return context;
}
