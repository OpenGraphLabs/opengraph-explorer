import React from "react";
import { useParams } from "react-router-dom";
import { useMobile } from "@/shared/hooks";
import {
  DatasetDetailPageContextProvider,
  useDatasetDetailPageContext,
} from "@/contexts/DatasetDetailPageContextProvider";
import { DatasetDetailLoadingState, DatasetDetailErrorState } from "@/components/datasets";
import { DatasetDetailLayoutDesktop } from "@/components/datasets/DatasetDetailLayoutDesktop";
import { DatasetDetailLayoutMobile } from "@/components/datasets/DatasetDetailLayoutMobile";

/**
 * DatasetDetail page content that handles device detection and layout selection
 */
function DatasetDetailContent() {
  const { dataset, isLoading, error } = useDatasetDetailPageContext();
  const { isMobile } = useMobile();

  // Handle loading state first
  if (isLoading) {
    return <DatasetDetailLoadingState />;
  }

  // Handle error state
  if (error || !dataset) {
    return <DatasetDetailErrorState error={error?.message || "An error occurred"} />;
  }

  // Render appropriate layout based on device
  if (isMobile) {
    return <DatasetDetailLayoutMobile />;
  }

  return <DatasetDetailLayoutDesktop />;
}

export function DatasetDetail() {
  const { id } = useParams<{ id: string }>();
  const datasetId = id ? parseInt(id) : 0;

  return (
    <DatasetDetailPageContextProvider options={{ datasetId, imagesLimit: 100 }}>
      <DatasetDetailContent />
    </DatasetDetailPageContextProvider>
  );
}
