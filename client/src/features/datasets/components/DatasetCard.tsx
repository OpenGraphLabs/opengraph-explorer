import {
  Box,
  Flex,
  Text,
  Heading,
  Card,
  Badge,
  Avatar,
  Separator,
  Tooltip,
} from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { Database, ImageSquare, FileDoc, FileZip, FileText } from "phosphor-react";
import { DatasetObject } from "../../../shared/api/datasetGraphQLService";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../../../shared/constants/suiConfig";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <ImageSquare size={20} weight="bold" />,
  "image/jpeg": <ImageSquare size={20} weight="bold" />,
  "text/plain": <FileText size={20} weight="bold" />,
  "text/csv": <FileDoc size={20} weight="bold" />,
  "application/zip": <FileZip size={20} weight="bold" />,
  default: <Database size={20} weight="bold" />,
};

// 데이터 타입에 따른 색상 매핑
const DATA_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F", border: "#80DEEA" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
  default: { bg: "#F3E8FD", text: "#7E22CE", border: "#D0BCFF" },
};

interface DatasetCardProps {
  dataset: DatasetObject;
  isVisible?: boolean;
}

export function DatasetCard({ dataset, isVisible = true }: DatasetCardProps) {
  // 데이터 크기 포맷팅
  const formatDataSize = (size: string | number): string => {
    const numSize = typeof size === "string" ? parseInt(size) : Number(size);
    if (numSize < 1024) return `${numSize} B`;
    if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`;
    return `${(numSize / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 데이터 타입 아이콘 가져오기
  const getDataTypeIcon = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_ICONS[key];
  };

  // 데이터 타입 색상 가져오기
  const getDataTypeColor = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_COLORS[key];
  };

  return (
    <Link to={`/datasets/${dataset.id}`} style={{ textDecoration: "none" }}>
      <Card
        className={`datasetCard ${isVisible ? "visible" : ""}`}
        style={{
          height: "380px",
          background: "white",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
          border: "1px solid var(--gray-4)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 헤더 */}
        <Box
          style={{
            background: `linear-gradient(135deg, ${getDataTypeColor(dataset.dataType).bg}, ${getDataTypeColor(dataset.dataType).border})`,
            padding: "16px 20px",
            borderBottom: `2px solid ${getDataTypeColor(dataset.dataType).border}`,
          }}
        >
          <Flex justify="between" align="start">
            <Flex align="center" gap="3">
              <Box
                style={{
                  background: getDataTypeColor(dataset.dataType).text,
                  color: "white",
                  padding: "8px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {getDataTypeIcon(dataset.dataType)}
              </Box>
              <Badge
                style={{
                  background: "white",
                  color: getDataTypeColor(dataset.dataType).text,
                  padding: "4px 12px",
                  fontWeight: 600,
                  fontSize: "12px",
                  borderRadius: "20px",
                  textTransform: "uppercase",
                }}
              >
                {dataset.dataType.split("/")[0]}
              </Badge>
            </Flex>
            
            <Tooltip content="Dataset Size">
              <Box 
                style={{
                  background: "white",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Box 
                  style={{ 
                    width: "8px", 
                    height: "8px", 
                    borderRadius: "50%", 
                    background: getDataTypeColor(dataset.dataType).text,
                  }} 
                />
                <Text size="2" style={{ color: getDataTypeColor(dataset.dataType).text, fontWeight: 600 }}>
                  {formatDataSize(dataset.dataSize)}
                </Text>
              </Box>
            </Tooltip>
          </Flex>
        </Box>

        {/* 콘텐츠 */}
        <Box style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column" }}>
          <Heading size="3" mb="2" style={{ fontWeight: 700 }}>
            {dataset.name}
          </Heading>
          <Text
            size="2"
            style={{
              color: "var(--gray-11)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {dataset.description || "No description provided for this dataset."}
          </Text>

          <Separator size="4" style={{ margin: "14px 0" }} />

          {/* 태그 */}
          {dataset.tags && dataset.tags.length > 0 && (
            <Flex gap="2" wrap="wrap" mb="3">
              {dataset.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="surface"
                  radius="full"
                  style={{
                    padding: "3px 10px",
                    fontSize: "11px",
                    background: "var(--gray-3)",
                    color: "var(--gray-11)",
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {dataset.tags.length > 3 && (
                <Badge variant="surface" radius="full" style={{ padding: "3px 10px", fontSize: "11px" }}>
                  +{dataset.tags.length - 3}
                </Badge>
              )}
            </Flex>
          )}

          {/* 메타데이터 */}
          <Flex justify="between" align="center" mt="auto">
            <Flex align="center" gap="2">
              <Avatar
                size="1"
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${dataset.creator}`}
                fallback={dataset.creator ? dataset.creator[0] : "U"}
                radius="full"
              />
              <Text size="1" style={{ fontWeight: 500, color: "var(--gray-10)" }}>
                {dataset.creator
                  ? `${dataset.creator.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...`
                  : "Unknown"}
              </Text>
            </Flex>
            
            <Flex gap="2" align="center">
              <Tooltip content="Total items">
                <Flex align="center" gap="1" style={{ background: "var(--gray-3)", padding: "4px 8px", borderRadius: "8px" }}>
                  <Database size={12} />
                  <Text size="1">{dataset.dataCount}</Text>
                </Flex>
              </Tooltip>
              <Text size="1" style={{ color: "var(--gray-10)" }}>
                {new Date(dataset.createdAt).toLocaleDateString()}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Card>
    </Link>
  );
} 