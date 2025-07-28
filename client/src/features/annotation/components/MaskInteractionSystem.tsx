import React, { useCallback, useRef, useEffect, useState } from "react";
import { useTheme } from "@/shared/ui/design-system";
import { Annotation } from "../types/annotation";
import { Point } from "../types/workspace";

export interface MaskInteractionState {
  hoveredMaskId: number | null;
  selectedMaskIds: number[];
  hoveredPoint: Point | null;
  interactionMode: 'select' | 'hover' | 'none';
}

interface MaskInteractionSystemProps {
  annotations: Annotation[];
  zoom: number;
  panOffset: Point;
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  selectedMaskIds: number[];
  onStateChange: (state: Partial<MaskInteractionState>) => void;
  children: (state: MaskInteractionState, handlers: MaskInteractionHandlers) => React.ReactNode;
}

export interface MaskInteractionHandlers {
  handleMouseMove: (event: React.MouseEvent) => void;
  handleClick: (event: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  isPointInMask: (point: Point, annotation: Annotation) => boolean;
  getMaskAtPoint: (point: Point) => Annotation | null;
}

export function MaskInteractionSystem({
  annotations,
  zoom,
  panOffset,
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  selectedMaskIds,
  onStateChange,
  children,
}: MaskInteractionSystemProps) {
  const { theme } = useTheme();
  const interactionRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [interactionState, setInteractionState] = useState<MaskInteractionState>({
    hoveredMaskId: null,
    selectedMaskIds,
    hoveredPoint: null,
    interactionMode: 'none',
  });

  // Update selected masks when prop changes
  useEffect(() => {
    setInteractionState(prev => ({
      ...prev,
      selectedMaskIds,
    }));
  }, [selectedMaskIds]);

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: Math.max(0, Math.min(imageWidth, (screenX - panOffset.x) / zoom)),
      y: Math.max(0, Math.min(imageHeight, (screenY - panOffset.y) / zoom)),
    };
  }, [zoom, panOffset, imageWidth, imageHeight]);

  // Check if point is inside polygon using ray casting algorithm
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

  // Check if point is inside mask
  const isPointInMask = useCallback((point: Point, annotation: Annotation): boolean => {
    if (!annotation.polygon.has_segmentation) return false;
    
    // Quick bbox check first for performance
    const [bboxX, bboxY, bboxWidth, bboxHeight] = annotation.bbox;
    if (point.x < bboxX || point.x > bboxX + bboxWidth || 
        point.y < bboxY || point.y > bboxY + bboxHeight) {
      return false;
    }
    
    // Check against all polygons in the mask
    return annotation.polygon.polygons.some(polygon => 
      isPointInPolygon(point, polygon)
    );
  }, [isPointInPolygon]);

  // Get mask at point (returns highest confidence mask if multiple overlap)
  const getMaskAtPoint = useCallback((point: Point): Annotation | null => {
    let bestMask: Annotation | null = null;
    let bestConfidence = 0;
    
    for (const annotation of annotations) {
      if (isPointInMask(point, annotation)) {
        const confidence = annotation.stability_score || 0.5;
        if (confidence > bestConfidence) {
          bestMask = annotation;
          bestConfidence = confidence;
        }
      }
    }
    
    return bestMask;
  }, [annotations, isPointInMask]);

  // Update interaction state and notify parent
  const updateState = useCallback((updates: Partial<MaskInteractionState>) => {
    setInteractionState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange(updates);
      return newState;
    });
  }, [onStateChange]);

  // Handle mouse move with debounced hover detection
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = interactionRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    
    const imagePoint = screenToImage(screenPoint.x, screenPoint.y);
    const maskAtPoint = getMaskAtPoint(imagePoint);
    
    // Clear existing hover timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Update hovered point immediately for responsive feedback
    updateState({
      hoveredPoint: imagePoint,
      interactionMode: maskAtPoint ? 'hover' : 'none',
    });
    
    // Debounce mask hover detection to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      const newHoveredMaskId = maskAtPoint?.id || null;
      
      if (newHoveredMaskId !== interactionState.hoveredMaskId) {
        updateState({
          hoveredMaskId: newHoveredMaskId,
        });
      }
    }, 50); // 50ms debounce for smooth interaction
    
  }, [screenToImage, getMaskAtPoint, updateState, interactionState.hoveredMaskId]);

  // Handle click with mask selection
  const handleClick = useCallback((event: React.MouseEvent) => {
    const rect = interactionRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    
    const imagePoint = screenToImage(screenPoint.x, screenPoint.y);
    const maskAtPoint = getMaskAtPoint(imagePoint);
    
    if (maskAtPoint) {
      const maskId = maskAtPoint.id;
      let newSelectedMaskIds: number[];
      
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        // Multi-select mode
        if (selectedMaskIds.includes(maskId)) {
          newSelectedMaskIds = selectedMaskIds.filter(id => id !== maskId);
        } else {
          newSelectedMaskIds = [...selectedMaskIds, maskId];
        }
      } else {
        // Single select mode
        newSelectedMaskIds = selectedMaskIds.includes(maskId) ? [] : [maskId];
      }
      
      updateState({
        selectedMaskIds: newSelectedMaskIds,
        interactionMode: 'select',
      });
      
      // Create a synthetic event with mask information for the parent
      const syntheticEvent = {
        ...event,
        maskId,
        maskAnnotation: maskAtPoint,
        selectedMaskIds: newSelectedMaskIds,
      };
      
      // Notify parent about the mask selection
      onStateChange({
        selectedMaskIds: newSelectedMaskIds,
      });
    }
  }, [screenToImage, getMaskAtPoint, selectedMaskIds, updateState, onStateChange]);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    updateState({
      hoveredMaskId: null,
      hoveredPoint: null,
      interactionMode: 'none',
    });
  }, [updateState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handlers: MaskInteractionHandlers = {
    handleMouseMove,
    handleClick,
    handleMouseLeave,
    isPointInMask,
    getMaskAtPoint,
  };

  return (
    <div
      ref={interactionRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: interactionState.interactionMode === 'hover' ? 'pointer' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    >
      {children(interactionState, handlers)}
    </div>
  );
}

// Hook for using mask interaction state
export function useMaskInteraction() {
  const [state, setState] = useState<MaskInteractionState>({
    hoveredMaskId: null,
    selectedMaskIds: [],
    hoveredPoint: null,
    interactionMode: 'none',
  });

  const updateState = useCallback((updates: Partial<MaskInteractionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    state,
    updateState,
  };
}