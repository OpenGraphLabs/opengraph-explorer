import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Dialog,
  Grid,
  Separator,
} from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import {
  CheckCircle,
  Users,
  X,
  Tag,
  Hash,
  WarningCircle,
  CheckSquare,
  Clock,
  Cursor,
  Image as ImageIcon,
} from "phosphor-react";
import { ConfirmationStatus } from "../types";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  annotation: string;
  id: string;
}

interface DatasetImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: string | null;
  selectedImageData: any;
  selectedAnnotations: any[];
  selectedImageIndex: number;
  selectedPendingLabels: Set<string>;
  confirmationStatus: ConfirmationStatus;
  onTogglePendingAnnotation: (label: string) => void;
  onConfirmSelectedAnnotations: () => void;
  onCloseModal: () => void;
  getConfirmedLabels: () => Set<string>;
  getAnnotationColor: (index: number) => any;
}

export function DatasetImageModal({
  isOpen,
  onClose,
  selectedImage,
  selectedImageData,
  selectedAnnotations,
  selectedImageIndex,
  selectedPendingLabels,
  confirmationStatus,
  onTogglePendingAnnotation,
  onConfirmSelectedAnnotations,
  getConfirmedLabels,
}: DatasetImageModalProps) {
  const { theme } = useTheme();
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedConfirmedAnnotation, setSelectedConfirmedAnnotation] = useState<string | null>(
    null
  );
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBoundingBox, setCurrentBoundingBox] = useState<BoundingBox | null>(null);
  const [annotationColors, setAnnotationColors] = useState<
    Record<string, { stroke: string; bg: string; text: string }>
  >({});

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const hasConfirmedAnnotations = (item: any): boolean => {
    return item?.annotations && item.annotations.length > 0;
  };

  // Annotation 색상 초기화
  useEffect(() => {
    if (selectedAnnotations.length > 0) {
      const newColors: Record<string, { stroke: string; bg: string; text: string }> = {};
      selectedAnnotations.forEach((annotation, index) => {
        const hue = (360 / selectedAnnotations.length) * index;
        newColors[annotation.label] = {
          stroke: `hsla(${hue}, 80%, 45%, 1)`,
          bg: `hsla(${hue}, 80%, 95%, 1)`,
          text: `hsla(${hue}, 80%, 25%, 1)`,
        };
      });
      setAnnotationColors(newColors);
    }
  }, [selectedAnnotations]);

  const handleDrawingModeToggle = (enabled: boolean) => {
    if (!selectedImageData) return;
    const isConfirmed = hasConfirmedAnnotations(selectedImageData);
    if (!isConfirmed) return;

    setIsDrawingMode(enabled);
    if (!enabled) {
      setBoundingBoxes([]);
      setSelectedConfirmedAnnotation(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedConfirmedAnnotation) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedConfirmedAnnotation || !isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPoint.x;
    const height = y - startPoint.y;

    const box = {
      x: width > 0 ? startPoint.x : x,
      y: height > 0 ? startPoint.y : y,
      width: Math.abs(width),
      height: Math.abs(height),
      annotation: selectedConfirmedAnnotation,
      id: `${selectedConfirmedAnnotation}_${Date.now()}`,
    };

    setCurrentBoundingBox(box);
    redrawCanvas(canvas, ctx);

    const color = annotationColors[selectedConfirmedAnnotation];
    if (color) {
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
    }
  };

  const handleMouseUp = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isDrawing && currentBoundingBox) {
      setBoundingBoxes([...boundingBoxes, currentBoundingBox]);
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentBoundingBox(null);
    }

    redrawCanvas(canvas, ctx);
  };

  const redrawCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.src = selectedImage || "";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      boundingBoxes.forEach(box => {
        const color = annotationColors[box.annotation];
        if (color) {
          ctx.strokeStyle = color.stroke;
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        }
      });
    };
  };

  useEffect(() => {
    if (selectedImage && canvasRef.current && isDrawingMode) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.src = selectedImage;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
    }
  }, [selectedImage, isDrawingMode]);

  const ConfirmationStatusDisplay = () => {
    if (confirmationStatus.status === "idle") return null;

    const getStatusConfig = () => {
      switch (confirmationStatus.status) {
        case "pending":
          return {
            icon: <Clock size={20} />,
            title: "Processing",
            bg: theme.colors.background.secondary,
            border: theme.colors.border.primary,
            text: theme.colors.text.primary,
          };
        case "success":
          return {
            icon: <CheckCircle size={20} weight="fill" />,
            title: "Success",
            bg: theme.colors.status.success + "10",
            border: theme.colors.status.success,
            text: theme.colors.status.success,
          };
        case "failed":
          return {
            icon: <WarningCircle size={20} weight="fill" />,
            title: "Error",
            bg: theme.colors.status.error + "10",
            border: theme.colors.status.error,
            text: theme.colors.status.error,
          };
        default:
          return {
            icon: <Clock size={20} />,
            title: "Processing",
            bg: theme.colors.background.secondary,
            border: theme.colors.border.primary,
            text: theme.colors.text.primary,
          };
      }
    };

    const config = getStatusConfig();

    return (
      <Card
        style={{
          background: config.bg,
          border: `2px solid ${config.border}`,
          borderRadius: theme.borders.radius.md,
          marginBottom: theme.spacing.semantic.component.lg,
          overflow: "hidden",
        }}
      >
        <Box style={{ padding: theme.spacing.semantic.component.lg }}>
          <Flex align="center" gap="3">
            <Box style={{ color: config.text }}>{config.icon}</Box>
            <Flex direction="column" gap="1">
              <Text
                size="3"
                style={{
                  color: config.text,
                  fontWeight: 600,
                }}
              >
                {config.title}
              </Text>
              <Text size="2" style={{ color: theme.colors.text.secondary }}>
                {confirmationStatus.message}
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Card>
    );
  };

  if (!selectedImage || !selectedImageData) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content
        style={{
          maxWidth: "1400px",
          maxHeight: "95vh",
          padding: 0,
          borderRadius: theme.borders.radius.lg,
          overflow: "hidden",
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Dialog.Title className="visually-hidden">Dataset Image Analysis</Dialog.Title>

        {/* Header */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.lg,
            background: theme.colors.background.secondary,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Flex align="center" justify="between">
            <Flex align="center" gap="3">
              <ImageIcon size={20} style={{ color: theme.colors.text.primary }} />
              <Box>
                <Text
                  size="4"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  Image Analysis
                </Text>
                <Flex align="center" gap="2" style={{ marginTop: "2px" }}>
                  <Hash size={12} style={{ color: theme.colors.text.tertiary }} />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedImageData.blobId?.slice(0, 12) || "loading..."}
                  </Text>
                </Flex>
              </Box>
            </Flex>

            <Flex align="center" gap="2">
              <Badge
                style={{
                  background: theme.colors.background.primary,
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  fontSize: "11px",
                  fontWeight: 500,
                  padding: "4px 8px",
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                Item {selectedImageIndex + 1}
              </Badge>

              <Box
                style={{
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: theme.borders.radius.sm,
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={onClose}
                className="close-button"
              >
                <X size={16} style={{ color: theme.colors.text.secondary }} />
              </Box>
            </Flex>
          </Flex>
        </Box>

        <Grid columns="2" style={{ height: "calc(95vh - 80px)" }}>
          {/* 왼쪽: 이미지 뷰 */}
          <Box
            style={{
              background: theme.colors.background.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              borderRight: `1px solid ${theme.colors.border.primary}`,
            }}
          >
            {!isDrawingMode ? (
              <Box
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={selectedImage}
                  alt="Dataset Image Analysis"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: theme.borders.radius.sm,
                  }}
                />
                {hasConfirmedAnnotations(selectedImageData) && (
                  <Box
                    style={{
                      position: "absolute",
                      bottom: theme.spacing.semantic.component.lg,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: theme.colors.background.card,
                      border: `1px solid ${theme.colors.border.primary}`,
                      color: theme.colors.text.primary,
                      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                      borderRadius: theme.borders.radius.md,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      boxShadow: theme.shadows.semantic.card.medium,
                    }}
                    onClick={() => handleDrawingModeToggle(true)}
                    className="annotation-trigger"
                  >
                    <Flex align="center" gap="2">
                      <Cursor size={14} />
                      <Text size="2" style={{ fontWeight: 500 }}>
                        Click to Draw Bounding Boxes
                      </Text>
                    </Flex>
                  </Box>
                )}
              </Box>
            ) : (
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  cursor: selectedConfirmedAnnotation ? "crosshair" : "default",
                  borderRadius: theme.borders.radius.sm,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              />
            )}
          </Box>

          {/* 오른쪽: 어노테이션 패널 */}
          <Box
            style={{
              background: theme.colors.background.card,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              style={{
                padding: theme.spacing.semantic.component.lg,
                flexGrow: 1,
              }}
            >
              <ConfirmationStatusDisplay />

              {/* Confirmed Annotations */}
              <Box style={{ marginBottom: theme.spacing.semantic.component.xl }}>
                <Flex
                  align="center"
                  gap="2"
                  style={{ marginBottom: theme.spacing.semantic.component.md }}
                >
                  <CheckCircle
                    size={18}
                    style={{ color: theme.colors.status.success }}
                    weight="fill"
                  />
                  <Text
                    size="4"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Verified Annotations
                  </Text>
                  <Badge
                    style={{
                      background: theme.colors.status.success + "20",
                      color: theme.colors.status.success,
                      border: `1px solid ${theme.colors.status.success}40`,
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: theme.borders.radius.sm,
                    }}
                  >
                    {selectedAnnotations.length}
                  </Badge>
                </Flex>

                {selectedAnnotations.length > 0 ? (
                  <Box>
                    {selectedAnnotations.map((annotation, index) => {
                      const color = annotationColors[annotation.label] || {
                        stroke: theme.colors.text.secondary,
                        bg: theme.colors.background.secondary,
                        text: theme.colors.text.primary,
                      };
                      const isSelected = selectedConfirmedAnnotation === annotation.label;

                      return (
                        <Box
                          key={index}
                          style={{
                            background: isSelected ? color.bg : theme.colors.background.primary,
                            border: `2px solid ${isSelected ? color.stroke : theme.colors.border.primary}`,
                            borderRadius: theme.borders.radius.sm,
                            padding: theme.spacing.semantic.component.sm,
                            cursor: isDrawingMode ? "pointer" : "default",
                            transition: "all 0.2s ease",
                            marginBottom: theme.spacing.semantic.component.sm,
                          }}
                          onClick={() => {
                            if (isDrawingMode) {
                              setSelectedConfirmedAnnotation(isSelected ? null : annotation.label);
                            }
                          }}
                          className="annotation-item"
                        >
                          <Flex align="center" gap="2">
                            <Box
                              style={{
                                width: "12px",
                                height: "12px",
                                background: color.stroke,
                                borderRadius: theme.borders.radius.sm,
                              }}
                            />
                            <Text
                              size="2"
                              style={{
                                color: theme.colors.text.primary,
                                fontWeight: 500,
                              }}
                            >
                              {annotation.label}
                            </Text>
                            {isSelected && isDrawingMode && (
                              <CheckSquare
                                size={14}
                                style={{ color: color.stroke }}
                                weight="fill"
                              />
                            )}
                          </Flex>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box
                    style={{
                      padding: theme.spacing.semantic.component.lg,
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.md,
                      border: `2px dashed ${theme.colors.border.secondary}`,
                      textAlign: "center",
                    }}
                  >
                    <Text size="2" style={{ color: theme.colors.text.secondary }}>
                      No verified annotations yet
                    </Text>
                  </Box>
                )}
              </Box>

              <Separator
                size="4"
                style={{
                  background: theme.colors.border.primary,
                  margin: `${theme.spacing.semantic.component.lg} 0`,
                }}
              />

              {/* Pending Annotations */}
              <Box>
                <Flex
                  align="center"
                  gap="2"
                  style={{ marginBottom: theme.spacing.semantic.component.md }}
                >
                  <Users size={18} style={{ color: theme.colors.status.warning }} weight="fill" />
                  <Text
                    size="4"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    Pending Annotations
                  </Text>
                  <Badge
                    style={{
                      background: theme.colors.status.warning + "20",
                      color: theme.colors.status.warning,
                      border: `1px solid ${theme.colors.status.warning}40`,
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: theme.borders.radius.sm,
                    }}
                  >
                    {selectedImageData?.pendingAnnotationStats?.length || 0}
                  </Badge>
                </Flex>

                {selectedImageData?.pendingAnnotationStats?.length > 0 ? (
                  <Box>
                    {selectedImageData.pendingAnnotationStats
                      .sort((a: any, b: any) => b.count - a.count)
                      .map((stat: any, index: number) => {
                        const isSelected = selectedPendingLabels.has(stat.label);
                        const confirmedLabels = getConfirmedLabels();
                        const isAlreadyConfirmed = confirmedLabels.has(stat.label);

                        return (
                          <Box
                            key={index}
                            style={{
                              background: isSelected
                                ? theme.colors.status.warning + "10"
                                : isAlreadyConfirmed
                                  ? theme.colors.background.secondary
                                  : theme.colors.background.primary,
                              border: `2px solid ${
                                isSelected
                                  ? theme.colors.status.warning
                                  : isAlreadyConfirmed
                                    ? theme.colors.border.secondary
                                    : theme.colors.border.primary
                              }`,
                              borderRadius: theme.borders.radius.sm,
                              padding: theme.spacing.semantic.component.sm,
                              cursor: isAlreadyConfirmed ? "not-allowed" : "pointer",
                              transition: "all 0.2s ease",
                              marginBottom: theme.spacing.semantic.component.sm,
                              opacity: isAlreadyConfirmed ? 0.6 : 1,
                            }}
                            onClick={() =>
                              !isAlreadyConfirmed && onTogglePendingAnnotation(stat.label)
                            }
                            className="pending-annotation-item"
                          >
                            <Flex align="center" justify="between">
                              <Flex align="center" gap="2">
                                <Tag
                                  size={14}
                                  style={{
                                    color: isAlreadyConfirmed
                                      ? theme.colors.text.tertiary
                                      : theme.colors.text.secondary,
                                  }}
                                />
                                <Text
                                  size="2"
                                  style={{
                                    color: isAlreadyConfirmed
                                      ? theme.colors.text.tertiary
                                      : theme.colors.text.primary,
                                    fontWeight: 500,
                                  }}
                                >
                                  {stat.label}
                                </Text>
                                {isAlreadyConfirmed && (
                                  <Badge
                                    style={{
                                      background: theme.colors.status.success + "20",
                                      color: theme.colors.status.success,
                                      fontSize: "9px",
                                      fontWeight: 600,
                                      padding: "2px 4px",
                                      borderRadius: theme.borders.radius.sm,
                                    }}
                                  >
                                    CONFIRMED
                                  </Badge>
                                )}
                              </Flex>
                              <Flex align="center" gap="2">
                                <Badge
                                  style={{
                                    background: theme.colors.background.secondary,
                                    color: theme.colors.text.secondary,
                                    fontSize: "10px",
                                    fontWeight: 600,
                                    padding: "2px 6px",
                                    borderRadius: theme.borders.radius.sm,
                                    fontFeatureSettings: '"tnum"',
                                  }}
                                >
                                  {stat.count}
                                </Badge>
                                {isSelected && !isAlreadyConfirmed && (
                                  <CheckSquare
                                    size={14}
                                    style={{ color: theme.colors.status.warning }}
                                    weight="fill"
                                  />
                                )}
                              </Flex>
                            </Flex>
                          </Box>
                        );
                      })}
                  </Box>
                ) : (
                  <Box
                    style={{
                      padding: theme.spacing.semantic.component.lg,
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.md,
                      border: `2px dashed ${theme.colors.border.secondary}`,
                      textAlign: "center",
                    }}
                  >
                    <Text size="2" style={{ color: theme.colors.text.secondary }}>
                      No pending annotations
                    </Text>
                  </Box>
                )}

                {/* Action Button */}
                {selectedPendingLabels.size > 0 && (
                  <Box style={{ marginTop: theme.spacing.semantic.component.lg }}>
                    <Box
                      style={{
                        background:
                          confirmationStatus.status === "pending"
                            ? theme.colors.background.secondary
                            : theme.colors.status.warning,
                        color:
                          confirmationStatus.status === "pending"
                            ? theme.colors.text.secondary
                            : "white",
                        border: `1px solid ${theme.colors.status.warning}`,
                        borderRadius: theme.borders.radius.md,
                        padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                        cursor: confirmationStatus.status === "pending" ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: "14px",
                      }}
                      onClick={
                        confirmationStatus.status === "pending"
                          ? undefined
                          : onConfirmSelectedAnnotations
                      }
                      className="confirm-button"
                    >
                      {confirmationStatus.status === "pending" ? (
                        <Flex align="center" justify="center" gap="2">
                          <Box
                            style={{
                              width: "12px",
                              height: "12px",
                              border: "2px solid transparent",
                              borderTop: `2px solid ${theme.colors.text.secondary}`,
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                          Processing...
                        </Flex>
                      ) : (
                        `Confirm ${selectedPendingLabels.size} annotation(s) on blockchain`
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Grid>

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .close-button:hover {
              background: ${theme.colors.background.secondary} !important;
              transform: scale(1.05);
            }
            
            .annotation-trigger:hover {
              background: ${theme.colors.background.secondary} !important;
              transform: translateX(-50%) translateY(-2px);
              box-shadow: ${theme.shadows.semantic.card.high} !important;
            }
            
            .annotation-item:hover {
              transform: translateY(-1px);
              box-shadow: ${theme.shadows.semantic.card.low} !important;
            }
            
            .pending-annotation-item:hover:not([style*="cursor: not-allowed"]) {
              transform: translateY(-1px);
              box-shadow: ${theme.shadows.semantic.card.low} !important;
            }
            
            .confirm-button:hover:not([style*="cursor: not-allowed"]) {
              background: ${theme.colors.status.warning}dd !important;
              transform: translateY(-1px);
              box-shadow: ${theme.shadows.semantic.card.medium} !important;
            }
          `}
        </style>
      </Dialog.Content>
    </Dialog.Root>
  );
}
