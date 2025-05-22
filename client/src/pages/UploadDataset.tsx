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
  const [annotations, setAnnotations] = useState<string[]>([]);
  const [previewStep, setPreviewStep] = useState<"select" | "preview" | "upload">("select");

  // 데이터셋 메타데이터 상태
  const [metadata, setMetadata] = useState({
    name: "",
    description: "",
    tags: [] as string[],
    dataType: "image/png",
    dataSize: 0,
    creator: "",
    license: "OpenGraph",
  });

  // 태그 입력 상태
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
    const newAnnotations = [...annotations, ...Array(files.length).fill("")];
    
    setSelectedFiles(newFiles);
    setAnnotations(newAnnotations);
    setError(null);

    setPreviewStep("preview");
  };

  const handleFileRemove = (index: number) => {
    const newFiles = [...selectedFiles];
    const newAnnotations = [...annotations];
    newFiles.splice(index, 1);
    newAnnotations.splice(index, 1);
    setSelectedFiles(newFiles);
    setAnnotations(newAnnotations);
    if (newFiles.length === 0) {
      setPreviewStep("select");
    }
  };

  const handleAnnotationChange = (index: number, value: string) => {
    const newAnnotations = [...annotations];
    newAnnotations[index] = value;
    setAnnotations(newAnnotations);
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
        annotations,
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
          setAnnotations([]);
          setMetadata({
            name: "",
            description: "",
            tags: [],
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
    <Box style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>
        Upload Dataset
      </Heading>

      <Flex direction="column" gap="6">
        {/* Dataset Metadata Form */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
          }}
        >
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="4" style={{ fontWeight: "700" }}>
                  1
                </Text>
              </Box>
              <Heading size="4" style={{ fontWeight: 600 }}>
                Dataset Information
              </Heading>
            </Flex>

            <Card
              style={{
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid var(--gray-4)",
                background: "var(--gray-1)",
              }}
            >
              <Flex direction="column" gap="3">
                <TextField.Root
                  placeholder="Dataset Name"
                  value={metadata.name}
                  onChange={e => setMetadata({ ...metadata, name: e.target.value })}
                />
                <TextArea
                  placeholder="Description"
                  value={metadata.description}
                  onChange={e => setMetadata({ ...metadata, description: e.target.value })}
                />
                <TextField.Root
                  placeholder="Creator Name (optional)"
                  value={metadata.creator}
                  onChange={e => setMetadata({ ...metadata, creator: e.target.value })}
                />
                <Text size="1" style={{ color: "var(--gray-9)", marginTop: "-8px" }}>
                  Enter your name or organization. Leave blank to use wallet address.
                </Text>
                <Flex direction="column" gap="2">
                  <Flex gap="2">
                    <TextField.Root
                      style={{ flex: 1 }}
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleTagAdd();
                        }
                      }}
                    />
                    <Button onClick={handleTagAdd}>
                      <PlusIcon />
                    </Button>
                  </Flex>
                  <Flex gap="2" wrap="wrap">
                    {metadata.tags.map(tag => (
                      <Badge key={tag} color="blue">
                        {tag}
                        <Button
                          size="1"
                          variant="ghost"
                          onClick={() => handleTagRemove(tag)}
                          style={{ marginLeft: "4px" }}
                        >
                          <Cross2Icon width={12} height={12} />
                        </Button>
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Card>

        {/* File Upload Section */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
          }}
        >
          <Flex direction="column" gap="4">
            <Flex align="center" gap="2" mb="2">
              <Box
                style={{
                  background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text size="4" style={{ fontWeight: "700" }}>
                  2
                </Text>
              </Box>
              <Heading size="4" style={{ fontWeight: 600 }}>
                Upload Files
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Upload your training data files. All files will be combined into a single blob and stored on-chain.
            </Text>

            {previewStep === "select" && (
              <Box
                style={{
                  border: "2px dashed var(--gray-5)",
                  borderRadius: "8px",
                  padding: "24px",
                  textAlign: "center",
                  background: "var(--gray-1)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
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
                  }}
                >
                  <Flex direction="column" align="center" gap="2">
                    <UploadIcon width={24} height={24} style={{ color: "var(--gray-9)" }} />
                    <Text size="2" style={{ color: "var(--gray-11)" }}>
                      {!currentWallet?.accounts[0]?.address
                        ? "Please connect your wallet first"
                        : "Click to select dataset files"}
                    </Text>
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
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--gray-4)",
                  background: "var(--gray-1)",
                }}
              >
                <Flex direction="column" gap="3">
                  <Flex justify="between" align="center">
                    <Heading size="3">Selected Files ({selectedFiles.length})</Heading>
                    <Flex gap="2" align="center">
                      <Button 
                        size="1" 
                        variant="soft" 
                        onClick={() => document.getElementById('dataset-upload-more')?.click()}
                        style={{
                          background: "var(--blue-3)",
                          color: "var(--blue-11)",
                          cursor: "pointer",
                        }}
                      >
                        <PlusIcon width={14} height={14} />
                        <span style={{ marginLeft: '4px' }}>Add More</span>
                      </Button>
                      <Button
                        size="1"
                        variant="soft"
                        onClick={() => {
                          setSelectedFiles([]);
                          setAnnotations([]);
                          setPreviewStep("select");
                        }}
                        style={{
                          background: "var(--red-3)",
                          color: "var(--red-11)",
                          cursor: "pointer",
                        }}
                      >
                        <TrashIcon width={14} height={14} />
                        <span style={{ marginLeft: '4px' }}>Clear All</span>
                      </Button>
                    </Flex>
                  </Flex>

                  {/* 테이블 헤더 */}
                  <Box 
                    style={{ 
                      padding: "8px 12px", 
                      background: "var(--gray-3)", 
                      borderRadius: "8px 8px 0 0",
                      display: "grid",
                      gridTemplateColumns: "minmax(200px, 3fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(200px, 3fr) 80px",
                      gap: "8px",
                      alignItems: "center",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: "var(--gray-11)",
                    }}
                  >
                    <Box>File Name</Box>
                    <Box>Size</Box>
                    <Box>Type</Box>
                    <Box>Annotation</Box>
                    <Box>Actions</Box>
                  </Box>

                  {/* 테이블 내용 */}
                  <Box style={{ maxHeight: "400px", overflowY: "auto" }}>
                    {selectedFiles.map((file, index) => (
                      <Box
                        key={index}
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid var(--gray-4)",
                          background: "white",
                          display: "grid",
                          gridTemplateColumns: "minmax(200px, 3fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(200px, 3fr) 80px",
                          gap: "8px",
                          alignItems: "center",
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        {/* 파일명 및 상태 */}
                        <Flex align="center" gap="2" style={{ overflow: "hidden" }}>
                          <FileIcon width={16} height={16} style={{ flexShrink: 0, color: "var(--gray-9)" }} />
                          <Text size="2" style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {file.name}
                          </Text>
                        </Flex>

                        {/* 파일 크기 */}
                        <Text size="2" style={{ color: "var(--gray-9)" }}>
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Text>

                        {/* 파일 타입 */}
                        <Text size="2" style={{ color: "var(--gray-9)" }}>
                          {file.type || "Unknown"}
                        </Text>

                        {/* 애노테이션 인풋 */}
                        <TextField.Root
                          placeholder="Enter annotation"
                          value={annotations[index] || ""}
                          onChange={e => handleAnnotationChange(index, e.target.value)}
                          size="1"
                          variant="soft"
                          style={{ 
                            width: "100%",
                            border: "1px solid var(--gray-4)",
                            borderRadius: "4px",
                          }}
                        />

                        {/* 액션 버튼 */}
                        <Flex gap="2" justify="center">
                          {/* 삭제 버튼 */}
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => handleFileRemove(index)}
                            style={{
                              background: "var(--red-3)",
                              color: "var(--red-11)",
                              cursor: "pointer",
                              padding: "0 8px",
                              height: "26px",
                            }}
                          >
                            <TrashIcon width={12} height={12} />
                          </Button>
                        </Flex>
                      </Box>
                    ))}
                  </Box>

                  {/* 데이터 배치 애노테이션 도구 */}
                  {selectedFiles.length > 0 && (
                    <Card style={{ padding: "12px", marginTop: "8px", background: "white", border: "1px solid var(--gray-4)" }}>
                      <Flex direction="column" gap="2">
                        <Text size="2" weight="medium">Batch Annotation Tools</Text>
                        <Flex gap="2" wrap="wrap">
                          <Button 
                            size="1" 
                            variant="soft" 
                            onClick={() => {
                              // 모든 선택된 파일에 동일한 애노테이션 적용
                              const annotationValue = window.prompt("Enter annotation to apply to all selected files:");
                              if (annotationValue !== null) {
                                setAnnotations(annotations.map(() => annotationValue));
                              }
                            }}
                            style={{
                              background: "var(--violet-3)",
                              color: "var(--violet-11)",
                              cursor: "pointer",
                            }}
                          >
                            Apply to All
                          </Button>
                          
                          <Button 
                            size="1" 
                            variant="soft" 
                            onClick={() => {
                              // 파일이름으로 애노테이션 자동 생성
                              setAnnotations(selectedFiles.map(file => {
                                const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
                                return nameWithoutExt.replace(/[_-]/g, ' ');
                              }));
                            }}
                            style={{
                              background: "var(--amber-3)",
                              color: "var(--amber-11)",
                              cursor: "pointer",
                            }}
                          >
                            Use Filenames
                          </Button>
                          
                          <Button 
                            size="1" 
                            variant="soft" 
                            onClick={() => setAnnotations(annotations.map(() => ""))}
                            style={{
                              background: "var(--gray-3)",
                              color: "var(--gray-11)",
                              cursor: "pointer",
                            }}
                          >
                            Clear All
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  )}
                </Flex>
              </Card>
            )}

            {/* 통합 업로드 Progress Status */}
            {uploadProgress.status !== "idle" && (
              <Card
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--gray-4)",
                  background: "var(--gray-1)",
                  marginTop: "16px",
                }}
              >
                <Flex direction="column" gap="3">
                  <Flex align="center" justify="between">
                    <Text size="2" weight="bold">
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
                    >
                      {uploadProgress.status === "uploading" && "Processing..."}
                      {uploadProgress.status === "creating" && "Creating Dataset..."}
                      {uploadProgress.status === "success" && "Success"}
                      {uploadProgress.status === "failed" && "Failed"}
                    </Badge>
                  </Flex>

                  <Text size="2">{uploadProgress.message}</Text>

                  <Box
                    style={{
                      width: "100%",
                      height: "4px",
                      background: "var(--gray-4)",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      style={{
                        width: `${uploadProgress.progress}%`,
                        height: "100%",
                        background: "var(--blue-9)",
                        borderRadius: "2px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>

                  {uploadProgress.status === "creating" && (
                    <Flex align="center" gap="2" justify="center">
                      <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                      <Text size="2">Creating dataset on Sui blockchain...</Text>
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
                background: "#FF5733",
                color: "white",
                cursor:
                  !currentWallet?.accounts[0]?.address ||
                  !metadata.name ||
                  isLoading ||
                  selectedFiles.length === 0
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  !currentWallet?.accounts[0]?.address ||
                  !metadata.name ||
                  isLoading ||
                  selectedFiles.length === 0
                    ? 0.5
                    : 1,
                padding: "0 24px",
                height: "40px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              <Flex align="center" gap="2">
                {isLoading ? (
                  <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <UploadIcon />
                )}
                <span>
                  {isLoading ? "Creating Dataset..." : "Upload as Single Blob"}
                </span>
              </Flex>
            </Button>

            {uploadSuccess && (
              <Card
                style={{
                  background: "#E8F5E9",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  marginTop: "12px",
                  width: "100%",
                  border: "1px solid #A5D6A7",
                }}
              >
                <Flex align="center" gap="3">
                  <CheckCircledIcon style={{ color: "#2E7D32" }} width={18} height={18} />
                  <Text size="2" style={{ color: "#2E7D32" }}>
                    Dataset created successfully!
                  </Text>
                </Flex>
              </Card>
            )}

            {error && (
              <Card
                style={{
                  background: "#FFEBEE",
                  padding: "14px 18px",
                  borderRadius: "8px",
                  marginTop: "12px",
                  width: "100%",
                  border: "1px solid #FFCDD2",
                }}
              >
                <Flex align="center" gap="3">
                  <ExclamationTriangleIcon style={{ color: "#D32F2F" }} width={18} height={18} />
                  <Text size="2" style={{ color: "#D32F2F" }}>
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
