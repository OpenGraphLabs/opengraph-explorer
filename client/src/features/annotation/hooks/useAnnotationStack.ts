import { useState, useCallback, useMemo } from "react";
import { type LabelAnnotation, type BoundingBox, type ImageData } from "../types/workspace";
import { type DataAnnotationInput } from "@/shared/api/sui/annotationSuiService";

// 스택에 저장될 annotation 항목 인터페이스
export interface AnnotationStackItem {
  id: string;
  imageData: ImageData;
  type: "label" | "bbox";
  annotation: LabelAnnotation | BoundingBox;
  timestamp: number;
}

// 스택 상태 인터페이스
export interface AnnotationStackState {
  items: AnnotationStackItem[];
  count: number;
  isFull: boolean;
  hasItems: boolean;
}

const MAX_STACK_SIZE = 30;

export function useAnnotationStack() {
  const [stack, setStack] = useState<AnnotationStackItem[]>([]);

  // 스택 상태 계산
  const stackState: AnnotationStackState = useMemo(
    () => ({
      items: stack,
      count: stack.length,
      isFull: stack.length >= MAX_STACK_SIZE,
      hasItems: stack.length > 0,
    }),
    [stack]
  );

  /**
   * 스택에 annotation 추가
   */
  const addToStack = useCallback(
    (imageData: ImageData, type: "label" | "bbox", annotation: LabelAnnotation | BoundingBox) => {
      if (stack.length >= MAX_STACK_SIZE) {
        console.warn(
          "Annotation stack is full. Please save current annotations before adding more."
        );
        return false;
      }

      const stackItem: AnnotationStackItem = {
        id: `${imageData.id}_${type}_${annotation.id}_${Date.now()}`,
        imageData,
        type,
        annotation,
        timestamp: Date.now(),
      };

      setStack(prev => [...prev, stackItem]);
      return true;
    },
    [stack.length]
  );

  /**
   * 스택에서 특정 항목 제거
   */
  const removeFromStack = useCallback((itemId: string) => {
    setStack(prev => prev.filter(item => item.id !== itemId));
  }, []);

  /**
   * 스택 전체 비우기
   */
  const clearStack = useCallback(() => {
    setStack([]);
  }, []);

  /**
   * 특정 이미지의 annotation만 스택에서 제거
   */
  const removeImageFromStack = useCallback((imageId: string) => {
    setStack(prev => prev.filter(item => item.imageData.id !== imageId));
  }, []);

  /**
   * 스택 내용을 Sui 저장용 데이터로 변환
   */
  const prepareForSuiSave = useCallback((): DataAnnotationInput[] => {
    // 이미지별로 annotation을 그룹화
    const groupedByImage = stack.reduce(
      (acc, item) => {
        const imageId = item.imageData.id;
        if (!acc[imageId]) {
          acc[imageId] = {
            imageData: item.imageData,
            labelAnnotations: [],
            bboxAnnotations: [],
          };
        }

        if (item.type === "label") {
          acc[imageId].labelAnnotations.push(item.annotation as LabelAnnotation);
        } else if (item.type === "bbox") {
          acc[imageId].bboxAnnotations.push(item.annotation as BoundingBox);
        }

        return acc;
      },
      {} as Record<
        string,
        {
          imageData: ImageData;
          labelAnnotations: LabelAnnotation[];
          bboxAnnotations: BoundingBox[];
        }
      >
    );

    // Sui 저장용 형식으로 변환
    return Object.values(groupedByImage)
      .map(group => ({
        dataId: group.imageData.datasetId || "", // Dataset의 Data 객체 ID
        dataPath: group.imageData.originalPath || group.imageData.filename,
        labelAnnotations: group.labelAnnotations.length > 0 ? group.labelAnnotations : undefined,
        bboxAnnotations: group.bboxAnnotations.length > 0 ? group.bboxAnnotations : undefined,
      }))
      .filter(item => item.labelAnnotations || item.bboxAnnotations);
  }, [stack]);

  /**
   * 스택 통계 정보
   */
  const getStackStats = useCallback(() => {
    const stats = {
      total: stack.length,
      byType: {
        label: stack.filter(item => item.type === "label").length,
        bbox: stack.filter(item => item.type === "bbox").length,
      },
      byImage: {} as Record<string, number>,
      remaining: MAX_STACK_SIZE - stack.length,
    };

    // 이미지별 통계
    stack.forEach(item => {
      const imageId = item.imageData.id;
      stats.byImage[imageId] = (stats.byImage[imageId] || 0) + 1;
    });

    return stats;
  }, [stack]);

  /**
   * 스택에서 특정 이미지와 annotation 타입으로 검색
   */
  const findInStack = useCallback(
    (imageId: string, annotationType: "label" | "bbox", annotationId: string) => {
      return stack.find(
        item =>
          item.imageData.id === imageId &&
          item.type === annotationType &&
          item.annotation.id === annotationId
      );
    },
    [stack]
  );

  return {
    // 상태
    stackState,
    maxSize: MAX_STACK_SIZE,

    // 액션
    addToStack,
    removeFromStack,
    clearStack,
    removeImageFromStack,

    // 유틸리티
    prepareForSuiSave,
    getStackStats,
    findInStack,
  };
}
