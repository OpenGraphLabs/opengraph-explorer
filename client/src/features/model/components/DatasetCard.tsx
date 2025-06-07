import { Box, Flex, Text, Badge, Button, Card } from "@radix-ui/themes";
import { getDataTypeIcon, getDataTypeColor, formatDataSize } from "@/features/model";
import type { DatasetObject } from "../types/upload";
import styles from "@/styles/Card.module.css";

interface DatasetCardProps {
  dataset: DatasetObject;
  onSelect?: (dataset: DatasetObject) => void;
  onRemove?: (() => void) | null;
  isSelected?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

export function DatasetCard({
  dataset,
  onSelect,
  onRemove = null,
  isSelected = false,
  isDisabled = false,
  disabledReason = "",
}: DatasetCardProps) {
  return (
    <Card
      className={styles.datasetCard}
      style={{
        padding: "12px",
        borderRadius: "8px",
        border: `1px solid ${isSelected ? "var(--accent-8)" : isDisabled ? "var(--gray-5)" : "var(--gray-4)"}`,
        background: isDisabled ? "var(--gray-2)" : "var(--gray-1)",
        cursor: onSelect && !isDisabled ? "pointer" : "default",
        opacity: isDisabled ? 0.7 : 1,
        minHeight: "150px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      onClick={onSelect && !isDisabled ? () => onSelect(dataset) : undefined}
    >
      {isDisabled && disabledReason && (
        <Box
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            textAlign: "center",
            zIndex: 1,
            maxWidth: "80%",
          }}
        >
          {disabledReason}
        </Box>
      )}

      <Flex
        direction="column"
        gap="2"
        style={{
          height: "100%",
          filter: isDisabled && disabledReason ? "blur(2px)" : "none",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
            <Box
              style={{
                background: getDataTypeColor(dataset.dataType).bg,
                color: getDataTypeColor(dataset.dataType).text,
                borderRadius: "6px",
                width: "30px",
                height: "30px",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {getDataTypeIcon(dataset.dataType)}
            </Box>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="2"
                style={{
                  fontWeight: 600,
                  marginBottom: "2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {dataset.name}
              </Text>
              <Badge
                size="1"
                style={{
                  background: getDataTypeColor(dataset.dataType).bg,
                  color: getDataTypeColor(dataset.dataType).text,
                  padding: "1px 6px",
                  fontSize: "10px",
                  marginLeft: "4px",
                }}
              >
                {dataset.dataType.split("/")[0]}
              </Badge>
            </Box>
          </Flex>

          {onRemove && (
            <Button
              size="1"
              variant="soft"
              onClick={e => {
                e.stopPropagation();
                onRemove();
              }}
              style={{
                background: "var(--red-3)",
                color: "var(--red-11)",
                cursor: "pointer",
                marginLeft: "8px",
                flexShrink: 0,
                padding: "0 8px",
                height: "24px",
              }}
            >
              Remove
            </Button>
          )}

          {isSelected && !onRemove && (
            <Box
              style={{
                background: "var(--accent-3)",
                color: "var(--accent-11)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 500,
                marginLeft: "8px",
                flexShrink: 0,
              }}
            >
              Selected
            </Box>
          )}
        </Flex>

        <Text
          size="1"
          style={{
            color: "var(--gray-11)",
            flex: 1,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {dataset.description}
        </Text>

        <Flex gap="2" justify="between" style={{ marginTop: "auto" }}>
          <Box style={{ display: "flex", gap: "1px", alignItems: "center" }}>
            <Text size="1" style={{ color: "var(--gray-11)" }}>
              Size:
            </Text>
            <Text size="1" style={{ fontWeight: 500, marginLeft: "4px" }}>
              {formatDataSize(dataset.dataSize)}
            </Text>
          </Box>

          <Box style={{ display: "flex", gap: "1px", alignItems: "center" }}>
            <Text size="1" style={{ color: "var(--gray-11)" }}>
              Items:
            </Text>
            <Text size="1" style={{ fontWeight: 500, marginLeft: "4px" }}>
              {dataset.dataCount}
            </Text>
          </Box>

          <Box style={{ display: "flex", gap: "1px", alignItems: "center" }}>
            <Text size="1" style={{ color: "var(--gray-11)" }}>
              License:
            </Text>
            <Text
              size="1"
              style={{
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginLeft: "4px",
                maxWidth: "60px",
              }}
            >
              {dataset.license || "N/A"}
            </Text>
          </Box>
        </Flex>

        {dataset.tags && dataset.tags.length > 0 && (
          <Flex gap="1" wrap="wrap">
            {dataset.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                size="1"
                style={{
                  background: "var(--gray-3)",
                  color: "var(--gray-11)",
                  padding: "1px 6px",
                  fontSize: "9px",
                }}
              >
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 2 && (
              <Badge
                size="1"
                style={{
                  background: "var(--gray-3)",
                  color: "var(--gray-11)",
                  padding: "1px 6px",
                  fontSize: "9px",
                }}
              >
                +{dataset.tags.length - 2}
              </Badge>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
