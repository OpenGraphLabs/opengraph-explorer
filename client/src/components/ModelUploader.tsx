import { Box, Text, Card, Flex } from "@radix-ui/themes";
import { UploadIcon, ReloadIcon, CheckCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons";

interface ModelUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  isConverting: boolean;
  conversionStatus: string;
  conversionProgress: number;
  error: string | null;
}

export function ModelUploader({
  onFileSelect,
  selectedFile,
  isConverting,
  conversionStatus,
  conversionProgress,
  error
}: ModelUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'h5') {
        onFileSelect(file);
      } else {
        // Error handling is managed by the parent component
        throw new Error("Only .h5 files are supported.");
      }
    }
  };

  return (
    <>
      <Card style={{ 
        borderStyle: "dashed", 
        borderWidth: "2px", 
        borderColor: "var(--gray-5)",
        background: "var(--gray-1)",
        padding: "32px",
        borderRadius: "8px",
        marginBottom: "16px"
      }}>
        <Flex direction="column" align="center" gap="3">
          <UploadIcon width={32} height={32} style={{ color: "#FF5733" }} />
          <Text style={{ fontWeight: 500 }}>Drag and drop your model file here</Text>
          <Text size="2" style={{ color: "#777" }}>or</Text>
          <label htmlFor="file-upload" style={{ 
            cursor: "pointer", 
            padding: "8px 16px", 
            background: "#FF5733", 
            color: "white", 
            borderRadius: "8px",
            fontWeight: 500,
            fontSize: "14px"
          }}>
            Browse Files
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".h5"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          {selectedFile && (
            <Text size="2" style={{ marginTop: "8px" }}>
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Text>
          )}
          {error && (
            <Text size="2" style={{ marginTop: "8px", color: "red" }}>
              {error}
            </Text>
          )}
          {conversionStatus && (
            <Card style={{ 
              background: "#E8F5E9", 
              padding: "12px", 
              borderRadius: "8px",
              marginTop: "12px",
              width: "100%",
              border: "none"
            }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  {isConverting ? (
                    <ReloadIcon style={{ color: "#4CAF50", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <CheckCircledIcon style={{ color: "#4CAF50" }} />
                  )}
                  <Text size="2" style={{ color: "#2E7D32" }}>
                    {conversionStatus}
                  </Text>
                </Flex>
                
                {isConverting && conversionProgress > 0 && (
                  <Box>
                    <Box style={{ 
                      width: "100%", 
                      height: "6px", 
                      background: "#E0E0E0", 
                      borderRadius: "3px", 
                      overflow: "hidden" 
                    }}>
                      <Box style={{ 
                        width: `${conversionProgress}%`, 
                        height: "100%", 
                        background: "#4CAF50",
                        transition: "width 0.3s ease-in-out"
                      }} />
                    </Box>
                    <Text size="1" style={{ color: "#2E7D32", textAlign: "right", marginTop: "4px" }}>
                      {conversionProgress}%
                    </Text>
                  </Box>
                )}
              </Flex>
            </Card>
          )}
        </Flex>
      </Card>
      
      <Card style={{ 
        background: "#F8F9FA", 
        padding: "16px", 
        borderRadius: "8px",
        border: "none"
      }}>
        <Flex align="center" gap="2">
          <InfoCircledIcon style={{ color: "#2196F3" }} />
          <Text size="2" style={{ color: "#555" }}>
            Only .h5 model files are supported. Uploaded models will be automatically converted to HuggingFace3.0 format.
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
    </>
  );
} 