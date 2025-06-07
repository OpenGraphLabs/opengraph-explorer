import { Card, Flex, Heading, Text, Grid, Box } from '@radix-ui/themes';
import { Database } from 'phosphor-react';
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService.ts";

interface DatasetSelectorProps {
  datasets: DatasetObject[];
  selectedDataset: DatasetObject | null;
  onDatasetSelect: (dataset: DatasetObject) => void;
  loading?: boolean;
  error?: string | null;
}

export function DatasetSelector({ 
  datasets, 
  selectedDataset, 
  onDatasetSelect, 
  loading = false, 
  error = null 
}: DatasetSelectorProps) {
  if (loading) {
    return (
      <Card>
        <Flex direction="column" gap="3">
          <Heading size="3">Select Dataset</Heading>
          <Flex align="center" justify="center" py="6">
            <Text size="3">Loading datasets...</Text>
          </Flex>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Flex direction="column" gap="3">
          <Heading size="3">Select Dataset</Heading>
          <Flex align="center" justify="center" py="6">
            <Text size="3" color="red">
              {error}
            </Text>
          </Flex>
        </Flex>
      </Card>
    );
  }

  return (
    <Card>
      <Flex direction="column" gap="3">
        <Heading size="3">Select Dataset</Heading>
        {datasets.length === 0 ? (
          <Flex align="center" justify="center" py="6">
            <Text size="3" style={{ color: "var(--gray-11)" }}>
              No datasets available
            </Text>
          </Flex>
        ) : (
          <Grid columns="3" gap="3">
            {datasets.map(dataset => (
              <Card
                key={dataset.id}
                style={{
                  cursor: "pointer",
                  border: selectedDataset?.id === dataset.id 
                    ? "2px solid #FF5733" 
                    : "1px solid var(--gray-6)",
                  background: selectedDataset?.id === dataset.id 
                    ? "var(--orange-2)" 
                    : "white",
                  transition: "all 0.2s ease",
                }}
                onClick={() => onDatasetSelect(dataset)}
              >
                <Flex align="center" gap="2" p="2">
                  <Box
                    style={{
                      color: selectedDataset?.id === dataset.id 
                        ? "#FF5733" 
                        : "var(--gray-11)",
                    }}
                  >
                    <Database size={24} />
                  </Box>
                  <Box>
                    <Text 
                      size="2" 
                      weight="bold"
                      style={{
                        color: selectedDataset?.id === dataset.id 
                          ? "#FF5733" 
                          : "var(--gray-12)",
                      }}
                    >
                      {dataset.name}
                    </Text>
                    <Text 
                      size="1" 
                      style={{ 
                        marginLeft: '6px',
                        color: selectedDataset?.id === dataset.id 
                          ? "#FF8C66" 
                          : "var(--gray-11)",
                      }}
                    >
                      {dataset.dataType} • {dataset.dataCount} items
                    </Text>
                  </Box>
                </Flex>
              </Card>
            ))}
          </Grid>
        )}
      </Flex>
    </Card>
  );
} 