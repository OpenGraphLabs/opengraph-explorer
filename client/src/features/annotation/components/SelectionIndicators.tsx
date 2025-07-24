import React, { useMemo, useRef, useEffect } from "react";
import { useTheme } from "@/shared/ui/design-system";
import { Annotation } from "../types/annotation";
import { Point } from "../types/workspace";
import { useColorScheme } from "./ColorSchemeManager";

interface SelectionIndicatorsProps {
  annotations: Annotation[];
  selectedMaskIds: number[];
  hoveredMaskId?: number | null;
  hoveredPoint?: Point | null;
  zoom: number;
  panOffset: Point;
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  showConfidence?: boolean;
  showBoundingBoxes?: boolean;
  showCenterPoints?: boolean;
  showSelectionOrder?: boolean;
}

interface SelectionIndicatorStyle {
  strokeColor: string;
  strokeWidth: number;
  dashArray?: string;
  glowColor: string;
  backgroundColor?: string;
  textColor: string;
}

export function SelectionIndicators({
  annotations,
  selectedMaskIds,
  hoveredMaskId,
  hoveredPoint,
  zoom,
  panOffset,
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  showConfidence = true,
  showBoundingBoxes = true,
  showCenterPoints = true,
  showSelectionOrder = true,
}: SelectionIndicatorsProps) {
  const { theme } = useTheme();
  const { getColorForIndex, currentScheme } = useColorScheme();
  const svgRef = useRef<SVGSVGElement>(null);

  // Convert image coordinates to screen coordinates
  const imageToScreen = React.useCallback((x: number, y: number): Point => {
    return {
      x: x * zoom + panOffset.x,
      y: y * zoom + panOffset.y,
    };
  }, [zoom, panOffset]);

  // Get style for selection indicator based on state
  const getIndicatorStyle = React.useCallback((
    annotation: Annotation, 
    index: number, 
    isSelected: boolean, 
    isHovered: boolean
  ): SelectionIndicatorStyle => {
    const colorScheme = getColorForIndex(index);
    
    if (isSelected) {
      return {
        strokeColor: "#FFFFFF",
        strokeWidth: Math.max(2.5 / zoom, 1),
        dashArray: "6 3",
        glowColor: colorScheme.main,
        backgroundColor: `${colorScheme.main}20`,
        textColor: "#FFFFFF",
      };
    } else if (isHovered) {
      return {
        strokeColor: colorScheme.main,
        strokeWidth: Math.max(2 / zoom, 0.8),
        glowColor: colorScheme.main,
        backgroundColor: `${colorScheme.main}15`,
        textColor: colorScheme.main,
      };
    } else {
      return {
        strokeColor: colorScheme.main,
        strokeWidth: Math.max(1 / zoom, 0.5),
        glowColor: colorScheme.main,
        textColor: colorScheme.main,
      };
    }
  }, [getColorForIndex, zoom]);

  // Get selection order for mask
  const getSelectionOrder = React.useCallback((maskId: number): number => {
    return selectedMaskIds.indexOf(maskId) + 1;
  }, [selectedMaskIds]);

  // Selected annotations with their display data
  const displayAnnotations = useMemo(() => {
    return annotations
      .map((annotation, index) => {
        const isSelected = selectedMaskIds.includes(annotation.id);
        const isHovered = hoveredMaskId === annotation.id;
        const shouldShow = isSelected || isHovered;
        
        if (!shouldShow) return null;

        const [x, y, width, height] = annotation.bbox;
        const style = getIndicatorStyle(annotation, index, isSelected, isHovered);
        const selectionOrder = isSelected ? getSelectionOrder(annotation.id) : 0;
        const confidence = annotation.stability_score || 0.8;

        // Calculate screen coordinates
        const topLeft = imageToScreen(x, y);
        const bottomRight = imageToScreen(x + width, y + height);
        const center = imageToScreen(x + width / 2, y + height / 2);

        return {
          annotation,
          index,
          isSelected,
          isHovered,
          style,
          selectionOrder,
          confidence,
          bounds: {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y,
          },
          center,
        };
      })
      .filter(Boolean) as NonNullable<typeof displayAnnotations[0]>[];
  }, [
    annotations,
    selectedMaskIds,
    hoveredMaskId,
    imageToScreen,
    getIndicatorStyle,
    getSelectionOrder,
  ]);

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
        zIndex: 10,
      }}
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
    >
      <defs>
        {/* Glow filter for selection indicators */}
        <filter id="selectionGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Drop shadow filter for text */}
        <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.8)"/>
        </filter>

        {/* Patterns for different selection states */}
        <pattern id="selectedPattern" patternUnits="userSpaceOnUse" width="4" height="4">
          <rect width="4" height="4" fill="rgba(255,255,255,0.1)"/>
          <circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.3)"/>
        </pattern>
      </defs>

      {/* Render selection indicators */}
      {displayAnnotations.map(({ 
        annotation, 
        index, 
        isSelected, 
        isHovered, 
        style, 
        selectionOrder, 
        confidence, 
        bounds, 
        center 
      }) => (
        <g key={annotation.id}>
          {/* Bounding box indicator */}
          {showBoundingBoxes && (
            <g>
              {/* Background fill for selected items */}
              {isSelected && (
                <rect
                  x={bounds.x - 4}
                  y={bounds.y - 4}
                  width={bounds.width + 8}
                  height={bounds.height + 8}
                  fill={style.backgroundColor}
                  rx={6}
                  opacity={0.3}
                />
              )}
              
              {/* Main bounding box */}
              <rect
                x={bounds.x}
                y={bounds.y}
                width={bounds.width}
                height={bounds.height}
                fill="none"
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.dashArray}
                rx={4}
                filter={isSelected ? "url(#selectionGlow)" : undefined}
                style={{
                  animation: isSelected ? "dashAnimation 2s linear infinite" : undefined,
                }}
              />

              {/* Corner indicators for selected items */}
              {isSelected && (
                <g>
                  {[
                    [bounds.x, bounds.y], // top-left
                    [bounds.x + bounds.width, bounds.y], // top-right
                    [bounds.x, bounds.y + bounds.height], // bottom-left
                    [bounds.x + bounds.width, bounds.y + bounds.height], // bottom-right
                  ].map(([x, y], cornerIndex) => (
                    <rect
                      key={cornerIndex}
                      x={x - 4}
                      y={y - 4}
                      width={8}
                      height={8}
                      fill="#FFFFFF"
                      stroke={style.glowColor}
                      strokeWidth={1}
                      rx={2}
                    />
                  ))}
                </g>
              )}
            </g>
          )}

          {/* Center point indicator */}
          {showCenterPoints && (
            <g transform={`translate(${center.x}, ${center.y})`}>
              {/* Outer ring */}
              <circle
                r={Math.max(8 / zoom, 4)}
                fill="none"
                stroke={style.strokeColor}
                strokeWidth={style.strokeWidth}
                opacity={0.8}
              />
              
              {/* Inner dot */}
              <circle
                r={Math.max(3 / zoom, 2)}
                fill={style.strokeColor}
                opacity={0.9}
              />
              
              {/* Pulsing ring for selected items */}
              {isSelected && (
                <circle
                  r={Math.max(12 / zoom, 6)}
                  fill="none"
                  stroke={style.strokeColor}
                  strokeWidth={Math.max(1 / zoom, 0.5)}
                  opacity={0.5}
                  style={{
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              )}
            </g>
          )}

          {/* Selection order badge */}
          {showSelectionOrder && isSelected && selectionOrder > 0 && (
            <g transform={`translate(${bounds.x + bounds.width - 12}, ${bounds.y - 12})`}>
              {/* Badge background */}
              <circle
                r={12}
                fill={style.glowColor}
                stroke="#FFFFFF"
                strokeWidth={2}
                filter="url(#textShadow)"
              />
              
              {/* Selection number */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fill="#FFFFFF"
                fontSize={Math.max(10 / zoom, 8)}
                fontWeight="700"
                fontFamily="SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif"
              >
                {selectionOrder}
              </text>
            </g>
          )}

          {/* Confidence indicator */}
          {showConfidence && isSelected && (
            <g transform={`translate(${bounds.x}, ${bounds.y + bounds.height + 8})`}>
              {/* Confidence bar background */}
              <rect
                x={0}
                y={0}
                width={Math.min(bounds.width, 80)}
                height={4}
                fill="rgba(0,0,0,0.3)"
                rx={2}
              />
              
              {/* Confidence bar fill */}
              <rect
                x={0}
                y={0}
                width={Math.min(bounds.width, 80) * confidence}
                height={4}
                fill={style.glowColor}
                rx={2}
              />
              
              {/* Confidence text */}
              <text
                x={Math.min(bounds.width, 80) + 6}
                y={3}
                fill={style.textColor}
                fontSize={Math.max(10 / zoom, 8)}
                fontWeight="500"
                dominantBaseline="central"
                fontFamily="SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif"
                filter="url(#textShadow)"
              >
                {Math.round(confidence * 100)}%
              </text>
            </g>
          )}
        </g>
      ))}

      {/* Hover point indicator */}
      {hoveredPoint && (
        <g transform={`translate(${hoveredPoint.x * zoom + panOffset.x}, ${hoveredPoint.y * zoom + panOffset.y})`}>
          {/* Crosshair */}
          <g stroke="#FFFFFF" strokeWidth={2} opacity={0.8}>
            <line x1={-12} y1={0} x2={12} y2={0} />
            <line x1={0} y1={-12} x2={0} y2={12} />
          </g>
          
          {/* Center dot */}
          <circle
            r={3}
            fill="#FFFFFF"
            stroke={theme.colors.interactive.primary}
            strokeWidth={2}
          />
        </g>
      )}

      {/* CSS animations */}
      <style>
        {`
          @keyframes dashAnimation {
            to {
              stroke-dashoffset: -12;
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              opacity: 0.5;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </svg>
  );
}

// Selection summary component
interface SelectionSummaryProps {
  selectedMaskIds: number[];
  annotations: Annotation[];
  hoveredMaskId?: number | null;
  className?: string;
}

export function SelectionSummary({
  selectedMaskIds,
  annotations,
  hoveredMaskId,
  className,
}: SelectionSummaryProps) {
  const { theme } = useTheme();
  const { getColorForIndex } = useColorScheme();

  const selectedAnnotations = useMemo(() => {
    return annotations.filter(ann => selectedMaskIds.includes(ann.id));
  }, [annotations, selectedMaskIds]);

  const hoveredAnnotation = useMemo(() => {
    return hoveredMaskId ? annotations.find(ann => ann.id === hoveredMaskId) : null;
  }, [annotations, hoveredMaskId]);

  if (selectedMaskIds.length === 0 && !hoveredAnnotation) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        background: `${theme.colors.background.card}F0`,
        border: `1px solid ${theme.colors.border.primary}40`,
        borderRadius: theme.borders.radius.md,
        padding: theme.spacing.semantic.component.sm,
        backdropFilter: "blur(8px)",
        fontSize: "12px",
      }}
    >
      {selectedMaskIds.length > 0 && (
        <div style={{ marginBottom: hoveredAnnotation ? theme.spacing.semantic.component.xs : 0 }}>
          <div
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: "4px",
            }}
          >
            Selected: {selectedMaskIds.length} mask{selectedMaskIds.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {selectedAnnotations.map((annotation, index) => {
              const colorScheme = getColorForIndex(annotations.indexOf(annotation));
              const confidence = annotation.stability_score || 0.8;
              
              return (
                <div
                  key={annotation.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: `${colorScheme.main}20`,
                    color: colorScheme.main,
                    padding: "2px 6px",
                    borderRadius: theme.borders.radius.sm,
                    fontSize: "10px",
                    fontWeight: 500,
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: colorScheme.main,
                    }}
                  />
                  #{selectedMaskIds.indexOf(annotation.id) + 1} ({Math.round(confidence * 100)}%)
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hoveredAnnotation && (
        <div>
          <div
            style={{
              fontWeight: 600,
              color: theme.colors.text.secondary,
              fontSize: "10px",
            }}
          >
            Hovering: Mask #{hoveredAnnotation.id} ({Math.round((hoveredAnnotation.stability_score || 0.8) * 100)}%)
          </div>
        </div>
      )}
    </div>
  );
}