import { ReactNode } from "react";
import {
  Box,
  Flex,
  Text,
  Card,
} from "@radix-ui/themes";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  variant?: "blue" | "green" | "orange" | "purple";
}

const VARIANT_STYLES = {
  blue: {
    bg: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
    border: "#90CAF9",
    iconBg: "white",
    iconColor: "#1565C0",
    labelColor: "#0D47A1",
    valueColor: "#0D47A1",
  },
  green: {
    bg: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
    border: "#A5D6A7",
    iconBg: "white",
    iconColor: "#2E7D32",
    labelColor: "#1B5E20",
    valueColor: "#1B5E20",
  },
  orange: {
    bg: "linear-gradient(135deg, #FFF3E0 0%, #FFCC02 100%)",
    border: "#FFB74D",
    iconBg: "white",
    iconColor: "#E65100",
    labelColor: "#BF360C",
    valueColor: "#BF360C",
  },
  purple: {
    bg: "linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)",
    border: "#BA68C8",
    iconBg: "white",
    iconColor: "#7B1FA2",
    labelColor: "#4A148C",
    valueColor: "#4A148C",
  },
};

export function StatCard({
  icon,
  label,
  value,
  unit,
  variant = "blue"
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <Card
      style={{
        padding: "20px",
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: "12px",
      }}
    >
      <Flex align="center" gap="3">
        <Box
          style={{
            background: styles.iconBg,
            borderRadius: "10px",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            color: styles.iconColor,
          }}
        >
          {icon}
        </Box>
        <Flex direction="column" gap="1">
          <Text 
            size="2" 
            style={{ 
              color: styles.labelColor, 
              fontWeight: 600, 
              opacity: 0.8 
            }}
          >
            {label}
          </Text>
          <Text size="5" style={{ fontWeight: 700, color: styles.valueColor }}>
            {value}
            {unit && (
              <Text 
                size="2" 
                style={{ 
                  marginLeft: "4px", 
                  fontWeight: 500, 
                  opacity: 0.8 
                }}
              >
                {unit}
              </Text>
            )}
          </Text>
        </Flex>
      </Flex>
    </Card>
  );
} 