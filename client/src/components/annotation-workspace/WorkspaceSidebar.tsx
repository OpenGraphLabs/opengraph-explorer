import React, { useMemo } from 'react';
import { Box, Text } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { SimpleSelectionUI, CategorySearchPanel } from '@/components/annotation';
import { useAnnotations } from '@/contexts/data/AnnotationsContext';
import { useDatasets } from '@/contexts/data/DatasetsContext';
import { useAnnotationWorkspace } from '@/contexts/page/AnnotationWorkspaceContext';
import { EntityList } from './EntityList';
import type { Annotation, MaskInfo } from '@/components/annotation/types/annotation';
import type { AnnotationRead } from '@/shared/api/generated/models';

export function WorkspaceSidebar() {
  const { theme } = useTheme();
  const { annotations } = useAnnotations();
  const { dataset } = useDatasets();
  const {
    currentSelectedMasks,
    entities,
    selectedEntityId,
    handleCategorySelect,
    handleMaskSelectionChange,
  } = useAnnotationWorkspace();

  const selectedEntity = entities.find(e => e.id === selectedEntityId);

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
      {/* Simple Mask Selection UI */}
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

      {/* Category Search Panel */}
      {currentSelectedMasks.length > 0 && (
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
            dictionaryId={dataset?.dictionary_id || undefined}
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

      {/* Entity List */}
      <EntityList />
    </Box>
  );
}