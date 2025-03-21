import { useState } from 'react';
import { Model } from '../types/model';
import { ModelConversionError } from '../services/modelService';

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

      // TODO: 모델 변환 API 연동
      // const convertedModel = await modelService.convertModel(file);

      // TODO: Test용 더미 데이터 (경량화된 버전)
      const convertedModel: Model = {
        layerDimensions: [
          [10, 5],  // 입력층: 10 -> 5 뉴런
          [5, 3],   // 은닉층: 5 -> 3 뉴런
          [3, 2]    // 출력층: 3 -> 2 뉴런
        ],
        weightsMagnitudes: [
          // 첫 번째 레이어 가중치 (10x5 = 50개 요소)
          Array(50).fill(5),
          // 두 번째 레이어 가중치 (5x3 = 15개 요소)
          Array(15).fill(3),
          // 세 번째 레이어 가중치 (3x2 = 6개 요소)
          Array(6).fill(2)
        ],
        weightsSigns: [
          // 첫 번째 레이어 가중치 부호
          Array(50).fill(1),
          // 두 번째 레이어 가중치 부호
          Array(15).fill(0),
          // 세 번째 레이어 가중치 부호
          Array(6).fill(1)
        ],
        biasesMagnitudes: [
          // 첫 번째 레이어 바이어스 (5개 뉴런)
          Array(5).fill(2),
          // 두 번째 레이어 바이어스 (3개 뉴런)
          Array(3).fill(2),
          // 세 번째 레이어 바이어스 (2개 뉴런)
          Array(2).fill(2)
        ],
        biasesSigns: [
          // 첫 번째 레이어 바이어스 부호
          Array(5).fill(1),
          // 두 번째 레이어 바이어스 부호
          Array(3).fill(0),
          // 세 번째 레이어 바이어스 부호
          Array(2).fill(1)
        ],
        scale: 2  // 정밀도 스케일
      };

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