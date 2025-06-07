import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { UploadIcon, PlusIcon, TrashIcon, FileIcon, ReloadIcon } from "@radix-ui/react-icons";
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
    return (bytes / 1024 / 1024).toFixed(2);
  };

  const getTotalFileSize = (): string => {
    const totalBytes = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    return formatFileSize(totalBytes);
  };

  return (
    <Flex direction="column" gap="6">
      <Text size="3" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
        Upload your training data files. All files will be stored securely and combined into a
        single blob on Walrus.
      </Text>

      {previewStep === "select" && (
        <Box
          style={{
            border: "2px dashed var(--gray-6)",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <input
            type="file"
            multiple
            onChange={e => handleFileInputChange(e)}
            disabled={!currentWallet?.accounts[0]?.address}
            style={{ display: "none" }}
            id="dataset-upload"
          />
          <label
            htmlFor="dataset-upload"
            style={{
              cursor: !currentWallet?.accounts[0]?.address ? "not-allowed" : "pointer",
              opacity: !currentWallet?.accounts[0]?.address ? 0.5 : 1,
              display: "block",
            }}
          >
            <Flex direction="column" align="center" gap="4">
              <Box
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  width: "64px",
                  height: "64px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
                }}
              >
                <UploadIcon width={28} height={28} style={{ color: "white" }} />
              </Box>
              <Flex direction="column" align="center" gap="2">
                <Text size="4" weight="medium" style={{ color: "var(--gray-12)" }}>
                  {!currentWallet?.accounts[0]?.address
                    ? "Please connect your wallet first"
                    : "Click to select your dataset files"}
                </Text>
                <Text size="2" style={{ color: "var(--gray-10)" }}>
                  Supports images, documents, and other data formats
                </Text>
              </Flex>
            </Flex>
          </label>
        </Box>
      )}

      {/* Hidden file input for adding more files */}
      <input
        type="file"
        multiple
        onChange={e => handleFileInputChange(e, true)}
        disabled={!currentWallet?.accounts[0]?.address}
        style={{ display: "none" }}
        id="dataset-upload-more"
      />

      {selectedFiles.length > 0 && (
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
            <Flex justify="between" align="center">
              <Flex align="center" gap="3">
                <Text size="4" weight="bold">
                  Selected Files
                </Text>
                <Badge color="blue" style={{ fontSize: "12px" }}>
                  {selectedFiles.length} files
                </Badge>
              </Flex>
              <Flex gap="2" align="center">
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => document.getElementById("dataset-upload-more")?.click()}
                  style={{
                    background: "var(--blue-3)",
                    color: "var(--blue-11)",
                    borderRadius: "8px",
                    padding: "0 16px",
                  }}
                >
                  <PlusIcon width={16} height={16} />
                  Add More Files
                </Button>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={onClearAll}
                  style={{
                    background: "var(--red-3)",
                    color: "var(--red-11)",
                    borderRadius: "8px",
                    padding: "0 16px",
                  }}
                >
                  <TrashIcon width={16} height={16} />
                  Clear All
                </Button>
              </Flex>
            </Flex>

            {/* File List */}
            <Box
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                border: "1px solid var(--gray-4)",
                borderRadius: "8px",
              }}
            >
              {/* Table Header */}
              <Box
                style={{
                  padding: "12px 16px",
                  background: "var(--gray-2)",
                  borderBottom: "1px solid var(--gray-4)",
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  gap: "16px",
                  alignItems: "center",
                  fontWeight: 500,
                  fontSize: "13px",
                  color: "var(--gray-11)",
                }}
              >
                <Text>File Name</Text>
                <Text>Type</Text>
                <Text>Size</Text>
                <Text>Actions</Text>
              </Box>

              {/* File Rows */}
              {selectedFiles.map((file, index) => (
                <Box
                  key={index}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      index < selectedFiles.length - 1 ? "1px solid var(--gray-3)" : "none",
                    background: "white",
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: "16px",
                    alignItems: "center",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  {/* File Name */}
                  <Flex align="center" gap="3" style={{ overflow: "hidden" }}>
                    <Box
                      style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "6px",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <FileIcon width={12} height={12} style={{ color: "white" }} />
                    </Box>
                    <Text
                      size="2"
                      style={{
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </Text>
                  </Flex>

                  {/* File Type */}
                  <Badge color="gray" style={{ fontSize: "11px" }}>
                    {file.type.split("/")[1]?.toUpperCase() || "UNKNOWN"}
                  </Badge>

                  {/* File Size */}
                  <Text size="2" style={{ color: "var(--gray-10)" }}>
                    {formatFileSize(file.size)} MB
                  </Text>

                  {/* Actions */}
                  <Button
                    size="xs"
                    variant="tertiary"
                    onClick={() => onFileRemove(index)}
                    style={{
                      background: "var(--red-3)",
                      color: "var(--red-11)",
                      borderRadius: "6px",
                      padding: "0 8px",
                      height: "28px",
                    }}
                  >
                    <TrashIcon width={12} height={12} />
                  </Button>
                </Box>
              ))}
            </Box>

            {/* File Statistics */}
            <Card
              style={{
                padding: "16px",
                background: "var(--blue-2)",
                border: "1px solid var(--blue-4)",
                borderRadius: "8px",
              }}
            >
              <Flex justify="between" align="center">
                <Text size="2" weight="medium" style={{ color: "var(--blue-11)" }}>
                  Total: {selectedFiles.length} files
                </Text>
                <Text size="2" style={{ color: "var(--blue-10)" }}>
                  {getTotalFileSize()} MB
                </Text>
              </Flex>
            </Card>
          </Flex>
        </Card>
      )}

      {/* Upload Progress */}
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
        disabled={isUploadDisabled}
        style={{
          background: isUploadDisabled
            ? "var(--gray-6)"
            : "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          color: "white",
          cursor: isUploadDisabled ? "not-allowed" : "pointer",
          padding: "0 32px",
          height: "48px",
          borderRadius: "12px",
          fontSize: "16px",
          fontWeight: "600",
          boxShadow: isUploadDisabled ? "none" : "0 4px 16px rgba(255, 107, 107, 0.3)",
          transition: "all 0.2s ease",
        }}
      >
        <Flex align="center" gap="3">
          {isLoading ? (
            <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <UploadIcon width={20} height={20} />
          )}
          <span>{isLoading ? "Creating Dataset..." : "Create Dataset"}</span>
        </Flex>
      </Button>
    </Flex>
  );
}
