import React, { useMemo } from 'react';
import { Tag, Target, Circle } from "phosphor-react";
import { AnnotationToolConfig, ToolConfig } from '../types/annotation';
import { AnnotationType } from '../types/workspace';

export function useAnnotationTools(config: ToolConfig) {
  const tools: AnnotationToolConfig[] = useMemo(() => [
    {
      type: 'label' as AnnotationType,
      name: 'Image Label',
      icon: <Tag size={18} />,
      description: 'Free text input - describe what you see',
      hierarchy: 'Step 1'
    },
    {
      type: 'bbox' as AnnotationType,
      name: 'Bounding Box',
      icon: <Target size={18} />,
      description: 'Select approved labels, then draw boxes',
      hierarchy: 'Step 2'
    },
    {
      type: 'segmentation' as AnnotationType,
      name: 'Segmentation',
      icon: <Circle size={18} />,
      description: 'Select bounding boxes, then draw precise shapes',
      hierarchy: 'Step 3'
    }
  ], []);

  const canUseTool = useMemo(() => {
    switch (config.currentTool) {
      case 'bbox':
        return config.existingLabels.length > 0;
      case 'segmentation':
        return config.boundingBoxes.length > 0;
      default:
        return true;
    }
  }, [config.currentTool, config.existingLabels.length, config.boundingBoxes.length]);

  const getToolConstraintMessage = useMemo(() => {
    if (config.currentTool === 'bbox' && config.existingLabels.length === 0) {
      return '⚠️ Create labels first';
    } else if (config.currentTool === 'segmentation' && config.boundingBoxes.length === 0) {
      return '⚠️ Create bounding boxes first';
    } else if (config.currentTool === 'bbox' && !config.selectedLabel) {
      return '💡 Select a label to start drawing';
    } else if (config.currentTool === 'segmentation' && !config.selectedLabel) {
      return '💡 Select a bbox to start segmenting';
    } else if (config.currentTool === 'label') {
      return '💡 Type any label you want';
    }
    return null;
  }, [config]);

  return {
    tools,
    canUseTool,
    getToolConstraintMessage,
  };
} 