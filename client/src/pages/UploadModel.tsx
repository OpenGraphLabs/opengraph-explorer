import { useState, ChangeEvent } from "react";
import { Box, Flex, Text, TextArea, Select, Button, TextField } from "@radix-ui/themes";
import { ModelUploader } from "../components/ModelUploader";
import { useModelUpload } from "../hooks/useModelUpload";

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

    // TODO: Implement blockchain upload logic
    console.log("Uploading to blockchain:", {
      ...modelInfo,
      model: convertedModel,
    });

    // Reset form after successful upload
    resetForm();
  };

  const resetForm = () => {
    setModelInfo({
      name: "",
      description: "",
      task: "",
    });
    resetUploadState();
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
        convertedModel={convertedModel}
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

          <Box style={{ marginTop: "16px" }}>
            <Button 
              onClick={handleUpload}
              disabled={!convertedModel || !modelInfo.name || !modelInfo.description || !modelInfo.task}
              style={{ 
                background: "#FF5733",
                color: "white",
                cursor: "pointer",
                opacity: (!convertedModel || !modelInfo.name || !modelInfo.description || !modelInfo.task) ? 0.5 : 1
              }}
            >
              Upload to Blockchain
            </Button>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
} 