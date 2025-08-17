import React from "react";
import { Grid, Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ImageWithSingleAnnotation } from "@/components/annotation";
import { useHomePage } from "@/contexts/page/HomePageContext";

export function HomeGallery() {
  const { theme } = useTheme();
  const {
    annotationsWithImages,
    showGlobalMasks,
    handleAnnotationClick,
    isLoading,
    isTransitioning,
  } = useHomePage();

  if (annotationsWithImages.length === 0) {
    return null;
  }

  return (
    <Grid
      columns={{
        initial: "1",
        sm: "2",
        md: "3",
        lg: "5",
        xl: "5",
      }}
      gap="5"
      style={{
        marginBottom: theme.spacing.semantic.layout.xl,
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
            className="image-card"
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              background: theme.colors.background.secondary,
              border: `1px solid ${theme.colors.border.subtle}30`,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              cursor: "pointer",
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
