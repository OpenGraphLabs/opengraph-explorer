import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
} from "@radix-ui/themes";
import { getModelArchitecture } from "../../utils/modelUtils";

interface ModelOverviewTabProps {
  model: {
    id: string;
    name: string;
    task_type: string;
    creator: string;
    createdAt: string;
    description: string;
  };
}

export function ModelOverviewTab({ model }: ModelOverviewTabProps) {
  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="4">
        <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
          Model Information
        </Heading>
        <Text style={{ lineHeight: "1.6" }}>
          {model.name} is a {getTaskName(model.task_type)} model developed by{" "}
          {model.creator}. This model is stored on the Sui blockchain and can run inference
          in a fully on-chain environment.
        </Text>

        <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
          Usage
        </Heading>
        <Text style={{ lineHeight: "1.6" }}>
          You can try this model directly in the Inference tab. You can also access it
          programmatically through Sui smart contracts.
        </Text>

        <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
          Model Architecture
        </Heading>
        <Text style={{ lineHeight: "1.6" }}>{getModelArchitecture(model.task_type)}</Text>

        <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
          On-chain Information
        </Heading>
        <Flex
          direction="column"
          gap="2"
          style={{ background: "#F5F5F5", padding: "16px", borderRadius: "8px" }}
        >
          <Text size="2" style={{ fontFamily: "monospace" }}>
            Object ID: {model.id}
          </Text>
          <Text size="2">Created: {new Date(model.createdAt).toLocaleDateString()}</Text>
          <Text size="2">Size: {Math.floor(Math.random() * 500) + 100}MB</Text>
        </Flex>
      </Flex>
    </Card>
  );
}

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    translation: "Translation",
  };
  return taskMap[taskId] || taskId;
} 