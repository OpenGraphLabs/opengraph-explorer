/**
 * Sui 블록체인 컨트랙트의 initialize_model 함수에 맞춘 Model 스키마
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