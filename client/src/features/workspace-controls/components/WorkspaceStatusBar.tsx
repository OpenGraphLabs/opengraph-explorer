import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { AnnotationType } from "@/features/annotation";
import { ChallengePhase } from "@/features/challenge";

interface WorkspaceStatusBarProps {
  currentTool: AnnotationType;
  selectedLabel: string | null;
  annotationCounts: {
    labels: number;
    boundingBoxes: number;
    polygons: number;
  };
  zoom: number;
  unsavedChanges: boolean;
  constraintMessage?: string | null;
  currentPhase?: ChallengePhase;
  phaseConstraintMessage?: string;
}

export function WorkspaceStatusBar({
  currentTool,
  selectedLabel,
  annotationCounts,
  zoom,
  unsavedChanges,
  constraintMessage,
  currentPhase,
  phaseConstraintMessage,
}: WorkspaceStatusBarProps) {
  const { theme } = useTheme();

  const getToolColor = (tool: AnnotationType) => {
    switch (tool) {
      case "label":
        return theme.colors.status.info;
      case "bbox":
        return theme.colors.status.success;
      case "segmentation":
        return theme.colors.status.warning;
      default:
        return theme.colors.interactive.primary;
    }
  };

  const getToolBadgeStyle = (tool: AnnotationType) => ({
    background: `${getToolColor(tool)}15`,
    color: getToolColor(tool),
    border: `1px solid ${getToolColor(tool)}30`,
    padding: "2px 8px",
    borderRadius: theme.borders.radius.full,
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "uppercase" as const,
  });

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        borderTop: `1px solid ${theme.colors.border.primary}`,
        padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
      }}
    >
      <Flex justify="between" align="center">
        <Flex align="center" gap="4">
          {/* Current Phase & Tool Status */}
          <Flex align="center" gap="3">
            {currentPhase && (
              <Flex align="center" gap="2">
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Phase:
                </Text>
                <Badge
                  style={{
                    background:
                      currentPhase === "label"
                        ? `${theme.colors.status.info}15`
                        : currentPhase === "bbox"
                          ? `${theme.colors.status.warning}15`
                          : currentPhase === "segmentation"
                            ? `${theme.colors.status.success}15`
                            : `${theme.colors.interactive.accent}15`,
                    color:
                      currentPhase === "label"
                        ? theme.colors.status.info
                        : currentPhase === "bbox"
                          ? theme.colors.status.warning
                          : currentPhase === "segmentation"
                            ? theme.colors.status.success
                            : theme.colors.interactive.accent,
                    border: `1px solid ${
                      currentPhase === "label"
                        ? theme.colors.status.info
                        : currentPhase === "bbox"
                          ? theme.colors.status.warning
                          : currentPhase === "segmentation"
                            ? theme.colors.status.success
                            : theme.colors.interactive.accent
                    }30`,
                    padding: "2px 6px",
                    borderRadius: theme.borders.radius.full,
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "capitalize",
                  }}
                >
                  {currentPhase}
                </Badge>
              </Flex>
            )}

            <Flex align="center" gap="2">
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                Tool:
              </Text>
              <Badge style={getToolBadgeStyle(currentTool)}>{currentTool}</Badge>
            </Flex>
          </Flex>

          {/* Selected Label Status */}
          {selectedLabel && (
            <Flex align="center" gap="2">
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                Active:
              </Text>
              <Badge
                style={{
                  background: `${theme.colors.interactive.primary}15`,
                  color: theme.colors.interactive.primary,
                  border: `1px solid ${theme.colors.interactive.primary}30`,
                  padding: "2px 8px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {selectedLabel}
              </Badge>
            </Flex>
          )}

          {/* Hierarchy Status */}
          <Flex align="center" gap="2">
            <Text as="p" size="2" style={{ color: theme.colors.text.secondary }}>
              Progress:
            </Text>
            <Flex align="center" gap="1">
              <Badge
                style={{
                  background:
                    annotationCounts.labels > 0
                      ? `${theme.colors.status.success}15`
                      : `${theme.colors.text.tertiary}15`,
                  color:
                    annotationCounts.labels > 0
                      ? theme.colors.status.success
                      : theme.colors.text.tertiary,
                  border: `1px solid ${annotationCounts.labels > 0 ? theme.colors.status.success : theme.colors.text.tertiary}30`,
                  padding: "1px 6px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                L:{annotationCounts.labels}
              </Badge>
              <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                →
              </Text>
              <Badge
                style={{
                  background:
                    annotationCounts.boundingBoxes > 0
                      ? `${theme.colors.status.success}15`
                      : `${theme.colors.text.tertiary}15`,
                  color:
                    annotationCounts.boundingBoxes > 0
                      ? theme.colors.status.success
                      : theme.colors.text.tertiary,
                  border: `1px solid ${annotationCounts.boundingBoxes > 0 ? theme.colors.status.success : theme.colors.text.tertiary}30`,
                  padding: "1px 6px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                B:{annotationCounts.boundingBoxes}
              </Badge>
              <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                →
              </Text>
              <Badge
                style={{
                  background:
                    annotationCounts.polygons > 0
                      ? `${theme.colors.status.success}15`
                      : `${theme.colors.text.tertiary}15`,
                  color:
                    annotationCounts.polygons > 0
                      ? theme.colors.status.success
                      : theme.colors.text.tertiary,
                  border: `1px solid ${annotationCounts.polygons > 0 ? theme.colors.status.success : theme.colors.text.tertiary}30`,
                  padding: "1px 6px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "10px",
                  fontWeight: 600,
                }}
              >
                S:{annotationCounts.polygons}
              </Badge>
            </Flex>
          </Flex>

          {/* Constraint Messages */}
          {constraintMessage && (
            <Text
              size="2"
              style={{
                color: constraintMessage.startsWith("⚠️")
                  ? theme.colors.status.warning
                  : theme.colors.status.info,
                fontWeight: 600,
              }}
            >
              {constraintMessage}
            </Text>
          )}

          {/* Phase Constraint Message */}
          {phaseConstraintMessage && (
            <Badge
              style={{
                background: `${theme.colors.status.warning}15`,
                color: theme.colors.status.warning,
                border: `1px solid ${theme.colors.status.warning}30`,
                padding: "2px 6px",
                borderRadius: theme.borders.radius.full,
                fontSize: "10px",
                fontWeight: 600,
              }}
              title={phaseConstraintMessage}
            >
              🔒 Restricted
            </Badge>
          )}
        </Flex>

        <Flex align="center" gap="4">
          {unsavedChanges && (
            <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
              Unsaved changes
            </Text>
          )}

          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            Zoom: {Math.round(zoom * 100)}%
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
