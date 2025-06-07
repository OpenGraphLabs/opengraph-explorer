import React, { useState } from 'react';
import { Card, Flex, Box, Heading, Text, Avatar, Badge, Button, Tooltip } from '@radix-ui/themes';
import { HeartIcon, DownloadIcon, Share1Icon, ExternalLinkIcon } from '@radix-ui/react-icons';
import { motion } from 'framer-motion';
import { Model } from '../../types';
import { getSuiScanUrl } from '@/shared/utils/sui';
import { SUI_ADDRESS_DISPLAY_LENGTH } from '@/shared/constants/suiConfig';

interface ModelDetailHeaderProps {
  model: Model;
}

const creatorLinkStyle = {
  fontWeight: 500,
  cursor: "pointer",
  transition: "color 0.2s",
  display: "flex",
  alignItems: "center",
  gap: "4px",
};

const creatorLinkHoverStyle = {
  ...creatorLinkStyle,
  color: "#FF5733",
};

function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    translation: "Translation",
  };
  return taskMap[taskId] || taskId;
}

export function ModelDetailHeader({ model }: ModelDetailHeaderProps) {
  const [isCreatorHovered, setIsCreatorHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card
        style={{
          padding: "28px",
          marginBottom: "28px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #FFF4F2 0%, #FFFFFF 100%)",
          boxShadow: "0 8px 20px rgba(255, 87, 51, 0.1)",
          border: "1px solid #FFE8E2",
        }}
      >
        <Flex justify="between" align="start">
          <Box>
            <Heading
              size="8"
              style={{
                fontWeight: 700,
                background: "linear-gradient(90deg, #FF5733 0%, #FF8C66 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {model.name}
            </Heading>
            <Flex align="center" gap="3" mt="2">
              <Avatar
                size="2"
                fallback={model.creator[0]}
                style={{
                  background: "#FF5733",
                  boxShadow: "0 3px 8px rgba(255, 87, 51, 0.2)",
                }}
              />
              <Tooltip content="View creator on Sui Explorer">
                <Text
                  size="2"
                  style={isCreatorHovered ? creatorLinkHoverStyle : creatorLinkStyle}
                  onClick={() => window.open(getSuiScanUrl("account", model.creator), "_blank")}
                  onMouseEnter={() => setIsCreatorHovered(true)}
                  onMouseLeave={() => setIsCreatorHovered(false)}
                >
                  {model.creator.length > SUI_ADDRESS_DISPLAY_LENGTH
                    ? model.creator.slice(0, SUI_ADDRESS_DISPLAY_LENGTH) + "..."
                    : model.creator}
                  <ExternalLinkIcon style={{ width: "12px", height: "12px", opacity: 0.7 }} />
                </Text>
              </Tooltip>
              <Badge variant="soft" style={{ background: "#FFF4F2", color: "#FF5733" }}>
                On-Chain Model
              </Badge>
            </Flex>
          </Box>

          <Flex gap="3">
            <Button
              variant="soft"
              style={{
                borderRadius: "8px",
                background: "#FFF4F2",
                color: "#FF5733",
                border: "1px solid #FFE8E2",
                transition: "all 0.2s ease",
              }}
              className="hover-effect"
            >
              <HeartIcon style={{ color: "#FF5733" }} />
              <Text>{model.likes || 0}</Text>
            </Button>
            <Button
              variant="soft"
              style={{
                borderRadius: "8px",
                background: "#FFF4F2",
                color: "#FF5733",
                border: "1px solid #FFE8E2",
                transition: "all 0.2s ease",
              }}
              className="hover-effect"
            >
              <DownloadIcon style={{ color: "#FF5733" }} />
              <Text>{model.downloads || 0}</Text>
            </Button>
            <Button
              variant="soft"
              style={{
                borderRadius: "8px",
                background: "#FFF4F2",
                color: "#FF5733",
                border: "1px solid #FFE8E2",
                transition: "all 0.2s ease",
              }}
              className="hover-effect"
            >
              <Share1Icon style={{ color: "#FF5733" }} />
            </Button>
            <Button
              variant="soft"
              style={{
                borderRadius: "8px",
                background: "#FFF4F2",
                color: "#FF5733",
                border: "1px solid #FFE8E2",
                transition: "all 0.2s ease",
              }}
              className="hover-effect"
              onClick={() => window.open(getSuiScanUrl("object", model.id), "_blank")}
            >
              <Flex align="center" gap="2">
                <Text size="2">View on Sui Explorer</Text>
                <ExternalLinkIcon />
              </Flex>
            </Button>
          </Flex>
        </Flex>

        <Box mt="5">
          <Text
            style={{
              fontSize: "16px",
              lineHeight: "1.7",
              color: "#444",
              letterSpacing: "0.01em",
            }}
          >
            {model.description}
          </Text>
        </Box>

        <Flex gap="4" mt="5">
          <Box
            style={{
              borderRadius: "8px",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
            }}
          >
            <Flex align="center" gap="2">
              <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                Task: {getTaskName(model.task_type)}
              </Text>
            </Flex>
          </Box>
          <Box
            style={{
              borderRadius: "8px",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
            }}
          >
            <Flex align="center" gap="2">
              <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                License: MIT
              </Text>
            </Flex>
          </Box>
          <Box
            style={{
              borderRadius: "8px",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
            }}
          >
            <Flex align="center" gap="2">
              <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                Layers: {model.graphs?.[0]?.layers?.length || 0}
              </Text>
            </Flex>
          </Box>
          <Box
            style={{
              borderRadius: "8px",
              background: "#FFFFFF",
              border: "1px solid #FFE8E2",
              padding: "10px 14px",
              boxShadow: "0 2px 4px rgba(255, 87, 51, 0.05)",
            }}
          >
            <Flex align="center" gap="2">
              <Text size="2" style={{ fontWeight: 500, color: "#FF5733" }}>
                Created: {new Date(model.createdAt).toLocaleDateString()}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Card>
    </motion.div>
  );
} 