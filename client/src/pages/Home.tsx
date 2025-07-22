import React, { useState, useMemo } from "react";
import { Box, Flex, Heading, Text, Grid, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  EyeOpenIcon,
  EyeNoneIcon
} from "@radix-ui/react-icons";
import { useApprovedAnnotations } from "@/shared/hooks/useApiQuery";
import { useImages } from "@/shared/hooks/useApiQuery";
import { ImageWithSingleAnnotation, CategorySearchInput } from "@/features/annotation/components";
import type { AnnotationRead } from "@/shared/api/generated/models";

interface ImageItem {
  id: number;
  file_name: string;
  image_url: string;
  width: number;
  height: number;
  dataset_id: number;
  created_at: string;
}

interface ApprovedAnnotationWithImage extends AnnotationRead {
  image?: ImageItem;
  categoryName?: string;
}

export function Home() {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(24);
  const [showGlobalMasks, setShowGlobalMasks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<{ id: number; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch approved annotations
  const { 
    data: approvedAnnotationsResponse, 
    isLoading: annotationsLoading, 
    error: annotationsError 
  } = useApprovedAnnotations(
    { page: currentPage, limit },
    { 
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  // Fetch all images (needed to get image details)
  const { 
    data: imagesResponse, 
    isLoading: imagesLoading
  } = useImages(
    { page: 1, limit: 100 }, // Get images to map with annotations (max 100)
    { 
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const approvedAnnotations = approvedAnnotationsResponse?.items || [];
  const allImages = imagesResponse?.items || [];
  const totalPages = approvedAnnotationsResponse?.pages || 0;
  const totalAnnotations = approvedAnnotationsResponse?.total || 0;

  // Create a map of image_id to image for quick lookup
  const imageMap = useMemo(() => {
    const map = new Map<number, ImageItem>();
    allImages.forEach(image => {
      map.set(image.id, image);
    });
    return map;
  }, [allImages]);

  // Combine annotations with their corresponding images and filter by category
  const annotationsWithImages: ApprovedAnnotationWithImage[] = useMemo(() => {
    const result = approvedAnnotations
      .map(annotation => ({
        ...annotation,
        image: imageMap.get(annotation.image_id),
        categoryName: `Category ${annotation.category_id}` // TODO: Replace with actual category name
      }))
      .filter(item => item.image) // Only include items with valid images
      .filter(item => {
        // Filter by selected category
        if (selectedCategory) {
          return item.category_id === selectedCategory.id;
        }
        return true;
      });

    return result;
  }, [approvedAnnotations, imageMap, selectedCategory]);

  const isLoading = annotationsLoading || imagesLoading;

  // Search state
  const isSearching = !!selectedCategory;
  const searchResultsCount = annotationsWithImages.length;
  const hasSearchResults = searchResultsCount > 0;
  const isInitialState = !isSearching && !isLoading;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnnotationClick = (annotation: ApprovedAnnotationWithImage) => {
    // TODO: Open annotation detail modal or navigate to detail page
    console.log('Clicked annotation:', annotation);
  };

  const handleCategorySelect = (category: { id: number; name: string } | null) => {
    setSelectedCategory(category);
    setSearchQuery(category?.name || '');
    setCurrentPage(1);
    
    // Smooth scroll to top when category changes
    if (category) {
      setTimeout(() => {
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  };


  if (annotationsError) {
    return (
      <Box
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <GridIcon 
            width="48" 
            height="48" 
            style={{ color: theme.colors.status.error }}
          />
          <Heading size="4" style={{ color: theme.colors.text.primary }}>
            Unable to Load Annotations
          </Heading>
          <Text style={{ color: theme.colors.text.secondary, textAlign: 'center' }}>
            There was an error loading approved annotations. Please try refreshing the page.
          </Text>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.reload()}
            style={{
              marginTop: theme.spacing.semantic.component.md,
            }}
          >
            Refresh Page
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: theme.colors.background.primary,
      }}
    >
      {/* Header */}
      <Box
        style={{
          background: theme.colors.background.primary,
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box
          style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.container.sm}`,
          }}
        >
          <Flex direction="column" align="center" gap="4">
            {/* OpenGraph Title */}
            <Heading
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.text.primary,
                letterSpacing: theme.typography.h2.letterSpacing,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              OpenGraph
            </Heading>

            {/* Category Search Bar */}
            <Box 
              style={{ 
                width: '100%', 
                maxWidth: '620px',
                transition: theme.animations.transitions.all,
                transform: selectedCategory ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              <CategorySearchInput
                placeholder="Search for categories, annotations, or image types..."
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </Box>

            {/* Stats and Controls */}
            {!isLoading && (
              <Flex 
                direction="column" 
                align="center" 
                gap="3"
                style={{
                  opacity: isLoading ? 0.6 : 1,
                  transition: 'opacity 200ms ease-out',
                }}
              >
                <Text
                  style={{
                    fontSize: theme.typography.bodySmall.fontSize,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                    transition: 'all 200ms ease-out',
                  }}
                >
                  {selectedCategory 
                    ? `${annotationsWithImages.length} result${annotationsWithImages.length === 1 ? '' : 's'} for "${selectedCategory.name}"`
                    : `${totalAnnotations} verified annotations available`
                  }
                </Text>
                
                {/* Global Mask Toggle */}
                <Button
                  variant="secondary"
                  size="sm"
                  highContrast={true}
                  onClick={() => setShowGlobalMasks(!showGlobalMasks)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.semantic.component.sm,
                    padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                  }}
                >
                  {showGlobalMasks ? (
                    <EyeNoneIcon width="14" height="14" />
                  ) : (
                    <EyeOpenIcon width="14" height="14" />
                  )}
                  {showGlobalMasks ? 'Hide Segmentation Masks' : 'Show Segmentation Masks'}
                </Button>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.sm}`,
        }}
      >
        {/* Loading State */}
        {isLoading && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="4"
            style={{
              minHeight: '300px',
              padding: theme.spacing.semantic.layout.lg,
            }}
          >
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `3px solid ${theme.colors.border.primary}`,
                borderTopColor: theme.colors.interactive.primary,
                animation: 'spin 1s linear infinite',
              }}
            />
            <Text
              style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
              }}
            >
              Loading approved annotations...
            </Text>
          </Flex>
        )}

        {/* Annotations Grid */}
        {!isLoading && annotationsWithImages.length > 0 && (
          <>
            <Grid 
              columns={{ 
                initial: "1", 
                sm: "2", 
                md: "3", 
                lg: "4", 
                xl: "5"
              }} 
              gap="4"
              style={{
                marginBottom: theme.spacing.semantic.layout.lg,
                opacity: isLoading ? 0.6 : 1,
                transform: isLoading ? 'translateY(8px)' : 'translateY(0)',
                transition: 'opacity 300ms ease-out, transform 300ms ease-out',
              }}
            >
              {annotationsWithImages.map((annotationWithImage) => {
                const { image, categoryName, ...annotation } = annotationWithImage;
                
                if (!image) return null;

                return (
                  <ImageWithSingleAnnotation
                    key={annotation.id}
                    annotation={annotation}
                    imageId={image.id}
                    imageUrl={image.image_url}
                    imageWidth={image.width}
                    imageHeight={image.height}
                    fileName={image.file_name}
                    categoryName={categoryName}
                    onClick={() => handleAnnotationClick(annotationWithImage)}
                    showMaskByDefault={showGlobalMasks}
                  />
                );
              })}
            </Grid>

            {/* Pagination */}
            {!selectedCategory && totalPages > 1 && (
              <Flex justify="center" align="center" gap="2">
                <Button
                  variant="secondary"
                  size="md"
                  highContrast={true}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.semantic.component.sm,
                  }}
                >
                  <ChevronLeftIcon width="16" height="16" />
                  Previous
                </Button>
                
                <Text
                  style={{
                    margin: `0 ${theme.spacing.semantic.component.lg}`,
                    fontSize: theme.typography.bodySmall.fontSize,
                    color: theme.colors.text.secondary,
                    fontFamily: 'JetBrains Mono, SF Mono, Monaco, Inconsolata, Roboto Mono, Fira Code, Consolas, Liberation Mono, Menlo, Courier, monospace',
                  }}
                >
                  Page {currentPage} of {totalPages}
                </Text>

                <Button
                  variant="secondary"
                  size="md"
                  highContrast={true}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.semantic.component.sm,
                  }}
                >
                  Next
                  <ChevronRightIcon width="16" height="16" />
                </Button>
              </Flex>
            )}
          </>
        )}

        {/* Empty State */}
        {!isLoading && annotationsWithImages.length === 0 && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="4"
            style={{
              minHeight: '300px',
              padding: theme.spacing.semantic.layout.lg,
            }}
          >
            <GridIcon 
              width="64" 
              height="64" 
              style={{ 
                color: theme.colors.text.tertiary,
              }} 
            />
            
            <Flex direction="column" align="center" gap="2">
              <Heading 
                size="4" 
                style={{ 
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.h4.fontSize,
                  fontWeight: theme.typography.h4.fontWeight,
                }}
              >
                {selectedCategory ? 'No annotations found in this category' : 'No approved annotations available'}
              </Heading>
              
              <Text 
                style={{ 
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  fontSize: theme.typography.body.fontSize,
                }}
              >
                {selectedCategory 
                  ? `Try selecting a different category or clear the current filter`
                  : 'Approved annotations will appear here when available'
                }
              </Text>

              {selectedCategory && (
                <Button
                  variant="secondary"
                  size="md"
                  highContrast={true}
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setCurrentPage(1);
                    setTimeout(() => {
                      window.scrollTo({ 
                        top: 0, 
                        behavior: 'smooth' 
                      });
                    }, 100);
                  }}
                  style={{
                    marginTop: theme.spacing.semantic.component.md,
                    transition: theme.animations.transitions.all,
                  }}
                >
                  View All Annotations
                </Button>
              )}
            </Flex>
          </Flex>
        )}
      </Box>

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          
          input::placeholder {
            color: ${theme.colors.text.tertiary};
            opacity: 1;
          }
        `}
      </style>
    </Box>
  );
}
