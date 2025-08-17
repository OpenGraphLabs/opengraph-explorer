import { useState, useMemo, useEffect } from "react";
import { useAnnotations } from "@/shared/api/endpoints/annotations";
import { useImages } from "@/shared/api/endpoints/images";
import { useCategories } from "@/shared/api/endpoints/categories";
import type { Annotation } from "@/shared/api/endpoints/annotations";
import type { Image } from "@/shared/api/endpoints/images";
import type { Category } from "@/shared/api/endpoints/categories";

export interface ApprovedAnnotationWithImage extends Annotation {
  image?: Image;
  categoryName?: string;
}

export type DataType = "image" | "video";
export type VideoTask = "all" | "wipe_spill" | "fold_clothes";

export interface UseHomePageOptions {
  annotationsLimit?: number;
  categoriesLimit?: number;
}

export function useHomePage(options: UseHomePageOptions = {}) {
  const { annotationsLimit = 25, categoriesLimit = 100 } = options;

  // Page-specific UI state
  const [showGlobalMasks, setShowGlobalMasks] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<ApprovedAnnotationWithImage | null>(null);
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [dataType, setDataType] = useState<DataType>("image");
  const [selectedVideoTask, setSelectedVideoTask] = useState<VideoTask>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // API data fetching
  const {
    data: annotations = [],
    totalCount: totalAnnotations = 0,
    isLoading: annotationsLoading,
    error: annotationsError,
  } = useAnnotations({
    status: "APPROVED",
    sourceType: "USER", 
    page: currentPage,
    limit: annotationsLimit,
    enabled: dataType === "image",
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories({
    page: 1,
    limit: categoriesLimit,
    enabled: true,
  });

  // Get unique image IDs from annotations
  const imageIds = useMemo(() => {
    return [...new Set(annotations.map(ann => ann.imageId))];
  }, [annotations]);

  // Fetch images for annotations
  const {
    data: images = [],
    isLoading: imagesLoading,
    error: imagesError,
  } = useImages({
    page: 1,
    // TODO: fetch annotation first and then fetch images by IDs
    limit: 100, // Large limit to get all required images
    enabled: imageIds.length > 0,
  });

  // Create lookup maps for efficient data joining
  const imageMap = useMemo(() => {
    const map = new Map<number, Image>();
    images.forEach(image => {
      map.set(image.id, image);
    });
    return map;
  }, [images]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    categories.forEach(category => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);

  // Combine annotations with their images and category names
  const annotationsWithImages = useMemo(() => {
    return annotations.map((annotation): ApprovedAnnotationWithImage => {
      const image = imageMap.get(annotation.imageId);
      const category = annotation.categoryId ? categoryMap.get(annotation.categoryId) : undefined;
      
      return {
        ...annotation,
        image,
        categoryName: category?.name,
      };
    });
  }, [annotations, imageMap, categoryMap]);

  // Loading and error states
  const isLoading = annotationsLoading || categoriesLoading || imagesLoading;
  const error = annotationsError || categoriesError || imagesError;

  // Search and filter states
  const hasSearchFilter = false; // TODO: Implement search functionality
  const isSearching = false;

  // Transition effect
  useEffect(() => {
    setIsPageTransitioning(true);
    const timer = setTimeout(() => {
      setIsPageTransitioning(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // Page control handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAnnotationClick = (annotation: ApprovedAnnotationWithImage) => {
    setSelectedAnnotation(annotation);
  };

  const handleCloseSidebar = () => {
    setSelectedAnnotation(null);
  };

  const handleCategorySelect = (category: { id: number; name: string } | null) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalAnnotations / annotationsLimit);

  return {
    // Combined data
    annotationsWithImages,
    totalPages,
    totalAnnotations,
    currentPage,

    // Page-specific UI state
    showGlobalMasks,
    setShowGlobalMasks,
    selectedAnnotation,
    setSelectedAnnotation,

    // Data type selection
    dataType,
    setDataType,

    // Video task selection
    selectedVideoTask,
    setSelectedVideoTask,

    // Loading states
    isLoading,
    error,
    isTransitioning: isPageTransitioning,

    // Search states
    hasSearchFilter,
    isSearching,

    // Category selection
    selectedCategory,
    handleCategorySelect,

    // Search functionality
    searchQuery,
    setSearchQuery,

    // Page control
    setCurrentPage,
    handlePageChange,
    handleAnnotationClick,
    handleCloseSidebar,
  };
}