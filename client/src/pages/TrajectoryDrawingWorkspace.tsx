import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { TrajectoryWorkspacePageContextProvider, useTrajectoryWorkspacePageContext } from "@/contexts/TrajectoryWorkspacePageContextProvider";
import { TrajectoryCanvas } from "@/components/trajectory-workspace/TrajectoryCanvas";
import { TrajectoryTaskSidebar } from "@/components/trajectory-workspace/TrajectoryTaskSidebar";
import { TrajectoryLoadingState } from "@/components/trajectory-workspace/TrajectoryLoadingState";
import { TrajectoryErrorState } from "@/components/trajectory-workspace/TrajectoryErrorState";
import { Modal } from "@/shared/ui/components/Modal";

function TrajectoryWorkspaceContent() {
  const { theme } = useTheme();
  const { selectedImage, dataset, isLoading, error, modalState, closeModal } = useTrajectoryWorkspacePageContext();

  // Loading state
  if (isLoading) {
    return <TrajectoryLoadingState />;
  }

  // Error state
  if (error || !selectedImage || !dataset) {
    return (
      <TrajectoryErrorState
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

      {/* Custom Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        onConfirm={modalState.onConfirm}
        showCancel={modalState.showCancel}
      />
    </Box>
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
  const imageIdParam = searchParams.get("imageId");
  const specificImageId = imageIdParam ? parseInt(imageIdParam) : undefined;

  return (
    <TrajectoryWorkspacePageContextProvider
      options={{
        datasetId,
        specificImageId
      }}
    >
      <TrajectoryWorkspaceContent />
    </TrajectoryWorkspacePageContextProvider>
  );
}
