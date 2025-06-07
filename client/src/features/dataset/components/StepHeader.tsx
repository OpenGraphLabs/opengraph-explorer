import { Box, Flex, Text, Heading } from "@radix-ui/themes";

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
  return (
    <Flex align="center" gap="3" mb="2">
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
        }}
      >
        <Text size="4" style={{ fontWeight: "700", color: "white" }}>
          {stepNumber}
        </Text>
      </Box>
      <Box>
        <Heading size="5" style={{ fontWeight: 600 }}>
          {title}
        </Heading>
        {description && (
          <Text size="2" style={{ color: "var(--gray-11)", marginTop: "4px" }}>
            {description}
          </Text>
        )}
      </Box>
    </Flex>
  );
}
