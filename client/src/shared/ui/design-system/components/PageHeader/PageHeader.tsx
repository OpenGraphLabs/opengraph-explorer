import React from 'react';
import { Flex, Heading, Text, Box } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  const { theme } = useTheme();

  return (
    <Flex 
      gap="5" 
      justify="between" 
      align="baseline" 
      mb="6"
      className={className}
    >
      <Box>
        <Heading
          size={{ initial: "8", md: "9" }}
          style={{
            fontWeight: theme.typography.h1.fontWeight,
            letterSpacing: '-0.03em',
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: theme.spacing.base[2],
          }}
        >
          {title}
        </Heading>
        {description && (
          <Text 
            size="3" 
            style={{ 
              maxWidth: '620px',
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.body.lineHeight,
            }}
          >
            {description}
          </Text>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Flex>
  );
} 