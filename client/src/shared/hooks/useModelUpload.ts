import { useState } from "react";
import { Model } from "../types/model";
import { ModelConversionError, modelService } from "../api/modelService";

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
    console.log("Converting model file:", file.name);

    setState(prev => ({
      ...prev,
      selectedFile: file,
      isConverting: true,
      conversionStatus: "Uploading model file...",
      conversionProgress: 10,
      error: null,
    }));

    try {
      setState(prev => ({
        ...prev,
        conversionStatus: "Converting model...",
        conversionProgress: 30,
      }));

      // 진행 상태를 시각적으로 보여주기 위한 타임아웃
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        conversionStatus: "Optimizing for on-chain deployment...",
        conversionProgress: 70,
      }));

      // 진행 상태를 시각적으로 보여주기 위한 타임아웃
      await new Promise(resolve => setTimeout(resolve, 500));

      const convertedModel = await modelService.convertModel(file);
      console.log("Converted model:\n", convertedModel);

      // Test용 가벼운 모델
      // const convertedModel: Model = {
      //   layerDimensions: [
      //     [7, 5], // 입력층: 7 뉴런 -> 5 뉴런
      //     [5, 3], // 은닉층: 5 뉴런 -> 3 뉴런
      //     [3, 2], // 출력층: 3 뉴런 -> 2 뉴런
      //   ],
      //   weightsMagnitudes: [
      //     // 첫 번째 레이어 가중치 (7x5 = 35개 요소)
      //     [23, 19, 8, 15, 5, 13, 27, 43, 11, 21, 5, 18, 32, 14, 9, 26, 17, 31, 22, 19, 8, 13, 25, 30, 16, 24, 12, 18, 7, 29, 33, 21, 15, 10, 28],
      //     // 두 번째 레이어 가중치 (5x3 = 15개 요소)
      //     [11, 16, 14, 10, 18, 7, 22, 13, 19, 25, 8, 17, 20, 15, 9],
      //     // 세 번째 레이어 가중치 (3x2 = 6개 요소)
      //     [9, 12, 15, 8, 11, 14],
      //   ],
      //   weightsSigns: [
      //     // 첫 번째 레이어 가중치 부호
      //     [1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
      //     // 두 번째 레이어 가중치 부호
      //     [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
      //     // 세 번째 레이어 가중치 부호
      //     [0, 1, 1, 0, 1, 0],
      //   ],
      //   biasesMagnitudes: [
      //     // 첫 번째 레이어 바이어스 (5개 뉴런)
      //     [6, 8, 2, 9, 7],
      //     // 두 번째 레이어 바이어스 (3개 뉴런)
      //     [7, 5, 10],
      //     // 세 번째 레이어 바이어스 (2개 뉴런)
      //     [8, 4],
      //   ],
      //   biasesSigns: [
      //     // 첫 번째 레이어 바이어스 부호
      //     [1, 0, 1, 0, 1],
      //     // 두 번째 레이어 바이어스 부호
      //     [1, 0, 1],
      //     // 세 번째 레이어 바이어스 부호
      //     [0, 1],
      //   ],
      //   scale: 2, // 정밀도 스케일
      // };

      // 진행 상태를 시각적으로 보여주기 위한 타임아웃
      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        isConverting: false,
        conversionStatus: "Model conversion completed!",
        conversionProgress: 100,
        convertedModel,
      }));

      return convertedModel;
    } catch (error) {
      const errorMessage =
        error instanceof ModelConversionError
          ? error.message
          : "An error occurred while converting the model.";

      setState(prev => ({
        ...prev,
        isConverting: false,
        conversionStatus: "",
        conversionProgress: 0,
        error: errorMessage,
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
    resetUploadState,
  };
}
