import React from 'react';
import { Box, Flex, Text } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { Database } from 'phosphor-react';

export function WorkspaceLoadingState() {
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Database size={24} style={{ color: theme.colors.interactive.primary }} />
          <Box
            style={{
              position: "absolute",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}20, ${theme.colors.interactive.accent}20)`,
              animation: "pulse 2s infinite",
            }}
          />
        </Box>
        <Box style={{ textAlign: "center" }}>
          <Text
            size="4"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
            }}
          >
            Loading Dataset Images
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
            }}
          >
            Preparing annotation workspace...
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}