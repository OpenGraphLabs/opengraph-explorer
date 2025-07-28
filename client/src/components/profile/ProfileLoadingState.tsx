import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";

export function ProfileLoadingState() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Flex
        direction="column"
        align="center"
        gap="4"
        style={{
          background: theme.colors.background.card,
          padding: theme.spacing.semantic.layout.lg,
          borderRadius: theme.borders.radius.lg,
          border: `1px solid ${theme.colors.border.primary}`,
          boxShadow: theme.shadows.semantic.card.low,
          maxWidth: "400px",
        }}
      >
        <Box
          style={{
            width: "24px",
            height: "24px",
            border: `2px solid ${theme.colors.border.primary}`,
            borderTopColor: theme.colors.interactive.primary,
            borderRadius: "50%",
            animation: 'spin 1s linear infinite',
          }}
        />
        <Text
          size="3"
          style={{
            color: theme.colors.text.primary,
            fontWeight: 600,
          }}
        >
          Loading Profile...
        </Text>
      </Flex>
    </Box>
  );
}