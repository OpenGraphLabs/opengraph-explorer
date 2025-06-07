import React, { forwardRef } from 'react';
import { Button as RadixButton } from '@radix-ui/themes';
import { useTheme } from '../../theme/ThemeProvider';
import type { ComponentVariant, ComponentSize, StyleProps } from '../../theme/types';

export interface ButtonProps extends StyleProps {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
  highContrast?: boolean;
  style?: React.CSSProperties;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      className,
      style,
      onClick,
      type = 'button',
      asChild = false,
      highContrast = false,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();

    // Map our variants to Radix variants
    const getRadixVariant = (variant: ComponentVariant) => {
      switch (variant) {
        case 'primary':
          return 'solid';
        case 'secondary':
          return 'soft';
        case 'tertiary':
          return 'ghost';
        case 'danger':
          return 'solid';
        case 'success':
          return 'solid';
        case 'warning':
          return 'solid';
        case 'info':
          return 'solid';
        default:
          return 'solid';
      }
    };

    // Map our sizes to Radix sizes
    const getRadixSize = (size: ComponentSize) => {
      switch (size) {
        case 'xs':
          return '1';
        case 'sm':
          return '2';
        case 'md':
          return '3';
        case 'lg':
          return '4';
        case 'xl':
          return '4';
        default:
          return '3';
      }
    };

    // Get color based on variant
    const getColor = (variant: ComponentVariant) => {
      switch (variant) {
        case 'primary':
          return 'orange'; // Our brand color
        case 'secondary':
          return 'gray';
        case 'tertiary':
          return 'gray';
        case 'danger':
          return 'red';
        case 'success':
          return 'green';
        case 'warning':
          return 'yellow';
        case 'info':
          return 'blue';
        default:
          return 'orange';
      }
    };

    const buttonStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : undefined,
      transition: theme.animations.transitions.hover,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      ...(loading && {
        position: 'relative',
        color: 'transparent',
      }),
      ...style, // Apply custom styles last
    };

    return (
      <RadixButton
        ref={ref}
        variant={getRadixVariant(variant)}
        size={getRadixSize(size)}
        color={getColor(variant)}
        disabled={disabled || loading}
        highContrast={highContrast}
        style={buttonStyles}
        className={className}
        onClick={onClick}
        type={type}
        asChild={asChild}
        {...props}
      >
        {loading ? (
          <>
            <span style={{ visibility: 'hidden' }}>{children}</span>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <style>
              {`
                @keyframes spin {
                  0% { transform: translate(-50%, -50%) rotate(0deg); }
                  100% { transform: translate(-50%, -50%) rotate(360deg); }
                }
              `}
            </style>
          </>
        ) : (
          children
        )}
      </RadixButton>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 