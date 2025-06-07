import { Box, Flex, Text, Heading, Badge, Button, Avatar, Tooltip } from "@radix-ui/themes";
import { Database } from "phosphor-react";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { getDataTypeIcon, getDataTypeColor } from "../../utils";
import { getSuiScanUrl, getWalruScanUrl } from "@/shared/utils/sui";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "@/shared/constants/suiConfig";

interface DatasetHeaderProps {
  dataset: any;
  uniqueBlobId?: string;
}

export function DatasetHeader({ dataset, uniqueBlobId }: DatasetHeaderProps) {
  return (
    <Box style={{ marginBottom: "32px" }}>
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

      <Text size="4" style={{ color: "var(--gray-11)", lineHeight: "1.6", marginTop: "16px" }}>
        {dataset.description || "No description provided"}
      </Text>

      {dataset.tags && dataset.tags.length > 0 && (
        <Flex gap="2" wrap="wrap" style={{ marginTop: "16px" }}>
          {dataset.tags.map((tag: string, index: number) => (
            <Badge
              key={index}
              style={{
                background: "var(--gray-3)",
                color: "var(--gray-11)",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              {tag}
            </Badge>
          ))}
        </Flex>
      )}

      <Flex align="center" gap="3" style={{ marginTop: "16px" }}>
        <Avatar
          size="3"
          src=""
          fallback={dataset.creator ? dataset.creator[0] : "U"}
          radius="full"
          style={{
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
            boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
          }}
        />
        <Tooltip content="View creator on Sui Explorer">
          <Text
            size="3"
            style={{
              color: "var(--gray-11)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 0.2s ease",
              fontWeight: 500,
            }}
            className="hover-effect"
            onClick={() =>
              window.open(getSuiScanUrl("account", dataset.creator || ""), "_blank")
            }
          >
            Created by {dataset.creator
              ? `${dataset.creator.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...`
              : "Unknown"}
            <ExternalLinkIcon style={{ width: "14px", height: "14px", opacity: 0.7 }} />
          </Text>
        </Tooltip>
      </Flex>
    </Box>
  );
} 