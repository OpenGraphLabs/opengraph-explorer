import { Box, Flex, Button } from "@radix-ui/themes";
import { RocketIcon, ReloadIcon } from "@radix-ui/react-icons";
import type { ModelUploadState } from "../../types/upload";

interface UploadButtonProps {
  uploadState: ModelUploadState;
  isReadyForUpload: boolean;
  onUpload: () => void;
  onRetry: () => void;
  onClearError: () => void;
}

export function UploadButton({ 
  uploadState, 
  isReadyForUpload, 
  onUpload,
}: UploadButtonProps) {
  return (
    <Box style={{ marginTop: "8px" }}>
      <Button
        onClick={onUpload}
        disabled={uploadState.isUploading || !isReadyForUpload}
        style={{
          background: "#FF5733",
          color: "white",
          cursor: uploadState.isUploading || !isReadyForUpload ? "not-allowed" : "pointer",
          opacity: uploadState.isUploading || !isReadyForUpload ? 0.5 : 1,
          padding: "0 24px",
          height: "48px",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        {uploadState.isUploading ? (
          <Flex align="center" gap="2">
            <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
            <span>Uploading to Blockchain...</span>
          </Flex>
        ) : (
          <Flex align="center" gap="2">
            <RocketIcon />
            <span>Upload to Blockchain</span>
          </Flex>
        )}
      </Button>
    </Box>
  );
} 