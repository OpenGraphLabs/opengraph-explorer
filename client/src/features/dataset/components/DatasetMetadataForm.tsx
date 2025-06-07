import { Box, Flex, Text, TextField, TextArea, Button } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
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

  return (
    <Card
      elevation="low"
      style={{
        padding: theme.spacing.semantic.component.lg,
        borderRadius: theme.borders.radius.lg,
        border: `1px solid ${theme.colors.border.secondary}`,
        background: theme.colors.background.secondary,
        boxShadow: theme.shadows.semantic.card.low,
      }}
    >
      <Flex direction="column" gap={theme.spacing.semantic.component.lg}>
        <Box>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.semantic.component.sm,
              fontWeight: theme.typography.label.fontWeight,
            }}
          >
            Dataset Name *
          </Text>
          <TextField.Root
            placeholder="Enter a descriptive name for your dataset"
            value={metadata.name}
            onChange={e => onUpdate({ name: e.target.value })}
            style={{
              borderRadius: theme.borders.radius.md,
              backgroundColor: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.primary}`,
            }}
          />
        </Box>

        <Box>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.semantic.component.sm,
              fontWeight: theme.typography.label.fontWeight,
            }}
          >
            Description
          </Text>
          <TextArea
            placeholder="Describe the dataset content, source, and intended use case"
            value={metadata.description}
            onChange={e => onUpdate({ description: e.target.value })}
            style={{
              borderRadius: theme.borders.radius.md,
              backgroundColor: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              minHeight: "80px",
            }}
          />
        </Box>

        <Box>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.semantic.component.sm,
              fontWeight: theme.typography.label.fontWeight,
            }}
          >
            Creator Name
          </Text>
          <TextField.Root
            placeholder="Your name or organization (optional)"
            value={metadata.creator}
            onChange={e => onUpdate({ creator: e.target.value })}
            style={{
              borderRadius: theme.borders.radius.md,
              backgroundColor: theme.colors.background.primary,
              border: `1px solid ${theme.colors.border.primary}`,
            }}
          />
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              marginTop: theme.spacing.semantic.component.xs,
            }}
          >
            leave blank to use your wallet address
          </Text>
        </Box>

        {/* Tags Section */}
        <Box>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.semantic.component.sm,
              fontWeight: theme.typography.label.fontWeight,
            }}
          >
            Tags
          </Text>
          <Flex direction="column" gap={theme.spacing.semantic.component.md}>
            <Flex gap={theme.spacing.semantic.component.sm}>
              <TextField.Root
                style={{
                  flex: 1,
                  borderRadius: theme.borders.radius.md,
                  backgroundColor: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.primary}`,
                }}
                placeholder="Add tag (e.g., computer-vision)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button
                onClick={handleTagAdd}
                style={{
                  borderRadius: theme.borders.radius.md,
                  padding: `0 ${theme.spacing.semantic.component.md}`,
                  backgroundColor: theme.colors.interactive.secondary,
                  border: `1px solid ${theme.colors.interactive.secondary}`,
                  color: theme.colors.text.primary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                <PlusIcon />
                Add
              </Button>
            </Flex>

            {metadata.tags.length > 0 && (
              <Flex gap={theme.spacing.semantic.component.sm} wrap="wrap">
                {metadata.tags.map(tag => (
                  <Box
                    key={tag}
                    style={{
                      backgroundColor: theme.colors.interactive.primary,
                      color: theme.colors.text.inverse,
                      borderRadius: theme.borders.radius.sm,
                      padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.xs,
                    }}
                  >
                    {tag}
                    <Button
                      onClick={() => onRemoveTag(tag)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        color: theme.colors.text.inverse,
                        cursor: "pointer",
                        padding: "0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "16px",
                        height: "16px",
                      }}
                    >
                      <Cross2Icon width={10} height={10} />
                    </Button>
                  </Box>
                ))}
              </Flex>
            )}
          </Flex>
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              marginTop: theme.spacing.semantic.component.sm,
            }}
          >
            add tags to help categorize and discover your dataset
          </Text>
        </Box>
      </Flex>
    </Card>
  );
}
