import { Box, Text, Flex, Button } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import {
  ReloadIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { 
  Upload, 
  Check, 
  Warning, 
  X,
  File,
  CloudArrowUp
} from "phosphor-react";
import { useRef, useState } from "react";

interface ModelUploaderProps {
  onFileSelect: (files: File[]) => void;
  selectedFile: File | null;
  isConverting: boolean;
  conversionStatus: string;
  conversionProgress: number;
  error: string | null;
  resetUploadState: () => void;
  multiple?: boolean;
  accept?: string;
}

export function ModelUploader({
  onFileSelect,
  selectedFile,
  isConverting,
  conversionStatus,
  conversionProgress,
  error,
  resetUploadState,
  multiple = false,
  accept = ".h5",
}: ModelUploaderProps) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      if (multiple) {
        // Clean up existing preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        // Create preview URLs for images
        const urls = files.map(file => {
          if (file.type.startsWith("image/")) {
            return URL.createObjectURL(file);
          }
          return "";
        });
        setPreviewUrls(urls.filter(url => url !== "")); // Remove empty URLs
        onFileSelect(files);
      } else {
        const file = files[0];
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (fileExtension === "h5") {
          onFileSelect([file]);
        } else {
          throw new Error("Only .h5 files are supported.");
        }
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    // Update file list
    const newFiles = Array.from(fileInputRef.current?.files || []).filter((_, i) => i !== index);
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      fileInputRef.current.files = dataTransfer.files;
    }
    onFileSelect(newFiles);
  };

  const handleClearAll = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect([]);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);

      if (multiple) {
        // Clean up existing preview URLs
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        // Create preview URLs for images
        const urls = files.map(file => {
          if (file.type.startsWith("image/")) {
            return URL.createObjectURL(file);
          }
          return "";
        });
        setPreviewUrls(urls.filter(url => url !== "")); // Remove empty URLs
        onFileSelect(files);
      } else {
        const file = files[0];
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (fileExtension === "h5") {
          onFileSelect([file]);
        } else {
          alert("Only .h5 files are supported.");
        }
      }
    }
  };

  const resetFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Revoke object URLs to prevent memory leaks
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    resetUploadState();
  };

  return (
    <Box>
      {/* Main Upload Area - Compact */}
      <Box
        style={{
          borderStyle: "dashed",
          borderWidth: "2px",
          borderColor: selectedFile 
            ? theme.colors.interactive.primary 
            : isDragOver 
              ? theme.colors.interactive.accent
              : theme.colors.border.secondary,
          background: selectedFile 
            ? `${theme.colors.interactive.primary}08`
            : isDragOver
              ? `${theme.colors.interactive.accent}05`
              : theme.colors.background.secondary,
          padding: theme.spacing.semantic.component.lg,
          borderRadius: theme.borders.radius.md,
          transition: "all 0.2s ease",
          marginBottom: theme.spacing.semantic.component.sm,
          cursor: "pointer",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <Flex direction="column" align="center" gap="3">
          <Box
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: selectedFile 
                ? `${theme.colors.interactive.primary}15`
                : isDragOver
                  ? `${theme.colors.interactive.accent}15`
                  : `${theme.colors.text.tertiary}10`,
              border: `1px solid ${selectedFile 
                ? `${theme.colors.interactive.primary}30`
                : isDragOver
                  ? `${theme.colors.interactive.accent}30`
                  : `${theme.colors.text.tertiary}20`}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            <CloudArrowUp 
              size={24} 
              style={{ 
                color: selectedFile 
                  ? theme.colors.interactive.primary
                  : isDragOver
                    ? theme.colors.interactive.accent
                    : theme.colors.text.tertiary
              }} 
            />
          </Box>

          <Box style={{ textAlign: "center" }}>
            <Text 
              size="3"
              style={{ 
                fontWeight: 600, 
                color: theme.colors.text.primary,
                marginBottom: "2px",
                display: "block"
              }}
            >
              {selectedFile ? "File Ready for Conversion" : "Upload Your Model File"}
            </Text>
            <Text 
              size="1" 
              style={{ 
                color: theme.colors.text.secondary,
                lineHeight: 1.4
              }}
            >
              {selectedFile 
                ? "Click to change file or drag new file here"
                : "Drag and drop your .h5 file here, or click to browse"
              }
            </Text>
          </Box>

          {!selectedFile && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleBrowseClick();
              }}
              style={{
                cursor: "pointer",
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                borderRadius: theme.borders.radius.sm,
                fontWeight: 600,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.md}`,
                border: "none",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <Upload size={14} />
              Browse Files
            </Button>
          )}

          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </Flex>
      </Box>

      {/* Selected File Display - Compact */}
      {selectedFile && (
        <Card
          elevation="low"
          style={{
            padding: theme.spacing.semantic.component.sm,
            background: `${theme.colors.interactive.primary}05`,
            marginBottom: theme.spacing.semantic.component.sm,
            overflow: "hidden",
          }}
        >
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <Box
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: theme.borders.radius.sm,
                  background: `${theme.colors.interactive.primary}15`,
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <File size={16} style={{ color: theme.colors.interactive.primary }} />
              </Box>
              <Box>
                <Text 
                  size="2" 
                  style={{ 
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    marginBottom: "1px",
                    display: "block"
                  }}
                >
                  {selectedFile.name}
                </Text>
                <Text 
                  size="1" 
                  style={{ 
                    color: theme.colors.text.secondary,
                    fontSize: "11px"
                  }}
                >
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • H5 Model File
                </Text>
              </Box>
            </Flex>
            <Box
              style={{
                background: `${theme.colors.status.error}15`,
                color: theme.colors.status.error,
                border: `1px solid ${theme.colors.status.error}30`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 500,
                gap: theme.spacing.semantic.component.xs,
                transition: "all 0.2s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                resetFile();
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.background = `${theme.colors.status.error}25`;
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.background = `${theme.colors.status.error}15`;
              }}
            >
              <X size={12} />
              Remove
            </Box>
          </Flex>
        </Card>
      )}

      {/* Error Display - Compact */}
      {error && (
        <Card
          elevation="low"
          style={{
            background: `${theme.colors.status.error}08`,
            padding: theme.spacing.semantic.component.sm,
            borderRadius: theme.borders.radius.md,
            marginBottom: theme.spacing.semantic.component.sm,
            overflow: "hidden",
          }}
        >
          <Flex align="center" gap="2">
            <Warning size={16} style={{ color: theme.colors.status.error }} />
            <Text 
              size="2" 
              style={{ 
                color: theme.colors.status.error,
                fontWeight: 500
              }}
            >
              {error}
            </Text>
          </Flex>
        </Card>
      )}

      {/* Conversion Status - Compact */}
      {conversionStatus && !error && (
        <Card
          elevation="low"
          style={{
            background: `${theme.colors.status.success}08`,
            padding: theme.spacing.semantic.component.sm,
            borderRadius: theme.borders.radius.md,
            marginBottom: theme.spacing.semantic.component.sm,
            overflow: "hidden",
          }}
        >
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              {isConverting ? (
                <ReloadIcon 
                  style={{ 
                    color: theme.colors.status.success, 
                    animation: "spin 1s linear infinite",
                    width: 16,
                    height: 16
                  }} 
                />
              ) : (
                <Check size={16} style={{ color: theme.colors.status.success }} />
              )}
              <Text 
                size="2" 
                style={{ 
                  color: theme.colors.status.success, 
                  fontWeight: 600 
                }}
              >
                {conversionStatus}
              </Text>
            </Flex>

            {isConverting && conversionProgress > 0 && (
              <Box>
                <Box
                  style={{
                    width: "100%",
                    height: "6px",
                    background: `${theme.colors.status.success}20`,
                    borderRadius: theme.borders.radius.full,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      width: `${conversionProgress}%`,
                      height: "100%",
                      background: theme.colors.status.success,
                      transition: "width 0.3s ease-in-out",
                      borderRadius: theme.borders.radius.full,
                    }}
                  />
                </Box>
                <Flex justify="between" style={{ marginTop: theme.spacing.semantic.component.xs }}>
                  <Text 
                    size="1" 
                    style={{ 
                      color: theme.colors.status.success,
                      fontWeight: 500,
                      fontSize: "10px"
                    }}
                  >
                    Progress
                  </Text>
                  <Text 
                    size="1" 
                    style={{ 
                      color: theme.colors.status.success, 
                      fontWeight: 600,
                      fontSize: "10px" 
                    }}
                  >
                    {conversionProgress}%
                  </Text>
                </Flex>
              </Box>
            )}
          </Flex>
        </Card>
      )}

      {/* Info Card - Compact */}
      <Card
        elevation="low"
        style={{
          background: `${theme.colors.status.info}05`,
          padding: theme.spacing.semantic.component.sm,
          borderRadius: theme.borders.radius.md,
          overflow: "hidden",
        }}
      >
        <Flex align="start" gap="2">
          <InfoCircledIcon 
            style={{ 
              color: theme.colors.status.info,
              marginTop: "1px",
              flexShrink: 0
            }} 
            width={14} 
            height={14} 
          />
          <Text
            size="1"
            style={{ 
              color: theme.colors.text.secondary, 
              lineHeight: 1.4,
              fontSize: "12px"
            }}
          >
            {multiple
              ? "You can upload various file formats including images, text, and CSV files."
              : "Only .h5 model files are supported. The uploaded model will be automatically converted to OpenGraph's onchain-compatible format for deployment on Sui blockchain."}
          </Text>
        </Flex>
      </Card>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}
