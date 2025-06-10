import React, { useRef, useCallback, useEffect, useState, MouseEvent } from 'react';
import { Box, Flex, Text, Button } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { BoundingBox, Polygon, Point, AnnotationType } from '../types/workspace';
import { Hand, PencilSimple, CaretLeft, CaretRight } from 'phosphor-react';
import { getLabelColor } from '../utils/labelColors';

interface ImageViewerProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  zoom: number;
  panOffset: Point;
  boundingBoxes: BoundingBox[];
  polygons: Polygon[];
  currentTool: AnnotationType;
  selectedLabel: string;
  isDrawing: boolean;
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: Point) => void;
  onAddBoundingBox: (bbox: Omit<BoundingBox, 'id'>) => void;
  onAddPolygon: (polygon: Omit<Polygon, 'id'>) => void;
  onSelectAnnotation?: (type: AnnotationType, id: string) => void;
  onDeleteAnnotation?: (type: AnnotationType, id: string) => void;
  onUpdateBoundingBox?: (id: string, updates: Partial<BoundingBox>) => void;
  setDrawing: (drawing: boolean) => void;
  // Navigation props
  onPreviousImage?: () => void;
  onNextImage?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

// BBox handle types for resizing
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

interface BBoxHandle {
  type: ResizeHandle;
  x: number;
  y: number;
  size: number;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  zoom,
  panOffset,
  boundingBoxes,
  polygons,
  currentTool,
  selectedLabel,
  isDrawing,
  onZoomChange,
  onPanChange,
  onAddBoundingBox,
  onAddPolygon,
  onDeleteAnnotation,
  onUpdateBoundingBox,
  setDrawing,
  onPreviousImage,
  onNextImage,
  canGoPrevious = false,
  canGoNext = false
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  
  // States for interaction
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [isDrawingBbox, setIsDrawingBbox] = useState(false);
  const [drawingStart, setDrawingStart] = useState<Point>({ x: 0, y: 0 });
  const [drawingCurrent, setDrawingCurrent] = useState<Point>({ x: 0, y: 0 });
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Mode system states
  const [isPanMode, setIsPanMode] = useState(true); // Default to pan mode
  
