import { useState } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Tag, Info, User } from "phosphor-react";
import type { DatasetMetadata } from "../types/upload";

interface DatasetMetadataFormProps {
  metadata: DatasetMetadata;
  onUpdate: (updates: Partial<DatasetMetadata>) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export function DatasetMetadataForm({
  metadata,
  onUpdate,
  onAddTag,
  onRemoveTag,
}: DatasetMetadataFormProps) {
  const { theme } = useTheme();
  const [tagInput, setTagInput] = useState("");

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: e.target.value });
  };

  const handleCreatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ creator: e.target.value });
  };

  const handleTagAdd = () => {
    if (tagInput.trim()) {
      onAddTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const inputStyle = {
    width: "100%",
    height: "42px",
    padding: "0 14px",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: theme.borders.radius.md,
    border: `1px solid ${theme.colors.border.primary}`,
    backgroundColor: theme.colors.background.card,
    color: theme.colors.text.primary,
    transition: "all 0.2s ease",
    outline: "none",
    boxShadow: "none",
  };

  const textareaStyle = {
    ...inputStyle,
    height: "auto",
    minHeight: "90px",
    padding: "14px",
    lineHeight: "1.5",
    resize: "vertical" as const,
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = theme.colors.interactive.primary;
    e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}15`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = theme.colors.border.primary;
    e.target.style.boxShadow = "none";
  };

  const completedFields = [
    metadata.name.trim(),
    metadata.description.trim(),
  ].filter(Boolean).length;

  return (
    <Box>
      <Flex direction="column" gap={theme.spacing.semantic.component.lg}>
        {/* Dataset Name */}
        <Box>
          <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
            <Info size={14} style={{ color: theme.colors.interactive.primary }} />
            <Text
              as="label"
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Dataset Name
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.status.error,
                fontWeight: 600,
              }}
            >
              *
            </Text>
          </Flex>
          <input
            type="text"
            placeholder="e.g., 'CIFAR-10 Image Classification Dataset'"
            value={metadata.name}
            onChange={handleNameChange}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              marginTop: theme.spacing.semantic.component.xs,
              fontSize: "12px",
            }}
          >
            A clear, descriptive name for your training dataset
          </Text>
        </Box>

        {/* Description */}
        <Box>
          <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
            <Text
              as="label"
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Description
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.status.error,
                fontWeight: 600,
              }}
            >
              *
            </Text>
          </Flex>
          <textarea
            placeholder="Describe the dataset content, data collection methodology, preprocessing steps, and intended machine learning applications..."
            value={metadata.description}
            onChange={handleDescriptionChange}
            style={textareaStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              marginTop: theme.spacing.semantic.component.xs,
              fontSize: "12px",
            }}
          >
            Detailed information about dataset content, preprocessing, and intended use cases
          </Text>
        </Box>

        {/* Creator and Tags Row */}
        <Flex
          gap={theme.spacing.semantic.component.lg}
          direction={{ initial: "column", sm: "row" }}
        >
          {/* Creator */}
          <Box style={{ flex: 1 }}>
            <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
              <User size={14} style={{ color: theme.colors.interactive.primary }} />
              <Text
                as="label"
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Creator
              </Text>
            </Flex>
            <input
              type="text"
              placeholder="Your name or organization"
              value={metadata.creator}
              onChange={handleCreatorChange}
              style={inputStyle}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
                fontSize: "12px",
              }}
            >
              Leave blank to use wallet address
            </Text>
          </Box>

          {/* Tags */}
          <Box style={{ flex: 1 }}>
            <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
              <Tag size={14} style={{ color: theme.colors.interactive.primary }} />
              <Text
                as="label"
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Tags
              </Text>
            </Flex>
            <Flex gap={theme.spacing.semantic.component.xs} style={{ marginBottom: theme.spacing.semantic.component.sm }}>
              <input
                type="text"
                placeholder="computer-vision, nlp, medical..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                style={{ ...inputStyle, flex: 1 }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <Button
                onClick={handleTagAdd}
                disabled={!tagInput.trim()}
                style={{
                  height: "42px",
                  padding: "0 16px",
                  borderRadius: theme.borders.radius.md,
                  backgroundColor: tagInput.trim() 
                    ? theme.colors.interactive.primary 
                    : theme.colors.interactive.disabled,
                  border: "none",
                  color: theme.colors.text.inverse,
                  cursor: tagInput.trim() ? "pointer" : "not-allowed",
                  fontWeight: 500,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <PlusIcon width={16} height={16} />
                Add
              </Button>
            </Flex>

            {/* Tag Display */}
            {metadata.tags.length > 0 && (
              <Flex gap={theme.spacing.semantic.component.xs} wrap="wrap">
                {metadata.tags.map(tag => (
                  <Flex
                    key={tag}
                    align="center"
                    gap="1"
                    style={{
                      backgroundColor: `${theme.colors.interactive.primary}15`,
                      color: theme.colors.interactive.primary,
                      border: `1px solid ${theme.colors.interactive.primary}30`,
                      borderRadius: theme.borders.radius.full,
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    <Text size="1" style={{ color: "inherit" }}>{tag}</Text>
                    <button
                      onClick={() => onRemoveTag(tag)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: "inherit",
                        cursor: "pointer",
                        padding: "2px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "16px",
                        height: "16px",
                      }}
                    >
                      <Cross2Icon width={10} height={10} />
                    </button>
                  </Flex>
                ))}
              </Flex>
            )}

            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
                fontSize: "12px",
              }}
            >
              Add keywords to improve discoverability
            </Text>
          </Box>
        </Flex>

        {/* Progress Indicator */}
        <Box
          style={{
            padding: theme.spacing.semantic.component.md,
            borderRadius: theme.borders.radius.md,
            background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.primary}04)`,
            border: `1px solid ${theme.colors.interactive.primary}20`,
          }}
        >
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: metadata.name.trim() ? theme.colors.status.success : theme.colors.text.tertiary,
                }}
              />
              <Box
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: metadata.description.trim() ? theme.colors.status.success : theme.colors.text.tertiary,
                }}
              />
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  fontSize: "12px",
                  fontWeight: 500,
                  marginLeft: "8px",
                }}
              >
                {completedFields}/2 required fields completed
              </Text>
            </Flex>
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: "11px",
                fontStyle: "italic",
              }}
            >
              Required fields marked with *
            </Text>
          </Flex>
        </Box>

        {/* Validation Message */}
        {completedFields < 2 && (
          <Box
            style={{
              padding: theme.spacing.semantic.component.sm,
              backgroundColor: `${theme.colors.status.warning}10`,
              border: `1px solid ${theme.colors.status.warning}30`,
              borderRadius: theme.borders.radius.md,
            }}
          >
            <Flex align="center" gap="2">
              <Info size={14} style={{ color: theme.colors.status.warning }} />
              <Text
                size="1"
                style={{
                  color: theme.colors.status.warning,
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                Please fill in all required fields to continue
              </Text>
            </Flex>
          </Box>
        )}
      </Flex>
    </Box>
  );
}
