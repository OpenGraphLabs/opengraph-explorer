import React, { useEffect, useCallback } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Cross2Icon, ArrowLeftIcon } from "@radix-ui/react-icons";

interface ImageDetailModalMobileProps {
  annotation: any;
  image: any;
  categoryName?: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile-optimized fullscreen modal for image details
 * Replaces the desktop sidebar with a touch-friendly modal experience
 */
export function ImageDetailModalMobile({
  annotation,
  image,
  categoryName,
  isOpen,
  onClose,
}: ImageDetailModalMobileProps) {
  const { theme } = useTheme();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  // Handle swipe down to close (basic implementation)
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const startY = e.touches[0].clientY;

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const currentY = moveEvent.touches[0].clientY;
        const diffY = currentY - startY;

        // If swiped down significantly, close modal
        if (diffY > 100) {
          onClose();
          document.removeEventListener("touchmove", handleTouchMove);
        }
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: true });

      const cleanup = () => {
        document.removeEventListener("touchmove", handleTouchMove);
      };

      setTimeout(cleanup, 1000); // Cleanup after 1 second if no action
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      {/* Modal Content */}
      <Box
        onTouchStart={handleTouchStart}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.colors.background.primary,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          animation: "slideUpIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Header */}
        <Box
          style={{
            borderBottom: `1px solid ${theme.colors.border.subtle}`,
            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
            background: theme.colors.background.primary,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Flex align="center" justify="between">
            <Flex align="center" gap="3">
              <Button
                variant="tertiary"
                size="sm"
                onClick={onClose}
                style={{
                  minWidth: "44px",
                  minHeight: "44px",
                  padding: theme.spacing[2],
                }}
              >
                <ArrowLeftIcon width="18" height="18" />
              </Button>
              <Box>
                <Text
                  size="4"
                  style={{
                    fontWeight: "600",
                    color: theme.colors.text.primary,
                  }}
                >
                  Image Details
                </Text>
                {categoryName && (
                  <Text
                    size="2"
                    style={{
                      color: theme.colors.text.secondary,
                      marginTop: "2px",
                    }}
                  >
                    {categoryName}
                  </Text>
                )}
              </Box>
            </Flex>

            <Button
              variant="tertiary"
              size="sm"
              onClick={onClose}
              style={{
                minWidth: "44px",
                minHeight: "44px",
                padding: theme.spacing[2],
              }}
            >
              <Cross2Icon width="18" height="18" />
            </Button>
          </Flex>
        </Box>

        {/* Swipe Indicator */}
        <Box
          style={{
            width: "36px",
            height: "4px",
            background: theme.colors.border.primary,
            borderRadius: "2px",
            margin: `${theme.spacing[2]} auto`,
            opacity: 0.5,
          }}
        />

        {/* Content */}
        <Box
          style={{
            flex: 1,
            overflow: "auto",
            padding: `0 ${theme.spacing[4]} ${theme.spacing[6]}`,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Image */}
          {image && (
            <Box
              style={{
                marginBottom: theme.spacing[5],
                borderRadius: "12px",
                overflow: "hidden",
                background: theme.colors.background.secondary,
              }}
            >
              <img
                src={image.image_url || image.imageUrl}
                alt={`Image ${image.id}`}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "60vh",
                  objectFit: "contain",
                  display: "block",
                }}
                loading="lazy"
              />
            </Box>
          )}

          {/* Annotation Details */}
          <Box
            style={{
              background: theme.colors.background.card,
              borderRadius: "12px",
              padding: theme.spacing[4],
              marginBottom: theme.spacing[4],
              border: `1px solid ${theme.colors.border.subtle}`,
            }}
          >
            <Text
              size="3"
              style={{
                fontWeight: "600",
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3],
              }}
            >
              Annotation Information
            </Text>

            <Flex direction="column" gap="3">
              {categoryName && <InfoRow label="Category" value={categoryName} theme={theme} />}

              {annotation.id && (
                <InfoRow label="ID" value={annotation.id.toString()} theme={theme} />
              )}

              {annotation.created_at && (
                <InfoRow
                  label="Created"
                  value={new Date(annotation.created_at).toLocaleDateString()}
                  theme={theme}
                />
              )}
            </Flex>
          </Box>

          {/* Image Information */}
          <Box
            style={{
              background: theme.colors.background.card,
              borderRadius: "12px",
              padding: theme.spacing[4],
              border: `1px solid ${theme.colors.border.subtle}`,
            }}
          >
            <Text
              size="3"
              style={{
                fontWeight: "600",
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[3],
              }}
            >
              Image Information
            </Text>

            <Flex direction="column" gap="3">
              {image.file_name && (
                <InfoRow label="Filename" value={image.file_name} theme={theme} />
              )}

              {image.id && <InfoRow label="Image ID" value={image.id.toString()} theme={theme} />}

              {image.created_at && (
                <InfoRow
                  label="Uploaded"
                  value={new Date(image.created_at).toLocaleDateString()}
                  theme={theme}
                />
              )}
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* Styles */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes slideUpIn {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}

/**
 * Helper component for displaying information rows
 */
function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <Flex justify="between" align="start">
      <Text
        size="2"
        style={{
          color: theme.colors.text.secondary,
          fontWeight: "500",
          minWidth: "80px",
        }}
      >
        {label}
      </Text>
      <Text
        size="2"
        style={{
          color: theme.colors.text.primary,
          textAlign: "right",
          flex: 1,
          wordBreak: "break-word",
        }}
      >
        {value}
      </Text>
    </Flex>
  );
}
