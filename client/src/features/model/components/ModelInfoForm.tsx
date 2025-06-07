import { ChangeEvent } from "react";
import { 
  Box, 
  Flex, 
  Text, 
  TextArea, 
  Select, 
  TextField 
} from "@/shared/ui/design-system/components";
import { 
  Card
} from "@/shared/ui/design-system/components/Card";
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
    <Card
      elevation="low"
      style={{
        padding: theme.spacing.semantic.component.lg,
        background: theme.colors.background.secondary,
        borderRadius: theme.borders.radius.lg,
        marginTop: theme.spacing.semantic.component.sm,
        border: `1px solid ${theme.colors.border.secondary}`,
      }}
    >
      <Flex direction="column" gap={theme.spacing.semantic.component.lg}>
        <Flex 
          gap={theme.spacing.semantic.component.lg} 
          direction={{ initial: "column", sm: "row" }}
        >
          {/* 모델 이름 */}
          <Box style={{ flex: 1 }}>
            <Flex align="baseline" gap="1" mb="1">
              <Text 
                as="label" 
                size="2" 
                style={{ 
                  fontWeight: theme.typography.label.fontWeight,
                  display: "block",
                  color: theme.colors.text.secondary,
                }}
              >
                Model Name
              </Text>
              <Text 
                size="1" 
                style={{ 
                  color: theme.colors.status.error,
                }}
              >
                *
              </Text>
            </Flex>
            <TextField.Root
              placeholder="Enter model name"
              value={modelInfo.name}
              onChange={handleNameChange}
              style={{
                width: "100%",
                borderRadius: theme.borders.radius.md,
                backgroundColor: theme.colors.background.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                transition: theme.animations.transitions.all,
                height: "34px",
              }}
            />
            <Text 
              size="1" 
              style={{ 
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
              A clear, concise name for your model
            </Text>
          </Box>

          {/* 모델 타입 */}
          <Box style={{ flex: 1 }}>
            <Flex align="baseline" gap="1" mb="1">
              <Text 
                as="label" 
                size="2" 
                style={{ 
                  fontWeight: theme.typography.label.fontWeight,
                  display: "block",
                  color: theme.colors.text.secondary,
                }}
              >
                Model Type
              </Text>
              <Text 
                size="1" 
                style={{ 
                  color: theme.colors.status.error,
                }}
              >
                *
              </Text>
            </Flex>
            <Select.Root value={modelInfo.modelType} onValueChange={handleModelTypeChange}>
              <Select.Trigger
                style={{
                  width: "100%",
                  borderRadius: theme.borders.radius.md,
                  padding: "7px 12px",
                  border: `1px solid ${theme.colors.border.primary}`,
                  background: theme.colors.background.primary,
                  fontSize: "14px",
                  transition: theme.animations.transitions.all,
                  boxShadow: theme.shadows.semantic.card.low,
                  cursor: "pointer",
                  height: "34px",
                  color: theme.colors.text.primary,
                }}
              >
                <Flex align="center" gap="2">
                  <span>
                    {MODEL_TYPE_OPTIONS.find(option => option.value === modelInfo.modelType)
                      ?.label || modelInfo.modelType}
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
            <Text 
              size="1" 
              style={{ 
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
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
              style={{ 
                fontWeight: theme.typography.label.fontWeight,
                display: "block",
                color: theme.colors.text.secondary,
              }}
            >
              Description
            </Text>
            <Text 
              size="1" 
              style={{ 
                color: theme.colors.status.error,
              }}
            >
              *
            </Text>
          </Flex>
          <TextArea
            placeholder="Enter model description..."
            value={modelInfo.description}
            onChange={handleDescriptionChange}
            style={{
              minHeight: "100px",
              width: "100%",
              padding: "8px 12px",
              fontSize: "14px",
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.primary}`,
              backgroundColor: theme.colors.background.primary,
              color: theme.colors.text.primary,
              transition: theme.animations.transitions.all,
              boxShadow: theme.shadows.semantic.card.low,
            }}
          />
          <Text 
            size="1" 
            style={{ 
              color: theme.colors.text.tertiary,
              marginTop: theme.spacing.semantic.component.xs,
            }}
          >
            Describe what your model does, how it was trained, and any specific use cases
          </Text>
        </Box>

        {/* 필수 필드 안내 */}
        <Text 
          size="1" 
          style={{ 
            color: theme.colors.text.tertiary,
            marginTop: theme.spacing.semantic.component.sm,
          }}
        >
          <span style={{ color: theme.colors.status.error }}>*</span> Required fields
        </Text>
      </Flex>
    </Card>
  );
}
