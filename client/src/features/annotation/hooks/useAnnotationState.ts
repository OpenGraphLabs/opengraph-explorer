import { useState, useCallback } from "react";
import { DatasetObject, DataObject } from "@/shared/api/graphql/datasetGraphQLService";
import { useDatasetSuiService } from "@/shared/api/sui/datasetSuiService";
import { AnnotationState, TransactionStatus } from "../types";

export function useAnnotationState() {
  const datasetSuiService = useDatasetSuiService();

  const [annotationState, setAnnotationState] = useState<AnnotationState>({
    annotations: {},
    pendingAnnotations: [],
    currentInput: "",
    saving: false,
  });

  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: "idle",
    message: "",
  });

  const updateCurrentInput = useCallback((value: string) => {
    setAnnotationState(prev => ({
      ...prev,
      currentInput: value,
    }));
  }, []);

  const addAnnotation = useCallback((item: DataObject, index: number, value: string) => {
    const key = `${item.blobId}_${index}`;

    // Update annotations state
    setAnnotationState(prev => ({
      ...prev,
      annotations: {
        ...prev.annotations,
        [key]: value,
      },
      currentInput: "", // Clear input after adding
    }));

    // Add to pending annotations with timestamp
    setAnnotationState(prev => {
      const existingIndex = prev.pendingAnnotations.findIndex(
        annotation => annotation.path === item.path
      );
      const now = Date.now();

      if (existingIndex >= 0) {
        const updated = [...prev.pendingAnnotations];
        updated[existingIndex] = {
          ...updated[existingIndex],
          label: [...updated[existingIndex].label, value],
          timestamp: now,
        };
        return {
          ...prev,
          pendingAnnotations: updated,
        };
      } else {
        return {
          ...prev,
          pendingAnnotations: [
            ...prev.pendingAnnotations,
            {
              path: item.path,
              label: [value],
              timestamp: now,
            },
          ],
        };
      }
    });
  }, []);

  const removeAnnotation = useCallback((path: string) => {
    setAnnotationState(prev => {
      // Remove from pending annotations
      const updatedPending = prev.pendingAnnotations.filter(annotation => annotation.path !== path);

      // Remove from annotations state
      const key = Object.keys(prev.annotations).find(k => k.includes(path));
      const newAnnotations = { ...prev.annotations };
      if (key) {
        delete newAnnotations[key];
      }

      return {
        ...prev,
        pendingAnnotations: updatedPending,
        annotations: newAnnotations,
      };
    });
  }, []);

  const savePendingAnnotations = useCallback(
    async (selectedDataset: DatasetObject) => {
      if (!selectedDataset || annotationState.pendingAnnotations.length === 0) return;

      try {
        setAnnotationState(prev => ({ ...prev, saving: true }));
        setTransactionStatus({
          status: "pending",
          message: "Submitting transaction to Sui blockchain...",
        });

        const result = await datasetSuiService.addAnnotationLabels(
          selectedDataset,
          annotationState.pendingAnnotations
        );

        // Success handling
        setTransactionStatus({
          status: "success",
          message: `Successfully saved ${annotationState.pendingAnnotations.length} annotations to blockchain!`,
          txHash: (result as any)?.digest || undefined,
        });

        setAnnotationState(prev => ({
          ...prev,
          pendingAnnotations: [],
        }));

        console.log("Annotations saved successfully:", result);

        // Reset status after 3 seconds
        setTimeout(() => {
          setTransactionStatus({
            status: "idle",
            message: "",
          });
        }, 3000);
      } catch (error) {
        console.error("Error saving annotations:", error);
        setTransactionStatus({
          status: "failed",
          message:
            error instanceof Error ? error.message : "Failed to save annotations to blockchain",
        });
      } finally {
        setAnnotationState(prev => ({ ...prev, saving: false }));
      }
    },
    [annotationState.pendingAnnotations, datasetSuiService]
  );

  const resetTransactionStatus = useCallback(() => {
    setTransactionStatus({
      status: "idle",
      message: "",
    });
  }, []);

  const clearPendingAnnotations = useCallback(() => {
    setAnnotationState(prev => ({
      ...prev,
      pendingAnnotations: [],
    }));
  }, []);

  return {
    ...annotationState,
    transactionStatus,
    updateCurrentInput,
    addAnnotation,
    removeAnnotation,
    savePendingAnnotations,
    resetTransactionStatus,
    clearPendingAnnotations,
  };
}
