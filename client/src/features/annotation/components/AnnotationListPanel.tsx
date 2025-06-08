import React from 'react';
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Target, Trash } from "phosphor-react";
import { AnnotationType, AnnotationData } from '../types/workspace';
import { AnnotationItem } from './AnnotationItem';

interface AnnotationListPanelProps {
  annotations: AnnotationData;
  onDeleteAnnotation: (type: AnnotationType, id: string) => void;
  onClearAll: () => void;
}

export function AnnotationListPanel({ annotations, onDeleteAnnotation, onClearAll }: AnnotationListPanelProps) {
  const { theme } = useTheme();

  const totalAnnotations = annotations.labels.length + annotations.boundingBoxes.length + annotations.polygons.length;

  return (
    <Box
      style={{
        width: "240px",
        background: theme.colors.background.card,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Compact Header */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.sm,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex align="center" justify="between">
          <Text
            as="p"
            size="2"
            style={{
              fontWeight: 700,
              color: theme.colors.text.primary,
            }}
          >
            Annotations
          </Text>
          <Badge
            style={{
              background: `${theme.colors.interactive.primary}15`,
              color: theme.colors.interactive.primary,
              border: `1px solid ${theme.colors.interactive.primary}30`,
              padding: "1px 4px",
              borderRadius: theme.borders.radius.full,
              fontSize: "10px",
              fontWeight: 600,
            }}
          >
            {totalAnnotations}
          </Badge>
        </Flex>
      </Box>

      {/* Annotations List */}
      <Box
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.semantic.component.sm,
        }}
      >
        {totalAnnotations === 0 ? (
          <Box
            style={{
              textAlign: "center",
              padding: theme.spacing.semantic.component.md,
            }}
          >
            <Target size={24} style={{ color: theme.colors.text.tertiary, marginBottom: theme.spacing.semantic.component.sm }} />
            <Text
              as="p"
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.tertiary,
                marginBottom: "4px",
              }}
            >
              No annotations
            </Text>
            <Text
              as="p"
              size="1"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.3,
              }}
            >
              Select a tool and start annotating
            </Text>
          </Box>
        ) : (
          <Flex direction="column" gap="1">
            {/* Labels */}
            {annotations.labels.map((label) => (
              <AnnotationItem
                key={label.id}
                type="label"
                data={label}
                onDelete={onDeleteAnnotation}
              />
            ))}

            {/* Bounding Boxes */}
            {annotations.boundingBoxes.map((bbox) => (
              <AnnotationItem
                key={bbox.id}
                type="bbox"
                data={bbox}
                onDelete={onDeleteAnnotation}
              />
            ))}

            {/* Polygons */}
            {annotations.polygons.map((polygon) => (
              <AnnotationItem
                key={polygon.id}
                type="segmentation"
                data={polygon}
                onDelete={onDeleteAnnotation}
              />
            ))}
          </Flex>
        )}
      </Box>

      {/* Compact Actions */}
      {totalAnnotations > 0 && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.sm,
            borderTop: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Button
            onClick={onClearAll}
            style={{
              width: "100%",
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              background: "transparent",
              color: theme.colors.status.error,
              border: `1px solid ${theme.colors.status.error}`,
              borderRadius: theme.borders.radius.md,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.semantic.component.xs,
              fontSize: "12px",
            }}
          >
            <Trash size={12} />
            Clear All
          </Button>
        </Box>
      )}
    </Box>
  );
} 