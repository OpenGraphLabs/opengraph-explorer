import { Dropdown, DropdownOption } from "@/shared/ui/design-system/components";
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService.ts";
import { Database } from "phosphor-react";
import {Box} from "@radix-ui/themes";

interface DatasetSelectorProps {
  datasets: DatasetObject[];
  selectedDataset: DatasetObject | null;
  onDatasetSelect: (dataset: DatasetObject | null) => void;
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
  // Transform datasets to dropdown options
  const options: DropdownOption[] = datasets.map(dataset => ({
    value: dataset.id,
    label: dataset.name,
    description: `${dataset.dataCount} items • ${dataset.dataType}`,
    icon: <Database size={14} />,
  }));

  const handleValueChange = (value: string) => {
    if (!value) {
      // Clear selection - pass null to indicate no dataset selected
      onDatasetSelect(null);
      return;
    }
    
    const dataset = datasets.find(d => d.id === value);
    if (dataset) onDatasetSelect(dataset);
  };

  const placeholder = loading 
    ? "Loading datasets..." 
    : error 
    ? "Error loading datasets" 
    : "Choose dataset to annotate...";

  return (
    <Box>
      <Dropdown
          options={options}
          value={selectedDataset?.id || ""}
          onValueChange={handleValueChange}
          placeholder={placeholder}
          size="lg"
          variant="default"
          disabled={loading || !!error}
          loading={loading}
          error={!!error}
          searchable={datasets.length > 5}
          clearable={!!selectedDataset}
          fullWidth
      />
    </Box>
  );
}
