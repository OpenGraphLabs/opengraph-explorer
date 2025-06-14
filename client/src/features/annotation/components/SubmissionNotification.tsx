/**
 * Submission Notification Component
 *
 * Displays comprehensive notifications for the complete annotation submission process
 * including blockchain transaction status, scoring results, and error states
 */

import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  CheckCircle,
  Warning,
  Clock,
  Trophy,
  X,
  CurrencyCircleDollar,
  Link as LinkIcon,
} from "phosphor-react";
import { type CompleteSubmissionStatus } from "../hooks/useCompleteAnnotationSubmission";
import { getSuiScanUrl } from "@/shared/utils/sui";

interface SubmissionNotificationProps {
  status: CompleteSubmissionStatus;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export function SubmissionNotification({
  status,
  onDismiss,
  onRetry,
}: SubmissionNotificationProps) {
  const { theme } = useTheme();

  // Don't render notification if idle
  if (status.phase === "idle") {
    return null;
  }

  const getNotificationStyle = () => {
    switch (status.phase) {
      case "validating":
      case "preparing":
      case "blockchain":
      case "scoring":
        return {
          background: theme.colors.interactive.primary,
          border: `1px solid ${theme.colors.interactive.primary}`,
        };
      case "completed":
        return {
          background: theme.colors.status.success,
          border: `1px solid ${theme.colors.status.success}`,
        };
      case "error":
        return {
          background: theme.colors.status.error,
          border: `1px solid ${theme.colors.status.error}`,
        };
      default:
        return {
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
        };
    }
  };

  const getIcon = () => {
    switch (status.phase) {
      case "validating":
      case "preparing":
        return <Clock size={20} style={{ color: theme.colors.text.inverse }} />;
      case "blockchain":
        return (
          <Box
            style={{
              animation: "spin 1s linear infinite",
            }}
          >
            <CurrencyCircleDollar size={20} style={{ color: theme.colors.text.inverse }} />
          </Box>
        );
      case "scoring":
        return (
          <Box
            style={{
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          >
            <Trophy size={20} style={{ color: theme.colors.text.inverse }} />
          </Box>
        );
      case "completed":
        return <CheckCircle size={20} style={{ color: theme.colors.text.inverse }} />;
      case "error":
        return <Warning size={20} style={{ color: theme.colors.text.inverse }} />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status.phase) {
      case "validating":
        return "Validating Annotations";
      case "preparing":
        return "Preparing Submission";
      case "blockchain":
        return "Submitting to Blockchain";
      case "scoring":
        return "Calculating Score";
      case "completed":
        return "Submission Completed!";
      case "error":
        return "Submission Failed";
      default:
        return "Processing";
    }
  };

  const getMessage = () => {
    switch (status.phase) {
      case "validating":
      case "preparing":
      case "scoring":
        return status.message;
      case "blockchain":
        return `${status.message}${status.progress ? ` (${status.progress}%)` : ""}`;
      case "completed":
        return `Your annotations have been successfully submitted and scored!`;
      case "error":
        return status.error;
      default:
        return "";
    }
  };

  const notificationStyle = getNotificationStyle();

  return (
    <Box
      style={{
        position: "fixed",
        bottom: theme.spacing.semantic.layout.md,
        right: theme.spacing.semantic.layout.md,
        maxWidth: "420px",
        minWidth: "350px",
        background: notificationStyle.background,
        borderRadius: theme.borders.radius.lg,
        border: notificationStyle.border,
        boxShadow: theme.shadows.semantic.overlay.modal,
        zIndex: 1000,
        animation: "slideInFromRight 0.3s ease-out",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          background: "rgba(255, 255, 255, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
        }}
      >
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            {getIcon()}
            <Text
              style={{
                color: theme.colors.text.inverse,
                fontWeight: 700,
                fontSize: "14px",
              }}
            >
              {getTitle()}
            </Text>
          </Flex>

          {onDismiss && (status.phase === "completed" || status.phase === "error") && (
            <button
              onClick={onDismiss}
              style={{
                background: "transparent",
                border: "none",
                color: theme.colors.text.inverse,
                cursor: "pointer",
                padding: "4px",
                borderRadius: theme.borders.radius.sm,
                opacity: 0.8,
              }}
            >
              <X size={16} />
            </button>
          )}
        </Flex>
      </Box>

      {/* Content */}
      <Box style={{ padding: theme.spacing.semantic.component.md }}>
        <Text
          style={{
            color: theme.colors.text.inverse,
            lineHeight: 1.5,
            marginBottom: theme.spacing.semantic.component.sm,
            opacity: 0.9,
          }}
        >
          {getMessage()}
        </Text>

        {/* Progress Bar for blockchain phase */}
        {status.phase === "blockchain" && status.progress && (
          <Box
            style={{
              height: "4px",
              background: "rgba(255, 255, 255, 0.2)",
              borderRadius: "2px",
              overflow: "hidden",
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            <Box
              style={{
                height: "100%",
                width: `${status.progress}%`,
                background: theme.colors.text.inverse,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
        )}

        {/* Success Details */}
        {status.phase === "completed" && (
          <Box
            style={{
              padding: theme.spacing.semantic.component.sm,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: theme.borders.radius.md,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            <Flex direction="column" gap="2">
              <Flex align="center" justify="between">
                <Text
                  style={{
                    color: theme.colors.text.inverse,
                    fontWeight: 600,
                    fontSize: "12px",
                    opacity: 0.8,
                  }}
                >
                  Final Score
                </Text>
                <Text
                  style={{
                    color: theme.colors.text.inverse,
                    fontWeight: 700,
                    fontSize: "16px",
                  }}
                >
                  {status.result.score}/100
                </Text>
              </Flex>

              {status.result.suiTransactionDigest && (
                <Flex align="center" justify="between">
                  <Text
                    style={{
                      color: theme.colors.text.inverse,
                      fontWeight: 600,
                      fontSize: "12px",
                      opacity: 0.8,
                    }}
                  >
                    Transaction
                  </Text>
                  <a
                    href={getSuiScanUrl("transaction", status.result.suiTransactionDigest)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: theme.colors.text.inverse,
                      textDecoration: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      opacity: 0.9,
                    }}
                  >
                    <LinkIcon size={12} />
                    View on Explorer
                  </a>
                </Flex>
              )}
            </Flex>
          </Box>
        )}

        {/* Action Buttons */}
        <Flex gap="2" justify="end">
          {status.phase === "error" && onRetry && (
            <Button
              onClick={onRetry}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: theme.colors.text.inverse,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Retry Submission
            </Button>
          )}

          {status.phase === "completed" && onDismiss && (
            <Button
              onClick={onDismiss}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: theme.colors.text.inverse,
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Continue
            </Button>
          )}
        </Flex>
      </Box>

      <style>
        {`
        @keyframes slideInFromRight {
          from { 
            transform: translateX(100%); 
            opacity: 0; 
          }
          to { 
            transform: translateX(0); 
            opacity: 1; 
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        `}
      </style>
    </Box>
  );
}
