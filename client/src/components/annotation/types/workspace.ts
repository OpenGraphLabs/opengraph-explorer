export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence?: number;
  selected?: boolean;
}
