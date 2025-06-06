import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { useModelById } from "../shared/hooks";
import { datasetGraphQLService, DatasetObject } from "../shared/api/datasetGraphQLService";
import { ModelHeader } from "../features/model-header";
import { ModelMetadata } from "../features/model-metadata";
import { ModelDatasets } from "../features/model-datasets";
import { ModelTabs } from "../features/model-tabs";
import { EmptyState } from "../shared/ui";

export function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { model, loading, error } = useModelById(id || "");
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
            model.test_dataset_ids.map((id: string) => datasetGraphQLService.getDatasetById(id))
          );
          setTestDatasets(testData.filter((dataset: any) => dataset !== null) as DatasetObject[]);
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

  // Error state
  if (error || !model) {
    return (
      <EmptyState
        title="Model not found"
        description={error || "The requested model could not be found."}
        action={
          <Button variant="soft" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        }
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box>
        {/* Model Header */}
        <ModelHeader model={model} />

        {/* Model Metadata */}
        <ModelMetadata model={model} />

        {/* Associated Datasets */}
        <ModelDatasets
          trainingDataset={trainingDataset}
          testDatasets={testDatasets}
          loading={datasetsLoading}
        />

        {/* Tab System */}
        <ModelTabs model={model} />
      </Box>
    </motion.div>
  );
} 