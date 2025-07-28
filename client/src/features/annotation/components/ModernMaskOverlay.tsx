import React, { useRef, useCallback, useEffect, useState, MouseEvent } from "react";
import { useTheme } from "@/shared/ui/design-system";
import { Annotation } from "../types/annotation";
import { Point } from "../types/workspace";

interface MaskState {
  id: number;
  selected: boolean;
  hovered: boolean;
  confidence: number;
}

interface ModernMaskOverlayProps {
  annotations: Annotation[];
  selectedMaskIds: number[];
  hoveredMaskId?: number | null;
  zoom: number;
  panOffset: Point;
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  opacity?: number;
  showConfidence?: boolean;
  onMaskHover?: (maskId: number | null) => void;
  onMaskClick?: (maskId: number, event: MouseEvent) => void;
}

// Modern color palette inspired by Meta SAM demo
const SAM_COLOR_PALETTE = [
  { main: "#007AFF", light: "#007AFF20", dark: "#005CBF" }, // iOS Blue
  { main: "#FF3B30", light: "#FF3B3020", dark: "#D70015" }, // iOS Red
  { main: "#34C759", light: "#34C75920", dark: "#248A3D" }, // iOS Green
  { main: "#FF9500", light: "#FF950020", dark: "#C7730A" }, // iOS Orange
  { main: "#AF52DE", light: "#AF52DE20", dark: "#8E44AD" }, // iOS Purple
  { main: "#FF2D92", light: "#FF2D9220", dark: "#E91E63" }, // iOS Pink
  { main: "#5AC8FA", light: "#5AC8FA20", dark: "#2196F3" }, // iOS Teal
  { main: "#FFCC00", light: "#FFCC0020", dark: "#FFA000" }, // iOS Yellow
  { main: "#FF6B6B", light: "#FF6B6B20", dark: "#E74C3C" }, // Coral
  { main: "#4ECDC4", light: "#4ECDC420", dark: "#26A69A" }, // Turquoise
];

