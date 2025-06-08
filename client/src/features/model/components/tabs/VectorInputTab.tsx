import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, Card, Button, TextArea } from "@radix-ui/themes";
import { Brain as BrainCircuit } from "phosphor-react";
import { VectorInfoDisplay, ImageData, FormattedVector } from "./VectorInfoDisplay";
import { useTheme } from "@/shared/ui/design-system";

interface VectorInputTabProps {
  firstLayerDimension: number;
  onVectorGenerated: (vector: number[]) => void;
}

export function VectorInputTab({ firstLayerDimension, onVectorGenerated }: VectorInputTabProps) {
  const { theme } = useTheme();
  const [inputText, setInputText] = useState<string>("");
  const [parsedVector, setParsedVector] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);

  // 입력된 벡터 문자열을 파싱하여 숫자 배열로 변환
  const handleVectorChange = (value: string) => {
    setInputText(value);

    try {
      // 쉼표로 분리된 문자열을 숫자 배열로 파싱
      const parsedVector = value
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "")
        .map(item => parseFloat(item));

      // 유효한 숫자로만 구성된 벡터인 경우 콜백 실행
      if (parsedVector.length > 0 && parsedVector.every(num => !isNaN(num))) {
        setParsedVector(parsedVector);
        onVectorGenerated(parsedVector);
      }
    } catch (error) {
      console.error("Vector parsing error:", error);
      setError("Invalid input. Please enter valid numbers separated by commas.");
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="3" mb="4">
        <BrainCircuit size={20} weight="duotone" style={{ color: theme.colors.interactive.primary }} />
        <Heading size="3">Input Vector</Heading>
      </Flex>

      <TextArea
        placeholder="Example: 1.0, 2.5, -3.0, 4.2, -1.5"
        value={inputText}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleVectorChange(e.target.value)}
        style={{
          minHeight: "80px",
          borderRadius: "8px",
          border: `1px solid ${theme.colors.border.primary}`,
          padding: "12px",
          fontSize: "14px",
          fontFamily: "monospace",
          background: theme.colors.background.primary,
          color: theme.colors.text.primary,
        }}
      />

      <Text size="1" style={{ color: theme.colors.text.secondary }}>
        Enter comma-separated values representing your input vector. These values will be processed
        using the model's scale factor.
      </Text>

      {error && (
        <Text size="1" style={{ color: theme.colors.status.error }}>
          {error}
        </Text>
      )}
    </Flex>
  );
}
