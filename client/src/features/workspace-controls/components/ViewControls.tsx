import React from 'react';
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  ArrowsOut,
} from "phosphor-react";
import { useViewControls } from '../hooks/useViewControls';

interface ViewControlsProps {
  zoom: number;
  panOffset: { x: number; y: number };
  onZoomChange: (zoom: number) => void;
  onPanChange: (offset: { x: number; y: number }) => void;
}

export function ViewControls({ zoom, panOffset, onZoomChange, onPanChange }: ViewControlsProps) {
  const { theme } = useTheme();
  const { handleZoomIn, handleZoomOut, handleResetView, zoomPercentage } = useViewControls({
    zoom,
    panOffset,
    onZoomChange,
    onPanChange,
  });

  return (
    <Box>
      <Text
        as="p"
        size="2"
        style={{
          fontWeight: 600,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.semantic.component.md,
        }}
      >
        View Controls
      </Text>
      
      <Flex gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
        <Button
          onClick={handleZoomIn}
          style={{
            padding: theme.spacing.semantic.component.sm,
            background: "transparent",
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
          }}
        >
          <MagnifyingGlassPlus size={16} />
        </Button>
        <Button
          onClick={handleZoomOut}
          style={{
            padding: theme.spacing.semantic.component.sm,
            background: "transparent",
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
          }}
        >
          <MagnifyingGlassMinus size={16} />
        </Button>
        <Button
          onClick={handleResetView}
          style={{
            padding: theme.spacing.semantic.component.sm,
            background: "transparent",
            color: theme.colors.text.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
          }}
        >
          <ArrowsOut size={16} />
        </Button>
      </Flex>
      
      <Text
        as="p"
        size="1"
        style={{
          color: theme.colors.text.secondary,
          textAlign: "center",
          display: "block",
        }}
      >
        Zoom: {zoomPercentage}%
      </Text>
    </Box>
  );
} 