import { Box, Spinner, Text, Flex } from "@radix-ui/themes";

interface LoadingSpinnerProps {
  size?: "1" | "2" | "3";
  text?: string;
  centered?: boolean;
}

export function LoadingSpinner({ 
  size = "2", 
  text = "Loading...", 
  centered = false 
}: LoadingSpinnerProps) {
  const content = (
    <Flex direction="column" align="center" gap="2">
      <Spinner size={size} />
      {text && (
        <Text size="2" color="gray">
          {text}
        </Text>
      )}
    </Flex>
  );

  if (centered) {
    return (
      <Box
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
} 