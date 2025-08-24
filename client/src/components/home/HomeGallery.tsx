import React from "react";
import { Grid, Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ImageWithSingleAnnotation } from "@/components/annotation";
import { useHomePageContext } from "@/contexts/HomePageContextProvider";
import { useMobile } from "@/shared/hooks";

export function HomeGallery() {
  const {
    annotationsWithImages,
    showGlobalMasks,
    handleAnnotationClick,
    isLoading,
    isTransitioning,
  } = useHomePageContext();
  const { theme } = useTheme();
  const { isMobile, isTablet, breakpoint } = useMobile();

  // Get responsive grid columns based on device
  const getGridColumns = () => {
    if (isMobile) return "1";
    if (isTablet) return "2";
    return "5"; // Desktop
  };

  if (annotationsWithImages.length === 0) {
    return null;
  }

  return (
    <Grid
      columns={getGridColumns()}
      gap={isMobile ? "3" : "5"}
      style={{
        marginBottom: isMobile
          ? theme.spacing.semantic.layout.md
          : theme.spacing.semantic.layout.xl,
        opacity: isTransitioning ? 0.8 : 1,
        transform: isTransitioning ? "scale(0.99)" : "scale(1)",
        transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: isLoading ? "none" : "auto",
      }}
    >
      {annotationsWithImages.map((annotationWithImage, index) => {
        const { image, categoryName, ...annotation } = annotationWithImage;

        if (!image) return null;

        return (
          <Box
            key={annotation.id}
            className={`image-card ${isMobile ? "mobile-touch-card" : ""}`}
            style={{
              borderRadius: isMobile ? "8px" : "12px",
              overflow: "hidden",
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.subtle}30`,
              boxShadow: isMobile
                ? "0 1px 4px rgba(0, 0, 0, 0.08)"
                : "0 2px 8px rgba(0, 0, 0, 0.04)",
              cursor: isMobile ? "default" : "pointer",
            }}
          >
            <ImageWithSingleAnnotation
              annotation={
                {
                  ...annotation,
                  source_type: annotation.sourceType,
                  image_id: annotation.imageId,
                  category_id: annotation.categoryId,
                  created_by: annotation.createdBy,
                  created_at: annotation.createdAt,
                  updated_at: annotation.updatedAt,
                } as any
              }
              imageId={image.id}
              imageUrl={image.imageUrl}
              imageWidth={image.width}
              imageHeight={image.height}
              fileName={image.fileName}
              onClick={() => handleAnnotationClick(annotationWithImage)}
              showMaskByDefault={showGlobalMasks}
              priority={index < 6} // First 6 images get priority loading
            />
          </Box>
        );
      })}
    </Grid>
  );
}
