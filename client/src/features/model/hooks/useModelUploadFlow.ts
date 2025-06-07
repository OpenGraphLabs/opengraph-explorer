import { useState } from "react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useNavigate } from "react-router-dom";
import { useModelUpload } from "@/shared/hooks/useModelUpload";
import { useUploadModelToSui } from "@/shared/api/sui/modelSuiService";
import type { ModelUploadInfo, ModelUploadState, DatasetObject } from "../types/upload";

export const useModelUploadFlow = () => {
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const { uploadModel } = useUploadModelToSui();

  const [modelInfo, setModelInfo] = useState<ModelUploadInfo>({
    name: "",
    description: "",
    modelType: "text-generation",
  });

  const [uploadState, setUploadState] = useState<ModelUploadState>({
    isUploading: false,
    uploadError: null,
    uploadSuccess: false,
    transactionInProgress: false,
    transactionHash: null,
  });

  const {
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    convertedModel,
    error: conversionError,
    convertModel,
    resetUploadState,
  } = useModelUpload();

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploadState(prev => ({ ...prev, uploadError: null }));
      await convertModel(files[0]);
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploadError: error instanceof Error ? error.message : "Failed to convert model file",
      }));
    }
  };

  const updateModelInfo = (updates: Partial<ModelUploadInfo>) => {
    setModelInfo(prev => ({ ...prev, ...updates }));
  };

  const handleUpload = async (
    trainingDataset: DatasetObject | null,
    testDatasets: DatasetObject[]
  ) => {
    if (!currentWallet?.accounts[0]?.address) {
      setUploadState(prev => ({ ...prev, uploadError: "Please connect your wallet first" }));
      return;
    }

    if (!modelInfo.name || !modelInfo.description || !modelInfo.modelType) {
      setUploadState(prev => ({ ...prev, uploadError: "Please fill in all required fields." }));
      return;
    }

    if (!convertedModel) {
      setUploadState(prev => ({ ...prev, uploadError: "Please convert the model file first." }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      isUploading: true,
      uploadError: null,
      transactionInProgress: true,
      transactionHash: null,
      uploadSuccess: false,
    }));

    try {
      await uploadModel(
        convertedModel,
        {
          name: modelInfo.name,
          description: modelInfo.description,
          modelType: modelInfo.modelType,
          trainingDatasetId: trainingDataset?.id,
          testDatasetIds: testDatasets.map(dataset => dataset.id),
        },
        result => {
          console.log("Model uploaded to blockchain:", result);

          if (result && typeof result === "object" && "digest" in result) {
            setUploadState(prev => ({ ...prev, transactionHash: result.digest }));
          }

          setUploadState(prev => ({
            ...prev,
            uploadSuccess: true,
            transactionInProgress: false,
            isUploading: false,
          }));

          setTimeout(() => {
            navigate("/models");
          }, 1000);
        }
      );
    } catch (error) {
      console.error("Error uploading model to blockchain:", error);
      setUploadState(prev => ({
        ...prev,
        uploadError: error instanceof Error ? error.message : "Failed to upload model",
        transactionInProgress: false,
        isUploading: false,
      }));
    }
  };

  const clearUploadError = () => {
    setUploadState(prev => ({ ...prev, uploadError: null }));
  };

  const isReadyForUpload = (): boolean => {
    return !!(
      convertedModel &&
      modelInfo.name &&
      modelInfo.description &&
      modelInfo.modelType &&
      !uploadState.isUploading
    );
  };

  return {
    // Model info
    modelInfo,
    updateModelInfo,

    // File conversion
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    convertedModel,
    conversionError,
    handleFileSelect,
    resetUploadState,

    // Upload state
    uploadState,
    clearUploadError,

    // Upload flow
    handleUpload,
    isReadyForUpload,
  };
};
