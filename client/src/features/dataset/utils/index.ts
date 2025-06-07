import { DATA_TYPE_ICONS, DATA_TYPE_COLORS, ANNOTATION_COLORS } from "../constants";
import { DataObject } from "../types";

/**
 * 데이터 크기를 포맷팅하는 함수
 */
export const formatDataSize = (size: string | number): string => {
  const numSize = typeof size === "string" ? parseInt(size) : Number(size);
  if (numSize < 1024) return `${numSize} B`;
  if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`;
  return `${(numSize / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * 데이터 타입에 따른 아이콘을 가져오는 함수
 */
export const getDataTypeIcon = (dataType: string) => {
  const key = Object.keys(DATA_TYPE_ICONS).find(type => dataType.includes(type)) || "default";
  return DATA_TYPE_ICONS[key];
};

/**
 * 데이터 타입에 따른 색상을 가져오는 함수
 */
export const getDataTypeColor = (dataType: string) => {
  const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
  return DATA_TYPE_COLORS[key];
};

/**
 * Annotation 색상을 가져오는 함수
 */
export const getAnnotationColor = (index: number) => {
  return ANNOTATION_COLORS[index % ANNOTATION_COLORS.length];
};

/**
 * 이미지 타입인지 확인하는 함수
 */
export const isImageType = (dataType: string): boolean => {
  return dataType.startsWith("image/");
};

/**
 * 이미지가 확정된 annotation을 가지고 있는지 확인하는 함수
 */
export const hasConfirmedAnnotations = (item: DataObject): boolean => {
  return item.annotations.length > 0;
};

/**
 * 주소를 줄여서 표시하는 함수
 */
export const truncateAddress = (address: string, length: number = 6): string => {
  if (!address) return "Unknown";
  return `${address.substring(0, length)}...`;
};

/**
 * 모든 고유 태그를 추출하는 함수
 */
export const extractUniqueTags = (datasets: any[]): string[] => {
  const allTags = new Set<string>();
  datasets.forEach(dataset => {
    if (dataset.tags && dataset.tags.length > 0) {
      dataset.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  return Array.from(allTags).sort();
};

/**
 * Blob 캐시 키를 생성하는 함수
 */
export const generateBlobCacheKey = (blobId: string, index: number): string => {
  return `${blobId}_${index}`;
};
