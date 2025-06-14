import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Target, Trash, Stack, Archive, CheckCircle, Image } from "phosphor-react";
import { AnnotationType, AnnotationData } from "../types/workspace";
import { AnnotationItem } from "./AnnotationItem";
import { type AnnotationStackState } from "../hooks/useAnnotationStack";

interface AnnotationListPanelProps {
  annotations: AnnotationData;
  onDeleteAnnotation: (type: AnnotationType, id: string) => void;
  onClearAll: () => void;
  // Stack integration props
  stackState?: AnnotationStackState;
  maxStackSize?: number;
  onClearStack?: () => void;
  isSaving?: boolean;
  // Current image info for stack display
  currentImageIndex?: number;
  totalImages?: number;
}

export function AnnotationListPanel({
  annotations,
  onDeleteAnnotation,
  onClearAll,
  stackState,
  maxStackSize = 30,
  onClearStack,
  isSaving = false,
  currentImageIndex = 0,
  totalImages = 0,
}: AnnotationListPanelProps) {
  const { theme } = useTheme();

  const totalAnnotations =
    (annotations.labels?.length || 0) +
    (annotations.boundingBoxes?.length || 0) +
    (annotations.polygons?.length || 0);

  // Group stack items by image (avoiding filename exposure)
  const groupedStackItems = stackState?.items.reduce(
    (acc, item) => {
      const imageId = item.imageData.id;
      if (!acc[imageId]) {
        acc[imageId] = {
          imageId,
          labels: [],
          bboxes: [],
        };
      }

      if (item.type === "label") {
        acc[imageId].labels.push(item);
      } else if (item.type === "bbox") {
        acc[imageId].bboxes.push(item);
      }

      return acc;
    },
    {} as Record<string, { imageId: string; labels: any[]; bboxes: any[] }>
  ) || {};

  const stackGroups = Object.values(groupedStackItems);

  return (
    <Box
      style={{
        width: "240px", // Back to original width
        background: theme.colors.background.card,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with Stack Info */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.sm,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex align="center" justify="between" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
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

        {/* Stack Status */}
        {stackState && (
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <Stack
                size={12}
                style={{
                  color: stackState.isFull ? theme.colors.status.error : theme.colors.text.secondary,
                }}
              />
              <Text size="1" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
                Stack ({stackState.count}/{maxStackSize})
              </Text>
            </Flex>

            {stackState.hasItems && !isSaving && onClearStack && (
              <button
                onClick={onClearStack}
                style={{
                  background: "transparent",
                  border: "none",
                  color: theme.colors.text.tertiary,
                  fontSize: "9px",
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: theme.borders.radius.sm,
                  textDecoration: "underline",
                }}
              >
                Clear Stack
              </button>
            )}
          </Flex>
        )}

        {/* Stack Progress Bar */}
        {stackState && (
          <Box
            style={{
              height: "3px",
              background: theme.colors.background.primary,
              borderRadius: "2px",
              overflow: "hidden",
              marginTop: theme.spacing.semantic.component.xs,
            }}
          >
            <Box
              style={{
                height: "100%",
                width: `${(stackState.count / maxStackSize) * 100}%`,
                background: stackState.isFull
                  ? theme.colors.status.error
                  : stackState.count > maxStackSize * 0.8
                    ? theme.colors.status.warning
                    : theme.colors.status.success,
                transition: "width 0.3s ease, background-color 0.3s ease",
              }}
            />
          </Box>
        )}

        {/* Stack Full Warning */}
        {stackState?.isFull && (
          <Box
            style={{
              padding: "4px 6px",
              background: `${theme.colors.status.error}15`,
              borderRadius: theme.borders.radius.sm,
              marginTop: theme.spacing.semantic.component.xs,
            }}
          >
            <Text size="1" style={{ color: theme.colors.status.error, fontWeight: 600 }}>
              Stack Full! Save to continue
            </Text>
          </Box>
        )}

        {/* Saving Status */}
        {isSaving && (
          <Box
            style={{
              padding: "4px 6px",
              background: `${theme.colors.status.info}15`,
              borderRadius: theme.borders.radius.sm,
              marginTop: theme.spacing.semantic.component.xs,
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
      </Box>

      {/* Annotations List */}
      <Box
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.semantic.component.sm,
        }}
      >
        {/* Current Image Annotations */}
        {totalAnnotations === 0 && stackGroups.length === 0 ? (
          <Box
            style={{
              textAlign: "center",
              padding: theme.spacing.semantic.component.md,
            }}
          >
            <Target
              size={24}
              style={{
                color: theme.colors.text.tertiary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            />
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
          <Flex direction="column" gap="2">
            {/* Current Image Section */}
            {totalAnnotations > 0 && (
              <Box>
                <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
                  <Image size={12} style={{ color: theme.colors.interactive.primary }} />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.interactive.primary,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Current Image ({currentImageIndex + 1}/{totalImages})
                  </Text>
                </Flex>
                
                <Box
                  style={{
                    padding: theme.spacing.semantic.component.xs,
                    background: theme.colors.background.secondary,
                    borderRadius: theme.borders.radius.sm,
                    border: `1px solid ${theme.colors.border.primary}`,
                  }}
                >
                  <Flex direction="column" gap="1">
                    {/* Current Image Labels */}
                    {annotations.labels?.map(label => (
                      <AnnotationItem
                        key={label.id}
                        type="label"
                        data={label}
                        onDelete={onDeleteAnnotation}
                      />
                    ))}

                    {/* Current Image Bounding Boxes */}
                    {annotations.boundingBoxes?.map(bbox => (
                      <AnnotationItem key={bbox.id} type="bbox" data={bbox} onDelete={onDeleteAnnotation} />
                    ))}

                    {/* Current Image Polygons */}
                    {annotations.polygons?.map(polygon => (
                      <AnnotationItem
                        key={polygon.id}
                        type="segmentation"
                        data={polygon}
                        onDelete={onDeleteAnnotation}
                      />
                    ))}
                  </Flex>
                </Box>
              </Box>
            )}

            {/* Stack Section - Compact Style */}
            {stackGroups.length > 0 && (
              <Box>
                <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
                  <Archive size={12} style={{ color: theme.colors.status.success }} />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.status.success,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Saved ({stackState?.count || 0})
                  </Text>
                </Flex>

                <Box
                  style={{
                    maxHeight: "300px", // Increased height for better scrolling
                    overflow: "auto",
                    scrollbarWidth: "thin",
                  }}
                >
                  <Flex direction="column" gap="1">
                    {stackGroups.map((group, index) => (
                      <Box
                        key={group.imageId}
                        style={{
                          padding: "4px 6px", // Reduced padding
                          background: theme.colors.background.secondary,
                          borderRadius: theme.borders.radius.sm,
                          border: `1px solid ${theme.colors.border.primary}`,
                        }}
                      >
                        {/* Compact Image Info */}
                        <Flex align="center" justify="between">
                          <Flex align="center" gap="1">
                            <Image size={10} style={{ color: theme.colors.text.secondary }} />
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.primary,
                                fontWeight: 500,
                                fontSize: "11px",
                              }}
                            >
                              #{index + 1}
                            </Text>
                          </Flex>

                          {/* Compact Annotation Counts */}
                          <Flex gap="1">
                            {group.labels.length > 0 && (
                              <Text size="1" style={{ 
                                color: theme.colors.status.info, 
                                fontWeight: 600,
                                fontSize: "10px",
                              }}>
                                {group.labels.length}L
                              </Text>
                            )}
                            {group.bboxes.length > 0 && (
                              <Text size="1" style={{ 
                                color: theme.colors.status.warning, 
                                fontWeight: 600,
                                fontSize: "10px",
                              }}>
                                {group.bboxes.length}B
                              </Text>
                            )}
                          </Flex>
                        </Flex>

                        {/* Latest annotation preview - single line */}
                        {group.labels.length > 0 && (
                          <Text
                            size="1"
                            style={{
                              color: theme.colors.text.tertiary,
                              fontSize: "10px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              marginTop: "2px",
                            }}
                          >
                            {group.labels[group.labels.length - 1]?.annotation.label}
                            {group.labels.length + group.bboxes.length > 1 && ` +${group.labels.length + group.bboxes.length - 1}`}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </Flex>
                </Box>
              </Box>
            )}
          </Flex>
        )}
      </Box>

      {/* Actions */}
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
            Clear Current
          </Button>
        </Box>
      )}
    </Box>
  );
}
