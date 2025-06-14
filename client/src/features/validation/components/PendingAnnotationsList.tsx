import { useState } from "react";
import { Box, Flex, Text, Button, Badge, Checkbox } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  CheckCircle,
  XCircle,
  Flag,
  Clock,
  User,
  Tag,
  Target,
  Polygon,
  CaretDown,
  CaretRight,
} from "phosphor-react";
import { PendingAnnotation, ValidationAction } from "../types/validation";
import { AnnotationType } from "@/features/annotation/types/workspace";

interface PendingAnnotationsListProps {
  pendingAnnotations: PendingAnnotation[];
  selectedAnnotations: Set<string>;
  activeAnnotationId: string | null;
  validatedAnnotations: ValidationAction[];
  onToggleSelection: (annotationId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSetActive: (annotationId: string | null) => void;
  onValidateSelected: (action: "approve" | "reject" | "flag", reason?: string) => void;
}

export function PendingAnnotationsList({
  pendingAnnotations,
  selectedAnnotations,
  activeAnnotationId,
  validatedAnnotations,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onSetActive,
  onValidateSelected,
}: PendingAnnotationsListProps) {
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<AnnotationType>>(
    new Set(["label", "bbox", "segmentation"])
  );
  const [reasonText, setReasonText] = useState("");

  // Group annotations by type
  const groupedAnnotations = pendingAnnotations.reduce(
    (groups, annotation) => {
      if (!groups[annotation.type]) {
        groups[annotation.type] = [];
      }
      groups[annotation.type].push(annotation);
      return groups;
    },
    {} as Record<AnnotationType, PendingAnnotation[]>
  );

  const getAnnotationIcon = (type: AnnotationType) => {
    switch (type) {
      case "label":
        return <Tag size={14} />;
      case "bbox":
        return <Target size={14} />;
      case "segmentation":
        return <Polygon size={14} />;
      default:
        return <Tag size={14} />;
    }
  };

  const getTypeColor = (type: AnnotationType) => {
    switch (type) {
      case "label":
        return theme.colors.status.info;
      case "bbox":
        return theme.colors.status.warning;
      case "segmentation":
        return theme.colors.status.success;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getValidationStatus = (annotationId: string) => {
    return validatedAnnotations.find(v => v.annotationId === annotationId);
  };

  const getAnnotationSummary = (annotation: PendingAnnotation) => {
    switch (annotation.type) {
      case "label":
        if (annotation.data.labels && annotation.data.labels.length > 0) {
          const labelTexts = annotation.data.labels.map(l => l.label).join(", ");
          return `${annotation.data.labels.length} labels: ${labelTexts}`;
        }
        return "Label annotation";
      case "bbox":
        if (annotation.data.boundingBoxes && annotation.data.boundingBoxes.length > 0) {
          const bboxLabels = annotation.data.boundingBoxes.map(b => b.label).join(", ");
          return `${annotation.data.boundingBoxes.length} boxes: ${bboxLabels}`;
        }
        return "Bounding box annotation";
      case "segmentation":
        if (annotation.data.polygons && annotation.data.polygons.length > 0) {
          const polygonLabels = annotation.data.polygons.map(p => p.label).join(", ");
          return `${annotation.data.polygons.length} regions: ${polygonLabels}`;
        }
        return "Segmentation annotation";
      default:
        return "Unknown annotation";
    }
  };

  const toggleGroupExpanded = (type: AnnotationType) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedGroups(newExpanded);
  };

  const allSelected =
    pendingAnnotations.length > 0 &&
    pendingAnnotations.every(annotation => selectedAnnotations.has(annotation.id));
  const someSelected = selectedAnnotations.size > 0;

  return (
    <Box
      style={{
        width: "300px",
        background: theme.colors.background.card,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
      }}
    >
      {/* Header with bulk actions */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          background: theme.colors.background.tertiary,
        }}
      >
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between">
            <Text
              size="3"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Pending Validations
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {pendingAnnotations.length} total
            </Text>
          </Flex>

          {/* Bulk selection */}
          <Flex align="center" gap="2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={checked => {
                if (checked) {
                  onSelectAll();
                } else {
                  onClearSelection();
                }
              }}
            />
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                flex: 1,
              }}
            >
              {selectedAnnotations.size > 0 ? `${selectedAnnotations.size} selected` : "Select all"}
            </Text>
          </Flex>

          {/* Bulk action buttons */}
          {selectedAnnotations.size > 0 && (
            <Flex gap="2">
              <Button
                onClick={() => onValidateSelected("approve")}
                style={{
                  background: theme.colors.status.success,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flex: 1,
                }}
              >
                <CheckCircle size={12} />
                Approve
              </Button>

              <Button
                onClick={() => onValidateSelected("reject", reasonText || "Quality insufficient")}
                style={{
                  background: theme.colors.status.error,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flex: 1,
                }}
              >
                <XCircle size={12} />
                Reject
              </Button>
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Annotations list */}
      <Box
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.semantic.component.sm,
        }}
      >
        {Object.entries(groupedAnnotations).map(([type, annotations]) => (
          <Box key={type} style={{ marginBottom: theme.spacing.semantic.component.md }}>
            {/* Group header */}
            <Button
              onClick={() => toggleGroupExpanded(type as AnnotationType)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                padding: `${theme.spacing.semantic.component.xs} 0`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              {expandedGroups.has(type as AnnotationType) ? (
                <CaretDown size={12} style={{ color: theme.colors.text.secondary }} />
              ) : (
                <CaretRight size={12} style={{ color: theme.colors.text.secondary }} />
              )}
              {getAnnotationIcon(type as AnnotationType)}
              <Text
                size="2"
                style={{
                  fontWeight: 600,
                  color: getTypeColor(type as AnnotationType),
                  textTransform: "capitalize",
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {type === "bbox"
                  ? "Bounding Boxes"
                  : type === "segmentation"
                    ? "Segmentation"
                    : "Labels"}
              </Text>
              <Badge
                style={{
                  background: `${getTypeColor(type as AnnotationType)}15`,
                  color: getTypeColor(type as AnnotationType),
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: theme.borders.radius.full,
                }}
              >
                {annotations.length}
              </Badge>
            </Button>

            {/* Annotations in group */}
            {expandedGroups.has(type as AnnotationType) && (
              <Box style={{ paddingLeft: theme.spacing.semantic.component.sm }}>
                {annotations.map(annotation => {
                  const validationStatus = getValidationStatus(annotation.id);
                  const isSelected = selectedAnnotations.has(annotation.id);
                  const isActive = activeAnnotationId === annotation.id;

                  return (
                    <Box
                      key={annotation.id}
                      onClick={() => onSetActive(isActive ? null : annotation.id)}
                      style={{
                        background: isActive
                          ? theme.colors.interactive.primary + "10"
                          : isSelected
                            ? theme.colors.background.secondary
                            : "transparent",
                        border: `1px solid ${
                          isActive ? theme.colors.interactive.primary + "40" : "transparent"
                        }`,
                        borderRadius: theme.borders.radius.sm,
                        padding: theme.spacing.semantic.component.xs,
                        marginBottom: theme.spacing.semantic.component.xs,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Flex align="start" gap="2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(annotation.id)}
                          onClick={e => e.stopPropagation()}
                        />

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Flex align="center" gap="2" style={{ marginBottom: "2px" }}>
                            <Text
                              size="2"
                              style={{
                                fontWeight: 500,
                                color: theme.colors.text.primary,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flex: 1,
                              }}
                            >
                              {getAnnotationSummary(annotation)}
                            </Text>

                            {validationStatus && (
                              <Box>
                                {validationStatus.action === "approve" && (
                                  <CheckCircle
                                    size={12}
                                    style={{ color: theme.colors.status.success }}
                                  />
                                )}
                                {validationStatus.action === "reject" && (
                                  <XCircle size={12} style={{ color: theme.colors.status.error }} />
                                )}
                                {validationStatus.action === "flag" && (
                                  <Flag size={12} style={{ color: theme.colors.status.warning }} />
                                )}
                              </Box>
                            )}
                          </Flex>

                          <Flex align="center" gap="2">
                            <User size={10} style={{ color: theme.colors.text.tertiary }} />
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.tertiary,
                                fontSize: "10px",
                              }}
                            >
                              {annotation.participantId}
                            </Text>
                            <Clock size={10} style={{ color: theme.colors.text.tertiary }} />
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.tertiary,
                                fontSize: "10px",
                              }}
                            >
                              {annotation.submittedAt.toLocaleDateString()}
                            </Text>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
