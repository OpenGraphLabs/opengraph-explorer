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
  PACKAGE_ID: "0xb2297c10ac54cee83eef6d3bb0f9f44a013d545cd8eb6f71de2362dc98855b34",
  MODULE_NAME: "model",
};

export const SUI_MAX_PARAMS_PER_TX = 3000;

export const SUI_PREDICT_COMPUTATION_BATCH_SIZE = 100;

// 가스 비용
export const GAS_BUDGET = 1_000_000_000; // 1000000000 = 1 SUI

// SUI 주소 표시 길이 제한 (UI에서 주소를 표시할 때 사용)
export const SUI_ADDRESS_DISPLAY_LENGTH = 16;
