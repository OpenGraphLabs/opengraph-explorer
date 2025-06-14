import { useState, useCallback, useRef } from "react";
import { BoundingBox, Point } from "../types/workspace";

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "move";

interface BBoxHandle {
  type: ResizeHandle;
  x: number;
  y: number;
  size: number;
}

export function useBBoxInteraction(
  boundingBoxes: BoundingBox[],
  zoom: number,
  onUpdateBoundingBox?: (id: string, updates: Partial<BoundingBox>) => void
) {
  const [selectedBboxId, setSelectedBboxId] = useState<string | null>(null);
  const [isDraggingBbox, setIsDraggingBbox] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
  const [originalBbox, setOriginalBbox] = useState<BoundingBox | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  // Get BBox handles for editing
  const getBBoxHandles = useCallback(
    (bbox: BoundingBox): BBoxHandle[] => {
      const handleSize = Math.max(6, 8 / zoom); // Adaptive handle size
      const handles: BBoxHandle[] = [];

      // Corner handles
      handles.push(
        { type: "nw", x: bbox.x - handleSize / 2, y: bbox.y - handleSize / 2, size: handleSize },
        {
          type: "ne",
          x: bbox.x + bbox.width - handleSize / 2,
          y: bbox.y - handleSize / 2,
          size: handleSize,
        },
        {
          type: "se",
          x: bbox.x + bbox.width - handleSize / 2,
          y: bbox.y + bbox.height - handleSize / 2,
          size: handleSize,
        },
        {
          type: "sw",
          x: bbox.x - handleSize / 2,
          y: bbox.y + bbox.height - handleSize / 2,
          size: handleSize,
        }
      );

      // Edge handles (only show at reasonable zoom levels)
      if (zoom > 0.5) {
        handles.push(
          {
            type: "n",
            x: bbox.x + bbox.width / 2 - handleSize / 2,
            y: bbox.y - handleSize / 2,
            size: handleSize,
          },
          {
            type: "e",
            x: bbox.x + bbox.width - handleSize / 2,
            y: bbox.y + bbox.height / 2 - handleSize / 2,
            size: handleSize,
          },
          {
            type: "s",
            x: bbox.x + bbox.width / 2 - handleSize / 2,
            y: bbox.y + bbox.height - handleSize / 2,
            size: handleSize,
          },
          {
            type: "w",
            x: bbox.x - handleSize / 2,
            y: bbox.y + bbox.height / 2 - handleSize / 2,
            size: handleSize,
          }
        );
      }

      return handles;
    },
    [zoom]
  );

  // Check if point is inside BBox
  const isPointInBBox = useCallback((point: Point, bbox: BoundingBox): boolean => {
    return (
      point.x >= bbox.x &&
      point.x <= bbox.x + bbox.width &&
      point.y >= bbox.y &&
      point.y <= bbox.y + bbox.height
    );
  }, []);

  // Check if point is on a handle
  const getHandleAtPoint = useCallback(
    (point: Point, bbox: BoundingBox): ResizeHandle | null => {
      const handles = getBBoxHandles(bbox);

      // Check handles first (higher priority)
      for (const handle of handles) {
        if (
          point.x >= handle.x &&
          point.x <= handle.x + handle.size &&
          point.y >= handle.y &&
          point.y <= handle.y + handle.size
        ) {
          return handle.type;
        }
      }

      // Check if inside bbox for move
      if (isPointInBBox(point, bbox)) {
        return "move";
      }

      return null;
    },
    [getBBoxHandles, isPointInBBox]
  );

  // Update BBox based on handle drag with debouncing
  const updateBBoxFromHandle = useCallback(
    (
      originalBbox: BoundingBox,
      handle: ResizeHandle,
      currentPoint: Point,
      startPoint: Point
    ): Partial<BoundingBox> => {
      const deltaX = currentPoint.x - startPoint.x;
      const deltaY = currentPoint.y - startPoint.y;
      const minSize = 10; // Minimum bbox size

      switch (handle) {
        case "move":
          return {
            x: Math.max(0, originalBbox.x + deltaX),
            y: Math.max(0, originalBbox.y + deltaY),
          };
        case "nw":
          return {
            x: Math.max(0, originalBbox.x + deltaX),
            y: Math.max(0, originalBbox.y + deltaY),
            width: Math.max(minSize, originalBbox.width - deltaX),
            height: Math.max(minSize, originalBbox.height - deltaY),
          };
        case "ne":
          return {
            y: Math.max(0, originalBbox.y + deltaY),
            width: Math.max(minSize, originalBbox.width + deltaX),
            height: Math.max(minSize, originalBbox.height - deltaY),
          };
        case "se":
          return {
            width: Math.max(minSize, originalBbox.width + deltaX),
            height: Math.max(minSize, originalBbox.height + deltaY),
          };
        case "sw":
          return {
            x: Math.max(0, originalBbox.x + deltaX),
            width: Math.max(minSize, originalBbox.width - deltaX),
            height: Math.max(minSize, originalBbox.height + deltaY),
          };
        case "n":
          return {
            y: Math.max(0, originalBbox.y + deltaY),
            height: Math.max(minSize, originalBbox.height - deltaY),
          };
        case "e":
          return {
            width: Math.max(minSize, originalBbox.width + deltaX),
          };
        case "s":
          return {
            height: Math.max(minSize, originalBbox.height + deltaY),
          };
        case "w":
          return {
            x: Math.max(0, originalBbox.x + deltaX),
            width: Math.max(minSize, originalBbox.width - deltaX),
          };
        default:
          return {};
      }
    },
    []
  );

  // Throttled update function
  const throttledUpdate = useCallback(
    (id: string, updates: Partial<BoundingBox>) => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        if (onUpdateBoundingBox) {
          onUpdateBoundingBox(id, updates);
        }
      }, 16); // ~60fps
    },
    [onUpdateBoundingBox]
  );

  // Start BBox interaction
  const startBBoxInteraction = useCallback(
    (bbox: BoundingBox, handle: ResizeHandle, startPoint: Point) => {
      setSelectedBboxId(bbox.id);
      setIsDraggingBbox(true);
      setActiveHandle(handle);
      setOriginalBbox(bbox);
      setDragStartPoint(startPoint);
    },
    []
  );

  // Update BBox during interaction
  const updateBBoxInteraction = useCallback(
    (currentPoint: Point) => {
      if (isDraggingBbox && activeHandle && originalBbox) {
        const updates = updateBBoxFromHandle(
          originalBbox,
          activeHandle,
          currentPoint,
          dragStartPoint
        );
        throttledUpdate(originalBbox.id, updates);
      }
    },
    [
      isDraggingBbox,
      activeHandle,
      originalBbox,
      dragStartPoint,
      updateBBoxFromHandle,
      throttledUpdate,
    ]
  );

  // End BBox interaction
  const endBBoxInteraction = useCallback(() => {
    setIsDraggingBbox(false);
    setActiveHandle(null);
    setOriginalBbox(null);

    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
  }, []);

  // Get cursor style based on handle
  const getCursorForHandle = useCallback((handle: ResizeHandle | null): string => {
    if (!handle) return "default";

    switch (handle) {
      case "nw":
      case "se":
        return "nw-resize";
      case "ne":
      case "sw":
        return "ne-resize";
      case "n":
      case "s":
        return "n-resize";
      case "e":
      case "w":
        return "e-resize";
      case "move":
        return "move";
      default:
        return "default";
    }
  }, []);

  return {
    selectedBboxId,
    setSelectedBboxId,
    isDraggingBbox,
    activeHandle,
    getBBoxHandles,
    getHandleAtPoint,
    getCursorForHandle,
    startBBoxInteraction,
    updateBBoxInteraction,
    endBBoxInteraction,
  };
}
