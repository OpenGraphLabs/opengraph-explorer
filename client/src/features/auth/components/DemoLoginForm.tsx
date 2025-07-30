import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Lock, User, Eye, EyeClosed, CheckCircle } from "phosphor-react";
import { useDemoAuth } from "../hooks/useDemoAuth";
import { LoginCredentials } from "../types";

interface DemoLoginFormProps {
  onSuccess?: () => void;
}

export const DemoLoginForm: React.FC<DemoLoginFormProps> = ({ onSuccess }) => {
  const { theme } = useTheme();
  const { login } = useDemoAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(credentials);
      if (result.success) {
        setIsSuccess(true);

        // Call onSuccess callback if provided
        onSuccess?.();

        // Navigate immediately after successful login
        // The authentication state is already updated in localStorage
        const redirectTo = (location.state as any)?.from?.pathname || "/";

        // Small delay to show success feedback, then navigate
        setTimeout(() => {
          console.log("🔄 Redirecting to:", redirectTo);
          console.log("📦 Auth data in localStorage:", localStorage.getItem("opengraph-demo-auth"));
          console.log("👤 User ID in localStorage:", localStorage.getItem("opengraph-user-id"));

          // Use window.location.href for a full page navigation
          // This ensures the authentication state is properly loaded
          window.location.href = redirectTo;
        }, 800);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
    border: `1px solid ${theme.colors.border.secondary}`,
    borderRadius: theme.borders.radius.md,
    fontSize: theme.typography.body.fontSize,
    background: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const focusStyle = {
    borderColor: theme.colors.interactive.primary,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Username Input */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <Text
          as="label"
          size="3"
          style={{
            display: "block",
            marginBottom: theme.spacing.semantic.component.sm,
            color: theme.colors.text.secondary,
            fontWeight: 500,
          }}
        >
          Username
        </Text>
        <Box style={{ position: "relative" }}>
          <input
            type="text"
            value={credentials.username}
            onChange={e => setCredentials(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Enter your username"
            required
            disabled={isLoading}
            style={{
              ...inputStyle,
              paddingLeft: "44px",
            }}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => (e.target.style.borderColor = theme.colors.border.secondary)}
          />
          <User
            size={20}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.text.tertiary,
            }}
          />
        </Box>
      </Box>

      {/* Password Input */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <Text
          as="label"
          size="3"
          style={{
            display: "block",
            marginBottom: theme.spacing.semantic.component.sm,
            color: theme.colors.text.secondary,
            fontWeight: 500,
          }}
        >
          Password
        </Text>
        <Box style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            value={credentials.password}
            onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Enter your password"
            required
            disabled={isLoading}
            style={{
              ...inputStyle,
              paddingLeft: "44px",
              paddingRight: "44px",
            }}
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => (e.target.style.borderColor = theme.colors.border.secondary)}
          />
          <Lock
            size={20}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: theme.colors.text.tertiary,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            style={{
              position: "absolute",
              right: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: theme.colors.text.tertiary,
              padding: 0,
            }}
          >
            {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
          </button>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
          <Text
            size="2"
            style={{
              color: theme.colors.status.error,
              textAlign: "center",
              display: "block",
            }}
          >
            {error}
          </Text>
        </Box>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || isSuccess || !credentials.username || !credentials.password}
        style={{
          width: "100%",
          background: isSuccess
            ? `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.status.success})`
            : `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
          color: theme.colors.text.inverse,
          border: "none",
          borderRadius: theme.borders.radius.md,
          padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
          fontSize: theme.typography.body.fontSize,
          fontWeight: 600,
          cursor: isLoading || isSuccess ? "not-allowed" : "pointer",
          opacity:
            isLoading || isSuccess || !credentials.username || !credentials.password ? 0.8 : 1,
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.semantic.component.sm,
        }}
      >
        {isSuccess && <CheckCircle size={18} weight="fill" />}
        {isLoading ? "Signing in..." : isSuccess ? "Login Successful!" : "Sign In"}
      </Button>

      {/* Success Message */}
      {isSuccess && (
        <Box style={{ marginTop: theme.spacing.semantic.component.md }}>
          <Text
            size="2"
            style={{
              color: theme.colors.status.success,
              textAlign: "center",
              display: "block",
              fontWeight: 500,
            }}
          >
            ✓ Redirecting to main page...
          </Text>
        </Box>
      )}
    </form>
  );
};
