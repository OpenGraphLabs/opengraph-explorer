import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Target, Trash, Stack, Archive, CheckCircle, Image, Tag } from "phosphor-react";
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

  // Process stack items for display (1 annotation per image) - latest first
  const stackItems =
    stackState?.items
      .slice()
      .reverse()
      .map((item, index) => ({
        ...item,
        displayIndex: stackState.items.length - index, // Show original order in display
      })) || [];

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
        <Flex
          align="center"
          justify="between"
          style={{ marginBottom: theme.spacing.semantic.component.xs }}
        >
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
                  color: stackState.isFull
                    ? theme.colors.status.error
                    : theme.colors.text.secondary,
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
        {totalAnnotations === 0 && stackItems.length === 0 ? (
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
          <Flex direction="column" gap="3">
            {/* Current Image Section */}
            {totalAnnotations > 0 && (
              <Box>
                <Flex
                  align="center"
                  gap="2"
                  style={{ marginBottom: theme.spacing.semantic.component.xs }}
                >
                  <Box
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: theme.colors.interactive.primary,
                    }}
                  />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.interactive.primary,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Current ({currentImageIndex + 1}/{totalImages})
                  </Text>
                </Flex>

                <Box
                  style={{
                    padding: theme.spacing.semantic.component.xs,
                    background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.primary}04)`,
                    borderRadius: theme.borders.radius.md,
                    border: `1px solid ${theme.colors.interactive.primary}20`,
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
                      <AnnotationItem
                        key={bbox.id}
                        type="bbox"
                        data={bbox}
                        onDelete={onDeleteAnnotation}
                      />
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

            {/* Saved Annotations Stack */}
            {stackItems.length > 0 && (
              <Box>
                <Flex
                  align="center"
                  gap="2"
                  style={{ marginBottom: theme.spacing.semantic.component.xs }}
                >
                  <Box
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: theme.colors.status.success,
                    }}
                  />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.status.success,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Saved ({stackItems.length})
                  </Text>
                </Flex>

                <Box
                  style={{
                    maxHeight: "400px",
                    overflow: "auto",
                    scrollbarWidth: "thin",
                  }}
                >
                  <Flex direction="column" gap="2">
                    {stackItems.map(item => {
                      const getAnnotationIcon = () => {
                        switch (item.type) {
                          case "label":
                            return <Tag size={14} style={{ color: theme.colors.status.info }} />;
                          case "bbox":
                            return (
                              <Target size={14} style={{ color: theme.colors.status.warning }} />
                            );
                          default:
                            return <Tag size={14} style={{ color: theme.colors.text.secondary }} />;
                        }
                      };

                      const getAnnotationColor = () => {
                        switch (item.type) {
                          case "label":
                            return theme.colors.status.info;
                          case "bbox":
                            return theme.colors.status.warning;
                          default:
                            return theme.colors.text.secondary;
                        }
                      };

                      const getAnnotationContent = () => {
                        if (item.type === "label") {
                          return item.annotation.label;
                        } else if (item.type === "bbox") {
                          const bbox = item.annotation as any;
                          return `${bbox.label} (${Math.round(bbox.width)}×${Math.round(bbox.height)})`;
                        }
                        return "Unknown";
                      };

                      return (
                        <Box
                          key={item.id}
                          style={{
                            padding: "8px 12px",
                            background: theme.colors.background.card,
                            borderRadius: theme.borders.radius.md,
                            border: `1px solid ${getAnnotationColor()}20`,
                            boxShadow: `0 1px 3px ${theme.colors.background.primary}40`,
                            transition: "all 0.2s ease",
                          }}
                        >
                          <Flex align="center" gap="3">
                            {/* Image indicator */}
                            <Flex align="center" gap="2">
                              <Box
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: theme.borders.radius.sm,
                                  background: `${theme.colors.text.secondary}10`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  border: `1px solid ${theme.colors.text.secondary}20`,
                                }}
                              >
                                <Text
                                  size="1"
                                  style={{
                                    color: theme.colors.text.secondary,
                                    fontWeight: 600,
                                    fontSize: "9px",
                                  }}
                                >
                                  {item.displayIndex}
                                </Text>
                              </Box>
                            </Flex>

                            {/* Annotation content */}
                            <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                              <Flex align="center" gap="2" style={{ marginBottom: "2px" }}>
                                {getAnnotationIcon()}
                                <Text
                                  size="1"
                                  style={{
                                    color: getAnnotationColor(),
                                    fontWeight: 600,
                                    fontSize: "10px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {item.type === "bbox" ? "bbox" : item.type}
                                </Text>
                              </Flex>

                              <Text
                                size="2"
                                style={{
                                  color: theme.colors.text.primary,
                                  fontWeight: 500,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  lineHeight: 1.3,
                                }}
                              >
                                {getAnnotationContent()}
                              </Text>
                            </Flex>

                            {/* Visual indicator */}
                            <Box
                              style={{
                                width: "3px",
                                height: "24px",
                                borderRadius: "2px",
                                background: getAnnotationColor(),
                                opacity: 0.6,
                              }}
                            />
                          </Flex>
                        </Box>
                      );
                    })}
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
