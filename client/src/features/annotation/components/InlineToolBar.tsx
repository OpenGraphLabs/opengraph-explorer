import React, { useState, useRef, useEffect } from "react";
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Tag, Target, Circle, Check, PaperPlaneRight } from "phosphor-react";
import { AnnotationType } from "@/features/annotation/types/workspace";
import { LabelSelector } from "./LabelSelector";

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
  onToolChange: (tool: AnnotationType) => void;
  onAddLabel: (label: string) => void;
  onSelectLabel: (label: string) => void;
}

export function InlineToolBar({
  currentTool,
  selectedLabel,
  existingLabels,
  boundingBoxes,
  onToolChange,
  onAddLabel,
  onSelectLabel,
}: InlineToolBarProps) {
  const { theme } = useTheme();
  const [newLabelInput, setNewLabelInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tools = [
    {
      type: "label" as AnnotationType,
      name: "Label",
      icon: <Tag size={18} />,
      color: theme.colors.status.info,
      step: 1,
    },
    {
      type: "bbox" as AnnotationType,
      name: "BBox",
      icon: <Target size={18} />,
      color: theme.colors.status.warning,
      step: 2,
    },
    {
      type: "segmentation" as AnnotationType,
      name: "Segment",
      icon: <Circle size={18} />,
      color: theme.colors.status.success,
      step: 3,
    },
  ];

  const handleAddLabel = () => {
    const trimmedLabel = newLabelInput.trim();
    if (trimmedLabel && !existingLabels.includes(trimmedLabel)) {
      onAddLabel(trimmedLabel);
      setNewLabelInput("");
    } else if (existingLabels.includes(trimmedLabel)) {
      // If duplicate, just clear the input
      setNewLabelInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddLabel();
    } else if (e.key === "Escape") {
      setNewLabelInput("");
    }
  };

  // Auto-focus input when label tool is selected
  useEffect(() => {
    if (currentTool === "label" && inputRef.current) {
      inputRef.current.focus();
    } else {
      setNewLabelInput("");
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
            onChange={e => setNewLabelInput(e.target.value)}
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
              minWidth: "250px",
              transition: "border-color 0.2s ease",
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
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.xs,
              boxShadow: canAdd ? theme.shadows.semantic.card.low : "none",
              transition: "all 0.2s ease",
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
        <Flex align="center" gap="3">
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.sm,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              background: `${theme.colors.status.warning}08`,
              border: `1px solid ${theme.colors.status.warning}30`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
              No labels available - switch to Label phase to create labels first
            </Text>
          </Box>
        </Flex>
      );
    }

    return (
      <Flex align="center" gap="3">
        <LabelSelector
          labels={existingLabels}
          selectedLabel={selectedLabel}
          onSelectLabel={onSelectLabel}
          maxVisibleLabels={3}
          compact={true}
        />

        {selectedLabel && (
          <Flex align="center" gap="2">
            <Badge
              style={{
                background: `${theme.colors.status.success}15`,
                color: theme.colors.status.success,
                border: `1px solid ${theme.colors.status.success}30`,
                padding: "4px 10px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <Check size={12} />
              Ready to draw
            </Badge>

            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              Click and drag on image
            </Text>
          </Flex>
        )}
      </Flex>
    );
  };

  const renderSegmentationPhaseTools = () => {
    if (boundingBoxes.length === 0) {
      return (
        <Flex align="center" gap="3">
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.sm,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              background: `${theme.colors.status.warning}08`,
              border: `1px solid ${theme.colors.status.warning}30`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Target size={16} style={{ color: theme.colors.status.warning }} />
            <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 600 }}>
              Create bounding boxes first to segment
            </Text>
          </Box>
          <Button
            onClick={() => onToolChange("bbox")}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.status.success}90)`,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              boxShadow: theme.shadows.semantic.card.low,
              transition: "all 0.2s ease",
            }}
          >
            Go to BBox
          </Button>
        </Flex>
      );
    }

    // Get unique labels from bounding boxes
    const uniqueLabels = Array.from(new Set(boundingBoxes.map(bbox => bbox.label)));

    return (
      <Flex align="center" gap="3">
        <LabelSelector
          labels={uniqueLabels}
          selectedLabel={selectedLabel}
          onSelectLabel={onSelectLabel}
          maxVisibleLabels={3}
          compact={true}
        />

        {selectedLabel && (
          <Flex align="center" gap="2">
            <Badge
              style={{
                background: `${theme.colors.status.success}15`,
                color: theme.colors.status.success,
                border: `1px solid ${theme.colors.status.success}30`,
                padding: "4px 10px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <Circle size={12} />
              Ready to segment
            </Badge>

            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              Click points to draw polygon
            </Text>
          </Flex>
        )}
      </Flex>
    );
  };

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderBottom: "none",
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
            const isCompleted =
              (tool.type === "label" && existingLabels.length > 0) ||
              (tool.type === "bbox" && boundingBoxes.length > 0) ||
              (tool.type === "segmentation" && false); // TODO: track segmentation completion

            return (
              <React.Fragment key={tool.type}>
                <Flex
                  align="center"
                  gap="1"
                  onClick={() => onToolChange(tool.type)}
                  style={{
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.md,
                    background: isActive
                      ? tool.color
                      : isCompleted
                        ? `${tool.color}15`
                        : "transparent",
                    color: isActive ? theme.colors.text.inverse : tool.color,
                    border: `1px solid ${isActive ? tool.color : `${tool.color}40`}`,
                    cursor: "pointer",
                    opacity: 1,
                    transition: "all 0.2s ease",
                  }}
                  title={undefined}
                >
                  {tool.icon}
                  <Text size="2" style={{ fontWeight: 600, color: "inherit" }}>
                    {tool.name}
                  </Text>
                  <Badge
                    style={{
                      background: isActive ? `${theme.colors.text.inverse}20` : `${tool.color}15`,
                      color: isActive ? theme.colors.text.inverse : tool.color,
                      border: "none",
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
                      width: "8px",
                      height: "1px",
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
          {currentTool === "label" && renderLabelPhaseTools()}
          {currentTool === "bbox" && renderBBoxPhaseTools()}
          {currentTool === "segmentation" && renderSegmentationPhaseTools()}
        </Box>
      </Flex>
    </Box>
  );
}
