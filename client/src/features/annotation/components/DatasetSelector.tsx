import { Box, Flex, Heading, Text, Grid } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { LoadingSpinner } from "@/shared/ui/design-system/components/LoadingSpinner";
import { ErrorState } from "@/shared/ui/design-system/components/ErrorState";
import { useTheme } from "@/shared/ui/design-system";
import { Database } from "phosphor-react";
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
  error = null,
}: DatasetSelectorProps) {
  const { theme } = useTheme();

  if (loading) {
    return (
      <Card
        style={{
          padding: theme.spacing.semantic.component.lg,
        }}
      >
        <Flex direction="column" gap={theme.spacing.semantic.component.md}>
          <Heading
            size="3"
            style={{
              color: theme.colors.text.primary,
            }}
          >
            Select Dataset
          </Heading>
          <Flex
            align="center"
            justify="center"
            style={{ padding: theme.spacing.semantic.component.xl }}
          >
            <LoadingSpinner />
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                marginLeft: theme.spacing.semantic.component.sm,
              }}
            >
              Loading datasets...
            </Text>
          </Flex>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        style={{
          padding: theme.spacing.semantic.component.lg,
        }}
      >
        <Flex direction="column" gap={theme.spacing.semantic.component.md}>
          <Heading
            size="3"
            style={{
              color: theme.colors.text.primary,
            }}
          >
            Select Dataset
          </Heading>
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </Flex>
      </Card>
    );
  }

  return (
    <Card
      style={{
        padding: theme.spacing.semantic.component.lg,
      }}
    >
      <Flex direction="column" gap={theme.spacing.semantic.component.md}>
        <Heading
          size="3"
          style={{
            color: theme.colors.text.primary,
          }}
        >
          Select Dataset
        </Heading>
        {datasets.length === 0 ? (
          <Flex
            align="center"
            justify="center"
            style={{
              padding: theme.spacing.semantic.component.xl,
            }}
          >
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
              }}
            >
              No datasets available
            </Text>
          </Flex>
        ) : (
          <Grid columns="3" gap={theme.spacing.semantic.component.md}>
            {datasets.map(dataset => (
              <Card
                key={dataset.id}
                style={{
                  cursor: "pointer",
                  border:
                    selectedDataset?.id === dataset.id
                      ? `2px solid ${theme.colors.interactive.primary}`
                      : `1px solid ${theme.colors.border.primary}`,
                  background:
                    selectedDataset?.id === dataset.id
                      ? theme.colors.background.accent
                      : theme.colors.background.primary,
                  transition: theme.animations.transitions.all,
                  boxShadow:
                    selectedDataset?.id === dataset.id
                      ? theme.shadows.semantic.interactive.hover
                      : theme.shadows.semantic.card.low,
                }}
                onClick={() => onDatasetSelect(dataset)}
              >
                <Flex
                  align="center"
                  gap={theme.spacing.semantic.component.sm}
                  style={{
                    padding: theme.spacing.semantic.component.sm,
                  }}
                >
                  <Box
                    style={{
                      color:
                        selectedDataset?.id === dataset.id
                          ? theme.colors.interactive.primary
                          : theme.colors.text.secondary,
                    }}
                  >
                    <Database size={24} />
                  </Box>
                  <Box>
                    <Text
                      size="2"
                      style={{
                        fontWeight: "600",
                        color:
                          selectedDataset?.id === dataset.id
                            ? theme.colors.interactive.primary
                            : theme.colors.text.primary,
                      }}
                    >
                      {dataset.name}
                    </Text>
                    <Text
                      size="1"
                      style={{
                        marginLeft: theme.spacing.semantic.component.xs,
                        color:
                          selectedDataset?.id === dataset.id
                            ? theme.colors.interactive.primary
                            : theme.colors.text.secondary,
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
