import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTheme } from "@/shared/ui/design-system";
import { Point } from "../types/workspace";
import { Annotation } from "../types/annotation";

export interface PromptPoint {
  id: string;
  x: number;
  y: number;
  type: 'positive' | 'negative';
  timestamp: number;
  associatedMaskId?: number;
}

interface PointPromptSystemProps {
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panOffset: Point;
  annotations: Annotation[];
  selectedMaskIds: number[];
  enabled?: boolean;
  showPromptHistory?: boolean;
  onPromptPointsChange?: (points: PromptPoint[]) => void;
  onPromptGenerated?: (point: PromptPoint) => void;
}

export function PointPromptSystem({
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  zoom,
  panOffset,
  annotations,
  selectedMaskIds,
  enabled = true,
  showPromptHistory = true,
  onPromptPointsChange,
  onPromptGenerated,
}: PointPromptSystemProps) {
  const { theme } = useTheme();
  const [promptPoints, setPromptPoints] = useState<PromptPoint[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<PromptPoint | null>(null);
  const [isPromptMode, setIsPromptMode] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Convert image coordinates to screen coordinates
  const imageToScreen = useCallback((x: number, y: number): Point => {
    return {
      x: x * zoom + panOffset.x,
      y: y * zoom + panOffset.y,
    };
  }, [zoom, panOffset]);

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: Math.max(0, Math.min(imageWidth, (screenX - panOffset.x) / zoom)),
      y: Math.max(0, Math.min(imageHeight, (screenY - panOffset.y) / zoom)),
    };
  }, [zoom, panOffset, imageWidth, imageHeight]);

  // Add a new prompt point
  const addPromptPoint = useCallback((
    x: number,
    y: number,
    type: 'positive' | 'negative',
    associatedMaskId?: number
  ) => {
    const newPoint: PromptPoint = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      type,
      timestamp: Date.now(),
      associatedMaskId,
    };

    setPromptPoints(prev => {
      const updated = [...prev, newPoint];
      onPromptPointsChange?.(updated);
      return updated;
    });

    onPromptGenerated?.(newPoint);
    return newPoint;
  }, [onPromptPointsChange, onPromptGenerated]);

  // Remove a prompt point
  const removePromptPoint = useCallback((pointId: string) => {
    setPromptPoints(prev => {
      const updated = prev.filter(p => p.id !== pointId);
      onPromptPointsChange?.(updated);
      return updated;
    });
  }, [onPromptPointsChange]);

  // Clear all prompt points
  const clearPromptPoints = useCallback(() => {
    setPromptPoints([]);
    onPromptPointsChange?.([]);
  }, [onPromptPointsChange]);

  // Handle mouse events for prompt point creation
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!enabled || !isPromptMode) return;

    event.preventDefault();
    event.stopPropagation();

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const imagePoint = screenToImage(screenX, screenY);

    // Determine prompt type based on modifier keys
    const type: 'positive' | 'negative' = event.shiftKey || event.altKey ? 'negative' : 'positive';

    // Check if clicking near an existing annotation to associate the prompt
    let associatedMaskId: number | undefined;
    for (const annotation of annotations) {
      if (annotation.polygon.has_segmentation) {
        for (const polygon of annotation.polygon.polygons) {
          if (isPointInPolygon(imagePoint, polygon)) {
            associatedMaskId = annotation.id;
            break;
          }
        }
        if (associatedMaskId) break;
      }
    }

    addPromptPoint(imagePoint.x, imagePoint.y, type, associatedMaskId);
  }, [enabled, isPromptMode, screenToImage, annotations, addPromptPoint]);

  // Point-in-polygon test
  const isPointInPolygon = useCallback((point: Point, polygon: number[][]): boolean => {
    let inside = false;
    const x = point.x;
    const y = point.y;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }, []);

  // Auto-generate prompt points for selected masks
  useEffect(() => {
    if (!enabled || selectedMaskIds.length === 0) return;

    // Generate synthetic prompt points for selected masks to show where they might have come from
    selectedMaskIds.forEach(maskId => {
      const annotation = annotations.find(ann => ann.id === maskId);
      if (!annotation || !annotation.polygon.has_segmentation) return;

      // Check if we already have a prompt point for this mask
      const hasExistingPrompt = promptPoints.some(p => p.associatedMaskId === maskId);
      if (hasExistingPrompt) return;

      // Calculate centroid of the mask for synthetic prompt placement
      let totalX = 0;
      let totalY = 0;
      let pointCount = 0;

      annotation.polygon.polygons.forEach(polygon => {
        polygon.forEach(([x, y]) => {
          totalX += x;
          totalY += y;
          pointCount++;
        });
      });

      if (pointCount > 0) {
        const centroidX = totalX / pointCount;
        const centroidY = totalY / pointCount;
        
        // Add a synthetic positive prompt point
        addPromptPoint(centroidX, centroidY, 'positive', maskId);
      }
    });
  }, [selectedMaskIds, annotations, enabled, promptPoints, addPromptPoint]);

  // Cleanup old prompt points when masks are deselected
  useEffect(() => {
    if (selectedMaskIds.length === 0) {
      clearPromptPoints();
      return;
    }

    setPromptPoints(prev => {
      const filtered = prev.filter(point => 
        !point.associatedMaskId || selectedMaskIds.includes(point.associatedMaskId)
      );
      if (filtered.length !== prev.length) {
        onPromptPointsChange?.(filtered);
      }
      return filtered;
    });
  }, [selectedMaskIds, onPromptPointsChange, clearPromptPoints]);

  // Get point style based on type and state
  const getPointStyle = useCallback((point: PromptPoint, isHovered: boolean) => {
    const baseStyle = {
      positive: {
        fill: "#00C851",
        stroke: "#ffffff",
        shadowColor: "#00C851",
      },
      negative: {
        fill: "#FF4444", 
        stroke: "#ffffff",
        shadowColor: "#FF4444",
      },
    };

    const style = baseStyle[point.type];
    
    return {
      ...style,
      strokeWidth: isHovered ? 3 : 2,
      opacity: isHovered ? 1 : 0.9,
      scale: isHovered ? 1.2 : 1,
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Point Prompt Overlay */}
      <svg
        ref={svgRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: isPromptMode ? "auto" : "none",
          zIndex: 15,
          cursor: isPromptMode ? "crosshair" : "default",
        }}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        onClick={handleClick}
      >
        <defs>
          {/* Glow effects for prompt points */}
          <filter id="promptGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Drop shadow for better visibility */}
          <filter id="promptShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        {/* Render prompt points */}
        {promptPoints.map((point, index) => {
          const screenPos = imageToScreen(point.x, point.y);
          const isHovered = hoveredPoint?.id === point.id;
          const style = getPointStyle(point, isHovered);
          const age = (Date.now() - point.timestamp) / 1000; // seconds
          const fadeOpacity = Math.max(0.3, 1 - age / 10); // Fade over 10 seconds

          return (
            <g
              key={point.id}
              transform={`translate(${screenPos.x}, ${screenPos.y}) scale(${style.scale})`}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (e.detail === 2) { // Double click to remove
                  removePromptPoint(point.id);
                }
              }}
              style={{
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {/* Outer ring for negative prompts */}
              {point.type === 'negative' && (
                <circle
                  r={12}
                  fill="none"
                  stroke={style.fill}
                  strokeWidth={2}
                  opacity={fadeOpacity}
                  filter="url(#promptShadow)"
                />
              )}

              {/* Main point circle */}
              <circle
                r={point.type === 'positive' ? 8 : 4}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                opacity={fadeOpacity * style.opacity}
                filter="url(#promptGlow)"
              />

              {/* Plus symbol for positive prompts */}
              {point.type === 'positive' && (
                <g stroke="#ffffff" strokeWidth={2} opacity={fadeOpacity}>
                  <line x1={-4} y1={0} x2={4} y2={0} />
                  <line x1={0} y1={-4} x2={0} y2={4} />
                </g>
              )}

              {/* Minus symbol for negative prompts */}
              {point.type === 'negative' && (
                <line
                  x1={-4}
                  y1={0}
                  x2={4}
                  y2={0}
                  stroke="#ffffff"
                  strokeWidth={2}
                  opacity={fadeOpacity}
                />
              )}

              {/* Connection line to associated mask */}
              {point.associatedMaskId && showPromptHistory && (
                (() => {
                  const annotation = annotations.find(ann => ann.id === point.associatedMaskId);
                  if (!annotation) return null;
                  
                  const [centerX, centerY] = annotation.bbox.slice(0, 2);
                  const [width, height] = annotation.bbox.slice(2, 4);
                  const maskCenter = imageToScreen(centerX + width/2, centerY + height/2);
                  
                  return (
                    <line
                      x1={0}
                      y1={0}
                      x2={maskCenter.x - screenPos.x}
                      y2={maskCenter.y - screenPos.y}
                      stroke={style.shadowColor}
                      strokeWidth={1}
                      strokeDasharray="2 3"
                      opacity={0.4 * fadeOpacity}
                    />
                  );
                })()
              )}

              {/* Point index label */}
              {isHovered && (
                <text
                  y={-16}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={10}
                  fontWeight="600"
                  filter="url(#promptShadow)"
                >
                  #{index + 1} {point.type}
                </text>
              )}
            </g>
          );
        })}

        {/* Instructions overlay when in prompt mode */}
        {isPromptMode && promptPoints.length === 0 && (
          <g>
            <rect
              x={canvasWidth / 2 - 120}
              y={20}
              width={240}
              height={60}
              fill={`${theme.colors.background.card}F0`}
              stroke={theme.colors.border.primary}
              strokeWidth={1}
              rx={8}
              filter="url(#promptShadow)"
            />
            <text
              x={canvasWidth / 2}
              y={40}
              textAnchor="middle"
              fill={theme.colors.text.primary}
              fontSize={12}
              fontWeight="600"
            >
              Click to add positive prompts
            </text>
            <text
              x={canvasWidth / 2}
              y={55}
              textAnchor="middle"
              fill={theme.colors.text.secondary}
              fontSize={10}
            >
              Hold Shift for negative prompts
            </text>
          </g>
        )}
      </svg>

      {/* Prompt Point Summary */}
      {promptPoints.length > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            background: `${theme.colors.background.card}F0`,
            border: `1px solid ${theme.colors.border.primary}40`,
            borderRadius: theme.borders.radius.md,
            padding: theme.spacing.semantic.component.sm,
            backdropFilter: "blur(8px)",
            fontSize: "12px",
            maxWidth: "200px",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: "4px",
            }}
          >
            Prompt Points ({promptPoints.length})
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ color: "#00C851" }}>
              ✓ {promptPoints.filter(p => p.type === 'positive').length} positive
            </div>
            <div style={{ color: "#FF4444" }}>
              ✗ {promptPoints.filter(p => p.type === 'negative').length} negative
            </div>
          </div>
          {hoveredPoint && (
            <div
              style={{
                marginTop: "4px",
                padding: "2px 4px",
                background: `${hoveredPoint.type === 'positive' ? '#00C851' : '#FF4444'}20`,
                borderRadius: "3px",
                fontSize: "10px",
              }}
            >
              Point #{promptPoints.indexOf(hoveredPoint) + 1}: {hoveredPoint.type} 
              {hoveredPoint.associatedMaskId && ` → Mask ${hoveredPoint.associatedMaskId}`}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Hook for managing prompt point state
export function usePromptPoints() {
  const [promptPoints, setPromptPoints] = useState<PromptPoint[]>([]);
  const [isPromptMode, setIsPromptMode] = useState(false);

  const addPromptPoint = useCallback((point: PromptPoint) => {
    setPromptPoints(prev => [...prev, point]);
  }, []);

  const removePromptPoint = useCallback((pointId: string) => {
    setPromptPoints(prev => prev.filter(p => p.id !== pointId));
  }, []);

  const clearPromptPoints = useCallback(() => {
    setPromptPoints([]);
  }, []);

  const togglePromptMode = useCallback(() => {
    setIsPromptMode(prev => !prev);
  }, []);

  return {
    promptPoints,
    isPromptMode,
    addPromptPoint,
    removePromptPoint,
    clearPromptPoints,
    togglePromptMode,
    setPromptPoints,
  };
}