import { Box, Text, Card, Flex, Button } from "@radix-ui/themes";
import {
  UploadIcon,
  ReloadIcon,
  CheckCircledIcon,
  InfoCircledIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { useRef } from "react";

interface ModelUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isConverting: boolean;
  conversionStatus: string;
  conversionProgress: number;
  error: string | null;
  resetUploadState: () => void;
}

export function ModelUploader({
  onFileSelect,
  selectedFile,
  isConverting,
  conversionStatus,
  conversionProgress,
  error,
  resetUploadState,
}: ModelUploaderProps) {
  // Use useRef to reference the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();

      if (fileExtension === "h5") {
        onFileSelect(file);
      } else {
        // Error handling is managed by the parent component
        throw new Error("Only .h5 files are supported.");
      }
    }
  };

  // Click the file input when the browse button is clicked
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      
      if (fileExtension === "h5") {
        onFileSelect(file);
      } else {
        alert("Only .h5 files are supported.");
      }
    }
  };

  const resetFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Call the parent component's resetUploadState function
    resetUploadState();
  };

  return (
    <Box>
      <Card
        style={{
          borderStyle: "dashed",
          borderWidth: "2px",
          borderColor: selectedFile ? "var(--accent-6)" : "var(--gray-6)",
          background: selectedFile ? "var(--accent-1)" : "var(--gray-1)",
          padding: "36px",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          marginBottom: "20px",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Flex direction="column" align="center" gap="4">
          <Box
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: selectedFile ? "var(--accent-2)" : "var(--gray-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
          >
            <UploadIcon
              width={32}
              height={32}
              style={{ color: selectedFile ? "#FF5733" : "var(--gray-11)" }}
            />
          </Box>

          <Text style={{ fontWeight: 600, fontSize: "18px", letterSpacing: "0.01em" }}>
            {selectedFile ? "Model file selected" : "Drag and drop your model file here"}
          </Text>

          {!selectedFile && (
            <>
              <Text size="2" style={{ color: "var(--gray-11)" }}>
                or
              </Text>
              <Button
                size="2"
                onClick={handleBrowseClick}
                style={{
                  cursor: "pointer",
                  background: "#FF5733",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: 500,
                  padding: "10px 16px",
                }}
              >
                Browse Files
              </Button>
            </>
          )}

          <input
            ref={fileInputRef}
            id="file-upload"
            type="file"
            accept=".h5"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {selectedFile && (
            <Flex direction="column" style={{ width: "100%" }} gap="4">
              <Card
                style={{
                  padding: "14px 18px",
                  borderRadius: "8px",
                  border: "1px solid var(--accent-6)",
                  background: "var(--accent-2)",
                }}
              >
                <Flex align="center" justify="between">
                  <Flex align="center" gap="3">
                    <Box
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "6px",
                        background: "var(--accent-3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <InfoCircledIcon style={{ color: "#FF5733" }} width={20} height={20} />
                    </Box>
                    <Flex direction="column" gap="1">
                      <Text size="2" style={{ fontWeight: 600 }}>
                        {selectedFile.name}
                      </Text>
                      <Text size="1" style={{ color: "var(--gray-11)" }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </Flex>
                  </Flex>
                  <Button
                    size="1"
                    variant="ghost"
                    onClick={resetFile}
                    style={{
                      borderRadius: "50%",
                      padding: "8px",
                      color: "var(--gray-11)",
                    }}
                  >
                    <Cross2Icon />
                  </Button>
                </Flex>
              </Card>

              <Button
                onClick={() => onFileSelect(selectedFile)}
                size="2"
                disabled={isConverting}
                style={{
                  background: isConverting ? "var(--gray-5)" : "#FF5733",
                  color: "white",
                  borderRadius: "8px",
                  fontWeight: 500,
                  cursor: isConverting ? "not-allowed" : "pointer",
                  alignSelf: "center",
                  opacity: isConverting ? 0.7 : 1,
                  padding: "10px 16px",
                }}
              >
                {isConverting ? "Converting..." : conversionStatus ? "Convert Again" : "Convert Model"}
              </Button>
            </Flex>
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
                <InfoCircledIcon style={{ color: "#D32F2F" }} width={18} height={18} />
                <Text size="2" style={{ color: "#D32F2F" }}>
                  {error}
                </Text>
              </Flex>
            </Card>
          )}

          {conversionStatus && (
            <Card
              style={{
                background: "#E8F5E9",
                padding: "14px 18px",
                borderRadius: "8px",
                marginTop: "12px",
                width: "100%",
                border: "1px solid #C8E6C9",
              }}
            >
              <Flex direction="column" gap="3">
                <Flex align="center" gap="3">
                  {isConverting ? (
                    <ReloadIcon
                      style={{ color: "#4CAF50", animation: "spin 1s linear infinite" }}
                      width={18}
                      height={18}
                    />
                  ) : (
                    <CheckCircledIcon style={{ color: "#4CAF50" }} width={18} height={18} />
                  )}
                  <Text size="2" style={{ color: "#2E7D32", fontWeight: 500 }}>
                    {conversionStatus}
                  </Text>
                </Flex>

                {isConverting && conversionProgress > 0 && (
                  <Box>
                    <Box
                      style={{
                        width: "100%",
                        height: "10px",
                        background: "#C8E6C9",
                        borderRadius: "5px",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        style={{
                          width: `${conversionProgress}%`,
                          height: "100%",
                          background: "#4CAF50",
                          transition: "width 0.3s ease-in-out",
                          borderRadius: "5px",
                        }}
                      />
                    </Box>
                    <Flex justify="between" mt="2">
                      <Text size="1" style={{ color: "#2E7D32" }}>
                        Progress
                      </Text>
                      <Text size="1" style={{ color: "#2E7D32", fontWeight: 500 }}>
                        {conversionProgress}%
                      </Text>
                    </Flex>
                  </Box>
                )}
              </Flex>
            </Card>
          )}
        </Flex>
      </Card>

      <Card
        style={{
          background: "var(--gray-2)",
          padding: "14px 18px",
          borderRadius: "8px",
          border: "none",
        }}
      >
        <Flex align="center" gap="3">
          <InfoCircledIcon style={{ color: "#2196F3" }} width={18} height={18} />
          <Text size="2" style={{ color: "var(--gray-11)", lineHeight: 1.5, letterSpacing: "0.01em" }}>
            Only .h5 model files are supported. Uploaded models will be automatically converted to
            OpenGraph format.
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
