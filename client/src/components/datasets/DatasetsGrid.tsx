import React from "react";
import { Box, Grid } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { DatasetCard } from "./DatasetCard";
import { useDatasetsPageContext } from "@/shared/providers/DatasetsPageProvider";

export function DatasetsGrid() {
  const { theme } = useTheme();
  const { datasets: filteredDatasets, isLoaded, totalPages } = useDatasetsPageContext();

  return (
    <Box>
      <Grid
        columns={{ initial: "1", sm: "1", md: "2" }}
        gap="4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          marginBottom: totalPages > 1 ? theme.spacing.semantic.layout.lg : 0,
        }}
      >
        {filteredDatasets.map((dataset, index) => (
          <DatasetCard key={dataset.id} dataset={dataset} index={index} isLoaded={isLoaded} />
        ))}
      </Grid>
    </Box>
  );
}
