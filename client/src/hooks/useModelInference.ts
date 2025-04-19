import { useState } from "react";
import { useModelInference as useSuiModelInference } from "../services/modelSuiService";
import { formatVector } from "../utils/modelUtils";
import { SUI_CONTRACT } from "../constants/suiConfig";
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

export function useModelInferenceState(modelId: string, totalLayers: number, model?: ModelObject) {
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

  // Get SUI inference hook
  const {
    predictLayer,
    predictModelWithPTB,
    predictModelWithPTBOptimization,
    parseLayerComputedEvent,
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

  // Execute layer prediction
  const runLayerPrediction = async (
    layerIdx: number,
    inputMagnitude: number[],
    inputSign: number[]
  ) => {
    if (!modelId) {
      setInferenceStatus("Error: Model ID is missing. Please refresh the page and try again.");
      setInferenceStatusType("error");
      return;
    }

    setIsProcessing(true);
    setInferenceStatus(`Processing: Predicting layer ${layerIdx + 1} of ${totalLayers}...`);
    setInferenceStatusType("info");

    try {
      // Call layer prediction transaction
      await predictLayer(modelId, layerIdx, inputMagnitude, inputSign, res => {
        console.log("--------------------------------");
        console.log(`Layer ${layerIdx} prediction result:`, res);
        console.log(`Layer ${layerIdx} prediction events:`, res.events);
        console.log("--------------------------------");

        if (res && res.digest) {
          setTxDigest(res.digest);
          processTransactionResult(res, layerIdx, inputMagnitude, inputSign);
        } else {
          setInferenceStatus(
            `Error: No transaction digest received for layer ${layerIdx + 1}. The transaction might have failed.`
          );
          setInferenceStatusType("error");
          setIsProcessing(false);

          // Add error result to show in UI
          setPredictResults(prev => [
            ...prev,
            {
              layerIdx,
              inputMagnitude,
              inputSign,
              outputMagnitude: [],
              outputSign: [],
              activationType: 0,
              txDigest: res?.digest,
              status: "error",
              errorMessage: "Transaction failed to return proper results",
            },
          ]);
        }
      });
    } catch (error) {
      console.error(`Layer ${layerIdx} prediction error:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during prediction execution. Please try again.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
      setIsProcessing(false);

      // Add error result to show in UI
      setPredictResults(prev => [
        ...prev,
        {
          layerIdx,
          inputMagnitude,
          inputSign,
          outputMagnitude: [],
          outputSign: [],
          activationType: 0,
          status: "error",
          errorMessage,
        },
      ]);
    }
  };

  // Process transaction result
  const processTransactionResult = async (
    result: any,
    layerIdx: number,
    inputMagnitude: number[],
    inputSign: number[]
  ) => {
    try {
      const events = result.events || [];

      // 단일 레이어 계산 결과 찾기
      const layerResult = parseLayerComputedEvent(events);
      // 최종 예측 결과 찾기
      const predictionResult = parsePredictionCompletedEvent(events);

      if (layerResult) {
        // 현재 처리된 레이어의 인덱스 업데이트
        setCurrentLayerIndex(layerIdx + 1);

        // 결과 저장
        setPredictResults(prev => [
          ...prev,
          {
            layerIdx,
            inputMagnitude,
            inputSign,
            outputMagnitude: layerResult.outputMagnitude,
            outputSign: layerResult.outputSign,
            activationType: layerResult.activationType,
            argmaxIdx: predictionResult?.argmaxIdx,
            txDigest: result.digest,
            status: "success",
          },
        ]);

        // Update status based on whether events were found
        if (predictionResult) {
          // Last layer (prediction complete)
          const finalValue = formatVector(
            [predictionResult.outputMagnitude[predictionResult.argmaxIdx]],
            [predictionResult.outputSign[predictionResult.argmaxIdx]]
          );

          setInferenceStatus(`Success: Prediction complete! Final output value: ${finalValue}`);
          setInferenceStatusType("success");
          setIsProcessing(false);
        } else {
          // Prepare for next layer
          setInferenceStatus(
            `Success: Layer ${layerIdx + 1} prediction complete. Preparing for layer ${layerIdx + 2}...`
          );
          setInferenceStatusType("success");
          setIsProcessing(false);

          // Automatically run next layer (if not last layer)
          if (layerIdx + 1 < totalLayers) {
            // Run next layer after 0.5 seconds
            setTimeout(() => {
              runLayerPrediction(layerIdx + 1, layerResult.outputMagnitude, layerResult.outputSign);
            }, 500);
          }
        }
      } else {
        setInferenceStatus(
          `Warning: Layer ${layerIdx + 1} transaction completed but no output data was found. Please check the transaction details.`
        );
        setInferenceStatusType("warning");
        setIsProcessing(false);

        // Add warning result to show in UI
        setPredictResults(prev => [
          ...prev,
          {
            layerIdx,
            inputMagnitude,
            inputSign,
            outputMagnitude: [],
            outputSign: [],
            activationType: 0,
            txDigest: result.digest,
            status: "error",
            errorMessage: "No layer computation events found in transaction",
          },
        ]);
      }
    } catch (error) {
      console.error("Transaction result processing error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while processing the transaction result.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
      setIsProcessing(false);

      // Add error result to show in UI
      setPredictResults(prev => [
        ...prev,
        {
          layerIdx,
          inputMagnitude,
          inputSign,
          outputMagnitude: [],
          outputSign: [],
          activationType: 0,
          txDigest: result.digest,
          status: "error",
          errorMessage,
        },
      ]);
    }
  };

  /**
   * 모든 레이어를 PTB를 이용해 한 번에 실행하는 함수
   */
  const runAllLayersWithPTB = async () => {
    // Parse input vector
    const parsedInput = parseInputVector();
    if (!parsedInput) return;

    // Reset existing results
    setPredictResults([]);
    setCurrentLayerIndex(0);
    setTxDigest("");

    setIsProcessing(true);
    setInferenceStatus(`Processing: Running all ${totalLayers} layers with PTB...`);
    setInferenceStatusType("info");

    try {
      // PTB로 모든 레이어 예측 실행
      await predictModelWithPTB(
        modelId,
        totalLayers,
        parsedInput.magnitudes,
        parsedInput.signs,
        res => {
          console.log("--------------------------------");
          console.log(`Full model prediction result:`, res);
          console.log(`Events:`, res.events);
          console.log("--------------------------------");

          if (res && res.digest) {
            setTxDigest(res.digest);
            processPTBResult(res, parsedInput.magnitudes, parsedInput.signs);
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
      console.error(`PTB inference error:`, error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred during PTB inference execution. Please try again.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
      setIsProcessing(false);
    }
  };

  /**
   * PTB 트랜잭션 결과를 처리하는 함수
   */
  const processPTBResult = (result: any, inputMagnitude: number[], inputSign: number[]) => {
    try {
      const events = result.events || [];

      // 모든 LayerComputed 이벤트 파싱
      const layerEvents = events.filter((event: any) => {
        return (
          event.type &&
          event.type === `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::LayerComputed`
        );
      });

      // PredictionCompleted 이벤트 파싱
      const predictionCompletedEvent = parsePredictionCompletedEvent(events);

      if (layerEvents.length > 0) {
        // 각 레이어 계산 결과 처리
        const layerResults: PredictResult[] = [];
        let prevLayerMagnitude = inputMagnitude;
        let prevLayerSign = inputSign;

        layerEvents.forEach((event: any) => {
          try {
            const layerIdx = Number(event.parsedJson?.layer_idx || 0);
            const outputMagnitude = event.parsedJson?.output_magnitude?.map(Number) || [];
            const outputSign = event.parsedJson?.output_sign?.map(Number) || [];
            const activationType = Number(event.parsedJson?.activation_type || 0);

            // 결과 저장
            layerResults.push({
              layerIdx,
              inputMagnitude: prevLayerMagnitude,
              inputSign: prevLayerSign,
              outputMagnitude,
              outputSign,
              activationType,
              // 마지막 레이어인 경우 argmaxIdx 추가
              argmaxIdx:
                layerIdx === totalLayers - 1 ? predictionCompletedEvent?.argmaxIdx : undefined,
              txDigest: result.digest,
              status: "success",
            });

            // 다음 레이어를 위해 현재 레이어의 출력을 저장
            prevLayerMagnitude = outputMagnitude;
            prevLayerSign = outputSign;
          } catch (error) {
            console.error(`Error processing layer event:`, error);
          }
        });

        // 모든 결과 저장 및 현재 레이어 인덱스 업데이트
        setPredictResults(layerResults);
        setCurrentLayerIndex(totalLayers);

        // 최종 결과 메시지 설정
        if (predictionCompletedEvent && predictionCompletedEvent.argmaxIdx !== undefined) {
          const finalValue = formatVector(
            [predictionCompletedEvent.outputMagnitude[predictionCompletedEvent.argmaxIdx]],
            [predictionCompletedEvent.outputSign[predictionCompletedEvent.argmaxIdx]]
          );

          setInferenceStatus(
            `Success: PTB prediction complete! All ${totalLayers} layers processed in a single transaction. Final output value: ${finalValue}`
          );
          setInferenceStatusType("success");
        } else {
          setInferenceStatus(
            `Success: PTB prediction complete! All ${totalLayers} layers processed in a single transaction.`
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
      console.error("Error processing PTB transaction result:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while processing the PTB transaction result.";

      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType("error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Start layer inference
  const startInference = async () => {
    // Parse input vector
    const parsedInput = parseInputVector();
    if (!parsedInput) return;

    // Reset existing results
    setPredictResults([]);
    setCurrentLayerIndex(0);
    setTxDigest("");

    // Execute first layer prediction
    await runLayerPrediction(0, parsedInput.magnitudes, parsedInput.signs);
  };

  // Predict next layer (manual)
  const predictNextLayer = async () => {
    if (predictResults.length === 0) {
      setInferenceStatus(
        "Error: You must predict the first layer before proceeding to the next layer."
      );
      setInferenceStatusType("error");
      return;
    }

    // Get last prediction result
    const lastResult = predictResults[predictResults.length - 1];

    // Check if the last prediction was successful
    if (lastResult.status === "error") {
      setInferenceStatus(
        "Error: Cannot proceed to the next layer because the previous layer encountered an error."
      );
      setInferenceStatusType("error");
      return;
    }

    // Execute next layer prediction (using previous layer's output as input)
    await runLayerPrediction(currentLayerIndex, lastResult.outputMagnitude, lastResult.outputSign);
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
    setInferenceStatus(`Processing: Running all ${totalLayers} layers with optimized PTB...`);
    setInferenceStatusType("info");

    try {
      // 모델의 레이어별 출력 차원 정보
      const layerDimensions = getLayerDimensions();
      console.log("xxxxxx layerDimensions", layerDimensions);

      // 최적화된 PTB로 모든 레이어 예측 실행
      await predictModelWithPTBOptimization(
        modelId,
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
          const finalValue = formatVector(
            [predictionCompletedEvent.outputMagnitude[predictionCompletedEvent.argmaxIdx]],
            [predictionCompletedEvent.outputSign[predictionCompletedEvent.argmaxIdx]]
          );

          setInferenceStatus(
            `Success: Optimized PTB prediction complete! All ${totalLayers} layers processed with dimension-level optimization. Final output value: ${finalValue}`
          );
          setInferenceStatusType("success");
        } else {
          setInferenceStatus(
            `Success: Optimized PTB prediction complete! All ${totalLayers} layers processed with dimension-level optimization.`
          );
          setInferenceStatusType("success");
        }
      } else {
        setInferenceStatus(
          `Warning: Optimized PTB transaction completed but no layer computation events found. Please check the transaction details.`
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
    // Actions
    setInputVector,
    setInputValues,
    setInputSigns,
    parseInputVector,
    startInference,
    predictNextLayer,
    runLayerPrediction,
    runAllLayersWithPTB,
    runAllLayersWithPTBOptimization,
  };
}
