import React from 'react';
import { Flex, Box, Text } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';

export function HomeLoadingState() {
  const { theme } = useTheme();

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="4"
      style={{
        minHeight: '300px',
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Box
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          border: `3px solid ${theme.colors.border.primary}`,
          borderTopColor: theme.colors.interactive.primary,
          animation: 'spin 1s linear infinite',
        }}
      />
      <Text
        style={{
          fontSize: theme.typography.body.fontSize,
          color: theme.colors.text.secondary,
        }}
      >
        Loading approved annotations...
      </Text>
    </Flex>
  );
}