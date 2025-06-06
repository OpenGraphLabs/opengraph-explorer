import {
  Flex,
  Text,
  Card,
  Button,
} from "@radix-ui/themes";
import {
  ReloadIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

interface ProgressIndicatorProps {
  uploadError: string | null;
  uploadSuccess: boolean;
  transactionInProgress: boolean;
  transactionHash: string | null;
  onDismissError: () => void;
  onRetry: () => void;
}

export function ProgressIndicator({
  uploadError,
  uploadSuccess,
  transactionInProgress,
  transactionHash,
  onDismissError,
  onRetry,
}: ProgressIndicatorProps) {
  if (!uploadError && !uploadSuccess && !transactionInProgress) {
    return null;
  }

  return (
    <>
      {uploadError && (
        <Card
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "16px",
            backgroundColor: "#FFEBEE",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <ExclamationTriangleIcon style={{ color: "#D32F2F", width: 20, height: 20 }} />
              <Text style={{ color: "#D32F2F", fontWeight: 500 }}>Upload Failed</Text>
            </Flex>
            <Text size="2" style={{ color: "#D32F2F" }}>
              {uploadError}
            </Text>
            <Flex gap="2" mt="2">
              <Button
                size="1"
                variant="soft"
                onClick={onDismissError}
                style={{
                  background: "#FFCDD2",
                  color: "#D32F2F",
                  cursor: "pointer",
                }}
              >
                Dismiss
              </Button>
              <Button
                size="1"
                onClick={onRetry}
                style={{
                  background: "#D32F2F",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Try Again
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {uploadSuccess && (
        <Card
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "10px 20px",
            backgroundColor: "#E8F5E9",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <CheckCircledIcon style={{ color: "#2E7D32", width: 20, height: 20 }} />
              <Text style={{ color: "#2E7D32", fontWeight: 500 }}>Upload Successful!</Text>
            </Flex>
            <Text size="2" style={{ color: "#2E7D32" }}>
              Your model has been successfully uploaded to the blockchain. Redirecting to
              models page...
            </Text>
            {transactionHash && (
              <Text
                size="1"
                style={{ marginTop: "4px", fontFamily: "monospace", color: "#2E7D32" }}
              >
                Transaction: {transactionHash.substring(0, 10)}...
              </Text>
            )}
          </Flex>
        </Card>
      )}

      {transactionInProgress && (
        <Card
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "10px 20px",
            backgroundColor: "#E3F2FD",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            animation: "slideIn 0.3s ease-out",
            marginTop: "16px",
          }}
        >
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <ReloadIcon
                style={{ color: "#1976D2", animation: "spin 1s linear infinite" }}
              />
              <Text style={{ color: "#1976D2", fontWeight: 500 }}>
                Transaction in Progress
              </Text>
            </Flex>
            <Text size="2" style={{ color: "#1976D2" }}>
              Please wait while we process your transaction. This may take a few moments...
            </Text>
          </Flex>
        </Card>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </>
  );
} 