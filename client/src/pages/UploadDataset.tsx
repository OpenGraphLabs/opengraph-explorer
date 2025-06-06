import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, Heading } from "@radix-ui/themes";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useDatasetSuiService } from "../shared/api/datasetSuiService";
import { DatasetMetadataForm } from "../features/datasets";
import { FileUploadInterface, FileManager, UploadProgress } from "../features/upload";

interface DatasetMetadata {
  name: string;
  description: string;
  tags: string[];
  creator: string;
  labels?: string[];
  dataType?: string;
  dataSize?: number;
  dataCount?: number;
  license?: string;
}

interface UploadProgressState {
  totalFiles: number;
  status: "idle" | "uploading" | "creating" | "success" | "failed";
  progress: number;
  message: string;
}

export function UploadDataset() {
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const { createDatasetWithMultipleFiles } = useDatasetSuiService();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewStep, setPreviewStep] = useState<"select" | "preview" | "upload">("select");

  // Dataset metadata state
  const [metadata, setMetadata] = useState<DatasetMetadata>({
    name: "",
    description: "",
    tags: [],
    labels: [],
    dataType: "image/png",
    dataSize: 0,
    dataCount: 0,
    creator: "",
    license: "OpenGraph",
  });

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState<UploadProgressState>({
    totalFiles: 0,
    status: "idle",
    progress: 0,
    message: "",
  });

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    
    // Add new files to existing files
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    setError(null);
    setPreviewStep("preview");
  };

  const handleFileRemove = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    if (newFiles.length === 0) {
      setPreviewStep("select");
    }
  };

  const handleAddMoreFiles = () => {
    // Trigger file input click
    const fileInput = document.getElementById("dataset-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleUpload = async () => {
    if (!currentWallet?.accounts[0]?.address || selectedFiles.length === 0) return;
    if (!metadata.name.trim()) {
      setError("Dataset name is required");
      return;
    }

    try {
      setPreviewStep("upload");
      setError(null);
      setIsLoading(true);
      setUploadProgress({
        totalFiles: selectedFiles.length,
        status: "uploading",
        progress: 10,
        message: "Uploading files to Walrus as a single blob...",
      });

      // Calculate total file size
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

      // Upload files and create dataset
      await createDatasetWithMultipleFiles(
        {
          ...metadata,
          dataSize: totalSize,
          dataType: metadata.dataType || "image/png",
          dataCount: selectedFiles.length,
          creator: metadata.creator || currentWallet.accounts[0].address,
          license: metadata.license || "OpenGraph",

        },
        selectedFiles,
        10, // epochs
        (result) => {
          console.log("Dataset created:", result);
          setUploadSuccess(true);
          setUploadProgress({
            ...uploadProgress,
            status: "success",
            progress: 100,
            message: "Dataset created successfully!",
          });

          // Reset state after success
          setSelectedFiles([]);
          setMetadata({
            name: "",
            description: "",
            tags: [],
            labels: [],
            dataType: "image/png",
            dataSize: 0,
            dataCount: 0,
            creator: "",
            license: "OpenGraph",
          });
          setPreviewStep("select");

          // Navigate to datasets page after 1 second
          setTimeout(() => {
            navigate("/datasets");
          }, 1000);
        },
        (error) => {
          console.error("Dataset creation failed:", error);
          setError(`Failed to create dataset: ${error.message}`);
          setUploadProgress({
            ...uploadProgress,
            status: "failed",
            message: `Failed to create dataset: ${error.message}`,
          });
        }
      );
    } catch (error) {
      console.error("Error in upload process:", error);
      setError(error instanceof Error ? error.message : "Failed to process dataset");
      setUploadProgress({
        ...uploadProgress,
        status: "failed",
        message: error instanceof Error ? error.message : "Failed to process dataset",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canUpload = currentWallet?.accounts[0]?.address && 
                   metadata.name.trim() && 
                   selectedFiles.length > 0 && 
                   !isLoading;

  return (
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      {/* Page Header */}
      <Flex direction="column" gap="2" mb="6">
        <Heading size={{ initial: "7", md: "8" }} style={{ fontWeight: 700 }}>
          Upload Dataset
        </Heading>
        <Text size="3" style={{ color: "var(--gray-11)", maxWidth: "600px" }}>
          Create a new dataset for machine learning training. Define annotation labels and upload your data files to get started.
        </Text>
      </Flex>

      <Flex direction="column" gap="6">
        {/* Dataset Metadata Form */}
        <DatasetMetadataForm
          metadata={metadata}
          onMetadataChange={setMetadata}
        />

        {/* File Upload Interface */}
        {previewStep === "select" && (
          <FileUploadInterface
            onFilesSelect={handleFileSelect}
            isWalletConnected={!!currentWallet?.accounts[0]?.address}
            isLoading={isLoading}
          />
        )}

        {/* File Manager */}
        {selectedFiles.length > 0 && (
          <FileManager
            files={selectedFiles}
            onFileRemove={handleFileRemove}
            onAddMoreFiles={handleAddMoreFiles}
          />
        )}

        {/* Upload Progress and Controls */}
        {selectedFiles.length > 0 && (
          <UploadProgress
            uploadProgress={uploadProgress}
            onUpload={handleUpload}
            canUpload={!!canUpload}
            uploadSuccess={uploadSuccess}
            error={error}
          />
        )}
      </Flex>
    </Box>
  );
} 