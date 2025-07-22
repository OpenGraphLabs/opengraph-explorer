import React, { useRef, useCallback, useEffect, useState, MouseEvent, WheelEvent, KeyboardEvent } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Annotation } from "../types/annotation";
import { BoundingBox, Point } from "../types/workspace";
import { 
  Eye, 
  EyeSlash, 
  X, 
  Check, 
  Plus, 
  Minus, 
  CornersOut, 
  CornersIn,
  Hand,
  Target,
} from "phosphor-react";

interface MaskState {
  id: number;
  selected: boolean;
  highlighted: boolean;
}

interface InteractiveAnnotationCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  annotations: Annotation[];
  className?: string;
  onMaskSelectionChange?: (selectedMaskIds: number[]) => void;
  onBboxComplete?: (bbox: BoundingBox) => void;
}

export function InteractiveAnnotationCanvas({
  imageUrl,
  imageWidth,
  imageHeight,
  annotations,
  className,
  onMaskSelectionChange,
  onBboxComplete,
}: InteractiveAnnotationCanvasProps) {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  // States
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point>({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  
  // Drawing states
  const [isDrawingBbox, setIsDrawingBbox] = useState(false);
  const [drawingStart, setDrawingStart] = useState<Point>({ x: 0, y: 0 });
  const [drawingCurrent, setDrawingCurrent] = useState<Point>({ x: 0, y: 0 });
  const [currentBbox, setCurrentBbox] = useState<BoundingBox | null>(null);
  
  // Mask states
  const [maskStates, setMaskStates] = useState<Record<number, MaskState>>({});
  const [showMasks, setShowMasks] = useState(true);
  const [maskOpacity] = useState(0.6);

  // Constants
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 10;
  const ZOOM_STEP = 0.1;

  // Color palette for masks
  const COLOR_PALETTE = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  // Initialize mask states
  useEffect(() => {
    const initialStates: Record<number, MaskState> = {};
    annotations.forEach(annotation => {
      initialStates[annotation.id] = {
        id: annotation.id,
        selected: false,
        highlighted: false,
      };
    });
    setMaskStates(initialStates);
  }, [annotations]);

  // Load image and fit to container
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setLoadedImage(img);
      setImageLoaded(true);
      
      // Auto-fit image to container
      setTimeout(() => {
        fitToContainer();
      }, 100);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Fit image to container
  const fitToContainer = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || !imageLoaded) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 32; // padding
    const containerHeight = containerRect.height - 32;
    
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const newZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    setZoom(newZoom);
    
    // Center the image
    const scaledWidth = imageWidth * newZoom;
    const scaledHeight = imageHeight * newZoom;
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;
    
    setPanOffset({ x: offsetX, y: offsetY });
  }, [imageLoaded, imageWidth, imageHeight]);

  // Zoom to fit (entire image visible)
  const zoomToFit = useCallback(() => {
    fitToContainer();
  }, [fitToContainer]);

  // Zoom to fill (image fills container)
  const zoomToFill = useCallback(() => {
    if (!canvasRef.current || !containerRef.current || !imageLoaded) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 32;
    const containerHeight = containerRect.height - 32;
    
    const scaleX = containerWidth / imageWidth;
    const scaleY = containerHeight / imageHeight;
    const newZoom = Math.max(scaleX, scaleY);
    
    setZoom(newZoom);
    
    // Center the image
    const scaledWidth = imageWidth * newZoom;
    const scaledHeight = imageHeight * newZoom;
    const offsetX = (containerWidth - scaledWidth) / 2;
    const offsetY = (containerHeight - scaledHeight) / 2;
    
    setPanOffset({ x: offsetX, y: offsetY });
  }, [imageLoaded, imageWidth, imageHeight]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const zoomToPoint = useCallback((pointX: number, pointY: number, delta: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const canvasX = pointX - rect.left;
    const canvasY = pointY - rect.top;
    
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));
    
    if (newZoom !== zoom) {
      // Calculate the point in image coordinates before zoom
      const imageX = (canvasX - panOffset.x) / zoom;
      const imageY = (canvasY - panOffset.y) / zoom;
      
      // Update zoom
      setZoom(newZoom);
      
      // Calculate new pan offset to keep the point under cursor
      const newPanX = canvasX - imageX * newZoom;
      const newPanY = canvasY - imageY * newZoom;
      
      setPanOffset({ x: newPanX, y: newPanY });
    }
  }, [zoom, panOffset]);

  // Canvas coordinate conversion
  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    if (!canvasRef.current || !containerRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (screenX - rect.left) * scaleX,
      y: (screenY - rect.top) * scaleY,
    };
  }, []);

  const canvasToImage = useCallback((canvasX: number, canvasY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    return {
      x: Math.max(0, Math.min(imageWidth, (canvasX - panOffset.x) / zoom)),
      y: Math.max(0, Math.min(imageHeight, (canvasY - panOffset.y) / zoom)),
    };
  }, [zoom, panOffset, imageWidth, imageHeight]);

  // Check if point is inside polygon
  const isPointInPolygon = useCallback((point: Point, polygon: number[][]): boolean => {
    let inside = false;
    const x = point.x;
    const y = point.y;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }, []);

  // Check if bbox intersects with annotation
  const checkBboxIntersection = useCallback((bbox: BoundingBox, annotation: Annotation): boolean => {
    if (!annotation.mask_info.has_segmentation) return false;
    
    // Simple bbox intersection check first
    const [annX, annY, annWidth, annHeight] = annotation.bbox;
    const bboxRight = bbox.x + bbox.width;
    const bboxBottom = bbox.y + bbox.height;
    const annRight = annX + annWidth;
    const annBottom = annY + annHeight;
    
    if (bbox.x >= annRight || bboxRight <= annX || bbox.y >= annBottom || bboxBottom <= annY) {
      return false;
    }
    
    // Check if any polygon points are inside the bbox or vice versa
    for (const polygon of annotation.mask_info.polygons) {
      for (const point of polygon) {
        const [x, y] = point;
        if (x >= bbox.x && x <= bboxRight && y >= bbox.y && y <= bboxBottom) {
          return true;
        }
      }
    }
    
    return false;
  }, []);

  // Update mask selection based on bbox
  const updateMaskSelection = useCallback((bbox: BoundingBox) => {
    const newMaskStates = { ...maskStates };
    
    annotations.forEach(annotation => {
      const intersects = checkBboxIntersection(bbox, annotation);
      if (newMaskStates[annotation.id]) {
        newMaskStates[annotation.id] = {
          ...newMaskStates[annotation.id],
          selected: intersects,
          highlighted: false,
        };
      }
    });
    
    setMaskStates(newMaskStates);
    
    // Notify parent component
    const selectedIds = Object.values(newMaskStates)
      .filter(state => state.selected)
      .map(state => state.id);
    
    onMaskSelectionChange?.(selectedIds);
  }, [maskStates, annotations, checkBboxIntersection, onMaskSelectionChange]);

  // Toggle mask selection
  const toggleMaskSelection = useCallback((maskId: number) => {
    setMaskStates(prev => {
      const newStates = {
        ...prev,
        [maskId]: {
          ...prev[maskId],
          selected: !prev[maskId]?.selected,
        },
      };
      
      // Notify parent component
      const selectedIds = Object.values(newStates)
        .filter(state => state.selected)
        .map(state => state.id);
      
      onMaskSelectionChange?.(selectedIds);
      
      return newStates;
    });
  }, [onMaskSelectionChange]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    if (!canvasRef.current || !loadedImage || !imageLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);
    ctx.drawImage(loadedImage, 0, 0, imageWidth, imageHeight);
    ctx.restore();
    
    if (showMasks) {
      // Draw masks
      annotations.forEach((annotation, index) => {
        if (!annotation.mask_info.has_segmentation) return;
        
        const maskState = maskStates[annotation.id];
        if (!maskState) return;
        
        const color = COLOR_PALETTE[index % COLOR_PALETTE.length];
        const alpha = maskState.selected ? maskOpacity : maskOpacity * 0.3;
        
        ctx.save();
        ctx.translate(panOffset.x, panOffset.y);
        ctx.scale(zoom, zoom);
        
        // Draw polygons
        annotation.mask_info.polygons.forEach(polygon => {
          if (polygon.length < 3) return;
          
          ctx.beginPath();
          ctx.moveTo(polygon[0][0], polygon[0][1]);
          
          for (let i = 1; i < polygon.length; i++) {
            ctx.lineTo(polygon[i][0], polygon[i][1]);
          }
          
          ctx.closePath();
          
          // Fill
          ctx.globalAlpha = alpha;
          ctx.fillStyle = color;
          ctx.fill();
          
          // Stroke
          ctx.globalAlpha = maskState.selected ? 1 : 0.5;
          ctx.strokeStyle = maskState.selected ? '#FFFFFF' : color;
          ctx.lineWidth = maskState.selected ? 3 / zoom : 1 / zoom;
          ctx.stroke();
        });
        
        ctx.restore();
      });
    }
    
    // Draw current bbox being drawn
    if (isDrawingBbox && currentBbox) {
      ctx.save();
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoom, zoom);
      
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 5 / zoom]);
      ctx.strokeRect(currentBbox.x, currentBbox.y, currentBbox.width, currentBbox.height);
      
      ctx.restore();
    }
  }, [
    loadedImage, imageLoaded, imageWidth, imageHeight, zoom, panOffset,
    showMasks, annotations, maskStates, COLOR_PALETTE, maskOpacity,
    isDrawingBbox, currentBbox
  ]);

  // Handle resize
  const handleResize = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    canvasRef.current.width = rect.width;
    canvasRef.current.height = rect.height;
    
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setPanMode(true);
      }
    };

    const handleKeyUp = (e: globalThis.KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setPanMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    zoomToPoint(e.clientX, e.clientY, -e.deltaY);
  }, [zoomToPoint]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
    const imagePoint = canvasToImage(canvasPoint.x, canvasPoint.y);
    
    // Check if we're in pan mode or middle mouse button
    if (panMode || e.button === 1 || e.button === 2) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Check if clicking on a mask
    let clickedMask = false;
    for (const annotation of annotations) {
      if (!annotation.mask_info.has_segmentation) continue;
      
      for (const polygon of annotation.mask_info.polygons) {
        if (isPointInPolygon(imagePoint, polygon)) {
          toggleMaskSelection(annotation.id);
          clickedMask = true;
          break;
        }
      }
      
      if (clickedMask) break;
    }
    
    // If not clicking on mask, start drawing bbox or panning
    if (!clickedMask) {
      // Start drawing bbox
      setIsDrawingBbox(true);
      setDrawingStart(imagePoint);
      setDrawingCurrent(imagePoint);
      setCurrentBbox({
        id: `temp_${Date.now()}`,
        x: imagePoint.x,
        y: imagePoint.y,
        width: 0,
        height: 0,
        label: "entity",
        confidence: 1.0,
      });
    }
  }, [screenToCanvas, canvasToImage, annotations, isPointInPolygon, toggleMaskSelection, panMode]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x;
        const deltaY = e.clientY - lastPanPoint.y;
        
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      } else if (isDrawingBbox) {
        const canvasPoint = screenToCanvas(e.clientX, e.clientY);
        const imagePoint = canvasToImage(canvasPoint.x, canvasPoint.y);
        
        setDrawingCurrent(imagePoint);
        
        const bbox: BoundingBox = {
          id: `temp_${Date.now()}`,
          x: Math.min(drawingStart.x, imagePoint.x),
          y: Math.min(drawingStart.y, imagePoint.y),
          width: Math.abs(imagePoint.x - drawingStart.x),
          height: Math.abs(imagePoint.y - drawingStart.y),
          label: "entity",
          confidence: 1.0,
        };
        
        setCurrentBbox(bbox);
      }
    });
  }, [isPanning, isDrawingBbox, lastPanPoint, screenToCanvas, canvasToImage, drawingStart]);

  const handleMouseUp = useCallback(() => {
    if (isDrawingBbox && currentBbox && currentBbox.width > 10 && currentBbox.height > 10) {
      // Complete bbox drawing
      updateMaskSelection(currentBbox);
      onBboxComplete?.(currentBbox);
    }
    
    setIsDrawingBbox(false);
    setIsPanning(false);
    setCurrentBbox(null);
  }, [isDrawingBbox, currentBbox, updateMaskSelection, onBboxComplete]);

  // Prevent context menu
  const handleContextMenu = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const selectedMaskCount = Object.values(maskStates).filter(state => state.selected).length;

  const getCursor = () => {
    if (isPanning) return "grabbing";
    if (panMode) return "grab";
    if (isDrawingBbox) return "crosshair";
    return "default";
  };

  return (
    <Box
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: theme.colors.background.secondary,
        borderRadius: theme.borders.radius.md,
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: getCursor(),
        }}
      />
      
      {/* Instructions Overlay */}
      {imageLoaded && (
        <Box
          style={{
            position: "absolute",
            top: "16px",
            left: "50%",
            transform: "translateX(-50%)",
            background: `${theme.colors.background.card}95`,
            color: theme.colors.text.primary,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            borderRadius: theme.borders.radius.md,
            border: `1px solid ${theme.colors.border.primary}30`,
            boxShadow: `0 4px 16px ${theme.colors.background.primary}40`,
            backdropFilter: "blur(12px)",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              lineHeight: 1.4,
            }}
          >
            Draw bbox to select masks • Click masks to toggle • Space+drag to pan • Mouse wheel to zoom
          </Text>
        </Box>
      )}
      
      {/* Zoom and View Controls */}
      <Box
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.semantic.component.xs,
        }}
      >
        {/* Zoom Controls */}
        <Flex
          direction="column"
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            overflow: "hidden",
          }}
        >
          <Button
            onClick={zoomIn}
            style={{
              background: "transparent",
              color: theme.colors.text.primary,
              border: "none",
              borderBottom: `1px solid ${theme.colors.border.primary}`,
              borderRadius: 0,
              padding: theme.spacing.semantic.component.xs,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
            }}
          >
            <Plus size={14} />
          </Button>
          
          <Text
            size="1"
            style={{
              background: theme.colors.background.secondary,
              color: theme.colors.text.secondary,
              padding: `${theme.spacing.semantic.component.xs} 6px`,
              fontSize: "10px",
              fontFamily: 'JetBrains Mono, monospace',
              textAlign: "center",
              borderBottom: `1px solid ${theme.colors.border.primary}`,
              minWidth: "32px",
            }}
          >
            {Math.round(zoom * 100)}%
          </Text>
          
          <Button
            onClick={zoomOut}
            style={{
              background: "transparent",
              color: theme.colors.text.primary,
              border: "none",
              borderRadius: 0,
              padding: theme.spacing.semantic.component.xs,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
            }}
          >
            <Minus size={14} />
          </Button>
        </Flex>

        {/* View Mode Controls */}
        <Flex
          direction="column"
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            overflow: "hidden",
          }}
        >
          <Button
            onClick={zoomToFit}
            style={{
              background: "transparent",
              color: theme.colors.text.primary,
              border: "none",
              borderBottom: `1px solid ${theme.colors.border.primary}`,
              borderRadius: 0,
              padding: theme.spacing.semantic.component.xs,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
            }}
          >
            <CornersOut size={14} />
          </Button>
          
          <Button
            onClick={zoomToFill}
            style={{
              background: "transparent",
              color: theme.colors.text.primary,
              border: "none",
              borderRadius: 0,
              padding: theme.spacing.semantic.component.xs,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
            }}
          >
            <CornersIn size={14} />
          </Button>
        </Flex>

        {/* Pan Mode Indicator */}
        {panMode && (
          <Box
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              borderRadius: theme.borders.radius.sm,
              padding: theme.spacing.semantic.component.xs,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              minHeight: "32px",
            }}
          >
            <Hand size={14} />
          </Box>
        )}

        {/* Mask Visibility Toggle */}
        <Button
          onClick={() => setShowMasks(!showMasks)}
          style={{
            background: theme.colors.background.card,
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            padding: theme.spacing.semantic.component.xs,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.semantic.component.xs,
            minWidth: "32px",
            minHeight: "32px",
            justifyContent: "center",
          }}
        >
          {showMasks ? <EyeSlash size={14} /> : <Eye size={14} />}
        </Button>
        
        {/* Selected Mask Count */}
        {selectedMaskCount > 0 && (
          <Box
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              fontSize: "12px",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {selectedMaskCount} selected
          </Box>
        )}
      </Box>
    </Box>
  );
} 