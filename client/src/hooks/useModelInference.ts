import { useState } from "react";
import { useModelInference as useSuiModelInference } from "../services/modelSuiService";
import { formatVector } from "../utils/modelUtils";
import { SUI_CONTRACT } from "../constants/suiConfig";

export interface PredictResult {
  layerIdx: number;
  inputMagnitude: number[];
  inputSign: number[];
  outputMagnitude: number[];
  outputSign: number[];
  activationType: number;
  argmaxIdx?: number;
  txDigest?: string;
  status: 'success' | 'error' | 'processing';
  errorMessage?: string;
}

export function useModelInferenceState(modelId: string, totalLayers: number) {
  // Inference related state
  const [inputVector, setInputVector] = useState<string>("");
  const [inputValues, setInputValues] = useState<number[]>([]);
  const [inputSigns, setInputSigns] = useState<number[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [predictResults, setPredictResults] = useState<PredictResult[]>([]);
  const [inferenceStatus, setInferenceStatus] = useState<string>("");
  const [inferenceStatusType, setInferenceStatusType] = useState<'info' | 'success' | 'error' | 'warning'>('info');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txDigest, setTxDigest] = useState<string>("");
  
  // Get SUI inference hook
  const { 
    predictLayer, 
    predictModelWithPTB,
    parseLayerComputedEvent, 
    parsePredictionCompletedEvent 
  } = useSuiModelInference();

  // Parse input vector
  const parseInputVector = () => {
    try {
      let values = inputVector.split(",").map(val => val.trim()).filter(val => val !== "");
      
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
      setInferenceStatusType('info');
      return { magnitudes, signs };
    } catch (error) {
      console.error("Input vector parsing error:", error);
      setInferenceStatus(`Error: ${error instanceof Error ? error.message : "Invalid input vector format."}`);
      setInferenceStatusType('error');
      return null;
    }
  };

  // Execute layer prediction
  const runLayerPrediction = async (layerIdx: number, inputMagnitude: number[], inputSign: number[]) => {
    if (!modelId) {
      setInferenceStatus("Error: Model ID is missing. Please refresh the page and try again.");
      setInferenceStatusType('error');
      return;
    }
    
    setIsProcessing(true);
    setInferenceStatus(`Processing: Predicting layer ${layerIdx + 1} of ${totalLayers}...`);
    setInferenceStatusType('info');
    
    try {
      // Call layer prediction transaction
      await predictLayer(modelId, layerIdx, inputMagnitude, inputSign, (res) => {
        console.log("--------------------------------");
        console.log(`Layer ${layerIdx} prediction result:`, res);
        console.log(`Layer ${layerIdx} prediction events:`, res.events);
        console.log("--------------------------------");
        
        if (res && res.digest) {
          setTxDigest(res.digest);
          processTransactionResult(res, layerIdx, inputMagnitude, inputSign);
        } else {
          setInferenceStatus(`Error: No transaction digest received for layer ${layerIdx + 1}. The transaction might have failed.`);
          setInferenceStatusType('error');
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
              status: 'error',
              errorMessage: 'Transaction failed to return proper results'
            }
          ]);
        }
      });
    } catch (error) {
      console.error(`Layer ${layerIdx} prediction error:`, error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred during prediction execution. Please try again.";
      
      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType('error');
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
          status: 'error',
          errorMessage
        }
      ]);
    }
  };
  
  // Process transaction result
  const processTransactionResult = async (result: any, layerIdx: number, inputMagnitude: number[], inputSign: number[]) => {
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
            status: 'success'
          }
        ]);
        
        // Update status based on whether events were found
        if (predictionResult) {
          // Last layer (prediction complete)
          const finalValue = formatVector(
            [predictionResult.outputMagnitude[predictionResult.argmaxIdx]], 
            [predictionResult.outputSign[predictionResult.argmaxIdx]]
          );
          
          setInferenceStatus(`Success: Prediction complete! Final output value: ${finalValue}`);
          setInferenceStatusType('success');
          setIsProcessing(false);
        } else {
          // Prepare for next layer
          setInferenceStatus(`Success: Layer ${layerIdx + 1} prediction complete. Preparing for layer ${layerIdx + 2}...`);
          setInferenceStatusType('success');
          setIsProcessing(false);
          
          // Automatically run next layer (if not last layer)
          if (layerIdx + 1 < totalLayers) {
            // Run next layer after 0.5 seconds
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
        setInferenceStatus(`Warning: Layer ${layerIdx + 1} transaction completed but no output data was found. Please check the transaction details.`);
        setInferenceStatusType('warning');
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
            status: 'error',
            errorMessage: 'No layer computation events found in transaction'
          }
        ]);
      }
    } catch (error) {
      console.error("Transaction result processing error:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred while processing the transaction result.";
      
      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType('error');
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
          status: 'error',
          errorMessage
        }
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
    setInferenceStatusType('info');
    
    try {
      // PTB로 모든 레이어 예측 실행
      await predictModelWithPTB(
        modelId, 
        totalLayers, 
        parsedInput.magnitudes, 
        parsedInput.signs,
        (res) => {
          console.log("--------------------------------");
          console.log(`Full model prediction result:`, res);
          console.log(`Events:`, res.events);
          console.log("--------------------------------");
          
          if (res && res.digest) {
            setTxDigest(res.digest);
            processPTBResult(res, parsedInput.magnitudes, parsedInput.signs);
          } else {
            setInferenceStatus(`Error: No transaction digest received. The transaction might have failed.`);
            setInferenceStatusType('error');
            setIsProcessing(false);
          }
        }
      );
    } catch (error) {
      console.error(`PTB inference error:`, error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred during PTB inference execution. Please try again.";
      
      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType('error');
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
        return event.type && event.type === `${SUI_CONTRACT.PACKAGE_ID}::${SUI_CONTRACT.MODULE_NAME}::LayerComputed`;
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
              argmaxIdx: (layerIdx === totalLayers - 1) ? predictionCompletedEvent?.argmaxIdx : undefined,
              txDigest: result.digest,
              status: 'success'
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
          
          setInferenceStatus(`Success: PTB prediction complete! All ${totalLayers} layers processed in a single transaction. Final output value: ${finalValue}`);
          setInferenceStatusType('success');
        } else {
          setInferenceStatus(`Success: PTB prediction complete! All ${totalLayers} layers processed in a single transaction.`);
          setInferenceStatusType('success');
        }
      } else {
        setInferenceStatus(`Warning: PTB transaction completed but no layer computation events found. Please check the transaction details.`);
        setInferenceStatusType('warning');
      }
    } catch (error) {
      console.error("Error processing PTB transaction result:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An error occurred while processing the PTB transaction result.";
      
      setInferenceStatus(`Error: ${errorMessage}`);
      setInferenceStatusType('error');
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
      setInferenceStatus("Error: You must predict the first layer before proceeding to the next layer.");
      setInferenceStatusType('error');
      return;
    }
    
    // Get last prediction result
    const lastResult = predictResults[predictResults.length - 1];
    
    // Check if the last prediction was successful
    if (lastResult.status === 'error') {
      setInferenceStatus("Error: Cannot proceed to the next layer because the previous layer encountered an error.");
      setInferenceStatusType('error');
      return;
    }
    
    // Execute next layer prediction (using previous layer's output as input)
    await runLayerPrediction(
      currentLayerIndex,
      lastResult.outputMagnitude,
      lastResult.outputSign
    );
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
    parseInputVector,
    startInference,
    predictNextLayer,
    runLayerPrediction,
    runAllLayersWithPTB
  };
} 