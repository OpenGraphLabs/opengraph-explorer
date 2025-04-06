import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import {
  ModelOverviewTab,
  ModelFilesTab,
  ModelDataTab,
  ModelInferenceTab,
} from "../components/model";
import { getSuiScanUrl } from "../utils/sui";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "../constants/suiConfig";

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

export function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { model, loading, error } = useModelById(id || "");
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreatorHovered, setIsCreatorHovered] = useState(false);

  // Set page title
  useEffect(() => {
    if (model) {
      document.title = `${model.name} - OpenGraph`;
    } else {
      document.title = "Model Details - OpenGraph";
    }
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
              <Tabs.Trigger
                value="files"
                style={{
                  cursor: "pointer",
                  fontWeight: activeTab === "files" ? 700 : 500,
                  color: activeTab === "files" ? "#FF5733" : "#666",
                  transition: "all 0.3s ease",
                  padding: "8px 16px",
                }}
              >
                Files
              </Tabs.Trigger>
              <Tabs.Trigger
                value="model-data"
                style={{
                  cursor: "pointer",
                  fontWeight: activeTab === "model-data" ? 700 : 500,
                  color: activeTab === "model-data" ? "#FF5733" : "#666",
                  transition: "all 0.3s ease",
                  padding: "8px 16px",
                }}
              >
                Model Data
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

              {/* Files Tab */}
              <Tabs.Content value="files">
                <ModelFilesTab model={model} />
              </Tabs.Content>

              {/* Model Data Tab */}
              <Tabs.Content value="model-data">
                <ModelDataTab model={model} />
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
