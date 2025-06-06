import {
  Flex,
  Text,
  TextArea,
  Card,
} from "@radix-ui/themes";
import { DataObject } from "../../../shared/api/datasetGraphQLService";

interface AnnotationInterfaceProps {
  currentImage: DataObject;
  currentInput: string;
  onInputChange: (value: string) => void;
  onAnnotationSubmit: (labels: string[]) => void;
}

export function AnnotationInterface({
  currentImage,
  currentInput,
  onInputChange,
  onAnnotationSubmit,
}: AnnotationInterfaceProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (currentInput.trim()) {
        const labels = currentInput
          .split(',')
          .map(label => label.trim())
          .filter(label => label.length > 0);
        
        if (labels.length > 0) {
          onAnnotationSubmit(labels);
          onInputChange('');
        }
      }
    }
  };

  return (
    <Card style={{ padding: "16px" }}>
      <Flex direction="column" gap="3">
        <Text size="3" weight="medium">
          Add Annotation
        </Text>
        
        <Text size="2" style={{ color: "var(--gray-11)" }}>
          Current image: {currentImage.path}
        </Text>
        
        <TextArea
          placeholder="Enter labels separated by commas (e.g., cat, animal, pet)"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{
            minHeight: "80px",
            resize: "vertical",
          }}
        />
        
        <Text size="1" style={{ color: "var(--gray-9)" }}>
          Press Enter to add annotation • Use Shift+Enter for new line
        </Text>
      </Flex>
    </Card>
  );
} 