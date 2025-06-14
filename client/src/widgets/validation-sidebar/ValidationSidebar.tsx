import { Flex, Box, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ViewControls } from "@/features/workspace-controls";
import { ChallengePhase } from "@/features/challenge";
import { Shield, CheckCircle, XCircle, Clock, Target, Eye } from "phosphor-react";

interface ValidationSidebarProps {
  currentPhase: ChallengePhase;
  validationProgress: {
    total: number;
    validated: number;
    approved: number;
    rejected: number;
  };
  zoom: number;
  panOffset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: { x: number; y: number }) => void;
}

export function ValidationSidebar({
  currentPhase,
  validationProgress,
  zoom,
  panOffset,
  onZoomChange,
  onPanChange,
}: ValidationSidebarProps) {
  const { theme } = useTheme();

  const getPhaseColor = (phase: ChallengePhase) => {
    switch (phase) {
      case "label":
        return theme.colors.status.info;
      case "bbox":
        return theme.colors.status.warning;
      case "segmentation":
        return theme.colors.status.success;
      default:
        return theme.colors.interactive.accent;
    }
  };

  const getPhaseIcon = (phase: ChallengePhase) => {
    switch (phase) {
      case "label":
        return <Target size={14} />;
      case "bbox":
        return <Target size={14} />;
      case "segmentation":
        return <Target size={14} />;
      default:
        return <Shield size={14} />;
    }
  };

  const completionRate =
    validationProgress.total > 0
      ? (validationProgress.validated / validationProgress.total) * 100
      : 0;

  const approvalRate =
    validationProgress.validated > 0
      ? (validationProgress.approved / validationProgress.validated) * 100
      : 0;

  return (
    <Flex direction="column" gap="6" style={{ height: "100%" }}>
      {/* Validation Phase Info */}
      <Box>
        <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
          <Shield size={16} style={{ color: theme.colors.text.secondary }} />
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.secondary,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Validation Phase
          </Text>
        </Flex>

        <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.md }}>
          {getPhaseIcon(currentPhase)}
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: getPhaseColor(currentPhase),
              textTransform: "capitalize",
            }}
          >
            {currentPhase === "bbox" ? "Bounding Box" : currentPhase} Validation
          </Text>
        </Flex>

        <Text
          size="2"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.5,
          }}
        >
          Review and approve annotator submissions. Quality annotations help improve model training.
        </Text>
      </Box>

      {/* Progress Stats */}
      <Box>
        <Text
          size="2"
          style={{
            fontWeight: 600,
            color: theme.colors.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          Validation Progress
        </Text>

        <Flex direction="column" gap="3">
          {/* Overall Progress */}
          <Box>
            <Flex align="center" justify="between" style={{ marginBottom: "4px" }}>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 500,
                }}
              >
                Total Progress
              </Text>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {Math.round(completionRate)}%
              </Text>
            </Flex>
            <Box
              style={{
                width: "100%",
                height: "6px",
                background: theme.colors.background.secondary,
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  height: "100%",
                  width: `${completionRate}%`,
                  background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>

          {/* Detailed Stats */}
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Clock size={12} style={{ color: theme.colors.text.tertiary }} />
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  flex: 1,
                }}
              >
                Pending
              </Text>
              <Badge
                style={{
                  background: `${theme.colors.text.tertiary}15`,
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: theme.borders.radius.full,
                }}
              >
                {validationProgress.total - validationProgress.validated}
              </Badge>
            </Flex>

            <Flex align="center" gap="2">
              <CheckCircle size={12} style={{ color: theme.colors.status.success }} />
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  flex: 1,
                }}
              >
                Approved
              </Text>
              <Badge
                style={{
                  background: `${theme.colors.status.success}15`,
                  color: theme.colors.status.success,
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: theme.borders.radius.full,
                }}
              >
                {validationProgress.approved}
              </Badge>
            </Flex>

            <Flex align="center" gap="2">
              <XCircle size={12} style={{ color: theme.colors.status.error }} />
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  flex: 1,
                }}
              >
                Rejected
              </Text>
              <Badge
                style={{
                  background: `${theme.colors.status.error}15`,
                  color: theme.colors.status.error,
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: theme.borders.radius.full,
                }}
              >
                {validationProgress.rejected}
              </Badge>
            </Flex>
          </Flex>

          {/* Approval Rate */}
          {validationProgress.validated > 0 && (
            <Box
              style={{
                background: theme.colors.background.secondary,
                padding: theme.spacing.semantic.component.sm,
                borderRadius: theme.borders.radius.sm,
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
              <Flex align="center" gap="2">
                <Eye size={12} style={{ color: theme.colors.interactive.accent }} />
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    flex: 1,
                  }}
                >
                  Approval Rate
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {Math.round(approvalRate)}%
                </Text>
              </Flex>
            </Box>
          )}
        </Flex>
      </Box>

      {/* View Controls */}
      <Box style={{ marginTop: "auto" }}>
        <Text
          size="2"
          style={{
            fontWeight: 600,
            color: theme.colors.text.secondary,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          View Controls
        </Text>

        <ViewControls
          zoom={zoom}
          panOffset={panOffset}
          onZoomChange={onZoomChange}
          onPanChange={onPanChange}
        />
      </Box>
    </Flex>
  );
}
