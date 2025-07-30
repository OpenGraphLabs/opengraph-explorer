import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { AnnotationsProvider } from "@/contexts/data/AnnotationsContext";
import { ImagesProvider } from "@/contexts/data/ImagesContext";
import { CategoriesProvider } from "@/contexts/data/CategoriesContext";
import { DatasetsProvider } from "@/contexts/data/DatasetsContext";
import { TrajectoryWorkspaceProvider } from "@/contexts/page/TrajectoryWorkspaceContext";
import { useImagesContext } from "@/contexts/data/ImagesContext";
import { useDatasets } from "@/contexts/data/DatasetsContext";
import { TrajectoryCanvas } from "@/components/trajectory-workspace/TrajectoryCanvas";
import { TrajectoryTaskSidebar } from "@/components/trajectory-workspace/TrajectoryTaskSidebar";
import { TrajectoryLoadingState } from "@/components/trajectory-workspace/TrajectoryLoadingState";
import { TrajectoryErrorState } from "@/components/trajectory-workspace/TrajectoryErrorState";

function TrajectoryWorkspaceContent() {
  const { theme } = useTheme();
  const { selectedImage, isLoading: imagesLoading, error: imagesError } = useImagesContext();
  const { dataset, isLoading: datasetLoading, error: datasetError } = useDatasets();

  // Loading state
  if (imagesLoading || datasetLoading) {
    return <TrajectoryLoadingState />;
  }

  // Error state
  if (imagesError || datasetError || !selectedImage || !dataset) {
    return (
      <TrajectoryErrorState
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
      <TrajectoryCanvas />

      {/* Task Selection Sidebar */}
      <TrajectoryTaskSidebar />

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

          @keyframes drawPath {
            from {
              stroke-dashoffset: 100;
            }
            to {
              stroke-dashoffset: 0;
            }
          }

          .trajectory-path {
            stroke-dasharray: 5, 5;
            animation: drawPath 2s ease-in-out infinite;
          }

          .robot-hand {
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
            transition: all 0.3s ease;
          }

          .robot-hand:hover {
            transform: scale(1.05);
            filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
          }

          .trajectory-point {
            transition: all 0.2s ease;
            cursor: pointer;
          }

          .trajectory-point:hover {
            transform: scale(1.2);
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
function TrajectoryWorkspaceInner() {
  const { dataset } = useDatasets();
  const { selectedImage } = useImagesContext();

  return (
    <AnnotationsProvider
      config={{
        mode: "approved", // Only work with approved annotations
        imageId: selectedImage?.id || 0,
      }}
    >
      <CategoriesProvider
        config={{
          dictionaryId: dataset?.dictionary_id,
          useDictionaryFromDataset: false,
        }}
      >
        <TrajectoryWorkspaceProvider>
          <TrajectoryWorkspaceContent />
        </TrajectoryWorkspaceProvider>
      </CategoriesProvider>
    </AnnotationsProvider>
  );
}


export function TrajectoryDrawingWorkspace() {
  const { id: datasetIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Ensure we have a dataset ID
  if (!datasetIdParam) {
    navigate("/datasets");
    return null;
  }

  const datasetId = parseInt(datasetIdParam);
  const imageIdParam = searchParams.get('imageId');
  const specificImageId = imageIdParam ? parseInt(imageIdParam) : undefined;

  return (
    <DatasetsProvider config={{ datasetId }}>
      <ImagesProvider config={{ datasetId, limit: 100, specificImageId }}>
        <TrajectoryWorkspaceInner />
      </ImagesProvider>
    </DatasetsProvider>
  );
}