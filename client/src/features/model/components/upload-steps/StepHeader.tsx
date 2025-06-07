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
  description: string;
}

export function StepHeader({ stepNumber, title, description }: StepHeaderProps) {
  const { theme } = useTheme();
  
  return (
    <Flex direction="column" gap={theme.spacing.semantic.component.lg}>
      <Flex 
        align="center" 
        gap={theme.spacing.semantic.component.sm} 
        style={{ marginBottom: theme.spacing.semantic.component.sm }}
      >
        <Box
          style={{
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: theme.shadows.semantic.card.medium,
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
        <Heading 
          size="4" 
          style={{ 
            fontWeight: 600,
            color: theme.colors.text.primary,
          }}
        >
          {title}
        </Heading>
      </Flex>

      <Text 
        size="2" 
        style={{ 
          color: theme.colors.text.secondary,
          lineHeight: theme.typography.body.lineHeight,
        }}
      >
        {description}
      </Text>
    </Flex>
  );
}
