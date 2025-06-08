import { Box, Flex, Text, Badge, Button, Card } from "@radix-ui/themes";
import { getDataTypeIcon, getDataTypeColor, formatDataSize } from "@/features/model";
import type { DatasetObject } from "../types/upload";
import { useTheme } from "@/shared/ui/design-system";
import { motion } from "framer-motion";
import {
  Database,
  FileText,
  Image,
  MusicNote,
  VideoCamera,
  GridFour,
  Cube,
  CheckCircle,
  X,
  ArrowRight,
  Download,
} from "phosphor-react";

interface DatasetCardProps {
  dataset: DatasetObject;
  onSelect?: (dataset: DatasetObject) => void;
  onRemove?: (() => void) | null;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
  type?: "training" | "test";
}

// Enhanced data type icon mapping
function getEnhancedDataTypeIcon(dataType: string, size: number = 16) {
  const iconProps = { size, weight: "duotone" as const };

  if (dataType.includes("image")) return <Image {...iconProps} />;
  if (dataType.includes("text")) return <FileText {...iconProps} />;
  if (dataType.includes("audio")) return <MusicNote {...iconProps} />;
  if (dataType.includes("video")) return <VideoCamera {...iconProps} />;
  if (dataType.includes("tabular")) return <GridFour {...iconProps} />;

  return <Database {...iconProps} />;
}

// Enhanced data type color mapping
function getEnhancedDataTypeColor(dataType: string, theme: any) {
  if (dataType.includes("image")) {
    return {
      bg: `${theme.colors.status.success}15`,
      text: theme.colors.status.success,
      border: `${theme.colors.status.success}30`,
    };
  }
  if (dataType.includes("text")) {
    return {
      bg: `${theme.colors.interactive.primary}15`,
      text: theme.colors.interactive.primary,
      border: `${theme.colors.interactive.primary}30`,
    };
  }
  if (dataType.includes("audio")) {
    return {
      bg: `${theme.colors.status.warning}15`,
      text: theme.colors.status.warning,
      border: `${theme.colors.status.warning}30`,
    };
  }
  if (dataType.includes("video")) {
    return {
      bg: `${theme.colors.status.error}15`,
      text: theme.colors.status.error,
      border: `${theme.colors.status.error}30`,
    };
  }

  return {
    bg: `${theme.colors.interactive.accent}15`,
    text: theme.colors.interactive.accent,
    border: `${theme.colors.interactive.accent}30`,
  };
}

