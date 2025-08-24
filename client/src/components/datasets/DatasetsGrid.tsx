import React from "react";
import { Box, Grid } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useMobile } from "@/shared/hooks";
import { DatasetCard } from "./DatasetCard";
import { useDatasetsPageContext } from "@/contexts/DatasetsPageContextProvider";

export function DatasetsGrid() {
  const { theme } = useTheme();
  const { isMobile } = useMobile();
  const { datasets: filteredDatasets, isLoaded, totalPages } = useDatasetsPageContext();

  return (
    <Box>
      <Grid
        columns={{ initial: "1", sm: "1", md: "2" }}
        gap={isMobile ? "3" : "4"}
        style={{
          gridTemplateColumns: isMobile
            ? "1fr" // Single column on mobile
            : "repeat(auto-fill, minmax(480px, 1fr))", // Responsive grid on desktop
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
