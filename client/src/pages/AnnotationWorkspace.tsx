import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { AnnotationWorkspacePageContextProvider, useAnnotationWorkspacePageContext } from "@/contexts/AnnotationWorkspacePageContextProvider";
import { WorkspaceCanvas } from "@/components/annotation-workspace/WorkspaceCanvas";
import { WorkspaceSidebar } from "@/components/annotation-workspace/WorkspaceSidebar";
import { WorkspaceLoadingState } from "@/components/annotation-workspace/WorkspaceLoadingState";
import { WorkspaceErrorState } from "@/components/annotation-workspace/WorkspaceErrorState";

function WorkspaceContent() {
  const { theme } = useTheme();
  const { selectedImage, dataset, isLoading, error } = useAnnotationWorkspacePageContext();

  // Loading state
  if (isLoading) {
    return <WorkspaceLoadingState />;
  }

  // Error state
  if (error || !selectedImage || !dataset) {
    return (
      <WorkspaceErrorState
        error={error}
        imagesError={error}
        datasetError={error}
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
    <AnnotationWorkspacePageContextProvider
      options={{ 
        datasetId,
        specificImageId 
      }}
    >
      <WorkspaceContent />
    </AnnotationWorkspacePageContextProvider>
  );
}