export function DatasetCard({
  dataset,
  onSelect,
  onRemove = null,
  isSelected = false,
  isDisabled = false,
  disabledReason = "",
  type = "training",
}: DatasetCardProps) {
  const { theme } = useTheme();
  const colorScheme = getEnhancedDataTypeColor(dataset.dataType, theme);

  const typeConfig = {
    training: {
      color: theme.colors.status.success,
      bg: `${theme.colors.status.success}10`,
      label: "Training Dataset",
      icon: <Cube size={12} />,
    },
    test: {
      color: theme.colors.status.info,
      bg: `${theme.colors.status.info}10`,
      label: "Test Dataset",
      icon: <CheckCircle size={12} />,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card
        style={{
          padding: theme.spacing.semantic.component.lg,
          borderRadius: theme.borders.radius.lg,
          border: isSelected
            ? `2px solid ${theme.colors.interactive.primary}`
            : isDisabled
              ? `1px solid ${theme.colors.border.secondary}`
              : `1px solid ${theme.colors.border.primary}`,
          background: isDisabled ? theme.colors.background.secondary : theme.colors.background.card,
          cursor: onSelect && !isDisabled ? "pointer" : "default",
          opacity: isDisabled ? 0.6 : 1,
          minHeight: "180px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          transition: theme.animations.transitions.all,
          boxShadow: isSelected
            ? theme.shadows.semantic.card.medium
            : theme.shadows.semantic.card.low,
        }}
        onClick={onSelect && !isDisabled ? () => onSelect(dataset) : undefined}
      >
        {/* Subtle background pattern */}
        <Box
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "60px",
            height: "60px",
            borderRadius: theme.borders.radius.full,
            background: `${colorScheme.text}08`,
            transform: "rotate(45deg)",
          }}
        />

        {/* Disabled overlay */}
        {isDisabled && disabledReason && (
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: `${theme.colors.background.overlay}E0`,
              color: theme.colors.text.inverse,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              borderRadius: theme.borders.radius.md,
              fontSize: "12px",
              fontWeight: theme.typography.label.fontWeight,
              textAlign: "center",
              zIndex: 2,
              maxWidth: "80%",
              backdropFilter: "blur(4px)",
            }}
          >
            {disabledReason}
          </Box>
        )}

        <Flex
          direction="column"
          gap="3"
          style={{
            height: "100%",
            filter: isDisabled && disabledReason ? "blur(1px)" : "none",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <Flex align="center" justify="between" mb="2">
            <Flex align="center" gap="3" style={{ flex: 1, minWidth: 0 }}>
              {/* Data type icon */}
              <Box
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: theme.borders.radius.md,
                  background: colorScheme.bg,
                  border: `1px solid ${colorScheme.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {getEnhancedDataTypeIcon(dataset.dataType, 20)}
              </Box>

              {/* Title and type */}
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="3"
                  style={{
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.xs,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                  }}
                >
                  {dataset.name}
                </Text>

                <Flex align="center" gap="2">
                  <Badge
                    style={{
                      background: typeConfig[type].bg,
                      color: typeConfig[type].color,
                      border: `1px solid ${typeConfig[type].color}30`,
                      borderRadius: theme.borders.radius.sm,
                      padding: `2px 6px`,
                      fontSize: "10px",
                      fontWeight: theme.typography.label.fontWeight,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    {typeConfig[type].icon}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Badge>

                  <Badge
                    style={{
                      background: colorScheme.bg,
                      color: colorScheme.text,
                      border: `1px solid ${colorScheme.border}`,
                      borderRadius: theme.borders.radius.sm,
                      padding: `2px 6px`,
                      fontSize: "10px",
                      fontWeight: 500,
                    }}
                  >
                    {dataset.dataType.split("/")[0]}
                  </Badge>
                </Flex>
              </Box>
            </Flex>

            {/* Action buttons */}
            <Box style={{ flexShrink: 0 }}>
              {onRemove && (
                <Button
                  size="1"
                  onClick={e => {
                    e.stopPropagation();
                    onRemove();
                  }}
                  style={{
                    background: `${theme.colors.status.error}15`,
                    color: theme.colors.status.error,
                    border: `1px solid ${theme.colors.status.error}30`,
                    borderRadius: theme.borders.radius.sm,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    cursor: "pointer",
                    transition: theme.animations.transitions.all,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                    fontWeight: theme.typography.label.fontWeight,
                  }}
                >
                  <X size={12} />
                  Remove
                </Button>
              )}

              {isSelected && !onRemove && (
                <Flex align="center" gap="2">
                  <CheckCircle size={16} style={{ color: theme.colors.status.success }} />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.status.success,
                      fontWeight: theme.typography.label.fontWeight,
                      fontSize: "11px",
                    }}
                  >
                    Selected
                  </Text>
                </Flex>
              )}
            </Box>
          </Flex>

          {/* Description */}
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              flex: 1,
            }}
          >
            {dataset.description || "No description available for this dataset."}
          </Text>

          {/* Stats */}
          <Box
            style={{
              marginTop: "auto",
              padding: theme.spacing.semantic.component.sm,
              background: theme.colors.background.secondary,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Flex justify="between" align="center" gap="4">
              <Flex direction="column" align="center" gap="1" style={{ flex: 1 }}>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "10px",
                    fontWeight: theme.typography.label.fontWeight,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Size
                </Text>
                <Text
                  size="2"
                  style={{
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.primary,
                    fontFamily: "monospace",
                  }}
                >
                  {formatDataSize(dataset.dataSize)}
                </Text>
              </Flex>

              <Box
                style={{
                  width: "1px",
                  height: "30px",
                  background: theme.colors.border.secondary,
                }}
              />

              <Flex direction="column" align="center" gap="1" style={{ flex: 1 }}>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "10px",
                    fontWeight: theme.typography.label.fontWeight,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Items
                </Text>
                <Text
                  size="2"
                  style={{
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.primary,
                    fontFamily: "monospace",
                  }}
                >
                  {dataset.dataCount?.toLocaleString() || "0"}
                </Text>
              </Flex>

              <Box
                style={{
                  width: "1px",
                  height: "30px",
                  background: theme.colors.border.secondary,
                }}
              />

              <Flex direction="column" align="center" gap="1" style={{ flex: 1 }}>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "10px",
                    fontWeight: theme.typography.label.fontWeight,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  License
                </Text>
                <Text
                  size="2"
                  style={{
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.primary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "60px",
                    fontSize: "11px",
                  }}
                >
                  {dataset.license || "MIT"}
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* Selection indicator */}
          {onSelect && !isDisabled && (
            <Box
              style={{
                position: "absolute",
                bottom: theme.spacing.semantic.component.sm,
                right: theme.spacing.semantic.component.sm,
                width: "24px",
                height: "24px",
                borderRadius: theme.borders.radius.full,
                background: isSelected
                  ? theme.colors.interactive.primary
                  : `${theme.colors.text.tertiary}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: theme.animations.transitions.all,
              }}
            >
              {isSelected ? (
                <CheckCircle size={14} style={{ color: theme.colors.text.inverse }} />
              ) : (
                <ArrowRight size={12} style={{ color: theme.colors.text.tertiary }} />
              )}
            </Box>
          )}
        </Flex>
      </Card>
    </motion.div>
  );
}
