export interface Model {
  layerDimensions: number[][];
  weightsMagnitudes: number[][];
  weightsSigns: number[][];
  biasesMagnitudes: number[][];
  biasesSigns: number[][];
  scale: number;
}
