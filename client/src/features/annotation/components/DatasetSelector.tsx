import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { CaretDown } from "phosphor-react";
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dataset = datasets.find(d => d.id === e.target.value);
    if (dataset) onDatasetSelect(dataset);
  };

  return (
    <Box style={{ position: "relative" }}>
      <select
        value={selectedDataset?.id || ""}
        onChange={handleChange}
        style={{
          appearance: "none",
          background: `linear-gradient(135deg, ${theme.colors.background.primary}, ${theme.colors.background.card})`,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.md,
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          paddingRight: `${theme.spacing.semantic.component.lg}`,
          color: theme.colors.text.primary,
          fontSize: "14px",
          fontWeight: "600",
          minWidth: "270px",
          cursor: "pointer",
          outline: "none",
          boxShadow: `0 2px 4px ${theme.colors.background.primary}30`,
          transition: "all 0.2s ease",
          height: "46px",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme.colors.interactive.primary;
          e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}20`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = theme.colors.border.primary;
          e.target.style.boxShadow = `0 2px 4px ${theme.colors.background.primary}30`;
        }}
      >
        <option value="" disabled>
          {loading ? "Loading datasets..." : error ? "Error loading datasets" : "Choose dataset to annotate..."}
        </option>
        {datasets.map(dataset => (
          <option key={dataset.id} value={dataset.id}>
            {dataset.name} • {dataset.dataCount} items • {dataset.dataType}
          </option>
        ))}
      </select>
      <Box
        style={{
          position: "absolute",
          right: theme.spacing.semantic.component.sm,
          top: "50%",
          transform: "translateY(-50%)",
          background: `${theme.colors.interactive.primary}15`,
          borderRadius: theme.borders.radius.sm,
          padding: "3px",
          pointerEvents: "none",
        }}
      >
        <CaretDown 
          size={12} 
          style={{ 
            color: theme.colors.interactive.primary,
          }} 
        />
      </Box>
    </Box>
  );
}
