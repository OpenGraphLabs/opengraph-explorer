import { Box, Flex, Text, Tabs } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import { CheckCircle, Users, Database } from "phosphor-react";
import { useDatasetDetailPageContext } from "@/contexts/DatasetDetailPageContextProvider";

export function DatasetDetailTabs() {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const { totalCounts, activeTab, setActiveTab } = useDatasetDetailPageContext();

  return (
    <Box
      style={{
        padding: isMobile
          ? `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`
          : `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        background: theme.colors.background.tertiary,
      }}
    >
      <Flex align="center" justify="between">
        <Tabs.List
          style={{
            background: "transparent",
            padding: 0,
            gap: isMobile
              ? theme.spacing.semantic.component.xs
              : theme.spacing.semantic.component.xs,
            width: isMobile ? "100%" : "auto",
            display: "flex",
            justifyContent: isMobile ? "space-around" : "flex-start",
          }}
        >
          <Tabs.Trigger
            value="all"
            style={{
              cursor: "pointer",
              fontWeight: 500,
              color: activeTab === "all" ? theme.colors.text.primary : theme.colors.text.tertiary,
              background: activeTab === "all" ? theme.colors.background.primary : "transparent",
              border: `1px solid ${
                activeTab === "all" ? theme.colors.border.primary : "transparent"
              }`,
              borderRadius: theme.borders.radius.sm,
              padding: isMobile
                ? `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.xs}`
                : `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              transition: "all 0.2s ease",
              fontSize: isMobile ? "12px" : "13px",
              minHeight: isMobile ? "40px" : "auto",
              flex: isMobile ? "1" : "none",
            }}
          >
            <Flex align="center" gap={isMobile ? "1" : "2"}>
              <Database size={isMobile ? 10 : 12} />
              <span>All</span>
              <Text
                size="1"
                style={{
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.secondary,
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "1px 4px",
                  borderRadius: theme.borders.radius.xs,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {totalCounts.total.toLocaleString()}
              </Text>
            </Flex>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="confirmed"
            style={{
              cursor: "pointer",
              fontWeight: 500,
              color:
                activeTab === "confirmed" ? theme.colors.text.primary : theme.colors.text.tertiary,
              background:
                activeTab === "confirmed" ? theme.colors.background.primary : "transparent",
              border: `1px solid ${
                activeTab === "confirmed" ? theme.colors.border.primary : "transparent"
              }`,
              borderRadius: theme.borders.radius.sm,
              padding: isMobile
                ? `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.xs}`
                : `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              transition: "all 0.2s ease",
              fontSize: isMobile ? "12px" : "13px",
              minHeight: isMobile ? "40px" : "auto",
              flex: isMobile ? "1" : "none",
            }}
          >
            <Flex align="center" gap={isMobile ? "1" : "2"}>
              <CheckCircle size={isMobile ? 10 : 12} />
              <span>{isMobile ? "Verified" : "Verified"}</span>
              <Text
                size="1"
                style={{
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.secondary,
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "1px 4px",
                  borderRadius: theme.borders.radius.xs,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {totalCounts.confirmed.toLocaleString()}
              </Text>
            </Flex>
          </Tabs.Trigger>

          <Tabs.Trigger
            value="pending"
            style={{
              cursor: "pointer",
              fontWeight: 500,
              color:
                activeTab === "pending" ? theme.colors.text.primary : theme.colors.text.tertiary,
              background: activeTab === "pending" ? theme.colors.background.primary : "transparent",
              border: `1px solid ${
                activeTab === "pending" ? theme.colors.border.primary : "transparent"
              }`,
              borderRadius: theme.borders.radius.sm,
              padding: isMobile
                ? `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.xs}`
                : `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              transition: "all 0.2s ease",
              fontSize: isMobile ? "12px" : "13px",
              minHeight: isMobile ? "40px" : "auto",
              flex: isMobile ? "1" : "none",
            }}
          >
            <Flex align="center" gap={isMobile ? "1" : "2"}>
              <Users size={isMobile ? 10 : 12} />
              <span>{isMobile ? "Review" : "Under Review"}</span>
              <Text
                size="1"
                style={{
                  background: theme.colors.background.secondary,
                  color: theme.colors.text.secondary,
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "1px 4px",
                  borderRadius: theme.borders.radius.xs,
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {totalCounts.pending.toLocaleString()}
              </Text>
            </Flex>
          </Tabs.Trigger>
        </Tabs.List>

        <Text
          size="1"
          style={{
            color: theme.colors.text.tertiary,
            fontSize: "11px",
            fontWeight: 500,
            fontFeatureSettings: '"tnum"',
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {(activeTab === "all"
            ? totalCounts.total
            : activeTab === "confirmed"
              ? totalCounts.confirmed
              : totalCounts.pending
          ).toLocaleString()}{" "}
          items
        </Text>
      </Flex>
    </Box>
  );
}
