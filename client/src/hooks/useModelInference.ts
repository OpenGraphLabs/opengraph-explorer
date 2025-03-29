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
  const { predictLayer, parseLayerComputedEvent, parsePredictionCompletedEvent } = useSuiModelInference();

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
      console.log("Transaction result:", result);

      // Wait 1 second to allow transaction to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Parse LayerComputed event
      const layerResult = parseLayerComputedEvent(result.events);
      console.log("Layer result:", layerResult);
      
      // Parse PredictionCompleted event (if last layer)
      const predictionResult = parsePredictionCompletedEvent(result.events);
      console.log("Prediction result:", predictionResult);
      
      if (layerResult) {
        // Save the result
        const newResult: PredictResult = {
          layerIdx,
          inputMagnitude,
          inputSign,
          outputMagnitude: layerResult.outputMagnitude,
          outputSign: layerResult.outputSign,
          activationType: layerResult.activationType,
          argmaxIdx: predictionResult?.argmaxIdx,
          txDigest: result.digest,
          status: 'success'
        };
        
        setPredictResults(prev => [...prev, newResult]);
        
        // Set next layer index
        setCurrentLayerIndex(layerIdx + 1);
        
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
    runLayerPrediction
  };
} 