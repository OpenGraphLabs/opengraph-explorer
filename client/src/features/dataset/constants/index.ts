import React from "react";
import { Database, ImageSquare, FileDoc, FileZip, FileText } from "phosphor-react";

// 데이터 타입에 따른 아이콘 매핑
export const DATA_TYPE_ICONS: Record<string, React.ReactElement> = {
  "image/png": React.createElement(ImageSquare, { size: 20, weight: "bold" }),
  "image/jpeg": React.createElement(ImageSquare, { size: 20, weight: "bold" }),
  "text/plain": React.createElement(FileText, { size: 20, weight: "bold" }),
  "text/csv": React.createElement(FileDoc, { size: 20, weight: "bold" }),
  "application/zip": React.createElement(FileZip, { size: 20, weight: "bold" }),
  default: React.createElement(Database, { size: 20, weight: "bold" }),
};

// 데이터 타입에 따른 색상 매핑
export const DATA_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "image/png": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  "image/jpeg": { bg: "#E8F5E9", text: "#2E7D32", border: "#A5D6A7" },
  "text/plain": { bg: "#E3F2FD", text: "#1565C0", border: "#90CAF9" },
  "text/csv": { bg: "#E0F7FA", text: "#00838F", border: "#80DEEA" },
  "application/zip": { bg: "#FFF3E0", text: "#E65100", border: "#FFCC80" },
  default: { bg: "#F3E8FD", text: "#7E22CE", border: "#D0BCFF" },
};

// 데이터 유형별 표시 이름
export const DATA_TYPE_NAMES: Record<string, string> = {
  "image": "Images",
  "text": "Text",
  "application": "Applications",
  "default": "Data"
};

// Annotation 색상 팔레트
export const ANNOTATION_COLORS = [
  { bg: "#E3F2FD", text: "#1565C0", border: "#BBDEFB" },
  { bg: "#E8F5E9", text: "#2E7D32", border: "#C8E6C9" },
  { bg: "#FFF3E0", text: "#E65100", border: "#FFCC02" },
  { bg: "#F3E5F5", text: "#7B1FA2", border: "#CE93D8" },
  { bg: "#E0F2F1", text: "#00695C", border: "#80CBC4" },
  { bg: "#FFF8E1", text: "#F57F17", border: "#FFF176" },
  { bg: "#FCE4EC", text: "#C2185B", border: "#F8BBD9" },
  { bg: "#E1F5FE", text: "#0277BD", border: "#81D4FA" },
];

// 페이지네이션 기본값
export const DEFAULT_PAGE_SIZE = 25;

// 데이터 타입 필터 옵션
export const TYPE_FILTERS = [
  { value: "all", label: "All Types", icon: "🔍 " },
  { value: "image", label: "Images", icon: "🖼️ " },
  { value: "text", label: "Text", icon: "📝 " },
  { value: "application", label: "Applications", icon: "📦 " },
];

// 정렬 옵션
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
];

// Re-export upload constants
export {
  DEFAULT_DATASET_METADATA,
  DEFAULT_UPLOAD_PROGRESS,
  UPLOAD_CONFIG,
  UPLOAD_MESSAGES,
} from './upload'; 