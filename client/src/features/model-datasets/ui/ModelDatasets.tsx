import { Box, Flex, Text, Card, Badge } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { Image, TextT, Database } from "phosphor-react";
import { DatasetObject } from "../../../shared/api/datasetGraphQLService";

interface ModelDatasetsProps {
  trainingDataset: DatasetObject | null;
  testDatasets: DatasetObject[];
  loading: boolean;
}

// Helper functions for dataset types
function getDataTypeColor(dataType: string) {
  switch (dataType.toLowerCase()) {
    case "image":
      return {
        bg: "rgba(59, 130, 246, 0.1)",
        text: "rgb(29, 78, 216)",
      };
    case "text":
      return {
        bg: "rgba(16, 185, 129, 0.1)",
        text: "rgb(6, 95, 70)",
      };
    default:
      return {
        bg: "rgba(107, 114, 128, 0.1)",
        text: "rgb(55, 65, 81)",
      };
  }
}

function getDataTypeIcon(dataType: string) {
  switch (dataType.toLowerCase()) {
    case "image":
      return <Image />;
    case "text":
      return <TextT />;
    default:
      return <Database />;
  }
}

export function ModelDatasets({ trainingDataset, testDatasets, loading }: ModelDatasetsProps) {
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card
          style={{
            padding: "28px",
            marginBottom: "28px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 87, 51, 0.1)",
          }}
        >
          <Text>Loading datasets...</Text>
        </Card>
      </motion.div>
    );
  }

  if (!trainingDataset && testDatasets.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card
        style={{
          padding: "28px",
          marginBottom: "28px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 87, 51, 0.1)",
        }}
      >
        <Flex direction="column" gap="6">
          {/* Training Dataset */}
          {trainingDataset && (
            <Box>
              <Flex align="center" gap="2" mb="4">
                <Database size={20} style={{ color: "#FF5733" }} />
                <Text size="4" style={{ fontWeight: 600, color: "#FF5733" }}>
                  Training Dataset
                </Text>
              </Flex>
              <Link to={`/datasets/${trainingDataset.id}`} style={{ textDecoration: "none" }}>
                <Card
                  style={{
                    padding: "20px",
                    background: "rgba(255, 255, 255, 0.7)",
                    border: "1px solid rgba(255, 87, 51, 0.1)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <Flex align="center" gap="4">
                    <Box
                      style={{
                        background: getDataTypeColor(trainingDataset.dataType).bg,
                        color: getDataTypeColor(trainingDataset.dataType).text,
                        borderRadius: "12px",
                        width: "48px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getDataTypeIcon(trainingDataset.dataType)}
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Text size="3" style={{ fontWeight: 600, color: "#1A1A1A" }}>
                        {trainingDataset.name}
                      </Text>
                      <Flex gap="3" align="center" mt="1">
                        <Badge
                          style={{
                            background: getDataTypeColor(trainingDataset.dataType).bg,
                            color: getDataTypeColor(trainingDataset.dataType).text,
                            padding: "4px 10px",
                            borderRadius: "6px",
                          }}
                        >
                          {trainingDataset.dataType}
                        </Badge>
                        <Text size="1" style={{ color: "var(--gray-11)" }}>
                          {trainingDataset.dataCount.toLocaleString()} files
                        </Text>
                      </Flex>
                    </Box>
                    <ExternalLinkIcon width="16" height="16" style={{ color: "#FF5733", opacity: 0.5 }} />
                  </Flex>
                </Card>
              </Link>
            </Box>
          )}

          {/* Test Datasets */}
          {testDatasets.length > 0 && (
            <Box>
              <Flex align="center" gap="2" mb="4">
                <Database size={20} style={{ color: "#FF8C66" }} />
                <Text size="4" style={{ fontWeight: 600, color: "#FF8C66" }}>
                  Test Datasets ({testDatasets.length})
                </Text>
              </Flex>
              <Flex direction="column" gap="3">
                {testDatasets.map(dataset => (
                  <Link key={dataset.id} to={`/datasets/${dataset.id}`} style={{ textDecoration: "none" }}>
                    <Card
                      style={{
                        padding: "20px",
                        background: "rgba(255, 255, 255, 0.7)",
                        border: "1px solid rgba(255, 87, 51, 0.1)",
                        borderRadius: "12px",
                        cursor: "pointer",
                      }}
                    >
                      <Flex align="center" gap="4">
                        <Box
                          style={{
                            background: getDataTypeColor(dataset.dataType).bg,
                            color: getDataTypeColor(dataset.dataType).text,
                            borderRadius: "12px",
                            width: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {getDataTypeIcon(dataset.dataType)}
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Text size="3" style={{ fontWeight: 600, color: "#1A1A1A" }}>
                            {dataset.name}
                          </Text>
                          <Flex gap="3" align="center" mt="1">
                            <Badge
                              style={{
                                background: getDataTypeColor(dataset.dataType).bg,
                                color: getDataTypeColor(dataset.dataType).text,
                                padding: "4px 10px",
                                borderRadius: "6px",
                              }}
                            >
                              {dataset.dataType}
                            </Badge>
                            <Text size="1" style={{ color: "var(--gray-11)" }}>
                              {dataset.dataCount.toLocaleString()} files
                            </Text>
                          </Flex>
                        </Box>
                        <ExternalLinkIcon width="16" height="16" style={{ color: "#FF8C66", opacity: 0.5 }} />
                      </Flex>
                    </Card>
                  </Link>
                ))}
              </Flex>
            </Box>
          )}
        </Flex>
      </Card>
    </motion.div>
  );
} 