import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Card,
  TextField,
  TextArea,
  Badge,
} from "@radix-ui/themes";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";

interface DatasetMetadata {
  name: string;
  description: string;
  tags: string[];
  creator: string;
  labels?: string[];
  dataType?: string;
  dataSize?: number;
  dataCount?: number;
  license?: string;
}

interface DatasetMetadataFormProps {
  metadata: DatasetMetadata;
  onMetadataChange: (metadata: DatasetMetadata) => void;
}

export function DatasetMetadataForm({ metadata, onMetadataChange }: DatasetMetadataFormProps) {
  const [tagInput, setTagInput] = useState("");

  const handleTagAdd = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      onMetadataChange({
        ...metadata,
        tags: [...metadata.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onMetadataChange({
      ...metadata,
      tags: metadata.tags.filter(tag => tag !== tagToRemove),
    });
  };

  return (
    <Card
      style={{
        padding: "32px",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        border: "1px solid var(--gray-4)",
        background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
      }}
    >
      <Flex direction="column" gap="6">
        <Flex align="center" gap="3" mb="2">
          <Box
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
          >
            <Text size="4" style={{ fontWeight: "700", color: "white" }}>
              1
            </Text>
          </Box>
          <Heading size="5" style={{ fontWeight: 600 }}>
            Dataset Information
          </Heading>
        </Flex>

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
                onChange={e => onMetadataChange({ ...metadata, name: e.target.value })}
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
                onChange={e => onMetadataChange({ ...metadata, description: e.target.value })}
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
                onChange={e => onMetadataChange({ ...metadata, creator: e.target.value })}
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
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleTagAdd();
                      }
                    }}
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
                          onClick={() => handleTagRemove(tag)}
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
      </Flex>
    </Card>
  );
} 