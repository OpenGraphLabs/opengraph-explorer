import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
} from "@radix-ui/themes";
import { getModelFiles } from "../../utils/modelUtils";

interface ModelFilesTabProps {
  model: {
    task_type: string;
  };
}

export function ModelFilesTab({ model }: ModelFilesTabProps) {
  return (
    <Card style={{ border: "none", boxShadow: "none" }}>
      <Flex direction="column" gap="4">
        <Heading size="4" style={{ color: "#FF5733", fontWeight: 700 }}>
          Model Files
        </Heading>
        <Text style={{ lineHeight: "1.6" }}>
          This model is stored on the Sui blockchain and consists of the following files.
        </Text>

        <Box style={{ background: "#F5F5F5", padding: "16px", borderRadius: "8px" }}>
          {getModelFiles(model.task_type).map((file, index) => (
            <Flex
              key={index}
              justify="between"
              py="2"
              style={{
                borderBottom:
                  index < getModelFiles(model.task_type).length - 1
                    ? "1px solid var(--gray-a2)"
                    : "none",
                padding: "12px 8px",
              }}
            >
              <Text size="2" style={{ fontFamily: "monospace" }}>
                {file.name}
              </Text>
              <Text size="2" color="gray">
                {file.size}
              </Text>
            </Flex>
          ))}
        </Box>
      </Flex>
    </Card>
  );
} 