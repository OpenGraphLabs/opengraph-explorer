import React, { useCallback, useRef, useState, useEffect } from "react";
import { Annotation } from "../types/annotation";
import { Point } from "../types/workspace";

export interface SimpleInteractionState {
  hoveredMaskId: number | null;
  selectedMaskIds: number[];
  lastClickedMaskId: number | null;
}

interface SimpleInteractionSystemProps {
  annotations: Annotation[];
  zoom: number;
  panOffset: Point;
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  selectedMaskIds: number[];
  onStateChange: (state: Partial<SimpleInteractionState>) => void;
  children: (
    state: SimpleInteractionState, 
    handlers: SimpleInteractionHandlers
  ) => React.ReactNode;
}

export interface SimpleInteractionHandlers {
  handleMouseMove: (event: React.MouseEvent) => void;
  handleClick: (event: React.MouseEvent) => void;
  handleMouseLeave: () => void;
  toggleMaskSelection: (maskId: number) => void;
  clearSelection: () => void;
  removeMask: (maskId: number) => void;
}

export function SimpleInteractionSystem({
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
}: SimpleInteractionSystemProps) {
  const interactionRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [interactionState, setInteractionState] = useState<SimpleInteractionState>({
    hoveredMaskId: null,
    selectedMaskIds,
    lastClickedMaskId: null,
  });

  // selectedMaskIds prop 변경 시 상태 업데이트
  useEffect(() => {
    setInteractionState(prev => ({
      ...prev,
      selectedMaskIds,
    }));
  }, [selectedMaskIds]);

  // 화면 좌표를 이미지 좌표로 변환
  const screenToImage = useCallback((screenX: number, screenY: number): Point => {
    return {
      x: Math.max(0, Math.min(imageWidth, (screenX - panOffset.x) / zoom)),
      y: Math.max(0, Math.min(imageHeight, (screenY - panOffset.y) / zoom)),
    };
  }, [zoom, panOffset, imageWidth, imageHeight]);

  // 점이 폴리곤 내부에 있는지 확인 (레이 캐스팅 알고리즘)
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

  // 특정 점에서 마스크 찾기 (가장 작은 마스크 우선)
  const getMaskAtPoint = useCallback((point: Point): Annotation | null => {
    let bestMask: Annotation | null = null;
    let smallestArea = Infinity;
    
    for (const annotation of annotations) {
      if (!annotation.polygon.has_segmentation) continue;
      
      // 폴리곤 내부에 점이 있는지 확인
      const isInside = annotation.polygon.polygons.some(polygon => 
        isPointInPolygon(point, polygon)
      );
      
      if (isInside) {
        // 바운딩 박스 면적으로 크기 비교 (더 작은 마스크가 우선)
        const [, , width, height] = annotation.bbox;
        const area = width * height;
        
        if (area < smallestArea) {
          bestMask = annotation;
          smallestArea = area;
        }
      }
    }
    
    return bestMask;
  }, [annotations, isPointInPolygon]);

  // 상태 업데이트 및 부모 컴포넌트에 알림
  const updateState = useCallback((updates: Partial<SimpleInteractionState>) => {
    setInteractionState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange(updates);
      return newState;
    });
  }, [onStateChange]);

  // 마스크 선택 토글
  const toggleMaskSelection = useCallback((maskId: number) => {
    const newSelectedMaskIds = selectedMaskIds.includes(maskId)
      ? selectedMaskIds.filter(id => id !== maskId)
      : [...selectedMaskIds, maskId];
    
    updateState({
      selectedMaskIds: newSelectedMaskIds,
      lastClickedMaskId: maskId,
    });
  }, [selectedMaskIds, updateState]);

  // 전체 선택 해제
  const clearSelection = useCallback(() => {
    updateState({
      selectedMaskIds: [],
      lastClickedMaskId: null,
    });
  }, [updateState]);

  // 특정 마스크 제거
  const removeMask = useCallback((maskId: number) => {
    const newSelectedMaskIds = selectedMaskIds.filter(id => id !== maskId);
    updateState({
      selectedMaskIds: newSelectedMaskIds,
    });
  }, [selectedMaskIds, updateState]);

  // 마우스 이동 처리 (부드러운 호버 효과)
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const rect = interactionRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    
    const imagePoint = screenToImage(screenPoint.x, screenPoint.y);
    const maskAtPoint = getMaskAtPoint(imagePoint);
    
    // 호버 디바운싱으로 부드러운 전환
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      const newHoveredMaskId = maskAtPoint?.id || null;
      
      if (newHoveredMaskId !== interactionState.hoveredMaskId) {
        updateState({
          hoveredMaskId: newHoveredMaskId,
        });
      }
    }, 50); // 50ms 디바운스
    
  }, [screenToImage, getMaskAtPoint, updateState, interactionState.hoveredMaskId]);

  // 클릭 처리
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
      toggleMaskSelection(maskAtPoint.id);
    }
  }, [screenToImage, getMaskAtPoint, toggleMaskSelection]);

  // 마우스 나감 처리
  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    updateState({
      hoveredMaskId: null,
    });
  }, [updateState]);

  // 클린업
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handlers: SimpleInteractionHandlers = {
    handleMouseMove,
    handleClick,
    handleMouseLeave,
    toggleMaskSelection,
    clearSelection,
    removeMask,
  };

  return (
    <div
      ref={interactionRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: interactionState.hoveredMaskId ? 'pointer' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    >
      {children(interactionState, handlers)}
    </div>
  );
}

// 간단한 상태 관리 훅
export function useSimpleInteraction() {
  const [state, setState] = useState<SimpleInteractionState>({
    hoveredMaskId: null,
    selectedMaskIds: [],
    lastClickedMaskId: null,
  });

  const updateState = useCallback((updates: Partial<SimpleInteractionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleMaskSelection = useCallback((maskId: number) => {
    setState(prev => {
      const newSelectedMaskIds = prev.selectedMaskIds.includes(maskId)
        ? prev.selectedMaskIds.filter(id => id !== maskId)
        : [...prev.selectedMaskIds, maskId];
      
      return {
        ...prev,
        selectedMaskIds: newSelectedMaskIds,
        lastClickedMaskId: maskId,
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedMaskIds: [],
      lastClickedMaskId: null,
    }));
  }, []);

  const removeMask = useCallback((maskId: number) => {
    setState(prev => ({
      ...prev,
      selectedMaskIds: prev.selectedMaskIds.filter(id => id !== maskId),
    }));
  }, []);

  return {
    state,
    updateState,
    toggleMaskSelection,
    clearSelection,
    removeMask,
  };
}