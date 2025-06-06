import { Model, ModelStats, ModelLayer } from "./types";

/**
 * Model 상태 관련 유틸리티
 */
export const ModelStatus = {
  DRAFT: "draft",
  UPLOADING: "uploading", 
  PROCESSING: "processing",
  DEPLOYED: "deployed",
  FAILED: "failed",
} as const;

export type ModelStatusType = typeof ModelStatus[keyof typeof ModelStatus];

/**
 * Model 크기 계산
 */
export function calculateModelSize(model: Model): number {
  let totalSize = 0;
  
  model.weightsMagnitudes.forEach((weights, index) => {
    totalSize += weights.length;
    totalSize += model.weightsSigns[index].length;
    totalSize += model.biasesMagnitudes[index].length;
    totalSize += model.biasesSigns[index].length;
  });
  
  // 각 숫자를 4바이트로 가정
  return totalSize * 4;
}

/**
 * Model 총 파라미터 개수 계산
 */
export function calculateTotalParameters(model: Model): number {
  let totalParams = 0;
  
  model.layerDimensions.forEach(([inputDim, outputDim]) => {
    // weights: inputDim * outputDim
    // biases: outputDim
    totalParams += (inputDim * outputDim) + outputDim;
  });
  
  return totalParams;
}

/**
 * Model 통계 생성
 */
export function generateModelStats(model: Model): ModelStats {
  return {
    totalParameters: calculateTotalParameters(model),
    modelSize: calculateModelSize(model),
    usageCount: 0,
    accuracy: model.metadata?.accuracy,
  };
}

/**
 * Model 표시 이름 생성
 */
export function getModelDisplayName(model: Model): string {
  return `${model.name} (${model.taskType})`;
}

/**
 * Model 요약 정보 생성
 */
export function getModelSummary(model: Model): string {
  const layerCount = model.layerDimensions.length;
  const totalParams = calculateTotalParameters(model);
  const sizeInKB = Math.round(calculateModelSize(model) / 1024);
  
  return `${layerCount} layers, ${totalParams.toLocaleString()} params, ${sizeInKB}KB`;
}

/**
 * Model 업로드 진행률 계산
 */
export function calculateUploadProgress(
  convertedLayers: number,
  totalLayers: number,
  uploadCompleted: boolean
): number {
  if (uploadCompleted) return 100;
  
  const conversionProgress = (convertedLayers / totalLayers) * 80; // 80%까지는 변환
  return Math.min(conversionProgress, 80);
}

/**
 * Layer 정보 포맷팅
 */
export function formatLayerInfo(layer: ModelLayer): string {
  const inputShape = layer.inputDimensions.join(" × ");
  const outputShape = layer.outputDimensions.join(" × ");
  return `${layer.type}: (${inputShape}) → (${outputShape})`;
}

/**
 * Model 타입별 아이콘 가져오기
 */
export function getModelTypeIcon(taskType: string): string {
  const iconMap: Record<string, string> = {
    classification: "🔍",
    regression: "📈",
    detection: "👁️",
    segmentation: "🎨",
    generation: "✨",
    default: "🤖",
  };
  
  return iconMap[taskType.toLowerCase()] || iconMap.default;
}

/**
 * Model 정확도 포맷팅
 */
export function formatAccuracy(accuracy?: number): string {
  if (accuracy === undefined) return "N/A";
  return `${(accuracy * 100).toFixed(1)}%`;
}

/**
 * Model 배포 상태 확인
 */
export function isModelDeployed(model: Model): boolean {
  return !!model.id && model.id.length > 0;
}

/**
 * Model 추론 가능 여부 확인
 */
export function canRunInference(model: Model): boolean {
  return isModelDeployed(model) && model.layerDimensions.length > 0;
}