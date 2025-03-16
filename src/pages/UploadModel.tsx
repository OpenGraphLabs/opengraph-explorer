import { useState } from "react";
import { Box, Flex, Heading, Text, Card, Button, TextField, Select, TextArea } from "@radix-ui/themes";
import { UploadIcon, CheckCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons";

export function UploadModel() {
  const [currentStep, setCurrentStep] = useState(1);
  const [modelName, setModelName] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle model upload
  const handleUpload = () => {
    if (!modelName || !modelDescription || !selectedTask || !selectedFile) {
      return;
    }
    
    setIsUploading(true);
    
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
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                {selectedFile && (
                  <Text size="2" style={{ marginTop: "8px" }}>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
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
                  Supported formats: .bin, .onnx, .pt, .h5, .tflite, .pb
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
                disabled={!selectedFile}
                style={{ 
                  background: "#FF5733", 
                  color: "white", 
                  borderRadius: "8px",
                  opacity: !selectedFile ? 0.6 : 1
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
                  <Text style={{ fontWeight: 500 }}>File:</Text>
                  <Text>{selectedFile?.name}</Text>
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
                  }}
                >
                  Upload Another Model
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}
      </Card>
    </Box>
  );
}

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    "translation": "Translation"
  };
  return taskMap[taskId] || taskId;
} 