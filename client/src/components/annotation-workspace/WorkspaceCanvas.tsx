import React, { useMemo } from 'react';
import { Box } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { InteractiveAnnotationCanvas } from '@/components/annotation';
import { useImagesContext } from '@/contexts/data/ImagesContext';
import { useAnnotations } from '@/contexts/data/AnnotationsContext';
import { useAnnotationWorkspace } from '@/contexts/page/AnnotationWorkspaceContext';
import type { Annotation, MaskInfo } from '@/components/annotation/types/annotation';
import type { AnnotationRead } from '@/shared/api/generated/models';

export function WorkspaceCanvas() {
  const { theme } = useTheme();
  const { selectedImage } = useImagesContext();
  const { annotations } = useAnnotations();
  const { 
    currentSelectedMasks,
    handleMaskSelectionChange,
    handleBboxComplete
  } = useAnnotationWorkspace();

  // Convert AnnotationRead to Annotation format
  const convertedAnnotations = useMemo(() => {
    return annotations.map((annotation: AnnotationRead): Annotation => ({
      ...annotation,
      bbox: annotation.bbox.length >= 4 
        ? [annotation.bbox[0], annotation.bbox[1], annotation.bbox[2], annotation.bbox[3]] as [number, number, number, number]
        : [0, 0, 0, 0] as [number, number, number, number],
      segmentation_size: annotation.segmentation_size 
        ? [annotation.segmentation_size[0] || 0, annotation.segmentation_size[1] || 0] as [number, number]
        : [0, 0] as [number, number],
      segmentation_counts: annotation.segmentation_counts || '',
      polygon: annotation.polygon as MaskInfo || { has_segmentation: false, polygons: [], bbox_polygon: [] },
      status: annotation.status as "PENDING" | "APPROVED" | "REJECTED",
      source_type: annotation.source_type as "AUTO" | "USER",
      is_crowd: annotation.is_crowd || false,
      predicted_iou: annotation.predicted_iou,
      stability_score: annotation.stability_score || 0,
      point_coords: annotation.point_coords,
      category_id: annotation.category_id,
      created_by: annotation.created_by,
    }));
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
          imageUrl={selectedImage.image_url}
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