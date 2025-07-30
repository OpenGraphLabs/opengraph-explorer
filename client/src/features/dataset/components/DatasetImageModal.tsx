import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Dialog,
  Button,
  Heading,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  X,
  Eye,
  EyeSlash,
  Info,
  Calendar,
  ArrowsOut,
  Tag,
  Hash,
  Target,
  Brain,
  Sparkle,
  Image as ImageIcon,
} from "phosphor-react";
import { ConfirmationStatus } from "../types";
import { useApprovedAnnotationsByImage } from "@/shared/hooks/useApiQuery";
import { useDictionaryCategories } from "@/shared/hooks/useDictionaryCategories";

interface DatasetImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: string | null;
  selectedImageData: any;
  selectedImageIndex: number;
  onCloseModal: () => void;
  getAnnotationColor: (index: number) => any;
}

// Colors for annotation overlays
const HIGHLIGHT_COLOR = "#0066FF";
const OTHER_COLOR = "#8B5A96";

export function DatasetImageModal({
  isOpen,
  onClose,
  selectedImage,
  selectedImageData,
  selectedImageIndex,
}: DatasetImageModalProps) {
  const { theme } = useTheme();
  const [showMask, setShowMask] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<SVGSVGElement>(null);

  // Get all approved annotations for this image if imageId is available
  const { data: allApprovedAnnotations, isLoading: annotationsLoading } =
    useApprovedAnnotationsByImage(selectedImageData?.imageId || 0, {
      enabled: isOpen && !!selectedImageData?.imageId,
      refetchOnWindowFocus: false,
    } as any);

  // Fetch categories to get actual category names
  const { data: categoriesResponse, isLoading: categoriesLoading } = useDictionaryCategories({
    dictionaryId: 1, // Default dictionary ID
    limit: 100,
    enabled: isOpen,
  });

  const approvedAnnotations = allApprovedAnnotations || [];
  const hasConfirmedAnnotations = approvedAnnotations.length > 0;
  const allCategories = categoriesResponse?.items || [];

  // Create a map of category_id to category name for quick lookup
  const categoryMap = new Map<number, string>();
  allCategories.forEach(category => {
    categoryMap.set(category.id, category.name);
  });

  // Helper function to get category name
  const getCategoryName = (categoryId: number): string => {
    return categoryMap.get(categoryId) || `Category ${categoryId}`;
  };

  // Image loading and canvas drawing
  useEffect(() => {
    if (!isOpen || !selectedImage) return;

    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      drawImageOnCanvas(img);
    };
    img.src = selectedImage;
  }, [isOpen, selectedImage]);

  // Draw image on canvas
  const drawImageOnCanvas = useCallback(
    (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Adjust canvas size to fit modal (max 600px width)
      const containerWidth = Math.min(600, img.width);
      const aspectRatio = img.height / img.width;
      const containerHeight = containerWidth * aspectRatio;

      canvas.width = containerWidth;
      canvas.height = containerHeight;
      canvas.style.width = `${containerWidth}px`;
      canvas.style.height = `${containerHeight}px`;

      // Draw image
      ctx.clearRect(0, 0, containerWidth, containerHeight);
      ctx.drawImage(img, 0, 0, containerWidth, containerHeight);
    },
    [selectedImageData]
  );

  // Polygon to SVG path conversion (following ImageDetailSidebar pattern)
  const polygonToPath = useCallback(
    (polygon: number[][]): string => {
      if (polygon.length < 3) return "";

      const canvas = canvasRef.current;
      if (!canvas || !selectedImageData) return "";

      const transformedPoints = polygon.map(([x, y]) => {
        const scaledX = (x / selectedImageData.width) * canvas.width;
        const scaledY = (y / selectedImageData.height) * canvas.height;
        return { x: scaledX, y: scaledY };
      });

      let path = `M ${transformedPoints[0].x} ${transformedPoints[0].y}`;
      for (let i = 1; i < transformedPoints.length; i++) {
        path += ` L ${transformedPoints[i].x} ${transformedPoints[i].y}`;
      }
      path += " Z";

      return path;
    },
    [selectedImageData]
  );

  // Render annotation overlays as React elements
  const renderAnnotationOverlays = useCallback(() => {
    if (!showMask || !imageLoaded) return null;

    return approvedAnnotations.map((annotation, index) => {
      const color = index === 0 ? HIGHLIGHT_COLOR : OTHER_COLOR;
      const opacity = index === 0 ? 0.4 : 0.2;
      const strokeWidth = index === 0 ? 2.5 : 1.5;

      // Check if annotation has polygon data
      if (annotation.polygon && (annotation.polygon as any).has_segmentation) {
        const polygons = (annotation.polygon as any).polygons;
        if (polygons && Array.isArray(polygons)) {
          return (
            <g key={annotation.id}>
              {polygons.map((polygon: number[][], polygonIndex: number) => {
                const pathData = polygonToPath(polygon);
                if (!pathData) return null;

                return (
                  <path
                    key={`${annotation.id}-${polygonIndex}`}
                    d={pathData}
                    fill={`${color}${Math.round(opacity * 255)
                      .toString(16)
                      .padStart(2, "0")}`}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    filter={index === 0 ? "url(#maskGlow)" : undefined}
                    style={{
                      transition: "all 0.3s ease",
                    }}
                  />
                );
              })}
            </g>
          );
        }
      }

      return null;
    });
  }, [approvedAnnotations, showMask, imageLoaded, polygonToPath]);

  // No need for useEffect since we're using React rendering

  if (!selectedImage || !selectedImageData) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content
        style={{
          maxWidth: "1200px",
          maxHeight: "90vh",
          padding: 0,
          borderRadius: theme.borders.radius.lg,
          overflow: "hidden",
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          position: "relative",
        }}
      >
        <Dialog.Title className="visually-hidden">Dataset Image Detail</Dialog.Title>

        {/* Header */}
        <Box
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: theme.colors.background.card,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            padding: theme.spacing.semantic.component.lg,
          }}
        >
          <Flex align="center" justify="between">
            <Flex align="center" gap="3">
              <ImageIcon size={20} style={{ color: theme.colors.text.primary }} />
              <Box>
                <Heading size="4" style={{ color: theme.colors.text.primary, margin: 0 }}>
                  {selectedImageData.path?.split("/").pop() || `Image ${selectedImageIndex + 1}`}
                </Heading>
                <Flex align="center" gap="2" style={{ marginTop: "4px" }}>
                  <Text size="1" style={{ color: theme.colors.text.secondary }}>
                    {selectedImageData.width} × {selectedImageData.height}
                  </Text>
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                    •
                  </Text>
                  <Text size="1" style={{ color: theme.colors.text.secondary }}>
                    {selectedImageData.approvedAnnotationsCount} annotation
                    {selectedImageData.approvedAnnotationsCount !== 1 ? "s" : ""}
                  </Text>
                </Flex>
              </Box>
            </Flex>

            <Flex align="center" gap="3">
              {/* Mask Toggle */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMask(!showMask)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                {showMask ? <EyeSlash size={14} /> : <Eye size={14} />}
                {showMask ? "Hide Masks" : "Show Masks"}
              </Button>

              {/* Close Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                style={{
                  padding: theme.spacing.semantic.component.sm,
                  minWidth: "32px",
                }}
              >
                <X size={16} />
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Content */}
        <Flex style={{ height: "calc(90vh - 80px)" }}>
          {/* Image Display */}
          <Box
            style={{
              flex: "1 1 60%",
              background: theme.colors.background.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box style={{ position: "relative", maxWidth: "100%", maxHeight: "100%" }}>
              {/* Canvas for image */}
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: theme.borders.radius.sm,
                }}
              />

              {/* SVG overlay for annotations */}
              {imageLoaded && (
                <svg
                  ref={overlayRef}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                  viewBox={`0 0 ${canvasRef.current?.width || 600} ${canvasRef.current?.height || 400}`}
                >
                  <defs>
                    {/* Mask glow effect */}
                    <filter id="maskGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Render annotation overlays */}
                  {renderAnnotationOverlays()}
                </svg>
              )}
            </Box>
          </Box>

          {/* Sidebar */}
          <Box
            style={{
              flex: "1 1 40%",
              background: theme.colors.background.card,
              borderLeft: `1px solid ${theme.colors.border.primary}`,
              overflow: "auto",
              maxHeight: "100%",
            }}
          >
            <Box style={{ padding: theme.spacing.semantic.component.lg }}>
              {/* Image Metadata */}
              <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
                <Flex
                  align="center"
                  gap="2"
                  style={{ marginBottom: theme.spacing.semantic.component.md }}
                >
                  <Info size={16} style={{ color: theme.colors.text.secondary }} />
                  <Heading size="3" style={{ color: theme.colors.text.primary, margin: 0 }}>
                    Image Details
                  </Heading>
                </Flex>

                <Box
                  style={{
                    background: theme.colors.background.secondary,
                    padding: theme.spacing.semantic.component.md,
                    borderRadius: theme.borders.radius.md,
                    border: `1px solid ${theme.colors.border.primary}`,
                  }}
                >
                  <Flex direction="column" gap="2">
                    <Flex justify="between">
                      <Text size="2" style={{ color: theme.colors.text.secondary }}>
                        Filename
                      </Text>
                      <Text
                        size="2"
                        style={{ color: theme.colors.text.primary, fontFamily: "monospace" }}
                      >
                        {selectedImageData.path?.split("/").pop() || "Unknown"}
                      </Text>
                    </Flex>

                    <Flex justify="between">
                      <Text size="2" style={{ color: theme.colors.text.secondary }}>
                        Dimensions
                      </Text>
                      <Text
                        size="2"
                        style={{ color: theme.colors.text.primary, fontFamily: "monospace" }}
                      >
                        {selectedImageData.width} × {selectedImageData.height}
                      </Text>
                    </Flex>

                    <Flex justify="between">
                      <Text size="2" style={{ color: theme.colors.text.secondary }}>
                        Dataset ID
                      </Text>
                      <Text
                        size="2"
                        style={{ color: theme.colors.text.primary, fontFamily: "monospace" }}
                      >
                        #{selectedImageData.metadata?.datasetId || "Unknown"}
                      </Text>
                    </Flex>

                    <Flex justify="between">
                      <Text size="2" style={{ color: theme.colors.text.secondary }}>
                        Status
                      </Text>
                      <Badge
                        style={{
                          background: hasConfirmedAnnotations
                            ? `${theme.colors.status.success}20`
                            : `${theme.colors.status.warning}20`,
                          color: hasConfirmedAnnotations
                            ? theme.colors.status.success
                            : theme.colors.status.warning,
                          border: `1px solid ${
                            hasConfirmedAnnotations
                              ? theme.colors.status.success
                              : theme.colors.status.warning
                          }40`,
                          fontSize: "11px",
                          fontWeight: 500,
                          padding: "2px 6px",
                        }}
                      >
                        {hasConfirmedAnnotations ? "Approved" : "Pending"}
                      </Badge>
                    </Flex>
                  </Flex>
                </Box>
              </Box>

              {/* Approved Annotations */}
              <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
                <Flex
                  align="center"
                  gap="2"
                  style={{ marginBottom: theme.spacing.semantic.component.md }}
                >
                  <Target size={16} style={{ color: theme.colors.status.success }} />
                  <Heading size="3" style={{ color: theme.colors.text.primary, margin: 0 }}>
                    Approved Annotations
                  </Heading>
                  <Badge
                    style={{
                      background: `${theme.colors.status.success}20`,
                      color: theme.colors.status.success,
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 6px",
                    }}
                  >
                    {approvedAnnotations.length}
                  </Badge>
                </Flex>

                {annotationsLoading ? (
                  <Box
                    style={{
                      padding: theme.spacing.semantic.component.lg,
                      textAlign: "center",
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.md,
                    }}
                  >
                    <Text size="2" style={{ color: theme.colors.text.secondary }}>
                      Loading annotations...
                    </Text>
                  </Box>
                ) : approvedAnnotations.length > 0 ? (
                  <Box
                    style={{
                      background: theme.colors.background.secondary,
                      padding: theme.spacing.semantic.component.md,
                      borderRadius: theme.borders.radius.md,
                      border: `1px solid ${theme.colors.border.primary}`,
                    }}
                  >
                    <Flex direction="column" gap="2">
                      {approvedAnnotations.map((annotation, index) => (
                        <Flex key={annotation.id} align="center" justify="between">
                          <Flex align="center" gap="2">
                            <Box
                              style={{
                                width: "8px",
                                height: "8px",
                                background: index === 0 ? HIGHLIGHT_COLOR : OTHER_COLOR,
                                borderRadius: "50%",
                              }}
                            />
                            <Text size="2" style={{ color: theme.colors.text.primary }}>
                              {getCategoryName(annotation.category_id)}
                            </Text>
                          </Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </Box>
                ) : (
                  <Box
                    style={{
                      padding: theme.spacing.semantic.component.lg,
                      textAlign: "center",
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.md,
                      border: `2px dashed ${theme.colors.border.secondary}`,
                    }}
                  >
                    <Text size="2" style={{ color: theme.colors.text.secondary }}>
                      No approved annotations yet
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Actions */}
              <Box>
                <Flex direction="column" gap="2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => window.open(selectedImage!, "_blank")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.sm,
                      justifyContent: "center",
                    }}
                  >
                    <ArrowsOut size={14} />
                    View Full Size
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Flex>

        <style>
          {`
            .visually-hidden {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border: 0;
            }
          `}
        </style>
      </Dialog.Content>
    </Dialog.Root>
  );
}
