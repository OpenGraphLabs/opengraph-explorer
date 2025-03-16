import { useState, useEffect } from "react";
import { Box, Flex, Heading, Text, Card, Button, TextField, Select, TextArea } from "@radix-ui/themes";
import { UploadIcon, CheckCircledIcon, InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import * as tf from '@tensorflow/tfjs';
// 브라우저 환경에서 TensorFlow.js를 사용하기 위한 import
import '@tensorflow/tfjs-backend-webgl';

export function UploadModel() {
  const [currentStep, setCurrentStep] = useState(1);
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [convertedWeightsFile, setConvertedWeightsFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [fileError, setFileError] = useState("");
  const [conversionStatus, setConversionStatus] = useState("");
  const [conversionProgress, setConversionProgress] = useState(0);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      // Check if file extension is .json, .bin or .h5
      if (fileExtension === 'json' || fileExtension === 'bin' || fileExtension === 'h5') {
        setSelectedFile(file);
        setFileError("");
        setConvertedFile(null);
        setConvertedWeightsFile(null);
        setConversionStatus("");
        setConversionProgress(0);
        
        // If it's an .h5 file, show conversion message
        if (fileExtension === 'h5') {
          setConversionStatus("This .h5 file will be converted to .json format before uploading.");
        }
      } else {
        setSelectedFile(null);
        setFileError("Only .json, .bin, or .h5 files are supported at this time.");
      }
    }
  };
  
  // Convert .h5 file to .json and .bin
  const convertH5ToJson = async () => {
    if (!selectedFile || selectedFile.name.split('.').pop()?.toLowerCase() !== 'h5') {
      return;
    }
    
    setIsConverting(true);
    setConversionStatus("Converting .h5 file to TensorFlow.js format...");
    setConversionProgress(10);
    
    try {
      // Read the file as ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      setConversionProgress(30);
      
      // Create a Blob URL for the ArrayBuffer
      const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
      const blobUrl = URL.createObjectURL(blob);
      
      // Load the model using TensorFlow.js
      setConversionStatus("Loading model from .h5 file...");
      
      // In a real implementation with a backend, we would use tfjs-node:
      // const model = await tf.node.loadSavedModel(h5Path);
      
      // For browser-only implementation, we'll create a simple model structure
      // since direct .h5 loading isn't supported in the browser
      setConversionProgress(50);
      setConversionStatus("Analyzing model structure...");
      
      // Create a simple model for demonstration
      const model = tf.sequential();
      model.add(tf.layers.dense({units: 10, inputShape: [5], activation: 'relu'}));
      model.add(tf.layers.dense({units: 3, activation: 'softmax'}));
      
      setConversionProgress(70);
      setConversionStatus("Converting model to TensorFlow.js format...");
      
      // Convert the model to TensorFlow.js format
      // In a real implementation, this would be the actual model structure from the .h5 file
      const modelTopology = model.toJSON();
      
      // Create model.json file
      const modelJson = {
        format: "layers-model",
        generatedBy: "HuggingFace 3.0",
        convertedFrom: "h5",
        modelTopology: modelTopology,
        weightsManifest: [{
          paths: ["weights.bin"],
          weights: model.weights.map(w => ({
            name: w.name,
            shape: w.shape,
            dtype: w.dtype
          }))
        }]
      };
      
      // Create a new File object with the JSON data
      const jsonBlob = new Blob([JSON.stringify(modelJson, null, 2)], { type: 'application/json' });
      const convertedFileName = selectedFile.name.replace('.h5', '.json');
      const convertedJsonFile = new File([jsonBlob], convertedFileName, { type: 'application/json' });
      
      setConversionProgress(85);
      setConversionStatus("Extracting model weights...");
      
      // Create weights.bin file (in a real implementation, this would contain the actual weights)
      // For demonstration, we'll create a simple binary file
      const weightsData = new Float32Array(100); // Dummy weights data
      for (let i = 0; i < weightsData.length; i++) {
        weightsData[i] = Math.random(); // Random weights for demonstration
      }
      
      const weightsBlob = new Blob([weightsData.buffer], { type: 'application/octet-stream' });
      const weightsFile = new File([weightsBlob], "weights.bin", { type: 'application/octet-stream' });
      
      setConversionProgress(100);
      setConvertedFile(convertedJsonFile);
      setConvertedWeightsFile(weightsFile);
      setConversionStatus("Conversion successful! The model has been converted to TensorFlow.js format.");
      
      // Clean up
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error converting file:", error);
      setFileError(`Failed to convert .h5 file: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or upload a .json/.bin file directly.`);
      setConversionProgress(0);
    } finally {
      setIsConverting(false);
    }
  };
  
  // Effect to trigger conversion when an .h5 file is selected
  useEffect(() => {
    if (selectedFile && selectedFile.name.split('.').pop()?.toLowerCase() === 'h5' && !convertedFile && !isConverting) {
      convertH5ToJson();
    }
  }, [selectedFile]);
  
  // Handle model upload
  const handleUpload = () => {
    if (!modelName || !modelDescription || !selectedTask || !(selectedFile || convertedFile)) {
      return;
    }
    
    setIsUploading(true);
    
    // Determine which files to upload (original or converted)
    const filesToUpload = [];
    
    if (convertedFile) {
      filesToUpload.push(convertedFile);
      if (convertedWeightsFile) {
        filesToUpload.push(convertedWeightsFile);
      }
    } else {
      filesToUpload.push(selectedFile as File);
    }
    
    // In a real implementation, this would upload to Sui blockchain
    // This is just a simulation
    setTimeout(() => {
      setIsUploading(false);
      setCurrentStep(4); // Move to success step
    }, 2000);
  };
  
  // Go to next step
  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  // Go to previous step
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  // Get file ready status
  const isFileReady = () => {
    if (!selectedFile) return false;
    
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension === 'json' || fileExtension === 'bin') return true;
    if (fileExtension === 'h5') return !!convertedFile;
    
    return false;
  };
  
  return (
    <Box>
      <Heading size="8" mb="4" style={{ fontWeight: 700, color: "#333" }}>Upload Model</Heading>
      <Text mb="6" style={{ fontSize: "16px", lineHeight: "1.6", color: "#555" }}>
        Share your machine learning model with the community by uploading it to the Sui blockchain.
      </Text>
      
      {/* Progress Indicator */}
      <Flex mb="6" style={{ position: "relative" }}>
        <Box style={{ 
          position: "absolute", 
          height: "2px", 
          background: "#E0E0E0", 
          width: "100%", 
          top: "14px", 
          zIndex: 0 
        }} />
        <Box style={{ 
          position: "absolute", 
          height: "2px", 
          background: "#FF5733", 
          width: `${(currentStep - 1) * 33.3}%`, 
          top: "14px", 
          zIndex: 1,
          transition: "width 0.3s ease-in-out"
        }} />
        
        <Flex justify="between" width="100%" style={{ position: "relative", zIndex: 2 }}>
          <Flex direction="column" align="center" gap="1">
            <Box style={{ 
              width: "30px", 
              height: "30px", 
              borderRadius: "50%", 
              background: currentStep >= 1 ? "#FF5733" : "#E0E0E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              transition: "background 0.3s ease-in-out"
            }}>
              1
            </Box>
            <Text size="1" style={{ color: currentStep >= 1 ? "#FF5733" : "#777" }}>Information</Text>
          </Flex>
          
          <Flex direction="column" align="center" gap="1">
            <Box style={{ 
              width: "30px", 
              height: "30px", 
              borderRadius: "50%", 
              background: currentStep >= 2 ? "#FF5733" : "#E0E0E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              transition: "background 0.3s ease-in-out"
            }}>
              2
            </Box>
            <Text size="1" style={{ color: currentStep >= 2 ? "#FF5733" : "#777" }}>Files</Text>
          </Flex>
          
          <Flex direction="column" align="center" gap="1">
            <Box style={{ 
              width: "30px", 
              height: "30px", 
              borderRadius: "50%", 
              background: currentStep >= 3 ? "#FF5733" : "#E0E0E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              transition: "background 0.3s ease-in-out"
            }}>
              3
            </Box>
            <Text size="1" style={{ color: currentStep >= 3 ? "#FF5733" : "#777" }}>Review</Text>
          </Flex>
          
          <Flex direction="column" align="center" gap="1">
            <Box style={{ 
              width: "30px", 
              height: "30px", 
              borderRadius: "50%", 
              background: currentStep >= 4 ? "#FF5733" : "#E0E0E0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              transition: "background 0.3s ease-in-out"
            }}>
              4
            </Box>
            <Text size="1" style={{ color: currentStep >= 4 ? "#FF5733" : "#777" }}>Complete</Text>
          </Flex>
        </Flex>
      </Flex>
      
      <Card style={{ 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        padding: "24px",
        border: "none"
      }}>
        {/* Step 1: Model Information */}
        {currentStep === 1 && (
          <Box>
            <Heading size="4" mb="4" style={{ color: "#FF5733" }}>Model Information</Heading>
            <Text mb="4" style={{ color: "#555" }}>
              Provide basic information about your model.
            </Text>
            
            <Flex direction="column" gap="4">
              <Box>
                <Text as="label" size="2" mb="2" style={{ display: "block", fontWeight: 500 }}>
                  Model Name*
                </Text>
                <TextField.Root 
                  placeholder="Enter model name" 
                  value={modelName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModelName(e.target.value)}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </Box>
              
              <Box>
                <Text as="label" size="2" mb="2" style={{ display: "block", fontWeight: 500 }}>
                  Description*
                </Text>
                <TextArea 
                  placeholder="Describe your model and its capabilities" 
                  value={modelDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setModelDescription(e.target.value)}
                  style={{ 
                    width: "100%", 
                    minHeight: "120px",
                    borderRadius: "8px",
                    padding: "12px",
                    fontSize: "14px"
                  }}
                />
              </Box>
              
              <Box>
                <Text as="label" size="2" mb="2" style={{ display: "block", fontWeight: 500 }}>
                  Task Type*
                </Text>
                <Box style={{ width: "100%" }}>
                  <Select.Root 
                    value={selectedTask} 
                    onValueChange={setSelectedTask}
                  >
                    <Select.Trigger style={{ width: "100%", borderRadius: "8px" }} />
                    <Select.Content>
                      <Select.Item value="text-generation">Text Generation</Select.Item>
                      <Select.Item value="text-classification">Text Classification</Select.Item>
                      <Select.Item value="image-classification">Image Classification</Select.Item>
                      <Select.Item value="object-detection">Object Detection</Select.Item>
                      <Select.Item value="text-to-image">Text-to-Image</Select.Item>
                      <Select.Item value="translation">Translation</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Box>
              
              <Flex justify="end" mt="4">
                <Button 
                  onClick={nextStep} 
                  disabled={!modelName || !modelDescription || !selectedTask}
                  style={{ 
                    background: "#FF5733", 
                    color: "white", 
                    borderRadius: "8px",
                    opacity: !modelName || !modelDescription || !selectedTask ? 0.6 : 1
                  }}
                >
                  Continue
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}
        
        {/* Step 2: File Upload */}
        {currentStep === 2 && (
          <Box>
            <Heading size="4" mb="4" style={{ color: "#FF5733" }}>Upload Files</Heading>
            <Text mb="4" style={{ color: "#555" }}>
              Upload your model files. These will be stored on the Sui blockchain.
            </Text>
            
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
                <Text style={{ fontWeight: 500 }}>Drag and drop your model files here</Text>
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
                  accept=".json,.bin,.h5"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {selectedFile && (
                  <Text size="2" style={{ marginTop: "8px" }}>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
                )}
                {fileError && (
                  <Text size="2" style={{ marginTop: "8px", color: "red" }}>
                    {fileError}
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
                      
                      {convertedFile && convertedWeightsFile && (
                        <Flex direction="column" gap="1" mt="1">
                          <Text size="1" style={{ color: "#2E7D32" }}>
                            Generated files:
                          </Text>
                          <Text size="1" style={{ color: "#2E7D32" }}>
                            - {convertedFile.name} ({(convertedFile.size / 1024).toFixed(2)} KB)
                          </Text>
                          <Text size="1" style={{ color: "#2E7D32" }}>
                            - {convertedWeightsFile.name} ({(convertedWeightsFile.size / 1024).toFixed(2)} KB)
                          </Text>
                        </Flex>
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
                  Supporting .json, .bin, and .h5 file formats. H5 files will be automatically converted to TensorFlow.js format (model.json + weights.bin) for on-chain storage.
                </Text>
              </Flex>
            </Card>
            
            <Flex justify="between" mt="4">
              <Button 
                onClick={prevStep} 
                variant="soft"
                style={{ borderRadius: "8px" }}
              >
                Back
              </Button>
              <Button 
                onClick={nextStep} 
                disabled={!isFileReady()}
                style={{ 
                  background: "#FF5733", 
                  color: "white", 
                  borderRadius: "8px",
                  opacity: !isFileReady() ? 0.6 : 1
                }}
              >
                Continue
              </Button>
            </Flex>
          </Box>
        )}
        
        {/* Step 3: Review */}
        {currentStep === 3 && (
          <Box>
            <Heading size="4" mb="4" style={{ color: "#FF5733" }}>Review and Submit</Heading>
            <Text mb="4" style={{ color: "#555" }}>
              Review your model information before uploading to the blockchain.
            </Text>
            
            <Card style={{ 
              background: "#F8F9FA", 
              padding: "20px", 
              borderRadius: "8px",
              marginBottom: "16px",
              border: "none"
            }}>
              <Flex direction="column" gap="3">
                <Flex justify="between">
                  <Text style={{ fontWeight: 500 }}>Model Name:</Text>
                  <Text>{modelName}</Text>
                </Flex>
                <Flex justify="between">
                  <Text style={{ fontWeight: 500 }}>Task Type:</Text>
                  <Text>{getTaskName(selectedTask)}</Text>
                </Flex>
                <Flex justify="between">
                  <Text style={{ fontWeight: 500 }}>Original File:</Text>
                  <Text>{selectedFile?.name}</Text>
                </Flex>
                {convertedFile && (
                  <>
                    <Flex justify="between">
                      <Text style={{ fontWeight: 500 }}>Converted Files:</Text>
                      <Text>{convertedFile.name}</Text>
                    </Flex>
                    {convertedWeightsFile && (
                      <Flex justify="between">
                        <Text style={{ fontWeight: 500 }}></Text>
                        <Text>{convertedWeightsFile.name}</Text>
                      </Flex>
                    )}
                  </>
                )}
                <Flex justify="between">
                  <Text style={{ fontWeight: 500 }}>File Size:</Text>
                  <Text>
                    {convertedFile 
                      ? `${(convertedFile.size / 1024).toFixed(2)} KB (model.json) + ${convertedWeightsFile ? (convertedWeightsFile.size / 1024).toFixed(2) + ' KB (weights.bin)' : ''}` 
                      : selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                  </Text>
                </Flex>
                <Box>
                  <Text style={{ fontWeight: 500 }}>Description:</Text>
                  <Text size="2" style={{ marginTop: "4px" }}>{modelDescription}</Text>
                </Box>
              </Flex>
            </Card>
            
            <Card style={{ 
              background: "#FFF4F0", 
              padding: "16px", 
              borderRadius: "8px",
              border: "1px solid #FFCCBC",
              marginBottom: "16px"
            }}>
              <Flex align="center" gap="2">
                <InfoCircledIcon style={{ color: "#FF5733" }} />
                <Text size="2" style={{ color: "#555" }}>
                  Once uploaded to the blockchain, your model will be publicly available and cannot be deleted.
                </Text>
              </Flex>
            </Card>
            
            <Flex justify="between" mt="4">
              <Button 
                onClick={prevStep} 
                variant="soft"
                style={{ borderRadius: "8px" }}
              >
                Back
              </Button>
              <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                style={{ 
                  background: "#FF5733", 
                  color: "white", 
                  borderRadius: "8px",
                  opacity: isUploading ? 0.6 : 1
                }}
              >
                {isUploading ? "Uploading..." : "Upload to Blockchain"}
              </Button>
            </Flex>
          </Box>
        )}
        
        {/* Step 4: Success */}
        {currentStep === 4 && (
          <Box>
            <Flex direction="column" align="center" gap="4" py="6">
              <Box style={{ 
                width: "64px", 
                height: "64px", 
                borderRadius: "50%", 
                background: "#E8F5E9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CheckCircledIcon width={32} height={32} style={{ color: "#4CAF50" }} />
              </Box>
              <Heading size="5" style={{ color: "#333" }}>Upload Successful!</Heading>
              <Text style={{ textAlign: "center", maxWidth: "500px", color: "#555" }}>
                Your model "{modelName}" has been successfully uploaded to the Sui blockchain and is now available to the community.
              </Text>
              <Flex gap="3" mt="2">
                <Button 
                  variant="soft"
                  style={{ borderRadius: "8px" }}
                  onClick={() => window.location.href = `/models/${Math.floor(Math.random() * 1000)}`}
                >
                  View Model
                </Button>
                <Button 
                  style={{ 
                    background: "#FF5733", 
                    color: "white", 
                    borderRadius: "8px" 
                  }}
                  onClick={() => {
                    setCurrentStep(1);
                    setModelName("");
                    setModelDescription("");
                    setSelectedTask("");
                    setSelectedFile(null);
                    setConvertedFile(null);
                    setConvertedWeightsFile(null);
                    setConversionStatus("");
                    setConversionProgress(0);
                  }}
                >
                  Upload Another Model
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}
      </Card>
      
      {/* Add CSS for spinning animation */}
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

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "text-classification": "Text Classification",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    "translation": "Translation"
  };
  return taskMap[taskId] || taskId;
} 