import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";

export function DatasetDetailLoadingState() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap="6"
        style={{ minHeight: "80vh" }}
      >
        <Box
          style={{
            width: "2px",
            height: "40px",
            background: theme.colors.border.primary,
            borderRadius: "2px",
            animation: "loading 1.5s ease-in-out infinite",
          }}
        />
        <Text size="3" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
          Loading dataset from server
        </Text>
      </Flex>
    </Box>
  );
}