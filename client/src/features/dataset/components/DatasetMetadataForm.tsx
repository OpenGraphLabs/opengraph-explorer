import {
  Box,
  Flex,
  Text,
  TextField,
  TextArea,
  Badge,
  Button,
  Card,
} from "@radix-ui/themes";
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
      style={{
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid var(--gray-3)",
        background: "white",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Flex direction="column" gap="4">
        <Box>
          <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
            Dataset Name *
          </Text>
          <TextField.Root
            placeholder="Enter a descriptive name for your dataset"
            value={metadata.name}
            onChange={e => onUpdate({ name: e.target.value })}
            style={{ borderRadius: "8px" }}
          />
        </Box>
        
        <Box>
          <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
            Description
          </Text>
          <TextArea
            placeholder="Describe the dataset content, source, and intended use case"
            value={metadata.description}
            onChange={e => onUpdate({ description: e.target.value })}
            style={{ borderRadius: "8px", minHeight: "80px" }}
          />
        </Box>

        <Box>
          <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
            Creator Name
          </Text>
          <TextField.Root
            placeholder="Your name or organization (optional)"
            value={metadata.creator}
            onChange={e => onUpdate({ creator: e.target.value })}
            style={{ borderRadius: "8px" }}
          />
          <Text size="1" style={{ color: "var(--gray-9)", marginTop: "4px" }}>
            leave blank to use your wallet address
          </Text>
        </Box>

        {/* Tags Section */}
        <Box>
          <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
            Tags
          </Text>
          <Flex direction="column" gap="3">
            <Flex gap="2">
              <TextField.Root
                style={{ flex: 1, borderRadius: "8px" }}
                placeholder="Add tag (e.g., computer-vision)"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button 
                onClick={handleTagAdd}
                variant="soft"
                style={{ borderRadius: "8px", padding: "0 16px" }}
              >
                <PlusIcon />
                Add
              </Button>
            </Flex>
            
            {metadata.tags.length > 0 && (
              <Flex gap="2" wrap="wrap">
                {metadata.tags.map(tag => (
                  <Badge key={tag} color="blue" style={{ fontSize: "12px", padding: "4px 8px" }}>
                    {tag}
                    <Button
                      size="1"
                      variant="ghost"
                      onClick={() => onRemoveTag(tag)}
                      style={{ marginLeft: "6px" }}
                    >
                      <Cross2Icon width={10} height={10} />
                    </Button>
                  </Badge>
                ))}
              </Flex>
            )}
          </Flex>
          <Text size="1" style={{ color: "var(--gray-9)", marginBottom: "12px" }}>
            add tags to help categorize and discover your dataset
          </Text>
        </Box>
      </Flex>
    </Card>
  );
} 