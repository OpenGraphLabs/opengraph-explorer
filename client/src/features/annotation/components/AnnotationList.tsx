import React from 'react';
import { Box, Flex, Text, Button, Badge } from '@radix-ui/themes';
import { Square, Pentagon, Tag, Trash2, Eye, EyeOff } from 'lucide-react';
import { AnnotationData, AnnotationType } from '../types/workspace';

interface AnnotationListProps {
  annotations: AnnotationData;
  onSelectAnnotation?: (type: AnnotationType, id: string) => void;
  onDeleteAnnotation: (type: AnnotationType, id: string) => void;
  onToggleVisibility?: (type: AnnotationType, id: string) => void;
  selectedAnnotation?: { type: AnnotationType; id: string } | null;
}

export const AnnotationList: React.FC<AnnotationListProps> = ({
  annotations,
  onSelectAnnotation,
  onDeleteAnnotation,
  onToggleVisibility,
  selectedAnnotation
}) => {
  const getIcon = (type: AnnotationType) => {
    switch (type) {
      case 'label':
        return Tag;
      case 'bbox':
        return Square;
      case 'segmentation':
        return Pentagon;
    }
  };

  const getTypeColor = (type: AnnotationType) => {
    switch (type) {
      case 'label':
        return 'blue';
      case 'bbox':
        return 'green';
      case 'segmentation':
        return 'purple';
    }
  };

  const totalAnnotations = 
    annotations.labels.length + 
    annotations.boundingBoxes.length + 
    annotations.polygons.length;

  return (
    <Box className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <Box className="p-4 border-b border-gray-200">
        <Flex align="center" justify="between" mb="2">
          <Text size="4" weight="bold">Annotations</Text>
          <Badge variant="soft" size="1">
            {totalAnnotations}
          </Badge>
        </Flex>
        <Text size="2" className="text-gray-500">
          Current image annotations
        </Text>
      </Box>

      {/* Annotations List */}
      <Box className="flex-1 overflow-y-auto">
        {/* Labels */}
        {annotations.labels.length > 0 && (
          <Box className="p-4 border-b border-gray-100">
            <Flex align="center" gap="2" mb="3">
              <Tag size={16} className="text-blue-500" />
              <Text size="3" weight="medium">Labels</Text>
              <Badge variant="soft" color="blue" size="1">
                {annotations.labels.length}
              </Badge>
            </Flex>
            
            <Flex direction="column" gap="2">
              {annotations.labels.map((label) => {
                const Icon = getIcon('label');
                const isSelected = selectedAnnotation?.type === 'label' && selectedAnnotation?.id === label.id;
                
                return (
                  <Box
                    key={label.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectAnnotation?.('label', label.id)}
                  >
                    <Flex align="center" justify="between">
                      <Flex align="center" gap="2">
                        <Icon size={16} className="text-blue-500" />
                        <Text size="2" weight="medium">{label.label}</Text>
                      </Flex>
                      
                      <Flex align="center" gap="1">
                        {label.confidence && (
                          <Badge variant="soft" color="blue" size="1">
                            {Math.round(label.confidence * 100)}%
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAnnotation('label', label.id);
                          }}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* Bounding Boxes */}
        {annotations.boundingBoxes.length > 0 && (
          <Box className="p-4 border-b border-gray-100">
            <Flex align="center" gap="2" mb="3">
              <Square size={16} className="text-green-500" />
              <Text size="3" weight="medium">Bounding Boxes</Text>
              <Badge variant="soft" color="green" size="1">
                {annotations.boundingBoxes.length}
              </Badge>
            </Flex>
            
            <Flex direction="column" gap="2">
              {annotations.boundingBoxes.map((bbox) => {
                const Icon = getIcon('bbox');
                const isSelected = selectedAnnotation?.type === 'bbox' && selectedAnnotation?.id === bbox.id;
                
                return (
                  <Box
                    key={bbox.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectAnnotation?.('bbox', bbox.id)}
                  >
                    <Flex align="center" justify="between" mb="2">
                      <Flex align="center" gap="2">
                        <Icon size={16} className="text-green-500" />
                        <Text size="2" weight="medium">{bbox.label}</Text>
                      </Flex>
                      
                      <Flex align="center" gap="1">
                        {bbox.confidence && (
                          <Badge variant="soft" color="green" size="1">
                            {Math.round(bbox.confidence * 100)}%
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAnnotation('bbox', bbox.id);
                          }}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </Flex>
                    </Flex>
                    
                    <Text size="1" className="text-gray-500">
                      {Math.round(bbox.x)}, {Math.round(bbox.y)} • {Math.round(bbox.width)} × {Math.round(bbox.height)}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* Polygons */}
        {annotations.polygons.length > 0 && (
          <Box className="p-4 border-b border-gray-100">
                         <Flex align="center" gap="2" mb="3">
               <Pentagon size={16} className="text-purple-500" />
               <Text size="3" weight="medium">Polygons</Text>
              <Badge variant="soft" color="purple" size="1">
                {annotations.polygons.length}
              </Badge>
            </Flex>
            
            <Flex direction="column" gap="2">
              {annotations.polygons.map((polygon) => {
                const Icon = getIcon('segmentation');
                const isSelected = selectedAnnotation?.type === 'segmentation' && selectedAnnotation?.id === polygon.id;
                
                return (
                  <Box
                    key={polygon.id}
                    className={`p-3 rounded border cursor-pointer transition-colors ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectAnnotation?.('segmentation', polygon.id)}
                  >
                    <Flex align="center" justify="between" mb="2">
                      <Flex align="center" gap="2">
                        <Icon size={16} className="text-purple-500" />
                        <Text size="2" weight="medium">{polygon.label}</Text>
                      </Flex>
                      
                      <Flex align="center" gap="1">
                        {polygon.confidence && (
                          <Badge variant="soft" color="purple" size="1">
                            {Math.round(polygon.confidence * 100)}%
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="1"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteAnnotation('segmentation', polygon.id);
                          }}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </Flex>
                    </Flex>
                    
                    <Text size="1" className="text-gray-500">
                      {polygon.points.length} points
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          </Box>
        )}

        {/* Empty State */}
        {totalAnnotations === 0 && (
          <Box className="p-8 text-center">
            <Tag size={32} className="text-gray-300 mx-auto mb-4" />
            <Text size="3" weight="medium" className="text-gray-400 mb-2 block">
              No annotations yet
            </Text>
            <Text size="2" className="text-gray-400">
              Select a tool and start annotating the image
            </Text>
          </Box>
        )}
      </Box>

      {/* Quick Actions */}
      {totalAnnotations > 0 && (
        <Box className="p-4 border-t border-gray-200">
          <Text size="2" weight="medium" className="mb-3 block">Quick Actions</Text>
          
          <Flex direction="column" gap="2">
            <Button
              variant="outline"
              size="2"
              className="w-full justify-start text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => {
                // Clear all annotations for current image
                annotations.labels.forEach(label => onDeleteAnnotation('label', label.id));
                annotations.boundingBoxes.forEach(bbox => onDeleteAnnotation('bbox', bbox.id));
                annotations.polygons.forEach(polygon => onDeleteAnnotation('segmentation', polygon.id));
              }}
            >
              <Trash2 size={16} className="mr-2" />
              Clear All Annotations
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
}; 