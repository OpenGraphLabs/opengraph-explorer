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
  ErrorState,
  DatasetCard,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { motion } from "framer-motion";
import { useModelById } from "@/shared/hooks/useModels";
import { ModelDetailHeader, ModelOverviewTab, ModelInferenceTab } from "@/features/model";
import { datasetGraphQLService, DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";

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
      document.title = `${model.name} - OpenGraph`;
    } else {
      document.title = "Model Details - OpenGraph";
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

  // Loading state
  if (loading) {
    return (
      <Flex direction="column" align="center" gap="4" py="9" style={{ minHeight: "60vh" }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <LoadingSpinner size="lg" message="Loading model data..." />
        </motion.div>
      </Flex>
    );
  }

  // Error state
  if (error || !model) {
    return (
      <Flex direction="column" align="center" gap="4" py="9" style={{ minHeight: "60vh" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ErrorState
            message={error || "Model not found."}
            onRetry={() => window.history.back()}
            retryLabel="Return to previous page"
          />
        </motion.div>
      </Flex>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box>
        {/* Model Header */}
        <ModelDetailHeader model={model} />

        {/* Dataset Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card
            style={{
              padding: theme.spacing.semantic.container.lg,
              marginBottom: theme.spacing.semantic.layout.lg,
              borderRadius: theme.borders.radius.xl,
              background: theme.gradients.primaryLight,
              boxShadow: theme.shadows.semantic.card.medium,
              border: `1px solid ${theme.colors.border.brand}`,
            }}
          >
            <Flex justify="between" align="center" mb="4">
              <Heading
                size="4"
                style={{
                  background: theme.gradients.primary,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: theme.typography.h4.fontWeight,
                }}
              >
                Associated Datasets
              </Heading>
              <Badge
                variant="soft"
                style={{
                  backgroundColor: theme.colors.background.accent,
                  color: theme.colors.text.brand,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                {trainingDataset ? "1" : "0"} Training + {testDatasets.length} Test
              </Badge>
            </Flex>

            {datasetsLoading ? (
              <Flex
                align="center"
                justify="center"
                py="6"
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borders.radius.lg,
                }}
              >
                <LoadingSpinner size="sm" message="Loading datasets..." />
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
                        borderRadius: theme.borders.radius.full,
                        backgroundColor: theme.colors.interactive.primary,
                      }}
                    />
                    <Text
                      size="2"
                      style={{
                        fontWeight: theme.typography.label.fontWeight,
                        color: theme.colors.text.brand,
                        letterSpacing: "0.02em",
                      }}
                    >
                      Training Dataset
                    </Text>
                  </Flex>
                  {trainingDataset ? (
                    <DatasetCard
                      dataset={{
                        id: trainingDataset.id,
                        name: trainingDataset.name,
                        dataType: trainingDataset.dataType,
                        dataCount: trainingDataset.dataCount,
                      }}
                      type="training"
                    />
                  ) : (
                    <Card
                      style={{
                        padding: theme.spacing.semantic.component.lg,
                        backgroundColor: theme.colors.background.secondary,
                        border: `1px dashed ${theme.colors.border.secondary}`,
                        borderRadius: theme.borders.radius.lg,
                      }}
                    >
                      <Text
                        size="2"
                        style={{
                          color: theme.colors.text.tertiary,
                          textAlign: "center",
                        }}
                      >
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
                        borderRadius: theme.borders.radius.full,
                        backgroundColor: theme.colors.interactive.secondary,
                      }}
                    />
                    <Text
                      size="2"
                      style={{
                        fontWeight: theme.typography.label.fontWeight,
                        color: theme.colors.text.secondary,
                        letterSpacing: "0.02em",
                      }}
                    >
                      Test Datasets {testDatasets.length > 0 && `(${testDatasets.length})`}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="3">
                    {testDatasets.length > 0 ? (
                      testDatasets.map(dataset => (
                        <DatasetCard
                          key={dataset.id}
                          dataset={{
                            id: dataset.id,
                            name: dataset.name,
                            dataType: dataset.dataType,
                            dataCount: dataset.dataCount,
                          }}
                          type="test"
                        />
                      ))
                    ) : (
                      <Card
                        style={{
                          padding: theme.spacing.semantic.component.lg,
                          backgroundColor: theme.colors.background.secondary,
                          border: `1px dashed ${theme.colors.border.secondary}`,
                          borderRadius: theme.borders.radius.lg,
                        }}
                      >
                        <Text
                          size="2"
                          style={{
                            color: theme.colors.text.tertiary,
                            textAlign: "center",
                          }}
                        >
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
              borderRadius: theme.borders.radius.lg,
              overflow: "hidden",
              boxShadow: theme.shadows.semantic.card.low,
              backgroundColor: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
            }}
          >
            <Tabs.List
              style={{
                backgroundColor: theme.colors.background.secondary,
                padding: `${theme.spacing.base[2]} ${theme.spacing.base[5]}`,
                borderBottom: `1px solid ${theme.colors.border.primary}`,
              }}
            >
              <Tabs.Trigger
                value="overview"
                style={{
                  cursor: "pointer",
                  fontWeight:
                    activeTab === "overview"
                      ? theme.typography.label.fontWeight
                      : theme.typography.body.fontWeight,
                  color:
                    activeTab === "overview"
                      ? theme.colors.text.brand
                      : theme.colors.text.secondary,
                  transition: theme.animations.transitions.colors,
                  padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger
                value="inference"
                style={{
                  cursor: "pointer",
                  fontWeight:
                    activeTab === "inference"
                      ? theme.typography.label.fontWeight
                      : theme.typography.body.fontWeight,
                  color:
                    activeTab === "inference"
                      ? theme.colors.text.brand
                      : theme.colors.text.secondary,
                  transition: theme.animations.transitions.colors,
                  padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                On-Chain Inference
              </Tabs.Trigger>
            </Tabs.List>

            <Box py="5" px="4" style={{ backgroundColor: theme.colors.background.card }}>
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
