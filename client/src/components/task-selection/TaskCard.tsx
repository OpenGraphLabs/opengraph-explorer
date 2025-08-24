import React, { useState } from "react";
import { Box, Text, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import { ArrowRight } from "phosphor-react";
import { Task } from "@/shared/api/endpoints/tasks";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
}

export function TaskCard({ task, onSelect }: TaskCardProps) {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(task)}
      style={{
        padding: isMobile ? theme.spacing.semantic.component.md : "24px",
        borderRadius: "8px",
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${isHovered ? theme.colors.interactive.primary + "30" : theme.colors.border.primary}`,
        cursor: "pointer",
        transition: "all 0.15s ease",
        boxShadow: isHovered
          ? `0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px ${theme.colors.interactive.primary}10`
          : `0 1px 3px rgba(0, 0, 0, 0.04)`,
        minHeight: isMobile ? "44px" : "auto",
      }}
    >
      <Flex direction="column" gap="2">
        {/* Header */}
        <Flex align="center" justify="between" style={{ marginBottom: "8px" }}>
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Task #{task.id.toString().padStart(3, "0")}
          </Text>

          <Flex
            align="center"
            gap="1"
            style={{
              color: theme.colors.interactive.primary,
              opacity: isHovered ? 1 : 0.5,
              transition: "opacity 0.15s ease",
            }}
          >
            <ArrowRight size={16} weight="regular" />
          </Flex>
        </Flex>

        {/* Task Name */}
        <Text
          style={{
            color: theme.colors.text.primary,
            fontSize: "16px",
            lineHeight: 1.5,
            fontWeight: 500,
            letterSpacing: "-0.005em",
          }}
        >
          {task.name}
        </Text>
      </Flex>
    </Box>
  );
}
