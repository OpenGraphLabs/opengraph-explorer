import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Shield } from "phosphor-react";

export function AuthError() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    // Get error message from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("message");

    if (message) {
      setErrorMessage(decodeURIComponent(message));
    } else {
      setErrorMessage("An unknown authentication error occurred");
    }
  }, []);

  return (
    <Box
      style={{
        minHeight: "calc(100vh - var(--header-height, 56px))",
        background: theme.colors.background.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Box
        style={{
          width: "100%",
          maxWidth: "480px",
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.lg,
          boxShadow: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`,
          padding: theme.spacing.semantic.layout.lg,
          textAlign: "center",
        }}
      >
        {/* Error Icon */}
        <Box
          style={{
            width: "72px",
            height: "72px",
            margin: "0 auto",
            marginBottom: theme.spacing.semantic.component.lg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.colors.status.error + "10",
            borderRadius: "50%",
            border: `2px solid ${theme.colors.status.error}20`,
          }}
        >
          <Shield size={32} style={{ color: theme.colors.status.error }} />
        </Box>

        {/* Error Title */}
        <Text
          as="p"
          size="5"
          style={{
            color: theme.colors.text.primary,
            fontWeight: 600,
            marginBottom: theme.spacing.semantic.component.sm,
            letterSpacing: "-0.025em",
          }}
        >
          Authentication Failed
        </Text>

        {/* Error Message */}
        <Box
          style={{
            background: theme.colors.status.error + "08",
            border: `1px solid ${theme.colors.status.error}20`,
            borderRadius: theme.borders.radius.md,
            padding: theme.spacing.semantic.component.md,
            marginBottom: theme.spacing.semantic.component.lg,
          }}
        >
          <Text
            size="2"
            style={{
              color: theme.colors.status.error,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {errorMessage}
          </Text>
        </Box>

        {/* Action Buttons */}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.semantic.component.sm,
          }}
        >
          <Button
            onClick={() => navigate("/login")}
            size="lg"
            variant="primary"
            fullWidth
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.primary,
              border: "none",
            }}
          >
            Try Again
          </Button>

          <Button
            onClick={() => navigate("/")}
            size="lg"
            variant="secondary"
            fullWidth
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: `1px solid ${theme.colors.border.secondary}`,
            }}
          >
            Go to Home
          </Button>
        </Box>

        {/* Support Info */}
        <Box
          style={{
            marginTop: theme.spacing.semantic.component.lg,
            paddingTop: theme.spacing.semantic.component.md,
            borderTop: `1px solid ${theme.colors.border.secondary}`,
          }}
        >
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              lineHeight: 1.4,
            }}
          >
            If this problem persists, please contact support
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