export function ModernMaskOverlay({
  annotations,
  selectedMaskIds,
  hoveredMaskId,
  zoom,
  panOffset,
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  opacity = 0.45,
  showConfidence = true,
  onMaskHover,
  onMaskClick,
}: ModernMaskOverlayProps) {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [maskStates, setMaskStates] = useState<Record<number, MaskState>>({});

  // Initialize mask states
  useEffect(() => {
    const initialStates: Record<number, MaskState> = {};
    annotations.forEach(annotation => {
      initialStates[annotation.id] = {
        id: annotation.id,
        selected: selectedMaskIds.includes(annotation.id),
        hovered: hoveredMaskId === annotation.id,
        confidence: annotation.stability_score || 0.8,
      };
    });
    setMaskStates(initialStates);
  }, [annotations, selectedMaskIds, hoveredMaskId]);

  // Convert image coordinates to screen coordinates
  const imageToScreen = useCallback((x: number, y: number): Point => {
    return {
      x: x * zoom + panOffset.x,
      y: y * zoom + panOffset.y,
    };
  }, [zoom, panOffset]);

  // Convert polygon points to SVG path string
  const polygonToPath = useCallback((polygon: number[][]): string => {
    if (polygon.length < 3) return "";
    
    const screenPoints = polygon.map(([x, y]) => imageToScreen(x, y));
    
    let path = `M ${screenPoints[0].x} ${screenPoints[0].y}`;
    for (let i = 1; i < screenPoints.length; i++) {
      path += ` L ${screenPoints[i].x} ${screenPoints[i].y}`;
    }
    path += " Z";
    
    return path;
  }, [imageToScreen]);

  // Get color scheme for annotation
  const getColorScheme = useCallback((index: number, confidence: number) => {
    const baseColor = SAM_COLOR_PALETTE[index % SAM_COLOR_PALETTE.length];
    
    // Adjust opacity based on confidence if enabled
    const confidenceMultiplier = showConfidence ? confidence : 1;
    
    return {
      ...baseColor,
      light: `${baseColor.main}${Math.round(opacity * confidenceMultiplier * 255).toString(16).padStart(2, '0')}`,
    };
  }, [opacity, showConfidence]);

  // Get mask visual state
  const getMaskStyle = useCallback((annotation: Annotation, index: number) => {
    const maskState = maskStates[annotation.id];
    if (!maskState) return null;

    const colorScheme = getColorScheme(index, maskState.confidence);
    const isSelected = maskState.selected;
    const isHovered = maskState.hovered;

    // Dynamic opacity based on state
    let currentOpacity = opacity;
    if (isSelected) {
      currentOpacity = Math.min(opacity * 1.6, 0.85); // Selected masks are more prominent
    } else if (isHovered) {
      currentOpacity = opacity * 1.2; // Hovered masks are slightly more visible
    } else if (selectedMaskIds.length > 0 && !isSelected) {
      currentOpacity = opacity * 0.4; // Non-selected masks fade when others are selected
    }

    // Stroke configuration
    let strokeWidth = 1.5 / zoom;
    let strokeColor = colorScheme.main;
    
    if (isSelected) {
      strokeWidth = 2.5 / zoom;
      strokeColor = "#FFFFFF";
    } else if (isHovered) {
      strokeWidth = 2 / zoom;
      strokeColor = colorScheme.dark;
    }

    return {
      fill: `${colorScheme.main}${Math.round(currentOpacity * 255).toString(16).padStart(2, '0')}`,
      stroke: strokeColor,
      strokeWidth: Math.max(strokeWidth, 0.5),
      filter: isSelected ? "url(#selectedGlow)" : isHovered ? "url(#hoverGlow)" : undefined,
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  }, [maskStates, selectedMaskIds, opacity, zoom, getColorScheme]);

  // Handle mouse events
  const handleMouseEnter = useCallback((maskId: number) => {
    onMaskHover?.(maskId);
  }, [onMaskHover]);

  const handleMouseLeave = useCallback(() => {
    onMaskHover?.(null);
  }, [onMaskHover]);

  const handleClick = useCallback((maskId: number, event: MouseEvent) => {
    event.stopPropagation();
    onMaskClick?.(maskId, event);
  }, [onMaskClick]);

  return (
    <svg
      ref={svgRef}
      width={canvasWidth}
      height={canvasHeight}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
    >
      {/* Filter definitions for glow effects */}
      <defs>
        {/* Selected mask glow */}
        <filter id="selectedGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Hover glow */}
        <filter id="hoverGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Gradient definitions for enhanced visual appeal */}
        {SAM_COLOR_PALETTE.map((color, index) => (
          <radialGradient key={`gradient-${index}`} id={`maskGradient-${index}`}>
            <stop offset="0%" stopColor={color.main} stopOpacity="0.6"/>
            <stop offset="100%" stopColor={color.main} stopOpacity="0.3"/>
          </radialGradient>
        ))}
      </defs>

      {/* Render masks */}
      {annotations.map((annotation, index) => {
        if (!annotation.polygon.has_segmentation) return null;

        const style = getMaskStyle(annotation, index);
        if (!style) return null;

        return (
          <g key={annotation.id}>
            {annotation.polygon.polygons.map((polygon, polygonIndex) => {
              const pathData = polygonToPath(polygon);
              if (!pathData) return null;

              return (
                <path
                  key={`${annotation.id}-${polygonIndex}`}
                  d={pathData}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  filter={style.filter}
                  style={{
                    pointerEvents: "visiblePainted",
                    cursor: "pointer",
                    transition: style.transition,
                  }}
                  onMouseEnter={() => handleMouseEnter(annotation.id)}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => handleClick(annotation.id, e)}
                />
              );
            })}

            {/* Confidence indicator for selected masks */}
            {showConfidence && maskStates[annotation.id]?.selected && (
              <g>
                {(() => {
                  const confidence = maskStates[annotation.id]?.confidence || 0;
                  const [centerX, centerY] = annotation.bbox.slice(0, 2);
                  const [width, height] = annotation.bbox.slice(2, 4);
                  const screenCenter = imageToScreen(centerX + width/2, centerY + height/2);
                  
                  return (
                    <g transform={`translate(${screenCenter.x}, ${screenCenter.y})`}>
                      {/* Confidence circle background */}
                      <circle
                        r={12 / zoom}
                        fill="rgba(0, 0, 0, 0.8)"
                        stroke="#FFFFFF"
                        strokeWidth={1.5 / zoom}
                      />
                      {/* Confidence text */}
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FFFFFF"
                        fontSize={Math.max(8 / zoom, 6)}
                        fontWeight="600"
                        fontFamily="SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif"
                      >
                        {Math.round(confidence * 100)}
                      </text>
                    </g>
                  );
                })()}
              </g>
            )}
          </g>
        );
      })}

      {/* Render selection indicators */}
      {selectedMaskIds.length > 0 && (
        <g>
          {annotations
            .filter(annotation => selectedMaskIds.includes(annotation.id))
            .map((annotation, index) => {
              const [x, y, width, height] = annotation.bbox;
              const topLeft = imageToScreen(x, y);
              const bottomRight = imageToScreen(x + width, y + height);
              const selectionRect = {
                x: topLeft.x - 4,
                y: topLeft.y - 4,
                width: bottomRight.x - topLeft.x + 8,
                height: bottomRight.y - topLeft.y + 8,
              };

              return (
                <rect
                  key={`selection-${annotation.id}`}
                  x={selectionRect.x}
                  y={selectionRect.y}
                  width={selectionRect.width}
                  height={selectionRect.height}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  rx={4}
                  style={{
                    animation: "dash 1s linear infinite",
                  }}
                />
              );
            })}
        </g>
      )}

      {/* CSS animations */}
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -6;
            }
          }
        `}
      </style>
    </svg>
  );
}