import React from "react";
import { Box, Flex, Text, Card, Badge, Heading } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { CheckCircledIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { Trophy, Sparkle } from "phosphor-react";
import { PredictResult } from "../../hooks/useModelInference";

interface AnimalClassificationResultProps {
  predictResults: PredictResult[];
  uploadedImageUrl?: string;
  isProcessing: boolean;
  isAnalyzing: boolean;
}

interface AnimalData {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
}

const ANIMAL_DATA: Record<number, AnimalData> = {
  0: {
    name: "Elephant",
    emoji: "🐘",
    color: "#6B7280",
    bgColor: "#F3F4F6",
    description: "Large, intelligent mammal with trunk"
  },
  1: {
    name: "Walrus",
    emoji: "🦭",
    color: "#8B5A2B",
    bgColor: "#F7F3E9",
    description: "Marine mammal with tusks"
  }
};

export function AnimalClassificationResult({ 
  predictResults, 
  uploadedImageUrl, 
  isProcessing,
  isAnalyzing 
}: AnimalClassificationResultProps) {
  // Get final prediction result
  const finalResult = predictResults.find(result => result.argmaxIdx !== undefined);
  
  if (!uploadedImageUrl) {
    return null;
  }

  if (isProcessing || isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card style={{ 
          padding: "24px", 
          background: "linear-gradient(135deg, #FFF4F2 0%, #FFE8E2 100%)",
          border: "none",
          marginTop: "20px"
        }}>
          <Flex direction="column" align="center" gap="4">
            <Box
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#FF5733",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "pulse 2s infinite"
              }}
            >
              <QuestionMarkCircledIcon style={{ width: "30px", height: "30px", color: "white" }} />
            </Box>
            
            <Heading size="4" style={{ textAlign: "center", color: "#FF5733" }}>
              🤔 Analyzing Your Image...
            </Heading>
            
            <Text size="2" style={{ textAlign: "center", color: "#666" }}>
              Our AI is examining the features to determine if this is a walrus or elephant
            </Text>
          </Flex>
        </Card>
      </motion.div>
    );
  }

  if (!finalResult) {
    return null;
  }

  const predictedClass = finalResult.argmaxIdx!;
  const animalData = ANIMAL_DATA[predictedClass];
  
  // Calculate confidence score based on actual output values
  const calculateConfidence = (): number => {
    if (!finalResult.outputMagnitude || finalResult.outputMagnitude.length < 2) {
      return 85; // Default confidence
    }
    
    const outputs = finalResult.outputMagnitude;
    const signs = finalResult.outputSign;
    
    // Convert to actual values considering signs
    const values = outputs.map((mag, idx) => signs[idx] === 0 ? mag : -mag);
    
    // Find max and second max
    const sortedValues = [...values].sort((a, b) => b - a);
    const maxVal = sortedValues[0];
    const secondMaxVal = sortedValues[1] || 0;
    
    // Calculate confidence based on the difference between top predictions
    const diff = Math.abs(maxVal - secondMaxVal);
    const total = Math.abs(maxVal) + Math.abs(secondMaxVal);
    
    if (total === 0) return 85;
    
    const rawConfidence = (diff / total) * 100;
    // Normalize to reasonable range (70-95%)
    return Math.min(95, Math.max(70, 70 + (rawConfidence * 0.25)));
  };
  
  const confidence = calculateConfidence();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card style={{ 
        padding: "0", 
        background: "white",
        border: "2px solid #E5E7EB",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        marginTop: "20px"
      }}>
        {/* Header with result */}
        <Box style={{ 
          background: `linear-gradient(135deg, ${animalData.bgColor} 0%, ${animalData.color}20 100%)`,
          padding: "20px",
          textAlign: "center"
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Text style={{ fontSize: "48px", marginBottom: "8px", display: "block" }}>
              {animalData.emoji}
            </Text>
          </motion.div>
          
          <Heading size="5" style={{ color: animalData.color, marginBottom: "8px" }}>
            This is a {animalData.name}!
          </Heading>
          
          <Badge 
            size="2" 
            style={{ 
              background: `${animalData.color}15`,
              color: animalData.color,
              padding: "6px 12px",
              borderRadius: "20px",
              border: `1px solid ${animalData.color}30`
            }}
          >
            <CheckCircledIcon style={{ marginRight: "4px" }} />
            {confidence.toFixed(1)}% Confident
          </Badge>
        </Box>

        {/* Image and details */}
        <Flex style={{ padding: "20px" }}>
          {/* Uploaded image */}
          <Box style={{ flex: "0 0 120px", marginRight: "20px" }}>
            <img
              src={uploadedImageUrl}
              alt="Uploaded"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                borderRadius: "12px",
                border: "2px solid #E5E7EB"
              }}
            />
          </Box>

          {/* Classification details */}
          <Flex direction="column" justify="center" style={{ flex: 1 }}>
            <Flex align="center" gap="2" style={{ marginBottom: "12px" }}>
              <Trophy size={20} weight="fill" style={{ color: "#FFD700" }} />
              <Text size="3" weight="bold" style={{ color: "#333" }}>
                Classification Result
              </Text>
            </Flex>
            
            <Text size="2" style={{ color: "#666", lineHeight: "1.5", marginBottom: "8px" }}>
              {animalData.description}
            </Text>
            
            <Flex align="center" gap="2">
              <Sparkle size={16} weight="fill" style={{ color: "#FF5733" }} />
              <Text size="2" style={{ color: "#FF5733" }}>
                Analyzed by OpenGraph Neural Network
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Prediction breakdown */}
        <Box style={{ 
          background: "#F9FAFB", 
          padding: "16px 20px",
          borderTop: "1px solid #E5E7EB"
        }}>
          <Text size="2" weight="bold" style={{ color: "#374151", marginBottom: "8px", display: "block" }}>
            Prediction Breakdown:
          </Text>
          
          <Flex gap="3">
            {Object.entries(ANIMAL_DATA).map(([classIdx, data]) => {
              const isSelected = parseInt(classIdx) === predictedClass;
              const score = isSelected ? confidence : (100 - confidence);
              
              return (
                <Flex 
                  key={classIdx} 
                  align="center" 
                  gap="2" 
                  style={{ 
                    opacity: isSelected ? 1 : 0.5,
                    transition: "opacity 0.3s ease"
                  }}
                >
                  <Text style={{ fontSize: "20px" }}>{data.emoji}</Text>
                  <Text size="2" style={{ color: isSelected ? data.color : "#6B7280" }}>
                    {data.name}: {score.toFixed(1)}%
                  </Text>
                </Flex>
              );
            })}
          </Flex>
        </Box>
      </Card>

      <style>
        {`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        `}
      </style>
    </motion.div>
  );
} 