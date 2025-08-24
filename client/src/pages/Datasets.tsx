import React from "react";
import { useMobile } from "@/shared/hooks";
import {
  DatasetsPageContextProvider,
  useDatasetsPageContext,
} from "@/contexts/DatasetsPageContextProvider";
import { DatasetsLoadingState, DatasetsErrorState } from "@/components/datasets";
import { DatasetsLayoutDesktop } from "@/components/datasets/DatasetsLayoutDesktop";
import { DatasetsLayoutMobile } from "@/components/datasets/DatasetsLayoutMobile";

/**
 * Datasets page content that handles device detection and layout selection
 */
function DatasetsContent() {
  const { isLoading, error } = useDatasetsPageContext();
  const { isMobile } = useMobile();

  // Handle loading state first
  if (isLoading) {
    return <DatasetsLoadingState />;
  }

  // Handle error state
  if (error) {
    return <DatasetsErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  // Render appropriate layout based on device
  if (isMobile) {
    return <DatasetsLayoutMobile />;
  }

  return <DatasetsLayoutDesktop />;
}

export function Datasets() {
  return (
    <DatasetsPageContextProvider options={{ limit: 20 }}>
      <DatasetsContent />
    </DatasetsPageContextProvider>
  );
}
