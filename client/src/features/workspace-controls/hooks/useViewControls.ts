import { useCallback, useMemo } from 'react';

interface ViewControlsProps {
  zoom: number;
  panOffset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: { x: number; y: number }) => void;
}

export function useViewControls({ zoom, panOffset, onZoomChange, onPanChange }: ViewControlsProps) {
  const handleZoomIn = useCallback(() => {
    onZoomChange(zoom * 1.2);
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange(zoom / 1.2);
  }, [zoom, onZoomChange]);

  const handleResetView = useCallback(() => {
    onZoomChange(1);
    onPanChange({ x: 0, y: 0 });
  }, [onZoomChange, onPanChange]);

  const zoomPercentage = useMemo(() => Math.round(zoom * 100), [zoom]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleResetView,
    zoomPercentage,
  };
} 