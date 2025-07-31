import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { Box, Text, Button, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useImagesContext } from "@/contexts/data/ImagesContext";
import { useTrajectoryWorkspace } from "@/contexts/page/TrajectoryWorkspaceContext";
import { useApprovedAnnotationsByImage } from "@/shared/hooks/useApiQuery";
import { HandGrabbing, ArrowRight, CheckCircle, Eye, EyeSlash, CornersOut } from "phosphor-react";
import type { Annotation, MaskInfo } from "@/components/annotation/types/annotation";
import type { AnnotationClientRead } from "@/shared/api/generated/models";

interface Point {
  x: number;
  y: number;
}

interface TrajectoryPoint extends Point {
  id: string;
  type: 'start' | 'end' | 'waypoint';
  maskId?: number;
}

export function TrajectoryCanvas() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { selectedImage } = useImagesContext();
  const { 
    selectedTask, 
    isDrawingMode, 
    trajectoryPath, 
    robotHandPosition,
    startPoint,
    endPoint,
    activeTrajectoryMasks,
    handleStartDrawing,
    handleEndDrawing,
    handleTrajectoryPointAdd,
    handleRobotHandMove,
    handleSubmitTrajectory,
    approvedAnnotations,
    annotationsLoading
  } = useTrajectoryWorkspace();

  // Canvas states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [showMasks, setShowMasks] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  // Debug: Log annotation data
  useEffect(() => {
    console.log('TrajectoryCanvas Debug:', {
      selectedImageId: selectedImage?.id,
      annotationsLoading,
      annotationsCount: approvedAnnotations?.length || 0,
      showMasks,
      activeTrajectoryMasks: activeTrajectoryMasks.length
    });
  }, [selectedImage?.id, annotationsLoading, approvedAnnotations, showMasks, activeTrajectoryMasks]);

  // Color constants
  const ACTIVE_MASK_COLOR = "#0066FF";
  const INACTIVE_MASK_COLOR = "#8B5A96";
  const TRAJECTORY_COLOR = "#00D4AA";
  const ROBOT_HAND_COLOR = "#FF6B35";

  // Load image and fit to container (similar to InteractiveAnnotationCanvas)
  useEffect(() => {
    if (!selectedImage) return;
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      // Small delay to ensure container is ready
      setTimeout(() => {
        fitImageToContainer();
      }, 100);
    };
    img.src = selectedImage.image_url;
  }, [selectedImage]);

  // Fit image to container
  const fitImageToContainer = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || !selectedImage || !imageLoaded) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 32; // padding
    const containerHeight = containerRect.height - 32;

    const scaleX = containerWidth / selectedImage.width;
    const scaleY = containerHeight / selectedImage.height;
    const newZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

    setZoom(newZoom);

    // Center the image
    const scaledWidth = selectedImage.width * newZoom;
    const scaledHeight = selectedImage.height * newZoom;
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;

    setPanOffset({ x: offsetX, y: offsetY });

    // Update canvas size
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      canvas.style.width = `${scaledWidth}px`;
      canvas.style.height = `${scaledHeight}px`;
    }

    // Update SVG overlay size
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.setAttribute('width', scaledWidth.toString());
      overlay.setAttribute('height', scaledHeight.toString());
      overlay.style.width = `${scaledWidth}px`;
      overlay.style.height = `${scaledHeight}px`;
    }

    drawCanvas();
  }, [selectedImage, imageLoaded]);

  // Draw image on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedImage || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create image element if not exists
    let img = imageRef.current;
    if (!img) {
      img = new Image();
      img.src = selectedImage.image_url;
      imageRef.current = img;
      return;
    }

    // Clear and draw image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, [selectedImage, imageLoaded]);

  // Redraw when dependencies change
  useEffect(() => {
    if (imageLoaded) {
      drawCanvas();
    }
  }, [drawCanvas, imageLoaded]);

  // Handle window resize and initial container setup
  useEffect(() => {
    const handleResize = () => {
      if (imageLoaded) {
        fitImageToContainer();
      }
    };

    // Also call fitImageToContainer when container is ready
    if (imageLoaded && containerRef.current) {
      fitImageToContainer();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitImageToContainer, imageLoaded]);

  // Convert image coordinates to screen coordinates
  const imageToScreen = useCallback((imageX: number, imageY: number) => {
    if (!selectedImage) return { x: 0, y: 0 };
    
    const scaleX = (canvasRef.current?.width || 0) / selectedImage.width;
    const scaleY = (canvasRef.current?.height || 0) / selectedImage.height;
    
    return {
      x: imageX * scaleX,
      y: imageY * scaleY
    };
  }, [selectedImage]);

  // Transform coordinates for SVG (similar to ImageDetailSidebar)
  const transformCoordinates = useCallback(
    (originalX: number, originalY: number) => {
      if (!selectedImage || !canvasRef.current) return { x: 0, y: 0 };
      
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;
      const scaleX = canvasWidth / selectedImage.width;
      const scaleY = canvasHeight / selectedImage.height;

      return {
        x: originalX * scaleX,
        y: originalY * scaleY,
      };
    },
    [selectedImage]
  );

  // Convert polygon to SVG path (same as ImageDetailSidebar)
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

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number) => {
    if (!selectedImage || !canvasRef.current) return { x: 0, y: 0 };
    
    const scaleX = (canvasRef.current.width || 0) / selectedImage.width;
    const scaleY = (canvasRef.current.height || 0) / selectedImage.height;
    
    return {
      x: screenX / scaleX,
      y: screenY / scaleY
    };
  }, [selectedImage]);

  // Handle SVG click for mask selection
  const handleSvgClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!selectedTask || !overlayRef.current) return;

    const svg = overlayRef.current;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to image coordinates
    const imageCoords = screenToImage(x, y);

    // Check if clicking on an active mask
    const clickedAnnotation = approvedAnnotations.find((annotation: AnnotationClientRead) => {
      if (!activeTrajectoryMasks.includes(annotation.id)) return false;
      
      // Check polygon first if available - use same format as ImageDetailSidebar
      const polygonData = annotation.polygon as any;
      if (polygonData && polygonData.has_segmentation && polygonData.polygons && polygonData.polygons.length > 0) {
        return polygonData.polygons.some((polygon: number[][]) => {
          // Point-in-polygon check for array of [x, y] points
          let inside = false;
          for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0];
            const yi = polygon[i][1];
            const xj = polygon[j][0];
            const yj = polygon[j][1];
            
            if (((yi > imageCoords.y) !== (yj > imageCoords.y)) &&
                (imageCoords.x < (xj - xi) * (imageCoords.y - yi) / (yj - yi) + xi)) {
              inside = !inside;
            }
          }
          return inside;
        });
      }
      
      // Fallback to bbox check
      const bbox = annotation.bbox || [0, 0, 0, 0];
      const [bx, by, bw, bh] = bbox;
      return imageCoords.x >= bx && imageCoords.x <= bx + bw && 
             imageCoords.y >= by && imageCoords.y <= by + bh;
    });

    if (clickedAnnotation) {
      handleTrajectoryPointAdd({
        x: imageCoords.x,
        y: imageCoords.y,
        id: `point-${Date.now()}`,
        type: startPoint ? 'end' : 'start',
        maskId: clickedAnnotation.id
      });
    }
  }, [selectedTask, approvedAnnotations, activeTrajectoryMasks, startPoint, handleTrajectoryPointAdd, screenToImage]);

  // Handle drawing
  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode || !startPoint || !endPoint) return;
    
    setIsDrawing(true);
    const svg = overlayRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setCurrentPath([{ x, y }]);
    handleStartDrawing();
  }, [isDrawingMode, startPoint, endPoint, handleStartDrawing]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    
    const svg = overlayRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setCurrentPath(prev => [...prev, { x, y }]);
  }, [isDrawing]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Convert current path to image coordinates and save
    const imagePath = currentPath.map(point => screenToImage(point.x, point.y));
    
    handleEndDrawing(imagePath);
    setCurrentPath([]);
  }, [isDrawing, currentPath, screenToImage, handleEndDrawing]);

  if (!selectedImage) return null;

  return (
    <Box
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          background: theme.colors.background.card,
          borderBottom: `1px solid ${theme.colors.border.subtle}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Text size="3" weight="bold" style={{ color: theme.colors.text.primary }}>
            Robot Trajectory Drawing
          </Text>
          {selectedTask && (
            <Text size="2" style={{ color: theme.colors.text.secondary, marginTop: "4px" }}>
              Task: {selectedTask.description}
            </Text>
          )}
        </Box>
        
        <Flex align="center" gap="2">
          {/* Toggle masks visibility */}
          <Button
            onClick={() => setShowMasks(!showMasks)}
            style={{
              background: "transparent",
              color: showMasks ? theme.colors.interactive.primary : theme.colors.text.secondary,
              border: `1px solid ${showMasks ? theme.colors.interactive.primary : theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {showMasks ? <Eye size={14} /> : <EyeSlash size={14} />}
            Masks
          </Button>

          {/* Fit to screen */}
          <Button
            onClick={fitImageToContainer}
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              padding: "6px 10px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <CornersOut size={14} />
            Fit
          </Button>

          {/* Start Drawing button */}
          {startPoint && endPoint && !isDrawingMode && trajectoryPath.length === 0 && (
            <Button
              onClick={handleStartDrawing}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}dd)`,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.md,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <ArrowRight size={16} weight="fill" />
              Start Drawing
            </Button>
          )}

          {/* Submit button */}
          {startPoint && endPoint && trajectoryPath.length > 1 && (
            <Button
              onClick={handleSubmitTrajectory}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.status.success}dd)`,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.md,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <CheckCircle size={16} weight="fill" />
              Submit
            </Button>
          )}
        </Flex>
      </Box>

      {/* Canvas Container */}
      <Box
        ref={containerRef}
        style={{
          flex: 1,
          padding: theme.spacing.semantic.component.md,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: theme.colors.background.secondary,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            position: "relative",
            maxWidth: "100%",
            maxHeight: "100%",
            boxShadow: theme.shadows.semantic.card.medium,
            borderRadius: theme.borders.radius.lg,
            overflow: "hidden",
          }}
        >
          {/* Main canvas for image */}
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              position: "relative",
              zIndex: 1,
            }}
          />
          
          {/* SVG overlay for masks and interactions */}
          <svg
            ref={overlayRef}
            onClick={handleSvgClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 2,
              cursor: isDrawingMode ? "crosshair" : "pointer",
            }}
          >
            <defs>
              {/* Glow effect for active masks */}
              <filter id="maskGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              
              {/* Trajectory line pattern */}
              <pattern id="trajectoryPattern" patternUnits="userSpaceOnUse" width="10" height="10">
                <rect width="10" height="10" fill="none" />
                <path d="M0,5 L10,5" stroke={TRAJECTORY_COLOR} strokeWidth="2" opacity="0.6" />
              </pattern>
            </defs>

            {/* Debug info */}
            {showMasks && approvedAnnotations.length === 0 && !annotationsLoading && (
              <text x="10" y="30" fill="red" fontSize="14">
                No approved annotations found for image {selectedImage?.id}
              </text>
            )}
            
            {/* Render approved annotation masks */}
            {showMasks && approvedAnnotations.map((annotation: AnnotationClientRead, index: number) => {
              console.log('Rendering annotation:', annotation.id, annotation);
              
              // Check if this annotation is active based on selected task
              const isActive = activeTrajectoryMasks.includes(annotation.id);
              const maskIndex = activeTrajectoryMasks.indexOf(annotation.id);
              
              // Different colors for start vs end masks
              let color = INACTIVE_MASK_COLOR;
              let opacity = 0.2;
              let label = "";
              
              if (isActive) {
                opacity = 0.4;
                if (maskIndex === 0) {
                  color = "#00D4AA"; // Green for start mask
                  label = "START";
                } else if (maskIndex === 1) {
                  color = "#FF6B35"; // Orange for end mask  
                  label = "END";
                } else {
                  color = ACTIVE_MASK_COLOR; // Blue fallback
                }
              }

              // Get bbox for fallback and label positioning
              const bbox = annotation.bbox || [0, 0, 0, 0];
              const [bx, by, bw, bh] = bbox;
              const bboxScreenCoords = imageToScreen(bx, by);
              
              console.log('Annotation render data:', {
                id: annotation.id,
                bbox,
                bboxScreenCoords,
                hasPolygon: !!(annotation.polygon as any)?.polygons,
                polygonCount: (annotation.polygon as any)?.polygons?.length || 0,
                isActive,
                categoryId: annotation.category_id
              });

              return (
                <g key={annotation.id}>
                  {/* Render segmentation mask (same as ImageDetailSidebar) */}
                  {(() => {
                    // Check for polygon data exactly like ImageDetailSidebar
                    if (!annotation.polygon || !(annotation.polygon as any).has_segmentation) {
                      console.log(`No segmentation data for annotation ${annotation.id}, using bbox fallback`);
                      
                      return (
                        <rect
                          x={bboxScreenCoords.x}
                          y={bboxScreenCoords.y}
                          width={Math.abs(bw * zoom)}
                          height={Math.abs(bh * zoom)}
                          fill={color}
                          fillOpacity={opacity}
                          stroke={color}
                          strokeWidth={isActive ? 3 : 2}
                          strokeOpacity={0.9}
                          filter={isActive ? "url(#maskGlow)" : undefined}
                          style={{
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                          }}
                        />
                      );
                    }

                    console.log(`Rendering segmentation polygons for annotation ${annotation.id}`);
                    console.log('Polygon data:', annotation.polygon);
                    
                    // Render polygons exactly like ImageDetailSidebar
                    return (annotation.polygon as any).polygons.map((polygon: number[][], polygonIndex: number) => {
                      const pathData = polygonToPath(polygon);
                      if (!pathData) return null;

                      console.log(`Polygon ${polygonIndex} path:`, pathData.substring(0, 100) + '...');

                      return (
                        <path
                          key={`${annotation.id}-polygon-${polygonIndex}`}
                          d={pathData}
                          fill={`${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`}
                          stroke={color}
                          strokeWidth={isActive ? 3 : 2}
                          filter={isActive ? "url(#maskGlow)" : undefined}
                          style={{
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                          }}
                        />
                      );
                    });
                  })()}
                  
                  {/* Label for active masks */}
                  {isActive && label && (
                    <g>
                      {/* Background for label */}
                      <rect
                        x={bboxScreenCoords.x + 4}
                        y={bboxScreenCoords.y + 2}
                        width={label.length * 7}
                        height={16}
                        fill={color}
                        rx="2"
                        style={{ pointerEvents: "none" }}
                      />
                      {/* Label text */}
                      <text
                        x={bboxScreenCoords.x + 8}
                        y={bboxScreenCoords.y + 13}
                        fill={theme.colors.text.inverse}
                        fontSize="10"
                        fontWeight="700"
                        style={{ pointerEvents: "none" }}
                      >
                        {label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render trajectory points */}
            {startPoint && (
              <g>
                {(() => {
                  const screenCoords = imageToScreen(startPoint.x, startPoint.y);
                  return (
                    <>
                      {/* Outer glow effect */}
                      <circle
                        cx={screenCoords.x}
                        cy={screenCoords.y}
                        r="20"
                        fill={theme.colors.status.success}
                        fillOpacity="0.2"
                        stroke="none"
                      />
                      {/* Main circle */}
                      <circle
                        cx={screenCoords.x}
                        cy={screenCoords.y}
                        r="16"
                        fill={theme.colors.status.success}
                        stroke={theme.colors.text.inverse}
                        strokeWidth="3"
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                        }}
                      />
                      <text
                        x={screenCoords.x}
                        y={screenCoords.y + 6}
                        textAnchor="middle"
                        fill={theme.colors.text.inverse}
                        fontSize="14"
                        fontWeight="bold"
                      >
                        S
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {endPoint && (
              <g>
                {(() => {
                  const screenCoords = imageToScreen(endPoint.x, endPoint.y);
                  return (
                    <>
                      {/* Outer glow effect */}
                      <circle
                        cx={screenCoords.x}
                        cy={screenCoords.y}
                        r="20"
                        fill={theme.colors.status.error}
                        fillOpacity="0.2"
                        stroke="none"
                      />
                      {/* Main circle */}
                      <circle
                        cx={screenCoords.x}
                        cy={screenCoords.y}
                        r="16"
                        fill={theme.colors.status.error}
                        stroke={theme.colors.text.inverse}
                        strokeWidth="3"
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                        }}
                      />
                      <text
                        x={screenCoords.x}
                        y={screenCoords.y + 6}
                        textAnchor="middle"
                        fill={theme.colors.text.inverse}
                        fontSize="14"
                        fontWeight="bold"
                      >
                        E
                      </text>
                    </>
                  );
                })()}
              </g>
            )}

            {/* Render robot hand position */}
            {robotHandPosition && (
              <g>
                {(() => {
                  const screenCoords = imageToScreen(robotHandPosition.x, robotHandPosition.y);
                  return (
                    <g transform={`translate(${screenCoords.x}, ${screenCoords.y})`}>
                      {/* Shadow circle for depth */}
                      <circle
                        cx="0"
                        cy="0"
                        r="24"
                        fill="rgba(0, 0, 0, 0.1)"
                        stroke="none"
                      />
                      {/* Main circle background */}
                      <circle
                        cx="0"
                        cy="0"
                        r="22"
                        fill={theme.colors.background.card}
                        stroke={ROBOT_HAND_COLOR}
                        strokeWidth="3"
                        style={{
                          filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))",
                        }}
                      />
                      {/* HandGrabbing icon */}
                      <foreignObject x="-14" y="-14" width="28" height="28">
                        <HandGrabbing 
                          size={28} 
                          color={ROBOT_HAND_COLOR} 
                          weight="fill"
                          style={{
                            display: "block"
                          }}
                        />
                      </foreignObject>
                    </g>
                  );
                })()}
              </g>
            )}

            {/* Render trajectory path */}
            {trajectoryPath.length > 1 && (
              <g>
                {/* Shadow for depth */}
                <polyline
                  points={trajectoryPath.map(point => {
                    const screenCoords = imageToScreen(point.x, point.y);
                    return `${screenCoords.x},${screenCoords.y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgba(0, 0, 0, 0.2)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  transform="translate(2, 2)"
                />
                {/* Main trajectory line */}
                <polyline
                  points={trajectoryPath.map(point => {
                    const screenCoords = imageToScreen(point.x, point.y);
                    return `${screenCoords.x},${screenCoords.y}`;
                  }).join(' ')}
                  fill="none"
                  stroke={TRAJECTORY_COLOR}
                  strokeWidth="5"
                  strokeDasharray="15,8"
                  strokeOpacity="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animation: "dashMove 2s linear infinite",
                  }}
                />
              </g>
            )}

            {/* Render current drawing path */}
            {currentPath.length > 1 && (
              <polyline
                points={currentPath.map(point => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke={theme.colors.interactive.accent}
                strokeWidth="4"
                strokeDasharray="8,4"
                strokeOpacity="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </Box>
      </Box>

      {/* Instructions */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          background: theme.colors.background.card,
          borderTop: `1px solid ${theme.colors.border.subtle}20`,
        }}
      >
        <Text size="2" style={{ color: theme.colors.text.secondary, textAlign: "center" }}>
          {annotationsLoading && "Loading approved annotations..."}
          {!annotationsLoading && approvedAnnotations.length === 0 && "No approved annotations found for this image"}
          {!annotationsLoading && approvedAnnotations.length > 0 && !selectedTask && "Select a task from the sidebar to begin"}
          {!annotationsLoading && approvedAnnotations.length > 0 && selectedTask && activeTrajectoryMasks.length < 2 && `Selected task requires 2 masks, but only ${activeTrajectoryMasks.length} available`}
          {!annotationsLoading && approvedAnnotations.length > 0 && selectedTask && activeTrajectoryMasks.length >= 2 && !startPoint && "Click on the GREEN (START) mask to set the start point"}
          {!annotationsLoading && approvedAnnotations.length > 0 && selectedTask && startPoint && !endPoint && "Click on the ORANGE (END) mask to set the end point"}
          {!annotationsLoading && approvedAnnotations.length > 0 && selectedTask && startPoint && endPoint && !isDrawingMode && "Click 'Start Drawing' to draw the trajectory path"}
          {!annotationsLoading && approvedAnnotations.length > 0 && selectedTask && isDrawingMode && "Draw the trajectory path from start to end point"}
        </Text>
        {!annotationsLoading && approvedAnnotations.length > 0 && (
          <Text size="1" style={{ color: theme.colors.text.tertiary, textAlign: "center", marginTop: "4px" }}>
            {approvedAnnotations.length} approved annotation{approvedAnnotations.length !== 1 ? 's' : ''} loaded
          </Text>
        )}
      </Box>

      {/* Animation styles */}
      <style>
        {`
          @keyframes dashMove {
            0% {
              stroke-dashoffset: 0;
            }
            100% {
              stroke-dashoffset: 15;
            }
          }
        `}
      </style>
    </Box>
  );
}