import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Database, Target, ChartBar } from "phosphor-react";
import { useProfilePage } from "@/contexts/page/ProfilePageContext";

export function ProfileActivityStats() {
  const { theme } = useTheme();
  const { userProfile } = useProfilePage();

  return (
    <Card
      style={{
        padding: theme.spacing.semantic.component.lg,
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <Flex direction="column" gap="4">
        <Text
          size="3"
          style={{
            fontWeight: 600,
            color: theme.colors.text.primary,
          }}
        >
          Activity Statistics
        </Text>

        <Flex direction="column" gap="4">
          {/* Datasets Created */}
          <Card
            style={{
              padding: theme.spacing.semantic.component.md,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.primary}04)`,
              border: `1px solid ${theme.colors.interactive.primary}20`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  background: theme.colors.interactive.primary,
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Database size={18} style={{ color: theme.colors.text.inverse }} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text
                  size="4"
                  style={{
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    marginBottom: "2px",
                  }}
                >
                  {userProfile?.dataset_count || 0}
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  Datasets Created
                </Text>
              </Box>
            </Flex>
          </Card>

          {/* Annotations Created */}
          <Card
            style={{
              padding: theme.spacing.semantic.component.md,
              background: `linear-gradient(135deg, ${theme.colors.status.success}08, ${theme.colors.status.success}04)`,
              border: `1px solid ${theme.colors.status.success}20`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  background: theme.colors.status.success,
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Target size={18} style={{ color: theme.colors.text.inverse }} />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text
                  size="4"
                  style={{
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    marginBottom: "2px",
                  }}
                >
                  {userProfile?.annotation_count || 0}
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  Annotations Created
                </Text>
              </Box>
            </Flex>
          </Card>

          {/* Activity Summary */}
          <Box
            style={{
              padding: theme.spacing.semantic.component.sm,
              background: theme.colors.background.secondary,
              borderRadius: theme.borders.radius.sm,
              border: `1px solid ${theme.colors.border.subtle}20`,
            }}
          >
            <Flex align="center" gap="2" justify="center">
              <ChartBar size={14} style={{ color: theme.colors.text.tertiary }} />
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                Total Contributions:{" "}
                {(userProfile?.dataset_count || 0) + (userProfile?.annotation_count || 0)}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Card>
  );
}
