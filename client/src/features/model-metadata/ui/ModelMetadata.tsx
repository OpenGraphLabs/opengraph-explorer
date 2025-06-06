import { Box, Flex, Text } from "@radix-ui/themes";

interface ModelMetadataProps {
  model: {
    task_type: string;
    accuracy?: number;
    parameters?: number;
    createdAt: string;
    version?: string;
  };
}

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification", 
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    "translation": "Translation",
  };
  return taskMap[taskId] || taskId;
}

export function ModelMetadata({ model }: ModelMetadataProps) {
  return (
    <Flex gap="4" mt="5">
      <Box
        style={{
          borderRadius: "8px",
          background: "#FFFFFF",
          border: "1px solid #FFE8E2",
          padding: "10px 14px",
          boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
        }}
      >
        <Flex align="center" gap="2">
          <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
            Task: {getTaskName(model.task_type)}
          </Text>
        </Flex>
      </Box>

      {model.accuracy && (
        <Box
          style={{
            borderRadius: "8px",
            background: "#FFFFFF", 
            border: "1px solid #FFE8E2",
            padding: "10px 14px",
            boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
          }}
        >
          <Flex align="center" gap="2">
            <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
              Accuracy: {(model.accuracy * 100).toFixed(1)}%
            </Text>
          </Flex>
        </Box>
      )}

      {model.parameters && (
        <Box
          style={{
            borderRadius: "8px",
            background: "#FFFFFF",
            border: "1px solid #FFE8E2", 
            padding: "10px 14px",
            boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
          }}
        >
          <Flex align="center" gap="2">
            <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
              Parameters: {model.parameters.toLocaleString()}
            </Text>
          </Flex>
        </Box>
      )}

      <Box
        style={{
          borderRadius: "8px",
          background: "#FFFFFF",
          border: "1px solid #FFE8E2",
          padding: "10px 14px", 
          boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
        }}
      >
        <Flex align="center" gap="2">
          <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
            Created: {new Date(model.createdAt).toLocaleDateString()}
          </Text>
        </Flex>
      </Box>

      {model.version && (
        <Box
          style={{
            borderRadius: "8px",
            background: "#FFFFFF",
            border: "1px solid #FFE8E2",
            padding: "10px 14px",
            boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
          }}
        >
          <Flex align="center" gap="2">
            <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
              Version: {model.version}
            </Text>
          </Flex>
        </Box>
      )}
    </Flex>
  );
} 