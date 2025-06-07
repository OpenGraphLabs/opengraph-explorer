import React, { forwardRef } from 'react';
import { Card as RadixCard } from '@radix-ui/themes';
import { useTheme } from '../../theme/ThemeProvider';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'surface' | 'classic' | 'ghost';
  size?: '1' | '2' | '3' | '4' | '5';
  elevation?: 'flat' | 'low' | 'medium' | 'high' | 'highest';
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  asChild?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'surface',
      size = '3',
      elevation = 'low',
      interactive = false,
      className,
      style,
      onClick,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    const cardStyles: React.CSSProperties = {
      boxShadow: theme.shadows.semantic.card[elevation],
      transition: interactive ? theme.animations.transitions.hover : undefined,
      cursor: interactive ? 'pointer' : undefined,
      ...(interactive && {
        '&:hover': {
          boxShadow: theme.shadows.semantic.interactive.hover,
          transform: 'translateY(-1px)',
        },
        '&:active': {
          boxShadow: theme.shadows.semantic.interactive.active,
          transform: 'translateY(0)',
        },
      }),
      ...style,
    };

    return (
      <RadixCard
        ref={ref}
        variant={variant}
        size={size}
        style={cardStyles}
        className={className}
        onClick={onClick}
        asChild={asChild}
        {...props}
      >
        {children}
      </RadixCard>
    );
  }
);

Card.displayName = 'Card';

export { Card }; 