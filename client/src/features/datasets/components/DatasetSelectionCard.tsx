import {
  Box,
  Flex,
  Text,
  Card,
  Badge,
  Button,
} from "@radix-ui/themes";
import { Database, ImageSquare, FileDoc, FileZip, FileText } from "phosphor-react";
import { DatasetCardProps } from "../types";
import styles from "../../../styles/Card.module.css";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={20} />,
  "image/jpeg": <ImageSquare size={20} />,
  "text/plain": <FileText size={20} />,
  "text/csv": <FileDoc size={20} />,
  "application/zip": <FileZip size={20} />,
  default: <Database size={20} />,
};

// 데이터 타입에 따른 색상 매핑
const DATA_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100" },
  default: { bg: "#F3E8FD", text: "#7E22CE" },
};

const getDataTypeIcon = (dataType: string) => {
  const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
  return DATA_TYPE_ICONS[key];
};

const getDataTypeColor = (dataType: string) => {
  const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
  return DATA_TYPE_COLORS[key];
};

const formatDataSize = (size: string | number): string => {
  const numSize = typeof size === "string" ? parseInt(size) : Number(size);
  if (numSize < 1024) return `${numSize} B`;
  if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`;
  return `${(numSize / (1024 * 1024)).toFixed(1)} MB`;
};

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
                {dataset.dataType.split('/')[0]}
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
        </Flex>
        
        <Text
          size="1"
          style={{
            color: "var(--gray-10)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            marginBottom: "auto",
          }}
        >
          {dataset.description || "No description available"}
        </Text>
        
        <Flex justify="between" align="center" style={{ marginTop: "auto" }}>
          <Text size="1" style={{ color: "var(--gray-9)", fontWeight: 500 }}>
            {formatDataSize(dataset.dataSize)}
          </Text>
          <Text size="1" style={{ color: "var(--gray-9)" }}>
            {dataset.data?.length || 0} items
          </Text>
        </Flex>
        
        {dataset.tags && dataset.tags.length > 0 && (
          <Flex wrap="wrap" gap="1" style={{ marginTop: "8px" }}>
            {dataset.tags.slice(0, 2).map((tag: string, index: number) => (
              <Badge
                key={index}
                size="1"
                style={{
                  background: "var(--gray-3)",
                  color: "var(--gray-11)",
                  fontSize: "9px",
                  padding: "1px 4px",
                }}
              >
                {tag}
              </Badge>
            ))}
            {dataset.tags.length > 2 && (
              <Badge
                size="1"
                style={{
                  background: "var(--gray-4)",
                  color: "var(--gray-11)",
                  fontSize: "9px",
                  padding: "1px 4px",
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