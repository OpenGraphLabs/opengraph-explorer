import React from 'react';
import { Box, Grid } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { DatasetCard } from './DatasetCard';
import { useDatasetsPage } from '@/contexts/page/DatasetsPageContext';
import { useDatasetsList } from '@/contexts/data/DatasetsListContext';

export function DatasetsGrid() {
  const { theme } = useTheme();
  const { filteredDatasets, isLoaded } = useDatasetsPage();
  const { totalPages } = useDatasetsList();

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