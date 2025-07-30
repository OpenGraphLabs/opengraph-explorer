import React, { useRef, useCallback, useState } from "react";
import { useTheme } from "@/shared/ui/design-system";
import { Annotation } from "./types/annotation";
import { Point } from "./types/workspace";

interface SimpleMaskOverlayProps {
  annotations: Annotation[];
  selectedMaskIds: number[];
  hoveredMaskId?: number | null;
  zoom: number;
  panOffset: Point;
  imageWidth: number;
  imageHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  onMaskClick?: (maskId: number, event: React.MouseEvent) => void;
  onMaskHover?: (maskId: number | null) => void;
}

// 더 선명하고 대비가 좋은 색상 팔레트
const INTUITIVE_COLORS = [
  "#0066FF", // 진한 블루 - 신뢰감
  "#00CC44", // 생생한 그린 - 성공/안전
  "#FF8800", // 선명한 오렌지 - 주의/활동
  "#9933FF", // 진한 퍼플 - 창의성
  "#FF1177", // 생생한 핑크 - 에너지
  "#00AAFF", // 밝은 블루 - 평온
  "#FFD700", // 골드 옐로우 - 밝음
  "#FF4455", // 선명한 레드 - 강조
];

export function SimpleMaskOverlay({
  annotations,
  selectedMaskIds,
  hoveredMaskId,
  zoom,
  panOffset,
  imageWidth,
  imageHeight,
  canvasWidth,
  canvasHeight,
  onMaskClick,
  onMaskHover,
}: SimpleMaskOverlayProps) {
  const { theme } = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [clickedMaskId, setClickedMaskId] = useState<number | null>(null);

  // 이미지 좌표를 화면 좌표로 변환
  const imageToScreen = useCallback(
    (x: number, y: number): Point => {
      return {
        x: x * zoom + panOffset.x,
        y: y * zoom + panOffset.y,
      };
    },
    [zoom, panOffset]
  );

  // 폴리곤을 SVG path로 변환
  const polygonToPath = useCallback(
    (polygon: number[][]): string => {
      if (polygon.length < 3) return "";

      const screenPoints = polygon.map(([x, y]) => imageToScreen(x, y));

      let path = `M ${screenPoints[0].x} ${screenPoints[0].y}`;
      for (let i = 1; i < screenPoints.length; i++) {
        path += ` L ${screenPoints[i].x} ${screenPoints[i].y}`;
      }
      path += " Z";

      return path;
    },
    [imageToScreen]
  );

  // 마스크 클릭 처리
  const handleMaskClick = useCallback(
    (maskId: number, event: React.MouseEvent) => {
      event.stopPropagation();

      // 클릭 피드백 효과
      setClickedMaskId(maskId);
      setTimeout(() => setClickedMaskId(null), 200);

      onMaskClick?.(maskId, event);
    },
    [onMaskClick]
  );

  // 마스크 호버 처리
  const handleMaskHover = useCallback(
    (maskId: number | null) => {
      onMaskHover?.(maskId);
    },
    [onMaskHover]
  );

  // 마스크 스타일 계산
  const getMaskStyle = useCallback(
    (annotation: Annotation, index: number) => {
      const baseColor = INTUITIVE_COLORS[index % INTUITIVE_COLORS.length];
      const isSelected = selectedMaskIds.includes(annotation.id);
      const isHovered = hoveredMaskId === annotation.id;
      const isClicked = clickedMaskId === annotation.id;

      // 개선된 투명도 - 가시성과 가독성의 균형
      let fillOpacity = 0.15; // 기본 상태에서도 충분히 보이도록
      let strokeOpacity = 0.8; // 테두리 강화
      let strokeWidth = 2.5; // 기본 테두리 두께 증가

      if (isSelected) {
        fillOpacity = 0.35; // 선택된 상태는 더욱 진하게
        strokeOpacity = 1;
        strokeWidth = 4; // 선택된 상태 테두리 더 두껍게
      } else if (isHovered) {
        fillOpacity = 0.25; // 호버 상태도 명확하게
        strokeOpacity = 0.9;
        strokeWidth = 3;
      }

      if (isClicked) {
        fillOpacity = 0.45; // 클릭 순간 가장 진하게
        strokeOpacity = 1;
        strokeWidth = 5;
      }

      // 선택되지 않은 마스크들은 약간 페이드 아웃
      if (selectedMaskIds.length > 0 && !isSelected && !isHovered) {
        fillOpacity *= 0.6; // 선택되지 않은 마스크는 더 연하게
        strokeOpacity *= 0.7;
      }

      return {
        fill: `${baseColor}${Math.round(fillOpacity * 255)
          .toString(16)
          .padStart(2, "0")}`,
        stroke: baseColor,
        strokeWidth: Math.max(strokeWidth / zoom, 1.5), // 최소 테두리 두께 증가
        strokeOpacity,
        filter: isSelected ? "url(#selectedGlow)" : isHovered ? "url(#hoverGlow)" : undefined,
      };
    },
    [selectedMaskIds, hoveredMaskId, clickedMaskId, zoom]
  );

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
      <defs>
        {/* 선택된 마스크용 강화된 글로우 효과 */}
        <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feColorMatrix
            in="coloredBlur"
            type="matrix"
            values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 0.8 0"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 호버 효과용 중간 글로우 */}
        <filter id="hoverGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feColorMatrix
            in="coloredBlur"
            type="matrix"
            values="1 1 1 0 0  1 1 1 0 0  1 1 1 0 0  0 0 0 0.6 0"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 체크마크용 그림자 효과 */}
        <filter id="checkShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>

      {/* 마스크 렌더링 */}
      {annotations.map((annotation, index) => {
        if (!annotation.polygon.has_segmentation) return null;

        const style = getMaskStyle(annotation, index);
        const isInteractive = true; // 모든 마스크가 클릭 가능

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
                  strokeOpacity={style.strokeOpacity}
                  filter={style.filter}
                  style={{
                    pointerEvents: isInteractive ? "visiblePainted" : "none",
                    cursor: isInteractive ? "pointer" : "default",
                    transition: "all 0.15s ease-out",
                  }}
                  onMouseEnter={() => handleMaskHover(annotation.id)}
                  onMouseLeave={() => handleMaskHover(null)}
                  onClick={e => handleMaskClick(annotation.id, e)}
                />
              );
            })}

            {/* 선택된 마스크에 강화된 체크마크 표시 */}
            {selectedMaskIds.includes(annotation.id) &&
              (() => {
                const [centerX, centerY] = annotation.bbox.slice(0, 2);
                const [width, height] = annotation.bbox.slice(2, 4);
                const screenCenter = imageToScreen(centerX + width / 2, centerY + height / 2);
                const checkSize = Math.max(16 / zoom, 12); // 체크마크 크기 증가
                const maskColor = INTUITIVE_COLORS[index % INTUITIVE_COLORS.length];

                return (
                  <g transform={`translate(${screenCenter.x}, ${screenCenter.y})`}>
                    {/* 외곽 링 */}
                    <circle
                      r={checkSize + 2}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth={3}
                      filter="url(#checkShadow)"
                    />

                    {/* 체크마크 배경 */}
                    <circle
                      r={checkSize}
                      fill={maskColor}
                      stroke="rgba(255, 255, 255, 0.95)"
                      strokeWidth={2}
                      filter="url(#checkShadow)"
                    />

                    {/* 체크마크 아이콘 - 더 두껍고 명확하게 */}
                    <path
                      d={`M ${-checkSize / 2.5} ${-1} L ${-checkSize / 6} ${checkSize / 2.5} L ${checkSize / 1.8} ${-checkSize / 1.8}`}
                      stroke="rgba(255, 255, 255, 0.95)"
                      strokeWidth={Math.max(3, 2.5 / zoom)}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      filter="url(#checkShadow)"
                    />

                    {/* 펄스 효과를 위한 외곽 링 */}
                    <circle
                      r={checkSize + 4}
                      fill="none"
                      stroke={maskColor}
                      strokeWidth={1}
                      opacity={0.6}
                      style={{
                        animation: "pulseRing 2s ease-in-out infinite",
                      }}
                    />
                  </g>
                );
              })()}
          </g>
        );
      })}

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes pulseCheck {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes pulseRing {
            0% { 
              opacity: 0.6; 
              transform: scale(1); 
            }
            50% { 
              opacity: 0.3; 
              transform: scale(1.2); 
            }
            100% { 
              opacity: 0.6; 
              transform: scale(1); 
            }
          }
        `}
      </style>
    </svg>
  );
}
