import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useDatasetSuiService } from "@/shared/api/sui/datasetSuiService";
import type { DatasetUploadState, DatasetMetadata } from "../types/upload";
import {
  DEFAULT_DATASET_METADATA,
  DEFAULT_UPLOAD_PROGRESS,
  UPLOAD_MESSAGES,
} from "../constants/upload";

export const useDatasetUpload = () => {
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const { createDatasetWithMultipleFiles } = useDatasetSuiService();

  const [state, setState] = useState<DatasetUploadState>({
    isLoading: false,
    error: null,
    uploadSuccess: false,
    selectedFiles: [],
    previewStep: "select",
    metadata: DEFAULT_DATASET_METADATA,
    uploadProgress: DEFAULT_UPLOAD_PROGRESS,
  });

  const updateMetadata = (updates: Partial<DatasetMetadata>) => {
    setState(prev => ({
      ...prev,
      metadata: { ...prev.metadata, ...updates },
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !state.metadata.tags.includes(tag.trim())) {
      updateMetadata({
        tags: [...state.metadata.tags, tag.trim()],
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateMetadata({
      tags: state.metadata.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;

    const newFiles = [...state.selectedFiles, ...files];
    setState(prev => ({
      ...prev,
      selectedFiles: newFiles,
      error: null,
      previewStep: "preview",
    }));
  };

  const handleFileRemove = (index: number) => {
    const newFiles = [...state.selectedFiles];
    newFiles.splice(index, 1);
    setState(prev => ({
      ...prev,
      selectedFiles: newFiles,
      previewStep: newFiles.length === 0 ? "select" : "preview",
    }));
  };

  const clearAllFiles = () => {
    setState(prev => ({
      ...prev,
      selectedFiles: [],
      previewStep: "select",
    }));
  };

  const resetForm = () => {
    setState({
      isLoading: false,
      error: null,
      uploadSuccess: false,
      selectedFiles: [],
      previewStep: "select",
      metadata: DEFAULT_DATASET_METADATA,
      uploadProgress: DEFAULT_UPLOAD_PROGRESS,
    });
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const validateUpload = (): string | null => {
    if (!currentWallet?.accounts[0]?.address) {
      return UPLOAD_MESSAGES.CONNECT_WALLET;
    }
    if (!state.metadata.name.trim()) {
      return UPLOAD_MESSAGES.NAME_REQUIRED;
    }
    if (state.selectedFiles.length === 0) {
      return UPLOAD_MESSAGES.NO_FILES;
    }
    return null;
  };

  const handleUpload = async () => {
    const validationError = validateUpload();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        previewStep: "upload",
        error: null,
        isLoading: true,
        uploadProgress: {
          totalFiles: prev.selectedFiles.length,
          status: "uploading",
          progress: 10,
          message: UPLOAD_MESSAGES.UPLOADING,
        },
      }));

      const totalSize = state.selectedFiles.reduce((sum, file) => sum + file.size, 0);
      const finalMetadata = {
        ...state.metadata,
        dataSize: totalSize,
        creator: state.metadata.creator || currentWallet!.accounts[0].address,
      };

      await createDatasetWithMultipleFiles(
        finalMetadata,
        state.selectedFiles,
        10, // epochs
        result => {
          console.log("Dataset created:", result);
          setState(prev => ({
            ...prev,
            uploadSuccess: true,
            uploadProgress: {
              ...prev.uploadProgress,
              status: "success",
              progress: 100,
              message: UPLOAD_MESSAGES.SUCCESS,
            },
          }));

          // Reset form and navigate
          setTimeout(() => {
            resetForm();
            navigate("/datasets");
          }, 1000);
        },
        error => {
          console.error("Dataset creation failed:", error);
          const errorMessage = `Failed to create dataset: ${error.message}`;
          setState(prev => ({
            ...prev,
            error: errorMessage,
            uploadProgress: {
              ...prev.uploadProgress,
              status: "failed",
              message: errorMessage,
            },
          }));
        }
      );
    } catch (error) {
      console.error("Error in upload process:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process dataset";
      setState(prev => ({
        ...prev,
        error: errorMessage,
        uploadProgress: {
          ...prev.uploadProgress,
          status: "failed",
          message: errorMessage,
        },
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const isUploadDisabled = () => {
    return (
      !currentWallet?.accounts[0]?.address ||
      !state.metadata.name ||
      state.isLoading ||
      state.selectedFiles.length === 0
    );
  };

  return {
    // State
    ...state,

    // Metadata management
    updateMetadata,
    addTag,
    removeTag,

    // File management
    handleFileSelect,
    handleFileRemove,
    clearAllFiles,

    // Upload process
    handleUpload,
    isUploadDisabled,
    setError,
    resetForm,

    // Computed values
    totalFileSize: state.selectedFiles.reduce((sum, file) => sum + file.size, 0),
    fileCount: state.selectedFiles.length,
  };
};
