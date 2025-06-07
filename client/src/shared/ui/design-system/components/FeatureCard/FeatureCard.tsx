import React from 'react';
import { 
  Card, 
  Flex, 
  Heading, 
  Text,
  Box 
} from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  const { theme } = useTheme();

  return (
    <Card
      elevation="medium"
      className={className}
      style={{
        borderRadius: theme.borders.radius.xl,
        border: 'none',
        backgroundColor: theme.colors.background.card,
        boxShadow: theme.shadows.semantic.card.medium,
        height: '100%',
        padding: theme.spacing.semantic.component.xl,
      }}
    >
      <Flex direction="column" align="center" gap="3">
        {/* Icon Container */}
        <Box
          style={{
            background: theme.gradients.primaryLight,
            borderRadius: theme.borders.radius.full,
            width: '72px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon as React.ReactElement, {
            width: 32,
            height: 32,
            style: { color: theme.colors.text.brand }
          })}
        </Box>
        
        {/* Title */}
        <Heading 
          size="3" 
          style={{ 
            fontWeight: theme.typography.h3.fontWeight,
            textAlign: 'center',
            color: theme.colors.text.primary,
          }}
        >
          {title}
        </Heading>
        
        {/* Description */}
        <Text 
          align="center" 
          style={{ 
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.body.lineHeight,
          }}
        >
          {description}
        </Text>
      </Flex>
    </Card>
  );
} 