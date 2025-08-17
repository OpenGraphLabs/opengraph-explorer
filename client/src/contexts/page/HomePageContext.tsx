import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import { useAnnotations } from "../data/AnnotationsContext";
import { useImagesContext } from "../data/ImagesContext";
import { useCategories } from "../data/CategoriesContext";
import type { Annotation } from "@/shared/api/endpoints/annotations";
import type { Image } from "@/shared/api/endpoints/images";

export interface ApprovedAnnotationWithImage extends Annotation {
  image?: Image;
  categoryName?: string;
}

export type DataType = "image" | "video";
export type VideoTask = "all" | "wipe_spill" | "fold_clothes";

interface HomePageContextValue {
  // Combined data
  annotationsWithImages: ApprovedAnnotationWithImage[];

  // Page-specific UI state
  showGlobalMasks: boolean;
  setShowGlobalMasks: (show: boolean) => void;
  selectedAnnotation: ApprovedAnnotationWithImage | null;
  setSelectedAnnotation: (annotation: ApprovedAnnotationWithImage | null) => void;

  // Data type selection
  dataType: DataType;
  setDataType: (type: DataType) => void;

  // Video task selection
  selectedVideoTask: VideoTask;
  setSelectedVideoTask: (task: VideoTask) => void;

  // Loading states
  isLoading: boolean;
  error: any;
  isTransitioning: boolean;

  // Search states
  hasSearchFilter: boolean;
  isSearching: boolean;

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
  const [previousAnnotationsWithImages, setPreviousAnnotationsWithImages] = useState<
    ApprovedAnnotationWithImage[]
  >([]);
  const [dataType, setDataType] = useState<DataType>("image");
  const [selectedVideoTask, setSelectedVideoTask] = useState<VideoTask>("all");

  // Get data from providers
  const {
    annotations,
    isLoading: annotationsLoading,
    error: annotationsError,
    setCurrentPage,
  } = useAnnotations();

  const {
    imageMap,
    isLoading: imagesLoading,
    error: imagesError,
    isPlaceholderDataShowing: imagesPreviousData,
  } = useImagesContext();

  const { categoryMap, selectedCategory, isLoading: categoriesLoading } = useCategories();

  // Track search state
  const hasSearchFilter = !!selectedCategory;
  const isSearching = categoriesLoading && hasSearchFilter;

  // Combine annotations with their images and category names with progressive loading
  const annotationsWithImages = useMemo(() => {
    // Don't wait for all data - process what we have
    // Only skip if we have no annotations AND we're still loading annotations
    if (annotations.length === 0 && annotationsLoading) {
      return [];
    }

    // First filter by category if selected
    const categoryFilteredAnnotations = selectedCategory
      ? annotations.filter(annotation => annotation.categoryId === selectedCategory.id)
      : annotations;

    // Map annotations with their images and category names
    const annotationsWithData = categoryFilteredAnnotations.map(annotation => {
      const rawImage = imageMap.get(annotation.imageId);
      // Convert ImageRead to Image if needed
      const image = rawImage
        ? {
            id: rawImage.id,
            fileName: (rawImage as any).file_name || (rawImage as any).fileName,
            imageUrl: (rawImage as any).image_url || (rawImage as any).imageUrl,
            width: rawImage.width,
            height: rawImage.height,
            datasetId: (rawImage as any).dataset_id || (rawImage as any).datasetId,
            createdAt: (rawImage as any).created_at || (rawImage as any).createdAt,
          }
        : undefined;

      return {
        ...annotation,
        image,
        categoryName: categoryMap.get(annotation.categoryId) || `Category ${annotation.categoryId}`,
      };
    });

    // Only filter out items without images after loading is complete
    // During loading, show all annotations to maintain count
    if (!imagesLoading) {
      return annotationsWithData.filter(item => item.image);
    }

    return annotationsWithData;
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

    // If we have a search filter and loading is complete, show empty state instead of loading
    if (hasSearchFilter && !annotationsLoading && !imagesLoading) {
      return true; // Ready to show empty state
    }

    // Show loading if annotations are loading for the first time
    if (annotationsLoading && annotations.length === 0 && !hasSearchFilter) {
      return false;
    }

    // Show loading if images are loading for the first time
    if (imagesLoading && imageMap.size === 0 && !hasSearchFilter) {
      return false;
    }

    // Check if we have annotations but no corresponding images (only when not searching)
    if (annotations.length > 0 && annotationsWithImages.length === 0 && !hasSearchFilter) {
      return false;
    }

    // If searching and data loading is complete, we're ready (might show empty search results)
    if (hasSearchFilter && !annotationsLoading && !imagesLoading) {
      return true;
    }

    // Default to ready if we have any data
    return annotationsWithImages.length > 0;
  }, [
    annotationsWithImages.length,
    annotationsLoading,
    annotations.length,
    imagesLoading,
    imageMap.size,
    hasSearchFilter,
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
        dataType,
        setDataType,
        selectedVideoTask,
        setSelectedVideoTask,
        isLoading,
        error,
        isTransitioning,
        hasSearchFilter,
        isSearching,
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
