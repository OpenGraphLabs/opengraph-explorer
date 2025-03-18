/**
 * Sui 블록체인 컨트랙트의 initialize_model 함수에 맞춘 Model 스키마
 * 
 * 예시:
 * {
 *   layerInDimensions: [4, 3],
 *   layerOutDimensions: [3, 2],
 *   weightsMagnitudes: [
 *     [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 12],
 *     [15, 15, 15, 15, 15, 6]
 *   ],
 *   weightsSigns: [
 *     [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
 *     [0, 1, 0, 1, 0, 1]
 *   ],
 *   biasesMagnitudes: [
 *     [5, 5, 5],
 *     [7, 7]
 *   ],
 *   biasesSigns: [
 *     [0, 0, 0],
 *     [0, 0]
 *   ],
 *   scale: 2
 * }
 */
export interface Model {
  layerInDimensions: number[];
  layerOutDimensions: number[];
  weightsMagnitudes: number[][];
  weightsSigns: number[][];
  biasesMagnitudes: number[][];
  biasesSigns: number[][];
  scale: number;
} 