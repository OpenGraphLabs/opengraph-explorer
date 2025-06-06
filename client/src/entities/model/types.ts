import { BaseEntity } from "../../shared/types/common";

// 기존 Model 타입 확장
export interface Model extends BaseEntity {
  name: string;
  description: string;
  taskType: string;
  layerDimensions: number[][];
  weightsMagnitudes: number[][];
  weightsSigns: number[][];
  biasesMagnitudes: number[][];
  biasesSigns: number[][];
  scale: number;
  trainingDatasetId?: string;
  testDatasetIds?: string[];
  owner?: string;
  metadata?: ModelMetadata;
  stats?: ModelStats;
}

export interface ModelMetadata {
  framework: string;
  version: string;
  inputShape: number[];
  outputShape: number[];
  accuracy?: number;
  loss?: number;
  epochs?: number;
  tags?: string[];
}

export interface ModelStats {
  totalParameters: number;
  modelSize: number;
  inferenceTime?: number;
  accuracy?: number;
  usageCount: number;
}

export interface ModelLayer {
  index: number;
  type: 'dense' | 'conv2d' | 'maxpool2d' | 'flatten';
  inputDimensions: number[];
  outputDimensions: number[];
  weightsMagnitudes: number[];
  weightsSigns: number[];
  biasesMagnitudes: number[];
  biasesSigns: number[];
  activationFunction?: string;
}

export interface InferenceRequest {
  modelId: string;
  inputMagnitudes: number[];
  inputSigns: number[];
}

export interface InferenceResult {
  outputMagnitudes: number[];
  outputSigns: number[];
  argmaxIndex: number;
  confidence?: number;
  processingTime: number;
}