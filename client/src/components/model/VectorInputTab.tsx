import {
  Box,
  Flex,
  Heading,
  Text,
  TextArea,
} from "@radix-ui/themes";
import { Brain as BrainCircuit } from "phosphor-react";
import { FormattedVector } from "./VectorInfoDisplay";

interface VectorInputTabProps {
  inputVector: string;
  setInputVector: (value: string) => void;
  onVectorChange: (vector: number[]) => void;
}

export function VectorInputTab({ 
  inputVector, 
  setInputVector, 
  onVectorChange 
}: VectorInputTabProps) {
  // 입력된 벡터 문자열을 파싱하여 숫자 배열로 변환
  const handleVectorChange = (value: string) => {
    setInputVector(value);
    
    try {
      // 쉼표로 분리된 문자열을 숫자 배열로 파싱
      const parsedVector = value
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '')
        .map(item => parseFloat(item));
      
      // 유효한 숫자로만 구성된 벡터인 경우 콜백 실행
      if (parsedVector.length > 0 && parsedVector.every(num => !isNaN(num))) {
        onVectorChange(parsedVector);
      }
    } catch (error) {
      console.error('Vector parsing error:', error);
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="3" mb="4">
        <BrainCircuit size={20} weight="duotone" style={{ color: "#FF5733" }} />
        <Heading size="3">Input Vector</Heading>
      </Flex>

      <TextArea
        placeholder="Example: 1.0, 2.5, -3.0, 4.2, -1.5"
        value={inputVector}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
          handleVectorChange(e.target.value)
        }
        style={{
          minHeight: "80px",
          borderRadius: "8px",
          border: "1px solid #FFE8E2",
          padding: "12px",
          fontSize: "14px",
          fontFamily: "monospace",
          background: "#FDFDFD",
        }}
      />
      
      <Text size="1" style={{ color: "#666" }}>
        Enter comma-separated values representing your input vector. These values will be processed using the model's scale factor.
      </Text>
    </Flex>
  );
} 