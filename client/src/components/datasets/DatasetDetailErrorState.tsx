import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";

interface DatasetDetailErrorStateProps {
  error?: string | null;
}

export function DatasetDetailErrorState({ error }: DatasetDetailErrorStateProps) {
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
        gap="4"
        style={{ minHeight: "80vh" }}
      >
        <Text size="4" style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
          Dataset not found
        </Text>
        <Text size="2" style={{ color: theme.colors.text.secondary }}>
          {error || "The requested dataset could not be retrieved"}
        </Text>
      </Flex>
    </Box>
  );
}