import { useState } from "react";
import { useModelInference as useSuiModelInference } from "../services/modelSuiService";
import { ModelObject, Layer } from "../services/modelGraphQLService";

export interface PredictResult {
  layerIdx: number;
  inputMagnitude: number[];
  inputSign: number[];
  outputMagnitude: number[];
  outputSign: number[];
  activationType: number;
  argmaxIdx?: number;
  txDigest?: string;
  status: "success" | "error" | "processing";
  errorMessage?: string;
}

export function useModelInferenceState(model: ModelObject, totalLayers: number) {
  // Inference related state
  const [inputVector, setInputVector] = useState<string>("");
  const [inputValues, setInputValues] = useState<number[]>([]);
  const [inputSigns, setInputSigns] = useState<number[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [predictResults, setPredictResults] = useState<PredictResult[]>([]);
  const [inferenceStatus, setInferenceStatus] = useState<string>("");
  const [inferenceStatusType, setInferenceStatusType] = useState<
    "info" | "success" | "error" | "warning"
  >("info");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txDigest, setTxDigest] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false); // 이미지 분석 상태

  // Get SUI inference hook
  const {
    predictModel,
    predictModelWithPTBOptimization,
    predictModelWithChunkedPTB,
    parseLayerPartialComputedEvents,
    reconstructLayerOutputs,
    parsePredictionCompletedEvent,
  } = useSuiModelInference();

  // Parse input vector
  const parseInputVector = () => {
    try {
      // 이미 저장된 inputValues와 inputSigns가 있다면 그것을 사용
      if (
        inputValues.length > 0 &&
        inputSigns.length > 0 &&
        inputValues.length === inputSigns.length
      ) {
        return { magnitudes: inputValues, signs: inputSigns };
      }

      // 없는 경우 inputVector 문자열을 파싱
      let values = inputVector
        .split(",")
        .map(val => val.trim())
        .filter(val => val !== "");

      if (values.length === 0) {
        throw new Error("Input vector is empty. Please provide comma-separated numbers.");
      }

      // Convert to numbers and separate into signs and magnitudes
      const magnitudes: number[] = [];
      const signs: number[] = [];

      values.forEach(val => {
        const num = parseFloat(val);
        if (isNaN(num)) {
          throw new Error(`Invalid number format: "${val}". Please provide valid numbers.`);
        }

        // Determine sign (0=positive, 1=negative)
        const sign = num >= 0 ? 0 : 1;
        // Magnitude (absolute value)
        const magnitude = Math.abs(num);

        magnitudes.push(magnitude);
        signs.push(sign);
      });

      setInputValues(magnitudes);
      setInputSigns(signs);
      setInferenceStatusType("info");
      return { magnitudes, signs };
    } catch (error) {
      console.error("Input vector parsing error:", error);
      setInferenceStatus(
        `Error: ${error instanceof Error ? error.message : "Invalid input vector format."}`
      );
      setInferenceStatusType("error");
      return null;
    }
  };

  /**
   * 최적화된 PTB를 이용한 모든 레이어 한 번에 실행 함수
   */
  const runAllLayersWithPTBOptimization = async () => {
    // Parse input vector
    const parsedInput = parseInputVector();
    if (!parsedInput) return;

    // Reset existing results
    setPredictResults([]);
    setCurrentLayerIndex(0);
    setTxDigest("");

    setIsProcessing(true);
    setIsAnalyzing(true);
    setInferenceStatus(`Processing: Running all ${totalLayers} layers with optimized PTB...`);
    setInferenceStatusType("info");

    try {
      // 모델의 레이어별 출력 차원 정보
      const layerDimensions = getLayerDimensions();
      console.log("xxxxxx layerDimensions", layerDimensions);

      // 최적화된 PTB로 모든 레이어 예측 실행
      await predictModelWithPTBOptimization(
          model.id,
          totalLayers,
          layerDimensions,
          parsedInput.magnitudes,
          parsedInput.signs,
          res => {
            console.log("--------------------------------");
            console.log(`Optimized PTB prediction result:`, res);
            console.log(`Events:`, res.events);
            console.log("--------------------------------");

            if (res && res.digest) {
              setTxDigest(res.digest);
              processOptimizedPTBResult(res, parsedInput.magnitudes, parsedInput.signs);
            } else {
              setInferenceStatus(
                  `Error: No transaction digest received. The transaction might have failed.`
              );
              setInferenceStatusType("error");
              setIsProcessing(false);
            }
          }
      );
    } catch (error) {
      console.error(`Optimized PTB inference error:`, error);
      const errorMessage =
          error instanceof Error
              ? error.message
              : "An error occurred during optimized PTB inference execution. Please try again.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
      setIsProcessing(false);
    }
  };

  /**
   * Chunked PTB를 이용한 모든 레이어 한 번에 실행 함수
   */
  const runAllLayersWithChunkedPTB = async () => {
    // Parse input vector
    const parsedInput = parseInputVector();
    if (!parsedInput) return;

    // Reset existing results
    setPredictResults([]);
    setCurrentLayerIndex(0);
    setTxDigest("");

    setIsProcessing(true);
    setInferenceStatus(`Processing: Running all ${totalLayers} layers with optimized PTB...`);
    setInferenceStatusType("info");

    try {
      // 모델의 레이어별 출력 차원 정보
      const layerDimensions = getLayerDimensions();
      console.log("xxxxxx layerDimensions", layerDimensions);

      // chunked PTB로 모든 레이어 예측 실행
      await predictModelWithChunkedPTB(
          model,
          parsedInput.magnitudes,
          parsedInput.signs,
          res => {
            console.log("--------------------------------");
            console.log(`Optimized PTB prediction result:`, res);
            console.log(`Events:`, res.events);
            console.log("--------------------------------");

            if (res && res.digest) {
              setTxDigest(res.digest);
              processOptimizedPTBResult(res, parsedInput.magnitudes, parsedInput.signs);
            } else {
              setInferenceStatus(
                  `Error: No transaction digest received. The transaction might have failed.`
              );
              setInferenceStatusType("error");
              setIsProcessing(false);
            }
          }
      );
    } catch (error) {
      console.error(`Optimized PTB inference error:`, error);
      const errorMessage =
          error instanceof Error
              ? error.message
              : "An error occurred during optimized PTB inference execution. Please try again.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
      setIsProcessing(false);
    }
  };

  /**
   * 최적화된 PTB를 이용한 모든 레이어 한 번에 실행 함수
   */
  const runAllLayersByInputNodes = async () => {
    // Parse input vector
    const parsedInput = parseInputVector();
    if (!parsedInput) return;

    // Reset existing results
    setPredictResults([]);
    setCurrentLayerIndex(0);
    setTxDigest("");

    setIsProcessing(true);
    setInferenceStatus(`Processing: Running all ${totalLayers} layers with optimized PTB...`);
    setInferenceStatusType("info");

    try {
      // 모델의 레이어별 출력 차원 정보
      const layerDimensions = getLayerDimensions();
      console.log("xxxxxx layerDimensions", layerDimensions);

      // 최적화된 PTB로 모든 레이어 예측 실행
      await predictModel(
        model,
        parsedInput.magnitudes,
        parsedInput.signs,
        res => {
          console.log("--------------------------------");
          console.log(`Optimized PTB prediction result:`, res);
          console.log(`Events:`, res.events);
          console.log("--------------------------------");

          if (res && res.digest) {
            setTxDigest(res.digest);
            processOptimizedPTBResult(res, parsedInput.magnitudes, parsedInput.signs);
          } else {
            setInferenceStatus(
              `Error: No transaction digest received. The transaction might have failed.`
            );
            setInferenceStatusType("error");
            setIsProcessing(false);
          }
        }
      );
    } catch (error) {
      console.error(`Optimized PTB inference error:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during optimized PTB inference execution. Please try again.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
      setIsProcessing(false);
    }
  };

  /**
   * 모델의 레이어별 출력 차원 정보를 반환하는 함수
   * 모델 메타데이터에서 실제 출력 차원 정보를 가져옴
   * @throws {Error} 레이어 차원 정보를 가져오지 못한 경우 에러 발생
   */
  const getLayerDimensions = () => {
    try {
      // 1. 모델 객체가 전달되었다면 먼저 그것을 사용
      if (model && model.graphs && model.graphs.length > 0 && model.graphs[0].layers) {
        const layers: Layer[] = model.graphs[0].layers;
        // 각 레이어의 출력 차원을 추출
        const dimensions = layers.map((layer: Layer) => Number(layer.out_dimension));
        console.log("Layer dimensions from model:", dimensions);
        if (dimensions.length === totalLayers && dimensions.every((dim: number) => dim > 0)) {
          return dimensions;
        }
      }

      // 2. 모델 객체가 없거나 유효하지 않은 경우, 이전 예측 결과에서 정보 추출
      const layerDimensions: number[] = [];

      // 이전에 처리된 결과가 있으면 그 결과로부터 차원 정보를 추출
      predictResults.forEach((result: PredictResult) => {
        if (result.outputMagnitude && result.outputMagnitude.length > 0) {
          layerDimensions[result.layerIdx] = result.outputMagnitude.length;
        }
      });

      // 결과에서 모든 레이어 차원 정보를 가져왔는지 확인
      if (
        layerDimensions.length === totalLayers &&
        layerDimensions.every((dim: number) => dim > 0)
      ) {
        console.log("Layer dimensions from prediction results:", layerDimensions);
        return layerDimensions;
      }

      // 모델 차원 정보를 찾지 못한 경우 에러 발생
      throw new Error("Layer dimensions not found. Please check the model metadata.");
    } catch (error) {
      console.error("Error getting layer dimensions:", error);
      // 에러 그대로 전달
      throw error;
    }
  };

  /**
   * 최적화된 PTB 트랜잭션 결과를 처리하는 함수
   */
  const processOptimizedPTBResult = (
    result: any,
    inputMagnitude: number[],
    inputSign: number[]
  ) => {
    try {
      const events = result.events || [];

      // 모든 LayerPartialComputed 이벤트 파싱
      const partialLayerEvents = parseLayerPartialComputedEvents(events);

      // PredictionCompleted 이벤트 파싱
      const predictionCompletedEvent = parsePredictionCompletedEvent(events);

      if (partialLayerEvents.length > 0) {
        // 레이어별로 결과 재구성
        const layerOutputs = reconstructLayerOutputs(partialLayerEvents, totalLayers);

        // 결과 처리 및 시각화를 위한 PredictResult 배열 생성
        const results: PredictResult[] = [];
        let prevInputMagnitude = inputMagnitude;
        let prevInputSign = inputSign;

        // 각 레이어에 대한 결과 생성
        for (let layerIdx = 0; layerIdx < totalLayers; layerIdx++) {
          if (layerOutputs[layerIdx]) {
            const { magnitudes, signs } = layerOutputs[layerIdx];

            // 결과 저장
            results.push({
              layerIdx: layerIdx,
              inputMagnitude: prevInputMagnitude,
              inputSign: prevInputSign,
              outputMagnitude: magnitudes,
              outputSign: signs,
              // 마지막 레이어일 경우 argmaxIdx 추가
              argmaxIdx:
                layerIdx === totalLayers - 1 ? predictionCompletedEvent?.argmaxIdx : undefined,
              activationType: layerIdx < totalLayers - 1 ? 1 : 0, // 마지막 레이어 제외 ReLU 적용
              txDigest: result.digest,
              status: "success",
            });

            // 다음 레이어 입력으로 현재 레이어 출력 사용
            prevInputMagnitude = magnitudes;
            prevInputSign = signs;
          }
        }

        // 모든 결과 저장 및 현재 레이어 인덱스 업데이트
        setPredictResults(results);
        setCurrentLayerIndex(totalLayers);

        // 최종 결과 메시지 설정
        if (predictionCompletedEvent && predictionCompletedEvent.argmaxIdx !== undefined) {
          // const finalValue = formatVector(
          //   [predictionCompletedEvent.outputMagnitude[predictionCompletedEvent.argmaxIdx]],
          //   [predictionCompletedEvent.outputSign[predictionCompletedEvent.argmaxIdx]]
          // );
          const finalValue = predictionCompletedEvent.argmaxIdx;

          setInferenceStatus(
            `Success! All ${totalLayers} layers processed. Final output value: ${finalValue}`
          );
          setInferenceStatusType("success");
        } else {
          setInferenceStatus(
            `Success! All ${totalLayers} layers processed.`
          );
          setInferenceStatusType("success");
        }
      } else {
        setInferenceStatus(
          `Warning: PTB transaction completed but no layer computation events found. Please check the transaction details.`
        );
        setInferenceStatusType("warning");
      }
    } catch (error) {
      console.error("Error processing optimized PTB transaction result:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while processing the optimized PTB transaction result.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
    } finally {
      setIsProcessing(false);
      setIsAnalyzing(false);
    }
  };

  return {
    // State
    inputVector,
    inputValues,
    inputSigns,
    currentLayerIndex,
    predictResults,
    inferenceStatus,
    inferenceStatusType,
    isProcessing,
    txDigest,
    isAnalyzing,
    // Actions
    setInputVector,
    setInputValues,
    setInputSigns,
    parseInputVector,
    runAllLayersWithPTBOptimization,
    runAllLayersWithChunkedPTB,
    runAllLayersByInputNodes,
  };
}
