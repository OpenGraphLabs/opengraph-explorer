import { ReactNode } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
} from "@radix-ui/themes";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: "var(--gray-11)",
      }}
    >
      <Flex direction="column" align="center" gap="4">
        {icon && (
          <Box
            style={{
              color: "var(--gray-8)",
              marginBottom: "8px",
            }}
          >
            {icon}
          </Box>
        )}
        
        <Heading size="4" style={{ color: "var(--gray-12)" }}>
          {title}
        </Heading>
        
        {description && (
          <Text size="3" style={{ color: "var(--gray-10)", maxWidth: "400px" }}>
            {description}
          </Text>
        )}
        
        {action && (
          <Box style={{ marginTop: "16px" }}>
            {action}
          </Box>
        )}
      </Flex>
    </Box>
  );
} 