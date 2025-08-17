import React, { useMemo } from "react";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { SimpleSelectionUI, CategorySearchPanel } from "@/components/annotation";
import { useAnnotationWorkspacePageContext } from "@/contexts/AnnotationWorkspacePageContextProvider";
import { EntityList } from "./EntityList";
import type { Annotation, MaskInfo } from "@/components/annotation/types/annotation";
import type { Annotation as NewAnnotation } from "@/shared/api/endpoints/annotations";

export function WorkspaceSidebar() {
  const { theme } = useTheme();
  const { 
    annotations, 
    dataset, 
    currentSelectedMasks, 
    entities,
    selectedEntityId,
    handleCategorySelect,
    handleMaskSelectionChange 
  } = useAnnotationWorkspacePageContext();

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

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

  const handleClearSelection = () => {
    handleMaskSelectionChange([]);
  };

  const handleRemoveMask = (maskId: number) => {
    handleMaskSelectionChange(currentSelectedMasks.filter(id => id !== maskId));
  };

  return (
    <Box
      style={{
        width: "380px",
        background: theme.colors.background.card,
        borderLeft: `1px solid ${theme.colors.border.subtle}20`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Category Search Panel - Only visible when masks are selected but no entity is selected */}
      {currentSelectedMasks.length > 0 && !selectedEntityId && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            borderBottom: `1px solid ${theme.colors.border.subtle}20`,
            background: theme.colors.background.secondary,
          }}
        >
          <CategorySearchPanel
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedEntity?.category || null}
            placeholder="Search categories (e.g., desk, chair, table...)"
            dictionaryId={dataset?.dictionaryId || undefined}
          />
          <Text
            size="1"
            style={{
              color: theme.colors.interactive.accent,
              fontSize: "11px",
              marginTop: theme.spacing.semantic.component.xs,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            💡 Select a category to create a new entity
          </Text>
        </Box>
      )}

      {/* Simple Mask Selection UI - Below category search */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.subtle}20`,
          background: theme.colors.background.secondary,
        }}
      >
        <SimpleSelectionUI
          selectedMaskIds={currentSelectedMasks}
          annotations={convertedAnnotations}
          onClearSelection={handleClearSelection}
          onRemoveMask={handleRemoveMask}
        />
      </Box>

      {/* Entity List - All entity-related content at the bottom */}
      <EntityList />
    </Box>
  );
}
