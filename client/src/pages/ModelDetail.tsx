import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  Badge,
  Card,
  LoadingSpinner,
  Button,
  Grid,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { motion } from "framer-motion";
import { useModelById } from "@/shared/hooks/useModels";
import { ModelOverviewTab, ModelInferenceTab } from "@/features/model";
import { datasetGraphQLService, DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";
import {
  Brain,
  Database,
  Lightning,
  Cube,
  Activity,
  Code,
  Gear,
  Eye,
  Play,
  CheckCircle,
} from "phosphor-react";
import { SUI_ADDRESS_DISPLAY_LENGTH } from "@/shared/constants/suiConfig";
import { getSuiScanUrl } from "@/shared/utils/sui";

export function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { model, loading, error } = useModelById(id || "");
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("overview");
  const [trainingDataset, setTrainingDataset] = useState<DatasetObject | null>(null);
  const [testDatasets, setTestDatasets] = useState<DatasetObject[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);

  // Set page title
  useEffect(() => {
    if (model) {
      document.title = `${model.name} - OpenGraph AI Model`;
    } else {
      document.title = "AI Model Details - OpenGraph";
    }
  }, [model]);

  // Fetch datasets information
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

  // Loading state with enhanced design
  if (loading) {
    return (
      <Box
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.primary}10, ${theme.colors.background.secondary}50)`,
          minHeight: "100vh",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{ minHeight: "70vh" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Box
              style={{
                position: "relative",
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Animated background rings */}
              <Box
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: theme.borders.radius.full,
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}20, ${theme.colors.interactive.accent}20)`,
                  animation: "pulse 2s infinite",
                }}
              />
              <Box
                style={{
                  position: "absolute",
                  width: "120%",
                  height: "120%",
                  borderRadius: theme.borders.radius.full,
                  border: `2px solid ${theme.colors.interactive.primary}15`,
                  animation: "spin 3s linear infinite",
                }}
              />
              <Brain size={32} style={{ color: theme.colors.interactive.primary }} />
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ textAlign: "center" }}
          >
            <Heading
              size="5"
              style={{
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
                background: theme.gradients.primary,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Loading AI Model
            </Heading>
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                letterSpacing: "0.02em",
              }}
            >
              Retrieving neural network architecture...
            </Text>
          </motion.div>
        </Flex>
      </Box>
    );
  }

  // Error state with enhanced design
  if (error || !model) {
    return (
      <Box
        style={{
          background: `linear-gradient(135deg, ${theme.colors.background.primary}, ${theme.colors.background.secondary}50)`,
          minHeight: "100vh",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="6"
          style={{ minHeight: "70vh" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              style={{
                padding: theme.spacing.semantic.container.xl,
                background: theme.colors.background.card,
                border: `1px solid ${theme.colors.status.error}20`,
                borderRadius: theme.borders.radius.lg,
                boxShadow: theme.shadows.semantic.card.medium,
                textAlign: "center",
                maxWidth: "500px",
              }}
            >
              <Box
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: theme.borders.radius.full,
                  background: `${theme.colors.status.error}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: `0 auto ${theme.spacing.semantic.component.md}`,
                }}
              >
                <Brain size={28} style={{ color: theme.colors.status.error }} />
              </Box>

              <Heading
                size="4"
                style={{
                  fontWeight: theme.typography.h4.fontWeight,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.sm,
                }}
              >
                Model Not Found
              </Heading>

              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.6,
                  marginBottom: theme.spacing.semantic.component.lg,
                }}
              >
                {error || "The requested AI model could not be found in the onchain registry."}
              </Text>

              <Button
                onClick={() => window.history.back()}
                style={{
                  background: theme.colors.interactive.primary,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                  fontWeight: theme.typography.label.fontWeight,
                  cursor: "pointer",
                  transition: theme.animations.transitions.all,
                }}
              >
                Return to Registry
              </Button>
            </Card>
          </motion.div>
        </Flex>
      </Box>
    );
  }

  // Calculate model metrics for header display
  const layerCount = model?.graphs?.[0]?.layers?.length || 0;
  const totalParams =
    model?.graphs?.[0]?.layers?.reduce((total, layer) => {
      const weightCount = layer.weight_tensor?.magnitude?.length || 0;
      const biasCount = layer.bias_tensor?.magnitude?.length || 0;
      return total + weightCount + biasCount;
    }, 0) || 0;

  return (
    <Box
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background.primary}, ${theme.colors.background.secondary}20)`,
        minHeight: "100vh",
        padding: theme.spacing.semantic.layout.md,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ maxWidth: "1400px", margin: "0 auto" }}
      >
        {/* Compact Model Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card
            style={{
              padding: theme.spacing.semantic.component.xl,
              marginBottom: theme.spacing.semantic.layout.md,
              borderRadius: theme.borders.radius.lg,
              background: theme.colors.background.card,
              boxShadow: theme.shadows.semantic.card.medium,
              border: `1px solid ${theme.colors.border.primary}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background pattern */}
            <Box
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "150px",
                height: "150px",
                background: `radial-gradient(circle, ${theme.colors.interactive.primary}06, transparent 60%)`,
                borderRadius: theme.borders.radius.full,
                transform: "translate(50px, -50px)",
              }}
            />

            <Grid columns={{ initial: "1", md: "3" }} gap="6" align="center">
              {/* Model Info */}
              <Flex direction="column" gap="3" style={{ gridColumn: "1 / 3" }}>
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: theme.borders.radius.md,
                      background: theme.gradients.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: theme.shadows.semantic.interactive.default,
                    }}
                  >
                    <Brain size={20} style={{ color: theme.colors.text.inverse }} />
                  </Box>
                  <Badge
                    style={{
                      backgroundColor: theme.colors.background.accent,
                      color: theme.colors.text.brand,
                      borderRadius: theme.borders.radius.sm,
                      fontSize: "11px",
                      fontWeight: theme.typography.label.fontWeight,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    Onchain Neural Network
                  </Badge>
                </Flex>

                <Heading
                  size="6"
                  style={{
                    fontWeight: 700,
                    background: theme.gradients.primary,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: theme.spacing.semantic.component.xs,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {model.name}
                </Heading>

                <Text
                  size="3"
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: 1.5,
                    letterSpacing: "0.01em",
                  }}
                >
                  {model.description}
                </Text>

                {/* Quick Stats */}
                <Flex gap="6" align="center" mt="2">
                  <Flex align="center" gap="2">
                    <Activity size={14} style={{ color: theme.colors.interactive.accent }} />
                    <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
                      {layerCount} Layers
                    </Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Code size={14} style={{ color: theme.colors.interactive.accent }} />
                    <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
                      {totalParams.toLocaleString()} Parameters
                    </Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Gear size={14} style={{ color: theme.colors.interactive.accent }} />
                    <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
                      {model.task_type.charAt(0).toUpperCase() +
                        model.task_type.slice(1).replace(/-/g, " ")}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>

              {/* Action buttons */}
              <Flex direction="column" gap="2" align="end" style={{ gridColumn: "3 / 4" }}>
                <Button
                  style={{
                    background: theme.colors.interactive.primary,
                    color: theme.colors.text.inverse,
                    border: "none",
                    borderRadius: theme.borders.radius.md,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    fontWeight: theme.typography.label.fontWeight,
                    cursor: "pointer",
                    transition: theme.animations.transitions.all,
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    fontSize: "14px",
                  }}
                  onClick={() => setActiveTab("inference")}
                >
                  <Play size={12} weight="fill" />
                  Run Inference
                </Button>
                <Button
                  style={{
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.md,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    fontWeight: theme.typography.label.fontWeight,
                    cursor: "pointer",
                    transition: theme.animations.transitions.all,
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    fontSize: "14px",
                  }}
                >
                  <Eye size={12} />
                  Inspect
                </Button>
              </Flex>
            </Grid>
          </Card>
        </motion.div>

        {/* Main Content with Sidebar Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Grid columns={{ initial: "1", lg: "3" }} gap="6">
            {/* Main Content Area */}
            <Box style={{ gridColumn: "1 / 3" }}>
              <Tabs.Root
                value={activeTab}
                onValueChange={setActiveTab}
                style={{
                  borderRadius: theme.borders.radius.lg,
                  overflow: "hidden",
                  boxShadow: theme.shadows.semantic.card.medium,
                  backgroundColor: theme.colors.background.card,
                  border: `1px solid ${theme.colors.border.primary}`,
                }}
              >
                <Tabs.List
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    padding: theme.spacing.semantic.component.sm,
                    borderBottom: `1px solid ${theme.colors.border.primary}`,
                    display: "flex",
                    gap: theme.spacing.semantic.component.xs,
                  }}
                >
                  <Tabs.Trigger
                    value="overview"
                    style={{
                      cursor: "pointer",
                      fontWeight: theme.typography.label.fontWeight,
                      color:
                        activeTab === "overview"
                          ? theme.colors.text.inverse
                          : theme.colors.text.secondary,
                      background:
                        activeTab === "overview" ? theme.colors.interactive.primary : "transparent",
                      transition: theme.animations.transitions.all,
                      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                      borderRadius: theme.borders.radius.md,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.xs,
                      fontSize: "14px",
                    }}
                  >
                    <Cube size={14} />
                    Architecture Overview
                  </Tabs.Trigger>
                  <Tabs.Trigger
                    value="inference"
                    style={{
                      cursor: "pointer",
                      fontWeight: theme.typography.label.fontWeight,
                      color:
                        activeTab === "inference"
                          ? theme.colors.text.inverse
                          : theme.colors.text.secondary,
                      background:
                        activeTab === "inference"
                          ? theme.colors.interactive.primary
                          : "transparent",
                      transition: theme.animations.transitions.all,
                      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                      borderRadius: theme.borders.radius.md,
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.xs,
                      fontSize: "14px",
                    }}
                  >
                    <Lightning size={14} />
                    Onchain Inference
                  </Tabs.Trigger>
                </Tabs.List>

                <Box py="5" px="4" style={{ backgroundColor: theme.colors.background.card }}>
                  <Tabs.Content value="overview">
                    <ModelOverviewTab model={model} />
                  </Tabs.Content>

                  <Tabs.Content value="inference">
                    <ModelInferenceTab model={model} />
                  </Tabs.Content>
                </Box>
              </Tabs.Root>
            </Box>

            {/* Compact Sidebar */}
            <Box style={{ gridColumn: "3 / 4" }}>
              <Flex direction="column" gap="4">
                {/* Model Metadata Card */}
                <Card
                  style={{
                    padding: theme.spacing.semantic.component.lg,
                    background: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.lg,
                    boxShadow: theme.shadows.semantic.card.low,
                  }}
                >
                  <Flex align="center" gap="2" mb="4">
                    <Brain size={16} style={{ color: theme.colors.interactive.primary }} />
                    <Heading
                      size="3"
                      style={{
                        color: theme.colors.text.primary,
                        fontWeight: theme.typography.h5.fontWeight,
                      }}
                    >
                      Model Info
                    </Heading>
                  </Flex>

                  <Flex direction="column" gap="3">
                    <Box>
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.tertiary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: theme.typography.label.fontWeight,
                          marginBottom: "4px",
                        }}
                      >
                        Model id
                      </Text>
                      <Text
                        size="2"
                        style={{
                          fontFamily: "monospace",
                          color: theme.colors.text.brand,
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontWeight: 500,
                          marginLeft: "6px",
                        }}
                        onClick={() => window.open(getSuiScanUrl("object", model.id), "_blank")}
                      >
                        {model.id.substring(0, SUI_ADDRESS_DISPLAY_LENGTH)}...
                      </Text>
                    </Box>

                    <Box>
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.tertiary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          fontWeight: theme.typography.label.fontWeight,
                          marginBottom: "4px",
                        }}
                      >
                        Deployed
                      </Text>
                      <Text
                        size="2"
                        style={{
                          color: theme.colors.text.secondary,
                          fontWeight: 500,
                          marginLeft: "6px",
                        }}
                      >
                        {new Date(model.createdAt).toLocaleDateString()}
                      </Text>
                    </Box>

                    <Flex align="center" gap="2" style={{ marginLeft: "6px" }}>
                      <CheckCircle size={12} style={{ color: theme.colors.status.success }} />
                      <Text
                        size="2"
                        style={{
                          color: theme.colors.status.success,
                          fontWeight: 500,
                        }}
                      >
                        Active
                      </Text>
                    </Flex>
                  </Flex>
                </Card>

                {/* Compact Dataset Information */}
                <Card
                  style={{
                    padding: theme.spacing.semantic.component.lg,
                    background: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.lg,
                    boxShadow: theme.shadows.semantic.card.low,
                  }}
                >
                  <Flex align="center" gap="2" mb="4">
                    <Database size={16} style={{ color: theme.colors.interactive.accent }} />
                    <Heading
                      size="3"
                      style={{
                        color: theme.colors.text.primary,
                        fontWeight: theme.typography.h5.fontWeight,
                      }}
                    >
                      Training Data
                    </Heading>
                  </Flex>

                  {datasetsLoading ? (
                    <Flex
                      align="center"
                      justify="center"
                      py="4"
                      style={{
                        backgroundColor: theme.colors.background.secondary,
                        borderRadius: theme.borders.radius.md,
                        border: `1px dashed ${theme.colors.border.secondary}`,
                      }}
                    >
                      <LoadingSpinner size="sm" />
                    </Flex>
                  ) : (
                    <Flex direction="column" gap="3">
                      {/* Training Dataset */}
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <Box
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: theme.borders.radius.full,
                              backgroundColor: theme.colors.status.success,
                            }}
                          />
                          <Text
                            size="1"
                            style={{
                              fontWeight: theme.typography.label.fontWeight,
                              color: theme.colors.text.tertiary,
                              letterSpacing: "0.02em",
                              textTransform: "uppercase",
                              fontSize: "10px",
                            }}
                          >
                            Training
                          </Text>
                        </Flex>
                        {trainingDataset ? (
                          <Box
                            style={{
                              padding: theme.spacing.semantic.component.sm,
                              backgroundColor: theme.colors.background.secondary,
                              border: `1px solid ${theme.colors.border.secondary}`,
                              borderRadius: theme.borders.radius.md,
                            }}
                          >
                            <Text
                              size="2"
                              style={{
                                fontWeight: theme.typography.label.fontWeight,
                                color: theme.colors.text.primary,
                                marginBottom: "2px",
                              }}
                            >
                              {trainingDataset.name}
                            </Text>
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.tertiary,
                                fontSize: "11px",
                              }}
                            >
                              {trainingDataset.dataCount?.toLocaleString()} items
                            </Text>
                          </Box>
                        ) : (
                          <Box
                            style={{
                              padding: theme.spacing.semantic.component.sm,
                              backgroundColor: theme.colors.background.secondary,
                              border: `1px dashed ${theme.colors.border.secondary}`,
                              borderRadius: theme.borders.radius.md,
                              textAlign: "center",
                            }}
                          >
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.tertiary,
                                fontStyle: "italic",
                              }}
                            >
                              No training dataset
                            </Text>
                          </Box>
                        )}
                      </Box>

                      {/* Test Datasets */}
                      <Box>
                        <Flex align="center" gap="2" mb="2">
                          <Box
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: theme.borders.radius.full,
                              backgroundColor: theme.colors.status.info,
                            }}
                          />
                          <Text
                            size="1"
                            style={{
                              fontWeight: theme.typography.label.fontWeight,
                              color: theme.colors.text.tertiary,
                              letterSpacing: "0.02em",
                              textTransform: "uppercase",
                              fontSize: "10px",
                            }}
                          >
                            Test ({testDatasets.length})
                          </Text>
                        </Flex>
                        {testDatasets.length > 0 ? (
                          <Flex direction="column" gap="2">
                            {testDatasets.slice(0, 2).map(dataset => (
                              <Box
                                key={dataset.id}
                                style={{
                                  padding: theme.spacing.semantic.component.sm,
                                  backgroundColor: theme.colors.background.secondary,
                                  border: `1px solid ${theme.colors.border.secondary}`,
                                  borderRadius: theme.borders.radius.md,
                                }}
                              >
                                <Text
                                  size="2"
                                  style={{
                                    fontWeight: theme.typography.label.fontWeight,
                                    color: theme.colors.text.primary,
                                    marginBottom: "2px",
                                  }}
                                >
                                  {dataset.name}
                                </Text>
                                <Text
                                  size="1"
                                  style={{
                                    color: theme.colors.text.tertiary,
                                    fontSize: "11px",
                                  }}
                                >
                                  {dataset.dataCount?.toLocaleString()} items
                                </Text>
                              </Box>
                            ))}
                            {testDatasets.length > 2 && (
                              <Text
                                size="1"
                                style={{
                                  color: theme.colors.text.tertiary,
                                  textAlign: "center",
                                  fontStyle: "italic",
                                }}
                              >
                                +{testDatasets.length - 2} more datasets
                              </Text>
                            )}
                          </Flex>
                        ) : (
                          <Box
                            style={{
                              padding: theme.spacing.semantic.component.sm,
                              backgroundColor: theme.colors.background.secondary,
                              border: `1px dashed ${theme.colors.border.secondary}`,
                              borderRadius: theme.borders.radius.md,
                              textAlign: "center",
                            }}
                          >
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.tertiary,
                                fontStyle: "italic",
                              }}
                            >
                              No test datasets
                            </Text>
                          </Box>
                        )}
                      </Box>
                    </Flex>
                  )}
                </Card>
              </Flex>
            </Box>
          </Grid>
        </motion.div>
      </motion.div>

      {/* Enhanced animations */}
      <style>
        {`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .gradient-text {
          background: linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.semantic.interactive.hover};
        }
        
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: ${theme.shadows.semantic.card.high};
        }
        `}
      </style>
    </Box>
  );
}
