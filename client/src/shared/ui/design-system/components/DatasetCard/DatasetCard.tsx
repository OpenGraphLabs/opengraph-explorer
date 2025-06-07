import { Link } from "react-router-dom";
import { Card, Flex, Text, Badge, Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { ExternalLinkIcon } from "@radix-ui/react-icons";

export interface DatasetInfo {
  id: string;
  name: string;
  dataType: string;
  dataCount: number;
}

export interface DatasetCardProps {
  dataset: DatasetInfo;
  type: "training" | "test";
  className?: string;
}

// Helper functions for dataset types
function getDataTypeColor(dataType: string, theme: any) {
  switch (dataType.toLowerCase()) {
    case "image":
      return {
        bg: theme.colors.dataTypes?.image?.background || theme.colors.status.info,
        text: theme.colors.dataTypes?.image?.text || theme.colors.text.inverse,
      };
    case "text":
      return {
        bg: theme.colors.dataTypes?.text?.background || theme.colors.status.success,
        text: theme.colors.dataTypes?.text?.text || theme.colors.text.inverse,
      };
    default:
      return {
        bg: theme.colors.background.secondary,
        text: theme.colors.text.secondary,
      };
  }
}

function getDataTypeIcon(dataType: string) {
  // Using simple text icons for now, can be replaced with proper icons
  switch (dataType.toLowerCase()) {
    case "image":
      return "🖼️";
    case "text":
      return "📝";
    default:
      return "📊";
  }
}

export function DatasetCard({ dataset, type, className }: DatasetCardProps) {
  const { theme } = useTheme();
  const colors = getDataTypeColor(dataset.dataType, theme);
  const isTraining = type === "training";

  const gradientColor = isTraining
    ? theme.colors.interactive.primary
    : theme.colors.interactive.secondary;

  return (
    <Link to={`/datasets/${dataset.id}`} style={{ textDecoration: "none" }}>
      <Card
        elevation="low"
        interactive
        className={className}
        style={{
          padding: theme.spacing.semantic.component.lg,
          backgroundColor: theme.colors.background.card,
          backdropFilter: "blur(8px)",
          border: `1px solid ${theme.colors.border.secondary}`,
          borderRadius: theme.borders.radius.lg,
          cursor: "pointer",
          transition: theme.animations.transitions.hover,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left Border Accent */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            background: `linear-gradient(to bottom, ${gradientColor}, ${theme.colors.interactive.secondary})`,
          }}
        />

        <Flex align="center" gap="4">
          {/* Icon */}
          <Box
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderRadius: theme.borders.radius.lg,
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            {getDataTypeIcon(dataset.dataType)}
          </Box>

          {/* Content */}
          <Box style={{ flex: 1 }}>
            <Text
              size="3"
              style={{
                fontWeight: theme.typography.label.fontWeight,
                marginBottom: theme.spacing.base[1],
                color: theme.colors.text.primary,
              }}
            >
              {dataset.name}
            </Text>

            <Flex gap="3" align="center">
              <Badge
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                  borderRadius: theme.borders.radius.sm,
                  fontSize: theme.typography.caption.fontSize,
                }}
              >
                {dataset.dataType}
              </Badge>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.base[1],
                }}
              >
                📊 {dataset.dataCount.toLocaleString()} files
              </Text>
            </Flex>
          </Box>

          {/* External Link Icon */}
          <Box
            style={{
              color: gradientColor,
              opacity: 0.6,
              transition: theme.animations.transitions.hover,
            }}
          >
            <ExternalLinkIcon width="16" height="16" />
          </Box>
        </Flex>
      </Card>
    </Link>
  );
}
