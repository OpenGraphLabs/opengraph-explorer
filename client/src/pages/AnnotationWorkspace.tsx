import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  ArrowLeft,
  Database,
  Target,
  Image,
  Palette,
  Eye,
  EyeSlash,
} from "phosphor-react";
import { useImages, useAnnotationsByImage } from "@/shared/hooks/useApiQuery";
import { ImageWithSegmentation } from "@/features/annotation/components";
import { Annotation } from "@/features/annotation/types/annotation";

export function AnnotationWorkspace() {
  const { id: datasetId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [showMasks, setShowMasks] = useState(true);
  const [randomSeed] = useState(() => Math.floor(Math.random() * 1000));

  // Ensure we have a dataset ID
  if (!datasetId) {
    navigate('/datasets');
    return null;
  }

  // Fetch images for the dataset
  const {
    data: imagesResponse,
    isLoading: imagesLoading,
    error: imagesError,
  } = useImages(
    { page: 1, limit: 100 },
    {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  // Select a random image from the dataset
  const selectedImage = useMemo(() => {
    if (!imagesResponse?.items?.length) return null;
    
    // Filter images by dataset ID and select randomly
    const datasetImages = imagesResponse.items.filter(
      (image: any) => image.dataset_id === parseInt(datasetId)
    );
    
    if (datasetImages.length === 0) return null;
    
    const randomIndex = randomSeed % datasetImages.length;
    return datasetImages[randomIndex];
  }, [imagesResponse, datasetId, randomSeed]);

  // Fetch annotations for the selected image
  const {
    data: imageAnnotations = [],
    isLoading: annotationsLoading,
  } = useAnnotationsByImage(
    selectedImage?.id || 0,
    {},
    {
      enabled: !!selectedImage?.id,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    } as any
  );

  // Handle image click (could navigate to detailed view)
  const handleImageClick = () => {
    // Could implement detailed annotation view or other interactions
    console.log('Image clicked for annotation');
  };

  // Loading state
  if (imagesLoading) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
            maxWidth: "400px",
          }}
        >
          <Box
            style={{
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Database size={24} style={{ color: theme.colors.interactive.primary }} />
            <Box
              style={{
                position: "absolute",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}20, ${theme.colors.interactive.accent}20)`,
                animation: "pulse 2s infinite",
              }}
            />
          </Box>
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Loading Dataset Images
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              Preparing annotation workspace...
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Error state
  if (imagesError || !selectedImage) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.status.error}40`,
            boxShadow: theme.shadows.semantic.card.medium,
            maxWidth: "400px",
          }}
        >
          <Database size={48} style={{ color: theme.colors.status.error }} />
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Dataset Not Available
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {imagesError ? "Unable to load dataset images" : "No images found in this dataset"}
            </Text>
            <Button
              onClick={() => navigate("/datasets")}
              style={{
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Back to Datasets
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Ultra-minimal Header */}
      <Box
        style={{
          background: theme.colors.background.primary,
          borderBottom: `1px solid ${theme.colors.border.subtle}20`,
          padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.md}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Flex justify="between" align="center">
          <Button
            onClick={() => navigate("/datasets")}
            style={{
              background: "transparent",
              color: theme.colors.text.tertiary,
              border: "none",
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.xs,
              fontSize: "11px",
              fontWeight: 400,
              opacity: 0.7,
              transition: theme.animations.transitions.all,
            }}
          >
            <ArrowLeft size={11} />
            Back
          </Button>

          <Flex align="center" gap="2">
            {imageAnnotations.length > 0 && (
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  fontWeight: 400,
                  opacity: 0.6,
                }}
              >
                {imageAnnotations.length} masks
              </Text>
            )}

            <Button
              onClick={() => setShowMasks(!showMasks)}
              style={{
                background: "transparent",
                color: theme.colors.text.tertiary,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                fontSize: "10px",
                fontWeight: 400,
                opacity: 0.7,
                transition: theme.animations.transitions.all,
              }}
            >
              {showMasks ? <EyeSlash size={11} /> : <Eye size={11} />}
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Full-screen Image Area */}
      <Box
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: theme.spacing.semantic.component.md,
          minHeight: 0, // Allow flex child to shrink
        }}
      >
        {/* Subtle Image Info */}
        <Flex 
          justify="between" 
          align="center" 
          style={{ 
            marginBottom: theme.spacing.semantic.component.sm,
            opacity: 0.6,
          }}
        >
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontSize: "11px",
              fontWeight: 400,
            }}
          >
            {selectedImage.file_name}
          </Text>
          
          <Flex align="center" gap="2">
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: "10px",
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {selectedImage.width} × {selectedImage.height}
            </Text>
            
            {annotationsLoading && (
              <Flex align="center" gap="1">
                <Box
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderTopColor: theme.colors.interactive.primary,
                    animation: 'spin 1s linear infinite',
                  }}
                />
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "9px",
                  }}
                >
                  Loading...
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Full-size Image Display */}
        <Box
          style={{
            flex: 1,
            borderRadius: theme.borders.radius.md,
            overflow: "hidden",
            background: theme.colors.background.secondary,
            border: `1px solid ${theme.colors.border.subtle}20`,
            minHeight: "calc(100vh - 120px)", // Full viewport minus header and padding
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <ImageWithSegmentation
              key={selectedImage.id}
              id={selectedImage.id}
              fileName={selectedImage.file_name}
              imageUrl={selectedImage.image_url}
              width={selectedImage.width}
              height={selectedImage.height}
              datasetId={selectedImage.dataset_id}
              createdAt={selectedImage.created_at}
              onClick={handleImageClick}
              autoLoadAnnotations={showMasks}
            />
          </Box>
        </Box>
      </Box>

      {/* Global Styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* Ensure full height layout */
          body {
            margin: 0;
            padding: 0;
          }
        `}
      </style>
    </Box>
  );
}