  // BBox editing states
  const [selectedBboxId, setSelectedBboxId] = useState<string | null>(null);
  const [isDraggingBbox, setIsDraggingBbox] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [originalBbox, setOriginalBbox] = useState<BoundingBox | null>(null);

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - panOffset.x) / zoom;
    const y = (screenY - rect.top - panOffset.y) / zoom;
    
    return { x: Math.max(0, Math.min(imageWidth, x)), y: Math.max(0, Math.min(imageHeight, y)) };
  }, [zoom, panOffset, imageWidth, imageHeight]);

  // Get BBox handles for editing
  const getBBoxHandles = useCallback((bbox: BoundingBox): BBoxHandle[] => {
    const handleSize = 8 / zoom; // Handle size in image coordinates
    const handles: BBoxHandle[] = [];

    // Corner handles
    handles.push(
      { type: 'nw', x: bbox.x - handleSize/2, y: bbox.y - handleSize/2, size: handleSize },
      { type: 'ne', x: bbox.x + bbox.width - handleSize/2, y: bbox.y - handleSize/2, size: handleSize },
      { type: 'se', x: bbox.x + bbox.width - handleSize/2, y: bbox.y + bbox.height - handleSize/2, size: handleSize },
      { type: 'sw', x: bbox.x - handleSize/2, y: bbox.y + bbox.height - handleSize/2, size: handleSize }
    );

    // Edge handles
    handles.push(
      { type: 'n', x: bbox.x + bbox.width/2 - handleSize/2, y: bbox.y - handleSize/2, size: handleSize },
      { type: 'e', x: bbox.x + bbox.width - handleSize/2, y: bbox.y + bbox.height/2 - handleSize/2, size: handleSize },
      { type: 's', x: bbox.x + bbox.width/2 - handleSize/2, y: bbox.y + bbox.height - handleSize/2, size: handleSize },
      { type: 'w', x: bbox.x - handleSize/2, y: bbox.y + bbox.height/2 - handleSize/2, size: handleSize }
    );

    return handles;
  }, [zoom]);

  // Check if point is inside BBox
  const isPointInBBox = useCallback((point: Point, bbox: BoundingBox): boolean => {
    return point.x >= bbox.x && point.x <= bbox.x + bbox.width &&
           point.y >= bbox.y && point.y <= bbox.y + bbox.height;
  }, []);

  // Check if point is on a handle
  const getHandleAtPoint = useCallback((point: Point, bbox: BoundingBox): ResizeHandle | null => {
    const handles = getBBoxHandles(bbox);
    
    for (const handle of handles) {
      if (point.x >= handle.x && point.x <= handle.x + handle.size &&
          point.y >= handle.y && point.y <= handle.y + handle.size) {
        return handle.type;
      }
    }
    
    // Check if inside bbox for move
    if (isPointInBBox(point, bbox)) {
      return 'move';
    }
    
    return null;
  }, [getBBoxHandles, isPointInBBox]);

  // Update BBox based on handle drag
  const updateBBoxFromHandle = useCallback((
    originalBbox: BoundingBox, 
    handle: ResizeHandle, 
    currentPoint: Point, 
    startPoint: Point
  ): Partial<BoundingBox> => {
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;

    switch (handle) {
      case 'move':
        return {
          x: originalBbox.x + deltaX,
          y: originalBbox.y + deltaY
        };
      case 'nw':
        return {
          x: originalBbox.x + deltaX,
          y: originalBbox.y + deltaY,
          width: Math.max(10, originalBbox.width - deltaX),
          height: Math.max(10, originalBbox.height - deltaY)
        };
      case 'ne':
        return {
          y: originalBbox.y + deltaY,
          width: Math.max(10, originalBbox.width + deltaX),
          height: Math.max(10, originalBbox.height - deltaY)
        };
      case 'se':
        return {
          width: Math.max(10, originalBbox.width + deltaX),
          height: Math.max(10, originalBbox.height + deltaY)
        };
      case 'sw':
        return {
          x: originalBbox.x + deltaX,
          width: Math.max(10, originalBbox.width - deltaX),
          height: Math.max(10, originalBbox.height + deltaY)
        };
      case 'n':
        return {
          y: originalBbox.y + deltaY,
          height: Math.max(10, originalBbox.height - deltaY)
        };
      case 'e':
        return {
          width: Math.max(10, originalBbox.width + deltaX)
        };
      case 's':
        return {
          height: Math.max(10, originalBbox.height + deltaY)
        };
      case 'w':
        return {
          x: originalBbox.x + deltaX,
          width: Math.max(10, originalBbox.width - deltaX)
        };
      default:
        return {};
    }
  }, []);

  // Handle mouse wheel for zooming with improved sensitivity
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom point in image coordinates
    const imagePoint = screenToImage(e.clientX, e.clientY);
    
    // Much more gentle zoom sensitivity
    const zoomIntensity = 0.05; // Reduced from 0.1 (which was 0.9/1.1)
    const zoomFactor = e.deltaY > 0 ? (1 - zoomIntensity) : (1 + zoomIntensity);
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    
    // Only update if zoom actually changes
    if (Math.abs(newZoom - zoom) < 0.01) return;
    
    // Calculate new pan offset to keep the zoom point in the same screen position
    const newPanX = mouseX - imagePoint.x * newZoom;
    const newPanY = mouseY - imagePoint.y * newZoom;
    
    onZoomChange(newZoom);
    onPanChange({ x: newPanX, y: newPanY });
  }, [zoom, screenToImage, onZoomChange, onPanChange]);

  // Handle mouse down with mode awareness
  const handleMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const imagePoint = screenToImage(e.clientX, e.clientY);
    
    // In pan mode, only allow panning
    if (isPanMode) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Check if we're clicking on an existing BBox (only in annotation mode)
    let clickedBbox: BoundingBox | null = null;
    let clickedHandle: ResizeHandle | null = null;
    
    for (const bbox of boundingBoxes) {
      const handle = getHandleAtPoint(imagePoint, bbox);
      if (handle) {
        clickedBbox = bbox;
        clickedHandle = handle;
        break;
      }
    }

    if (clickedBbox && clickedHandle) {
      // Start BBox editing
      setSelectedBboxId(clickedBbox.id);
      setIsDraggingBbox(true);
      setActiveHandle(clickedHandle);
      setOriginalBbox(clickedBbox);
      setDragStartPoint(imagePoint);
      return;
    }

    // Clear selection if clicking on empty area
    setSelectedBboxId(null);

    // Annotation tools (only work in annotation mode)
    if (currentTool === 'bbox' && selectedLabel) {
      setIsDrawingBbox(true);
      setDrawingStart(imagePoint);
      setDrawingCurrent(imagePoint);
      setDrawing(true);
    } else if (currentTool === 'segmentation') {
      if (!isDrawing) {
        // Start new polygon
        setCurrentDrawing([imagePoint]);
        setDrawing(true);
      } else {
        // Add point to current polygon
        setCurrentDrawing(prev => [...prev, imagePoint]);
      }
    } else {
      // Default to pan mode if no specific tool is active
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [currentTool, selectedLabel, screenToImage, isDrawing, setDrawing, boundingBoxes, getHandleAtPoint, isPanMode]);

  // Handle mouse move with RAF for performance and mode awareness
  const handleMouseMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const imagePoint = screenToImage(e.clientX, e.clientY);

      if (isDraggingBbox && activeHandle && originalBbox && onUpdateBoundingBox) {
        // Update BBox position/size
        const updates = updateBBoxFromHandle(originalBbox, activeHandle, imagePoint, dragStartPoint);
        onUpdateBoundingBox(originalBbox.id, updates);
      } else if (isDrawingBbox) {
        // Update drawing preview
        setDrawingCurrent(imagePoint);
      } else if (isPanning) {
        // Pan the view (available in both modes when dragging)
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        
        onPanChange({
          x: panOffset.x + deltaX,
          y: panOffset.y + deltaY
        });
        
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      } else {
        // Update cursor based on current mode and what's under mouse
        if (!canvasRef.current) return;
        
        let cursor = 'default';
        
        if (isPanMode) {
          cursor = 'grab';
        } else if (currentTool === 'bbox') {
          cursor = 'crosshair';
        } else if (currentTool === 'segmentation') {
          cursor = 'crosshair';
        } else {
          // Check if hovering over BBox handle (only in annotation mode)
          for (const bbox of boundingBoxes) {
            const handle = getHandleAtPoint(imagePoint, bbox);
            if (handle) {
              switch (handle) {
                case 'nw':
                case 'se':
                  cursor = 'nw-resize';
                  break;
                case 'ne':
                case 'sw':
                  cursor = 'ne-resize';
                  break;
                case 'n':
                case 's':
                  cursor = 'n-resize';
                  break;
                case 'e':
                case 'w':
                  cursor = 'e-resize';
                  break;
                case 'move':
                  cursor = 'move';
                  break;
              }
              break;
            }
          }
          
          if (cursor === 'default') {
            cursor = 'grab';
          }
        }
        
        canvasRef.current.style.cursor = cursor;
      }
    });
  }, [
    isDraggingBbox, activeHandle, originalBbox, dragStartPoint, updateBBoxFromHandle, onUpdateBoundingBox,
    isDrawingBbox, isPanning, lastPanPoint, panOffset, onPanChange, screenToImage,
    currentTool, boundingBoxes, getHandleAtPoint, isPanMode
  ]);

  // Handle mouse up with mode awareness
  const handleMouseUp = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingBbox) {
      setIsDraggingBbox(false);
      setActiveHandle(null);
      setOriginalBbox(null);
    } else if (isDrawingBbox && selectedLabel) {
      const imagePoint = screenToImage(e.clientX, e.clientY);
      const x = Math.min(drawingStart.x, imagePoint.x);
      const y = Math.min(drawingStart.y, imagePoint.y);
      const width = Math.abs(imagePoint.x - drawingStart.x);
      const height = Math.abs(imagePoint.y - drawingStart.y);
      
      if (width > 10 && height > 10) { // Minimum size threshold
        onAddBoundingBox({
          x,
          y,
          width,
          height,
          label: selectedLabel
        });
      }
      
      setIsDrawingBbox(false);
      setDrawing(false);
    }
    
    // Always stop panning when mouse is released
    if (isPanning) {
      setIsPanning(false);
    }
  }, [isDraggingBbox, isDrawingBbox, selectedLabel, screenToImage, drawingStart, onAddBoundingBox, setDrawing, isPanning]);

  // Handle double click to finish polygon
  const handleDoubleClick = useCallback((_: MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'segmentation' && isDrawing && currentDrawing.length >= 3 && selectedLabel) {
      onAddPolygon({
        points: currentDrawing,
        label: selectedLabel
      });
      
      setCurrentDrawing([]);
      setDrawing(false);
    }
  }, [currentTool, isDrawing, currentDrawing, selectedLabel, onAddPolygon, setDrawing]);

  // Draw on canvas with RAF optimization
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImage) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context
    ctx.save();
    
    // Apply transform
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);
    
    // Draw image (now synchronous with preloaded image)
    ctx.drawImage(loadedImage, 0, 0, imageWidth, imageHeight);
    
    // Draw bounding boxes
    boundingBoxes.forEach((bbox) => {
      const isSelected = bbox.id === selectedBboxId;
      const labelColor = getLabelColor(bbox.label);
      
      // Use label-specific color, but make selected ones brighter
      ctx.strokeStyle = isSelected ? theme.colors.interactive.primary : labelColor;
      ctx.lineWidth = (isSelected ? 3 : 2) / zoom;
      ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
      
      // Draw label background for better readability
      ctx.fillStyle = isSelected ? theme.colors.interactive.primary : labelColor;
      ctx.font = `${14 / zoom}px sans-serif`;
      
      // Measure text for background
      const textMetrics = ctx.measureText(bbox.label);
      const textHeight = 14 / zoom;
      const padding = 4 / zoom;
      
      // Draw label background
      ctx.fillRect(
        bbox.x - padding, 
        bbox.y - textHeight - padding, 
        textMetrics.width + (padding * 2), 
        textHeight + (padding * 2)
      );
      
      // Draw label text in white for better contrast
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(bbox.label, bbox.x, bbox.y - 5 / zoom);
      
      // Draw handles for selected bbox
      if (isSelected) {
        const handles = getBBoxHandles(bbox);
        handles.forEach((handle) => {
          ctx.fillStyle = theme.colors.interactive.primary;
          ctx.fillRect(handle.x, handle.y, handle.size, handle.size);
          
          // Add white border
          ctx.strokeStyle = theme.colors.background.card;
          ctx.lineWidth = 1 / zoom;
          ctx.strokeRect(handle.x, handle.y, handle.size, handle.size);
        });
      }
    });
    
    // Draw preview bbox while drawing
    if (isDrawingBbox && currentTool === 'bbox') {
      const x = Math.min(drawingStart.x, drawingCurrent.x);
      const y = Math.min(drawingStart.y, drawingCurrent.y);
      const width = Math.abs(drawingCurrent.x - drawingStart.x);
      const height = Math.abs(drawingCurrent.y - drawingStart.y);
      
      ctx.strokeStyle = theme.colors.interactive.primary;
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 5 / zoom]);
      ctx.strokeRect(x, y, width, height);
      ctx.setLineDash([]);
    }
    
    // Draw polygons
    polygons.forEach((polygon) => {
      if (polygon.points.length > 1) {
        const labelColor = getLabelColor(polygon.label);
        
        ctx.beginPath();
        ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
        
        for (let i = 1; i < polygon.points.length; i++) {
          ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
        }
        
        ctx.closePath();
        ctx.strokeStyle = labelColor;
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
        
        // Draw label with background
        if (polygon.points.length > 0) {
          ctx.fillStyle = labelColor;
          ctx.font = `${14 / zoom}px sans-serif`;
          
          // Measure text for background
          const textMetrics = ctx.measureText(polygon.label);
          const textHeight = 14 / zoom;
          const padding = 4 / zoom;
          
          // Draw label background
          ctx.fillRect(
            polygon.points[0].x - padding, 
            polygon.points[0].y - textHeight - padding, 
            textMetrics.width + (padding * 2), 
            textHeight + (padding * 2)
          );
          
          // Draw label text in white for better contrast
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(polygon.label, polygon.points[0].x, polygon.points[0].y - 5 / zoom);
        }
      }
    });
    
    // Draw current polygon drawing
    if (isDrawing && currentTool === 'segmentation' && currentDrawing.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
      
      for (let i = 1; i < currentDrawing.length; i++) {
        ctx.lineTo(currentDrawing[i].x, currentDrawing[i].y);
      }
      
      ctx.strokeStyle = theme.colors.interactive.primary;
      ctx.lineWidth = 2 / zoom;
      ctx.stroke();
      
      // Draw points
      currentDrawing.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3 / zoom, 0, 2 * Math.PI);
        ctx.fillStyle = theme.colors.interactive.primary;
        ctx.fill();
      });
    }
    
    // Restore context
    ctx.restore();
  }, [
    loadedImage, panOffset, zoom, imageWidth, imageHeight,
    boundingBoxes, selectedBboxId, getBBoxHandles, isDrawingBbox, currentTool,
    drawingStart, drawingCurrent, polygons, isDrawing, currentDrawing, theme
  ]);

  // Setup canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // Set canvas size to container size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      draw();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Add wheel event listener
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('wheel', handleWheel);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleWheel, draw]);

  // Calculate optimal zoom to fit image in canvas
  const calculateFitToCanvasZoom = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageWidth || !imageHeight) return 1;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate zoom to fit image while maintaining aspect ratio
    const scaleX = canvasWidth / imageWidth;
    const scaleY = canvasHeight / imageHeight;
    const fitZoom = Math.min(scaleX, scaleY) * 0.9; // 90% to leave some padding
    
    return Math.max(0.1, Math.min(5, fitZoom)); // Clamp between 0.1 and 5
  }, [imageWidth, imageHeight]);

  // Calculate center offset for fitted image
  const calculateCenterOffset = useCallback((fitZoom: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageWidth || !imageHeight) return { x: 0, y: 0 };

    const scaledImageWidth = imageWidth * fitZoom;
    const scaledImageHeight = imageHeight * fitZoom;
    
    const centerX = (canvas.width - scaledImageWidth) / 2;
    const centerY = (canvas.height - scaledImageHeight) / 2;
    
    return { x: centerX, y: centerY };
  }, [imageWidth, imageHeight]);

  // Load image when imageUrl changes
  useEffect(() => {
    if (!imageUrl) {
      setLoadedImage(null);
      setImageLoaded(false);
      return;
    }

    // 새 이미지 로딩 시작 시 이전 상태 리셋
    setImageLoaded(false);

    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
      setImageLoaded(true);
      
      // Auto-fit image to canvas when loaded
      // requestAnimationFrame을 사용해서 더 안정적으로 처리
      requestAnimationFrame(() => {
        const fitZoom = calculateFitToCanvasZoom();
        const centerOffset = calculateCenterOffset(fitZoom);
        
        onZoomChange(fitZoom);
        onPanChange(centerOffset);
      });
    };
    img.onerror = () => {
      setLoadedImage(null);
      setImageLoaded(false);
    };
    img.src = imageUrl;
  }, [imageUrl, calculateFitToCanvasZoom, calculateCenterOffset, onZoomChange, onPanChange]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

  // URL 변경 시 selection 상태 클리어
  useEffect(() => {
    setSelectedBboxId(null);
    setIsDraggingBbox(false);
    setIsDrawingBbox(false);
    setCurrentDrawing([]);
  }, [imageUrl]);

  // Handle keyboard shortcuts (Delete key only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedBboxId && onDeleteAnnotation) {
        onDeleteAnnotation('bbox', selectedBboxId);
        setSelectedBboxId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBboxId, onDeleteAnnotation]);

  if (!imageUrl) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
        }}
      >
        <Text size="3" style={{ color: theme.colors.text.tertiary }}>
          No image selected
        </Text>
      </Box>
    );
  }

  if (!loadedImage || !imageLoaded) {
    return (
      <Box
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
        }}
      >
        <Flex direction="column" align="center" gap="3">
          <Box
            style={{
              width: '24px',
              height: '24px',
              border: `2px solid ${theme.colors.interactive.primary}30`,
              borderTop: `2px solid ${theme.colors.interactive.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            {!imageLoaded ? 'Loading image...' : 'Preparing...'}
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: theme.colors.background.secondary,
        borderRadius: theme.borders.radius.md,
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
      
      {/* Compact Icon-Based Mode Switcher */}
      <Box
        style={{
          position: 'absolute',
          top: theme.spacing.semantic.component.sm,
          right: theme.spacing.semantic.component.sm,
          background: `${theme.colors.background.card}95`,
          padding: `${theme.spacing.semantic.component.xs}`,
          borderRadius: theme.borders.radius.md,
          border: `1px solid ${theme.colors.border.primary}20`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 2px 8px ${theme.colors.background.primary}20`,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Flex align="center" gap="0">
          <Box
            style={{
              display: 'flex',
              background: theme.colors.background.secondary,
              borderRadius: theme.borders.radius.sm,
              border: `1px solid ${theme.colors.border.primary}30`,
              overflow: 'hidden',
            }}
          >
            <Button
              onClick={() => setIsPanMode(true)}
              style={{
                padding: `8px 12px`,
                background: isPanMode ? theme.colors.interactive.primary : 'transparent',
                color: isPanMode ? theme.colors.text.inverse : theme.colors.text.secondary,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Hand size={14} weight="bold" />
            </Button>
            <Box style={{ width: '1px', background: theme.colors.border.primary, opacity: 0.3 }} />
            <Button
              onClick={() => setIsPanMode(false)}
              style={{
                padding: `8px 12px`,
                background: !isPanMode ? theme.colors.interactive.primary : 'transparent',
                color: !isPanMode ? theme.colors.text.inverse : theme.colors.text.secondary,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PencilSimple size={14} weight="bold" />
            </Button>
          </Box>
        </Flex>
        
        {/* Subtle Tooltip */}
        {showTooltip && (
          <Box
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '4px',
              background: `${theme.colors.background.card}98`,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              borderRadius: theme.borders.radius.sm,
              border: `1px solid ${theme.colors.border.primary}30`,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 4px 12px ${theme.colors.background.primary}30`,
              whiteSpace: 'nowrap',
              zIndex: 1000,
            }}
          >
            <Text size="1" style={{ 
              color: theme.colors.text.secondary, 
              fontSize: '9px',
              fontWeight: 500,
            }}>
              {isPanMode ? 'Drag to navigate • Scroll to zoom' : 
               currentTool === 'bbox' ? 'Draw bounding boxes • Del to delete' :
               currentTool === 'segmentation' ? 'Click points • Double-click to finish' :
               'Select annotation tool in sidebar'
              }
            </Text>
          </Box>
        )}
      </Box>

      {/* Floating Navigation Buttons */}
      {onPreviousImage && onNextImage && (
        <>
          {/* Previous Button */}
          <Button
            onClick={onPreviousImage}
            disabled={!canGoPrevious}
            style={{
              position: 'absolute',
              left: theme.spacing.semantic.component.xs,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: `${theme.spacing.semantic.component.sm}`,
              background: canGoPrevious 
                ? `${theme.colors.background.card}95`
                : `${theme.colors.background.secondary}80`,
              color: !canGoPrevious ? theme.colors.text.tertiary : theme.colors.text.primary,
              border: `1px solid ${canGoPrevious ? theme.colors.border.primary : theme.colors.border.secondary}40`,
              borderRadius: theme.borders.radius.md,
              cursor: !canGoPrevious ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '33px',
              height: '33px',
              backdropFilter: 'blur(8px)',
              boxShadow: canGoPrevious 
                ? `0 4px 12px ${theme.colors.background.primary}30`
                : 'none',
              opacity: !canGoPrevious ? 0.5 : 1,
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
          >
            <CaretLeft size={20} weight="bold" />
          </Button>

          {/* Next Button */}
          <Button
            onClick={onNextImage}
            disabled={!canGoNext}
            style={{
              position: 'absolute',
              right: theme.spacing.semantic.component.xs,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: `${theme.spacing.semantic.component.sm}`,
              background: canGoNext 
                ? `${theme.colors.background.card}95`
                : `${theme.colors.background.secondary}80`,
              color: !canGoNext ? theme.colors.text.tertiary : theme.colors.text.primary,
              border: `1px solid ${canGoNext ? theme.colors.border.primary : theme.colors.border.secondary}40`,
              borderRadius: theme.borders.radius.md,
              cursor: !canGoNext ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '33px',
              height: '33px',
              backdropFilter: 'blur(8px)',
              boxShadow: canGoNext 
                ? `0 4px 12px ${theme.colors.background.primary}30`
                : 'none',
              opacity: !canGoNext ? 0.5 : 1,
              transition: 'all 0.2s ease',
              zIndex: 10,
            }}
          >
            <CaretRight size={20} weight="bold" />
          </Button>
        </>
      )}

      {/* Minimal Zoom Indicator */}
      <Box
        style={{
          position: 'absolute',
          bottom: theme.spacing.semantic.component.sm,
          left: theme.spacing.semantic.component.sm,
          background: `${theme.colors.background.card}95`,
          padding: `2px 6px`,
          borderRadius: theme.borders.radius.sm,
          border: `1px solid ${theme.colors.border.primary}20`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Text size="1" style={{ 
          color: theme.colors.text.tertiary, 
          fontSize: '9px',
          fontWeight: 500,
          letterSpacing: '0.5px'
        }}>
          {Math.round(zoom * 100)}%
        </Text>
      </Box>

      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>
    </Box>
  );
};
