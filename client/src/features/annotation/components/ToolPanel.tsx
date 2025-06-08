import React from 'react';
import { Box, Flex, Text, Button, Badge, Separator } from '@radix-ui/themes';
import { 
  MousePointer, 
  Square, 
  Pentagon, 
  Tag, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  RotateCcw 
} from 'lucide-react';
import { AnnotationType } from '../types/workspace';

interface ToolPanelProps {
  currentTool: AnnotationType;
  selectedLabel: string;
  availableLabels: string[];
  zoom: number;
  onToolChange: (tool: AnnotationType) => void;
  onLabelChange: (label: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSave: () => void;
  onReset: () => void;
  unsavedChanges: boolean;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({
  currentTool,
  selectedLabel,
  availableLabels,
  zoom,
  onToolChange,
  onLabelChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSave,
  onReset,
  unsavedChanges
}) => {
  const tools = [
    {
      type: 'label' as AnnotationType,
      name: 'Label',
      icon: Tag,
      description: 'Classify the entire image'
    },
    {
      type: 'bbox' as AnnotationType,
      name: 'Bounding Box',
      icon: Square,
      description: 'Draw rectangles around objects'
    },
    {
      type: 'segmentation' as AnnotationType,
      name: 'Segmentation',
      icon: Pentagon,
      description: 'Draw precise polygon shapes'
    }
  ];

  return (
    <Box className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <Box className="p-4 border-b border-gray-200">
        <Flex align="center" gap="2" mb="2">
          <Text size="4" weight="bold">Annotation Tools</Text>
          {unsavedChanges && (
            <Badge color="orange" size="1">Unsaved</Badge>
          )}
        </Flex>
      </Box>

      {/* Tools Section */}
      <Box className="p-4 border-b border-gray-200">
        <Text size="3" weight="medium" className="mb-3 block">Tools</Text>
        <Flex direction="column" gap="2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentTool === tool.type;
            
            return (
              <Button
                key={tool.type}
                variant={isActive ? 'solid' : 'outline'}
                size="3"
                className={`justify-start h-auto p-3 ${
                  isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'
                }`}
                onClick={() => onToolChange(tool.type)}
              >
                <Flex align="center" gap="3" className="w-full">
                  <Icon size={20} />
                  <Box className="flex-1 text-left">
                    <Text size="2" weight="medium" className="block">
                      {tool.name}
                    </Text>
                    <Text size="1" className="text-gray-500 block">
                      {tool.description}
                    </Text>
                  </Box>
                </Flex>
              </Button>
            );
          })}
        </Flex>
      </Box>

      {/* Labels Section */}
      <Box className="p-4 border-b border-gray-200 flex-1">
        <Text size="3" weight="medium" className="mb-3 block">Labels</Text>
        
        {/* Current Label */}
        {selectedLabel && (
          <Box className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
            <Text size="2" weight="medium" className="text-blue-700">
              Selected: {selectedLabel}
            </Text>
          </Box>
        )}
        
        {/* Available Labels */}
        <Flex direction="column" gap="2" className="max-h-60 overflow-y-auto">
          {availableLabels.map((label) => (
            <Button
              key={label}
              variant={selectedLabel === label ? 'solid' : 'outline'}
              size="2"
              className={`justify-start ${
                selectedLabel === label 
                  ? 'bg-blue-500 text-white' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onLabelChange(label)}
            >
              <Tag size={16} className="mr-2" />
              {label}
            </Button>
          ))}
        </Flex>
      </Box>

      {/* View Controls */}
      <Box className="p-4 border-b border-gray-200">
        <Text size="3" weight="medium" className="mb-3 block">View</Text>
        
        <Flex gap="2" mb="3">
          <Button
            variant="outline"
            size="2"
            onClick={onZoomIn}
            className="flex-1"
          >
            <ZoomIn size={16} />
          </Button>
          <Button
            variant="outline"
            size="2"
            onClick={onZoomOut}
            className="flex-1"
          >
            <ZoomOut size={16} />
          </Button>
          <Button
            variant="outline"
            size="2"
            onClick={onResetView}
            className="flex-1"
          >
            <RotateCcw size={16} />
          </Button>
        </Flex>
        
        <Box className="text-center">
          <Text size="2" className="text-gray-500">
            Zoom: {Math.round(zoom * 100)}%
          </Text>
        </Box>
      </Box>

      {/* Keyboard Shortcuts */}
      <Box className="p-4 border-b border-gray-200">
        <Text size="3" weight="medium" className="mb-3 block">Shortcuts</Text>
        
        <Flex direction="column" gap="2" className="text-sm text-gray-600">
          <Flex justify="between">
            <Text size="1">Mouse Wheel</Text>
            <Text size="1">Zoom</Text>
          </Flex>
          <Flex justify="between">
            <Text size="1">Ctrl + Click</Text>
            <Text size="1">Pan</Text>
          </Flex>
          <Flex justify="between">
            <Text size="1">Escape</Text>
            <Text size="1">Cancel</Text>
          </Flex>
          <Flex justify="between">
            <Text size="1">Delete</Text>
            <Text size="1">Remove</Text>
          </Flex>
          <Flex justify="between">
            <Text size="1">Double Click</Text>
            <Text size="1">Finish Polygon</Text>
          </Flex>
        </Flex>
      </Box>

      {/* Action Buttons */}
      <Box className="p-4 mt-auto">
        <Flex direction="column" gap="2">
          <Button
            variant="solid"
            size="3"
            onClick={onSave}
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={!unsavedChanges}
          >
            Save Annotations
          </Button>
          
          <Button
            variant="outline"
            size="3"
            onClick={onReset}
            className="w-full text-red-500 border-red-200 hover:bg-red-50"
          >
            Reset All
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}; 