import React from 'react';
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Stack, Image, Tag, Archive, CheckCircle } from "phosphor-react";
import { type AnnotationStackState, type AnnotationStackItem } from '../hooks/useAnnotationStack';

interface AnnotationStackViewerProps {
  stackState: AnnotationStackState;
  maxSize: number;
  onRemoveItem?: (itemId: string) => void;
  onClearStack?: () => void;
  isSaving?: boolean;
}

export function AnnotationStackViewer({ 
  stackState, 
  maxSize, 
  onRemoveItem, 
  onClearStack,
  isSaving = false 
}: AnnotationStackViewerProps) {
  const { theme } = useTheme();

  // 이미지별로 annotation을 그룹화
  const groupedByImage = React.useMemo(() => {
    const groups = stackState.items.reduce((acc, item) => {
      const imageId = item.imageData.id;
      if (!acc[imageId]) {
        acc[imageId] = {
          imageData: item.imageData,
          labels: [],
          bboxes: [],
        };
      }

      if (item.type === 'label') {
        acc[imageId].labels.push(item);
      } else if (item.type === 'bbox') {
        acc[imageId].bboxes.push(item);
      }

      return acc;
    }, {} as Record<string, {
      imageData: any;
      labels: AnnotationStackItem[];
      bboxes: AnnotationStackItem[];
    }>);

    return Object.values(groups);
  }, [stackState.items]);

  if (!stackState.hasItems) {
    return (
      <Box
        style={{
          padding: theme.spacing.semantic.component.sm,
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
          border: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
          <Archive size={14} style={{ color: theme.colors.text.tertiary }} />
          <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            Annotation Stack
          </Text>
        </Flex>
        <Text size="1" style={{ color: theme.colors.text.tertiary }}>
          No annotations in stack
        </Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        padding: theme.spacing.semantic.component.sm,
        background: theme.colors.background.secondary,
        borderRadius: theme.borders.radius.md,
        border: `1px solid ${stackState.isFull ? theme.colors.status.error : theme.colors.border.primary}`,
        maxHeight: "200px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Flex align="center" justify="between" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
        <Flex align="center" gap="2">
          <Stack size={14} style={{ color: stackState.isFull ? theme.colors.status.error : theme.colors.text.secondary }} />
          <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            Stack ({stackState.count}/{maxSize})
          </Text>
        </Flex>
        
        {stackState.hasItems && !isSaving && (
          <button
            onClick={onClearStack}
            style={{
              background: "transparent",
              border: "none",
              color: theme.colors.text.tertiary,
              fontSize: "10px",
              cursor: "pointer",
              padding: "2px 4px",
              borderRadius: theme.borders.radius.sm,
              textDecoration: "underline",
            }}
            title="Clear all annotations from stack"
          >
            Clear
          </button>
        )}
      </Flex>

      {/* Progress Bar */}
      <Box
        style={{
          height: "3px",
          background: theme.colors.background.primary,
          borderRadius: "2px",
          overflow: "hidden",
          marginBottom: theme.spacing.semantic.component.sm,
        }}
      >
        <Box
          style={{
            height: "100%",
            width: `${(stackState.count / maxSize) * 100}%`,
            background: stackState.isFull 
              ? theme.colors.status.error 
              : stackState.count > maxSize * 0.8 
                ? theme.colors.status.warning
                : theme.colors.status.success,
            transition: "width 0.3s ease, background-color 0.3s ease",
          }}
        />
      </Box>

      {/* Status Message */}
      {stackState.isFull && (
        <Box
          style={{
            padding: "4px 6px",
            background: `${theme.colors.status.error}15`,
            borderRadius: theme.borders.radius.sm,
            marginBottom: theme.spacing.semantic.component.xs,
          }}
        >
          <Text size="1" style={{ color: theme.colors.status.error, fontWeight: 600 }}>
            Stack Full! Save to continue annotating
          </Text>
        </Box>
      )}

      {isSaving && (
        <Box
          style={{
            padding: "4px 6px",
            background: `${theme.colors.status.info}15`,
            borderRadius: theme.borders.radius.sm,
            marginBottom: theme.spacing.semantic.component.xs,
          }}
        >
          <Flex align="center" gap="2">
            <CheckCircle size={12} style={{ color: theme.colors.status.info }} />
            <Text size="1" style={{ color: theme.colors.status.info, fontWeight: 600 }}>
              Saving to blockchain...
            </Text>
          </Flex>
        </Box>
      )}

      {/* Grouped Annotations */}
      <Box
        style={{
          maxHeight: "120px",
          overflow: "auto",
          scrollbarWidth: "thin",
        }}
      >
        {groupedByImage.map((group, index) => (
          <Box
            key={group.imageData.id}
            style={{
              padding: "6px 8px",
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.sm,
              border: `1px solid ${theme.colors.border.primary}`,
              marginBottom: index < groupedByImage.length - 1 ? "4px" : "0",
            }}
          >
            {/* Image Info */}
            <Flex align="center" gap="2" style={{ marginBottom: "4px" }}>
              <Image size={12} style={{ color: theme.colors.text.secondary }} />
              <Text 
                size="1" 
                style={{ 
                  color: theme.colors.text.primary, 
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "120px",
                }}
                title={group.imageData.filename || group.imageData.id}
              >
                {group.imageData.filename || `Image ${index + 1}`}
              </Text>
            </Flex>

            {/* Annotation Counts */}
            <Flex gap="1" wrap="wrap">
              {group.labels.length > 0 && (
                <Box
                  style={{
                    padding: "1px 4px",
                    background: `${theme.colors.status.info}20`,
                    borderRadius: theme.borders.radius.sm,
                    border: `1px solid ${theme.colors.status.info}40`,
                  }}
                >
                  <Text size="1" style={{ color: theme.colors.status.info, fontWeight: 600 }}>
                    {group.labels.length}L
                  </Text>
                </Box>
              )}
              
              {group.bboxes.length > 0 && (
                <Box
                  style={{
                    padding: "1px 4px",
                    background: `${theme.colors.status.warning}20`,
                    borderRadius: theme.borders.radius.sm,
                    border: `1px solid ${theme.colors.status.warning}40`,
                  }}
                >
                  <Text size="1" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
                    {group.bboxes.length}B
                  </Text>
                </Box>
              )}
            </Flex>

            {/* Recent Annotations Preview */}
            {(group.labels.length > 0 || group.bboxes.length > 0) && (
              <Box style={{ marginTop: "4px" }}>
                <Flex gap="1" wrap="wrap">
                  {/* Show latest 2 labels */}
                  {group.labels.slice(-2).map((item) => (
                    <Box
                      key={item.id}
                      style={{
                        padding: "1px 3px",
                        background: theme.colors.background.primary,
                        borderRadius: theme.borders.radius.sm,
                        maxWidth: "40px",
                      }}
                    >
                      <Text 
                        size="1" 
                        style={{ 
                          color: theme.colors.text.tertiary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={item.annotation.label}
                      >
                        {item.annotation.label}
                      </Text>
                    </Box>
                  ))}
                  
                  {/* Show if more annotations exist */}
                  {(group.labels.length + group.bboxes.length) > 2 && (
                    <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                      +{group.labels.length + group.bboxes.length - 2}
                    </Text>
                  )}
                </Flex>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
} 