import React from "react";
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Link } from "react-router-dom";

interface SidebarSection {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "primary" | "success" | "warning" | "info";
  };
  actionButton?: {
    text: string;
    icon: React.ReactNode;
    href: string;
  };
}

interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebar: {
    section: SidebarSection;
    stats?: Array<{
      icon: React.ReactNode;
      text: string;
    }>;
    filters: React.ReactNode;
  };
  topBar?: React.ReactNode;
}

export function SidebarLayout({ children, sidebar, topBar }: SidebarLayoutProps) {
  const { theme } = useTheme();

  const getBadgeColor = (variant: string = "primary") => {
    switch (variant) {
      case "success":
        return {
          background: `${theme.colors.status.success}20`,
          color: theme.colors.status.success,
          border: `1px solid ${theme.colors.status.success}40`,
        };
      case "warning":
        return {
          background: `${theme.colors.status.warning}20`,
          color: theme.colors.status.warning,
          border: `1px solid ${theme.colors.status.warning}40`,
        };
      case "info":
        return {
          background: `${theme.colors.status.info}20`,
          color: theme.colors.status.info,
          border: `1px solid ${theme.colors.status.info}40`,
        };
      default:
        return {
          background: `${theme.colors.interactive.accent}20`,
          color: theme.colors.interactive.accent,
          border: `1px solid ${theme.colors.interactive.accent}40`,
        };
    }
  };

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <Box
        style={{
          width: "320px",
          minHeight: "100vh",
          background: theme.colors.background.card,
          borderRight: `1px solid ${theme.colors.border.primary}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            background: `linear-gradient(135deg, ${theme.colors.background.secondary}, ${theme.colors.background.accent})`,
          }}
        >
          <Flex
            align="center"
            gap="3"
            style={{ marginBottom: theme.spacing.semantic.component.lg }}
          >
            <Box
              style={{
                width: "32px",
                height: "32px",
                borderRadius: theme.borders.radius.md,
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {sidebar.section.icon}
            </Box>
            <Box style={{ flex: 1 }}>
              <Text
                size="4"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  lineHeight: 1.2,
                  marginBottom: theme.spacing.semantic.component.xs,
                }}
              >
                {sidebar.section.title}
              </Text>
              {sidebar.section.badge && (
                <Badge
                  style={{
                    ...getBadgeColor(sidebar.section.badge.variant),
                    padding: "2px 6px",
                    borderRadius: theme.borders.radius.full,
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {sidebar.section.badge.text}
                </Badge>
              )}
            </Box>
          </Flex>

          {sidebar.section.subtitle && (
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.4,
                marginBottom: theme.spacing.semantic.component.lg,
              }}
            >
              {sidebar.section.subtitle}
            </Text>
          )}

          {/* Action Button */}
          {sidebar.section.actionButton && (
            <Link to={sidebar.section.actionButton.href}>
              <Button
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                  boxShadow: theme.shadows.semantic.interactive.default,
                }}
              >
                {sidebar.section.actionButton.icon}
                {sidebar.section.actionButton.text}
              </Button>
            </Link>
          )}
        </Box>

        {/* Stats */}
        {sidebar.stats && sidebar.stats.length > 0 && (
          <Box
            style={{
              padding: theme.spacing.semantic.component.md,
              borderBottom: `1px solid ${theme.colors.border.primary}`,
            }}
          >
            <Flex direction="column" gap="2">
              {sidebar.stats.map((stat, index) => (
                <Flex key={index} align="center" gap="2">
                  {stat.icon}
                  <Text size="1" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
                    {stat.text}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        )}

        {/* Filters */}
        <Box style={{ flex: 1, overflow: "auto" }}>{sidebar.filters}</Box>
      </Box>

      {/* Main Content */}
      <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Bar */}
        {topBar && (
          <Box
            style={{
              padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
              borderBottom: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.secondary,
            }}
          >
            {topBar}
          </Box>
        )}

        {/* Content */}
        <Box
          style={{
            flex: 1,
            padding: theme.spacing.semantic.component.lg,
            overflow: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
