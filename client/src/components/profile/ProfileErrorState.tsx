import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { User } from "phosphor-react";

export function ProfileErrorState() {
  const { theme } = useTheme();

  return (
    <Card
      style={{
        padding: theme.spacing.semantic.component.lg,
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.status.error}40`,
      }}
    >
      <Flex direction="column" gap="3" align="center">
        <Box
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `${theme.colors.status.error}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <User size={20} style={{ color: theme.colors.status.error }} />
        </Box>
        <Box style={{ textAlign: "center" }}>
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
            }}
          >
            Unable to Load Profile Data
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
            }}
          >
            There was an error loading your profile information. Some features may not work correctly.
          </Text>
        </Box>
      </Flex>
    </Card>
  );
}