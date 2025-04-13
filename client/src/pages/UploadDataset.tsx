import { useState } from "react";
import { Box, Flex, Text, Button, Heading, Card, TextField, TextArea, Badge } from "@radix-ui/themes";
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
    license: "MIT",
  });

  // 태그 입력 상태
  const [tagInput, setTagInput] = useState("");

  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    setSelectedFiles(files);
    setAnnotations(Array(files.length).fill(""));
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

  const handleUpload = async () => {
    if (!currentWallet?.accounts[0]?.address || selectedFiles.length === 0) return;

    try {
      setPreviewStep("upload");
      setError(null);
      setIsLoading(true);

      // 데이터셋 크기 계산
      const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

      // 데이터셋 생성
      await createDataset(
        {
          ...metadata,
          dataSize: totalSize,
          creator: currentWallet.accounts[0].address,
        },
        selectedFiles,
        annotations,
        result => {
          console.log("Dataset created:", result);
          setUploadSuccess(true);
          setSelectedFiles([]);
          setAnnotations([]);
          setPreviewStep("select");
          setMetadata({
            name: "",
            description: "",
            tags: [],
            dataType: "image/png",
            dataSize: 0,
            creator: "",
            license: "MIT",
          });
        },
        error => {
          console.error("Dataset creation failed:", error);
          setError(error.message);
          setPreviewStep("preview");
        }
      );
    } catch (error) {
      console.error("Error in handleUpload:", error);
      setError(error instanceof Error ? error.message : "Failed to upload dataset");
      setPreviewStep("preview");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>
        Training Datasets
      </Heading>

      <Flex direction="column" gap="6">
        {/* Upload New Dataset Card */}
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
                  1
                </Text>
              </Box>
              <Heading size="4" style={{ fontWeight: 600 }}>
                Upload New Dataset
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              Upload your training data files to create a new dataset. The files will be stored
              on-chain and can be used for model training.
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

            {previewStep === "preview" && selectedFiles.length > 0 && (
              <Flex direction="column" gap="4">
                {/* Dataset Metadata Form */}
                <Card
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid var(--gray-4)",
                    background: "var(--gray-1)",
                  }}
                >
                  <Flex direction="column" gap="3">
                    <Heading size="3">Dataset Metadata</Heading>
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
                    <Flex direction="column" gap="2">
                      <Flex gap="2">
                        <TextField.Root style={{ flex: 1 }}
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

                {/* Selected Files Preview */}
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
                          background: "var(--gray-2)",
                        }}
                      >
                        <Flex direction="column" gap="2">
                          <Flex align="center" justify="between">
                            <Flex align="center" gap="2">
                              <FileIcon width={16} height={16} style={{ color: "var(--gray-9)" }} />
                              <Text size="2" style={{ fontWeight: 500 }}>
                                {file.name}
                              </Text>
                            </Flex>
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
                    <Button
                      onClick={handleUpload}
                      disabled={!currentWallet?.accounts[0]?.address || !metadata.name}
                      style={{
                        background: "#FF5733",
                        color: "white",
                        cursor: !currentWallet?.accounts[0]?.address ? "not-allowed" : "pointer",
                        opacity: !currentWallet?.accounts[0]?.address ? 0.5 : 1,
                        padding: "0 24px",
                        height: "40px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      <Flex align="center" gap="2">
                        <UploadIcon />
                        <span>Upload Dataset</span>
                      </Flex>
                    </Button>
                  </Flex>
                </Card>
              </Flex>
            )}

            {previewStep === "upload" && (
              <Card
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--gray-4)",
                  background: "var(--gray-1)",
                }}
              >
                <Flex direction="column" gap="3">
                  <Flex align="center" gap="2" justify="center" py="2">
                    <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                    <Text>Uploading dataset to Sui...</Text>
                  </Flex>
                </Flex>
              </Card>
            )}

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
                    Dataset uploaded successfully!
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
