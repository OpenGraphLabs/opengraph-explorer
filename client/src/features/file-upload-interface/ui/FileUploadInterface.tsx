import { Box, Flex, Text, Heading, Card } from "@radix-ui/themes";
import { UploadIcon } from "@radix-ui/react-icons";

interface FileUploadInterfaceProps {
  onFilesSelect: (files: File[]) => void;
  isWalletConnected: boolean;
  isLoading: boolean;
}

export function FileUploadInterface({ onFilesSelect, isWalletConnected, isLoading }: FileUploadInterfaceProps) {
  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      onFilesSelect(Array.from(files));
    }
  };

  return (
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

        <Box
          style={{
            border: "2px dashed var(--gray-6)",
            borderRadius: "12px",
            padding: "48px 24px",
            textAlign: "center",
            background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
            cursor: isWalletConnected && !isLoading ? "pointer" : "not-allowed",
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <input
            type="file"
            multiple
            onChange={e => handleFileSelect(e.target.files)}
            disabled={!isWalletConnected || isLoading}
            style={{ display: "none" }}
            id="dataset-upload"
          />
          <label
            htmlFor="dataset-upload"
            style={{
              cursor: !isWalletConnected || isLoading ? "not-allowed" : "pointer",
              display: "block",
              width: "100%",
              height: "100%",
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
                  marginBottom: "8px",
                }}
              >
                <UploadIcon width={24} height={24} style={{ color: "white" }} />
              </Box>

              <Box>
                <Text size="4" weight="bold" style={{ color: "var(--gray-12)", marginBottom: "8px" }}>
                  {!isWalletConnected
                    ? "Connect your wallet first"
                    : isLoading
                      ? "Processing..."
                      : "Choose files or drag and drop"}
                </Text>
                <Text size="2" style={{ color: "var(--gray-10)" }}>
                  {!isWalletConnected
                    ? "You need to connect your wallet to upload data"
                    : isLoading
                      ? "Please wait while files are being processed"
                      : "Select multiple files to create your dataset"}
                </Text>
              </Box>

              {isWalletConnected && !isLoading && (
                <Box
                  style={{
                    background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "14px",
                    marginTop: "16px",
                    boxShadow: "0 4px 12px rgba(255, 107, 107, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Browse Files
                </Box>
              )}
            </Flex>
          </label>
        </Box>
      </Flex>
    </Card>
  );
} 