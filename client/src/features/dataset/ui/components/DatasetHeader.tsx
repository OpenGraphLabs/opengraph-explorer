import { Box, Flex, Heading, Text, Card, Badge, Button, Tooltip } from "@radix-ui/themes";
import { Database } from "phosphor-react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";
import { getSuiScanUrl, getWalruScanUrl } from "@/shared/utils/sui";

// 데이터 타입에 따른 아이콘 매핑
const DATA_TYPE_ICONS: Record<string, any> = {
  "image/png": <Database size={24} />,
  "image/jpeg": <Database size={24} />,
  "text/plain": <Database size={24} />,
  "text/csv": <Database size={24} />,
  "application/zip": <Database size={24} />,
  default: <Database size={24} />,
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

interface DatasetHeaderProps {
  dataset: DatasetObject;
  uniqueBlobId?: string;
}

export function DatasetHeader({ dataset, uniqueBlobId }: DatasetHeaderProps) {
  const getDataTypeIcon = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_ICONS[key];
  };

  const getDataTypeColor = (dataType: string) => {
    const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
    return DATA_TYPE_COLORS[key];
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
            {getDataTypeIcon(dataset.dataType)}
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
            {uniqueBlobId && (
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
                  onClick={() => window.open(getWalruScanUrl(uniqueBlobId), "_blank")}
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
      </Flex>
    </Card>
  );
} 