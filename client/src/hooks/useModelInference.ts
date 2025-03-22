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
}

export function useModelInferenceState(modelId: string, totalLayers: number) {
  // Inference related state
  const [inputVector, setInputVector] = useState<string>("");
  const [inputValues, setInputValues] = useState<number[]>([]);
  const [inputSigns, setInputSigns] = useState<number[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState<number>(0);
  const [predictResults, setPredictResults] = useState<PredictResult[]>([]);
  const [inferenceStatus, setInferenceStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [txDigest, setTxDigest] = useState<string>("");
  
  // Get SUI inference hook
  const { predictLayer, parseLayerComputedEvent, parsePredictionCompletedEvent } = useSuiModelInference();

  // Parse input vector
  const parseInputVector = () => {
    try {
      let values = inputVector.split(",").map(val => val.trim()).filter(val => val !== "");
      
      if (values.length === 0) {
        throw new Error("Input vector is empty.");
      }
      
      // Convert to numbers and separate into signs and magnitudes
      const magnitudes: number[] = [];
      const signs: number[] = [];
      
      values.forEach(val => {
        const num = parseFloat(val);
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${val}`);
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
      return { magnitudes, signs };
    } catch (error) {
      console.error("Input vector parsing error:", error);
      setInferenceStatus(`Error: ${error instanceof Error ? error.message : "Invalid input vector format."}`);
      return null;
    }
  };

  // Execute layer prediction
  const runLayerPrediction = async (layerIdx: number, inputMagnitude: number[], inputSign: number[]) => {
    if (!modelId) return;
    
    setIsProcessing(true);
    setInferenceStatus(`Predicting layer ${layerIdx}...`);
    
    try {
      // Call layer prediction transaction
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
      console.error(`Layer ${layerIdx} prediction error:`, error);
      setInferenceStatus(`Error: ${error instanceof Error ? error.message : "An error occurred during prediction execution."}`);
      setIsProcessing(false);
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
      console.log("xxxxxxxxxxxxxxxxx");
      console.log("Layer result:", layerResult);
      console.log("xxxxxxxxxxxxxxxxx");
      
      // Parse PredictionCompleted event (if last layer)
      const predictionResult = parsePredictionCompletedEvent(result.events);
      console.log("Prediction result:", predictionResult);
      
      if (layerResult) {
        // Save the result
        const newResult = {
          layerIdx,
          inputMagnitude,
          inputSign,
          outputMagnitude: layerResult.outputMagnitude,
          outputSign: layerResult.outputSign,
          activationType: layerResult.activationType,
          argmaxIdx: predictionResult?.argmaxIdx,
          txDigest: result.digest,
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
          
          setInferenceStatus(`Prediction complete! Final value: ${finalValue}`);
          setIsProcessing(false);
        } else {
          // Prepare for next layer
          setInferenceStatus(`Layer ${layerIdx} prediction complete. Preparing next layer...`);
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
        setInferenceStatus(`Layer ${layerIdx} prediction completed but no events found.`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Transaction result processing error:", error);
      setInferenceStatus(`Error: ${error instanceof Error ? error.message : "An error occurred while processing transaction result."}`);
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
      setInferenceStatus("You must predict the first layer first.");
      return;
    }
    
    // Get last prediction result
    const lastResult = predictResults[predictResults.length - 1];
    
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