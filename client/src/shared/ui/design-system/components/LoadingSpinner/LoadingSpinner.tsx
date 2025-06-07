import { Flex, Text, Box } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const sizeMap = {
  sm: '24px',
  md: '40px',
  lg: '50px',
};

export function LoadingSpinner({ size = 'md', message, className }: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const spinnerSize = sizeMap[size];

  return (
    <Flex direction="column" align="center" gap="4" className={className}>
      <Box
        style={{
          width: spinnerSize,
          height: spinnerSize,
          borderRadius: theme.borders.radius.full,
          border: `3px solid ${theme.colors.interactive.primary}`,
          borderTopColor: 'transparent',
          animation: `${theme.animations.keyframes.spin} 1s linear infinite`,
        }}
      />
      {message && (
        <Text 
          size="3" 
          style={{ 
            color: theme.colors.text.secondary,
            textAlign: 'center',
          }}
        >
          {message}
        </Text>
      )}
    </Flex>
  );
} 