import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  Button,
  Avatar,
  Badge,
  Card,
  Tooltip,
} from "@radix-ui/themes";
import { HeartIcon, DownloadIcon, Share1Icon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { useModelById } from "../hooks/useModels";
import { ModelOverviewTab, ModelInferenceTab } from "../components/model";
import { getSuiScanUrl } from "../utils/sui";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../constants/suiConfig";
import { datasetGraphQLService, DatasetObject } from "../services/datasetGraphQLService";
import { Image, TextT, Database } from "phosphor-react";

// Style for creator link hover effect
const creatorLinkStyle = {
  fontWeight: 500,
  cursor: "pointer",
  transition: "color 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const creatorLinkHoverStyle = {
  ...creatorLinkStyle,
  color: "#FF5733",
};

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

export function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { model, loading, error } = useModelById(id || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreatorHovered, setIsCreatorHovered] = useState(false);
  const [trainingDataset, setTrainingDataset] = useState<DatasetObject | null>(null);
  const [testDatasets, setTestDatasets] = useState<DatasetObject[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);

  // Set page title
  useEffect(() => {
    if (model) {
      document.title = `${model.name} - OpenGraph`;
    } else {
      document.title = "Model Details - OpenGraph";
    }
  }, [model]);

  // 데이터셋 정보 가져오기
  useEffect(() => {
    const fetchDatasets = async () => {
      if (!model) return;

      setDatasetsLoading(true);
      try {
        if (model.training_dataset_id) {
          const trainingData = await datasetGraphQLService.getDatasetById(
            model.training_dataset_id
          );
          setTrainingDataset(trainingData);
        }

        if (model.test_dataset_ids && model.test_dataset_ids.length > 0) {
          const testData = await Promise.all(
            model.test_dataset_ids.map(id => datasetGraphQLService.getDatasetById(id))
          );
          setTestDatasets(testData.filter(dataset => dataset !== null) as DatasetObject[]);
        }
      } catch (error) {
        console.error("Error fetching datasets:", error);
      } finally {
        setDatasetsLoading(false);
      }
    };

    fetchDatasets();
  }, [model]);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <Flex direction="column" align="center" gap="4" py="9">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              border: "3px solid #FF5733",
              borderTopColor: "transparent",
              animation: "spin 1s linear infinite",
            }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Text size="3">Loading model data...</Text>
        </motion.div>
      </Flex>
    );
  }

  // Show error if model not found or error occurred
  if (error || !model) {
    return (
      <Flex direction="column" align="center" gap="4" py="9">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#FFEBE8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#FF5733",
            }}
          >
            !
          </Box>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Text size="3">{error || "Model not found."}</Text>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button variant="soft" onClick={() => window.history.back()}>
            Return to previous page
          </Button>
        </motion.div>
      </Flex>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box>
        {/* Model Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            style={{
              padding: "28px",
              marginBottom: "28px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FFF4F2 0%, #FFFFFF 100%)",
              boxShadow: "0 8px 20px rgba(255, 87, 51, 0.1)",
              border: "1px solid #FFE8E2",
            }}
          >
            <Flex justify="between" align="start">
              <Box>
                <Heading
                  size="8"
                  style={{
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #FF5733 0%, #FF8C66 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {model.name}
                </Heading>
                <Flex align="center" gap="3" mt="2">
                  <Avatar
                    size="2"
                    fallback={model.creator[0]}
                    style={{
                      background: "#FF5733",
                      boxShadow: "0 3px 8px rgba(255, 87, 51, 0.2)",
                    }}
                  />
                  <Tooltip content="View creator on Sui Explorer">
                    <Text
                      size="2"
                      style={isCreatorHovered ? creatorLinkHoverStyle : creatorLinkStyle}
                      onClick={() => window.open(getSuiScanUrl("account", model.creator), "_blank")}
                      onMouseEnter={() => setIsCreatorHovered(true)}
                      onMouseLeave={() => setIsCreatorHovered(false)}
                    >
                      {model.creator.length > SUI_ADDRESS_DISPLAY_LENGTH
                        ? model.creator.slice(0, SUI_ADDRESS_DISPLAY_LENGTH) + "..."
                        : model.creator}
                      <ExternalLinkIcon style={{ width: "12px", height: "12px", opacity: 0.7 }} />
                    </Text>
                  </Tooltip>
                  <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                    On-Chain Model
                  </Badge>
                </Flex>
              </Box>

              <Flex gap="3">
                <Button
                  variant="soft"
                  style={{
                    borderRadius: "8px",
                    background: "#FFF4F2",
                    color: "#FF5733",
                    border: "1px solid #FFE8E2",
                    transition: "all 0.2s ease",
                  }}
                  className="hover-effect"
                >
                  <HeartIcon style={{ color: "#FF5733" }} />
                  <Text>{model.likes || 0}</Text>
                </Button>
                <Button
                  variant="soft"
                  style={{
                    borderRadius: "8px",
                    background: "#FFF4F2",
                    color: "#FF5733",
                    border: "1px solid #FFE8E2",
                    transition: "all 0.2s ease",
                  }}
                  className="hover-effect"
                >
                  <DownloadIcon style={{ color: "#FF5733" }} />
                  <Text>{model.downloads || 0}</Text>
                </Button>
                <Button
                  variant="soft"
                  style={{
                    borderRadius: "8px",
                    background: "#FFF4F2",
                    color: "#FF5733",
                    border: "1px solid #FFE8E2",
                    transition: "all 0.2s ease",
                  }}
                  className="hover-effect"
                >
                  <Share1Icon style={{ color: "#FF5733" }} />
                </Button>
                <Button
                  variant="soft"
                  style={{
                    borderRadius: "8px",
                    background: "#FFF4F2",
                    color: "#FF5733",
                    border: "1px solid #FFE8E2",
                    transition: "all 0.2s ease",
                  }}
                  className="hover-effect"
                  onClick={() => window.open(getSuiScanUrl("object", model.id), "_blank")}
                >
                  <Flex align="center" gap="2">
                    <Text size="2">View on Sui Explorer</Text>
                    <ExternalLinkIcon />
                  </Flex>
                </Button>
              </Flex>
            </Flex>

            <Box mt="5">
              <Text
                style={{
                  fontSize: "16px",
                  lineHeight: "1.7",
                  color: "#444",
                  letterSpacing: "0.01em",
                }}
              >
                {model.description}
              </Text>
            </Box>

            <Flex gap="4" mt="5">
              <Box
                style={{
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  border: "1px solid #FFE8E2",
                  padding: "10px 14px",
                  boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
                }}
              >
                <Flex align="center" gap="2">
                  <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                    Task: {getTaskName(model.task_type)}
                  </Text>
                </Flex>
              </Box>
              <Box
                style={{
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  border: "1px solid #FFE8E2",
                  padding: "10px 14px",
                  boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
                }}
              >
                <Flex align="center" gap="2">
                  <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                    License: MIT
                  </Text>
                </Flex>
              </Box>
              <Box
                style={{
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  border: "1px solid #FFE8E2",
                  padding: "10px 14px",
                  boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
                }}
              >
                <Flex align="center" gap="2">
                  <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                    Layers: {model.graphs?.[0]?.layers?.length || 0}
                  </Text>
                </Flex>
              </Box>
              <Box
                style={{
                  borderRadius: "8px",
                  background: "#FFFFFF",
                  border: "1px solid #FFE8E2",
                  padding: "10px 14px",
                  boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
                }}
              >
                <Flex align="center" gap="2">
                  <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                    Created: {new Date(model.createdAt).toLocaleDateString()}
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Card>
        </motion.div>

        {/* Dataset Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            style={{
              padding: "32px",
              marginBottom: "28px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #FFFFFF 0%, #FFF4F2 100%)",
              boxShadow: "0 8px 32px rgba(255, 87, 51, 0.08)",
              border: "1px solid #FFE8E2",
            }}
          >
            <Flex justify="between" align="center" mb="4">
              <Heading
                size="4"
                style={{
                  background: "linear-gradient(90deg, #FF5733 0%, #FF8C66 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 600,
                }}
              >
                Associated Datasets
              </Heading>
              <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                {trainingDataset ? "1" : "0"} Training + {testDatasets.length} Test
              </Badge>
            </Flex>

            {datasetsLoading ? (
              <Flex
                align="center"
                justify="center"
                py="6"
                style={{ background: "rgba(255, 255, 255, 0.5)", borderRadius: "12px" }}
              >
                <Box
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "2px solid #FF5733",
                    borderTopColor: "transparent",
                    animation: "spin 1s linear infinite",
                    marginRight: "12px",
                  }}
                />
                <Text size="2" style={{ color: "#FF5733" }}>
                  Loading datasets...
                </Text>
              </Flex>
            ) : (
              <Flex direction="column" gap="5">
                {/* Training Dataset */}
                <Box>
                  <Flex align="center" gap="2" mb="3">
                    <Box
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#FF5733",
                      }}
                    />
                    <Text
                      size="2"
                      style={{
                        fontWeight: 600,
                        color: "#FF5733",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Training Dataset
                    </Text>
                  </Flex>
                  {trainingDataset ? (
                    <Link to={`/datasets/${trainingDataset.id}`} style={{ textDecoration: "none" }}>
                      <Card
                        style={{
                          padding: "20px",
                          background: "rgba(255, 255, 255, 0.7)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid rgba(255, 87, 51, 0.1)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        className="hover-effect"
                      >
                        <Box
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background: "linear-gradient(to bottom, #FF5733, #FF8C66)",
                          }}
                        />
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
                              fontSize: "24px",
                            }}
                          >
                            {getDataTypeIcon(trainingDataset.dataType)}
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <Text
                              size="3"
                              style={{
                                fontWeight: 600,
                                marginBottom: "6px",
                                color: "#1A1A1A",
                              }}
                            >
                              {trainingDataset.name}
                            </Text>
                            <Flex gap="3" align="center">
                              <Badge
                                style={{
                                  background: getDataTypeColor(trainingDataset.dataType).bg,
                                  color: getDataTypeColor(trainingDataset.dataType).text,
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                }}
                              >
                                {trainingDataset.dataType}
                              </Badge>
                              <Text
                                size="1"
                                style={{
                                  color: "var(--gray-11)",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Database size={12} />
                                {trainingDataset.dataCount.toLocaleString()} files
                              </Text>
                            </Flex>
                          </Box>
                          <Box
                            style={{
                              color: "#FF5733",
                              opacity: 0.5,
                              transition: "all 0.3s ease",
                            }}
                          >
                            <ExternalLinkIcon width="16" height="16" />
                          </Box>
                        </Flex>
                      </Card>
                    </Link>
                  ) : (
                    <Card
                      style={{
                        padding: "20px",
                        background: "rgba(255, 255, 255, 0.7)",
                        border: "1px dashed rgba(255, 87, 51, 0.2)",
                        borderRadius: "12px",
                      }}
                    >
                      <Text size="2" style={{ color: "var(--gray-11)", textAlign: "center" }}>
                        No training dataset associated
                      </Text>
                    </Card>
                  )}
                </Box>

                {/* Test Datasets */}
                <Box>
                  <Flex align="center" gap="2" mb="3">
                    <Box
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#FF8C66",
                      }}
                    />
                    <Text
                      size="2"
                      style={{
                        fontWeight: 600,
                        color: "#FF8C66",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Test Datasets {testDatasets.length > 0 && `(${testDatasets.length})`}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="3">
                    {testDatasets.length > 0 ? (
                      testDatasets.map(dataset => (
                        <Link
                          key={dataset.id}
                          to={`/datasets/${dataset.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <Card
                            style={{
                              padding: "20px",
                              background: "rgba(255, 255, 255, 0.7)",
                              backdropFilter: "blur(8px)",
                              border: "1px solid rgba(255, 87, 51, 0.1)",
                              borderRadius: "12px",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              position: "relative",
                              overflow: "hidden",
                            }}
                            className="hover-effect"
                          >
                            <Box
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "4px",
                                height: "100%",
                                background: "linear-gradient(to bottom, #FF8C66, #FFAA99)",
                              }}
                            />
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
                                  fontSize: "24px",
                                }}
                              >
                                {getDataTypeIcon(dataset.dataType)}
                              </Box>
                              <Box style={{ flex: 1 }}>
                                <Text
                                  size="3"
                                  style={{
                                    fontWeight: 600,
                                    marginBottom: "6px",
                                    color: "#1A1A1A",
                                  }}
                                >
                                  {dataset.name}
                                </Text>
                                <Flex gap="3" align="center">
                                  <Badge
                                    style={{
                                      background: getDataTypeColor(dataset.dataType).bg,
                                      color: getDataTypeColor(dataset.dataType).text,
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                    }}
                                  >
                                    {dataset.dataType}
                                  </Badge>
                                  <Text
                                    size="1"
                                    style={{
                                      color: "var(--gray-11)",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                  >
                                    <Database size={12} />
                                    {dataset.dataCount.toLocaleString()} files
                                  </Text>
                                </Flex>
                              </Box>
                              <Box
                                style={{
                                  color: "#FF8C66",
                                  opacity: 0.5,
                                  transition: "all 0.3s ease",
                                }}
                              >
                                <ExternalLinkIcon width="16" height="16" />
                              </Box>
                            </Flex>
                          </Card>
                        </Link>
                      ))
                    ) : (
                      <Card
                        style={{
                          padding: "20px",
                          background: "rgba(255, 255, 255, 0.7)",
                          border: "1px dashed rgba(255, 87, 51, 0.2)",
                          borderRadius: "12px",
                        }}
                      >
                        <Text size="2" style={{ color: "var(--gray-11)", textAlign: "center" }}>
                          No test datasets associated
                        </Text>
                      </Card>
                    )}
                  </Flex>
                </Box>
              </Flex>
            )}
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs.Root
            value={activeTab}
            onValueChange={setActiveTab}
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
            }}
          >
            <Tabs.List
              style={{
                background: "#FFF4F2",
                padding: "10px 20px",
                borderBottom: "1px solid #FFE8E2",
              }}
            >
              <Tabs.Trigger
                value="overview"
                style={{
                  cursor: "pointer",
                  fontWeight: activeTab === "overview" ? 700 : 500,
                  color: activeTab === "overview" ? "#FF5733" : "#666",
                  transition: "all 0.3s ease",
                  padding: "8px 16px",
                }}
              >
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger
                value="inference"
                style={{
                  cursor: "pointer",
                  fontWeight: activeTab === "inference" ? 700 : 500,
                  color: activeTab === "inference" ? "#FF5733" : "#666",
                  transition: "all 0.3s ease",
                  padding: "8px 16px",
                }}
              >
                On-Chain Inference
              </Tabs.Trigger>
            </Tabs.List>

            <Box py="5" px="4" style={{ background: "white" }}>
              {/* Overview Tab */}
              <Tabs.Content value="overview">
                <ModelOverviewTab model={model} />
              </Tabs.Content>

              {/* Inference Tab */}
              <Tabs.Content value="inference">
                <ModelInferenceTab model={model} />
              </Tabs.Content>
            </Box>
          </Tabs.Root>
        </motion.div>
      </Box>
    </motion.div>
  );
}

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    translation: "Translation",
  };
  return taskMap[taskId] || taskId;
}
