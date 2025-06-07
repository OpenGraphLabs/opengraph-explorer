import { Link } from "react-router-dom";
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Badge,
  Avatar,
  Separator,
  Tooltip,
} from "@radix-ui/themes";
import { Database } from "phosphor-react";
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService.ts";
import { formatDataSize, getDataTypeIcon, getDataTypeColor, truncateAddress } from "../utils";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "@/shared/constants/suiConfig.ts";

interface DatasetCardProps {
  dataset: DatasetObject;
  index: number;
  isLoaded: boolean;
}

export const DatasetCard = ({
  dataset,
  index,
  isLoaded,
}: DatasetCardProps) => {
  const dataTypeColor = getDataTypeColor(dataset.dataType);

  return (
    <Link
      to={`/datasets/${dataset.id}`}
      style={{ 
        textDecoration: "none",
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        transitionDelay: `${index * 50}ms`,
        minWidth: "320px",
        maxWidth: "100%",
      }}
      className={`${isLoaded ? "visible" : ''}`}
    >
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
          border: "none",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s cubic-bezier(0.25, 1, 0.5, 1)",
          cursor: "pointer",
          minWidth: "320px",
          maxWidth: "100%",
        }}
        className="datasetCard"
      >
        {/* 데이터셋 헤더 */}
        <Box
          style={{
            padding: "18px",
            background: `linear-gradient(45deg, ${dataTypeColor.bg}80, ${dataTypeColor.bg}40)`,
            position: "relative",
            overflow: "hidden",
            borderBottom: "none",
          }}
        >
          {/* 배경 장식 요소 */}
          <Box 
            style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${dataTypeColor.border}40, transparent)`,
              zIndex: 0,
            }}
          />
          
          <Flex justify="between" align="center" style={{ position: "relative", zIndex: 1 }}>
            <Flex align="center" gap="3">
              <Box
                style={{
                  background: "white",
                  color: dataTypeColor.text,
                  borderRadius: "12px",
                  width: "42px",
                  height: "42px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
                  border: "none",
                }}
              >
                {getDataTypeIcon(dataset.dataType)}
              </Box>
              <Box>
                <Badge
                  style={{
                    background: "white",
                    color: dataTypeColor.text,
                    padding: "4px 12px",
                    fontWeight: 600,
                    fontSize: "12px",
                    borderRadius: "20px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                    border: "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                  }}
                >
                  {dataset.dataType.split("/")[0]}
                </Badge>
                {dataset.license && (
                  <Text size="1" style={{ color: dataTypeColor.text, marginTop: "4px", marginLeft: "6px", opacity: 0.8 }}>
                    {dataset.license}
                  </Text>
                )}
              </Box>
            </Flex>
            
            <Tooltip content="Dataset Size">
              <Box 
                style={{
                  background: "white",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.08)",
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
                    background: dataTypeColor.text,
                  }} 
                />
                <Text
                  size="2"
                  style={{ 
                    color: dataTypeColor.text, 
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  {formatDataSize(dataset.dataSize)}
                </Text>
              </Box>
            </Tooltip>
          </Flex>
        </Box>

        {/* 데이터셋 콘텐츠 */}
        <Box 
          style={{ 
            padding: "20px", 
            flex: 1, 
            display: "flex", 
            flexDirection: "column",
            background: "linear-gradient(180deg, white, var(--gray-1))",
          }}
          className="datasetCardContent"
        >
          <Heading size="3" mb="2" style={{ fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.01em" }}>
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
              lineHeight: 1.6,
              flex: 1,
            }}
          >
            {dataset.description || "No description provided for this dataset."}
          </Text>

          <Separator size="4" style={{ 
            margin: "14px 0", 
            height: "1px", 
            background: "linear-gradient(90deg, var(--gray-4), transparent)" 
          }} />

          {/* 태그 */}
          {dataset.tags && dataset.tags.length > 0 && (
            <Flex gap="2" wrap="wrap" mb="3">
              {dataset.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge
                  key={tagIndex}
                  variant="surface"
                  radius="full"
                  style={{
                    padding: "3px 10px",
                    fontSize: "11px",
                    border: "none",
                    background: "var(--gray-3)",
                    color: "var(--gray-11)",
                    fontWeight: 500,
                  }}
                  className="tagBadge"
                >
                  {tag}
                </Badge>
              ))}
              {dataset.tags.length > 3 && (
                <Badge
                  variant="surface"
                  radius="full"
                  style={{
                    padding: "3px 10px",
                    fontSize: "11px",
                    background: "var(--accent-3)",
                    color: "var(--accent-11)",
                    fontWeight: 500,
                    border: "none",
                  }}
                  className="tagBadge"
                >
                  +{dataset.tags.length - 3}
                </Badge>
              )}
            </Flex>
          )}

          {/* 메타데이터 및 정보 */}
          <Flex justify="between" align="center" mt="auto" style={{ marginTop: "14px" }}>
            <Flex align="center" gap="2">
              <Avatar
                size="1"
                src={`https://api.dicebear.com/7.x/identicon/svg?seed=${dataset.creator}`}
                fallback={dataset.creator ? dataset.creator[0] : "U"}
                radius="full"
                style={{
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}
              />
              <Text size="1" style={{ fontWeight: 500, color: "var(--gray-10)" }}>
                {truncateAddress(dataset.creator || "", SUI_ADDRESS_DISPLAY_LENGTH)}
              </Text>
            </Flex>
            
            <Flex gap="3" align="center">
              <Tooltip content="Total items in dataset">
                <Flex 
                  align="center" 
                  gap="2" 
                  style={{ 
                    color: "var(--gray-10)",
                    background: "var(--gray-3)",
                    padding: "4px 10px",
                    borderRadius: "12px",
                  }}
                  className="statsCounter"
                >
                  <Database size={14} weight="bold" />
                  <Text size="1" style={{ fontWeight: 500 }}>
                    {dataset.dataCount}
                  </Text>
                </Flex>
              </Tooltip>
              <Tooltip content={`Created: ${new Date(dataset.createdAt).toLocaleDateString()}`}>
                <Text 
                  size="1" 
                  style={{ 
                    color: "var(--gray-10)", 
                    fontWeight: 500,
                    background: "var(--gray-3)",
                    padding: "4px 8px",
                    borderRadius: "12px",
                  }}
                  className="statsCounter"
                >
                  {new Date(dataset.createdAt).toLocaleDateString()}
                </Text>
              </Tooltip>
            </Flex>
          </Flex>
        </Box>
      </Card>
    </Link>
  );
}; 