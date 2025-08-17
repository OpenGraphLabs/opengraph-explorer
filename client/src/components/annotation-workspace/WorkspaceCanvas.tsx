import React, { useMemo } from "react";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { InteractiveAnnotationCanvas } from "@/components/annotation";
import { useImagesContext } from "@/contexts/data/ImagesContext";
import { useAnnotations } from "@/contexts/data/AnnotationsContext";
import { useAnnotationWorkspace } from "@/contexts/page/AnnotationWorkspaceContext";
import type { Annotation, MaskInfo } from "@/components/annotation/types/annotation";
import type { Annotation as NewAnnotation } from "@/shared/api/endpoints/annotations";

export function WorkspaceCanvas() {
  const { theme } = useTheme();
  const { selectedImage } = useImagesContext();
  const { annotations } = useAnnotations();
  const { currentSelectedMasks, handleMaskSelectionChange, handleBboxComplete } =
    useAnnotationWorkspace();

  // Convert NewAnnotation to Annotation format for legacy component
  const convertedAnnotations = useMemo(() => {
    return annotations.map(
      (annotation: NewAnnotation): Annotation => ({
        ...annotation,
        bbox: annotation.bbox,
        segmentation_size: annotation.segmentationSize || [0, 0],
        segmentation_counts: annotation.segmentationCounts || "",
        polygon: (annotation.polygon as MaskInfo) || {
          has_segmentation: false,
          polygons: [],
          bbox_polygon: [],
        },
        status: annotation.status as "PENDING" | "APPROVED" | "REJECTED",
        source_type: annotation.sourceType as "AUTO" | "USER",
        is_crowd: annotation.isCrowd || false,
        predicted_iou: annotation.predictedIou,
        stability_score: annotation.stabilityScore || 0,
        point_coords: annotation.pointCoords,
        category_id: annotation.categoryId,
        created_by: annotation.createdBy,
        image_id: annotation.imageId,
        created_at: annotation.createdAt,
        updated_at: annotation.updatedAt,
      })
    );
  }, [annotations]);

  if (!selectedImage) return null;

  return (
    <Box
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        style={{
          flex: 1,
          padding: theme.spacing.semantic.component.md,
          minHeight: "100vh",
        }}
      >
        <InteractiveAnnotationCanvas
          imageUrl={selectedImage.imageUrl}
          imageWidth={selectedImage.width}
          imageHeight={selectedImage.height}
          annotations={convertedAnnotations}
          selectedMaskIds={currentSelectedMasks}
          onMaskSelectionChange={handleMaskSelectionChange}
          onBboxComplete={handleBboxComplete}
        />
      </Box>
    </Box>
  );
}
