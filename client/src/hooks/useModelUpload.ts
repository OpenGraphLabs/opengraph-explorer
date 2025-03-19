import { useState } from 'react';
import { Model } from '../types/model';
import { modelService, ModelConversionError } from '../services/modelService';

interface ModelUploadState {
  selectedFile: File | null;
  isConverting: boolean;
  conversionStatus: string;
  conversionProgress: number;
  convertedModel: Model | null;
  error: string | null;
}

export function useModelUpload() {
  const [state, setState] = useState<ModelUploadState>({
    selectedFile: null,
    isConverting: false,
    conversionStatus: "",
    conversionProgress: 0,
    convertedModel: null,
    error: null,
  });

  const convertModel = async (file: File) => {
    setState(prev => ({
      ...prev,
      selectedFile: file,
      isConverting: true,
      conversionStatus: "Uploading model file...",
      conversionProgress: 10,
      error: null
    }));

    try {
      setState(prev => ({
        ...prev,
        conversionStatus: "Converting model...",
        conversionProgress: 30
      }));

      const convertedModel = await modelService.convertModel(file);

      setState(prev => ({
        ...prev,
        isConverting: false,
        conversionStatus: "Model conversion completed!",
        conversionProgress: 100,
        convertedModel
      }));

      return convertedModel;
    } catch (error) {
      const errorMessage = error instanceof ModelConversionError 
        ? error.message 
        : 'An error occurred while converting the model.';

      setState(prev => ({
        ...prev,
        isConverting: false,
        conversionStatus: "",
        conversionProgress: 0,
        error: errorMessage
      }));
      throw error;
    }
  };

  const resetUploadState = () => {
    setState({
      selectedFile: null,
      isConverting: false,
      conversionStatus: "",
      conversionProgress: 0,
      convertedModel: null,
      error: null,
    });
  };

  return {
    ...state,
    convertModel,
    resetUploadState
  };
} 