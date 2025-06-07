import { ChangeEvent } from "react";
import { Box, Flex, Text, TextArea, Select, TextField, Card } from "@radix-ui/themes";
import { MODEL_TYPE_OPTIONS } from "../constants/upload";
import type { ModelUploadInfo } from "../types/upload";

interface ModelInfoFormProps {
  modelInfo: ModelUploadInfo;
  onUpdate: (updates: Partial<ModelUploadInfo>) => void;
}

export function ModelInfoForm({ modelInfo, onUpdate }: ModelInfoFormProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ name: e.target.value });
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ description: e.target.value });
  };

  const handleModelTypeChange = (value: string) => {
    onUpdate({ modelType: value });
  };

  return (
    <Card
      style={{
        padding: "20px",
        background: "white",
        borderRadius: "10px",
        marginTop: "8px",
      }}
    >
      <Flex direction="column" gap="4">
        <Flex gap="4" direction={{ initial: "column", sm: "row" }}>
          {/* 모델 이름 */}
          <Box style={{ flex: 1 }}>
            <Flex align="baseline" gap="1" mb="1">
              <Text 
                as="label" 
                size="2" 
                style={{ fontWeight: 500, display: "block" }}
              >
                Model Name
              </Text>
              <Text size="1" style={{ color: "#FF5733" }}>*</Text>
            </Flex>
            <TextField.Root
              size="2"
              placeholder="Enter model name"
              value={modelInfo.name}
              onChange={handleNameChange}
              style={{
                width: "100%",
                borderRadius: "6px",
                transition: "all 0.2s ease",
                height: "34px",
              }}
            />
            <Text size="1" style={{ color: "var(--gray-9)", marginTop: "4px" }}>
              A clear, concise name for your model
            </Text>
          </Box>

          {/* 모델 타입 */}
          <Box style={{ flex: 1 }}>
            <Flex align="baseline" gap="1" mb="1">
              <Text
                as="label"
                size="2"
                style={{ fontWeight: 500, display: "block" }}
              >
                Model Type
              </Text>
              <Text size="1" style={{ color: "#FF5733" }}>*</Text>
            </Flex>
            <Select.Root 
              value={modelInfo.modelType} 
              onValueChange={handleModelTypeChange}
            >
              <Select.Trigger
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  border: "1px solid var(--gray-4)",
                  background: "white",
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                  cursor: "pointer",
                  height: "34px",
                }}
              >
                <Flex align="center" gap="2">
                  <span>
                    {MODEL_TYPE_OPTIONS.find(option => option.value === modelInfo.modelType)?.label || modelInfo.modelType}
                  </span>
                </Flex>
              </Select.Trigger>
              <Select.Content>
                {MODEL_TYPE_OPTIONS.map(option => (
                  <Select.Item 
                    key={option.value}
                    value={option.value} 
                    style={{ cursor: "pointer" }}
                  >
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Text size="1" style={{ color: "var(--gray-9)", marginTop: "4px" }}>
              The primary task your model performs
            </Text>
          </Box>
        </Flex>

        {/* 모델 설명 */}
        <Box>
          <Flex align="baseline" gap="1" mb="1">
            <Text
              as="label"
              size="2"
              style={{ fontWeight: 500, display: "block" }}
            >
              Description
            </Text>
            <Text size="1" style={{ color: "#FF5733" }}>*</Text>
          </Flex>
          <TextArea
            size="2"
            placeholder="Enter model description..."
            value={modelInfo.description}
            onChange={handleDescriptionChange}
            style={{
              minHeight: "100px",
              width: "100%",
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "1px solid var(--gray-4)",
              transition: "all 0.2s ease",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          />
          <Text size="1" style={{ color: "var(--gray-9)", marginTop: "4px" }}>
            Describe what your model does, how it was trained, and any specific use cases
          </Text>
        </Box>

        {/* 필수 필드 안내 */}
        <Text size="1" style={{ color: "var(--gray-10)", marginTop: "8px" }}>
          <span style={{ color: "#FF5733" }}>*</span> Required fields
        </Text>
      </Flex>
    </Card>
  );
} 