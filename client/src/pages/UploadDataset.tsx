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
import { calculateFileHash } from "../services/walrusService";
import { uploadMedia } from "../services/walrusService";

export function UploadDataset() {
  const navigate = useNavigate();
  const { currentWallet } = useCurrentWallet();
  const { createDataset } = useDatasetSuiService();
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

  // 파일 업로드 상태 추가
  const [uploadStatus, setUploadStatus] = useState<
    Record<
      number,
      {
        status: "idle" | "uploading" | "success" | "failed";
        progress: number;
        blobId?: string;
        error?: string;
        message: string;
      }
    >
  >({});

  const [uploadedFiles, setUploadedFiles] = useState<Array<{ blobId: string; fileHash: string }>>(
    []
  );
  const [isCreatingDataset, setIsCreatingDataset] = useState(false);

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2초

  const [uploadProgress, setUploadProgress] = useState({
    totalFiles: 0,
    uploadedFiles: 0,
    failedFiles: 0,
    status: "" as "idle" | "uploading" | "creating" | "success" | "failed",
  });

  const retryUpload = async (
    file: File,
    index: number,
    retryCount = 0
  ): Promise<{ blobId: string; fileHash: string } | null> => {
    try {
      setUploadStatus(prev => ({
        ...prev,
        [index]: {
          status: "uploading",
          progress: 10,
          message:
            retryCount > 0
              ? `Retrying upload (${retryCount}/${MAX_RETRIES})...`
              : `Uploading file ${file.name}`,
        },
      }));

      const storageInfo = await uploadMedia(file, currentWallet!.accounts[0].address, 10);

      setUploadStatus(prev => ({
        ...prev,
        [index]: {
          status: "uploading",
          progress: 50,
          message: `Calculating hash for ${file.name}`,
        },
      }));

      const fileHash = await calculateFileHash(file);

      setUploadStatus(prev => ({
        ...prev,
        [index]: {
          status: "success",
          progress: 100,
          blobId: storageInfo.blobId,
          fileHash: fileHash,
          message: `${file.name} uploaded successfully`,
        },
      }));

      setUploadProgress(prev => ({
        ...prev,
        uploadedFiles: prev.uploadedFiles + 1,
      }));

      return { blobId: storageInfo.blobId, fileHash };
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);

      if (retryCount < MAX_RETRIES) {
        setUploadStatus(prev => ({
          ...prev,
          [index]: {
            status: "uploading",
            progress: 0,
            message: `Upload failed, retrying in ${RETRY_DELAY / 1000}s (${retryCount + 1}/${MAX_RETRIES})`,
          },
        }));

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryUpload(file, index, retryCount + 1);
      }

      setUploadStatus(prev => ({
        ...prev,
        [index]: {
          status: "failed",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
          message: `Failed to upload ${file.name} after ${MAX_RETRIES} retries`,
        },
      }));

      setUploadProgress(prev => ({
        ...prev,
        failedFiles: prev.failedFiles + 1,
      }));

      return null;
    }
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setSelectedFiles(files);
    setAnnotations(Array(files.length).fill(""));
    setError(null);

    // 파일 업로드 상태 초기화
    const initialStatus: Record<number, any> = {};
    files.forEach((_, index) => {
      initialStatus[index] = { status: "idle", progress: 0, message: "" };
    });
    setUploadStatus(initialStatus);

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

  const handleUpload = async () => {
    if (!currentWallet?.accounts[0]?.address || selectedFiles.length === 0) return;

    try {
      setPreviewStep("upload");
      setError(null);
      setIsLoading(true);
      setUploadedFiles([]);
      setUploadProgress({
        totalFiles: selectedFiles.length,
        uploadedFiles: 0,
        failedFiles: 0,
        status: "uploading",
      });

      // 병렬로 파일 업로드 시작
      const uploadPromises = selectedFiles.map((file, index) => retryUpload(file, index));
      const results = await Promise.all(uploadPromises);

      // 모든 파일이 성공적으로 업로드되었는지 확인
      const successfulUploads = results.filter(
        (result): result is { blobId: string; fileHash: string } => result !== null
      );

      if (successfulUploads.length !== selectedFiles.length) {
        setUploadProgress(prev => ({
          ...prev,
          status: "failed",
        }));
        setError(
          `Failed to upload all files. ${successfulUploads.length} of ${selectedFiles.length} files uploaded successfully.`
        );
        return;
      }

      // 모든 파일이 성공적으로 업로드되면 자동으로 데이터셋 생성
      setUploadedFiles(successfulUploads);
      setUploadProgress(prev => ({
        ...prev,
        status: "creating",
      }));

      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

      // Sui 트랜잭션 호출
      await createDataset(
        {
          ...metadata,
          dataSize: totalSize,
          creator: metadata.creator || currentWallet.accounts[0].address,
        },
        annotations,
        successfulUploads,
        result => {
          console.log("Dataset created:", result);
          setUploadSuccess(true);
          setUploadProgress(prev => ({
            ...prev,
            status: "success",
          }));
          // 성공 후 상태 초기화
          setSelectedFiles([]);
          setAnnotations([]);
          setUploadStatus({});
          setUploadedFiles([]);
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
        error => {
          console.error("Dataset creation failed:", error);
          setError(`Failed to create dataset: ${error.message}`);
          setUploadProgress(prev => ({
            ...prev,
            status: "failed",
          }));
        }
      );
    } catch (error) {
      console.error("Error in upload process:", error);
      setError(error instanceof Error ? error.message : "Failed to process dataset");
      setUploadProgress(prev => ({
        ...prev,
        status: "failed",
      }));
    } finally {
      setIsLoading(false);
      setIsCreatingDataset(false);
    }
  };

  // 실패한 파일 재시도 함수
  const handleRetryFile = async (index: number) => {
    if (!currentWallet?.accounts[0]?.address) return;

    const file = selectedFiles[index];

    try {
      // 상태 업데이트: 업로드 시작
      setUploadStatus(prev => ({
        ...prev,
        [index]: { status: "uploading", progress: 10, message: `Uploading file ${file.name}...` },
      }));

      // 파일 업로드 시작
      const storageInfo = await uploadMedia(file, currentWallet.accounts[0].address, 10);

      // 업로드 중간 상태 표시
      setUploadStatus(prev => ({
        ...prev,
        [index]: { status: "uploading", progress: 50, message: `Processing file ${file.name}...` },
      }));

      // 파일 해시 계산
      const fileHash = await calculateFileHash(file);

      // 상태 업데이트: 업로드 완료
      setUploadStatus(prev => ({
        ...prev,
        [index]: {
          status: "success",
          progress: 100,
          blobId: storageInfo.blobId,
          fileHash: fileHash,
          message: `${file.name} uploaded successfully`,
        },
      }));

      // 성공 메시지 설정
      setError(`File "${file.name}" uploaded successfully. You can now create the dataset.`);
    } catch (error) {
      // 상태 업데이트: 업로드 실패
      setUploadStatus(prev => ({
        ...prev,
        [index]: {
          status: "failed",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
          message: `Failed to upload ${file.name}`,
        },
      }));

      setError(
        `Failed to upload file "${file.name}": ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <Box style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>
        Training Datasets
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
              Upload your training data files. The files will be stored on-chain and can be used for
              model training.
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
                  <Heading size="3">Selected Files</Heading>
                  {selectedFiles.map((file, index) => (
                    <Card
                      key={index}
                      style={{
                        padding: "12px",
                        borderRadius: "6px",
                        border: "1px solid var(--gray-4)",
                        background:
                          uploadStatus[index]?.status === "failed"
                            ? "#FFEBEE"
                            : uploadStatus[index]?.status === "success"
                              ? "#E8F5E9"
                              : "var(--gray-2)",
                      }}
                    >
                      <Flex direction="column" gap="2">
                        <Flex align="center" justify="between">
                          <Flex align="center" gap="2">
                            <FileIcon width={16} height={16} style={{ color: "var(--gray-9)" }} />
                            <Text size="2" style={{ fontWeight: 500 }}>
                              {file.name}
                            </Text>

                            {/* 파일 상태 표시 */}
                            {uploadStatus[index]?.status === "uploading" && (
                              <Badge color="blue">
                                Uploading... {uploadStatus[index]?.progress}%
                                {uploadStatus[index]?.message &&
                                  ` (${uploadStatus[index]?.message})`}
                              </Badge>
                            )}
                            {uploadStatus[index]?.status === "success" && (
                              <Badge color="green">
                                Uploaded
                                {uploadStatus[index]?.message &&
                                  ` (${uploadStatus[index]?.message})`}
                              </Badge>
                            )}
                            {uploadStatus[index]?.status === "failed" && (
                              <Badge color="red">
                                Failed
                                {uploadStatus[index]?.message &&
                                  ` (${uploadStatus[index]?.message})`}
                              </Badge>
                            )}
                          </Flex>

                          <Flex gap="2">
                            {/* 실패한 파일은 재시도 버튼 표시 */}
                            {uploadStatus[index]?.status === "failed" && (
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => handleRetryFile(index)}
                                style={{
                                  background: "var(--blue-3)",
                                  color: "var(--blue-11)",
                                  cursor: "pointer",
                                }}
                              >
                                <ReloadIcon width={14} height={14} />
                              </Button>
                            )}

                            <Button
                              size="1"
                              variant="soft"
                              onClick={() => handleFileRemove(index)}
                              style={{
                                background: "var(--red-3)",
                                color: "var(--red-11)",
                                cursor: "pointer",
                              }}
                            >
                              <TrashIcon width={14} height={14} />
                            </Button>
                          </Flex>
                        </Flex>

                        {/* 업로드 진행 상태바 */}
                        {uploadStatus[index]?.status === "uploading" && (
                          <Box
                            style={{
                              width: "100%",
                              height: "4px",
                              background: "var(--gray-4)",
                              borderRadius: "2px",
                              marginTop: "4px",
                              marginBottom: "8px",
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              style={{
                                width: `${uploadStatus[index]?.progress || 0}%`,
                                height: "100%",
                                background: "var(--blue-9)",
                                borderRadius: "2px",
                                transition: "width 0.3s ease",
                              }}
                            />
                          </Box>
                        )}

                        {/* 업로드 실패 에러 메시지 */}
                        {uploadStatus[index]?.status === "failed" && uploadStatus[index]?.error && (
                          <Text size="1" style={{ color: "var(--red-11)" }}>
                            Error: {uploadStatus[index]?.error}
                          </Text>
                        )}

                        <Flex direction="column" gap="1">
                          <Text size="1" style={{ color: "var(--gray-9)" }}>
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                          <Text size="1" style={{ color: "var(--gray-9)" }}>
                            Type: {file.type || "Unknown"}
                          </Text>
                          <TextField.Root
                            placeholder="Enter annotation"
                            value={annotations[index]}
                            onChange={e => handleAnnotationChange(index, e.target.value)}
                          />
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Card>
            )}

            {/* Progress Status */}
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
                      {uploadProgress.status === "uploading" && "Uploading to Walrus..."}
                      {uploadProgress.status === "creating" && "Creating Dataset on Sui..."}
                      {uploadProgress.status === "success" && "Success"}
                      {uploadProgress.status === "failed" && "Failed"}
                    </Badge>
                  </Flex>

                  {uploadProgress.status === "uploading" && (
                    <>
                      <Text size="2">
                        Uploaded {uploadProgress.uploadedFiles} of {uploadProgress.totalFiles} files
                        {uploadProgress.failedFiles > 0 &&
                          ` (${uploadProgress.failedFiles} failed)`}
                      </Text>
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
                            width: `${(uploadProgress.uploadedFiles / uploadProgress.totalFiles) * 100}%`,
                            height: "100%",
                            background: "var(--blue-9)",
                            borderRadius: "2px",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </>
                  )}

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
                isCreatingDataset
              }
              style={{
                background: "#FF5733",
                color: "white",
                cursor:
                  !currentWallet?.accounts[0]?.address ||
                  !metadata.name ||
                  isLoading ||
                  isCreatingDataset
                    ? "not-allowed"
                    : "pointer",
                opacity:
                  !currentWallet?.accounts[0]?.address ||
                  !metadata.name ||
                  isLoading ||
                  isCreatingDataset
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
                {isLoading || isCreatingDataset ? (
                  <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <UploadIcon />
                )}
                <span>
                  {isLoading && "Uploading to Walrus..."}
                  {isCreatingDataset && "Creating Dataset..."}
                  {!isLoading && !isCreatingDataset && "Upload Dataset"}
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
