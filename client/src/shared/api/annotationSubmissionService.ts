/**
 * Annotation Submission Service
 *
 * Handles the complete annotation submission flow:
 * 1. Submit annotations to Sui blockchain
 * 2. Send mission submission to backend for scoring
 */

import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  useAnnotationSuiService,
  type DataAnnotationInput,
  type BatchAnnotationInput,
} from "./sui/annotationSuiService";

const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || "http://localhost:8080/server/v1";

// Types for annotation data
export interface AnnotationData {
  imageId: string;
  imagePath: string;
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

// Mission submission request structure (matching backend)
export interface MissionSubmissionRequest {
  mission_id: number;
  annotator_id: number;
  submissions: Array<{
    item_id: string;
    labels: Array<{
      id: string;
      label: string;
      confidence?: number;
    }>;
    bounding_boxes: Array<{
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      label: string;
      confidence?: number;
    }>;
  }>;
}

// Mission score response (matching backend)
export interface MissionScore {
  id: number;
  mission_id: number;
  annotator_id: number;
  score: number;
  created_at: string;
  updated_at: string;
}

// Submission result
export interface SubmissionResult {
  suiTransactionDigest: string;
  missionScore: MissionScore;
  success: boolean;
  error?: string;
}

// Submission status for tracking progress
export type SubmissionStatus =
  | { phase: "preparing"; message: string }
  | { phase: "blockchain"; message: string; progress?: number }
  | { phase: "scoring"; message: string }
  | { phase: "completed"; result: SubmissionResult }
  | { phase: "error"; error: string };

class AnnotationSubmissionApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnnotationSubmissionApiError";
  }
}

/**
 * Hook for managing annotation submission to both Sui blockchain and backend
 */
