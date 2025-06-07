import { Flex, Text, Box, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  message = "Something went wrong",
  onRetry,
  retryLabel = "Try Again",
  className,
}: ErrorStateProps) {
  const { theme } = useTheme();

  return (
    <Flex direction="column" align="center" gap="4" className={className}>
      <Box
        style={{
          width: "60px",
          height: "60px",
          borderRadius: theme.borders.radius.full,
          backgroundColor: theme.colors.status.error,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: theme.typography.h3.fontSize,
          fontWeight: theme.typography.h3.fontWeight,
          color: theme.colors.text.inverse,
        }}
      >
        !
      </Box>
      <Text
        size="3"
        style={{
          color: theme.colors.text.secondary,
          textAlign: "center",
          maxWidth: "400px",
        }}
      >
        {message}
      </Text>
      {onRetry && (
        <Button
          variant="secondary"
          onClick={onRetry}
          style={{
            marginTop: theme.spacing.base[2],
          }}
        >
          {retryLabel}
        </Button>
      )}
    </Flex>
  );
}
