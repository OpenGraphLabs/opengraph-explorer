import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useAnnotations } from '../data/AnnotationsContext';
import { useImagesContext } from '../data/ImagesContext';
import { useCategories } from '../data/CategoriesContext';
import type { AnnotationRead, ImageRead } from '@/shared/api/generated/models';

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
  
  // Page control
  handlePageChange: (page: number) => void;
  handleAnnotationClick: (annotation: ApprovedAnnotationWithImage) => void;
  handleCloseSidebar: () => void;
}

const HomePageContext = createContext<HomePageContextValue | undefined>(undefined);

export function HomePageProvider({ children }: { children: ReactNode }) {
  // Page-specific UI state
  const [showGlobalMasks, setShowGlobalMasks] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<ApprovedAnnotationWithImage | null>(null);

  // Get data from providers
  const { 
    annotations, 
    isLoading: annotationsLoading, 
    error: annotationsError,
    setCurrentPage 
  } = useAnnotations();
  
  const { 
    imageMap, 
    isLoading: imagesLoading,
    error: imagesError
  } = useImagesContext();
  
  const { 
    categoryMap, 
    selectedCategory,
    isLoading: categoriesLoading 
  } = useCategories();

  // Combine annotations with their images and category names
  const annotationsWithImages = useMemo(() => {
    return annotations
      .map(annotation => ({
        ...annotation,
        image: imageMap.get(annotation.image_id),
        categoryName: categoryMap.get(annotation.category_id) || `Category ${annotation.category_id}`
      }))
      .filter(item => item.image) // Only include items with valid images
      .filter(item => {
        // Filter by selected category
        if (selectedCategory) {
          return item.category_id === selectedCategory.id;
        }
        return true;
      });
  }, [annotations, imageMap, categoryMap, selectedCategory]);

  // Combined loading state
  const isLoading = annotationsLoading || imagesLoading || categoriesLoading;
  const error = annotationsError || imagesError;

  // Page handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        annotationsWithImages,
        showGlobalMasks,
        setShowGlobalMasks,
        selectedAnnotation,
        setSelectedAnnotation,
        isLoading,
        error,
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
    throw new Error('useHomePage must be used within HomePageProvider');
  }
  return context;
}