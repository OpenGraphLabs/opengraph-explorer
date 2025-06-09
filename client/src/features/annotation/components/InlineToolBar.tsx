import React, { useState, useRef, useEffect } from 'react';
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Tag, Target, Circle, Plus, CaretDown, Check, X, PaperPlaneRight } from "phosphor-react";
import { AnnotationType } from '@/features/annotation/types/workspace';
import { ChallengePhase } from '@/features/challenge';

interface InlineToolBarProps {
  currentTool: AnnotationType;
  selectedLabel: string | null;
  existingLabels: string[];
  boundingBoxes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  currentPhase: ChallengePhase;
  onToolChange: (tool: AnnotationType) => void;
  onAddLabel: (label: string) => void;
  onSelectLabel: (label: string) => void;
  isToolAllowed: (tool: AnnotationType) => boolean;
  getDisallowedMessage: (tool: AnnotationType) => string;
}

export function InlineToolBar({
  currentTool,
  selectedLabel,
  existingLabels,
  boundingBoxes,
  currentPhase,
  onToolChange,
  onAddLabel,
  onSelectLabel,
  isToolAllowed,
  getDisallowedMessage
}: InlineToolBarProps) {
  const { theme } = useTheme();
  const [newLabelInput, setNewLabelInput] = useState('');
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [showBBoxDropdown, setShowBBoxDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = [
    {
      type: 'label' as AnnotationType,
      name: 'Label',
      icon: <Tag size={18} />,
      color: theme.colors.status.info,
      step: 1,
    },
    {
      type: 'bbox' as AnnotationType,
      name: 'BBox',
      icon: <Target size={18} />,
      color: theme.colors.status.warning,
      step: 2,
    },
    {
      type: 'segmentation' as AnnotationType,
      name: 'Segment',
      icon: <Circle size={18} />,
      color: theme.colors.status.success,
      step: 3,
    },
  ];

  const handleAddLabel = () => {
    const trimmedLabel = newLabelInput.trim();
    if (trimmedLabel && !existingLabels.includes(trimmedLabel)) {
      onAddLabel(trimmedLabel);
      setNewLabelInput('');
    } else if (existingLabels.includes(trimmedLabel)) {
      // If duplicate, just clear the input
      setNewLabelInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    } else if (e.key === 'Escape') {
      setNewLabelInput('');
    }
  };

  // Auto-focus input when label tool is selected
  useEffect(() => {
    if (currentTool === 'label' && inputRef.current) {
      inputRef.current.focus();
    } else {
      setNewLabelInput('');
    }
  }, [currentTool]);

  const renderLabelPhaseTools = () => {
    const trimmedInput = newLabelInput.trim();
    const isDuplicate = trimmedInput && existingLabels.includes(trimmedInput);
    const canAdd = trimmedInput && !isDuplicate;
    
    return (
      <Flex align="center" gap="3">
        <Flex align="center" gap="2">
          <input
            ref={inputRef}
            type="text"
            value={newLabelInput}
            onChange={(e) => setNewLabelInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type label here..."
            style={{
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              border: `2px solid ${isDuplicate ? theme.colors.status.warning : theme.colors.status.info}`,
              borderRadius: theme.borders.radius.md,
              background: theme.colors.background.primary,
              color: theme.colors.text.primary,
              fontSize: "14px",
              outline: "none",
              fontWeight: 500,
              minWidth: '250px',
              transition: 'border-color 0.2s ease',
            }}
          />
          <Button
            onClick={handleAddLabel}
            disabled={!canAdd}
            style={{
              background: canAdd 
                ? `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`
                : theme.colors.interactive.disabled,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              cursor: canAdd ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.semantic.component.xs,
              boxShadow: canAdd ? theme.shadows.semantic.card.low : 'none',
              transition: 'all 0.2s ease',
            }}

          >
            <PaperPlaneRight size={16} />
            Add
          </Button>
        </Flex>

        {isDuplicate && (
          <Badge
            style={{
              background: `${theme.colors.status.warning}15`,
              color: theme.colors.status.warning,
              border: `1px solid ${theme.colors.status.warning}30`,
              padding: "4px 8px",
              borderRadius: theme.borders.radius.full,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            Already exists
          </Badge>
        )}

        {existingLabels.length > 0 && (
          <Badge
            style={{
              background: `${theme.colors.status.success}15`,
              color: theme.colors.status.success,
              border: `1px solid ${theme.colors.status.success}30`,
              padding: "4px 8px",
              borderRadius: theme.borders.radius.full,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {existingLabels.length} created
          </Badge>
        )}
      </Flex>
    );
  };

  const renderBBoxPhaseTools = () => {
    if (existingLabels.length === 0) {
      return (
        <Flex align="center" gap="2">
          <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
            ⚠️ Create labels first
          </Text>
          <Button
            onClick={() => onToolChange('label')}
            style={{
              background: theme.colors.status.warning,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Go to Labels
          </Button>
        </Flex>
      );
    }

    return (
      <Flex align="center" gap="2">
        <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
          Select label, then draw box:
        </Text>
        
        <Flex gap="1">
          {existingLabels.slice(0, 5).map((label) => (
            <Button
              key={label}
              onClick={() => onSelectLabel(label)}
              style={{
                background: selectedLabel === label 
                  ? theme.colors.status.warning 
                  : 'transparent',
                color: selectedLabel === label 
                  ? theme.colors.text.inverse 
                  : theme.colors.status.warning,
                border: `2px solid ${theme.colors.status.warning}`,
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: 'all 0.2s ease',
              }}
            >
              {label}
              {selectedLabel === label && <Check size={12} style={{ marginLeft: '4px' }} />}
            </Button>
          ))}
          
          {existingLabels.length > 5 && (
            <Box style={{ position: 'relative' }}>
              <Button
                onClick={() => setShowLabelDropdown(!showLabelDropdown)}
                style={{
                  background: 'transparent',
                  color: theme.colors.status.warning,
                  border: `1px solid ${theme.colors.status.warning}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                +{existingLabels.length - 5} <CaretDown size={10} />
              </Button>

              {showLabelDropdown && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1000,
                    background: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.md,
                    boxShadow: theme.shadows.semantic.card.medium,
                    padding: theme.spacing.semantic.component.sm,
                    minWidth: '150px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {existingLabels.slice(5).map((label) => (
                    <Box
                      key={label}
                      onClick={() => {
                        onSelectLabel(label);
                        setShowLabelDropdown(false);
                      }}
                      style={{
                        padding: theme.spacing.semantic.component.xs,
                        borderRadius: theme.borders.radius.sm,
                        cursor: 'pointer',
                        background: selectedLabel === label ? `${theme.colors.status.warning}15` : 'transparent',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <Text size="2" style={{ color: theme.colors.text.primary }}>
                        {label}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Flex>

        {selectedLabel && (
          <Badge
            style={{
              background: `${theme.colors.status.success}15`,
              color: theme.colors.status.success,
              border: `1px solid ${theme.colors.status.success}30`,
              padding: "2px 6px",
              borderRadius: theme.borders.radius.full,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            ✓ Ready to draw
          </Badge>
        )}
      </Flex>
    );
  };

  const renderSegmentationPhaseTools = () => {
    if (boundingBoxes.length === 0) {
      return (
        <Flex align="center" gap="2">
          <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
            ⚠️ Create bounding boxes first
          </Text>
          <Button
            onClick={() => onToolChange('bbox')}
            style={{
              background: theme.colors.status.success,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Go to BBox
          </Button>
        </Flex>
      );
    }

    return (
      <Flex align="center" gap="2">
        <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
          Select box, then draw polygon:
        </Text>
        
        <Flex gap="1">
          {boundingBoxes.slice(0, 4).map((bbox) => (
            <Button
              key={bbox.id}
              onClick={() => onSelectLabel(bbox.label)}
              style={{
                background: selectedLabel === bbox.label 
                  ? theme.colors.status.success 
                  : 'transparent',
                color: selectedLabel === bbox.label 
                  ? theme.colors.text.inverse 
                  : theme.colors.status.success,
                border: `2px solid ${theme.colors.status.success}`,
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: 'all 0.2s ease',
              }}
            >
              {bbox.label}
              {selectedLabel === bbox.label && <Check size={12} style={{ marginLeft: '4px' }} />}
            </Button>
          ))}
          
          {boundingBoxes.length > 4 && (
            <Box style={{ position: 'relative' }}>
              <Button
                onClick={() => setShowBBoxDropdown(!showBBoxDropdown)}
                style={{
                  background: 'transparent',
                  color: theme.colors.status.success,
                  border: `1px solid ${theme.colors.status.success}`,
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                +{boundingBoxes.length - 4} <CaretDown size={10} />
              </Button>

              {showBBoxDropdown && (
                <Box
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1000,
                    background: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.md,
                    boxShadow: theme.shadows.semantic.card.medium,
                    padding: theme.spacing.semantic.component.sm,
                    minWidth: '150px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }}
                >
                  {boundingBoxes.slice(4).map((bbox) => (
                    <Box
                      key={bbox.id}
                      onClick={() => {
                        onSelectLabel(bbox.label);
                        setShowBBoxDropdown(false);
                      }}
                      style={{
                        padding: theme.spacing.semantic.component.xs,
                        borderRadius: theme.borders.radius.sm,
                        cursor: 'pointer',
                        background: selectedLabel === bbox.label ? `${theme.colors.status.success}15` : 'transparent',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <Text size="2" style={{ color: theme.colors.text.primary }}>
                        {bbox.label}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Flex>

        {selectedLabel && (
          <Badge
            style={{
              background: `${theme.colors.status.success}15`,
              color: theme.colors.status.success,
              border: `1px solid ${theme.colors.status.success}30`,
              padding: "2px 6px",
              borderRadius: theme.borders.radius.full,
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            ✓ Ready to segment
          </Badge>
        )}
      </Flex>
    );
  };

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderBottom: 'none',
        borderRadius: `${theme.borders.radius.md} ${theme.borders.radius.md} 0 0`,
        padding: theme.spacing.semantic.component.md,
        boxShadow: theme.shadows.semantic.card.low,
      }}
    >
      <Flex justify="between" align="center">
        {/* Left: Tool Steps */}
        <Flex align="center" gap="3">
          {tools.map((tool, index) => {
            const isActive = tool.type === currentTool;
            const isCompleted = (tool.type === 'label' && existingLabels.length > 0) ||
                              (tool.type === 'bbox' && boundingBoxes.length > 0) ||
                              (tool.type === 'segmentation' && false); // TODO: track segmentation completion
            const isDisabled = !isToolAllowed(tool.type);
            
            return (
              <React.Fragment key={tool.type}>
                <Flex
                  align="center"
                  gap="1"
                  onClick={() => !isDisabled && onToolChange(tool.type)}
                  style={{
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.md,
                    background: isActive ? tool.color : isCompleted ? `${tool.color}15` : 'transparent',
                    color: isActive ? theme.colors.text.inverse : isDisabled ? theme.colors.text.tertiary : tool.color,
                    border: `1px solid ${isActive ? tool.color : isDisabled ? theme.colors.border.secondary : `${tool.color}40`}`,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  title={isDisabled ? getDisallowedMessage(tool.type) : undefined}
                >
                  {tool.icon}
                  <Text size="2" style={{ fontWeight: 600, color: 'inherit' }}>
                    {tool.name}
                  </Text>
                  <Badge
                    style={{
                      background: isActive ? `${theme.colors.text.inverse}20` : `${tool.color}15`,
                      color: isActive ? theme.colors.text.inverse : tool.color,
                      border: 'none',
                      padding: "1px 4px",
                      borderRadius: theme.borders.radius.full,
                      fontSize: "9px",
                      fontWeight: 700,
                    }}
                  >
                    {tool.step}
                  </Badge>
                </Flex>
                {index < tools.length - 1 && (
                  <Box
                    style={{
                      width: '8px',
                      height: '1px',
                      background: theme.colors.border.secondary,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Flex>

        {/* Right: Current Tool Actions */}
        <Box style={{ flex: 1, marginLeft: theme.spacing.semantic.component.lg }}>
          {currentTool === 'label' && renderLabelPhaseTools()}
          {currentTool === 'bbox' && renderBBoxPhaseTools()}
          {currentTool === 'segmentation' && renderSegmentationPhaseTools()}
        </Box>
      </Flex>
    </Box>
  );
} 