import { 
  Box, 
  Flex, 
  Button 
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { RocketIcon, ReloadIcon } from "@radix-ui/react-icons";
import type { ModelUploadState } from "../../types/upload";

interface UploadButtonProps {
  uploadState: ModelUploadState;
  isReadyForUpload: boolean;
  onUpload: () => void;
  onRetry: () => void;
  onClearError: () => void;
}

export function UploadButton({ uploadState, isReadyForUpload, onUpload }: UploadButtonProps) {
  const { theme } = useTheme();
  
  return (
    <Box style={{ marginTop: theme.spacing.semantic.component.sm }}>
      <Button
        onClick={onUpload}
        disabled={uploadState.isUploading || !isReadyForUpload}
        style={{
          background: uploadState.isUploading || !isReadyForUpload
            ? theme.colors.interactive.disabled
            : theme.colors.interactive.primary,
          color: theme.colors.text.inverse,
          cursor: uploadState.isUploading || !isReadyForUpload ? "not-allowed" : "pointer",
          opacity: uploadState.isUploading || !isReadyForUpload ? 0.6 : 1,
          padding: `0 ${theme.spacing.semantic.component.xl}`,
          height: "48px",
          borderRadius: theme.borders.radius.md,
          fontSize: "16px",
          fontWeight: "600",
          border: "none",
          boxShadow: uploadState.isUploading || !isReadyForUpload 
            ? "none" 
            : theme.shadows.semantic.card.medium,
          transition: theme.animations.transitions.all,
        }}
      >
        {uploadState.isUploading ? (
          <Flex align="center" gap={theme.spacing.semantic.component.sm}>
            <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
            <span>Uploading to Blockchain...</span>
          </Flex>
        ) : (
          <Flex align="center" gap={theme.spacing.semantic.component.sm}>
            <RocketIcon />
            <span>Upload to Blockchain</span>
          </Flex>
        )}
      </Button>
    </Box>
  );
}
