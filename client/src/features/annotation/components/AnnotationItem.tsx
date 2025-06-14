import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Tag, Target, Circle, Trash } from "phosphor-react";
import { AnnotationType } from "../types/workspace";

interface AnnotationItemProps {
  type: AnnotationType;
  data: any;
  onDelete: (type: AnnotationType, id: string) => void;
}

export function AnnotationItem({ type, data, onDelete }: AnnotationItemProps) {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (type) {
      case "label":
        return <Tag size={12} style={{ color: theme.colors.status.info }} />;
      case "bbox":
        return <Target size={12} style={{ color: theme.colors.status.success }} />;
      case "segmentation":
        return <Circle size={12} style={{ color: theme.colors.status.warning }} />;
      default:
        return null;
    }
  };

  const getContent = () => {
    switch (type) {
      case "label":
        return (
          <Text size="1" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
            {data.label}
          </Text>
        );
      case "bbox":
        return (
          <Box>
            <Text size="1" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
              {data.label}
            </Text>
            <Text size="1" style={{ color: theme.colors.text.secondary, fontSize: "10px" }}>
              {Math.round(data.x)}, {Math.round(data.y)} • {Math.round(data.width)} ×{" "}
              {Math.round(data.height)}
            </Text>
          </Box>
        );
      case "segmentation":
        return (
          <Box>
            <Text size="1" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
              {data.label}
            </Text>
            <Text size="1" style={{ color: theme.colors.text.secondary, fontSize: "10px" }}>
              {data.points.length} points
            </Text>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      style={{
        padding: theme.spacing.semantic.component.xs,
        background: theme.colors.background.secondary,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.sm,
      }}
    >
      <Flex align="center" justify="between">
        <Flex align="center" gap="2">
          {getIcon()}
          {getContent()}
        </Flex>
        <Button
          onClick={() => onDelete(type, data.id)}
          style={{
            width: "20px",
            height: "20px",
            padding: "0",
            background: "transparent",
            color: theme.colors.status.error,
            border: "none",
            borderRadius: theme.borders.radius.sm,
            cursor: "pointer",
          }}
        >
          <Trash size={10} />
        </Button>
      </Flex>
    </Box>
  );
}
