import { 
  Flex, 
  Text 
} from "@/shared/ui/design-system/components";
import { 
  Card
} from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { CheckCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface StatusMessageProps {
  type: "success" | "error";
  message: string;
}

export function StatusMessage({ type, message }: StatusMessageProps) {
  const { theme } = useTheme();
  const isSuccess = type === "success";

  const statusConfig = isSuccess 
    ? {
        backgroundColor: theme.colors.status.success,
        color: theme.colors.text.inverse,
        Icon: CheckCircledIcon,
      }
    : {
        backgroundColor: theme.colors.status.error,
        color: theme.colors.text.inverse,
        Icon: ExclamationTriangleIcon,
      };

  return (
    <Card
      elevation="medium"
      style={{
        background: statusConfig.backgroundColor,
        padding: theme.spacing.semantic.component.lg,
        borderRadius: theme.borders.radius.lg,
        border: `1px solid ${statusConfig.backgroundColor}`,
        boxShadow: theme.shadows.semantic.card.medium,
      }}
    >
      <Flex align="center" gap={theme.spacing.semantic.component.md}>
        <statusConfig.Icon 
          style={{ 
            color: statusConfig.color,
            flexShrink: 0,
          }} 
          width={20} 
          height={20} 
        />
        <Text
          size="3"
          style={{
            color: statusConfig.color,
            fontWeight: theme.typography.body.fontWeight,
            lineHeight: theme.typography.body.lineHeight,
          }}
        >
          {message}
        </Text>
      </Flex>
    </Card>
  );
}
