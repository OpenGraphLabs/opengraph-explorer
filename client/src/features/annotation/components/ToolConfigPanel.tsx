import React, { useState } from 'react';
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Target, Circle } from "phosphor-react";
import { AnnotationType } from '../types/workspace';
import { ToolConfig } from '../types/annotation';

interface ToolConfigPanelProps {
  config: ToolConfig;
  onAddLabel: (label: string) => void;
  onSelectLabel: (label: string) => void;
}

export function ToolConfigPanel({ config, onAddLabel, onSelectLabel }: ToolConfigPanelProps) {
  const { theme } = useTheme();
  const [newLabelInput, setNewLabelInput] = useState<string>('');

  const handleAddLabel = () => {
    if (newLabelInput.trim()) {
      onAddLabel(newLabelInput.trim());
      setNewLabelInput('');
    }
  };

  const handleLabelKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLabel();
    }
  };

  if (config.currentTool === 'label') {
    return (
      <Box>
        <Text
          as="p"
          size="3"
          style={{
            fontWeight: 700,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          🏷️ Add Image Labels
        </Text>
        
        <Text
          as="p"
          size="2"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.semantic.component.md,
            lineHeight: 1.4,
          }}
        >
          Describe what you see in this image with custom labels.
        </Text>
        
        {/* Enhanced Label Input */}
        <Box 
          style={{ 
            background: theme.colors.background.secondary,
            padding: theme.spacing.semantic.component.md,
            borderRadius: theme.borders.radius.md,
            border: `2px solid ${theme.colors.border.primary}`,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          <Text
            size="2"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            New Label
          </Text>
          
          <Flex direction="column" gap="2">
            <input
              type="text"
              value={newLabelInput}
              onChange={(e) => setNewLabelInput(e.target.value)}
              onKeyPress={handleLabelKeyPress}
              placeholder="e.g., person, car, building..."
              style={{
                width: "100%",
                padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.sm}`,
                border: `2px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                background: theme.colors.background.card,
                color: theme.colors.text.primary,
                fontSize: "16px",
                outline: "none",
                fontWeight: 500,
              }}
            />
            <Button
              onClick={handleAddLabel}
              disabled={!newLabelInput.trim()}
              style={{
                width: "100%",
                padding: theme.spacing.semantic.component.md,
                background: newLabelInput.trim() ? theme.colors.status.success : theme.colors.interactive.disabled,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                cursor: newLabelInput.trim() ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {newLabelInput.trim() ? `Add "${newLabelInput.trim()}"` : "Enter a label"}
            </Button>
          </Flex>
        </Box>

        {/* Previously Used Labels */}
        {config.existingLabels.length > 0 && (
          <Box>
            <Text
              as="p"
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              Recent Labels ({config.existingLabels.length})
            </Text>
            
            <Flex wrap="wrap" gap="1" style={{ maxHeight: "100px", overflowY: "auto" }}>
              {config.existingLabels.map((label) => (
                <Box
                  key={label}
                  onClick={() => setNewLabelInput(label)}
                  style={{
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    background: theme.colors.interactive.primary + "15",
                    color: theme.colors.interactive.primary,
                    border: `1px solid ${theme.colors.interactive.primary}30`,
                    borderRadius: theme.borders.radius.full,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </Box>
              ))}
            </Flex>
          </Box>
        )}
      </Box>
    );
  }

  if (config.currentTool === 'bbox') {
    return (
      <Box>
        <Text
          as="p"
          size="3"
          style={{
            fontWeight: 700,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          📦 Draw Bounding Boxes
        </Text>
        
        <Text
          as="p"
          size="2"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.semantic.component.md,
            lineHeight: 1.4,
          }}
        >
          Select an approved label, then draw boxes around objects.
        </Text>

        {config.existingLabels.length === 0 ? (
          <Box
            style={{
              padding: theme.spacing.semantic.component.md,
              background: theme.colors.status.warning + "15",
              border: `1px solid ${theme.colors.status.warning}30`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Text
              as="p"
              size="2"
              style={{
                color: theme.colors.status.warning,
                fontWeight: 600,
              }}
            >
              ⚠️ No approved labels yet
            </Text>
            <Text
              as="p"
              size="1"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
              Switch to Label tool first to create labels for this image.
            </Text>
          </Box>
        ) : (
          <Box>
            <Text
              as="p"
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              Select Label for BBox
            </Text>
            
            <Flex direction="column" gap="1">
              {config.existingLabels.map((label) => (
                <Box
                  key={label}
                  onClick={() => onSelectLabel(label)}
                  style={{
                    padding: theme.spacing.semantic.component.sm,
                    background: config.selectedLabel === label ? theme.colors.status.success : "transparent",
                    color: config.selectedLabel === label ? theme.colors.text.inverse : theme.colors.text.primary,
                    border: `2px solid ${config.selectedLabel === label ? theme.colors.status.success : theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Flex align="center" gap="2">
                    <Target size={14} />
                    <Text size="2" style={{ fontWeight: 600, color: "inherit" }}>
                      {label}
                    </Text>
                    {config.selectedLabel === label && (
                      <Text size="1" style={{ color: "inherit", marginLeft: "auto" }}>
                        ✓ Selected
                      </Text>
                    )}
                  </Flex>
                </Box>
              ))}
            </Flex>

            {config.selectedLabel && (
              <Box
                style={{
                  marginTop: theme.spacing.semantic.component.sm,
                  padding: theme.spacing.semantic.component.sm,
                  background: theme.colors.status.success + "15",
                  border: `1px solid ${theme.colors.status.success}30`,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                <Text
                  size="1"
                  style={{
                    color: theme.colors.status.success,
                    fontWeight: 600,
                  }}
                >
                  Ready to draw "{config.selectedLabel}" boxes! Click and drag on the image.
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }

  if (config.currentTool === 'segmentation') {
    return (
      <Box>
        <Text
          as="p"
          size="3"
          style={{
            fontWeight: 700,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          ✂️ Draw Segmentation
        </Text>
        
        <Text
          as="p"
          size="2"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.semantic.component.md,
            lineHeight: 1.4,
          }}
        >
          Select a bounding box, then draw precise segmentation.
        </Text>

        {config.boundingBoxes.length === 0 ? (
          <Box
            style={{
              padding: theme.spacing.semantic.component.md,
              background: theme.colors.status.warning + "15",
              border: `1px solid ${theme.colors.status.warning}30`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Text
              as="p"
              size="2"
              style={{
                color: theme.colors.status.warning,
                fontWeight: 600,
              }}
            >
              ⚠️ No bounding boxes yet
            </Text>
            <Text
              as="p"
              size="1"
              style={{
                color: theme.colors.text.secondary,
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
              Switch to BBox tool first to create bounding boxes.
            </Text>
          </Box>
        ) : (
          <Box>
            <Text
              as="p"
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              Select BBox for Segmentation
            </Text>
            
            <Flex direction="column" gap="1">
              {config.boundingBoxes.map((bbox) => (
                <Box
                  key={bbox.id}
                  onClick={() => onSelectLabel(bbox.label)}
                  style={{
                    padding: theme.spacing.semantic.component.sm,
                    background: config.selectedLabel === bbox.label ? theme.colors.status.warning : "transparent",
                    color: config.selectedLabel === bbox.label ? theme.colors.text.inverse : theme.colors.text.primary,
                    border: `2px solid ${config.selectedLabel === bbox.label ? theme.colors.status.warning : theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Flex align="center" gap="2">
                    <Circle size={14} />
                    <Box style={{ flex: 1 }}>
                      <Text size="2" style={{ fontWeight: 600, color: "inherit" }}>
                        {bbox.label}
                      </Text>
                      <Text size="1" style={{ color: "inherit", opacity: 0.7 }}>
                        {Math.round(bbox.width)} × {Math.round(bbox.height)}
                      </Text>
                    </Box>
                    {config.selectedLabel === bbox.label && (
                      <Text size="1" style={{ color: "inherit" }}>
                        ✓ Selected
                      </Text>
                    )}
                  </Flex>
                </Box>
              ))}
            </Flex>

            {config.selectedLabel && (
              <Box
                style={{
                  marginTop: theme.spacing.semantic.component.sm,
                  padding: theme.spacing.semantic.component.sm,
                  background: theme.colors.status.warning + "15",
                  border: `1px solid ${theme.colors.status.warning}30`,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                <Text
                  size="1"
                  style={{
                    color: theme.colors.status.warning,
                    fontWeight: 600,
                  }}
                >
                  Ready to segment "{config.selectedLabel}"! Click to start drawing polygon.
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }

  return null;
} 