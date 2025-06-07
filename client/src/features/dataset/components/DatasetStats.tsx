import { Box, Flex, Text, Card, Grid } from "@radix-ui/themes";
import { Database, ImageSquare, Tag } from "phosphor-react";
import { formatDataSize } from "../utils";

interface DatasetStatsProps {
  dataset: any;
}

export function DatasetStats({ dataset }: DatasetStatsProps) {
  const totalAnnotations = dataset.data?.reduce((sum: number, item: any) => sum + (item.annotations?.length || 0), 0) || 0;

  return (
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" style={{ marginBottom: "32px" }}>
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
              {formatDataSize(dataset.dataSize)}
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
            <ImageSquare size={20} style={{ color: "#2E7D32" }} />
          </Box>
          <Flex direction="column" gap="1">
            <Text size="2" style={{ color: "#1B5E20", fontWeight: 600, opacity: 0.8 }}>
              Total Items
            </Text>
            <Text size="5" style={{ fontWeight: 700, color: "#1B5E20" }}>
              {dataset.dataCount}
              <Text size="2" style={{ marginLeft: "4px", fontWeight: 500, opacity: 0.8 }}>
                files
              </Text>
            </Text>
          </Flex>
        </Flex>
      </Card>

      <Card
        style={{
          padding: "20px",
          background: "linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)",
          border: "1px solid #BA68C8",
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
            <Tag size={20} style={{ color: "#7B1FA2" }} />
          </Box>
          <Flex direction="column" gap="1">
            <Text size="2" style={{ color: "#4A148C", fontWeight: 600, opacity: 0.8 }}>
              Annotations
            </Text>
            <Text size="5" style={{ fontWeight: 700, color: "#4A148C" }}>
              {totalAnnotations}
              <Text size="2" style={{ marginLeft: "4px", fontWeight: 500, opacity: 0.8 }}>
                total
              </Text>
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Grid>
  );
} 