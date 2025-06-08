import React from 'react';
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { CaretLeft, CaretRight } from "phosphor-react";
import { useImageNavigation } from '../hooks/useImageNavigation';

import { ImageData } from '../../annotation/types/workspace';

interface ImageNavigationPanelProps {
  images: ImageData[];
  currentImage: ImageData | null;
  onImageChange: (image: ImageData) => void;
}

export function ImageNavigationPanel({ images, currentImage, onImageChange }: ImageNavigationPanelProps) {
  const { theme } = useTheme();
  const {
    currentImageIndex,
    canGoNext,
    canGoPrevious,
    handleNext,
    handlePrevious,
    totalImages,
  } = useImageNavigation({ images, currentImage, onImageChange });

  return (
    <Box
      style={{
        width: "60px",
        background: theme.colors.background.card,
        borderRight: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex 
        direction="column" 
        align="center" 
        style={{ 
          padding: theme.spacing.semantic.component.sm, 
          gap: theme.spacing.semantic.component.xs 
        }}
      >
        <Button
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          style={{
            padding: theme.spacing.semantic.component.xs,
            background: "transparent",
            color: !canGoPrevious ? theme.colors.text.tertiary : theme.colors.text.primary,
            border: `1px solid ${!canGoPrevious ? theme.colors.border.secondary : theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            cursor: !canGoPrevious ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
          }}
        >
          <CaretLeft size={16} />
        </Button>
        
        <Text 
          size="1" 
          style={{ 
            fontWeight: 600, 
            color: theme.colors.text.primary,
            transform: "rotate(-90deg)",
            whiteSpace: "nowrap",
            fontSize: "10px"
          }}
        >
          {currentImageIndex + 1}/{totalImages}
        </Text>
        
        <Button
          onClick={handleNext}
          disabled={!canGoNext}
          style={{
            padding: theme.spacing.semantic.component.xs,
            background: "transparent",
            color: !canGoNext ? theme.colors.text.tertiary : theme.colors.text.primary,
            border: `1px solid ${!canGoNext ? theme.colors.border.secondary : theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            cursor: !canGoNext ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
          }}
        >
          <CaretRight size={16} />
        </Button>
      </Flex>
    </Box>
  );
} 