import { Database, ImageSquare, FileDoc, FileZip, FileText } from "phosphor-react";
import { ReactElement } from "react";

// 데이터 타입에 따른 아이콘 생성 함수
export const getDataTypeIcon = (dataType: string): ReactElement => {
  const iconMap: Record<string, () => ReactElement> = {
    "image/png": () => <ImageSquare size={20} />,
    "image/jpeg": () => <ImageSquare size={20} />,
    "text/plain": () => <FileText size={20} />,
    "text/csv": () => <FileDoc size={20} />,
    "application/zip": () => <FileZip size={20} />,
    default: () => <Database size={20} />,
  };

  const key = Object.keys(iconMap).find(type => dataType.includes(type)) || "default";
  return iconMap[key]();
};

// 데이터 타입에 따른 색상 매핑
export const DATA_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100" },
  default: { bg: "#F3E8FD", text: "#7E22CE" },
};

export const getDataTypeColor = (dataType: string) => {
  const key = Object.keys(DATA_TYPE_COLORS).find(type => dataType.includes(type)) || "default";
  return DATA_TYPE_COLORS[key];
};

export const MODEL_TYPE_OPTIONS = [
  { value: "text-generation", label: "Text Generation" },
  { value: "text-classification", label: "Text Classification" },
  { value: "image-classification", label: "Image Classification" },
  { value: "token-classification", label: "Token Classification" },
  { value: "question-answering", label: "Question Answering" },
  { value: "object-detection", label: "Object Detection" },
  { value: "text-to-image", label: "Text-to-Image" },
  { value: "translation", label: "Translation" },
] as const;

// 데이터 크기 포맷 유틸리티
export const formatDataSize = (size: string | number): string => {
  const numSize = typeof size === "string" ? parseInt(size) : Number(size);
  if (numSize < 1024) return `${numSize} B`;
  if (numSize < 1024 * 1024) return `${(numSize / 1024).toFixed(1)} KB`;
  return `${(numSize / (1024 * 1024)).toFixed(1)} MB`;
};
