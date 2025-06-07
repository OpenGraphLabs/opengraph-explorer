import { Box, Flex, Text, Heading } from "@radix-ui/themes";

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  description: string;
}

export function StepHeader({ stepNumber, title, description }: StepHeaderProps) {
  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="2" mb="2">
        <Box
          style={{
            background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text size="4" style={{ fontWeight: "700" }}>
            {stepNumber}
          </Text>
        </Box>
        <Heading size="4" style={{ fontWeight: 600 }}>
          {title}
        </Heading>
      </Flex>

      <Text size="2" style={{ color: "var(--gray-11)" }}>
        {description}
      </Text>
    </Flex>
  );
}
