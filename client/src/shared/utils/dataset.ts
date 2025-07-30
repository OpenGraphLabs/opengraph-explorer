// Types
export type ActiveTab = "all" | "confirmed" | "pending";

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
