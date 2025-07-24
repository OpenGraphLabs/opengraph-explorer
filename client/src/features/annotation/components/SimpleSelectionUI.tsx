import React, { useMemo } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Annotation } from "../types/annotation";
import { Check, X, Target } from "phosphor-react";

interface SimpleSelectionUIProps {
  selectedMaskIds: number[];
  annotations: Annotation[];
  hoveredMaskId?: number | null;
  onClearSelection?: () => void;
  onRemoveMask?: (maskId: number) => void;
  className?: string;
}

// 더 선명하고 대비가 좋은 색상 팔레트 (SimpleMaskOverlay와 동일)
const INTUITIVE_COLORS = [
  "#0066FF", "#00CC44", "#FF8800", "#9933FF", 
  "#FF1177", "#00AAFF", "#FFD700", "#FF4455",
];

export function SimpleSelectionUI({
  selectedMaskIds,
  annotations,
  hoveredMaskId,
  onClearSelection,
  onRemoveMask,
  className,
}: SimpleSelectionUIProps) {
  const { theme } = useTheme();

  // 선택된 주석들과 호버된 주석 정보
  const { selectedAnnotations, hoveredAnnotation } = useMemo(() => {
    const selected = annotations.filter(ann => selectedMaskIds.includes(ann.id));
    const hovered = hoveredMaskId ? annotations.find(ann => ann.id === hoveredMaskId) : null;
    
    return {
      selectedAnnotations: selected,
      hoveredAnnotation: hovered,
    };
  }, [annotations, selectedMaskIds, hoveredMaskId]);

  // 마스크의 색상 인덱스 계산
  const getMaskColorIndex = (maskId: number) => {
    return annotations.findIndex(ann => ann.id === maskId);
  };

  if (selectedMaskIds.length === 0 && !hoveredAnnotation) {
    return (
      <Box
        className={className}
        style={{
          background: `${theme.colors.background.card}F5`,
          border: `1px solid ${theme.colors.border.primary}40`,
          borderRadius: theme.borders.radius.lg,
          padding: theme.spacing.semantic.component.md,
          backdropFilter: "blur(8px)",
          textAlign: "center",
        }}
      >
        <Target 
          size={24} 
          style={{ 
            color: theme.colors.text.tertiary, 
            marginBottom: theme.spacing.semantic.component.xs 
          }} 
        />
        <Text
          size="2"
          style={{
            color: theme.colors.text.secondary,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          Click to select masks
        </Text>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      style={{
        background: `${theme.colors.background.card}F8`,
        border: `1px solid ${theme.colors.border.primary}30`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.md,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* 선택된 마스크들 */}
      {selectedMaskIds.length > 0 && (
        <Box style={{ marginBottom: hoveredAnnotation ? theme.spacing.semantic.component.sm : 0 }}>
          <Flex align="center" justify="between" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
            <Text
              size="3"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Selected Masks ({selectedMaskIds.length})
            </Text>
            
            {selectedMaskIds.length > 1 && (
              <Button
                onClick={onClearSelection}
                style={{
                  background: "transparent",
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "all 0.2s ease",
                }}
              >
                <X size={12} />
                Clear All
              </Button>
            )}
          </Flex>

          {/* 선택된 마스크 목록 */}
          <Flex direction="column" gap="2">
            {selectedAnnotations.map((annotation, index) => {
              const colorIndex = getMaskColorIndex(annotation.id);
              const color = INTUITIVE_COLORS[colorIndex % INTUITIVE_COLORS.length];
              const confidence = annotation.stability_score || 0.8;
              
              return (
                <Flex
                  key={annotation.id}
                  align="center"
                  justify="between"
                  style={{
                    background: `${color}08`,
                    border: `1px solid ${color}20`,
                    borderRadius: theme.borders.radius.md,
                    padding: theme.spacing.semantic.component.sm,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Flex align="center" gap="3">
                    {/* 색상 인디케이터 */}
                    <Box
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: color,
                        border: "2px solid white",
                        boxShadow: `0 2px 4px ${color}40`,
                        flexShrink: 0,
                      }}
                    />
                    
                    {/* 마스크 정보 */}
                    <Box>
                      <Text
                        size="2"
                        style={{
                          fontWeight: 600,
                          color: theme.colors.text.primary,
                          marginBottom: "2px",
                        }}
                      >
                        Mask #{index + 1}
                      </Text>
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: "11px",
                        }}
                      >
                        Confidence: {Math.round(confidence * 100)}%
                      </Text>
                    </Box>
                  </Flex>

                  {/* 제거 버튼 */}
                  <Button
                    onClick={() => onRemoveMask?.(annotation.id)}
                    style={{
                      background: "transparent",
                      color: theme.colors.text.tertiary,
                      border: "none",
                      borderRadius: theme.borders.radius.sm,
                      padding: theme.spacing.semantic.component.xs,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                      minWidth: "24px",
                      minHeight: "24px",
                    }}
                  >
                    <X size={14} />
                  </Button>
                </Flex>
              );
            })}
          </Flex>

          {/* 조합 완료 상태 표시 */}
          {selectedMaskIds.length > 1 && (
            <Box
              style={{
                marginTop: theme.spacing.semantic.component.md,
                padding: theme.spacing.semantic.component.sm,
                background: `${theme.colors.status.success}10`,
                border: `1px solid ${theme.colors.status.success}30`,
                borderRadius: theme.borders.radius.md,
                textAlign: "center",
              }}
            >
              <Check 
                size={16} 
                style={{ 
                  color: theme.colors.status.success, 
                  marginRight: "6px" 
                }} 
              />
              <Text
                size="2"
                style={{
                  color: theme.colors.status.success,
                  fontWeight: 500,
                  display: "inline",
                }}
              >
                Mask combination ready
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* 호버된 마스크 미리보기 */}
      {hoveredAnnotation && !selectedMaskIds.includes(hoveredAnnotation.id) && (
        <Box
          style={{
            padding: theme.spacing.semantic.component.sm,
            background: `${theme.colors.background.secondary}80`,
            border: `1px dashed ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.md,
          }}
        >
          <Flex align="center" gap="2">
            <Box
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: INTUITIVE_COLORS[getMaskColorIndex(hoveredAnnotation.id) % INTUITIVE_COLORS.length],
                opacity: 0.7,
              }}
            />
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                fontSize: "11px",
                fontStyle: "italic",
              }}
            >
              Mask preview • Click to select
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );
}

// 간단한 사용 가이드 컴포넌트
interface SimpleGuideProps {
  className?: string;
}

export function SimpleGuide({ className }: SimpleGuideProps) {
  const { theme } = useTheme();

  return (
    <Box
      className={className}
      style={{
        background: `${theme.colors.background.card}F0`,
        border: `1px solid ${theme.colors.border.primary}20`,
        borderRadius: theme.borders.radius.md,
        padding: theme.spacing.semantic.component.sm,
        backdropFilter: "blur(8px)",
      }}
    >
      <Text
        size="1"
        style={{
          color: theme.colors.text.secondary,
          lineHeight: 1.4,
          textAlign: "center",
          fontSize: "11px",
        }}
      >
        💡 <strong>How to use:</strong> Click masks on the image to combine them
      </Text>
    </Box>
  );
}