import React, { useRef, useCallback, useEffect, useState, MouseEvent } from 'react';
import { Box, Flex, Text } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { BoundingBox, Polygon, Point, AnnotationType } from '../types/workspace';

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
  setDrawing: (drawing: boolean) => void;
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
  onSelectAnnotation,
  onDeleteAnnotation,
  setDrawing
}) => {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [isDrawingBbox, setIsDrawingBbox] = useState(false);
  const [drawingStart, setDrawingStart] = useState<Point>({ x: 0, y: 0 });
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate display dimensions
  const displayWidth = imageWidth * zoom;
  const displayHeight = imageHeight * zoom;

  // Convert screen coordinates to image coordinates
  const screenToImage = useCallback((screenX: number, screenY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (screenX - rect.left - panOffset.x) / zoom;
    const y = (screenY - rect.top - panOffset.y) / zoom;
    
    return { x: Math.max(0, Math.min(imageWidth, x)), y: Math.max(0, Math.min(imageHeight, y)) };
  }, [zoom, panOffset, imageWidth, imageHeight]);

  // Convert image coordinates to screen coordinates
  const imageToScreen = useCallback((imageX: number, imageY: number): Point => {
    return {
      x: imageX * zoom + panOffset.x,
      y: imageY * zoom + panOffset.y
    };
  }, [zoom, panOffset]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate zoom point in image coordinates
    const imagePoint = screenToImage(e.clientX, e.clientY);
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    
    // Calculate new pan offset to keep the zoom point in the same screen position
    const newPanX = mouseX - imagePoint.x * newZoom;
    const newPanY = mouseY - imagePoint.y * newZoom;
    
    onZoomChange(newZoom);
    onPanChange({ x: newPanX, y: newPanY });
  }, [zoom, screenToImage, onZoomChange, onPanChange]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !selectedLabel) return;
    
    const imagePoint = screenToImage(e.clientX, e.clientY);
    
    if (currentTool === 'bbox') {
      setIsDrawingBbox(true);
      setDrawingStart(imagePoint);
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
    } else if (currentTool === 'label') {
      // For image labels, we don't need mouse interaction
      return;
    } else {
      // Pan mode or other tools
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [currentTool, selectedLabel, screenToImage, isDrawing, setDrawing]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (isPanning && !isDrawingBbox && !isDrawing) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      onPanChange({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY
      });
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, isDrawingBbox, isDrawing, lastPanPoint, panOffset, onPanChange]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (isDrawingBbox && selectedLabel) {
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
    
    setIsPanning(false);
  }, [isDrawingBbox, selectedLabel, screenToImage, drawingStart, onAddBoundingBox, setDrawing]);

  // Handle double click to finish polygon
  const handleDoubleClick = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'segmentation' && isDrawing && currentDrawing.length >= 3 && selectedLabel) {
      onAddPolygon({
        points: currentDrawing,
        label: selectedLabel
      });
      
      setCurrentDrawing([]);
      setDrawing(false);
    }
  }, [currentTool, isDrawing, currentDrawing, selectedLabel, onAddPolygon, setDrawing]);

  // Draw on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context
    ctx.save();
    
    // Apply transform
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);
    
    // Draw image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, imageWidth, imageHeight);
      
      // Draw bounding boxes
      boundingBoxes.forEach((bbox, index) => {
        ctx.strokeStyle = theme.colors.status.success;
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        
        // Draw label
        ctx.fillStyle = theme.colors.status.success;
        ctx.font = `${14 / zoom}px sans-serif`;
        ctx.fillText(bbox.label, bbox.x, bbox.y - 5 / zoom);
      });
      
      // Draw polygons
      polygons.forEach((polygon) => {
        if (polygon.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
          
          for (let i = 1; i < polygon.points.length; i++) {
            ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
          }
          
          ctx.closePath();
          ctx.strokeStyle = theme.colors.status.warning;
          ctx.lineWidth = 2 / zoom;
          ctx.stroke();
          
          // Draw label
          ctx.fillStyle = theme.colors.status.warning;
          ctx.font = `${14 / zoom}px sans-serif`;
          if (polygon.points.length > 0) {
            ctx.fillText(polygon.label, polygon.points[0].x, polygon.points[0].y - 5 / zoom);
          }
        }
      });
      
      // Draw current drawing
      if (isDrawingBbox && currentTool === 'bbox') {
        // This will be handled by mouse move events
      }
      
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
    };
    img.src = imageUrl;
    
    // Restore context
    ctx.restore();
  }, [
    imageLoaded, panOffset, zoom, imageWidth, imageHeight, imageUrl, 
    boundingBoxes, polygons, isDrawingBbox, currentTool, isDrawing, 
    currentDrawing, theme
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
    
    // Load image to check if it's ready
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      draw();
    };
    img.src = imageUrl;
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel, draw, imageUrl]);

  // Redraw when dependencies change
  useEffect(() => {
    draw();
  }, [draw]);

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
        cursor: currentTool === 'bbox' ? 'crosshair' : 
               currentTool === 'segmentation' ? 'crosshair' : 
               isPanning ? 'grabbing' : 'grab'
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
      
      {/* Tool Instructions */}
      <Box
        style={{
          position: 'absolute',
          top: theme.spacing.semantic.component.md,
          left: theme.spacing.semantic.component.md,
          background: `${theme.colors.background.card}95`,
          padding: theme.spacing.semantic.component.sm,
          borderRadius: theme.borders.radius.sm,
          border: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Text size="1" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
          {currentTool === 'label' && 'Type a label in the sidebar and click Add to label this image'}
          {currentTool === 'bbox' && 'Click and drag to draw bounding boxes'}
          {currentTool === 'segmentation' && (isDrawing ? 'Click to add points, double-click to finish' : 'Click to start drawing polygon')}
        </Text>
      </Box>

      {/* Zoom Level Indicator */}
      <Box
        style={{
          position: 'absolute',
          bottom: theme.spacing.semantic.component.md,
          right: theme.spacing.semantic.component.md,
          background: `${theme.colors.background.card}95`,
          padding: theme.spacing.semantic.component.sm,
          borderRadius: theme.borders.radius.sm,
          border: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Text size="1" style={{ color: theme.colors.text.secondary }}>
          {Math.round(zoom * 100)}%
        </Text>
      </Box>
    </Box>
  );
};
