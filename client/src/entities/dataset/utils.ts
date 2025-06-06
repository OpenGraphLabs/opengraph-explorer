import { Dataset, DatasetStats, DatasetSample } from "./types";

/**
 * Dataset 상태 관련 유틸리티
 */
export const DatasetStatus = {
  DRAFT: "draft",
  UPLOADING: "uploading",
  PROCESSING: "processing", 
  READY: "ready",
  FAILED: "failed",
} as const;

export type DatasetStatusType = typeof DatasetStatus[keyof typeof DatasetStatus];

/**
 * Dataset 크기 포맷팅
 */
export function formatDatasetSize(sizeInBytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = sizeInBytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Dataset 샘플 개수 포맷팅
 */
export function formatSampleCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Dataset 타입별 아이콘 가져오기
 */
export function getDatasetTypeIcon(datasetType: string): string {
  const iconMap: Record<string, string> = {
    training: "🎯",
    test: "🧪", 
    validation: "✅",
    default: "📊",
  };
  
  return iconMap[datasetType.toLowerCase()] || iconMap.default;
}

/**
 * Dataset 표시 이름 생성
 */
export function getDatasetDisplayName(dataset: Dataset): string {
  return `${dataset.name} (${dataset.datasetType})`;
}

/**
 * Dataset 요약 정보 생성
 */
export function getDatasetSummary(dataset: Dataset): string {
  const sampleCount = formatSampleCount(dataset.totalSamples);
  const size = dataset.metadata?.size ? formatDatasetSize(dataset.metadata.size) : "Unknown size";
  const labelCount = dataset.labels?.length || 0;
  
  return `${sampleCount} samples, ${labelCount} labels, ${size}`;
}

/**
 * Dataset 통계 계산
 */
export function calculateDatasetStats(
  samples: DatasetSample[],
  totalSize: number
): DatasetStats {
  const labelDistribution: Record<string, number> = {};
  
  samples.forEach(sample => {
    if (sample.label) {
      labelDistribution[sample.label] = (labelDistribution[sample.label] || 0) + 1;
    }
  });
  
  return {
    totalSamples: samples.length,
    labelDistribution,
    avgFileSize: samples.length > 0 ? totalSize / samples.length : 0,
    totalSize,
  };
}

/**
 * Label 분포 분석
 */
export function analyzeLabelDistribution(stats: DatasetStats): {
  mostCommon: string;
  leastCommon: string;
  isBalanced: boolean;
} {
  const entries = Object.entries(stats.labelDistribution);
  if (entries.length === 0) {
    return {
      mostCommon: "N/A",
      leastCommon: "N/A", 
      isBalanced: true,
    };
  }
  
  const sorted = entries.sort(([,a], [,b]) => b - a);
  const mostCommon = sorted[0][0];
  const leastCommon = sorted[sorted.length - 1][0];
  
  // 가장 많은 것과 가장 적은 것의 비율이 2:1 이하면 균형잡힌 것으로 간주
  const maxCount = sorted[0][1];
  const minCount = sorted[sorted.length - 1][1];
  const isBalanced = maxCount / minCount <= 2;
  
  return {
    mostCommon,
    leastCommon,
    isBalanced,
  };
}

/**
 * Dataset 업로드 진행률 계산
 */
export function calculateDatasetUploadProgress(
  uploadedFiles: number,
  totalFiles: number,
  processingCompleted: boolean
): number {
  if (processingCompleted) return 100;
  
  const uploadProgress = (uploadedFiles / totalFiles) * 90; // 90%까지는 업로드
  return Math.min(uploadProgress, 90);
}

/**
 * 이미지 해상도 포맷팅
 */
export function formatResolution(resolution?: { width: number; height: number }): string {
  if (!resolution) return "Unknown";
  return `${resolution.width} × ${resolution.height}`;
}

/**
 * Dataset 호환성 검사
 */
export function checkDatasetCompatibility(
  dataset: Dataset,
  requiredFormat?: string,
  requiredDimensions?: number[]
): {
  isCompatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  if (requiredFormat && dataset.metadata?.format !== requiredFormat) {
    issues.push(`Format mismatch: expected ${requiredFormat}, got ${dataset.metadata?.format}`);
  }
  
  if (requiredDimensions && dataset.metadata?.dimensions) {
    const dimensionsMatch = requiredDimensions.every((dim, index) => 
      dim === dataset.metadata?.dimensions?.[index]
    );
    if (!dimensionsMatch) {
      issues.push(`Dimension mismatch: expected ${requiredDimensions.join('×')}, got ${dataset.metadata.dimensions.join('×')}`);
    }
  }
  
  if (dataset.totalSamples === 0) {
    issues.push("Dataset has no samples");
  }
  
  return {
    isCompatible: issues.length === 0,
    issues,
  };
}

/**
 * Dataset 준비 상태 확인
 */
export function isDatasetReady(dataset: Dataset): boolean {
  return !!dataset.id && 
         dataset.totalSamples > 0 && 
         !!dataset.walrusId;
}

/**
 * Dataset 검색 필터링
 */
export function filterDatasets(
  datasets: Dataset[],
  searchTerm: string,
  typeFilter?: string
): Dataset[] {
  let filtered = datasets;
  
  // 텍스트 검색
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(dataset => 
      dataset.name.toLowerCase().includes(term) ||
      dataset.description.toLowerCase().includes(term) ||
      dataset.labels?.some(label => label.toLowerCase().includes(term))
    );
  }
  
  // 타입 필터
  if (typeFilter && typeFilter !== 'all') {
    filtered = filtered.filter(dataset => dataset.datasetType === typeFilter);
  }
  
  return filtered;
} 