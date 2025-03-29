import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Heading,
  Card,
} from "@radix-ui/themes";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { modelGraphQLService, BlobObject } from "../services/modelGraphQLService";
import { uploadTrainingData } from "../services/walrusService";
import { SUI_NETWORK } from "../constants/suiConfig";
import {
  ReloadIcon,
  CheckCircledIcon,
  ExclamationTriangleIcon,
  UploadIcon,
} from "@radix-ui/react-icons";

export function UploadDataset() {
  const { currentWallet } = useCurrentWallet();
  const [datasets, setDatasets] = useState<BlobObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);

  useEffect(() => {
    if (currentWallet?.accounts[0]?.address) {
      fetchUserDatasets();
    }
  }, [currentWallet?.accounts[0]?.address]);

  const fetchUserDatasets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userDatasets = await modelGraphQLService.getUserBlobs(currentWallet!.accounts[0].address);
      setDatasets(userDatasets);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch datasets");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!currentWallet?.accounts[0]?.address || files.length === 0) return;

    try {
      setUploadInProgress(true);
      setError(null);
      await uploadTrainingData(files[0], currentWallet.accounts[0].address);
      setUploadSuccess(true);
      await fetchUserDatasets();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to upload dataset");
    } finally {
      setUploadInProgress(false);
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
              Upload your training data file to create a new dataset. The file will be stored on-chain and can be used for model training.
            </Text>

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
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    handleFileUpload(Array.from(files));
                  }
                }}
                disabled={isLoading || !currentWallet?.accounts[0]?.address}
                style={{ display: "none" }}
                id="dataset-upload"
              />
              <label
                htmlFor="dataset-upload"
                style={{
                  cursor: isLoading || !currentWallet?.accounts[0]?.address ? "not-allowed" : "pointer",
                  opacity: isLoading || !currentWallet?.accounts[0]?.address ? 0.5 : 1,
                }}
              >
                <Flex direction="column" align="center" gap="2">
                  <UploadIcon width={24} height={24} style={{ color: "var(--gray-9)" }} />
                  <Text size="2" style={{ color: "var(--gray-11)" }}>
                    {!currentWallet?.accounts[0]?.address
                      ? "Please connect your wallet first"
                      : isLoading
                      ? "Uploading..."
                      : "Click to upload dataset"}
                  </Text>
                </Flex>
              </label>
            </Box>

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

        {/* Your Datasets Card */}
        <Card
          style={{
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)",
            marginBottom: "32px",
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
                Your Datasets
              </Heading>
            </Flex>

            <Text size="2" style={{ color: "var(--gray-11)", marginBottom: "12px" }}>
              View and manage your uploaded training datasets. You can use these datasets when uploading new models.
            </Text>

            {isLoading ? (
              <Flex align="center" gap="2" justify="center" py="6">
                <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
                <Text>Loading datasets...</Text>
              </Flex>
            ) : error ? (
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
            ) : datasets.length === 0 ? (
              <Text size="2" style={{ color: "var(--gray-11)", textAlign: "center", padding: "24px 0" }}>
                No datasets found. Upload some files to get started.
              </Text>
            ) : (
              <Flex direction="column" gap="4">
                {datasets.map((dataset) => (
                  <Card
                    key={dataset.id}
                    style={{
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid var(--gray-4)",
                      background: "var(--gray-1)",
                    }}
                  >
                    <Flex direction="column" gap="3">
                      <Flex align="center" justify="between">
                        <Text size="2" style={{ fontWeight: 500 }}>
                          Dataset {dataset.id.substring(0, 8)}
                        </Text>
                      </Flex>
                      <Flex direction="column" gap="1">
                        <Text size="1" style={{ color: "var(--gray-9)" }}>
                          Created: {new Date(dataset.createdAt).toLocaleDateString()}
                        </Text>
                        <Text size="1" style={{ color: "var(--gray-9)" }}>
                          Size: {(dataset.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </Flex>
                      <Flex gap="2">
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => window.open(dataset.mediaUrl, '_blank')}
                          style={{
                            background: "var(--blue-3)",
                            color: "var(--blue-11)",
                            cursor: "pointer",
                          }}
                        >
                          View Data
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => window.open(`https://walruscan.com/${SUI_NETWORK.TYPE}/blob/${dataset.id}`, '_blank')}
                          style={{
                            background: "var(--purple-3)",
                            color: "var(--purple-11)",
                            cursor: "pointer",
                          }}
                        >
                          View on Walrus Scan
                        </Button>
                        <Button
                          size="1"
                          variant="soft"
                          onClick={() => window.open(`https://suiscan.xyz/${SUI_NETWORK.TYPE}/object/${dataset.id}`, '_blank')}
                          style={{
                            background: "var(--blue-3)",
                            color: "var(--blue-11)",
                            cursor: "pointer",
                          }}
                        >
                          View on SuiScan
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
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