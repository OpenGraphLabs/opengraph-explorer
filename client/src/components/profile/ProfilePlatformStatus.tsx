import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Lightning } from "phosphor-react";

export function ProfilePlatformStatus() {
  const { theme } = useTheme();

  return (
    <Card
      style={{
        padding: theme.spacing.semantic.component.lg,
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <Flex direction="column" gap="3" align="center">
        <Box
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `${theme.colors.status.warning}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lightning size={20} style={{ color: theme.colors.status.warning }} />
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
            Platform in Development
          </Text>
          <br />
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              marginTop: theme.spacing.semantic.component.xs,
            }}
          >
            OpenGraph is currently in active development. More features will be available in the
            alpha release.
          </Text>
        </Box>
      </Flex>
    </Card>
  );
}