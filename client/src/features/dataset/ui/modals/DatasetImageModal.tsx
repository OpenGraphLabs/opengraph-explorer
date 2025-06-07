
import { Box, Flex, Text, Dialog, Button, Badge, Separator } from "@radix-ui/themes";
import { X, Tag, CheckCircle } from "phosphor-react";
import { DataObject, AnnotationObject } from "@/shared/api/graphql/datasetGraphQLService";

interface DatasetImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedImage: string | null;
  selectedImageData: DataObject | null;
  selectedAnnotations: AnnotationObject[];
  selectedPendingLabels: Set<string>;
  confirmationStatus: {
    status: 'idle' | 'pending' | 'success' | 'failed';
    message: string;
    txHash?: string;
    confirmedLabels?: string[];
  };
  onTogglePendingAnnotation: (label: string) => void;
  onConfirmSelectedAnnotations: () => void;
  onCloseModal: () => void;
  getConfirmedLabels: () => Set<string>;
  getAnnotationColor: (index: number) => { bg: string; text: string; border: string };
}

export function DatasetImageModal({
  isOpen,
  onClose,
  selectedImage,
  selectedImageData,
  selectedAnnotations,
  selectedPendingLabels,
  confirmationStatus,
  onTogglePendingAnnotation,
  onConfirmSelectedAnnotations,
  onCloseModal,
  getConfirmedLabels,
  getAnnotationColor,
}: DatasetImageModalProps) {
  if (!isOpen || !selectedImage || !selectedImageData) {
    return null;
  }

  const confirmedLabels = getConfirmedLabels();
  const pendingLabels = selectedAnnotations
    .map(annotation => annotation.label)
    .filter(label => !confirmedLabels.has(label));

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          width: "1200px",
          padding: "0",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Flex direction="column" style={{ height: "90vh" }}>
          {/* Header */}
          <Flex
            justify="between"
            align="center"
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--gray-4)",
              background: "white",
            }}
          >
            <Text size="5" weight="bold">
              {selectedImageData.path.split("/").pop()}
            </Text>
            <Button
              variant="ghost"
              onClick={onCloseModal}
              style={{ padding: "8px", borderRadius: "8px" }}
            >
              <X size={20} />
            </Button>
          </Flex>

          <Flex style={{ flex: 1, overflow: "hidden" }}>
            {/* Image Display */}
            <Box
              style={{
                flex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--gray-2)",
                position: "relative",
              }}
            >
              <img
                src={selectedImage}
                alt={selectedImageData.path}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </Box>

            {/* Annotation Panel */}
            <Box
              style={{
                flex: 1,
                padding: "24px",
                background: "white",
                borderLeft: "1px solid var(--gray-4)",
                overflow: "auto",
              }}
            >
              <Flex direction="column" gap="6">
                {/* Confirmed Annotations */}
                {confirmedLabels.size > 0 && (
                  <Box>
                    <Flex align="center" gap="2" mb="3">
                      <CheckCircle size={16} style={{ color: "#4CAF50" }} />
                      <Text size="4" weight="bold" style={{ color: "#4CAF50" }}>
                        Confirmed Annotations
                      </Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      {Array.from(confirmedLabels).map((label, index) => {
                        const color = getAnnotationColor(index);
                        return (
                          <Badge
                            key={label}
                            style={{
                              background: color.bg,
                              color: color.text,
                              border: `1px solid ${color.border}`,
                              padding: "8px 12px",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: "500",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {label}
                          </Badge>
                        );
                      })}
                    </Flex>
                  </Box>
                )}

                {/* Pending Annotations */}
                {pendingLabels.length > 0 && (
                  <Box>
                    <Flex align="center" gap="2" mb="3">
                      <Tag size={16} style={{ color: "#FF9800" }} />
                      <Text size="4" weight="bold" style={{ color: "#FF9800" }}>
                        Pending Annotations
                      </Text>
                    </Flex>
                    <Flex direction="column" gap="2">
                      {pendingLabels.map((label) => (
                        <Badge
                          key={label}
                          style={{
                            background: selectedPendingLabels.has(label) ? "#E3F2FD" : "var(--gray-a3)",
                            color: selectedPendingLabels.has(label) ? "#1565C0" : "var(--gray-11)",
                            border: selectedPendingLabels.has(label) ? "2px solid #1565C0" : "1px solid var(--gray-6)",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          onClick={() => onTogglePendingAnnotation(label)}
                        >
                          {label}
                        </Badge>
                      ))}
                    </Flex>

                    {/* Confirmation Controls */}
                    {selectedPendingLabels.size > 0 && (
                      <Box mt="4">
                        <Separator style={{ margin: "16px 0" }} />
                        <Button
                          size="3"
                          disabled={confirmationStatus.status === 'pending'}
                          onClick={onConfirmSelectedAnnotations}
                          style={{
                            width: "100%",
                            background: "#4CAF50",
                            color: "white",
                            borderRadius: "8px",
                            fontWeight: "600",
                          }}
                        >
                          {confirmationStatus.status === 'pending' ? (
                            "Confirming..."
                          ) : (
                            `Confirm ${selectedPendingLabels.size} Annotation${selectedPendingLabels.size > 1 ? 's' : ''}`
                          )}
                        </Button>
                      </Box>
                    )}

                    {/* Status Messages */}
                    {confirmationStatus.status !== 'idle' && confirmationStatus.message && (
                      <Box mt="3">
                        <Text
                          size="2"
                          style={{
                            color: confirmationStatus.status === 'success' ? "#4CAF50" : 
                                   confirmationStatus.status === 'failed' ? "#F44336" : "#FF9800",
                            fontWeight: "500",
                          }}
                        >
                          {confirmationStatus.message}
                        </Text>
                      </Box>
                    )}
                  </Box>
                )}

                {/* No Annotations */}
                {confirmedLabels.size === 0 && pendingLabels.length === 0 && (
                  <Box
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      background: "var(--gray-a2)",
                      borderRadius: "12px",
                    }}
                  >
                    <Text size="3" style={{ color: "var(--gray-9)" }}>
                      No annotations available for this image.
                    </Text>
                  </Box>
                )}
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
} 