import { Flex, Text, Card } from "@radix-ui/themes";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface StatusMessageProps {
  type: "success" | "error";
  message: string;
}

export function StatusMessage({ type, message }: StatusMessageProps) {
  const isSuccess = type === "success";
  
  return (
    <Card
      style={{
        background: isSuccess 
          ? "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)"
          : "linear-gradient(135deg, #f8d7da 0%, #f1b2b7 100%)",
        padding: "20px 24px",
        borderRadius: "12px",
        border: isSuccess 
          ? "1px solid #a3d9a4"
          : "1px solid #f1b2b7",
        boxShadow: isSuccess 
          ? "0 4px 12px rgba(40, 167, 69, 0.15)"
          : "0 4px 12px rgba(220, 53, 69, 0.15)",
      }}
    >
      <Flex align="center" gap="3">
        {isSuccess ? (
          <CheckCircledIcon style={{ color: "#28a745" }} width={20} height={20} />
        ) : (
          <ExclamationTriangleIcon style={{ color: "#dc3545" }} width={20} height={20} />
        )}
        <Text size="3" weight="medium" style={{ 
          color: isSuccess ? "#155724" : "#721c24" 
        }}>
          {message}
        </Text>
      </Flex>
    </Card>
  );
} 