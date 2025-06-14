import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Target, Circle, Info, CheckCircle } from "phosphor-react";
import { ToolConfig } from "../types/annotation";

interface CompactToolConfigPanelProps {
  config: ToolConfig;
}

export function CompactToolConfigPanel({ config }: CompactToolConfigPanelProps) {
  const { theme } = useTheme();

  const getStatusInfo = () => {
    switch (config.currentTool) {
      case "label":
        return {
          icon: <Info size={16} style={{ color: theme.colors.status.info }} />,
          title: "Label Mode",
          description: "Add descriptive labels to the image",
          stats: `${config.existingLabels.length} labels created`,
          color: theme.colors.status.info,
        };

      case "bbox":
        return {
          icon: <Target size={16} style={{ color: theme.colors.status.warning }} />,
          title: "Bounding Box Mode",
          description: "Draw boxes around labeled objects",
          stats: `${config.boundingBoxes.length} boxes drawn`,
          color: theme.colors.status.warning,
        };

      case "segmentation":
        return {
          icon: <Circle size={16} style={{ color: theme.colors.status.success }} />,
          title: "Segmentation Mode",
          description: "Draw precise object boundaries",
          stats: `0 polygons created`, // TODO: add polygon count
          color: theme.colors.status.success,
        };

      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <Box>
      <Text
        size="2"
        style={{
          fontWeight: 600,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.semantic.component.md,
        }}
      >
        Current Tool
      </Text>

      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          background: `${statusInfo.color}10`,
          border: `1px solid ${statusInfo.color}30`,
          borderRadius: theme.borders.radius.md,
          marginBottom: theme.spacing.semantic.component.md,
        }}
      >
        <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
          {statusInfo.icon}
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            {statusInfo.title}
          </Text>
        </Flex>

        <Text
          size="1"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.4,
            marginBottom: theme.spacing.semantic.component.xs,
          }}
        >
          {statusInfo.description}
        </Text>

        <Badge
          style={{
            background: `${statusInfo.color}20`,
            color: statusInfo.color,
            border: `1px solid ${statusInfo.color}40`,
            padding: "2px 6px",
            borderRadius: theme.borders.radius.full,
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {statusInfo.stats}
        </Badge>
      </Box>

      {/* Quick Status for Dependencies */}
      {config.currentTool === "bbox" && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.sm,
            background:
              config.existingLabels.length > 0
                ? `${theme.colors.status.success}10`
                : `${theme.colors.status.warning}10`,
            border: `1px solid ${
              config.existingLabels.length > 0
                ? theme.colors.status.success
                : theme.colors.status.warning
            }30`,
            borderRadius: theme.borders.radius.sm,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          <Flex align="center" gap="2">
            {config.existingLabels.length > 0 ? (
              <CheckCircle size={14} style={{ color: theme.colors.status.success }} />
            ) : (
              <Info size={14} style={{ color: theme.colors.status.warning }} />
            )}
            <Text
              size="1"
              style={{
                fontWeight: 600,
                color:
                  config.existingLabels.length > 0
                    ? theme.colors.status.success
                    : theme.colors.status.warning,
              }}
            >
              {config.existingLabels.length > 0
                ? `Ready with ${config.existingLabels.length} labels`
                : "Need labels first"}
            </Text>
          </Flex>
        </Box>
      )}

      {config.currentTool === "segmentation" && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.sm,
            background:
              config.boundingBoxes.length > 0
                ? `${theme.colors.status.success}10`
                : `${theme.colors.status.warning}10`,
            border: `1px solid ${
              config.boundingBoxes.length > 0
                ? theme.colors.status.success
                : theme.colors.status.warning
            }30`,
            borderRadius: theme.borders.radius.sm,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          <Flex align="center" gap="2">
            {config.boundingBoxes.length > 0 ? (
              <CheckCircle size={14} style={{ color: theme.colors.status.success }} />
            ) : (
              <Info size={14} style={{ color: theme.colors.status.warning }} />
            )}
            <Text
              size="1"
              style={{
                fontWeight: 600,
                color:
                  config.boundingBoxes.length > 0
                    ? theme.colors.status.success
                    : theme.colors.status.warning,
              }}
            >
              {config.boundingBoxes.length > 0
                ? `Ready with ${config.boundingBoxes.length} boxes`
                : "Need bounding boxes first"}
            </Text>
          </Flex>
        </Box>
      )}

      {/* Quick Reference */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.sm,
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.sm,
        }}
      >
        <Text
          size="1"
          style={{
            color: theme.colors.text.tertiary,
            fontWeight: 600,
            marginBottom: theme.spacing.semantic.component.xs,
          }}
        >
          Quick Tip
        </Text>

        <Text
          size="1"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.3,
          }}
        >
          {config.currentTool === "label" &&
            "Use the floating panel above the image to add labels quickly"}
          {config.currentTool === "bbox" &&
            "Select a label from the bottom toolbar, then click and drag on the image"}
          {config.currentTool === "segmentation" &&
            "Select a bounding box from the bottom toolbar, then draw polygon points"}
        </Text>
      </Box>
    </Box>
  );
}
