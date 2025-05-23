import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Card,
  TextField,
  TextArea,
  Badge,
} from "@radix-ui/themes";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useDatasetSuiService } from "../services/datasetSuiService";
import {
  ReloadIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  UploadIcon,
  Cross2Icon,
  FileIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

export function UploadDataset() {
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const { createDatasetWithMultipleFiles } = useDatasetSuiService();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewStep, setPreviewStep] = useState<"select" | "preview" | "upload">("select");

  // 데이터셋 메타데이터 상태
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    tags: [] as string[],
    labels: [] as string[],
    dataType: "image/png",
    dataSize: 0,
    creator: "",
    license: "OpenGraph",
  });

  // 태그 및 라벨 입력 상태
  const [tagInput, setTagInput] = useState("");

  // 파일 업로드 상태 (통합 방식)
  const [uploadProgress, setUploadProgress] = useState({
    totalFiles: 0,
    status: "idle" as "idle" | "uploading" | "creating" | "success" | "failed",
    progress: 0,
    message: "",
  });

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    
    // 기존 파일 배열에 새 파일을 추가합니다.
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

  const handleTagAdd = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter(tag => tag !== tagToRemove),
    });
  };

  // 새로운 통합 업로드 처리 함수
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

      // 총 파일 크기 계산
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

      // 파일 업로드 및 데이터셋 생성 (모든 파일을 하나의 blob으로)
      await createDatasetWithMultipleFiles(
        {
          ...metadata,
          dataSize: totalSize,
          creator: metadata.creator || currentWallet.accounts[0].address,
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

          // 성공 후 상태 초기화
          setSelectedFiles([]);
          setMetadata({
            name: "",
            description: "",
            tags: [],
            labels: [],
            dataType: "image/png",
            dataSize: 0,
            creator: "",
            license: "OpenGraph",
          });
          setPreviewStep("select");

          // 성공 후 1초 뒤에 datasets 페이지로 이동
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

  return (
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
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
        <Card
          style={{
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid var(--gray-4)",
            background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
          }}
        >
          <Flex direction="column" gap="6">
            <Flex align="center" gap="3" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                }}
              >
                <Text size="4" style={{ fontWeight: "700", color: "white" }}>
                  1
                </Text>
              </Box>
              <Heading size="5" style={{ fontWeight: 600 }}>
                Dataset Information
              </Heading>
            </Flex>

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
                <Box>
                  <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
                    Dataset Name *
                  </Text>
                  <TextField.Root
                    placeholder="Enter a descriptive name for your dataset"
                    value={metadata.name}
                    onChange={e => setMetadata({ ...metadata, name: e.target.value })}
                    style={{ borderRadius: "8px" }}
                  />
                </Box>
                
                <Box>
                  <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
                    Description
                  </Text>
                  <TextArea
                    placeholder="Describe the dataset content, source, and intended use case"
                    value={metadata.description}
                    onChange={e => setMetadata({ ...metadata, description: e.target.value })}
                    style={{ borderRadius: "8px", minHeight: "80px" }}
                  />
                </Box>

                <Box>
                  <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
                    Creator Name
                  </Text>
                  <TextField.Root
                    placeholder="Your name or organization (optional)"
                    value={metadata.creator}
                    onChange={e => setMetadata({ ...metadata, creator: e.target.value })}
                    style={{ borderRadius: "8px" }}
                  />
                  <Text size="1" style={{ color: "var(--gray-9)", marginTop: "4px" }}>
                    leave blank to use your wallet address
                  </Text>
                </Box>

                {/* Tags Section */}
                <Box>
                  <Text size="2" weight="medium" style={{ color: "var(--gray-11)", marginBottom: "8px" }}>
                    Tags
                  </Text>
                  <Flex direction="column" gap="3">
                    <Flex gap="2">
                      <TextField.Root
                        style={{ flex: 1, borderRadius: "8px" }}
                        placeholder="Add tag (e.g., computer-vision)"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleTagAdd();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleTagAdd}
                        variant="soft"
                        style={{ borderRadius: "8px", padding: "0 16px" }}
                      >
                        <PlusIcon />
                        Add
                      </Button>
                    </Flex>
                    
                    {metadata.tags.length > 0 && (
                      <Flex gap="2" wrap="wrap">
                        {metadata.tags.map(tag => (
                          <Badge key={tag} color="blue" style={{ fontSize: "12px", padding: "4px 8px" }}>
                            {tag}
                            <Button
                              size="1"
                              variant="ghost"
                              onClick={() => handleTagRemove(tag)}
                              style={{ marginLeft: "6px" }}
                            >
                              <Cross2Icon width={10} height={10} />
                            </Button>
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Flex>
                  <Text size="1" style={{ color: "var(--gray-9)", marginBottom: "12px" }}>
                    add tags to help categorize and discover your dataset
                  </Text>
                </Box>
              </Flex>
            </Card>
          </Flex>
        </Card>

        {/* File Upload Section */}
        <Card
          style={{
            padding: "32px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
            border: "1px solid var(--gray-4)",
            background: "linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)",
          }}
        >
          <Flex direction="column" gap="6">
            <Flex align="center" gap="3" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
                }}
              >
                <Text size="4" style={{ fontWeight: "700", color: "white" }}>
                  2
                </Text>
              </Box>
              <Heading size="5" style={{ fontWeight: 600 }}>
                Upload Data Files
              </Heading>
            </Flex>

            <Text size="3" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Upload your training data files. All files will be stored securely and combined into a single blob on Walrus.
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
                  onChange={e => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      handleFileSelect(Array.from(files));
                    }
                  }}
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

            {/* 항상 존재하는 숨겨진 파일 선택기 (Add More 기능을 위함) */}
            <input
              type="file"
              multiple
              onChange={e => {
                const files = e.target.files;
                if (files && files.length > 0) {
                  handleFileSelect(Array.from(files));
                  // 선택 후 input 값을 초기화하여 같은 파일을 다시 선택할 수 있게 함
                  e.target.value = '';
                }
              }}
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
                      <Heading size="4" style={{ fontWeight: 600 }}>Selected Files</Heading>
                      <Badge color="blue" style={{ fontSize: "12px" }}>{selectedFiles.length} files</Badge>
                    </Flex>
                    <Flex gap="2" align="center">
                      <Button 
                        size="2" 
                        variant="soft" 
                        onClick={() => document.getElementById('dataset-upload-more')?.click()}
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
                        size="2"
                        variant="soft"
                        onClick={() => {
                          setSelectedFiles([]);
                          setPreviewStep("select");
                        }}
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

                  {/* 파일 목록 */}
                  <Box style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid var(--gray-4)", borderRadius: "8px" }}>
                    {/* 테이블 헤더 */}
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

                    {/* 파일 목록 */}
                    {selectedFiles.map((file, index) => (
                      <Box
                        key={index}
                        style={{
                          padding: "12px 16px",
                          borderBottom: index < selectedFiles.length - 1 ? "1px solid var(--gray-3)" : "none",
                          background: "white",
                          display: "grid",
                          gridTemplateColumns: "1fr auto auto auto",
                          gap: "16px",
                          alignItems: "center",
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        {/* 파일명 */}
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
                          <Text size="2" style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {file.name}
                          </Text>
                        </Flex>

                        {/* 파일 타입 */}
                        <Badge color="gray" style={{ fontSize: "11px" }}>
                          {file.type.split('/')[1]?.toUpperCase() || "UNKNOWN"}
                        </Badge>

                        {/* 파일 크기 */}
                        <Text size="2" style={{ color: "var(--gray-10)" }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>

                        {/* 액션 버튼 */}
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => handleFileRemove(index)}
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

                  {/* 파일 통계 */}
                  <Card style={{ padding: "16px", background: "var(--blue-2)", border: "1px solid var(--blue-4)", borderRadius: "8px" }}>
                    <Flex justify="between" align="center">
                      <Text size="2" weight="medium" style={{ color: "var(--blue-11)" }}>
                        Total: {selectedFiles.length} files
                      </Text>
                      <Text size="2" style={{ color: "var(--blue-10)" }}>
                        {(selectedFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </Flex>
                  </Card>
                </Flex>
              </Card>
            )}

            {/* 통합 업로드 Progress Status */}
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

                  <Text size="2" style={{ color: "var(--gray-11)" }}>{uploadProgress.message}</Text>

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
                      <Text size="2" style={{ color: "var(--blue-11)" }}>Creating dataset on Sui blockchain...</Text>
                    </Flex>
                  )}
                </Flex>
              </Card>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={
                !currentWallet?.accounts[0]?.address ||
                !metadata.name ||
                isLoading ||
                selectedFiles.length === 0
              }
              style={{
                background: !currentWallet?.accounts[0]?.address ||
                  !metadata.name ||
                  isLoading ||
                  selectedFiles.length === 0 ? "var(--gray-6)" : "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                color: "white",
                cursor:
                  !currentWallet?.accounts[0]?.address ||
                  !metadata.name ||
                  isLoading ||
                  selectedFiles.length === 0
                    ? "not-allowed"
                    : "pointer",
                padding: "0 32px",
                height: "48px",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: !currentWallet?.accounts[0]?.address ||
                  !metadata.name ||
                  isLoading ||
                  selectedFiles.length === 0 ? "none" : "0 4px 16px rgba(255, 107, 107, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              <Flex align="center" gap="3">
                {isLoading ? (
                  <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <UploadIcon width={20} height={20} />
                )}
                <span>
                  {isLoading ? "Creating Dataset..." : "Create Dataset"}
                </span>
              </Flex>
            </Button>

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
        </Card>
      </Flex>

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
