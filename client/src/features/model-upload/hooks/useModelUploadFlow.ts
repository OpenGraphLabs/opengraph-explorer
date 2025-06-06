import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { datasetGraphQLService } from "../../../shared/api/datasetGraphQLService";
import { useModelUpload } from "../../../shared/hooks/useModelUpload";
import { useUploadModelToSui } from "../../../shared/api/modelSuiService";
import { 
  ModelInfo, 
  UploadStatus, 
  DatasetSelectionInfo, 
  FilterState,
  DatasetObject 
} from "../types";

export function useModelUploadFlow() {
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const { uploadModel } = useUploadModelToSui();
  
  // Model information state
  const [modelInfo, setModelInfo] = useState<ModelInfo>({
    name: "",
    description: "",
    modelType: "text-generation",
  });
  
  // Upload status state
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    isUploading: false,
    uploadError: null,
    uploadSuccess: false,
    transactionInProgress: false,
    transactionHash: null,
  });
  
  // Dataset selection state
  const [datasetInfo, setDatasetInfo] = useState<DatasetSelectionInfo>({
    availableDatasets: [],
    selectedTrainingDataset: null,
    selectedTestDatasets: [],
    isLoading: false,
    error: null,
  });
  
  // Filter state
  const [filterState, setFilterState] = useState<FilterState>({
    selectedTags: [],
    searchQuery: "",
  });

  // Model upload hook
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

  // Fetch user datasets
  const fetchUserDatasets = async () => {
    try {
      setDatasetInfo(prev => ({ ...prev, isLoading: true, error: null }));
      const datasets = await datasetGraphQLService.getAllDatasets();
      setDatasetInfo(prev => ({
        ...prev,
        availableDatasets: datasets,
        isLoading: false,
      }));
    } catch (error) {
      setDatasetInfo(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch datasets",
      }));
    }
  };

  // Initialize datasets when wallet is connected
  useEffect(() => {
    if (currentWallet?.accounts[0]?.address) {
      fetchUserDatasets();
    }
  }, [currentWallet?.accounts[0]?.address]);

  // Dataset filtering functions
  const getAllUniqueTags = () => {
    const allTags = new Set<string>();
    datasetInfo.availableDatasets.forEach(dataset => {
      if (dataset.tags && dataset.tags.length > 0) {
        dataset.tags.forEach(tag => allTags.add(tag));
      }
    });
    return Array.from(allTags).sort();
  };

  const toggleTag = (tag: string) => {
    setFilterState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const clearTags = () => {
    setFilterState(prev => ({ ...prev, selectedTags: [] }));
  };

  const setSearchQuery = (query: string) => {
    setFilterState(prev => ({ ...prev, searchQuery: query }));
  };

  const getFilteredDatasets = () => {
    return datasetInfo.availableDatasets.filter(dataset => {
      // Search filter
      const searchFilter = 
        filterState.searchQuery === "" ||
        dataset.name.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
        (dataset.description && dataset.description.toLowerCase().includes(filterState.searchQuery.toLowerCase()));
      
      // Tag filter
      const tagFilter = 
        filterState.selectedTags.length === 0 || 
        (dataset.tags && filterState.selectedTags.every(tag => dataset.tags?.includes(tag)));
      
      return searchFilter && tagFilter;
    });
  };

  // Model info handlers
  const updateModelInfo = (updates: Partial<ModelInfo>) => {
    setModelInfo(prev => ({ ...prev, ...updates }));
  };

  const handleModelTypeChange = (value: string) => {
    updateModelInfo({ modelType: value });
  };

  // File handling
  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    try {
      setUploadStatus(prev => ({ ...prev, uploadError: null }));
      await convertModel(files[0]);
    } catch (error) {
      setUploadStatus(prev => ({
        ...prev,
        uploadError: error instanceof Error ? error.message : "Failed to convert model file"
      }));
    }
  };

  // Dataset selection handlers
  const handleTrainingDatasetSelect = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({
      ...prev,
      selectedTrainingDataset: dataset,
    }));
  };

  const handleTestDatasetSelect = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({
      ...prev,
      selectedTestDatasets: [...prev.selectedTestDatasets, dataset],
    }));
  };

  const handleTestDatasetRemove = (dataset: DatasetObject) => {
    setDatasetInfo(prev => ({
      ...prev,
      selectedTestDatasets: prev.selectedTestDatasets.filter(d => d.id !== dataset.id),
    }));
  };

  // Upload handlers
  const handleUpload = async () => {
    if (!currentWallet?.accounts[0]?.address) {
      setUploadStatus(prev => ({ ...prev, uploadError: "Please connect your wallet first" }));
      return;
    }

    if (!modelInfo.name || !modelInfo.description || !modelInfo.modelType) {
      setUploadStatus(prev => ({ ...prev, uploadError: "Please fill in all required fields." }));
      return;
    }

    if (!convertedModel) {
      setUploadStatus(prev => ({ ...prev, uploadError: "Please convert the model file first." }));
      return;
    }

    setUploadStatus(prev => ({
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
          trainingDatasetId: datasetInfo.selectedTrainingDataset?.id,
          testDatasetIds: datasetInfo.selectedTestDatasets.map(dataset => dataset.id),
        },
        result => {
          console.log("Model uploaded to blockchain:", result);

          const txHash = result && typeof result === "object" && "digest" in result 
            ? result.digest 
            : null;

          setUploadStatus(prev => ({
            ...prev,
            uploadSuccess: true,
            transactionInProgress: false,
            isUploading: false,
            transactionHash: txHash,
          }));

          setTimeout(() => {
            navigate("/models");
          }, 1000);
        }
      );
    } catch (error) {
      console.error("Error uploading model to blockchain:", error);
      setUploadStatus(prev => ({
        ...prev,
        uploadError: error instanceof Error ? error.message : "Failed to upload model",
        transactionInProgress: false,
        isUploading: false,
      }));
    }
  };

  const dismissError = () => {
    setUploadStatus(prev => ({ ...prev, uploadError: null }));
  };

  const canUpload = () => {
    return (
      !uploadStatus.isUploading &&
      !!convertedModel &&
      !!modelInfo.name &&
      !!modelInfo.description &&
      !!modelInfo.modelType
    );
  };

  return {
    // State
    modelInfo,
    uploadStatus,
    datasetInfo,
    filterState,
    
    // File conversion state
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    convertedModel,
    conversionError,
    
    // Functions
    updateModelInfo,
    handleModelTypeChange,
    handleFileSelect,
    handleTrainingDatasetSelect,
    handleTestDatasetSelect,
    handleTestDatasetRemove,
    handleUpload,
    dismissError,
    canUpload,
    
    // Dataset filtering
    getAllUniqueTags,
    toggleTag,
    clearTags,
    setSearchQuery,
    getFilteredDatasets,
    
    // Utilities
    resetUploadState,
    fetchUserDatasets,
  };
} 