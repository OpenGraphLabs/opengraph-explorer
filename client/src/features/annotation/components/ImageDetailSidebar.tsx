import React, { useState, useCallback, useEffect, useRef } from "react";
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
  BoundingBox as BoundingBoxIcon
} from "phosphor-react";
import type { AnnotationRead } from "@/shared/api/generated/models";

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

// 세련된 색상 팔레트
const ANNOTATION_COLORS = [
  "#0066FF", "#00CC44", "#FF8800", "#9933FF", 
  "#FF1177", "#00AAFF", "#FFD700", "#FF4455",
];

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
  const drawImageOnCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기를 컨테이너에 맞게 조정
    const containerWidth = 400;
    const aspectRatio = image.height / image.width;
    const containerHeight = containerWidth * aspectRatio;
    
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // 이미지 그리기
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    ctx.drawImage(img, 0, 0, containerWidth, containerHeight);
  }, [image]);

  // SVG 좌표 변환
  const transformCoordinates = useCallback((originalX: number, originalY: number) => {
    const scaleX = 400 / image.width;
    const scaleY = (400 * image.height / image.width) / image.height;
    
    return {
      x: originalX * scaleX,
      y: originalY * scaleY,
    };
  }, [image]);

  // 폴리곤을 SVG path로 변환
  const polygonToPath = useCallback((polygon: number[][]): string => {
    if (polygon.length < 3) return "";
    
    const transformedPoints = polygon.map(([x, y]) => transformCoordinates(x, y));
    
    let path = `M ${transformedPoints[0].x} ${transformedPoints[0].y}`;
    for (let i = 1; i < transformedPoints.length; i++) {
      path += ` L ${transformedPoints[i].x} ${transformedPoints[i].y}`;
    }
    path += " Z";
    
    return path;
  }, [transformCoordinates]);

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

  const color = ANNOTATION_COLORS[0]; // 단일 어노테이션이므로 첫 번째 색상 사용

  if (!isOpen) return null;

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "420px",
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
          <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.md }}>
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
              background: `${color}20`,
              color: color,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              borderRadius: theme.borders.radius.md,
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Tag size={14} />
            {categoryName}
          </Box>
        </Box>

        {/* 이미지 뷰어 */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.md }}>
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
                  background: showBBox ? theme.colors.interactive.primary : theme.colors.background.secondary,
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
                  background: showMask ? theme.colors.interactive.primary : theme.colors.background.secondary,
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
                viewBox={`0 0 400 ${400 * image.height / image.width}`}
              >
                <defs>
                  {/* 마스크용 글로우 효과 */}
                  <filter id="maskGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  {/* BBox용 대시 패턴 */}
                  <pattern id="dashPattern" patternUnits="userSpaceOnUse" width="8" height="8">
                    <rect width="8" height="8" fill="none"/>
                    <rect width="4" height="8" fill="rgba(255,255,255,0.3)"/>
                  </pattern>
                </defs>

                {/* 세그멘테이션 마스크 */}
                {showMask && annotation.polygon && (annotation.polygon as any).has_segmentation && (
                  <g>
                    {(annotation.polygon as any).polygons.map((polygon: number[][], index: number) => {
                      const pathData = polygonToPath(polygon);
                      if (!pathData) return null;

                      return (
                        <path
                          key={index}
                          d={pathData}
                          fill={`${color}30`}
                          stroke={color}
                          strokeWidth={2}
                          filter="url(#maskGlow)"
                          style={{
                            transition: "all 0.3s ease",
                          }}
                        />
                      );
                    })}
                  </g>
                )}

                {/* 바운딩 박스 */}
                {showBBox && (() => {
                  const bboxCoords = getBBoxCoordinates();
                  if (!bboxCoords) return null;

                  return (
                    <g>
                      {/* BBox 배경 */}
                      <rect
                        x={bboxCoords.x}
                        y={bboxCoords.y}
                        width={bboxCoords.width}
                        height={bboxCoords.height}
                        fill="none"
                        stroke={color}
                        strokeWidth={2}
                        strokeDasharray="8 4"
                        rx={4}
                        style={{
                          animation: "dashMove 2s linear infinite",
                        }}
                      />
                      
                      {/* BBox 코너 마커 */}
                      {[
                        [bboxCoords.x, bboxCoords.y],
                        [bboxCoords.x + bboxCoords.width, bboxCoords.y],
                        [bboxCoords.x, bboxCoords.y + bboxCoords.height],
                        [bboxCoords.x + bboxCoords.width, bboxCoords.y + bboxCoords.height],
                      ].map(([x, y], index) => (
                        <rect
                          key={index}
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
                })()}

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
        </Box>

        {/* 메타데이터 */}
        <Box
          style={{
            flex: 1,
            padding: theme.spacing.semantic.component.lg,
            overflowY: "auto",
          }}
        >
          <Heading size="5" style={{ 
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.md 
          }}>
            Metadata
          </Heading>

          <Flex direction="column" gap="4">
            {/* 파일 정보 */}
            <Box>
              <Text style={{ 
                fontSize: "12px", 
                fontWeight: 600, 
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs 
              }}>
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
                  <Text style={{ 
                    fontSize: "13px", 
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace"
                  }}>
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
                  <Text style={{ 
                    fontSize: "13px", 
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace"
                  }}>
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
                  <Text style={{ 
                    fontSize: "13px", 
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace"
                  }}>
                    {metadata.createdDate}
                  </Text>
                </Flex>
              </Flex>
            </Box>

            {/* 어노테이션 정보 */}
            <Box>
              <Text style={{ 
                fontSize: "12px", 
                fontWeight: 600, 
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs 
              }}>
                ANNOTATION DETAILS
              </Text>
              
              <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Hash size={14} style={{ color: theme.colors.text.tertiary }} />
                    <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                      ID
                    </Text>
                  </Flex>
                  <Text style={{ 
                    fontSize: "13px", 
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace"
                  }}>
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
                      background: metadata.confidence >= 80 ? `${theme.colors.status.success}20` : 
                                 metadata.confidence >= 60 ? `${theme.colors.status.warning}20` : 
                                 `${theme.colors.status.error}20`,
                      color: metadata.confidence >= 80 ? theme.colors.status.success : 
                             metadata.confidence >= 60 ? theme.colors.status.warning : 
                             theme.colors.status.error,
                      padding: `2px 6px`,
                      borderRadius: theme.borders.radius.sm,
                      fontSize: "12px",
                      fontWeight: 600,
                      fontFamily: "JetBrains Mono, monospace"
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
                    <Text style={{ 
                      fontSize: "13px", 
                      color: theme.colors.text.primary,
                      fontFamily: "JetBrains Mono, monospace"
                    }}>
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
              const link = document.createElement('a');
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