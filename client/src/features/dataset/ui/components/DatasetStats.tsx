import { Flex, Text, Card, Grid, Box, Avatar } from "@radix-ui/themes";
import { Database, ImageSquare, Users } from "phosphor-react";
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "@/shared/constants/suiConfig";

interface DatasetStatsProps {
  dataset: DatasetObject;
}

export function DatasetStats({ dataset }: DatasetStatsProps) {
  const formatDataSize = (size: string | number): { value: string; unit: string } => {
    const numSize = typeof size === "string" ? parseInt(size) : Number(size);
    if (numSize < 1024) return { value: numSize.toString(), unit: "B" };
    if (numSize < 1024 * 1024) {
      return {
        value: (numSize / 1024).toFixed(1),
        unit: "KB",
      };
    }
    return {
      value: (numSize / (1024 * 1024)).toFixed(1),
      unit: "MB",
    };
  };

  return (
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" mb="6">
      {/* Total Size */}
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

      {/* Data Count */}
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
            <ImageSquare size={20} style={{ color: "#2E7D32" }} />
          </Box>
          <Flex direction="column" gap="1">
            <Text size="2" style={{ color: "#1B5E20", fontWeight: 600, opacity: 0.8 }}>
              Data Count
            </Text>
            <Text size="5" style={{ fontWeight: 700, color: "#1B5E20" }}>
              {dataset.dataCount}
              <Text size="2" style={{ marginLeft: "4px", fontWeight: 500, opacity: 0.8 }}>
                items
              </Text>
            </Text>
          </Flex>
        </Flex>
      </Card>

      {/* Creator */}
      <Card
        style={{
          padding: "20px",
          background: "linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%)",
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
            <Users size={20} style={{ color: "#E65100" }} />
          </Box>
          <Flex direction="column" gap="1">
            <Text size="2" style={{ color: "#BF360C", fontWeight: 600, opacity: 0.8 }}>
              Creator
            </Text>
            <Flex align="center" gap="2">
              <Avatar size="1" fallback={dataset.creator?.[0] || "U"} />
              <Text size="3" style={{ fontWeight: 600, color: "#BF360C" }}>
                {dataset.creator?.slice(0, SUI_ADDRESS_DISPLAY_LENGTH) || "Unknown"}...
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Grid>
  );
} 