import React from "react";
import { Annotation, SegmentationDisplayOptions } from "./types/annotation";

interface SegmentationMaskOverlayProps {
  annotations: Annotation[];
  imageWidth: number;
  imageHeight: number;
  displayOptions?: Partial<SegmentationDisplayOptions>;
  className?: string;
}

const DEFAULT_DISPLAY_OPTIONS: SegmentationDisplayOptions = {
  showMasks: true,
  maskOpacity: 0.5,
  maskColor: "#3B82F6", // Blue
  strokeColor: "#1D4ED8", // Darker blue
  strokeWidth: 2,
  showBoundingBoxes: false,
  showLabels: false,
};

// Color palette for different annotations
const COLOR_PALETTE = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
  "#6366F1", // Indigo
];

export function SegmentationMaskOverlay({
  annotations,
  imageWidth,
  imageHeight,
  displayOptions = {},
  className = "",
}: SegmentationMaskOverlayProps) {
  const options = { ...DEFAULT_DISPLAY_OPTIONS, ...displayOptions };

  if (!options.showMasks || annotations.length === 0) {
    return null;
  }

  const renderPolygon = (annotation: Annotation, index: number) => {
    const { polygon } = annotation;

    if (!polygon.has_segmentation || !polygon.polygons.length) {
      return null;
    }

    // Use different colors for different annotations
    const baseColor = COLOR_PALETTE[index % COLOR_PALETTE.length];
    const opacity = options.maskOpacity;

    return polygon.polygons.map((polygon, polygonIndex) => {
      if (polygon.length < 3) return null; // Need at least 3 points for a polygon

      // Convert points to SVG path
      const pathData =
        polygon
          .map((point, pointIndex) => {
            const [x, y] = point;
            const command = pointIndex === 0 ? "M" : "L";
            return `${command} ${x} ${y}`;
          })
          .join(" ") + " Z"; // Close the path

      return (
        <g key={`${annotation.id}-${polygonIndex}`}>
          {/* Fill */}
          <path d={pathData} fill={baseColor} fillOpacity={opacity} stroke="none" />

          {/* Stroke */}
          <path
            d={pathData}
            fill="none"
            stroke={options.strokeColor}
            strokeWidth={options.strokeWidth}
            strokeOpacity={0.8}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </g>
      );
    });
  };

  const renderBoundingBox = (annotation: Annotation, index: number) => {
    if (!options.showBoundingBoxes) return null;

    const [x, y, width, height] = annotation.bbox;
    const baseColor = COLOR_PALETTE[index % COLOR_PALETTE.length];

    return (
      <rect
        key={`bbox-${annotation.id}`}
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke={baseColor}
        strokeWidth={options.strokeWidth}
        strokeDasharray="4 4"
        strokeOpacity={0.8}
      />
    );
  };

  const renderLabel = (annotation: Annotation, index: number) => {
    if (!options.showLabels) return null;

    const [x, y] = annotation.bbox;
    const baseColor = COLOR_PALETTE[index % COLOR_PALETTE.length];

    return (
      <g key={`label-${annotation.id}`}>
        {/* Background */}
        <rect x={x} y={y - 20} width={40} height={18} fill={baseColor} fillOpacity={0.9} rx={2} />

        {/* Text */}
        <text
          x={x + 4}
          y={y - 8}
          fontSize="12"
          fill="white"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="500"
        >
          #{index + 1}
        </text>
      </g>
    );
  };

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1,
        objectFit: "cover",
      }}
      viewBox={`0 0 ${imageWidth} ${imageHeight}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {annotations.map((annotation, index) => (
        <g key={annotation.id}>
          {renderPolygon(annotation, index)}
          {renderBoundingBox(annotation, index)}
          {renderLabel(annotation, index)}
        </g>
      ))}
    </svg>
  );
}
