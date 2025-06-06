/**
 * 모델 관련 유틸리티 함수
 */

import { PredictResult } from "../hooks/useModelInference";
import { ConfidenceScore } from "../types/confidenceTypes";

// 활성화 함수 이름 가져오기
export function getActivationTypeName(type: number): string {
  const activationTypes: Record<number, string> = {
    0: "None",
    1: "ReLU",
    2: "Sigmoid",
    3: "Tanh",
    4: "Softmax",
    5: "LeakyReLU",
  };
  return activationTypes[type] || `Unknown (${type})`;
}

/**
 * 신뢰도 점수 계산 함수
 * @param result PredictResult 객체
 * @returns 신뢰도 점수와 인덱스 배열 (높은 점수순으로 정렬됨)
 */
export const calculateConfidenceScores = (result: PredictResult): ConfidenceScore[] => {
  if (!result || !result.outputMagnitude) return [];
  
  // 가장 큰 값을 찾아서 정규화에 사용
  const maxValue = Math.max(...result.outputMagnitude);
  
  // 각 출력값을 신뢰도 점수로 변환 (양수면 값 그대로, 음수면 0으로)
  return result.outputMagnitude.map((value, index) => {
    // sign이 0이면 양수, 1이면 음수
    const isNegative = result.outputSign[index] === 1;
    const normalizedValue = isNegative ? 0 : (value / maxValue);
    
    return {
      index,
      score: normalizedValue
    };
  }).sort((a, b) => b.score - a.score); // 높은 점수순으로 정렬
};

/**
 * 숫자 벡터를 포맷팅하는 함수
 * @param magnitudes 크기 벡터
 * @param signs 부호 벡터 (0=양수, 1=음수)
 * @returns 포맷된 문자열 (예: [1.23, -4.56, 7.89])
 */
export const formatVector = (magnitudes: number[], signs: number[]): string => {
  if (magnitudes.length !== signs.length) return "";

  return magnitudes
    .map((mag, i) => {
      // 0이 양수, 1이 음수
      const sign = signs[i] === 0 ? 1 : -1;
      return (sign * mag).toFixed(2);
    })
    .join(", ");
}
