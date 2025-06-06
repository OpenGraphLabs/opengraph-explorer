import { ReactNode } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Card,
} from "@radix-ui/themes";

interface StepCardProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "blue" | "green" | "orange" | "purple";
}

const VARIANT_STYLES = {
  blue: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
  green: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
  orange: "linear-gradient(135deg, #FFF3E0 0%, #FFCC02 100%)",
  purple: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
};

export function StepCard({
  stepNumber,
  title,
  description,
  children,
  variant = "blue"
}: StepCardProps) {
  return (
    <Card
      style={{
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
        border: "1px solid var(--gray-4)",
      }}
    >
      <Flex direction="column" gap="4">
        <Flex align="center" gap="2" mb="2">
          <Box
            style={{
              background: VARIANT_STYLES[variant],
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="4" style={{ fontWeight: "700" }}>
              {stepNumber}
            </Text>
          </Box>
          <Heading size="4" style={{ fontWeight: 600 }}>
            {title}
          </Heading>
        </Flex>

        {description && (
          <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
            {description}
          </Text>
        )}

        {children}
      </Flex>
    </Card>
  );
} 