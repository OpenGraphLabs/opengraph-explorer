import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { AnnotationsProvider } from "@/contexts/data/AnnotationsContext";
import { ImagesProvider } from "@/contexts/data/ImagesContext";
import { CategoriesProvider } from "@/contexts/data/CategoriesContext";
import { DatasetsProvider } from "@/contexts/data/DatasetsContext";
import { AnnotationWorkspaceProvider } from "@/contexts/page/AnnotationWorkspaceContext";
import { useImagesContext } from "@/contexts/data/ImagesContext";
import { useDatasets } from "@/contexts/data/DatasetsContext";
import { WorkspaceCanvas } from "@/components/annotation-workspace/WorkspaceCanvas";
import { WorkspaceSidebar } from "@/components/annotation-workspace/WorkspaceSidebar";
import { WorkspaceLoadingState } from "@/components/annotation-workspace/WorkspaceLoadingState";
import { WorkspaceErrorState } from "@/components/annotation-workspace/WorkspaceErrorState";

function WorkspaceContent() {
  const { theme } = useTheme();
  const { selectedImage, isLoading: imagesLoading, error: imagesError } = useImagesContext();
  const { dataset, isLoading: datasetLoading, error: datasetError } = useDatasets();

  // Loading state
  if (imagesLoading || datasetLoading) {
    return <WorkspaceLoadingState />;
  }

  // Error state
  if (imagesError || datasetError || !selectedImage || !dataset) {
    return (
      <WorkspaceErrorState
        error={imagesError || datasetError}
        imagesError={imagesError}
        datasetError={datasetError}
        hasNoImages={!selectedImage}
      />
    );
  }

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      {/* Main Canvas Area */}
      <WorkspaceCanvas />

      {/* Entity Sidebar */}
      <WorkspaceSidebar />

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* Ensure full height layout */
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </Box>
  );
}

// Inner wrapper that has access to dataset and images context
function WorkspaceInner() {
  const { dataset } = useDatasets();
  const { selectedImage } = useImagesContext();

  return (
    <AnnotationsProvider
      config={{
        mode: "byImage",
        imageId: selectedImage?.id || 0,
      }}
    >
      <CategoriesProvider
        config={{
          dictionaryId: dataset?.dictionaryId,
          useDictionaryFromDataset: false,
        }}
      >
        <AnnotationWorkspaceProvider>
          <WorkspaceContent />
        </AnnotationWorkspaceProvider>
      </CategoriesProvider>
    </AnnotationsProvider>
  );
}

export function AnnotationWorkspace() {
  const { id: datasetIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Ensure we have a dataset ID
  if (!datasetIdParam) {
    navigate("/datasets");
    return null;
  }

  const datasetId = parseInt(datasetIdParam);
  const imageIdParam = searchParams.get("imageId");
  const specificImageId = imageIdParam ? parseInt(imageIdParam) : undefined;

  return (
    <DatasetsProvider config={{ datasetId }}>
      <ImagesProvider config={{ datasetId, limit: 100, specificImageId }}>
        <WorkspaceInner />
      </ImagesProvider>
    </DatasetsProvider>
  );
}
