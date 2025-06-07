import { 
  Box, 
  Flex, 
  Text, 
  Heading 
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description?: string;
  gradientColors?: {
    from: string;
    to: string;
  };
}

export function StepHeader({
  stepNumber,
  title,
  description,
  gradientColors = { from: "#667eea", to: "#764ba2" },
}: StepHeaderProps) {
  const { theme } = useTheme();
  
  return (
    <Flex 
      align="center" 
      gap={theme.spacing.semantic.component.md} 
      style={{ marginBottom: theme.spacing.semantic.component.sm }}
    >
      <Box
        style={{
          background: `linear-gradient(135deg, ${gradientColors.from} 0%, ${gradientColors.to} 100%)`,
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 4px 12px ${gradientColors.from}4D`, // 30% opacity
          flexShrink: 0,
        }}
      >
        <Text 
          size="4" 
          style={{ 
            fontWeight: "700", 
            color: theme.colors.text.inverse,
          }}
        >
          {stepNumber}
        </Text>
      </Box>
      <Box>
        <Heading 
          size="5" 
          style={{ 
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: description ? theme.spacing.semantic.component.xs : 0,
          }}
        >
          {title}
        </Heading>
        {description && (
          <Text 
            size="2" 
            style={{ 
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.body.lineHeight,
            }}
          >
            {description}
          </Text>
        )}
      </Box>
    </Flex>
  );
}
