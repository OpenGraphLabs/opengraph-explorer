import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { AnnotationType } from '@/features/annotation/types/workspace';
import { useAnnotationTools } from '@/features/annotation/hooks/useAnnotationTools';
import { ToolConfig, AnnotationToolConfig } from '@/features/annotation/types/annotation';

interface AnnotationToolSelectorProps {
  config: ToolConfig;
  onToolChange: (tool: AnnotationType) => void;
}

export function AnnotationToolSelector({ config, onToolChange }: AnnotationToolSelectorProps) {
  const { theme } = useTheme();
  const { tools } = useAnnotationTools(config);

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
        Annotation Tools
      </Text>
      <Flex direction="column" gap="2">
        {tools.map((tool: AnnotationToolConfig) => (
          <Box
            key={tool.type}
            onClick={() => onToolChange(tool.type)}
            style={{
              width: "100%",
              padding: theme.spacing.semantic.component.md,
              background: config.currentTool === tool.type ? theme.colors.interactive.primary : theme.colors.background.card,
              color: config.currentTool === tool.type ? theme.colors.text.inverse : theme.colors.text.primary,
              border: `1px solid ${config.currentTool === tool.type ? theme.colors.interactive.primary : theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <Flex align="center" gap="3">
              <Box style={{ fontSize: "18px" }}>
                {tool.icon}
              </Box>
              <Box style={{ flex: 1 }}>
                <Flex align="center" gap="2" style={{ marginBottom: "2px" }}>
                  <Text 
                    size="2" 
                    style={{ 
                      fontWeight: 600,
                      color: "inherit",
                    }}
                  >
                    {tool.name}
                  </Text>
                  <Badge
                    style={{
                      background: config.currentTool === tool.type ? `${theme.colors.text.inverse}20` : `${theme.colors.interactive.primary}15`,
                      color: config.currentTool === tool.type ? theme.colors.text.inverse : theme.colors.interactive.primary,
                      border: `1px solid ${config.currentTool === tool.type ? `${theme.colors.text.inverse}40` : `${theme.colors.interactive.primary}30`}`,
                      padding: "1px 4px",
                      borderRadius: theme.borders.radius.full,
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    {tool.hierarchy}
                  </Badge>
                </Flex>
                <Text 
                  size="1" 
                  style={{ 
                    color: config.currentTool === tool.type ? `${theme.colors.text.inverse}80` : theme.colors.text.secondary,
                    lineHeight: 1.3
                  }}
                >
                  {tool.description}
                </Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Box>
  );
} 