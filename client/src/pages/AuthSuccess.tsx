import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/data/AuthContext";
import { useZkLogin } from "@/contexts/data/ZkLoginContext";
import { Box, Flex, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { CheckCircle, Shield, SpinnerGap, Warning } from "phosphor-react";
import logoImage from "@/assets/logo/logo.png";

export function AuthSuccess() {
  const navigate = useNavigate();
  const { handleGoogleCallback } = useAuth();
  const { setSuiAddress, suiAddress } = useZkLogin();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<string>("Processing authentication...");
  const { theme } = useTheme();

  useEffect(() => {
    const processTokens = async () => {
      try {
        // Get tokens from URL parameters (from server redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("token");
        const googleJwt = urlParams.get("jwt");
        const zkLoginSalt = urlParams.get("zklogin_salt");

        if (!accessToken || !googleJwt) {
          throw new Error("Missing authentication tokens");
        }

        // Process server JWT through AuthContext (for API calls)
        setStep("Processing server authentication...");
        await handleGoogleCallback(accessToken);

        // Store Google JWT separately (for zkLogin)
        sessionStorage.setItem("google-jwt", googleJwt);

        // Process zkLogin if we have the required parameters
        if (zkLoginSalt) {
          setStep("Generating ZK proof and Sui address...");

          try {
            // Import zkLoginService dynamically
            const { zkLoginService } = await import("@/shared/services/zkLoginService");

            // Complete zkLogin flow on client side
            const zkResult = await zkLoginService.completeZkLoginFlow(googleJwt, zkLoginSalt);

            setStep("ZK proof and Sui address generated successfully!");
            setSuiAddress(zkResult.sui_address);
          } catch (zkError) {
            console.error("ZK proof generation failed:", zkError);
            setStep("Authentication complete (ZK proof generation failed)");
            // Continue with normal login even if zkLogin fails
          }
        } else {
          setStep("Authentication complete (no zkLogin salt provided)");
        }

        setLoading(false);

        // Redirect to home after brief delay
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        console.error("Token processing error:", error);
        setError(error instanceof Error ? error.message : "Failed to process authentication");
        setLoading(false);
      }
    };

    processTokens();
  }, [navigate, handleGoogleCallback, setSuiAddress]);

  if (loading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
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
            boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.04)",
            padding: theme.spacing.semantic.layout.lg,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle background gradient */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "120px",
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.accent}06)`,
              zIndex: 0,
            }}
          />

          <Box style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <Flex justify="center" mb="6">
              <Box
                style={{
                  width: "64px",
                  height: "64px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: theme.colors.background.card,
                  borderRadius: "50%",
                  boxShadow: `0 4px 12px rgba(0, 0, 0, 0.08)`,
                  padding: "12px",
                }}
              >
                <img
                  src={logoImage}
                  alt="OpenGraph"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Flex>

            {/* Loading animation */}
            <Flex direction="column" align="center" gap="4">
              <Box
                style={{
                  animation: "spin 1.5s linear infinite",
                }}
              >
                <SpinnerGap
                  size={32}
                  weight="bold"
                  style={{ color: theme.colors.interactive.primary }}
                />
              </Box>

              <Text
                size="3"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {step}
              </Text>

              {/* Progress indicators */}
              <Box
                style={{
                  width: "100%",
                  padding: theme.spacing.semantic.component.md,
                  background: theme.colors.background.secondary,
                  borderRadius: theme.borders.radius.sm,
                  marginTop: theme.spacing.semantic.component.sm,
                }}
              >
                <Flex direction="column" gap="3">
                  <Flex align="center" gap="2">
                    <CheckCircle
                      size={16}
                      weight="fill"
                      style={{ color: theme.colors.status.success }}
                    />
                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      Google authentication verified
                    </Text>
                  </Flex>

                  {suiAddress ? (
                    <Flex align="center" gap="2">
                      <CheckCircle
                        size={16}
                        weight="fill"
                        style={{ color: theme.colors.status.success }}
                      />
                      <Text
                        size="2"
                        style={{
                          color: theme.colors.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        zkLogin address generated
                      </Text>
                    </Flex>
                  ) : (
                    <Flex align="center" gap="2">
                      <Box
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: `2px solid ${theme.colors.border.primary}`,
                          borderTopColor: theme.colors.interactive.primary,
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      <Text
                        size="2"
                        style={{
                          color: theme.colors.text.tertiary,
                          fontWeight: 500,
                        }}
                      >
                        Generating zkLogin proof...
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </Box>

              {/* Sui Address Display */}
              {suiAddress && (
                <Box
                  style={{
                    width: "100%",
                    marginTop: theme.spacing.semantic.component.md,
                    padding: theme.spacing.semantic.component.md,
                    background: `${theme.colors.status.success}10`,
                    border: `1px solid ${theme.colors.status.success}30`,
                    borderRadius: theme.borders.radius.sm,
                  }}
                >
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                      <Shield
                        size={16}
                        weight="fill"
                        style={{ color: theme.colors.status.success }}
                      />
                      <Text
                        size="2"
                        style={{
                          color: theme.colors.status.success,
                          fontWeight: 600,
                        }}
                      >
                        Wallet Address Generated
                      </Text>
                    </Flex>
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.text.secondary,
                        fontFamily: "monospace",
                        wordBreak: "break-all",
                        lineHeight: 1.4,
                      }}
                    >
                      {suiAddress}
                    </Text>
                  </Flex>
                </Box>
              )}
            </Flex>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          minHeight: "100vh",
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
            boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.04)",
            padding: theme.spacing.semantic.layout.lg,
            textAlign: "center",
          }}
        >
          {/* Error icon */}
          <Flex justify="center" mb="4">
            <Box
              style={{
                width: "64px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${theme.colors.status.error}10`,
                borderRadius: "50%",
              }}
            >
              <Warning size={32} weight="fill" style={{ color: theme.colors.status.error }} />
            </Box>
          </Flex>

          <Text
            size="4"
            style={{
              color: theme.colors.text.primary,
              fontWeight: 600,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            Authentication Failed
          </Text>

          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.semantic.component.lg,
              lineHeight: 1.5,
            }}
          >
            {error}
          </Text>

          <button
            onClick={() => navigate("/login")}
            style={{
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
              background: theme.colors.interactive.primary,
              color: "white",
              borderRadius: theme.borders.radius.sm,
              border: "none",
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Try Again
          </button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
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
          boxShadow: "0 4px 6px -1px rgb(15 23 42 / 0.07), 0 2px 4px -2px rgb(15 23 42 / 0.04)",
          padding: theme.spacing.semantic.layout.lg,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Success background gradient */}
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120px",
            background: `linear-gradient(135deg, ${theme.colors.status.success}08, ${theme.colors.interactive.accent}06)`,
            zIndex: 0,
          }}
        />

        <Box style={{ position: "relative", zIndex: 1 }}>
          {/* Success icon */}
          <Flex justify="center" mb="6">
            <Box
              style={{
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${theme.colors.status.success}10`,
                borderRadius: "50%",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              <CheckCircle size={48} weight="fill" style={{ color: theme.colors.status.success }} />
            </Box>
          </Flex>

          {/* Success message */}
          <Flex direction="column" align="center" gap="3">
            <Text
              size="5"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 700,
                textAlign: "center",
                letterSpacing: "-0.025em",
              }}
            >
              Welcome to OpenGraph!
            </Text>

            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Authentication successful. Redirecting you to the platform...
            </Text>

            {/* Loading dots */}
            <Flex gap="2" mt="4">
              {[0, 1, 2].map(index => (
                <Box
                  key={index}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: theme.colors.interactive.primary,
                    opacity: 0.3,
                    animation: `pulse 1.5s ease-in-out ${index * 0.2}s infinite`,
                  }}
                />
              ))}
            </Flex>

            {/* Wallet info if available */}
            {suiAddress && (
              <Box
                style={{
                  width: "100%",
                  marginTop: theme.spacing.semantic.component.lg,
                  padding: theme.spacing.semantic.component.md,
                  background: theme.colors.background.secondary,
                  borderRadius: theme.borders.radius.sm,
                  borderLeft: `3px solid ${theme.colors.status.success}`,
                }}
              >
                <Flex align="center" gap="2" mb="2">
                  <Shield size={16} weight="fill" style={{ color: theme.colors.status.success }} />
                  <Text
                    size="2"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    zkLogin Wallet Created
                  </Text>
                </Flex>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontFamily: "monospace",
                    fontSize: "11px",
                    wordBreak: "break-all",
                  }}
                >
                  {suiAddress}
                </Text>
              </Box>
            )}
          </Flex>
        </Box>
      </Box>

      {/* Add keyframe animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}
      </style>
    </Box>
  );
}
