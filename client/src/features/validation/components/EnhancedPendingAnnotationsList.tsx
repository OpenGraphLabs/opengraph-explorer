import { useState, useMemo } from "react";
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
  Star,
  Warning,
  ShieldCheck,
  TrendUp,
  Sparkle,
} from "phosphor-react";
import { PendingAnnotation, ValidationAction } from "../types/validation";
import { AnnotationType } from "@/features/annotation/types/workspace";
import { ChallengePhase } from "@/features/challenge";

interface EnhancedPendingAnnotationsListProps {
  pendingAnnotations: PendingAnnotation[];
  selectedAnnotations: Set<string>;
  activeAnnotationId: string | null;
  validatedAnnotations: ValidationAction[];
  onToggleSelection: (annotationId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSetActive: (annotationId: string | null) => void;
  onValidateSelected: (action: "approve" | "reject" | "flag", reason?: string) => void;
  currentPhase: ChallengePhase;
}

type SortBy = "timestamp" | "quality" | "participant" | "type";
type FilterBy = "all" | "high-quality" | "needs-review" | "flagged";

export function EnhancedPendingAnnotationsList({
  pendingAnnotations,
  selectedAnnotations,
  activeAnnotationId,
  validatedAnnotations,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onSetActive,
  onValidateSelected,
  currentPhase,
}: EnhancedPendingAnnotationsListProps) {
  const { theme } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Set<AnnotationType>>(
    new Set(["label", "bbox", "segmentation"])
  );
  const [reasonText, setReasonText] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("quality");
  const [filterBy, setFilterBy] = useState<FilterBy>("all");
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Enhanced filtering and sorting
  const filteredAndSortedAnnotations = useMemo(() => {
    let filtered = [...pendingAnnotations];

    // Apply filters
    switch (filterBy) {
      case "high-quality":
        filtered = filtered.filter(a => a.qualityScore >= 0.8);
        break;
      case "needs-review":
        filtered = filtered.filter(a => a.qualityScore < 0.6 || a.validationCount === 0);
        break;
      case "flagged":
        filtered = filtered.filter(a =>
          validatedAnnotations.some(v => v.annotationId === a.id && v.action === "flag")
        );
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case "quality":
        filtered.sort((a, b) => b.qualityScore - a.qualityScore);
        break;
      case "timestamp":
        filtered.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
        break;
      case "participant":
        filtered.sort((a, b) => a.participantId.localeCompare(b.participantId));
        break;
      case "type":
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    return filtered;
  }, [pendingAnnotations, filterBy, sortBy, validatedAnnotations]);

  // Group annotations by type
  const groupedAnnotations = useMemo(() => {
    return filteredAndSortedAnnotations.reduce(
      (groups, annotation) => {
        if (!groups[annotation.type]) {
          groups[annotation.type] = [];
        }
        groups[annotation.type].push(annotation);
        return groups;
      },
      {} as Record<AnnotationType, PendingAnnotation[]>
    );
  }, [filteredAndSortedAnnotations]);

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

  const getQualityIndicator = (score: number) => {
    if (score >= 0.9)
      return { icon: <Sparkle size={12} />, color: theme.colors.status.success, text: "Excellent" };
    if (score >= 0.7)
      return { icon: <Star size={12} />, color: theme.colors.interactive.primary, text: "Good" };
    if (score >= 0.5)
      return { icon: <Warning size={12} />, color: theme.colors.status.warning, text: "Review" };
    return { icon: <Flag size={12} />, color: theme.colors.status.error, text: "Poor" };
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
    filteredAndSortedAnnotations.length > 0 &&
    filteredAndSortedAnnotations.every(annotation => selectedAnnotations.has(annotation.id));
  const someSelected = selectedAnnotations.size > 0;

  return (
    <Box
      style={{
        width: "350px",
        background: theme.colors.background.card,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
      }}
    >
      {/* Enhanced Header */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          background: `linear-gradient(135deg, ${theme.colors.background.tertiary}, ${theme.colors.background.card})`,
        }}
      >
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between">
            <Text
              size="3"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <ShieldCheck size={16} style={{ color: theme.colors.interactive.primary }} />
              Pending Review
            </Text>
            <Flex align="center" gap="2">
              <Badge
                style={{
                  background: `${theme.colors.interactive.primary}15`,
                  color: theme.colors.interactive.primary,
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: theme.borders.radius.full,
                  border: `1px solid ${theme.colors.interactive.primary}30`,
                }}
              >
                {filteredAndSortedAnnotations.length}
              </Badge>
            </Flex>
          </Flex>

          {/* Filter and Sort Controls */}
          <Flex gap="2">
            <Box style={{ flex: 1 }}>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontWeight: 500,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Filter
              </Text>
              <select
                value={filterBy}
                onChange={e => setFilterBy(e.target.value as FilterBy)}
                style={{
                  width: "100%",
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  background: theme.colors.background.primary,
                  color: theme.colors.text.primary,
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                <option value="all">All Annotations</option>
                <option value="high-quality">High Quality</option>
                <option value="needs-review">Needs Review</option>
                <option value="flagged">Flagged</option>
              </select>
            </Box>

            <Box style={{ flex: 1 }}>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontWeight: 500,
                  marginBottom: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Sort
              </Text>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortBy)}
                style={{
                  width: "100%",
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  background: theme.colors.background.primary,
                  color: theme.colors.text.primary,
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                <option value="quality">Quality Score</option>
                <option value="timestamp">Newest First</option>
                <option value="participant">Participant</option>
                <option value="type">Annotation Type</option>
              </select>
            </Box>
          </Flex>

          {/* Bulk Selection */}
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

            {selectedAnnotations.size > 0 && (
              <Button
                onClick={() => setShowBulkActions(!showBulkActions)}
                style={{
                  background: showBulkActions ? theme.colors.interactive.primary : "transparent",
                  color: showBulkActions ? theme.colors.text.inverse : theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Actions
              </Button>
            )}
          </Flex>

          {/* Enhanced Bulk Action Buttons */}
          {showBulkActions && selectedAnnotations.size > 0 && (
            <Flex direction="column" gap="2">
              <Flex gap="2">
                <Button
                  onClick={() => {
                    onValidateSelected("approve");
                    setShowBulkActions(false);
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.status.success}E0)`,
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
                    boxShadow: "0 2px 4px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  <CheckCircle size={12} weight="fill" />
                  Approve
                </Button>

                <Button
                  onClick={() => {
                    onValidateSelected("reject", reasonText || "Quality insufficient");
                    setShowBulkActions(false);
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.status.error}, ${theme.colors.status.error}E0)`,
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
                    boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)",
                  }}
                >
                  <XCircle size={12} weight="fill" />
                  Reject
                </Button>

                <Button
                  onClick={() => {
                    onValidateSelected("flag", "Marked for further review");
                    setShowBulkActions(false);
                  }}
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.status.warning}, ${theme.colors.status.warning}E0)`,
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
                    boxShadow: "0 2px 4px rgba(245, 158, 11, 0.3)",
                  }}
                >
                  <Flag size={12} weight="fill" />
                  Flag
                </Button>
              </Flex>

              {/* Quick reason input */}
              <input
                type="text"
                placeholder="Optional rejection reason..."
                value={reasonText}
                onChange={e => setReasonText(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  background: theme.colors.background.primary,
                  color: theme.colors.text.primary,
                  fontSize: "11px",
                  outline: "none",
                }}
              />
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Enhanced Annotations List */}
      <Box
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.semantic.component.sm,
        }}
      >
        {Object.entries(groupedAnnotations).map(([type, annotations]) => (
          <Box key={type} style={{ marginBottom: theme.spacing.semantic.component.md }}>
            {/* Enhanced Group Header */}
            <Button
              onClick={() => toggleGroupExpanded(type as AnnotationType)}
              style={{
                width: "100%",
                background: `linear-gradient(135deg, ${getTypeColor(type as AnnotationType)}10, ${getTypeColor(type as AnnotationType)}05)`,
                border: `1px solid ${getTypeColor(type as AnnotationType)}20`,
                borderRadius: theme.borders.radius.sm,
                padding: theme.spacing.semantic.component.sm,
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
              <Box style={{ color: getTypeColor(type as AnnotationType) }}>
                {getAnnotationIcon(type as AnnotationType)}
              </Box>
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
                  background: `${getTypeColor(type as AnnotationType)}20`,
                  color: getTypeColor(type as AnnotationType),
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: theme.borders.radius.full,
                  border: `1px solid ${getTypeColor(type as AnnotationType)}30`,
                }}
              >
                {annotations.length}
              </Badge>
            </Button>

            {/* Enhanced Annotations in Group */}
            {expandedGroups.has(type as AnnotationType) && (
              <Box style={{ paddingLeft: theme.spacing.semantic.component.sm }}>
                {annotations.map(annotation => {
                  const validationStatus = getValidationStatus(annotation.id);
                  const isSelected = selectedAnnotations.has(annotation.id);
                  const isActive = activeAnnotationId === annotation.id;
                  const quality = getQualityIndicator(annotation.qualityScore);

                  return (
                    <Box
                      key={annotation.id}
                      onClick={() => onSetActive(isActive ? null : annotation.id)}
                      style={{
                        background: isActive
                          ? `linear-gradient(135deg, ${theme.colors.interactive.primary}15, ${theme.colors.interactive.primary}08)`
                          : isSelected
                            ? theme.colors.background.secondary
                            : "transparent",
                        border: `2px solid ${
                          isActive
                            ? theme.colors.interactive.primary + "60"
                            : validationStatus?.action === "approve"
                              ? theme.colors.status.success + "40"
                              : validationStatus?.action === "reject"
                                ? theme.colors.status.error + "40"
                                : validationStatus?.action === "flag"
                                  ? theme.colors.status.warning + "40"
                                  : "transparent"
                        }`,
                        borderRadius: theme.borders.radius.md,
                        padding: theme.spacing.semantic.component.sm,
                        marginBottom: theme.spacing.semantic.component.xs,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      {/* Quality gradient background */}
                      <Box
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: `${annotation.qualityScore * 100}%`,
                          height: "2px",
                          background: `linear-gradient(90deg, ${quality.color}, ${quality.color}80)`,
                          borderRadius: "1px",
                        }}
                      />

                      <Flex align="start" gap="2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(annotation.id)}
                          onClick={e => e.stopPropagation()}
                        />

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Flex align="center" gap="2" style={{ marginBottom: "4px" }}>
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

                            {/* Quality indicator */}
                            <Flex align="center" gap="1">
                              <Box style={{ color: quality.color }}>{quality.icon}</Box>
                              <Text
                                size="1"
                                style={{
                                  color: quality.color,
                                  fontWeight: 600,
                                  fontSize: "9px",
                                }}
                              >
                                {Math.round(annotation.qualityScore * 100)}%
                              </Text>
                            </Flex>

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

                          <Flex align="center" gap="2" style={{ marginBottom: "4px" }}>
                            <User size={10} style={{ color: theme.colors.text.tertiary }} />
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.tertiary,
                                fontSize: "10px",
                                fontWeight: 500,
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

                          {/* Enhanced metadata */}
                          <Flex align="center" gap="2">
                            <Badge
                              style={{
                                background: `${quality.color}15`,
                                color: quality.color,
                                fontSize: "8px",
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: theme.borders.radius.full,
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                              }}
                            >
                              {quality.text}
                            </Badge>

                            {annotation.validationCount > 0 && (
                              <Badge
                                style={{
                                  background: `${theme.colors.interactive.accent}15`,
                                  color: theme.colors.interactive.accent,
                                  fontSize: "8px",
                                  fontWeight: 600,
                                  padding: "2px 6px",
                                  borderRadius: theme.borders.radius.full,
                                }}
                              >
                                {annotation.validationCount}/{annotation.requiredValidations}{" "}
                                validated
                              </Badge>
                            )}
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

        {filteredAndSortedAnnotations.length === 0 && (
          <Box
            style={{
              textAlign: "center",
              padding: theme.spacing.semantic.layout.lg,
              color: theme.colors.text.tertiary,
            }}
          >
            <TrendUp size={32} style={{ marginBottom: theme.spacing.semantic.component.sm }} />
            <Text size="2" style={{ fontWeight: 500 }}>
              No annotations match your filters
            </Text>
            <Text size="1" style={{ marginTop: theme.spacing.semantic.component.xs }}>
              Try adjusting your filter or sort criteria
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
