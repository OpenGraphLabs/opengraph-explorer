import React, { useEffect } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { X, CheckCircle, XCircle, Info } from "phosphor-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  children?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  showCancel = false,
  children,
}: ModalProps) {
  const { theme } = useTheme();

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getIconAndColor = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle size={24} />,
          color: theme.colors.status.success,
          bgColor: `${theme.colors.status.success}10`,
        };
      case "error":
        return {
          icon: <XCircle size={24} />,
          color: theme.colors.status.error,
          bgColor: `${theme.colors.status.error}10`,
        };
      default:
        return {
          icon: <Info size={24} />,
          color: theme.colors.interactive.primary,
          bgColor: `${theme.colors.interactive.primary}10`,
        };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

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
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Modal Content */}
        <Box
          onClick={(e) => e.stopPropagation()}
          style={{
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            border: `1px solid ${theme.colors.border.subtle}40`,
            width: "90%",
            maxWidth: "480px",
            maxHeight: "90vh",
            overflow: "auto",
            animation: "modalSlideIn 0.3s ease-out",
          }}
        >
          {/* Header */}
          <Flex
            align="center"
            justify="between"
            style={{
              padding: `${theme.spacing.semantic.component.lg} ${theme.spacing.semantic.component.lg} 0`,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            <Flex align="center" gap="3">
              <Box
                style={{
                  color,
                  background: bgColor,
                  borderRadius: theme.borders.radius.full,
                  padding: theme.spacing.semantic.component.sm,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {icon}
              </Box>
              <Text
                size="4"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                {title}
              </Text>
            </Flex>

            <Button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: theme.colors.text.tertiary,
                cursor: "pointer",
                padding: theme.spacing.semantic.component.xs,
                borderRadius: theme.borders.radius.sm,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: theme.animations.transitions.all,
              }}
            >
              <X size={20} />
            </Button>
          </Flex>

          {/* Content */}
          <Box
            style={{
              padding: `0 ${theme.spacing.semantic.component.lg}`,
              marginBottom: theme.spacing.semantic.component.lg,
            }}
          >
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: children ? theme.spacing.semantic.component.md : 0,
              }}
            >
              {message}
            </Text>
            {children}
          </Box>

          {/* Footer */}
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              borderTop: `1px solid ${theme.colors.border.subtle}20`,
              background: theme.colors.background.secondary,
              borderBottomLeftRadius: theme.borders.radius.lg,
              borderBottomRightRadius: theme.borders.radius.lg,
            }}
          >
            <Flex justify="end" gap="2">
              {showCancel && (
                <Button
                  onClick={onClose}
                  style={{
                    background: "transparent",
                    color: theme.colors.text.secondary,
                    border: `1px solid ${theme.colors.border.subtle}`,
                    borderRadius: theme.borders.radius.md,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: theme.animations.transitions.all,
                  }}
                >
                  {cancelText}
                </Button>
              )}
              <Button
                onClick={handleConfirm}
                style={{
                  background: color,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: theme.animations.transitions.all,
                  minWidth: "80px",
                }}
              >
                {confirmText}
              </Button>
            </Flex>
          </Box>
        </Box>
      </Box>

      {/* CSS animations */}
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

          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </>
  );
}