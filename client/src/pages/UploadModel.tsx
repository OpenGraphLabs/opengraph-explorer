import { useState, ChangeEvent } from "react";
import { Box, Flex, Text, TextArea, Select, Button, TextField } from "@radix-ui/themes";
import { ModelUploader } from "../components/ModelUploader";
import { useModelUpload } from "../hooks/useModelUpload";
import { useUploadModelToSui } from "../services/modelSuiService";

interface ModelInfo {
  name: string;
  description: string;
  task: string;
}

export function UploadModel() {
  const [modelInfo, setModelInfo] = useState<ModelInfo>({
    name: "",
    description: "",
    task: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    convertedModel,
    error,
    convertModel,
    resetUploadState
  } = useModelUpload();

  // Sui 블록체인에 모델 업로드를 위한 훅
  const { uploadModel } = useUploadModelToSui();

  const handleFileSelect = async (file: File) => {
    try {
      await convertModel(file);
    } catch (error) {
      console.error("Error during model conversion:", error);
    }
  };

  const handleUpload = async () => {
    if (!modelInfo.name || !modelInfo.description || !modelInfo.task) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!convertedModel) {
      alert("Please convert a model file first.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // 모델 데이터와 메타데이터를 함께 업로드
      const result = await uploadModel(convertedModel, modelInfo);
      
      console.log("Model uploaded to blockchain:", result);
      
      setUploadSuccess(true);
      
      setTimeout(() => {
        resetForm();
        setUploadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error uploading model to blockchain:", error);
      setUploadError(error instanceof Error ? error.message : "Error uploading model to blockchain");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setModelInfo({
      name: "",
      description: "",
      task: "",
    });
    resetUploadState();
    setUploadError(null);
  };

  return (
    <Box style={{ maxWidth: "800px", margin: "0 auto", padding: "32px" }}>
      <Text size="8" style={{ marginBottom: "32px", fontWeight: "bold" }}>
        Upload Model
      </Text>

      <ModelUploader
        onFileSelect={handleFileSelect}
        selectedFile={selectedFile}
        isConverting={isConverting}
        conversionStatus={conversionStatus}
        conversionProgress={conversionProgress}
        error={error}
      />

      <Box style={{ marginTop: "32px" }}>
        <Text size="6" style={{ marginBottom: "24px", fontWeight: "500" }}>
          Model Information
        </Text>

        <Flex direction="column" gap="4">
          <Box>
            <Text as="label" size="2" style={{ marginBottom: "8px", display: "block" }}>
              Model Name
            </Text>
            <TextField.Root>
              <TextField.Slot>
                <input
                  type="text"
                  placeholder="Enter model name"
                  value={modelInfo.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setModelInfo({ ...modelInfo, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "none",
                    outline: "none",
                    background: "transparent"
                  }}
                />
              </TextField.Slot>
            </TextField.Root>
          </Box>

          <Box>
            <Text as="label" size="2" style={{ marginBottom: "8px", display: "block" }}>
              Description
            </Text>
            <TextArea
              placeholder="Enter model description"
              value={modelInfo.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setModelInfo({ ...modelInfo, description: e.target.value })}
              style={{ minHeight: "120px" }}
            />
          </Box>

          <Box>
            <Text as="label" size="2" style={{ marginBottom: "8px", display: "block" }}>
              Task Type
            </Text>
            <Select.Root
              value={modelInfo.task}
              onValueChange={(value) => setModelInfo({ ...modelInfo, task: value })}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Common Tasks</Select.Label>
                  <Select.Item value="text-classification">Text Classification</Select.Item>
                  <Select.Item value="image-classification">Image Classification</Select.Item>
                  <Select.Item value="object-detection">Object Detection</Select.Item>
                  <Select.Item value="text-generation">Text Generation</Select.Item>
                  <Select.Item value="translation">Translation</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </Box>

          {uploadError && (
            <Box style={{ 
              marginTop: "16px", 
              padding: "12px", 
              backgroundColor: "#FFEBEE", 
              borderRadius: "4px", 
              color: "#D32F2F" 
            }}>
              <Text size="2">{uploadError}</Text>
            </Box>
          )}

          {uploadSuccess && (
            <Box style={{ 
              marginTop: "16px", 
              padding: "12px", 
              backgroundColor: "#E8F5E9", 
              borderRadius: "4px", 
              color: "#2E7D32" 
            }}>
              <Text size="2">Model successfully uploaded to Sui blockchain!</Text>
            </Box>
          )}

          <Box style={{ marginTop: "16px" }}>
            <Button 
              onClick={handleUpload}
              disabled={isUploading || !convertedModel || !modelInfo.name || !modelInfo.description || !modelInfo.task}
              style={{ 
                background: "#FF5733",
                color: "white",
                cursor: isUploading ? "not-allowed" : "pointer",
                opacity: (isUploading || !convertedModel || !modelInfo.name || !modelInfo.description || !modelInfo.task) ? 0.5 : 1
              }}
            >
              {isUploading ? "Uploading to Blockchain..." : "Upload to Blockchain"}
            </Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
} 