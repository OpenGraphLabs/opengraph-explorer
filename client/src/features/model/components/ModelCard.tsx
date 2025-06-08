import { Box, Flex, Text, Badge } from "@radix-ui/themes";
import { HeartIcon, DownloadIcon } from "@radix-ui/react-icons";
import { Card } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Model } from "@/features/model";

interface ModelCardProps {
  model: Model;
  onClick: () => void;
}

export function ModelCard({ model, onClick }: ModelCardProps) {
  const { theme } = useTheme();

  const getTaskTypeColor = (taskType: string): { bg: string; color: string } => {
    const taskTypeLower = taskType.toLowerCase();
    if (taskTypeLower.includes("classification")) {
      return {
        bg: theme.colors.status.info + "20",
        color: theme.colors.status.info,
      };
    }
    if (taskTypeLower.includes("regression")) {
      return {
        bg: theme.colors.interactive.primary + "20",
        color: theme.colors.interactive.primary,
      };
    }
    if (taskTypeLower.includes("detection")) {
      return {
        bg: theme.colors.status.warning + "20",
        color: theme.colors.status.warning,
      };
    }
    if (taskTypeLower.includes("generation")) {
      return {
        bg: theme.colors.status.success + "20",
        color: theme.colors.status.success,
      };
    }
    return {
      bg: theme.colors.background.secondary,
      color: theme.colors.text.secondary,
    };
  };

  const taskTypeColor = getTaskTypeColor(model.task_type);
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <Card
      interactive
      elevation="low"
      style={{
        padding: theme.spacing.semantic.component.md,
        borderRadius: theme.borders.radius.lg,
        border: `1px solid ${theme.colors.border.primary}`,
        backgroundColor: theme.colors.background.card,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: "110px",
        transition: theme.animations.transitions.hover,
      }}
      onClick={onClick}
    >
      <Flex direction="column" gap="2" style={{ height: "100%" }}>
        {/* Header: Model Name + Task Badge */}
        <Flex justify="between" align="start" gap="2">
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Text
              size="3"
              weight="bold"
              style={{
                color: theme.colors.text.primary,
                marginBottom: "2px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: "1.3",
              }}
            >
              {model.name}
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: "1.2",
              }}
            >
              by {model.creator || "Unknown"}
            </Text>
          </Box>

          <Badge
            size="1"
            style={{
              backgroundColor: taskTypeColor.bg,
              color: taskTypeColor.color,
              border: `1px solid ${theme.colors.border.secondary}`,
              borderRadius: theme.borders.radius.sm,
              padding: "2px 6px",
              fontSize: "10px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {model.task_type}
          </Badge>
        </Flex>

        {/* Spacer */}
        <Box style={{ flex: 1 }} />

        {/* Footer: Stats */}
        <Flex justify="between" align="center" style={{ marginTop: "auto" }}>
          <Flex gap="3" align="center">
            <Flex align="center" gap="1">
              <HeartIcon width="11" height="11" style={{ color: theme.colors.status.error }} />
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontWeight: "500",
                  fontSize: "10px",
                }}
              >
                {formatNumber(model.likes)}
              </Text>
            </Flex>

            <Flex align="center" gap="1">
              <DownloadIcon width="11" height="11" style={{ color: theme.colors.text.tertiary }} />
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontWeight: "500",
                  fontSize: "10px",
                }}
              >
                {formatNumber(model.downloads)}
              </Text>
            </Flex>
          </Flex>

          <Text
            size="1"
            style={{
              color: theme.colors.text.muted,
              fontWeight: "500",
              fontSize: "9px",
            }}
          >
            SUI
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
}
