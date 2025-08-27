import React, { useState, useEffect, useRef } from "react";
import { Box, Flex, Text, Button, Heading } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  X,
  DownloadSimple,
  Info,
  Calendar,
  ArrowsOut,
  Tag,
  Hash,
  Camera,
  Robot,
  Sparkle,
  Database,
  Timer,
  User,
} from "phosphor-react";
import type { Image } from "@/shared/api/endpoints/images";
import type { Task } from "@/shared/api/endpoints/tasks";

interface FirstPersonImageDetailSidebarProps {
  image: Image;
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
}

// Professional color palette for Data Engine UI
const ACCENT_COLOR = "#0066FF"; // Professional blue
const SECONDARY_COLOR = "#8B5A96"; // Soft purple for accents

export function FirstPersonImageDetailSidebar({
  image,
  task,
  isOpen,
  onClose,
}: FirstPersonImageDetailSidebarProps) {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Image load handling
  useEffect(() => {
    if (!isOpen) return;

    const img = new window.Image();
    img.onload = () => {
      setImageLoaded(true);
      drawImageOnCanvas(img);
    };
    img.src = image.imageUrl;
  }, [isOpen, image.imageUrl]);

  // Draw image on canvas
  const drawImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas size for 580px sidebar with padding
    const containerWidth = 540;
    const aspectRatio = image.height / image.width;
    const containerHeight = containerWidth * aspectRatio;

    canvas.width = containerWidth;
    canvas.height = containerHeight;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Draw image
    ctx.clearRect(0, 0, containerWidth, containerHeight);
    ctx.drawImage(img, 0, 0, containerWidth, containerHeight);
  };

  // Metadata calculations
  const metadata = {
    resolution: `${image.width} × ${image.height}`,
    aspectRatio: (image.width / image.height).toFixed(2),
    megapixels: ((image.width * image.height) / 1000000).toFixed(2),
    createdDate: new Date(image.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    createdTime: new Date(image.createdAt).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // Simulated AI context description for first-person view
  const aiContext = `The image shows a <em>first-person perspective</em> captured during the "${task?.name || "general"}" task execution. 
The scene contains various <em>workspace elements</em> that are typical for robotic manipulation tasks. 
The camera angle provides optimal visibility of the <em>task area</em> with clear depth perception for action planning.`;

  // Parse AI context with emphasis
  const parseAIContext = (text: string) => {
    const parts = text.split(/(<em>.*?<\/em>)/g);
    return parts.map((part, index) => {
      if (part.startsWith("<em>") && part.endsWith("</em>")) {
        const content = part.replace(/<\/?em>/g, "");
        return (
          <span
            key={index}
            style={{
              color: ACCENT_COLOR,
              fontWeight: 600,
              textDecoration: `underline ${ACCENT_COLOR}40`,
              textUnderlineOffset: "2px",
            }}
          >
            {content}
          </span>
        );
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "580px",
        background: theme.colors.background.primary,
        borderLeft: `1px solid ${theme.colors.border.subtle}20`,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        boxShadow: `
          -8px 0 32px rgba(0, 0, 0, 0.08),
          -2px 0 8px rgba(0, 0, 0, 0.04)
        `,
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 400ms cubic-bezier(0.25, 0.8, 0.25, 1)",
        backdropFilter: "blur(20px)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.component.lg} ${theme.spacing.semantic.component.lg} ${theme.spacing.semantic.component.md}`,
          borderBottom: `1px solid ${theme.colors.border.subtle}15`,
          background: `${theme.colors.background.card}60`,
          backdropFilter: "blur(8px)",
        }}
      >
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.md }}
        >
          <Heading size="4" style={{ color: theme.colors.text.primary }}>
            Image Details
          </Heading>
          <Button
            onClick={onClose}
            style={{
              background: `${theme.colors.background.secondary}80`,
              border: `1px solid ${theme.colors.border.subtle}30`,
              color: theme.colors.text.secondary,
              cursor: "pointer",
              padding: theme.spacing.semantic.component.sm,
              borderRadius: theme.borders.radius.md,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              width: "36px",
              height: "36px",
            }}
          >
            <X size={16} />
          </Button>
        </Flex>

        {/* Task Badge */}
        {task && (
          <Box
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.xs,
              background: `linear-gradient(135deg, ${ACCENT_COLOR}15, ${SECONDARY_COLOR}10)`,
              border: `1px solid ${ACCENT_COLOR}30`,
              color: ACCENT_COLOR,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              borderRadius: theme.borders.radius.md,
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Robot size={14} />
            {task.name}
          </Box>
        )}

        {/* Image ID */}
        <Text
          as="p"
          style={{
            fontSize: "11px",
            color: theme.colors.text.secondary,
            marginTop: theme.spacing.semantic.component.xs,
          }}
        >
          Image ID: #{image.id}
        </Text>
      </Box>

      {/* Image Viewer */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <Flex
          justify="between"
          align="center"
          style={{ marginBottom: theme.spacing.semantic.component.md }}
        >
          <Text
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            First-Person View
          </Text>

          <Flex align="center" gap="2">
            <Box
              style={{
                background: `linear-gradient(135deg, ${theme.colors.status.success}20, ${theme.colors.status.success}10)`,
                border: `1px solid ${theme.colors.status.success}40`,
                borderRadius: theme.borders.radius.sm,
                padding: `2px 8px`,
                fontSize: "11px",
                fontWeight: 600,
                color: theme.colors.status.success,
              }}
            >
              HD QUALITY
            </Box>
          </Flex>
        </Flex>

        {/* Image Container */}
        <Box
          style={{
            position: "relative",
            background: theme.colors.background.secondary,
            borderRadius: theme.borders.radius.md,
            overflow: "hidden",
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: `0 2px 8px rgba(0, 0, 0, 0.05)`,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />

          {/* Overlay indicators */}
          {imageLoaded && (
            <Box
              style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                display: "flex",
                gap: "8px",
              }}
            >
              <Box
                style={{
                  background: `${theme.colors.background.primary}E6`,
                  backdropFilter: "blur(8px)",
                  borderRadius: theme.borders.radius.sm,
                  padding: `4px 8px`,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  border: `1px solid ${theme.colors.border.subtle}30`,
                }}
              >
                <Camera size={12} color={theme.colors.text.secondary} />
                <Text style={{ fontSize: "11px", color: theme.colors.text.secondary }}>
                  First-Person Camera
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Metadata Section */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.lg,
        }}
      >
        <Heading
          size="5"
          style={{
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          Metadata
        </Heading>

        <Flex direction="column" gap="4">
          {/* AI Context Analysis */}
          <Box>
            <Flex
              align="center"
              gap="2"
              style={{ marginBottom: theme.spacing.semantic.component.xs }}
            >
              <Box
                style={{
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  borderRadius: "50%",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Database size={12} color="white" />
              </Box>
              <Text
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                }}
              >
                DATA ENGINE ANALYSIS
              </Text>
              <Box
                style={{
                  background: `linear-gradient(45deg, #FFD700, #FFA500)`,
                  borderRadius: "50%",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Sparkle size={8} color="white" />
              </Box>
            </Flex>

            <Box
              style={{
                background: `linear-gradient(135deg, ${theme.colors.background.card}80, ${theme.colors.background.secondary}40)`,
                border: `1px solid ${theme.colors.border.subtle}30`,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.md,
                position: "relative",
              }}
            >
              <Box
                style={{
                  fontSize: "13px",
                  lineHeight: "1.5",
                  color: theme.colors.text.primary,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  letterSpacing: "0.01em",
                }}
              >
                {parseAIContext(aiContext)}
              </Box>

              {/* AI Badge */}
              <Box
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: `${theme.colors.background.primary}95`,
                  backdropFilter: "blur(8px)",
                  borderRadius: theme.borders.radius.sm,
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: theme.colors.text.tertiary,
                  border: `1px solid ${theme.colors.border.subtle}20`,
                }}
              >
                AI Generated
              </Box>
            </Box>
          </Box>

          {/* Image Information */}
          <Box>
            <Text
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              IMAGE INFORMATION
            </Text>

            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Info size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Filename
                  </Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {image.fileName}
                </Text>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <ArrowsOut size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Resolution
                  </Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {metadata.resolution}
                </Text>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Camera size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Megapixels
                  </Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {metadata.megapixels} MP
                </Text>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Calendar size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                    Captured
                  </Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {metadata.createdDate}
                </Text>
              </Flex>

              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Timer size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>Time</Text>
                </Flex>
                <Text
                  style={{
                    fontSize: "13px",
                    color: theme.colors.text.primary,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {metadata.createdTime}
                </Text>
              </Flex>
            </Flex>
          </Box>

          {/* Task Details */}
          {task && (
            <Box>
              <Text
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.semantic.component.xs,
                }}
              >
                TASK DETAILS
              </Text>

              <Flex direction="column" gap="2">
                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Hash size={14} style={{ color: theme.colors.text.tertiary }} />
                    <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                      Task ID
                    </Text>
                  </Flex>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: theme.colors.text.primary,
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    #{task.id}
                  </Text>
                </Flex>

                <Flex justify="between" align="center">
                  <Flex align="center" gap="2">
                    <Tag size={14} style={{ color: theme.colors.text.tertiary }} />
                    <Text style={{ fontSize: "13px", color: theme.colors.text.secondary }}>
                      Task Name
                    </Text>
                  </Flex>
                  <Text
                    style={{
                      fontSize: "13px",
                      color: theme.colors.text.primary,
                      fontWeight: 500,
                    }}
                  >
                    {task.name}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Footer Actions */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.lg,
          borderTop: `1px solid ${theme.colors.border.primary}`,
          background: theme.colors.background.secondary,
          marginTop: "auto",
        }}
      >
        <Button
          style={{
            width: "100%",
            background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${SECONDARY_COLOR})`,
            color: theme.colors.text.inverse,
            border: "none",
            borderRadius: theme.borders.radius.md,
            padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing.semantic.component.sm,
            transition: "all 0.2s ease",
            boxShadow: `0 2px 8px rgba(0, 102, 255, 0.2)`,
          }}
          onClick={() => {
            // Download image
            const link = document.createElement("a");
            link.href = image.imageUrl;
            link.download = image.fileName;
            link.click();
          }}
        >
          <DownloadSimple size={16} />
          Download Image
        </Button>
      </Box>
    </Box>
  );
}
