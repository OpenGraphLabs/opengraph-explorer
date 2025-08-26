import { useState } from "react";
import { useZkLogin } from "@/contexts/data/ZkLoginContext";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { SpinnerGap } from "phosphor-react";

interface GoogleLoginButtonProps {
  onError?: (error: Error) => void;
}

export function GoogleLoginButton({ onError }: GoogleLoginButtonProps) {
  const { isLoading, error, generateGoogleOAuthUrl } = useZkLogin();
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setIsProcessing(true);
      setLoadingStep("Preparing secure connection...");

      // Small delay for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 300));

      setLoadingStep("Generating authentication request...");
      const authUrl = await generateGoogleOAuthUrl();

      if (!authUrl) {
        throw new Error("Failed to generate OAuth URL");
      }

      setLoadingStep("Redirecting to Google...");
      // Small delay before redirect for user to see the message
      await new Promise(resolve => setTimeout(resolve, 500));

      // Redirect to Google OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to initiate Google login:", error);
      setIsProcessing(false);
      setLoadingStep("");
      onError?.(error instanceof Error ? error : new Error("Failed to login"));
    }
  };

  // Show error from context if available
  if (error && onError) {
    onError(new Error(error));
  }

  // Show loading overlay when processing
  if (isProcessing) {
    return (
      <Box
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <button
          disabled
          style={{
            width: "100%",
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
            minHeight: "48px",
            cursor: "not-allowed",
            opacity: 0.7,
            transition: "all 200ms ease-in-out",
          }}
        >
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: theme.spacing.semantic.component.sm,
            }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.sm,
              }}
            >
              <SpinnerGap
                size={20}
                weight="bold"
                style={{
                  color: theme.colors.interactive.primary,
                  animation: "spin 1s linear infinite",
                }}
              />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                }}
              >
                {loadingStep}
              </Text>
            </Box>

            {/* Progress steps */}
            <Box
              style={{
                display: "flex",
                gap: "4px",
                marginTop: "4px",
              }}
            >
              {["Preparing", "Generating", "Redirecting"].map((step, index) => (
                <Box
                  key={step}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: loadingStep.toLowerCase().includes(step.toLowerCase())
                      ? theme.colors.interactive.primary
                      : theme.colors.border.secondary,
                    transition: "all 300ms ease",
                  }}
                />
              ))}
            </Box>
          </Box>
        </button>
      </Box>
    );
  }

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        style={{
          width: "100%",
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.sm,
          color: theme.colors.text.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.semantic.component.md,
          padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
          fontWeight: 500,
          fontSize: "14px",
          minHeight: "48px",
          transition: "all 200ms ease-in-out",
          cursor: isLoading ? "not-allowed" : "pointer",
          opacity: isLoading ? 0.6 : 1,
        }}
        onMouseEnter={e => {
          if (!isLoading) {
            e.currentTarget.style.background = theme.colors.background.secondary;
            e.currentTarget.style.borderColor = theme.colors.border.secondary;
          }
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = theme.colors.background.card;
          e.currentTarget.style.borderColor = theme.colors.border.primary;
        }}
      >
        {isLoading ? (
          <>
            <Box
              style={{
                width: "16px",
                height: "16px",
                border: `2px solid ${theme.colors.border.secondary}`,
                borderTop: `2px solid ${theme.colors.interactive.primary}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <span>Initializing...</span>
          </>
        ) : (
          <>
            {/* Google "G" Logo - Official Colors */}
            <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Add keyframe animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}
