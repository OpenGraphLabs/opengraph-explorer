import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { 
  ReloadIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { 
  CloudArrowUp, 
  File, 
  FolderOpen, 
  Warning,
  CheckCircle,
  Trash,
  Plus
} from "phosphor-react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import type { UploadProgress } from "../types/upload";

interface FileUploadSectionProps {
  selectedFiles: File[];
  previewStep: "select" | "preview" | "upload";
  uploadProgress: UploadProgress;
  isLoading: boolean;
  onFileSelect: (files: File[]) => void;
  onFileRemove: (index: number) => void;
  onClearAll: () => void;
  onUpload: () => void;
  isUploadDisabled: boolean;
}

export function FileUploadSection({
  selectedFiles,
  previewStep,
  uploadProgress,
  isLoading,
  onFileSelect,
  onFileRemove,
  onClearAll,
  onUpload,
  isUploadDisabled,
}: FileUploadSectionProps) {
  const { currentWallet } = useCurrentWallet();
  const { theme } = useTheme();

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, isAdditional = false) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(Array.from(files));
      if (isAdditional) {
        e.target.value = "";
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getTotalFileSize = (): string => {
    const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
  };

  const getFileTypeIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <File size={14} style={{ color: theme.colors.dataType.image }} />;
    }
    if (type.includes('video') || ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(extension || '')) {
      return <File size={14} style={{ color: theme.colors.dataType.video }} />;
    }
    if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'flac'].includes(extension || '')) {
      return <File size={14} style={{ color: theme.colors.dataType.audio }} />;
    }
    if (['csv', 'xlsx', 'xls'].includes(extension || '') || type.includes('spreadsheet')) {
      return <File size={14} style={{ color: theme.colors.dataType.tabular }} />;
    }
    if (['json', 'xml', 'yaml', 'yml'].includes(extension || '') || type.includes('json')) {
      return <File size={14} style={{ color: theme.colors.dataType.structured }} />;
    }
    return <File size={14} style={{ color: theme.colors.text.tertiary }} />;
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const isWalletConnected = currentWallet?.accounts[0]?.address;

  return (
    <Flex direction="column" gap="6">
      {/* Upload Zone */}
      {previewStep === "select" && (
        <Card
          style={{
            border: isWalletConnected 
              ? `2px dashed ${theme.colors.border.brand}` 
              : `2px dashed ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.component.xl,
            background: isWalletConnected 
              ? `linear-gradient(135deg, ${theme.colors.background.card}, ${theme.colors.background.accent})`
              : theme.colors.background.secondary,
            cursor: isWalletConnected ? "pointer" : "not-allowed",
            transition: theme.animations.transitions.all,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <input
            type="file"
            multiple
            onChange={e => handleFileInputChange(e)}
            disabled={!isWalletConnected}
            style={{ display: "none" }}
            id="dataset-upload"
            accept="*/*"
          />
          
          <label
            htmlFor="dataset-upload"
            style={{
              cursor: isWalletConnected ? "pointer" : "not-allowed",
              opacity: isWalletConnected ? 1 : 0.6,
              display: "block",
            }}
          >
            <Flex direction="column" align="center" gap="4">
              {/* Upload Icon */}
              <Box
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: theme.borders.radius.full,
                  background: isWalletConnected 
                    ? `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`
                    : theme.colors.background.tertiary,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isWalletConnected 
                    ? theme.shadows.semantic.interactive.default
                    : "none",
                  transition: theme.animations.transitions.all,
                }}
              >
                <CloudArrowUp 
                  size={28} 
                  style={{ color: isWalletConnected ? theme.colors.text.inverse : theme.colors.text.tertiary }} 
                />
              </Box>

              {/* Upload Text */}
              <Flex direction="column" align="center" gap="2">
                <Text 
                  size="4" 
                  style={{ 
                    color: theme.colors.text.primary,
                    ...theme.typography.h5,
                    textAlign: "center"
                  }}
                >
                  {!isWalletConnected
                    ? "Connect wallet to upload files"
                    : "Drop files here or click to browse"}
                </Text>
                <Text 
                  size="2" 
                  style={{ 
                    color: theme.colors.text.tertiary,
                    ...theme.typography.caption,
                    textAlign: "center"
                  }}
                >
                  Supports all data formats • Max 100MB per file
                </Text>
              </Flex>
            </Flex>
          </label>

          {/* Connection Status Indicator */}
          {!isWalletConnected && (
            <Box
              style={{
                position: "absolute",
                top: theme.spacing.semantic.component.md,
                right: theme.spacing.semantic.component.md,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                background: theme.colors.status.warning,
                borderRadius: theme.borders.radius.sm,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <Warning size={14} style={{ color: theme.colors.text.inverse }} />
              <Text 
                size="1" 
                style={{ 
                  color: theme.colors.text.inverse,
                  ...theme.typography.caption,
                  fontWeight: 500
                }}
              >
                Wallet Required
              </Text>
            </Box>
          )}
        </Card>
      )}

      {/* Hidden file input for adding more files */}
      <input
        type="file"
        multiple
        onChange={e => handleFileInputChange(e, true)}
        disabled={!isWalletConnected}
        style={{ display: "none" }}
        id="dataset-upload-more"
        accept="*/*"
      />

            {/* File List */}
      {selectedFiles.length > 0 && (
        <Box style={{ marginTop: theme.spacing.semantic.component.md }}>
          {/* File List Header */}
          <Box
            style={{
              background: `linear-gradient(135deg, ${theme.colors.background.card} 0%, ${theme.colors.background.secondary} 100%)`,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: `${theme.borders.radius.lg} ${theme.borders.radius.lg} 0 0`,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              boxShadow: theme.shadows.semantic.card.low,
              position: "relative",
              overflow: "hidden",
            }}
          >
            
            <Flex justify="between" align="center">
              <Flex align="center" gap="3">
                <Box
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: theme.borders.radius.md,
                    background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 2px 8px ${theme.colors.interactive.primary}30`,
                  }}
                >
                  <FolderOpen size={14} style={{ color: theme.colors.text.inverse }} />
                </Box>
                <Box>
                  <Flex align="center" gap="2">
                    <Text 
                      size="2" 
                      style={{ 
                        color: theme.colors.text.primary,
                        fontWeight: 600,
                        letterSpacing: "-0.01em",
                        lineHeight: 1,
                        marginRight: "10px",
                      }}
                    >
                      Selected Files
                    </Text>
                    <Box
                      style={{
                        background: `${theme.colors.interactive.primary}15`,
                        border: `1px solid ${theme.colors.interactive.primary}30`,
                        borderRadius: theme.borders.radius.full,
                        padding: "4px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Text 
                        size="1" 
                        style={{ 
                          color: theme.colors.interactive.primary,
                          fontSize: "9px",
                          lineHeight: 1,
                          fontFamily: theme.typography.codeInline.fontFamily,
                        }}
                      >
                        {selectedFiles.length}
                      </Text>
                      <Box
                        style={{
                          width: "1px",
                          height: "10px",
                          background: `${theme.colors.interactive.primary}40`,
                        }}
                      />
                      <Text 
                        size="1" 
                        style={{ 
                          color: theme.colors.interactive.primary,
                          fontWeight: 500,
                          fontSize: "9px",
                          lineHeight: 1,
                          fontFamily: theme.typography.codeInline.fontFamily,
                        }}
                      >
                        {getTotalFileSize()}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              </Flex>

              <Flex gap="2" align="center">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => document.getElementById("dataset-upload-more")?.click()}
                  style={{
                    background: theme.colors.background.card,
                    color: theme.colors.interactive.primary,
                    border: `1px solid ${theme.colors.interactive.primary}30`,
                    borderRadius: theme.borders.radius.md,
                    padding: `8px 16px`,
                    fontWeight: 600,
                    fontSize: "12px",
                    height: "32px",
                    letterSpacing: "0.025em",
                    boxShadow: theme.shadows.semantic.card.low,
                    transition: theme.animations.transitions.all,
                  }}
                >
                  <Plus size={14} />
                  Add More
                </Button>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={onClearAll}
                  style={{
                    background: "transparent",
                    color: theme.colors.text.tertiary,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: theme.borders.radius.md,
                    padding: `8px 16px`,
                    fontWeight: 500,
                    fontSize: "12px",
                    height: "32px",
                    letterSpacing: "0.025em",
                    transition: theme.animations.transitions.all,
                  }}
                >
                  <Trash size={14} />
                  Clear All
                </Button>
              </Flex>
            </Flex>
          </Box>

          {/* File List Content */}
          <div
            style={{
              maxHeight: "320px",
              overflowY: "auto",
              overflowX: "hidden",
              border: `1px solid ${theme.colors.border.primary}`,
              borderTop: "none",
              borderRadius: `0 0 ${theme.borders.radius.lg} ${theme.borders.radius.lg}`,
              boxShadow: theme.shadows.semantic.card.low,
              backgroundColor: theme.colors.background.card,
            }}
          >
            {selectedFiles.map((file, index) => (
              <Box
                key={`${file.name}-${index}`}
                style={{
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.md}`,
                  borderBottom: index < selectedFiles.length - 1 
                    ? `1px solid ${theme.colors.border.primary}` 
                    : "none",
                  background: index % 2 === 0 
                    ? theme.colors.background.card 
                    : theme.colors.background.secondary,
                  transition: theme.animations.transitions.all,
                  height: "48px",
                  cursor: "default",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${theme.colors.interactive.primary}08`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = index % 2 === 0 
                    ? theme.colors.background.card 
                    : theme.colors.background.secondary;
                }}
              >
                <Flex justify="between" align="center" gap="2" style={{ width: "100%", height: "100%" }}>
                  {/* File Info */}
                  <Flex align="center" gap="2" style={{ flex: 1, minWidth: 0 }}>
                    <Box
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: theme.borders.radius.xs,
                        background: theme.colors.background.tertiary,
                        border: `1px solid ${theme.colors.border.primary}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getFileTypeIcon(file)}
                    </Box>
                    
                    <Box style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Text
                        size="2"
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.label.fontSize,
                          fontWeight: 500,
                          lineHeight: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        {file.name}
                      </Text>
                      <Flex align="center" gap="2" style={{ flexShrink: 0, marginLeft: "8px" }}>
                        <Text 
                          style={{
                            background: theme.colors.background.secondary,
                            color: theme.colors.text.tertiary,
                            fontSize: "9px",
                            padding: "1px 4px",
                            borderRadius: theme.borders.radius.xs,
                            fontWeight: 600,
                            lineHeight: 1,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontFamily: theme.typography.codeInline.fontFamily,
                            border: `1px solid ${theme.colors.border.primary}`,
                          }}
                        >
                          {getFileExtension(file.name)}
                        </Text>
                        <Text 
                          size="1" 
                          style={{ 
                            color: theme.colors.text.tertiary,
                            fontSize: "10px",
                            fontWeight: 500,
                            lineHeight: 1,
                            fontFamily: theme.typography.codeInline.fontFamily,
                            minWidth: "40px",
                            textAlign: "right",
                          }}
                        >
                          {formatFileSize(file.size)}
                        </Text>
                      </Flex>
                    </Box>
                  </Flex>

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => onFileRemove(index)}
                    style={{
                      width: "24px",
                      height: "24px",
                      padding: 0,
                      borderRadius: theme.borders.radius.sm,
                      background: "transparent",
                      color: theme.colors.text.tertiary,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: theme.animations.transitions.all,
                      flexShrink: 0,
                    }}
                  >
                    <Cross2Icon width={12} height={12} />
                  </Button>
                </Flex>
              </Box>
            ))}
          </div>
        </Box>
      )}

      {/* Upload Progress */}
      {uploadProgress.status !== "idle" && (
        <Card
          style={{
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${
              uploadProgress.status === "success" 
                ? theme.colors.status.success + "40"
                : uploadProgress.status === "failed"
                  ? theme.colors.status.error + "40"
                  : theme.colors.border.brand
            }`,
            background: theme.colors.background.card,
            overflow: "hidden",
          }}
        >
          <Box style={{ padding: theme.spacing.semantic.component.lg }}>
            <Flex direction="column" gap="4">
              {/* Progress Header */}
              <Flex align="center" justify="between">
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: theme.borders.radius.full,
                      background: uploadProgress.status === "success" 
                        ? `${theme.colors.status.success}20`
                        : uploadProgress.status === "failed"
                          ? `${theme.colors.status.error}20`
                          : `${theme.colors.interactive.primary}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {uploadProgress.status === "success" ? (
                      <CheckCircle size={16} style={{ color: theme.colors.status.success }} />
                    ) : uploadProgress.status === "failed" ? (
                      <Warning size={16} style={{ color: theme.colors.status.error }} />
                    ) : (
                      <ReloadIcon 
                        width={16} 
                        height={16} 
                        style={{ 
                          color: theme.colors.interactive.primary,
                          animation: "spin 1s linear infinite"
                        }} 
                      />
                    )}
                  </Box>
                  <Text 
                    size="4" 
                    style={{ 
                      color: theme.colors.text.primary,
                      ...theme.typography.h6
                    }}
                  >
                    {uploadProgress.status === "uploading" && "Processing Files"}
                    {uploadProgress.status === "creating" && "Creating Dataset"}  
                    {uploadProgress.status === "success" && "Upload Complete"}
                    {uploadProgress.status === "failed" && "Upload Failed"}
                  </Text>
                </Flex>

                <Badge
                  style={{
                    background: uploadProgress.status === "success" 
                      ? `${theme.colors.status.success}15`
                      : uploadProgress.status === "failed"
                        ? `${theme.colors.status.error}15`
                        : `${theme.colors.interactive.primary}15`,
                    color: uploadProgress.status === "success" 
                      ? theme.colors.status.success
                      : uploadProgress.status === "failed"
                        ? theme.colors.status.error
                        : theme.colors.interactive.primary,
                    fontSize: theme.typography.caption.fontSize,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    borderRadius: theme.borders.radius.full,
                    fontWeight: 500,
                    border: "none",
                  }}
                >
                  {Math.round(uploadProgress.progress)}%
                </Badge>
              </Flex>

              {/* Progress Message */}
              <Text 
                size="2" 
                style={{ 
                  color: theme.colors.text.secondary,
                  ...theme.typography.bodySmall,
                  lineHeight: 1.4
                }}
              >
                {uploadProgress.message}
              </Text>

              {/* Progress Bar */}
              <Box
                style={{
                  width: "100%",
                  height: "6px",
                  background: theme.colors.background.tertiary,
                  borderRadius: theme.borders.radius.full,
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    width: `${uploadProgress.progress}%`,
                    height: "100%",
                    background: uploadProgress.status === "success" 
                      ? theme.colors.status.success
                      : uploadProgress.status === "failed"
                        ? theme.colors.status.error
                        : `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                    borderRadius: theme.borders.radius.full,
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Flex>
          </Box>
        </Card>
      )}

      {/* Upload Action Button */}
      <Button
        onClick={onUpload}
        disabled={isUploadDisabled}
        style={{
          background: isUploadDisabled
            ? theme.colors.interactive.disabled
            : `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
          color: theme.colors.text.inverse,
          cursor: isUploadDisabled ? "not-allowed" : "pointer",
          padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.xl}`,
          height: "48px",
          borderRadius: theme.borders.radius.lg,
          fontSize: theme.typography.buttonLarge.fontSize,
          fontWeight: theme.typography.buttonLarge.fontWeight,
          border: "none",
          boxShadow: isUploadDisabled 
            ? "none" 
            : theme.shadows.semantic.interactive.default,
          transition: theme.animations.transitions.all,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.semantic.component.sm,
        }}
      >
        {isLoading ? (
          <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
        ) : (
          <CloudArrowUp size={20} />
        )}
        <span>{isLoading ? "Creating Dataset..." : "Create Dataset"}</span>
      </Button>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Flex>
  );
}
