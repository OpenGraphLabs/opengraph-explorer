import React from "react";
import { Grid } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ImageWithSingleAnnotation } from "@/components/annotation";
import { useHomePage } from "@/contexts/page/HomePageContext";

export function HomeGallery() {
  const { theme } = useTheme();
  const { annotationsWithImages, showGlobalMasks, handleAnnotationClick, isLoading } =
    useHomePage();

  if (annotationsWithImages.length === 0) {
    return null;
  }

  return (
    <Grid
      columns={{
        initial: "1",
        sm: "2",
        md: "3",
        lg: "4",
        xl: "5",
      }}
      gap="4"
      style={{
        marginBottom: theme.spacing.semantic.layout.lg,
        opacity: isLoading ? 0.6 : 1,
        transform: isLoading ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
      }}
    >
      {annotationsWithImages.map(annotationWithImage => {
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
            onClick={() => handleAnnotationClick(annotationWithImage)}
            showMaskByDefault={showGlobalMasks}
          />
        );
      })}
    </Grid>
  );
}
