import { useRef, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Badge,
  Grid,
  Button,
  Dialog,
  Separator,
} from "@radix-ui/themes";
import { CheckCircle } from "phosphor-react";
import { DataObject, AnnotationObject } from "../services/datasetGraphQLService";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: string | null;
  selectedImageData: DataObject | null;
  selectedImageIndex: number;
  selectedAnnotations: AnnotationObject[];
  isDrawingMode: boolean;
  setIsDrawingMode: (mode: boolean) => void;
  boundingBoxes: BoundingBox[];
  setBoundingBoxes: (boxes: BoundingBox[]) => void;
}

export function ImageAnalysisModal({
  isOpen,
  onClose,
  selectedImage,
  selectedImageData,
  selectedImageIndex,
  selectedAnnotations,
  isDrawingMode,
  setIsDrawingMode,
  boundingBoxes,
  setBoundingBoxes,
}: ImageAnalysisModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBoundingBox, setCurrentBoundingBox] = useState<BoundingBox | null>(null);

  // Function to check if image is verified
  const isImageVerified = (item: DataObject): boolean => {
    return item.annotations.some(annotation => 
      annotation.label.toLowerCase() === "verified" || 
      annotation.label.toLowerCase().includes("verified")
    );
  };

  // Function to handle verified image click
  const handleVerifiedImageClick = () => {
    if (!selectedImageData || !isImageVerified(selectedImageData)) return;
    setIsDrawingMode(true);
    setBoundingBoxes([]);
  };

  // Function to draw bounding box on canvas
  const drawBoundingBox = (ctx: CanvasRenderingContext2D, box: BoundingBox, isTemp: boolean = false) => {
    ctx.strokeStyle = isTemp ? 'rgba(255, 87, 51, 0.8)' : 'rgb(255, 87, 51)';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  };

  // Mouse event handlers for drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = x - startPoint.x;
    const height = y - startPoint.y;

    const box = {
      x: width > 0 ? startPoint.x : x,
      y: height > 0 ? startPoint.y : y,
      width: Math.abs(width),
      height: Math.abs(height)
    };

    setCurrentBoundingBox(box);

    // Redraw all boxes
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      boundingBoxes.forEach(box => drawBoundingBox(ctx, box));
      drawBoundingBox(ctx, box, true);
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBoundingBox) return;
    
    setBoundingBoxes([...boundingBoxes, currentBoundingBox]);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBoundingBox(null);
  };

  // Initialize canvas when image loads
  useEffect(() => {
    if (selectedImageData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = selectedImage || '';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        boundingBoxes.forEach(box => drawBoundingBox(ctx, box));
      };
    }
  }, [selectedImage, boundingBoxes]);

  if (!selectedImage || !selectedImageData) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ 
        maxWidth: "1200px", 
        maxHeight: "95vh", 
        padding: "0",
        borderRadius: "16px",
        overflow: "hidden",
        background: "white",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
      }}>
        <Grid columns="2" style={{ height: "90vh" }}>
          {/* Left: Image View */}
          <Box 
            className={isImageVerified(selectedImageData) ? "image-container verified" : "image-container"}
            style={{ 
              background: "var(--gray-2)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              position: "relative",
              cursor: isImageVerified(selectedImageData) ? "pointer" : "default",
            }}
            onClick={isImageVerified(selectedImageData) ? handleVerifiedImageClick : undefined}
          >
            {!isDrawingMode ? (
              <img
                src={selectedImage}
                alt="Dataset Image Analysis"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "0",
                }}
              />
            ) : (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain"
                }}
              />
            )}
            {/* Image Info Overlay */}
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
              fontWeight: "500"
            }}>
              {isDrawingMode ? "Drawing Mode - Click and drag to draw boxes" : `Image #${selectedImageIndex + 1}`}
            </Box>
            {isImageVerified(selectedImageData) && !isDrawingMode && (
              <Box 
                className="click-overlay"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(8px)",
                  color: "white",
                  padding: "16px 24px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "500",
                  textAlign: "center",
                  opacity: 0,
                  transition: "opacity 0.2s ease",
                  pointerEvents: "none",
                }}
              >
                Click to Draw Bounding Boxes
              </Box>
            )}
          </Box>

          {/* Right: Annotation Analysis Panel */}
          <Box style={{ 
            background: "white",
            display: "flex",
            flexDirection: "column",
            height: "90vh",
            minHeight: 0,
          }}>
            <Box style={{
              flex: 1,
              padding: "24px 24px 0 24px",
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              <Flex direction="column" gap="6">
                {/* Header */}
                <Flex direction="column" gap="3">
                  <Flex align="center" justify="between">
                    <Heading size="6" style={{ fontWeight: 700 }}>
                      Image Analysis
                    </Heading>
                    <Button
                      variant="ghost"
                      size="2"
                      onClick={onClose}
                      style={{
                        borderRadius: "8px",
                        color: "var(--gray-11)",
                      }}
                    >
                      ✕
                    </Button>
                  </Flex>
                  <Text size="3" style={{ color: "var(--gray-11)", lineHeight: "1.5" }}>
                    Analyze and annotate this image
                  </Text>
                </Flex>

                <Separator size="4" />

                {/* Confirmed Annotations */}
                <Flex direction="column" gap="4">
                  <Flex align="center" gap="2">
                    <CheckCircle size={20} style={{ color: "var(--green-9)" }} weight="fill" />
                    <Heading size="4" style={{ fontWeight: 600, color: "var(--green-11)" }}>
                      Confirmed Annotations
                    </Heading>
                    <Badge style={{
                      background: "var(--green-3)",
                      color: "var(--green-11)",
                      fontSize: "11px",
                      fontWeight: "600"
                    }}>
                      {selectedAnnotations.length} confirmed
                    </Badge>
                  </Flex>

                  {selectedAnnotations.length > 0 ? (
                    <Grid columns="2" gap="2">
                      {selectedAnnotations.map((annotation, index) => (
                        <Card key={index} style={{
                          background: "linear-gradient(135deg, var(--green-2) 0%, var(--green-3) 100%)",
                          border: "2px solid var(--green-6)",
                          padding: "12px",
                          borderRadius: "8px",
                          transition: "all 0.2s ease",
                        }}>
                          <Flex align="center" gap="2">
                            <CheckCircle size={16} style={{ color: "var(--green-9)" }} weight="fill" />
                            <Text size="2" style={{ 
                              color: "var(--green-11)", 
                              fontWeight: 600 
                            }}>
                              {annotation.label}
                            </Text>
                            <Badge style={{
                              background: "var(--green-9)",
                              color: "white",
                              fontSize: "9px",
                              fontWeight: "600",
                              padding: "2px 4px",
                              marginLeft: "auto"
                            }}>
                              VERIFIED
                            </Badge>
                          </Flex>
                        </Card>
                      ))}
                    </Grid>
                  ) : (
                    <Card style={{
                      padding: "20px",
                      background: "var(--gray-2)",
                      border: "1px dashed var(--gray-6)",
                      borderRadius: "12px",
                      textAlign: "center"
                    }}>
                      <Flex direction="column" align="center" gap="2">
                        <CheckCircle size={28} style={{ color: "var(--gray-8)" }} weight="thin" />
                        <Text size="2" style={{ color: "var(--gray-11)", fontWeight: 500 }}>
                          No confirmed annotations yet
                        </Text>
                        <Text size="1" style={{ color: "var(--gray-10)" }}>
                          Promote pending annotations to confirmed annotations
                        </Text>
                      </Flex>
                    </Card>
                  )}
                </Flex>
              </Flex>
            </Box>
          </Box>
        </Grid>

        {/* Drawing mode controls */}
        {isDrawingMode && (
          <Box style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            right: "24px",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.1)",
          }}>
            <Flex gap="3" align="center" justify="between">
              <Flex align="center" gap="3">
                <Badge style={{
                  background: "var(--green-3)",
                  color: "var(--green-11)",
                  padding: "4px 8px",
                }}>
                  {boundingBoxes.length} boxes drawn
                </Badge>
                {boundingBoxes.length > 0 && (
                  <Button 
                    size="2" 
                    variant="soft" 
                    color="red"
                    onClick={() => setBoundingBoxes([])}
                  >
                    Clear All
                  </Button>
                )}
              </Flex>
              <Flex gap="3">
                <Button 
                  variant="soft" 
                  color="gray"
                  onClick={() => setIsDrawingMode(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="solid" 
                  style={{
                    background: "var(--green-9)",
                    color: "white",
                  }}
                >
                  Save Boxes
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
} 