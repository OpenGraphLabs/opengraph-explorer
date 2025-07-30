import { Box, Flex, Heading, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { User } from "phosphor-react";

export function ProfileUnauthenticatedState() {
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
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: `${theme.colors.interactive.primary}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={24} style={{ color: theme.colors.interactive.primary }} />
        </Box>
        <Heading
          size="4"
          style={{
            color: theme.colors.text.primary,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Authentication Required
        </Heading>
        <Text
          style={{
            maxWidth: "320px",
            color: theme.colors.text.secondary,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          Please sign in to view your profile information.
        </Text>
        <Button
          onClick={() => (window.location.href = "/")}
          style={{
            background: theme.colors.interactive.primary,
            color: theme.colors.text.inverse,
            borderRadius: theme.borders.radius.sm,
            fontWeight: 600,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          }}
        >
          Go to Home
        </Button>
      </Flex>
    </Box>
  );
}
