import { Box, Flex, Text, Card, Badge, Button } from "@radix-ui/themes";
import { ReloadIcon, CheckCircledIcon, ExclamationTriangleIcon, UploadIcon } from "@radix-ui/react-icons";

interface UploadProgressState {
  totalFiles: number;
  status: "idle" | "uploading" | "creating" | "success" | "failed";
  progress: number;
  message: string;
}

interface UploadProgressProps {
  uploadProgress: UploadProgressState;
  onUpload: () => void;
  canUpload: boolean;
  uploadSuccess: boolean;
  error: string | null;
}

export function UploadProgress({ 
  uploadProgress, 
  onUpload, 
  canUpload, 
  uploadSuccess, 
  error 
}: UploadProgressProps) {
  return (
    <Flex direction="column" gap="4">
      {/* Upload Progress Status */}
      {uploadProgress.status !== "idle" && (
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            border: "1px solid var(--gray-3)",
            background: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
          }}
        >
          <Flex direction="column" gap="4">
            <Flex align="center" justify="between">
              <Text size="3" weight="bold">
                Upload Progress
              </Text>
              <Badge
                color={
                  uploadProgress.status === "success"
                    ? "green"
                    : uploadProgress.status === "failed"
                      ? "red"
                      : uploadProgress.status === "creating"
                        ? "blue"
                        : "orange"
                }
                style={{ fontSize: "12px", padding: "4px 12px" }}
              >
                {uploadProgress.status === "uploading" && "Processing..."}
                {uploadProgress.status === "creating" && "Creating Dataset..."}
                {uploadProgress.status === "success" && "Success"}
                {uploadProgress.status === "failed" && "Failed"}
              </Badge>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)" }}>
              {uploadProgress.message}
            </Text>

            {/* Progress Bar */}
            <Box
              style={{
                width: "100%",
                height: "8px",
                background: "var(--gray-3)",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  width: `${uploadProgress.progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, var(--blue-9) 0%, var(--violet-9) 100%)",
                  borderRadius: "4px",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>

            {uploadProgress.status === "creating" && (
              <Flex align="center" gap="2" justify="center">
                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                <Text size="2" style={{ color: "var(--blue-11)" }}>
                  Creating dataset on Sui blockchain...
                </Text>
              </Flex>
            )}
          </Flex>
        </Card>
      )}

      {/* Upload Button */}
      <Button
        onClick={onUpload}
        disabled={!canUpload}
        style={{
          background: !canUpload ? "var(--gray-6)" : "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          color: "white",
          cursor: !canUpload ? "not-allowed" : "pointer",
          padding: "0 32px",
          height: "48px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: !canUpload ? "none" : "0 4px 16px rgba(255, 107, 107, 0.3)",
          transition: "all 0.2s ease",
        }}
      >
        <Flex align="center" gap="3">
          {uploadProgress.status === "uploading" || uploadProgress.status === "creating" ? (
            <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <UploadIcon width={20} height={20} />
          )}
          <span>
            {uploadProgress.status === "uploading" || uploadProgress.status === "creating" 
              ? "Creating Dataset..." 
              : "Create Dataset"}
          </span>
        </Flex>
      </Button>

      {/* Success Message */}
      {uploadSuccess && (
        <Card
          style={{
            background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
            padding: "20px 24px",
            borderRadius: "12px",
            border: "1px solid #a3d9a4",
            boxShadow: "0 4px 12px rgba(40, 167, 69, 0.15)",
          }}
        >
          <Flex align="center" gap="3">
            <CheckCircledIcon style={{ color: "#28a745" }} width={20} height={20} />
            <Text size="3" weight="medium" style={{ color: "#155724" }}>
              Dataset created successfully! Redirecting to datasets page...
            </Text>
          </Flex>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card
          style={{
            background: "linear-gradient(135deg, #f8d7da 0%, #f1b2b7 100%)",
            padding: "20px 24px",
            borderRadius: "12px",
            border: "1px solid #f1b2b7",
            boxShadow: "0 4px 12px rgba(220, 53, 69, 0.15)",
          }}
        >
          <Flex align="center" gap="3">
            <ExclamationTriangleIcon style={{ color: "#dc3545" }} width={20} height={20} />
            <Text size="3" weight="medium" style={{ color: "#721c24" }}>
              {error}
            </Text>
          </Flex>
        </Card>
      )}
    </Flex>
  );
} 