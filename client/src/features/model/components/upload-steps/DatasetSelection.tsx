import React from "react";
import { Box, Card, Flex, Text, Grid, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Database, TestTube, Brain, Flask } from "phosphor-react";
import { DatasetFilters } from "@/features/model/components/DatasetFilters";
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService";

interface DatasetSelectionProps {
  // Filter state
  filters: any;
  filteredDatasets: DatasetObject[];
  searchQuery: string;
  allTags: string[];
  
  // Selection state
  selectedTrainingDataset: DatasetObject | null;
  selectedTestDatasets: DatasetObject[];
  
  // Actions
  onSearchChange: (query: string) => void;
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
  onSelectTrainingDataset: (dataset: DatasetObject) => void;
  onRemoveTrainingDataset: () => void;
  onAddTestDataset: (dataset: DatasetObject) => void;
  onRemoveTestDataset: (dataset: DatasetObject) => void;
  onClearTestDatasets: () => void;
  
  // Other
  availableDatasetCount: number;
}

export function DatasetSelection({
  filters,
  filteredDatasets,
  searchQuery,
  allTags,
  selectedTrainingDataset,
  selectedTestDatasets,
  onSearchChange,
  onTagToggle,
  onClearTags,
  onSelectTrainingDataset,
  onRemoveTrainingDataset,
  onAddTestDataset,
  onRemoveTestDataset,
  onClearTestDatasets,
  availableDatasetCount,
}: DatasetSelectionProps) {
  const { theme } = useTheme();

  return (
    <Box>
      {/* Dataset Filters */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <DatasetFilters
          filters={filters}
          allTags={allTags}
          filteredCount={filteredDatasets.length}
          totalCount={availableDatasetCount}
          onSearchChange={onSearchChange}
          onTagToggle={onTagToggle}
          onClearTags={onClearTags}
          onClearSearch={() => onSearchChange("")}
        />
      </Box>

      {/* Training and Test Dataset Sections - Side by Side */}
      <Grid columns="2" gap="4">
        {/* Training Dataset Section */}
        <Box>
          <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.md }}>
            <Brain size={16} style={{ color: theme.colors.status.success }} weight="fill" />
            <Text size="3" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
              Training Dataset
            </Text>
            {selectedTrainingDataset && (
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                (1 selected)
              </Text>
            )}
          </Flex>

          {/* Training Datasets List */}
          <Grid columns="1" gap="2" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {filteredDatasets.map(dataset => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                isSelected={selectedTrainingDataset?.id === dataset.id}
                onSelect={() => {
                  // 토글 형태: 이미 선택된 경우 해제, 아니면 선택
                  if (selectedTrainingDataset?.id === dataset.id) {
                    onRemoveTrainingDataset();
                  } else {
                    onSelectTrainingDataset(dataset);
                  }
                }}
                variant="training"
              />
            ))}
          </Grid>
        </Box>

        {/* Test Datasets Section */}
        <Box>
          <Flex align="center" justify="between" style={{ 
            marginBottom: theme.spacing.semantic.component.md,
            minHeight: "24px" // 일정한 높이 유지
          }}>
            <Flex align="center" gap="2">
              <Flask size={16} style={{ color: theme.colors.interactive.accent }} weight="fill" />
              <Text size="3" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
                Test Datasets
              </Text>
              {selectedTestDatasets.length > 0 && (
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  ({selectedTestDatasets.length})
                </Text>
              )}
            </Flex>
            <Box style={{ 
              width: "60px", // 고정 너비로 공간 확보
              display: "flex",
              justifyContent: "flex-end"
            }}>
              {selectedTestDatasets.length > 0 && (
                <button
                  onClick={onClearTestDatasets}
                  style={{
                    background: `${theme.colors.status.error}08`,
                    color: theme.colors.status.error,
                    cursor: "pointer",
                    borderRadius: theme.borders.radius.sm,
                    padding: "3px 6px", // 더 작은 패딩
                    fontSize: "9px", // 더 작은 폰트
                    border: `1px solid ${theme.colors.status.error}20`,
                    fontWeight: 500,
                    height: "20px", // 고정 높이
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${theme.colors.status.error}15`;
                    e.currentTarget.style.borderColor = `${theme.colors.status.error}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${theme.colors.status.error}08`;
                    e.currentTarget.style.borderColor = `${theme.colors.status.error}20`;
                  }}
                >
                  Clear
                </button>
              )}
            </Box>
          </Flex>

          {/* Test Datasets List */}
          <Grid columns="1" gap="2" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {filteredDatasets.map(dataset => {
              const isSelected = selectedTestDatasets.some(d => d.id === dataset.id);
              const isDisabled = selectedTrainingDataset?.id === dataset.id;
              
              return (
                <DatasetCard
                  key={dataset.id}
                  dataset={dataset}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onSelect={() => {
                    if (isDisabled) return;
                    if (isSelected) {
                      onRemoveTestDataset(dataset);
                    } else {
                      onAddTestDataset(dataset);
                    }
                  }}
                  variant="test"
                />
              );
            })}
          </Grid>
        </Box>
      </Grid>
    </Box>
  );
}

// Compact Dataset Card Component
interface DatasetCardProps {
  dataset: DatasetObject;
  isSelected: boolean;
  onSelect: () => void;
  variant: "training" | "test";
  isDisabled?: boolean;
}

function DatasetCard({ dataset, isSelected, onSelect, variant, isDisabled = false }: DatasetCardProps) {
  const { theme } = useTheme();
  
  const colors = {
    training: {
      primary: theme.colors.status.success,
      secondary: `${theme.colors.status.success}08`,
      border: `${theme.colors.status.success}30`,
    },
    test: {
      primary: theme.colors.interactive.accent,
      secondary: `${theme.colors.interactive.accent}08`,
      border: `${theme.colors.interactive.accent}30`,
    },
  };

  const color = colors[variant];

  return (
    <Box
      onClick={isDisabled ? undefined : onSelect}
      style={{
        padding: theme.spacing.semantic.component.sm,
        borderRadius: theme.borders.radius.md,
        border: `1px solid ${
          isDisabled 
            ? `${theme.colors.border.secondary}60`
            : isSelected 
              ? color.primary 
              : theme.colors.border.secondary
        }`,
        background: isDisabled 
          ? `${theme.colors.background.secondary}60`
          : isSelected 
            ? color.secondary 
            : theme.colors.background.secondary,
        cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: isDisabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isSelected && !isDisabled) {
          e.currentTarget.style.borderColor = color.primary;
          e.currentTarget.style.background = `${color.primary}05`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected && !isDisabled) {
          e.currentTarget.style.borderColor = theme.colors.border.secondary;
          e.currentTarget.style.background = theme.colors.background.secondary;
        }
      }}
    >
      <Flex align="center" gap="2">
        <Box
          style={{
            width: "20px",
            height: "20px",
            borderRadius: theme.borders.radius.sm,
            background: isDisabled 
              ? `${theme.colors.text.tertiary}20`
              : isSelected 
                ? color.primary 
                : `${color.primary}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isDisabled ? (
            <Text style={{ color: theme.colors.text.tertiary, fontSize: "10px", fontWeight: 600 }}>×</Text>
          ) : isSelected ? (
            variant === "training" ? (
              <Text style={{ color: theme.colors.text.inverse, fontSize: "8px", fontWeight: 600 }}>✓</Text>
            ) : (
              <Text style={{ color: theme.colors.text.inverse, fontSize: "10px", fontWeight: 600 }}>✓</Text>
            )
          ) : variant === "training" ? (
            <Database size={10} style={{ color: color.primary }} />
          ) : (
            <TestTube size={10} style={{ color: color.primary }} />
          )}
        </Box>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text 
            size="2" 
            style={{ 
              fontWeight: 600, 
              color: isDisabled ? theme.colors.text.tertiary : theme.colors.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginRight: "6px"
            }}
          >
            {dataset.name}
            {isDisabled && (
              <Text 
                style={{ 
                  color: theme.colors.text.tertiary, 
                  fontSize: "10px", 
                  fontWeight: 500,
                  marginLeft: "6px"
                }}
              >
                (Selected for Training)
              </Text>
            )}
          </Text>
          <Text size="1" style={{ color: theme.colors.text.tertiary }}>
            {dataset.dataCount.toLocaleString()} items
            {isSelected && variant === "training" && (
              <Text 
                style={{ 
                  color: theme.colors.text.tertiary, 
                  fontSize: "9px", 
                  fontWeight: 500,
                  marginLeft: "6px",
                  fontStyle: "italic"
                }}
              >
                • Click to deselect
              </Text>
            )}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
} 