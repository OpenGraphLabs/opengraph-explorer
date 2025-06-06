import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Badge,
  Grid,
  Button,
  Tooltip,
} from "@radix-ui/themes";
import { Database } from "phosphor-react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { DatasetObject } from "../types";
import { getSuiScanUrl } from "../../../shared/lib/sui";

interface DatasetHeaderProps {
  dataset: DatasetObject;
  onBlobScanClick?: (blobId: string) => void;
}

export function DatasetHeader({ dataset, onBlobScanClick }: DatasetHeaderProps) {
  const getDataTypeIcon = () => {
    // You can expand this based on your icon mapping logic
    return <Database size={24} />;
  };

  const getDataTypeColor = (dataType: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      "image/png": { bg: "#E8F5E9", text: "#2E7D32" },
      "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32" },
      "text/plain": { bg: "#E3F2FD", text: "#1565C0" },
      "text/csv": { bg: "#E0F7FA", text: "#00838F" },
      "application/zip": { bg: "#FFF3E0", text: "#E65100" },
      default: { bg: "#F3E8FD", text: "#7E22CE" },
    };
    return colors[dataType] || colors.default;
  };

  const formatDataSize = (size: string | number): { value: string; unit: string } => {
    const sizeNum = typeof size === 'string' ? parseInt(size) : size;
    if (sizeNum < 1024) return { value: sizeNum.toString(), unit: 'B' };
    if (sizeNum < 1024 * 1024) return { value: (sizeNum / 1024).toFixed(1), unit: 'KB' };
    if (sizeNum < 1024 * 1024 * 1024) return { value: (sizeNum / (1024 * 1024)).toFixed(1), unit: 'MB' };
    return { value: (sizeNum / (1024 * 1024 * 1024)).toFixed(1), unit: 'GB' };
  };

  const getUniqueBlobId = () => {
    if (!dataset?.data?.length) return null;
    return dataset.data[0]?.blobId || null;
  };

  return (
    <Card
      style={{
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        marginBottom: "32px",
        border: "1px solid var(--gray-4)",
        background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
      }}
    >
      <Flex direction="column" gap="6">
        <Flex align="center" gap="4">
          <Box
            style={{
              background: getDataTypeColor(dataset.dataType).bg,
              color: getDataTypeColor(dataset.dataType).text,
              borderRadius: "12px",
              width: "56px",
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {getDataTypeIcon()}
          </Box>
          <Box style={{ flex: 1 }}>
            <Heading size="7" mb="2" style={{ fontWeight: 700 }}>
              {dataset.name}
            </Heading>
            <Flex align="center" gap="3">
              <Badge
                style={{
                  background: getDataTypeColor(dataset.dataType).bg,
                  color: getDataTypeColor(dataset.dataType).text,
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                {dataset.dataType}
              </Badge>
              <Badge
                style={{
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                  color: "white",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                On-Chain Dataset
              </Badge>
            </Flex>
          </Box>
          <Flex gap="3">
            {getUniqueBlobId() && onBlobScanClick && (
              <Tooltip content="View dataset blob on WalrusScan">
                <Button
                  variant="soft"
                  style={{
                    borderRadius: "12px",
                    background: "#E0F7FA",
                    color: "#00838F",
                    border: "1px solid #B2EBF2",
                    padding: "0 20px",
                    height: "40px",
                  }}
                  onClick={() => onBlobScanClick(getUniqueBlobId()!)}
                >
                  <Flex align="center" gap="2">
                    <Database size={16} />
                    <Text size="2" weight="medium">WalrusScan</Text>
                    <ExternalLinkIcon />
                  </Flex>
                </Button>
              </Tooltip>
            )}
            <Tooltip content="View dataset on Sui Explorer">
              <Button
                variant="soft"
                style={{
                  borderRadius: "12px",
                  background: "#FFF4F2",
                  color: "#FF5733",
                  border: "1px solid #FFE8E2",
                  padding: "0 20px",
                  height: "40px",
                }}
                onClick={() => window.open(getSuiScanUrl("object", dataset.id), "_blank")}
              >
                <Flex align="center" gap="2">
                  <Text size="2" weight="medium">Sui Explorer</Text>
                  <ExternalLinkIcon />
                </Flex>
              </Button>
            </Tooltip>
          </Flex>
        </Flex>

        <Text size="4" style={{ color: "var(--gray-11)", lineHeight: "1.6" }}>
          {dataset.description || "No description provided"}
        </Text>

        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          <Card
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
              border: "1px solid #90CAF9",
              borderRadius: "12px",
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Database size={20} style={{ color: "#1565C0" }} />
              </Box>
              <Flex direction="column" gap="1">
                <Text size="2" style={{ color: "#0D47A1", fontWeight: 600, opacity: 0.8 }}>
                  Total Size
                </Text>
                <Text size="5" style={{ fontWeight: 700, color: "#0D47A1" }}>
                  {formatDataSize(dataset.dataSize).value}
                  <Text size="2" style={{ marginLeft: "4px", fontWeight: 500, opacity: 0.8 }}>
                    {formatDataSize(dataset.dataSize).unit}
                  </Text>
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
              border: "1px solid #A5D6A7",
              borderRadius: "12px",
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Database size={20} style={{ color: "#2E7D32" }} />
              </Box>
              <Flex direction="column" gap="1">
                <Text size="2" style={{ color: "#1B5E20", fontWeight: 600, opacity: 0.8 }}>
                  Total Items
                </Text>
                <Text size="5" style={{ fontWeight: 700, color: "#1B5E20" }}>
                  {dataset.data?.length || 0}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, #FFF3E0 0%, #FFCC02 100%)",
              border: "1px solid #FFB74D",
              borderRadius: "12px",
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Database size={20} style={{ color: "#E65100" }} />
              </Box>
              <Flex direction="column" gap="1">
                <Text size="2" style={{ color: "#BF360C", fontWeight: 600, opacity: 0.8 }}>
                  Annotations
                </Text>
                <Text size="5" style={{ fontWeight: 700, color: "#BF360C" }}>
                  {dataset.data?.reduce((sum: number, item: any) => sum + item.annotations.length, 0) || 0}
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Grid>

        {dataset.tags && dataset.tags.length > 0 && (
          <Flex wrap="wrap" gap="2">
            {dataset.tags.map((tag: any, index: number) => (
              <Badge
                key={index}
                style={{
                  background: "#F8F9FA",
                  color: "#495057",
                  border: "1px solid #DEE2E6",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "11px",
                }}
              >
                {tag}
              </Badge>
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
} 