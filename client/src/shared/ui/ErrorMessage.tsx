import { Box, Text, Button, Flex } from "@radix-ui/themes";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  variant?: "inline" | "card";
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  retryText = "Try again",
  variant = "card"
}: ErrorMessageProps) {
  const content = (
    <Flex direction="column" align="center" gap="3">
      <Box style={{ color: "var(--red-9)" }}>
        <ExclamationTriangleIcon width="24" height="24" />
      </Box>
      
      <Flex direction="column" align="center" gap="1">
        <Text size="4" weight="bold" color="red">
          {title}
        </Text>
        <Text size="2" color="gray" style={{ textAlign: "center" }}>
          {message}
        </Text>
      </Flex>

      {onRetry && (
        <Button 
          variant="soft" 
          color="red" 
          onClick={onRetry}
          size="2"
        >
          {retryText}
        </Button>
      )}
    </Flex>
  );

  if (variant === "card") {
    return (
      <Box
        style={{
          padding: "24px",
          border: "1px solid var(--red-6)",
          borderRadius: "8px",
          backgroundColor: "var(--red-2)",
          margin: "16px 0",
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
} 