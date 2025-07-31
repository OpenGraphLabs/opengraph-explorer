import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Box, Flex, Text, Button, Heading } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  X,
  Eye,
  EyeSlash,
  DownloadSimple,
  Info,
  Calendar,
  ArrowsOut,
  Tag,
  Hash,
  Target,
  BoundingBox as BoundingBoxIcon,
  Brain,
  Sparkle,
} from "phosphor-react";
import type { AnnotationRead, AnnotationClientRead } from "@/shared/api/generated/models";
import { useApprovedAnnotationsByImage } from "@/shared/hooks/useApiQuery";

interface ImageItem {
  id: number;
  file_name: string;
  image_url: string;
  width: number;
  height: number;
  dataset_id: number;
  created_at: string;
}

interface ImageDetailSidebarProps {
  annotation: AnnotationRead;
  image: ImageItem;
  categoryName?: string;
  isOpen: boolean;
  onClose: () => void;
}

// 색상 팔레트
const HIGHLIGHT_COLOR = "#0066FF"; // 선택된 어노테이션 색상 (메인 파란색)
const OTHER_COLOR = "#8B5A96"; // 다른 어노테이션 색상 (차분한 보라색)

export function ImageDetailSidebar({
  annotation,
  image,
  categoryName = "Unknown Category",
  isOpen,
  onClose,
}: ImageDetailSidebarProps) {
  const { theme } = useTheme();
  const [showMask, setShowMask] = useState(true);
  const [showBBox, setShowBBox] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);

  // 이미지의 모든 approved 어노테이션 가져오기
  const { data: allApprovedAnnotations, isLoading: annotationsLoading } =
    useApprovedAnnotationsByImage(image.id, {
      enabled: isOpen && !!image.id,
      refetchOnWindowFocus: false,
    } as any);

  // 이미지 로드 처리
  useEffect(() => {
    if (!isOpen) return;

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      drawImageOnCanvas(img);
    };
    img.src = image.image_url;
  }, [isOpen, image.image_url]);

  // 캔버스에 이미지 그리기
  const drawImageOnCanvas = useCallback(
    (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 캔버스 크기를 컨테이너에 맞게 조정 (520px 사이드바에 맞게 조정)
      const containerWidth = 480; // 사이드바 520px - 좌우 패딩 40px
      const aspectRatio = image.height / image.width;
      const containerHeight = containerWidth * aspectRatio;

      canvas.width = containerWidth;
      canvas.height = containerHeight;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      // 이미지 그리기
      ctx.clearRect(0, 0, containerWidth, containerHeight);
      ctx.drawImage(img, 0, 0, containerWidth, containerHeight);
    },
    [image]
  );

  // SVG 좌표 변환
  const transformCoordinates = useCallback(
    (originalX: number, originalY: number) => {
      const containerWidth = 480; // 캔버스와 동일한 크기
      const scaleX = containerWidth / image.width;
      const scaleY = (containerWidth * image.height) / image.width / image.height;

      return {
        x: originalX * scaleX,
        y: originalY * scaleY,
      };
    },
    [image]
  );

  // 폴리곤을 SVG path로 변환
  const polygonToPath = useCallback(
    (polygon: number[][]): string => {
      if (polygon.length < 3) return "";

      const transformedPoints = polygon.map(([x, y]) => transformCoordinates(x, y));

      let path = `M ${transformedPoints[0].x} ${transformedPoints[0].y}`;
      for (let i = 1; i < transformedPoints.length; i++) {
        path += ` L ${transformedPoints[i].x} ${transformedPoints[i].y}`;
      }
      path += " Z";

      return path;
    },
    [transformCoordinates]
  );

  // 어노테이션이 현재 선택된 어노테이션인지 확인
  const isSelectedAnnotation = useCallback(
    (annotationToCheck: AnnotationClientRead) => {
      return annotationToCheck.id === annotation.id;
    },
    [annotation.id]
  );

  // 바운딩 박스 좌표 변환
  const getBBoxCoordinates = useCallback(() => {
    if (!annotation.bbox || annotation.bbox.length < 4) return null;

    const [x, y, width, height] = annotation.bbox;
    const topLeft = transformCoordinates(x, y);
    const bottomRight = transformCoordinates(x + width, y + height);

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }, [annotation.bbox, transformCoordinates]);

  // 메타데이터 계산
  const metadata = {
    confidence: Math.round((annotation.stability_score || 0.8) * 100),
    area: annotation.bbox ? Math.round(annotation.bbox[2] * annotation.bbox[3]) : 0,
    aspectRatio: image.width / image.height,
    fileSize: "N/A", // API에서 제공되지 않음
    createdDate: new Date(image.created_at).toLocaleDateString(),
  };

  // 렌더링할 어노테이션 목록 준비
  const annotationsToRender = useMemo(() => {
    const annotations = allApprovedAnnotations || [];

    // 현재 어노테이션이 목록에 없으면 추가 (AnnotationClientRead 형식으로 변환)
    const hasCurrentAnnotation = annotations.some(
      (ann: AnnotationClientRead) => ann.id === annotation.id
    );
    if (!hasCurrentAnnotation && annotation) {
      const currentAsClientRead: AnnotationClientRead = {
        ...annotation,
        polygon: annotation.polygon || null,
      };
      return [...annotations, currentAsClientRead];
    }

    return annotations;
  }, [allApprovedAnnotations, annotation]);

  // 더미 컨텍스트 데이터 (추후 API에서 가져올 예정)
  const contextDescription = `A <em>person</em> who is located from (151, 0) to (329, 401) is standing on a dirt ground, wearing a white shirt and blue jeans, facing away from the camera.
A large <em>dog</em> is standing from (134, 120) to (456, 481) with dark curly fur. It is positioned directly in front of the <em>person</em> and facing the same direction.
A smaller <em>dog</em> is running from (108, 119) to (351, 285), carrying an orange toy in its mouth. It is to the left of the larger <em>dog</em> and partially in front of the <em>person</em>.`;

  // HTML 태그를 파싱해서 React 요소로 변환
  const parseContextDescription = useCallback((text: string) => {
    const parts = text.split(/(<em>.*?<\/em>)/g);

    return parts.map((part, index) => {
      if (part.startsWith("<em>") && part.endsWith("</em>")) {
        const content = part.replace(/<\/?em>/g, "");
        return (
          <span
            key={index}
            style={{
              color: HIGHLIGHT_COLOR,
              fontWeight: 600,
              textDecoration: `underline ${HIGHLIGHT_COLOR}40`,
              textUnderlineOffset: "2px",
            }}
          >
            {content}
          </span>
        );
      }
      return part;
    });
  }, []);

  // 디버깅용 로그
  useEffect(() => {
    console.log("ImageDetailSidebar Debug:", {
      imageId: image.id,
      annotationsLoading,
      allApprovedAnnotations,
      annotationsToRender,
      currentAnnotationId: annotation.id,
    });
  }, [image.id, annotationsLoading, allApprovedAnnotations, annotationsToRender, annotation.id]);

  if (!isOpen) return null;

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "520px",
        background: theme.colors.background.primary,
        borderLeft: `1px solid ${theme.colors.border.subtle}20`,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        boxShadow: `
          -8px 0 32px rgba(0, 0, 0, 0.08),
          -2px 0 8px rgba(0, 0, 0, 0.04)
        `,
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        backdropFilter: "blur(20px)",
        overflowY: "auto",
      }}
    >
      {/* 헤더 */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.component.lg} ${theme.spacing.semantic.component.lg} ${theme.spacing.semantic.component.md}`,
          borderBottom: `1px solid ${theme.colors.border.subtle}15`,
          background: `${theme.colors.background.card}60`,
          backdropFilter: "blur(8px)",
        }}
      >
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.md }}
        >
          <Heading size="4" style={{ color: theme.colors.text.primary }}>
            Annotation Details
          </Heading>
          <Button
            onClick={onClose}
            style={{
              background: `${theme.colors.background.secondary}80`,
              border: `1px solid ${theme.colors.border.subtle}30`,
              color: theme.colors.text.secondary,
              cursor: "pointer",
              padding: theme.spacing.semantic.component.sm,
              borderRadius: theme.borders.radius.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              width: "36px",
              height: "36px",
            }}
          >
            <X size={16} />
          </Button>
        </Flex>

        {/* 카테고리 태그 */}
        <Box
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: theme.spacing.semantic.component.xs,
            background: `${HIGHLIGHT_COLOR}20`,
            color: HIGHLIGHT_COLOR,
            padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
            borderRadius: theme.borders.radius.md,
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <Tag size={14} />
          {categoryName}
        </Box>

        {/* 현재 선택된 어노테이션 표시 */}
        <Text
          as="p"
          style={{
            fontSize: "11px",
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.semantic.component.xs,
          }}
        >
          Selected Annotation ID: #{annotation.id}
        </Text>
      </Box>

      {/* 이미지 뷰어 */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.md }}
        >
          <Text
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Image Preview
          </Text>

          {/* 토글 컨트롤 */}
          <Flex gap="2">
            <Button
              onClick={() => setShowBBox(!showBBox)}
              style={{
                background: showBBox
                  ? theme.colors.interactive.primary
                  : theme.colors.background.secondary,
                color: showBBox ? theme.colors.text.inverse : theme.colors.text.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <BoundingBoxIcon size={12} />
              BBox
            </Button>

            <Button
              onClick={() => setShowMask(!showMask)}
              style={{
                background: showMask
                  ? theme.colors.interactive.primary
                  : theme.colors.background.secondary,
                color: showMask ? theme.colors.text.inverse : theme.colors.text.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {showMask ? <EyeSlash size={12} /> : <Eye size={12} />}
              Mask
            </Button>
          </Flex>
        </Flex>

        {/* 이미지 컨테이너 */}
        <Box
          style={{
            position: "relative",
            background: theme.colors.background.secondary,
            borderRadius: theme.borders.radius.md,
            overflow: "hidden",
            border: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          {/* 로딩 상태 표시 */}
          {annotationsLoading && (
            <Box
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: `${theme.colors.background.primary}E6`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "11px",
                color: theme.colors.text.secondary,
                zIndex: 10,
                backdropFilter: "blur(4px)",
              }}
            >
              Loading annotations...
            </Box>
          )}
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />

          {/* SVG 오버레이 */}
          {imageLoaded && (
            <svg
              ref={overlayRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
              viewBox={`0 0 480 ${(480 * image.height) / image.width}`}
            >
              <defs>
                {/* 마스크용 글로우 효과 */}
                <filter id="maskGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* BBox용 대시 패턴 */}
                <pattern id="dashPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                  <rect width="8" height="8" fill="none" />
                  <rect width="4" height="8" fill="rgba(255,255,255,0.3)" />
                </pattern>
              </defs>

              {/* 모든 approved 어노테이션의 세그멘테이션 마스크 */}
              {showMask &&
                annotationsToRender.map((ann: AnnotationClientRead) => {
                  const isSelected = isSelectedAnnotation(ann);
                  const color = isSelected ? HIGHLIGHT_COLOR : OTHER_COLOR;
                  const opacity = isSelected ? 0.4 : 0.2; // 다른 annotation 투명도 감소
                  const strokeWidth = isSelected ? 2.5 : 1.5; // 다른 annotation 선 두께 감소

                  if (!ann.polygon || !(ann.polygon as any).has_segmentation) return null;

                  return (
                    <g key={ann.id}>
                      {(ann.polygon as any).polygons.map((polygon: number[][], index: number) => {
                        const pathData = polygonToPath(polygon);
                        if (!pathData) return null;

                        return (
                          <path
                            key={`${ann.id}-${index}`}
                            d={pathData}
                            fill={`${color}${Math.round(opacity * 255)
                              .toString(16)
                              .padStart(2, "0")}`}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            filter={isSelected ? "url(#maskGlow)" : undefined}
                            style={{
                              transition: "all 0.3s ease",
                              cursor: "pointer",
                            }}
                          />
                        );
                      })}
                    </g>
                  );
                })}

              {/* 모든 approved 어노테이션의 바운딩 박스 */}
              {showBBox &&
                annotationsToRender.map((ann: AnnotationClientRead) => {
                  if (!ann.bbox || ann.bbox.length < 4) return null;

                  const isSelected = isSelectedAnnotation(ann);
                  const color = isSelected ? HIGHLIGHT_COLOR : OTHER_COLOR;
                  const strokeWidth = isSelected ? 2.5 : 1.3; // 다른 annotation bbox 선 두께 감소
                  const opacity = isSelected ? 1 : 0.6; // 다른 annotation bbox 투명도 감소

                  const [x, y, width, height] = ann.bbox;
                  const topLeft = transformCoordinates(x, y);
                  const bottomRight = transformCoordinates(x + width, y + height);
                  const bboxCoords = {
                    x: topLeft.x,
                    y: topLeft.y,
                    width: bottomRight.x - topLeft.x,
                    height: bottomRight.y - topLeft.y,
                  };

                  return (
                    <g key={`bbox-${ann.id}`} opacity={opacity}>
                      {/* BBox 배경 */}
                      <rect
                        x={bboxCoords.x}
                        y={bboxCoords.y}
                        width={bboxCoords.width}
                        height={bboxCoords.height}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isSelected ? "8 4" : "4 2"}
                        rx={4}
                        style={{
                          animation: isSelected ? "dashMove 2s linear infinite" : undefined,
                        }}
                      />

                      {/* 선택된 어노테이션만 코너 마커 표시 */}
                      {isSelected &&
                        [
                          [bboxCoords.x, bboxCoords.y],
                          [bboxCoords.x + bboxCoords.width, bboxCoords.y],
                          [bboxCoords.x, bboxCoords.y + bboxCoords.height],
                          [bboxCoords.x + bboxCoords.width, bboxCoords.y + bboxCoords.height],
                        ].map(([x, y], index) => (
                          <rect
                            key={`corner-${index}`}
                            x={x - 4}
                            y={y - 4}
                            width={8}
                            height={8}
                            fill={color}
                            rx={1}
                          />
                        ))}
                    </g>
                  );
                })}

              {/* CSS 애니메이션 */}
              <style>
                {`
                    @keyframes dashMove {
                      to {
                        stroke-dashoffset: -12;
                      }
                    }
                  `}
              </style>
            </svg>
          )}
        </Box>

        {/* 어노테이션 개수 정보 */}
        {!annotationsLoading && annotationsToRender.length > 0 && (
          <Text
            style={{
              fontSize: "12px",
              color: theme.colors.text.secondary,
              marginTop: theme.spacing.semantic.component.sm,
              textAlign: "center",
            }}
          >
            Showing {annotationsToRender.length} approved annotation
            {annotationsToRender.length > 1 ? "s" : ""}
          </Text>
        )}
      </Box>

      {/* 메타데이터 */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.lg,
        }}
      >
        <Heading
          size="5"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          Metadata
        </Heading>

        <Flex direction="column" gap="4">
          {/* AI 생성 컨텍스트 */}
          <Box>
            <Flex
              align="center"
              gap="2"
              style={{ marginBottom: theme.spacing.semantic.component.xs }}
            >
              <Box
                style={{
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  borderRadius: "50%",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Brain size={12} color="white" />
              </Box>
              <Text
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                }}
              >
                AI CONTEXT ANALYSIS
              </Text>
              <Box
                style={{
                  background: `linear-gradient(45deg, #FFD700, #FFA500)`,
                  borderRadius: "50%",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkle size={8} color="white" />
              </Box>
            </Flex>

            <Box
              style={{
                background: `linear-gradient(135deg, ${theme.colors.background.card}80, ${theme.colors.background.secondary}40)`,
                border: `1px solid ${theme.colors.border.subtle}30`,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.md,
                position: "relative",
              }}
            >
              <Box
                style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: theme.colors.text.primary,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                {parseContextDescription(contextDescription)}
              </Box>

              {/* AI 배지 */}
              <Box
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: `${theme.colors.background.primary}95`,
                  backdropFilter: "blur(8px)",
                  borderRadius: theme.borders.radius.sm,
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: theme.colors.text.tertiary,
                  border: `1px solid ${theme.colors.border.subtle}20`,
                }}
              >
                AI Generated
              </Box>
            </Box>
          </Box>

          {/* 파일 정보 */}
          <Box>
            <Text
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              FILE INFORMATION
            </Text>

            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Info size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Filename
                  </Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {image.file_name}
                </Text>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <ArrowsOut size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Dimensions
                  </Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {image.width} × {image.height}
                </Text>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Calendar size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Created
                  </Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {metadata.createdDate}
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* 어노테이션 정보 */}
          <Box>
            <Text
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              ANNOTATION DETAILS
            </Text>

            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Hash size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>ID</Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  #{annotation.id}
                </Text>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Target size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Confidence
                  </Text>
                </Flex>
                <Box
                  style={{
                    background:
                      metadata.confidence >= 80
                        ? `${theme.colors.status.success}20`
                        : metadata.confidence >= 60
                          ? `${theme.colors.status.warning}20`
                          : `${theme.colors.status.error}20`,
                    color:
                      metadata.confidence >= 80
                        ? theme.colors.status.success
                        : metadata.confidence >= 60
                          ? theme.colors.status.warning
                          : theme.colors.status.error,
                    padding: `2px 6px`,
                    borderRadius: theme.borders.radius.sm,
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {metadata.confidence}%
                </Box>
              </Flex>

              {metadata.area > 0 && (
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <BoundingBoxIcon size={14} style={{ color: theme.colors.text.tertiary }} />
                    <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                      Area
                    </Text>
                  </Flex>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: theme.colors.text.primary,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {metadata.area.toLocaleString()} px²
                  </Text>
                </Flex>
              )}
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* 푸터 액션 */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.lg,
          borderTop: `1px solid ${theme.colors.border.primary}`,
          background: theme.colors.background.secondary,
        }}
      >
        <Button
          style={{
            width: "100%",
            background: theme.colors.interactive.primary,
            color: theme.colors.text.inverse,
            border: "none",
            borderRadius: theme.borders.radius.md,
            padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing.semantic.component.sm,
          }}
          onClick={() => {
            // 이미지 다운로드 로직
            const link = document.createElement("a");
            link.href = image.image_url;
            link.download = image.file_name;
            link.click();
          }}
        >
          <DownloadSimple size={16} />
          Download Image
        </Button>
      </Box>
    </Box>
  );
}
