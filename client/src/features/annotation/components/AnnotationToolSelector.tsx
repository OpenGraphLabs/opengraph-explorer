import { Box, Flex, Text, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { AnnotationType } from '@/features/annotation/types/workspace';
import { useAnnotationTools } from '@/features/annotation/hooks/useAnnotationTools';
import { ToolConfig, AnnotationToolConfig } from '@/features/annotation/types/annotation';
import { ChallengePhase } from '@/features/challenge';

interface AnnotationToolSelectorProps {
  config: ToolConfig;
  onToolChange: (tool: AnnotationType) => void;
  phaseConstraints?: {
    currentPhase: ChallengePhase;
    isToolAllowed: (tool: AnnotationType) => boolean;
    getDisallowedMessage: (tool: AnnotationType) => string;
  };
}

export function AnnotationToolSelector({ config, onToolChange, phaseConstraints }: AnnotationToolSelectorProps) {
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
        {tools.map((tool: AnnotationToolConfig) => {
          const isAllowed = phaseConstraints?.isToolAllowed(tool.type) ?? true;
          const disallowedMessage = phaseConstraints?.getDisallowedMessage(tool.type) ?? '';
          const isSelected = config.currentTool === tool.type;
          
          return (
            <Box
              key={tool.type}
              onClick={() => {
                if (isAllowed) {
                  onToolChange(tool.type);
                }
              }}
              style={{
                width: "100%",
                padding: theme.spacing.semantic.component.md,
                background: isSelected 
                  ? theme.colors.interactive.primary 
                  : isAllowed 
                    ? theme.colors.background.card 
                    : theme.colors.background.secondary,
                color: isSelected 
                  ? theme.colors.text.inverse 
                  : isAllowed 
                    ? theme.colors.text.primary 
                    : theme.colors.text.tertiary,
                border: `1px solid ${isSelected 
                  ? theme.colors.interactive.primary 
                  : isAllowed 
                    ? theme.colors.border.primary 
                    : theme.colors.border.secondary}`,
                borderRadius: theme.borders.radius.md,
                cursor: isAllowed ? "pointer" : "not-allowed",
                opacity: isAllowed ? 1 : 0.6,
                transition: "all 0.2s ease",
              }}
              title={!isAllowed ? disallowedMessage : undefined}
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
                      background: isSelected ? `${theme.colors.text.inverse}20` : `${theme.colors.interactive.primary}15`,
                      color: isSelected ? theme.colors.text.inverse : theme.colors.interactive.primary,
                      border: `1px solid ${isSelected ? `${theme.colors.text.inverse}40` : `${theme.colors.interactive.primary}30`}`,
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
                    color: isSelected ? `${theme.colors.text.inverse}80` : theme.colors.text.secondary,
                    lineHeight: 1.3
                  }}
                >
                  {tool.description}
                </Text>
              </Box>
            </Flex>
          </Box>
          );
        })}
      </Flex>
    </Box>
  );
} 