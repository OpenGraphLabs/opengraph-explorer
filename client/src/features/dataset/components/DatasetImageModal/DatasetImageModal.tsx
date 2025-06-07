import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Card,
  Heading,
  Dialog,
  Grid,
  Separator,
} from "@radix-ui/themes";
import { CheckCircle, Users } from "phosphor-react";
import { ConfirmationStatus } from "../../types";
import { getAnnotationColor } from "../../utils";

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
  onCloseModal,
  getConfirmedLabels,
  getAnnotationColor,
}: DatasetImageModalProps) {
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [selectedConfirmedAnnotation, setSelectedConfirmedAnnotation] = useState<string | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBoundingBox, setCurrentBoundingBox] = useState<BoundingBox | null>(null);
  const [annotationColors, setAnnotationColors] = useState<Record<string, { stroke: string, bg: string, text: string }>>({});
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 확정된 annotation이 있는지 확인
  const hasConfirmedAnnotations = (item: any): boolean => {
    return item?.annotations && item.annotations.length > 0;
  };

  // Annotation 색상 초기화
  useEffect(() => {
    if (selectedAnnotations.length > 0) {
      const newColors: Record<string, { stroke: string, bg: string, text: string }> = {};
      selectedAnnotations.forEach((annotation, index) => {
        const hue = (360 / selectedAnnotations.length) * index;
        newColors[annotation.label] = {
          stroke: `hsla(${hue}, 80%, 45%, 1)`,
          bg: `hsla(${hue}, 80%, 95%, 1)`,
          text: `hsla(${hue}, 80%, 25%, 1)`
        };
      });
      setAnnotationColors(newColors);
    }
  }, [selectedAnnotations]);

  // 드로잉 모드 토글
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

  // 마우스 이벤트 핸들러들
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
    const ctx = canvas.getContext('2d');
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
      id: `${selectedConfirmedAnnotation}_${Date.now()}`
    };

    setCurrentBoundingBox(box);
    redrawCanvas(canvas, ctx);

    // Draw current box
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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isDrawing && currentBoundingBox) {
      setBoundingBoxes([...boundingBoxes, currentBoundingBox]);
      setIsDrawing(false);
      setStartPoint(null);
      setCurrentBoundingBox(null);
    }

    redrawCanvas(canvas, ctx);
  };

  // 캔버스 다시 그리기
  const redrawCanvas = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const img = new Image();
    img.src = selectedImage || '';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Draw all boxes
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

  // 캔버스 초기화
  useEffect(() => {
    if (selectedImage && canvasRef.current && isDrawingMode) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = selectedImage;
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        redrawCanvas(canvas, ctx);
      };
    }
  }, [selectedImage, isDrawingMode, boundingBoxes, annotationColors]);

  // 바운딩박스 클리어
  const clearBoundingBoxes = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setBoundingBoxes([]);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = selectedImage || '';
    img.onload = () => ctx.drawImage(img, 0, 0);
  };

  // 실행 취소
  const handleUndo = () => {
    if (boundingBoxes.length > 0) {
      const newBoxes = boundingBoxes.slice(0, -1);
      setBoundingBoxes(newBoxes);
      
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          redrawCanvas(canvas, ctx);
        }
      }
    }
  };

  // 확인 상태 표시 컴포넌트
  const ConfirmationStatusDisplay = () => {
    if (confirmationStatus.status === 'idle') return null;

    const getStatusConfig = () => {
      switch (confirmationStatus.status) {
        case 'pending':
          return {
            bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: 'var(--blue-6)',
            text: 'var(--blue-11)',
            icon: '⏳',
            title: 'Confirming Annotations'
          };
        case 'success':
          return {
            bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: 'var(--green-6)',
            text: 'var(--green-11)',
            icon: '✅',
            title: 'Confirmation Successful'
          };
        case 'failed':
          return {
            bg: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
            border: 'var(--red-6)',
            text: 'var(--red-11)',
            icon: '❌',
            title: 'Confirmation Failed'
          };
        default:
          return {
            bg: 'var(--gray-2)',
            border: 'var(--gray-6)',
            text: 'var(--gray-11)',
            icon: 'ℹ️',
            title: 'Status'
          };
      }
    };

    const config = getStatusConfig();

    return (
      <Card
        style={{
          background: config.bg,
          border: `2px solid ${config.border}`,
          padding: "20px",
          borderRadius: "16px",
          marginBottom: "20px",
        }}
      >
        <Flex align="center" gap="4">
          <Box style={{ fontSize: "24px" }}>
            {config.icon}
          </Box>
          <Flex direction="column" gap="2">
            <Heading size="4" style={{ color: config.text }}>
              {config.title}
            </Heading>
            <Text size="3" style={{ color: config.text }}>
              {confirmationStatus.message}
            </Text>
          </Flex>
        </Flex>
      </Card>
    );
  };

  if (!selectedImage || !selectedImageData) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ 
        maxWidth: "1200px", 
        maxHeight: "95vh", 
        padding: "0",
        borderRadius: "16px",
        overflow: "hidden",
      }}>
        <Dialog.Title className="visually-hidden">
          Image Analysis
        </Dialog.Title>
        
        <Grid columns="2" style={{ height: "90vh" }}>
          {/* 왼쪽: 이미지 뷰 */}
          <Box style={{ 
            background: "var(--gray-2)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            position: "relative",
          }}>
            {!isDrawingMode ? (
              <Box style={{ width: "100%", height: "100%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src={selectedImage}
                  alt="Dataset Image Analysis"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
                {hasConfirmedAnnotations(selectedImageData) && (
                  <Box 
                    style={{
                      position: "absolute",
                      bottom: "24px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0, 0, 0, 0.85)",
                      color: "white",
                      padding: "12px 20px",
                      borderRadius: "12px",
                      cursor: "pointer",
                    }}
                    onClick={() => handleDrawingModeToggle(true)}
                  >
                    Click to Draw Bounding Boxes
                  </Box>
                )}
              </Box>
            ) : (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  cursor: "crosshair",
                }}
              />
            )}
            
            {/* 이미지 정보 오버레이 */}
            <Box style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(8px)",
              color: "white",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "500",
              zIndex: 3
            }}>
              {isDrawingMode ? "Drawing Mode - Click and drag to draw boxes" : `Image #${selectedImageIndex + 1}`}
            </Box>
          </Box>

          {/* 오른쪽: Annotation 패널 */}
          <Box style={{ background: "white", display: "flex", flexDirection: "column", height: "90vh" }}>
            <Box style={{ flex: 1, padding: "24px", overflowY: "auto" }}>
              <Flex direction="column" gap="6">
                {/* 헤더 */}
                <Flex align="center" justify="between">
                  <Heading size="6">Image Analysis</Heading>
                  <Button variant="ghost" onClick={onCloseModal}>✕</Button>
                </Flex>

                <Separator size="4" />

                {/* 확정된 Annotations */}
                <Flex direction="column" gap="4">
                  <Flex align="center" gap="2">
                    <CheckCircle size={20} style={{ color: "var(--green-9)" }} weight="fill" />
                    <Heading size="4">Confirmed Annotations</Heading>
                    <Badge>{selectedAnnotations.length} confirmed</Badge>
                  </Flex>

                  {selectedAnnotations.length > 0 ? (
                    <Grid columns="2" gap="2">
                      {selectedAnnotations.map((annotation, index) => {
                        const color = annotationColors[annotation.label] || { stroke: "var(--gray-8)", bg: "var(--gray-3)", text: "var(--gray-11)" };
                        const isSelected = selectedConfirmedAnnotation === annotation.label;
                        
                        return (
                          <Card 
                            key={index} 
                            style={{
                              background: isSelected ? color.bg : "white",
                              border: `2px solid ${isSelected ? color.stroke : "var(--gray-4)"}`,
                              padding: "12px",
                              cursor: isDrawingMode ? "pointer" : "default",
                            }}
                            onClick={() => {
                              if (isDrawingMode) {
                                setSelectedConfirmedAnnotation(isSelected ? null : annotation.label);
                              }
                            }}
                          >
                            <Flex align="center" gap="2">
                              <Box
                                style={{
                                  width: "12px",
                                  height: "12px",
                                  background: color.stroke,
                                }}
                              />
                              <Text>{annotation.label}</Text>
                            </Flex>
                          </Card>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Text>No confirmed annotations yet</Text>
                  )}
                </Flex>

                <Separator size="4" />

                {/* Pending Annotations */}
                <Flex direction="column" gap="4">
                  <Flex align="center" gap="2">
                    <Users size={20} style={{ color: "var(--blue-9)" }} weight="fill" />
                    <Heading size="4">Pending Annotations</Heading>
                  </Flex>

                  {selectedImageData?.pendingAnnotationStats?.length > 0 ? (
                    <Flex direction="column" gap="3">
                      {selectedImageData.pendingAnnotationStats
                        .sort((a: any, b: any) => b.count - a.count)
                        .map((stat: any, index: number) => {
                          const isSelected = selectedPendingLabels.has(stat.label);
                          const confirmedLabels = getConfirmedLabels();
                          const isAlreadyConfirmed = confirmedLabels.has(stat.label);
                          
                          return (
                            <Card 
                              key={stat.label} 
                              style={{
                                padding: "16px",
                                border: isSelected ? "2px solid var(--green-6)" : "1px solid var(--gray-4)",
                                background: isSelected ? "var(--green-3)" : "white",
                                cursor: isAlreadyConfirmed ? "not-allowed" : "pointer",
                                opacity: isAlreadyConfirmed ? 0.6 : 1,
                              }}
                              onClick={() => !isAlreadyConfirmed && onTogglePendingAnnotation(stat.label)}
                            >
                              <Flex direction="column" gap="2">
                                <Flex align="center" justify="between">
                                  <Text weight="bold">{stat.label}</Text>
                                  <Text size="2">{stat.count} votes</Text>
                                </Flex>
                                {isAlreadyConfirmed && (
                                  <Badge>CONFIRMED</Badge>
                                )}
                                {isSelected && !isAlreadyConfirmed && (
                                  <Badge color="green">SELECTED</Badge>
                                )}
                              </Flex>
                            </Card>
                          );
                        })}
                    </Flex>
                  ) : (
                    <Text>No pending annotations</Text>
                  )}
                </Flex>
              </Flex>
            </Box>

            {/* 하단 액션 버튼 */}
            <Box style={{ borderTop: "1px solid var(--gray-6)", padding: "20px" }}>
              <ConfirmationStatusDisplay />
              
              {selectedPendingLabels.size > 0 && (
                <Card style={{ padding: "12px", marginBottom: "16px", background: "var(--green-2)" }}>
                  <Text>{selectedPendingLabels.size} annotation(s) selected for confirmation</Text>
                </Card>
              )}
              
              <Flex gap="3">
                <Button variant="soft" style={{ flex: 1 }} onClick={onCloseModal}>
                  Close
                </Button>
                <Button
                  disabled={selectedPendingLabels.size === 0}
                  style={{ flex: 1 }}
                  onClick={onConfirmSelectedAnnotations}
                >
                  Confirm ({selectedPendingLabels.size})
                </Button>
              </Flex>
            </Box>
          </Box>
        </Grid>

        {/* 드로잉 모드 컨트롤 */}
        {isDrawingMode && (
          <Box style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            right: "24px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "16px",
            borderRadius: "12px",
          }}>
            <Flex gap="3" align="center" justify="between">
              <Flex align="center" gap="3">
                {selectedConfirmedAnnotation ? (
                  <Badge>Drawing: {selectedConfirmedAnnotation} ({boundingBoxes.length} boxes)</Badge>
                ) : (
                  <Badge color="orange">Please select an annotation first</Badge>
                )}
                {boundingBoxes.length > 0 && (
                  <Flex gap="2">
                    <Button size="2" variant="soft" color="red" onClick={clearBoundingBoxes}>
                      Clear All
                    </Button>
                    <Button size="2" variant="soft" onClick={handleUndo}>
                      Undo
                    </Button>
                  </Flex>
                )}
              </Flex>
              <Flex gap="3">
                <Button variant="soft" onClick={() => handleDrawingModeToggle(false)}>
                  Cancel
                </Button>
                <Button disabled={!selectedConfirmedAnnotation || boundingBoxes.length === 0}>
                  Save Boxes
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}

        <style>
          {`
            .visually-hidden {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border: 0;
            }
          `}
        </style>
      </Dialog.Content>
    </Dialog.Root>
  );
} 