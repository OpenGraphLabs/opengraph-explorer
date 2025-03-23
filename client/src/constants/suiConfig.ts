/**
 * Sui 블록체인 관련 상수 정의
 */

// 네트워크 설정
export const SUI_NETWORK = {
  TYPE: "testnet", // 'testnet', 'mainnet', 'devnet'
  URL: "https://fullnode.testnet.sui.io",
  GRAPHQL_URL: "https://sui-testnet.mystenlabs.com/graphql",
};

// 컨트랙트 정보
export const SUI_CONTRACT = {
  PACKAGE_ID: "0x24d90f4967e65e7ba6dfeb2356555f1668d4cfd093485a0cf74849d90fc2434a",
  MODULE_NAME: "model",
};

// 가스 비용
export const GAS_BUDGET = 100000000;

// SUI 주소 표시 길이 제한 (UI에서 주소를 표시할 때 사용)
export const SUI_ADDRESS_DISPLAY_LENGTH = 16;

// 태스크 유형 매핑
export const TASK_TYPES = {
  TEXT_GENERATION: "text-generation",
  TEXT_CLASSIFICATION: "text-classification",
  IMAGE_CLASSIFICATION: "image-classification",
  OBJECT_DETECTION: "object-detection",
  TEXT_TO_IMAGE: "text-to-image",
  TRANSLATION: "translation",
} as const;

// 태스크 색상 매핑
export const TASK_COLORS: Record<string, { bg: string; text: string }> = {
  [TASK_TYPES.TEXT_GENERATION]: { bg: "#E0F2FE", text: "#0369A1" },
  [TASK_TYPES.TEXT_CLASSIFICATION]: { bg: "#E0F7FA", text: "#00838F" },
  [TASK_TYPES.IMAGE_CLASSIFICATION]: { bg: "#E8F5E9", text: "#2E7D32" },
  [TASK_TYPES.OBJECT_DETECTION]: { bg: "#FFF3E0", text: "#E65100" },
  [TASK_TYPES.TEXT_TO_IMAGE]: { bg: "#F3E8FD", text: "#7E22CE" },
  [TASK_TYPES.TRANSLATION]: { bg: "#E8EAF6", text: "#3949AB" },
};

// 태스크 이름 매핑
export const TASK_NAMES: Record<string, string> = {
  [TASK_TYPES.TEXT_GENERATION]: "Text Generation",
  [TASK_TYPES.TEXT_CLASSIFICATION]: "Text Classification",
  [TASK_TYPES.IMAGE_CLASSIFICATION]: "Image Classification",
  [TASK_TYPES.OBJECT_DETECTION]: "Object Detection",
  [TASK_TYPES.TEXT_TO_IMAGE]: "Text-to-Image",
  [TASK_TYPES.TRANSLATION]: "Translation",
};
