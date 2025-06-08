import { ChangeEvent } from "react";
import { Box, Flex, Text, Select } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { MODEL_TYPE_OPTIONS } from "../constants/upload";
import type { ModelUploadInfo } from "../types/upload";

interface ModelInfoFormProps {
  modelInfo: ModelUploadInfo;
  onUpdate: (updates: Partial<ModelUploadInfo>) => void;
}

export function ModelInfoForm({ modelInfo, onUpdate }: ModelInfoFormProps) {
  const { theme } = useTheme();

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
    <Box>
      <Flex direction="column" gap={theme.spacing.semantic.component.lg}>
        <Flex
          gap={theme.spacing.semantic.component.lg}
          direction={{ initial: "column", sm: "row" }}
        >
          {/* 모델 이름 */}
          <Box style={{ flex: 1 }}>
            <Flex
              align="center"
              gap="2"
              style={{ marginBottom: theme.spacing.semantic.component.sm }}
            >
              <Text
                as="label"
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Model Name
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
            <Box style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="e.g., MNIST Classifier v2.1"
                value={modelInfo.name}
                onChange={handleNameChange}
                style={{
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
                }}
                onFocus={e => {
                  e.target.style.borderColor = theme.colors.interactive.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}15`;
                }}
                onBlur={e => {
                  e.target.style.borderColor = theme.colors.border.primary;
                  e.target.style.boxShadow = "none";
                }}
              />
            </Box>
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
                fontSize: "12px",
              }}
            >
              Choose a descriptive name that reflects your model's purpose
            </Text>
          </Box>

          {/* 모델 타입 */}
          <Box style={{ flex: 1 }}>
            <Flex
              align="center"
              gap="2"
              style={{ marginBottom: theme.spacing.semantic.component.sm }}
            >
              <Text
                as="label"
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Model Type
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
            <Select.Root value={modelInfo.modelType} onValueChange={handleModelTypeChange}>
              <Select.Trigger
                style={{
                  width: "100%",
                  height: "42px",
                  borderRadius: theme.borders.radius.md,
                  padding: "0 14px",
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.card,
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  color: theme.colors.text.primary,
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                }}
                onFocus={(e: any) => {
                  e.target.style.borderColor = theme.colors.interactive.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}15`;
                }}
                onBlur={(e: any) => {
                  e.target.style.borderColor = theme.colors.border.primary;
                  e.target.style.boxShadow = "none";
                }}
              >
                <span>
                  {MODEL_TYPE_OPTIONS.find(option => option.value === modelInfo.modelType)?.label ||
                    "Select model type..."}
                </span>
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
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
                fontSize: "12px",
              }}
            >
              Classification, regression, or other ML task type
            </Text>
          </Box>
        </Flex>

        {/* 모델 설명 */}
        <Box>
          <Flex
            align="center"
            gap="2"
            style={{ marginBottom: theme.spacing.semantic.component.sm }}
          >
            <Text
              as="label"
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Model Description
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
          <Box style={{ position: "relative" }}>
            <textarea
              placeholder="Describe your model's architecture, training data, performance metrics, and intended use cases..."
              value={modelInfo.description}
              onChange={handleDescriptionChange}
              style={{
                minHeight: "120px",
                width: "100%",
                padding: "14px",
                fontSize: "14px",
                lineHeight: "1.5",
                fontWeight: 500,
                fontFamily: "inherit",
                borderRadius: theme.borders.radius.md,
                border: `1px solid ${theme.colors.border.primary}`,
                backgroundColor: theme.colors.background.card,
                color: theme.colors.text.primary,
                transition: "all 0.2s ease",
                outline: "none",
                resize: "vertical",
                boxShadow: "none",
              }}
              onFocus={e => {
                e.target.style.borderColor = theme.colors.interactive.primary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}15`;
              }}
              onBlur={e => {
                e.target.style.borderColor = theme.colors.border.primary;
                e.target.style.boxShadow = "none";
              }}
            />
          </Box>
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              marginTop: theme.spacing.semantic.component.xs,
              fontSize: "12px",
            }}
          >
            Include model architecture details, training methodology, performance benchmarks, and
            target applications
          </Text>
        </Box>

        {/* 진행 상황 표시 */}
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
                  background: modelInfo.name
                    ? theme.colors.status.success
                    : theme.colors.text.tertiary,
                }}
              />
              <Box
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: modelInfo.modelType
                    ? theme.colors.status.success
                    : theme.colors.text.tertiary,
                }}
              />
              <Box
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: modelInfo.description
                    ? theme.colors.status.success
                    : theme.colors.text.tertiary,
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
                {
                  [modelInfo.name, modelInfo.modelType, modelInfo.description].filter(Boolean)
                    .length
                }
                /3 fields completed
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
              All fields are required
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
}