export function useAnnotationSubmission() {
  const account = useCurrentAccount();
  const annotationSuiService = useAnnotationSuiService();

  /**
   * Submit annotations to Sui blockchain using the proper annotation service
   */
  const submitToSui = async (
    datasetId: string,
    annotations: AnnotationData[],
    onProgress?: (progress: number, message: string) => void
  ): Promise<string> => {
    if (!account) {
      throw new Error("Wallet account not found. Please connect your wallet first.");
    }

    if (annotations.length === 0) {
      throw new Error("No annotations to submit");
    }

    try {
      onProgress?.(10, "Preparing blockchain transaction...");

      console.log("[xxxxxxx] annotations", annotations);

      // Convert AnnotationData to DataAnnotationInput format
      const dataAnnotations: DataAnnotationInput[] = annotations.map((annotationData, index) => {
        const { imageId, imagePath, annotations: annots } = annotationData;
        console.log("[xxxxxxx] imagePath", imagePath);

        onProgress?.(
          10 + (index / annotations.length) * 30,
          `Processing annotation ${index + 1}/${annotations.length}...`
        );

        return {
          dataId: imageId, // Using imageId as dataId
          dataPath: imagePath,
          labelAnnotations: annots.labels?.map(label => ({
            id: label.id,
            label: label.label,
            confidence: label.confidence,
          })),
          bboxAnnotations: annots.boundingBoxes?.map(bbox => ({
            id: bbox.id,
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
            label: bbox.label,
            confidence: bbox.confidence,
            selected: false, // Default value
          })),
        };
      });

      onProgress?.(40, "Validating annotation data...");

      // Validate batch input
      const batchInput: BatchAnnotationInput = {
        datasetId,
        dataAnnotations,
      };

      const validation = annotationSuiService.validateBatchInput(batchInput);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      onProgress?.(50, "Submitting to Sui blockchain...");

      // Submit using the proper annotation service
      const result = await annotationSuiService.addAnnotationsBatch(
        batchInput,
        txResult => {
          onProgress?.(90, "Transaction confirmed on blockchain");
          console.log("Sui annotation submission successful:", txResult);
        },
        error => {
          console.error("Sui annotation submission failed:", error);
          throw error;
        }
      );

      if (!result?.digest) {
        throw new Error("Failed to get transaction digest from result");
      }

      return result.digest;
    } catch (error) {
      console.error("Error submitting to Sui blockchain:", error);
      throw new Error(
        `Failed to submit to blockchain: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  /**
   * Submit mission to backend for scoring
   */
  const submitMissionForScoring = async (
    submissionRequest: MissionSubmissionRequest
  ): Promise<MissionScore> => {
    try {
      const response = await fetch(`${API_BASE_URL}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("[xxxxxxx] errorData", errorData);
        throw new AnnotationSubmissionApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const missionScore: MissionScore = await response.json();
      console.log("[xxxxxxx] missionScore", missionScore);
      return missionScore;
    } catch (error) {
      console.error("Error submitting mission for scoring:", error);
      if (error instanceof AnnotationSubmissionApiError) {
        throw error;
      }
      throw new AnnotationSubmissionApiError(
        `Failed to submit mission for scoring: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  /**
   * Complete annotation submission flow
   * 1. Submit to Sui blockchain
   * 2. Submit to backend for scoring
   */
  const submitAnnotations = async (
    datasetId: string,
    annotations: AnnotationData[],
    missionId: number,
    annotatorId: number,
    onStatusChange?: (status: SubmissionStatus) => void
  ): Promise<SubmissionResult> => {
    try {
      onStatusChange?.({
        phase: "preparing",
        message: "Preparing annotation submission...",
      });

      // Step 1: Submit to Sui blockchain
      onStatusChange?.({
        phase: "blockchain",
        message: "Submitting annotations to Sui blockchain...",
      });

      const suiTransactionDigest = await submitToSui(
        datasetId,
        annotations,
        (progress, message) => {
          onStatusChange?.({
            phase: "blockchain",
            message,
            progress,
          });
        }
      );

      // Step 2: Prepare mission submission data
      onStatusChange?.({
        phase: "scoring",
        message: "Preparing mission submission for scoring...",
      });

      const missionSubmissionRequest: MissionSubmissionRequest = {
        mission_id: missionId,
        annotator_id: annotatorId,
        submissions: annotations.map(annotationData => ({
          item_id: annotationData.imageId,
          labels: annotationData.annotations.labels || [],
          bounding_boxes:
            annotationData.annotations.boundingBoxes?.map(bbox => ({
              id: bbox.id,
              x: bbox.x,
              y: bbox.y,
              width: bbox.width,
              height: bbox.height,
              label: bbox.label,
              confidence: bbox.confidence,
            })) || [],
        })),
      };

      // Step 3: Submit to backend for scoring
      onStatusChange?.({
        phase: "scoring",
        message: "Submitting to backend for scoring...",
      });

      const missionScore = await submitMissionForScoring(missionSubmissionRequest);

      // Success
      const result: SubmissionResult = {
        suiTransactionDigest,
        missionScore,
        success: true,
      };

      onStatusChange?.({
        phase: "completed",
        result,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

      onStatusChange?.({
        phase: "error",
        error: errorMessage,
      });

      return {
        suiTransactionDigest: "",
        missionScore: {} as MissionScore,
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    submitAnnotations,
    submitToSui,
    submitMissionForScoring,
  };
}

/**
 * Utility function to convert workspace annotations to submission format
 */
export function convertWorkspaceAnnotationsToSubmissionFormat(
  annotationStack: any[], // Replace with proper type from workspace
  images: any[] // Replace with proper image type
): AnnotationData[] {
  return annotationStack.map(stackItem => {
    // Find the corresponding image for this annotation
    const correspondingImage = images.find(img => img.id === stackItem.imageData?.id);

    if (!correspondingImage) {
      console.warn("Could not find corresponding image for annotation:", stackItem);
    }

    const imageData = correspondingImage || stackItem.imageData;

    return {
      imageId: imageData.id,
      imagePath: imageData.path || imageData.url || imageData.filename || `image_${imageData.id}`,
      annotations: {
        labels:
          stackItem.annotations.labels?.map((label: any) => ({
            id: label.id,
            label: label.label,
            confidence: label.confidence || 0.95,
          })) || [],
        boundingBoxes:
          stackItem.annotations.boundingBoxes?.map((bbox: any) => ({
            id: bbox.id,
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
            label: bbox.label,
            confidence: bbox.confidence || 0.95,
          })) || [],
        polygons:
          stackItem.annotations.polygons?.map((polygon: any) => ({
            id: polygon.id,
            points: polygon.points,
            label: polygon.label,
            confidence: polygon.confidence || 0.95,
          })) || [],
      },
    };
  });
}
