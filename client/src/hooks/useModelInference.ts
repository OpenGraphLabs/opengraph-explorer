import { useState } from "react";
import { useModelInference as useSuiModelInference } from "../services/modelSuiService";
import { formatVector } from "../utils/modelUtils";

export interface PredictResult {
  layerIdx: number;
  inputMagnitude: number[];
  inputSign: number[];
  outputMagnitude: number[];
  outputSign: number[];
  activationType: number;
  argmaxIdx?: number;
}

export function useModelInferenceState(modelId: string, totalLayers: number) {
  // 추론 관련 상태
  const [inputVector, setInputVector] = useState<string>("");
  const [inputValues, setInputValues] = useState<number[]>([]);
  const [inputSigns, setInputSigns] = useState<number[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [predictResults, setPredictResults] = useState<PredictResult[]>([]);
  const [inferenceStatus, setInferenceStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txDigest, setTxDigest] = useState<string>("");
  
  // SUI 추론 훅 가져오기
  const { predictLayer, parseLayerComputedEvent, parsePredictionCompletedEvent } = useSuiModelInference();

  // 입력 벡터 파싱
  const parseInputVector = () => {
    try {
      let values = inputVector.split(",").map(val => val.trim()).filter(val => val !== "");
      
      if (values.length === 0) {
        throw new Error("입력 벡터가 비어 있습니다.");
      }
      
      // 숫자로 변환하고 부호와 크기로 분리
      const magnitudes: number[] = [];
      const signs: number[] = [];
      
      values.forEach(val => {
        const num = parseFloat(val);
        if (isNaN(num)) {
          throw new Error(`유효하지 않은 숫자: ${val}`);
        }
        
        // 부호 결정 (0=양수, 1=음수)
        const sign = num >= 0 ? 0 : 1;
        // 크기 (절대값)
        const magnitude = Math.abs(num);
        
        magnitudes.push(magnitude);
        signs.push(sign);
      });
      
      setInputValues(magnitudes);
      setInputSigns(signs);
      return { magnitudes, signs };
    } catch (error) {
      console.error("입력 벡터 파싱 오류:", error);
      setInferenceStatus(`오류: ${error instanceof Error ? error.message : "입력 벡터 형식이 잘못되었습니다."}`);
      return null;
    }
  };

  // 레이어 예측 실행
  const runLayerPrediction = async (layerIdx: number, inputMagnitude: number[], inputSign: number[]) => {
    if (!modelId) return;
    
    setIsProcessing(true);
    setInferenceStatus(`레이어 ${layerIdx} 예측 중...`);
    
    try {
      // 레이어 예측 트랜잭션 호출
      const result = await predictLayer(modelId, layerIdx, inputMagnitude, inputSign, (res) => {
        console.log("--------------------------------");
        console.log(`Layer ${layerIdx} prediction result:`, res);
        console.log(`Layer ${layerIdx} prediction events:`, res.events);
        console.log("--------------------------------");
        
        if (res && res.digest) {
          setTxDigest(res.digest);
          processTransactionResult(res, layerIdx, inputMagnitude, inputSign);
        }
      });
    } catch (error) {
      console.error(`레이어 ${layerIdx} 예측 오류:`, error);
      setInferenceStatus(`오류: ${error instanceof Error ? error.message : "예측 실행 중 오류가 발생했습니다."}`);
      setIsProcessing(false);
    }
  };
  
  // 트랜잭션 결과 처리
  const processTransactionResult = async (result: any, layerIdx: number, inputMagnitude: number[], inputSign: number[]) => {
    try {
      console.log("Transaction result:", result);

      // 1초 대기하여 트랜잭션이 완료될 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // LayerComputed 이벤트 파싱
      const layerResult = parseLayerComputedEvent(result.events);
      console.log("xxxxxxxxxxxxxxxxx");
      console.log("Layer result:", layerResult);
      console.log("xxxxxxxxxxxxxxxxx");
      
      // PredictionCompleted 이벤트 파싱 (마지막 레이어인 경우)
      const predictionResult = parsePredictionCompletedEvent(result.events);
      console.log("Prediction result:", predictionResult);
      
      if (layerResult) {
        // 결과를 저장
        const newResult = {
          layerIdx,
          inputMagnitude,
          inputSign,
          outputMagnitude: layerResult.outputMagnitude,
          outputSign: layerResult.outputSign,
          activationType: layerResult.activationType,
          argmaxIdx: predictionResult?.argmaxIdx,
        };
        
        setPredictResults(prev => [...prev, newResult]);
        
        // 다음 레이어 인덱스 설정
        setCurrentLayerIndex(layerIdx + 1);
        
        // 이벤트가 검색되었는지 여부에 따라 상태 업데이트
        if (predictionResult) {
          // 마지막 레이어 (예측 완료)
          const finalValue = formatVector(
            [predictionResult.outputMagnitude[predictionResult.argmaxIdx]], 
            [predictionResult.outputSign[predictionResult.argmaxIdx]]
          );
          setInferenceStatus(`예측 완료! 최종 값: ${finalValue}`);
          setIsProcessing(false);
        } else {
          // 다음 레이어 준비
          setInferenceStatus(`레이어 ${layerIdx} 예측 완료. 다음 레이어 준비 중...`);
          setIsProcessing(false);
          
          // 자동으로 다음 레이어 실행 (마지막 레이어가 아닌 경우)
          if (layerIdx + 1 < totalLayers) {
            // 0.5초 후 다음 레이어 실행
            setTimeout(() => {
              runLayerPrediction(
                layerIdx + 1,
                layerResult.outputMagnitude,
                layerResult.outputSign
              );
            }, 500);
          }
        }
      } else {
        setInferenceStatus(`레이어 ${layerIdx} 예측 완료했지만 이벤트를 찾을 수 없습니다.`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("트랜잭션 결과 처리 오류:", error);
      setInferenceStatus(`오류: ${error instanceof Error ? error.message : "트랜잭션 결과 처리 중 오류가 발생했습니다."}`);
      setIsProcessing(false);
    }
  };
  
  // 레이어 추론 시작
  const startInference = async () => {
    // 입력 벡터 파싱
    const parsedInput = parseInputVector();
    if (!parsedInput) return;
    
    // 기존 결과 초기화
    setPredictResults([]);
    setCurrentLayerIndex(0);
    setTxDigest("");
    
    // 첫 번째 레이어 예측 실행
    await runLayerPrediction(0, parsedInput.magnitudes, parsedInput.signs);
  };
  
  // 다음 레이어 추론 (수동)
  const predictNextLayer = async () => {
    if (predictResults.length === 0) {
      setInferenceStatus("먼저 첫 번째 레이어를 예측해야 합니다.");
      return;
    }
    
    // 마지막 예측 결과 가져오기
    const lastResult = predictResults[predictResults.length - 1];
    
    // 다음 레이어 예측 실행 (이전 레이어의 출력을 입력으로 사용)
    await runLayerPrediction(
      currentLayerIndex,
      lastResult.outputMagnitude,
      lastResult.outputSign
    );
  };

  return {
    // 상태
    inputVector,
    inputValues,
    inputSigns,
    currentLayerIndex,
    predictResults,
    inferenceStatus,
    isProcessing,
    txDigest,
    // 액션
    setInputVector,
    parseInputVector,
    startInference,
    predictNextLayer,
    runLayerPrediction
  };
} 