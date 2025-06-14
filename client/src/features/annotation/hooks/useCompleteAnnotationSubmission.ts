/**
 * Complete Annotation Submission Hook
 *
 * Integrates all submission services and manages the complete flow:
 * 1. Validates annotation data
 * 2. Gets mission and annotator information
 * 3. Submits to Sui blockchain
 * 4. Submits to backend for scoring
 * 5. Provides status updates throughout the process
 */

import { useState, useCallback } from "react";
import {
  useAnnotationSubmission,
  type SubmissionStatus,
  type SubmissionResult,
  type AnnotationData,
} from "../../../shared/api/annotationSubmissionService";
import { useMissionMapping } from "../../../shared/api/missionMappingService";

// Extended submission status with additional phases
export type CompleteSubmissionStatus =
  | { phase: "idle"; message?: string }
  | { phase: "validating"; message: string }
  | { phase: "preparing"; message: string }
  | { phase: "blockchain"; message: string; progress?: number }
  | { phase: "scoring"; message: string }
  | { phase: "completed"; result: SubmissionResult & { score: number } }
  | { phase: "error"; error: string };

// Workspace annotation structure (adjust based on your actual types)
interface WorkspaceAnnotationItem {
  imageId: string;
  annotations: {
    labels?: Array<{
      id: string;
      label: string;
      confidence?: number;
    }>;
    boundingBoxes?: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      confidence?: number;
    }>;
    polygons?: Array<{
      id: string;
      points: Array<{ x: number; y: number }>;
      label: string;
      confidence?: number;
    }>;
  };
}

// Image data structure
interface ImageData {
  id: string;
  url: string;
  path?: string;
  width: number;
  height: number;
}

/**
 * Hook for managing complete annotation submission process
 */
export function useCompleteAnnotationSubmission() {
  const [status, setStatus] = useState<CompleteSubmissionStatus>({ phase: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { submitAnnotations } = useAnnotationSubmission();
  const { getSubmissionParams } = useMissionMapping();

  /**
   * Validate annotation data before submission
   */
  const validateAnnotationData = (
    annotationData: AnnotationData[],
    totalImages: number
  ): boolean => {
    if (annotationData.length === 0) {
      throw new Error("No annotations to submit");
    }

    if (annotationData.length !== totalImages) {
      throw new Error(
        `Annotation count (${annotationData.length}) doesn't match image count (${totalImages})`
      );
    }

    // Check each annotation has at least one annotation type
    annotationData.forEach((item, index) => {
      const { annotations } = item;
      const hasAnnotations =
        (annotations.labels && annotations.labels.length > 0) ||
        (annotations.boundingBoxes && annotations.boundingBoxes.length > 0) ||
        (annotations.polygons && annotations.polygons.length > 0);

      if (!hasAnnotations) {
        throw new Error(`Image ${index + 1} has no annotations`);
      }
    });

    return true;
  };

  /**
   * Submit complete annotation workspace
   */
  const submitCompleteAnnotations = useCallback(
    async (
      challengeId: string,
      datasetId: string,
      annotationData: AnnotationData[], // Already converted data from AnnotationWorkspace
      totalImages: number // For validation
    ): Promise<SubmissionResult> => {
      if (isSubmitting) {
        throw new Error("Submission already in progress");
      }

      try {
        setIsSubmitting(true);
        setStatus({ phase: "validating", message: "Validating annotation data..." });

        // Step 1: Validate annotations
        if (annotationData.length === 0) {
          throw new Error("No annotations to submit");
        }

        if (annotationData.length !== totalImages) {
          throw new Error(
            `Annotation count (${annotationData.length}) doesn't match image count (${totalImages})`
          );
        }

        // Check each annotation has at least one annotation type
        annotationData.forEach((item, index) => {
          const { annotations } = item;
          const hasAnnotations =
            (annotations.labels && annotations.labels.length > 0) ||
            (annotations.boundingBoxes && annotations.boundingBoxes.length > 0) ||
            (annotations.polygons && annotations.polygons.length > 0);

          if (!hasAnnotations) {
            throw new Error(`Image ${index + 1} has no annotations`);
          }
        });

        setStatus({ phase: "preparing", message: "Preparing submission parameters..." });

        // Step 2: Get mission and annotator information
        const { missionId, annotatorId } = await getSubmissionParams(challengeId);

        // Step 3: Submit annotations through the complete flow (data already converted)
        const result = await submitAnnotations(
          datasetId,
          annotationData,
          missionId,
          annotatorId,
          (submissionStatus: SubmissionStatus) => {
            // Map submission status to complete status
            switch (submissionStatus.phase) {
              case "preparing":
                setStatus({
                  phase: "preparing",
                  message: submissionStatus.message,
                });
                break;
              case "blockchain":
                setStatus({
                  phase: "blockchain",
                  message: submissionStatus.message,
                  progress: submissionStatus.progress,
                });
                break;
              case "scoring":
                setStatus({
                  phase: "scoring",
                  message: submissionStatus.message,
                });
                break;
              case "completed":
                setStatus({
                  phase: "completed",
                  result: {
                    ...submissionStatus.result,
                    score: submissionStatus.result.missionScore.score,
                  },
                });
                break;
              case "error":
                setStatus({
                  phase: "error",
                  error: submissionStatus.error,
                });
                break;
            }
          }
        );

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setStatus({ phase: "error", error: errorMessage });

        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, submitAnnotations, getSubmissionParams]
  );

  /**
   * Reset submission status
   */
  const resetStatus = useCallback(() => {
    setStatus({ phase: "idle" });
    setIsSubmitting(false);
  }, []);

  /**
   * Check if submission is possible
   */
  const canSubmit = useCallback(
    (
      annotationData: AnnotationData[],
      totalImages: number
    ): { canSubmit: boolean; reason?: string } => {
      try {
        validateAnnotationData(annotationData, totalImages);
        return { canSubmit: !isSubmitting };
      } catch (error) {
        return {
          canSubmit: false,
          reason: error instanceof Error ? error.message : "Validation failed",
        };
      }
    },
    [isSubmitting]
  );

  return {
    // State
    status,
    isSubmitting,

    // Actions
    submitCompleteAnnotations,
    resetStatus,
    canSubmit,

    // Computed properties
    isIdle: status.phase === "idle",
    isValidating: status.phase === "validating",
    isPreparing: status.phase === "preparing",
    isSubmittingToBlockchain: status.phase === "blockchain",
    isScoring: status.phase === "scoring",
    isCompleted: status.phase === "completed",
    hasError: status.phase === "error",

    // Result data
    finalScore: status.phase === "completed" ? status.result.score : undefined,
    transactionHash: status.phase === "completed" ? status.result.suiTransactionDigest : undefined,
    errorMessage: status.phase === "error" ? status.error : undefined,
  };
}
