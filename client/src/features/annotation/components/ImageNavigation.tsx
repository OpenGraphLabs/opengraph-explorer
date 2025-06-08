import React from 'react';
import { Box, Flex, Text, Button, Progress } from '@radix-ui/themes';
import { ChevronLeft, ChevronRight, SkipBack, SkipForward } from 'lucide-react';
import { ImageData } from '../types/workspace';

interface ImageNavigationProps {
  images: ImageData[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const ImageNavigation: React.FC<ImageNavigationProps> = ({
  images,
  currentIndex,
  onNavigate,
  onNext,
  onPrevious
}) => {
  const currentImage = images[currentIndex];
  const progress = images.length > 0 ? ((currentIndex + 1) / images.length) * 100 : 0;

  return (
    <Box className="bg-white border-b border-gray-200 p-4">
      {/* Progress Bar */}
      <Box className="mb-4">
        <Flex justify="between" align="center" mb="2">
          <Text size="2" weight="medium">Progress</Text>
          <Text size="2" className="text-gray-500">
            {currentIndex + 1} of {images.length}
          </Text>
        </Flex>
        <Progress value={progress} className="w-full" />
      </Box>

      {/* Navigation Controls */}
      <Flex justify="between" align="center" mb="4">
        <Flex gap="2">
          <Button
            variant="outline"
            size="2"
            onClick={() => onNavigate(0)}
            disabled={currentIndex === 0}
          >
            <SkipBack size={16} />
          </Button>
          <Button
            variant="outline"
            size="2"
            onClick={onPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={16} />
          </Button>
        </Flex>

        <Text size="3" weight="medium">
          Image {currentIndex + 1}
        </Text>

        <Flex gap="2">
          <Button
            variant="outline"
            size="2"
            onClick={onNext}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="outline"
            size="2"
            onClick={() => onNavigate(images.length - 1)}
            disabled={currentIndex === images.length - 1}
          >
            <SkipForward size={16} />
          </Button>
        </Flex>
      </Flex>

      {/* Image Info */}
      {currentImage && (
        <Box className="bg-gray-50 p-3 rounded">
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="medium">{currentImage.filename}</Text>
            <Flex gap="2">
              {currentImage.completed && (
                <Box className="w-2 h-2 bg-green-500 rounded-full" title="Completed" />
              )}
              {currentImage.skipped && (
                <Box className="w-2 h-2 bg-yellow-500 rounded-full" title="Skipped" />
              )}
            </Flex>
          </Flex>
          <Text size="1" className="text-gray-500">
            {currentImage.width} × {currentImage.height}
          </Text>
        </Box>
      )}

      {/* Quick Jump Grid */}
      <Box className="mt-4">
        <Text size="2" weight="medium" className="mb-2 block">Quick Jump</Text>
        <Flex wrap="wrap" gap="1" className="max-h-24 overflow-y-auto">
          {images.map((image, index) => (
            <Button
              key={image.id}
              variant={index === currentIndex ? 'solid' : 'outline'}
              size="1"
              className={`w-8 h-8 p-0 text-xs ${
                index === currentIndex ? 'bg-blue-500' : ''
              } ${
                image.completed ? 'border-green-500' : ''
              } ${
                image.skipped ? 'border-yellow-500' : ''
              }`}
              onClick={() => onNavigate(index)}
            >
              {index + 1}
            </Button>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}; 