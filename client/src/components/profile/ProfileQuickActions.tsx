import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Rocket, Database, Gear } from "phosphor-react";

export function ProfileQuickActions() {
  const { theme } = useTheme();

  const actionItems = [
    {
      icon: <Rocket size={16} style={{ color: theme.colors.interactive.primary }} />,
      text: "Browse AI Models",
      href: "/models",
    },
    {
      icon: <Database size={16} style={{ color: theme.colors.status.info }} />,
      text: "Browse Datasets", 
      href: "/datasets",
    },
    {
      icon: <Gear size={16} style={{ color: theme.colors.status.warning }} />,
      text: "Data Annotator",
      href: "/annotator",
    },
  ];

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
          Quick Actions
        </Text>

        <Flex direction="column" gap="2">
          {actionItems.map((item, index) => (
            <Box
              key={index}
              style={{
                background: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => (window.location.href = item.href)}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.borderColor = theme.colors.border.brand;
                e.currentTarget.style.background = `${theme.colors.interactive.primary}08`;
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.borderColor = theme.colors.border.primary;
                e.currentTarget.style.background = theme.colors.background.secondary;
              }}
            >
              <Flex
                align="center"
                gap="3"
                style={{
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                }}
              >
                {item.icon}
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 500,
                  }}
                >
                  {item.text}
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
}