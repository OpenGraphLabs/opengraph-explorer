import {
  Box,
  Flex,
  Text,
  Button,
  Card,
} from "@radix-ui/themes";
import { TransactionStatus } from "../../annotation-interface/types";

interface TransactionStatusDisplayProps {
  status: TransactionStatus;
  onRetry?: () => void;
  onClose?: () => void;
}

export function TransactionStatusDisplay({
  status,
  onRetry,
  onClose,
}: TransactionStatusDisplayProps) {
  if (status.status === 'idle') return null;

  const getStatusColor = () => {
    switch (status.status) {
      case 'pending': 
        return { 
          bg: 'var(--blue-3)', 
          border: 'var(--blue-6)', 
          text: 'var(--blue-11)' 
        };
      case 'success': 
        return { 
          bg: 'var(--green-3)', 
          border: 'var(--green-6)', 
          text: 'var(--green-11)' 
        };
      case 'failed': 
        return { 
          bg: 'var(--red-3)', 
          border: 'var(--red-6)', 
          text: 'var(--red-11)' 
        };
      default: 
        return { 
          bg: 'var(--gray-3)', 
          border: 'var(--gray-6)', 
          text: 'var(--gray-11)' 
        };
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return (
          <Box
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              border: `3px solid ${colors.text}`,
              borderTop: "3px solid transparent",
              animation: "spin 1s linear infinite",
            }}
          />
        );
      case 'success':
        return (
          <Box
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: colors.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ✓
          </Box>
        );
      case 'failed':
        return (
          <Box
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: colors.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ✕
          </Box>
        );
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status.status) {
      case 'pending': return 'Transaction in Progress';
      case 'success': return 'Transaction Successful';
      case 'failed': return 'Transaction Failed';
      default: return '';
    }
  };

  const colors = getStatusColor();

  return (
    <Card
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "16px",
        animation: status.status === 'pending' ? 'pulse 2s ease-in-out infinite' : 'none',
      }}
    >
      <Flex align="center" gap="3" justify="between">
        <Flex align="center" gap="3">
          {getStatusIcon()}
          
          <Flex direction="column" gap="1">
            <Text size="3" weight="medium" style={{ color: colors.text }}>
              {getStatusTitle()}
            </Text>
            <Text size="2" style={{ color: colors.text, opacity: 0.8 }}>
              {status.message}
            </Text>
            {status.txHash && (
              <Text size="1" style={{ color: colors.text, opacity: 0.7, fontFamily: 'monospace' }}>
                TX: {status.txHash.substring(0, 20)}...
              </Text>
            )}
          </Flex>
        </Flex>

        <Flex gap="2">
          {/* 재시도 버튼 (실패 시에만) */}
          {status.status === 'failed' && onRetry && (
            <Button
              size="2"
              variant="soft"
              onClick={onRetry}
              style={{
                background: colors.text,
                color: 'white',
                borderRadius: "8px",
                padding: "0 16px",
              }}
            >
              Retry
            </Button>
          )}

          {/* 닫기 버튼 (성공/실패 시) */}
          {(status.status === 'success' || status.status === 'failed') && onClose && (
            <Button
              size="1"
              variant="ghost"
              onClick={onClose}
              style={{
                color: colors.text,
                opacity: 0.7,
                padding: "4px",
              }}
            >
              ✕
            </Button>
          )}
        </Flex>
      </Flex>
    </Card>
  );
} 