import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  Badge,
} from "@radix-ui/themes";
import {
  ReloadIcon,
  ResetIcon,
  UploadIcon,
} from "@radix-ui/react-icons";
import { useState, useCallback } from "react";
import { ImageSquare } from "phosphor-react";
import { VectorInfoDisplay, ImageData, FormattedVector } from "./VectorInfoDisplay";

interface ImageInputTabProps {
  getFirstLayerDimension: () => number;
  getModelScale: () => number;
  onVectorGenerated: (vector: number[]) => void;
}

export function ImageInputTab({
  getFirstLayerDimension,
  getModelScale,
  onVectorGenerated
}: ImageInputTabProps) {
  // 상태 관리
  const [imageData, setImageData] = useState<ImageData>({ dataUrl: null, vector: null });
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  // 이미지를 벡터로 변환
  const imageToVector = async (dataUrl: string, dimension: number): Promise<number[]> => {
    console.log("Converting image to vector, data URL length:", dataUrl.length);
    try {
      const vector = await canvasToVector(dataUrl, dimension);
      console.log("Vector conversion successful, length:", vector.length);
      return vector;
    } catch (error: unknown) {
      console.error("Error converting image to vector:", error);
      return [];
    }
  };

  // 캔버스 이미지를 벡터로 변환
  const canvasToVector = async (dataUrl: string, dimension: number): Promise<number[]> => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        // Create temp canvas for processing
        const tempCanvas = document.createElement("canvas");
        const size = Math.sqrt(dimension); // Assuming square input (e.g. 28x28 for MNIST)
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext("2d");

        if (ctx) {
          // Fill with black background first (important for MNIST)
          ctx.fillStyle = "black";
          ctx.fillRect(0, 0, size, size);

          // Draw image resized to target dimensions
          ctx.drawImage(img, 0, 0, size, size);

          // Get image data
          const imageData = ctx.getImageData(0, 0, size, size);

          // Convert to vector (for MNIST, we need grayscale values)
          const vector: number[] = [];

          // Process pixel data (RGBA format)
          for (let i = 0; i < imageData.data.length; i += 4) {
            // Convert RGB to grayscale (MNIST uses white digits on black background)
            const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
            // Normalize to [0, 1] range - consistent with model training
            vector.push(gray / 255);
          }

          console.log(`Generated vector with ${vector.length} elements`);
          resolve(vector);
        } else {
          console.error("Failed to get canvas context");
          resolve([]);
        }
      };

      img.onerror = () => {
        console.error("Error loading image");
        resolve([]);
      };

      img.src = dataUrl;
    });
  };

  // OpenGraphLabs 형식으로 벡터 변환
  const formatVectorForPrediction = (vector: number[]): FormattedVector => {
    const scale = getModelScale();
    const magnitudes: number[] = [];
    const signs: number[] = [];

    vector.forEach(val => {
      // Apply scale to normalized values (0~1) to convert to integers
      const scaledValue = Math.floor(Math.abs(val) * Math.pow(10, scale));
      // Determine sign (0=positive, 1=negative)
      const sign = val >= 0 ? 0 : 1;

      magnitudes.push(scaledValue);
      signs.push(sign);
    });

    return { magnitudes, signs };
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsProcessingImage(true);

      const file = e.target.files[0];
      console.log("File selected:", file.name, "type:", file.type, "size:", file.size);

      const reader = new FileReader();

      reader.onload = event => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          console.log("File loaded as data URL, length:", dataUrl.length);

          // Convert to vector
          imageToVector(dataUrl, getFirstLayerDimension())
            .then(vector => {
              if (vector.length === 0) {
                console.error("Vector conversion failed - empty vector");
                setIsProcessingImage(false);
                return;
              }

              console.log("Vector generated successfully, updating state");
              // Store vector for display
              setImageData({ dataUrl, vector });

              // 부모 컴포넌트로 생성된 벡터 전달
              onVectorGenerated(vector);
              
              setIsProcessingImage(false);
            })
            .catch(error => {
              console.error("Error in vector conversion:", error);
              setIsProcessingImage(false);
            });
        } else {
          console.error("FileReader result is null or undefined");
          setIsProcessingImage(false);
        }
      };

      reader.onerror = error => {
        console.error("FileReader error:", error);
        setIsProcessingImage(false);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Flex direction="column" gap="4">
      <Flex align="center" gap="3">
        <ImageSquare size={20} weight="duotone" style={{ color: "#FF5733" }} />
        <Heading size="3">Image Input</Heading>
      </Flex>

      {/* Image upload container */}
      <Card
        style={{
          padding: "16px",
          borderRadius: "8px",
          border: "1px dashed #FFE8E2",
          background: "#FDFDFD",
          minHeight: "250px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {imageData.dataUrl ? (
          // Show uploaded image
          <Box style={{ position: "relative" }}>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
                width: "100%",
              }}
            >
              <Text size="2" style={{ fontWeight: 500, marginRight: "10px" }}>
                <ImageSquare
                  size={16}
                  weight="bold"
                  style={{ verticalAlign: "middle", marginRight: "4px" }}
                />
                Uploaded Image
              </Text>
              <Button
                style={{ cursor: "pointer" }}
                size="1"
                variant="soft"
                onClick={() => {
                  setImageData({ dataUrl: null, vector: null });
                  // 이미지 제거 시 빈 벡터 전달
                  onVectorGenerated([]);
                }}
              >
                <ResetIcon /> Remove
              </Button>
            </Box>
            <img
              src={imageData.dataUrl}
              alt="Uploaded"
              style={{
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />

            {isProcessingImage && (
              <Box
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(255, 255, 255, 0.8)",
                  padding: "12px",
                  borderRadius: "8px",
                }}
              >
                <Flex align="center" gap="2" justify="center">
                  <ReloadIcon
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <Text size="2">Processing...</Text>
                </Flex>
              </Box>
            )}
          </Box>
        ) : (
          // Image upload dropzone
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              gap: "12px",
              border: "2px dashed #FFE8E2",
              borderRadius: "8px",
              backgroundColor: "#FDFDFD",
              minHeight: "200px",
              width: "100%",
              position: "relative",
            }}
            onDragOver={e => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.backgroundColor = "#FFF4F2";
            }}
            onDragLeave={e => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.backgroundColor = "#FDFDFD";
            }}
            onDrop={e => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.style.backgroundColor = "#FDFDFD";

              const files = e.dataTransfer.files;
              if (files && files[0]) {
                const event = {
                  target: {
                    files: files,
                  },
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                handleImageUpload(event);
              }
            }}
          >
            <Box
              style={{
                background: "#FFF4F2",
                borderRadius: "50%",
                width: "48px",
                height: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadIcon
                style={{ width: "24px", height: "24px", color: "#FF5733" }}
              />
            </Box>
            <Text size="2" style={{ fontWeight: 500 }}>
              Drag & Drop Image Here
            </Text>
            <Text size="1" style={{ color: "#666", textAlign: "center" }}>
              or
            </Text>
            <Button
              onClick={() => document.getElementById("image-upload")?.click()}
              style={{
                cursor: "pointer",
                background: "#FFF4F2",
                color: "#FF5733",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
            >
              Choose Image
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
              onClick={e => {
                // Reset value to allow selecting the same file again
                (e.target as HTMLInputElement).value = "";
              }}
            />
            <Text size="1" style={{ color: "#666", textAlign: "center" }}>
              Supported formats: JPG, PNG
            </Text>
          </Box>
        )}
      </Card>

      {/* Show vector info if image is processed */}
      {imageData.vector && imageData.vector.length > 0 && (
        <VectorInfoDisplay
          imageData={imageData}
          getModelScale={getModelScale}
          formatVectorForPrediction={formatVectorForPrediction}
        />
      )}
    </Flex>
  );
} 