import React, { memo } from "react";
import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { User, CheckCircle, XCircle, CircleNotch, MagnifyingGlass, Check } from "phosphor-react";
import type { NicknameCheckStatus } from "@/shared/hooks/pages/useProfileSetupPage";

interface NicknameInputProps {
  value: string;
  error?: string;
  status: NicknameCheckStatus;
  isLoading: boolean;
  isMobile: boolean;
  onChange: (value: string) => void;
  onCheck: () => void;
}

export const NicknameInput = memo(function NicknameInput({
  value,
  error,
  status,
  isLoading,
  isMobile,
  onChange,
  onCheck,
}: NicknameInputProps) {
  const { theme } = useTheme();

  // Base input styling
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: isMobile ? "16px" : "18px",
    fontSize: isMobile ? "16px" : "15px",
    fontWeight: 500,
    border: `1px solid ${theme.colors.border.primary}`,
    borderRadius: theme.borders.radius.lg,
    background: theme.colors.background.primary,
    color: theme.colors.text.primary,
    outline: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const focusedInputStyle: React.CSSProperties = {
    borderColor: theme.colors.interactive.primary,
    boxShadow: `0 0 0 3px ${theme.colors.interactive.primary}20`,
  };

  const errorInputStyle: React.CSSProperties = {
    borderColor: theme.colors.status.error,
    boxShadow: `0 0 0 3px ${theme.colors.status.error}15`,
  };

  const fieldStyle: React.CSSProperties = {
    marginBottom: isMobile
      ? theme.spacing.semantic.component.lg
      : theme.spacing.semantic.component.xl,
  };

  const fieldLabelStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.semantic.component.xs,
    marginBottom: theme.spacing.semantic.component.xs,
    fontSize: isMobile ? "15px" : "14px",
    fontWeight: 600,
    color: theme.colors.text.primary,
  };

  const errorTextStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: theme.colors.status.error,
    marginTop: theme.spacing.semantic.component.xs,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  return (
    <Box style={fieldStyle}>
      <Box style={fieldLabelStyle}>
        <User size={16} color={theme.colors.interactive.primary} weight="duotone" />
        <Text weight="medium">Nickname</Text>
        <Text size="1" style={{ color: theme.colors.status.error }}>
          *
        </Text>
      </Box>
      <Box style={{ position: "relative" }}>
        <input
          type="text"
          name="nickname"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && value.trim() && !status.checking) {
              e.preventDefault();
              onCheck();
            }
          }}
          onFocus={e => Object.assign(e.target.style, focusedInputStyle)}
          onBlur={e => {
            const hasError = error && !status.available;
            Object.assign(
              e.target.style,
              hasError
                ? errorInputStyle
                : status.checked && status.available
                  ? {
                      borderColor: theme.colors.status.success,
                      boxShadow: `0 0 0 3px ${theme.colors.status.success}15`,
                    }
                  : {
                      borderColor: theme.colors.border.primary,
                      boxShadow: "none",
                    }
            );
          }}
          placeholder="Choose a unique nickname"
          style={{
            ...inputStyle,
            paddingRight: status.checked ? "110px" : "90px",
            ...(error && !status.available ? errorInputStyle : {}),
            ...(status.checked && status.available
              ? {
                  borderColor: theme.colors.status.success,
                  boxShadow: `0 0 0 3px ${theme.colors.status.success}15`,
                }
              : {}),
          }}
          maxLength={50}
          disabled={isLoading}
        />

        {/* Integrated check button inside input */}
        <Box
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {/* Status indicator */}
          {status.checked && (
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                paddingRight: "8px",
                borderRight: `1px solid ${theme.colors.border.secondary}`,
              }}
            >
              {status.available ? (
                <CheckCircle size={18} color={theme.colors.status.success} weight="fill" />
              ) : (
                <XCircle size={18} color={theme.colors.status.error} weight="fill" />
              )}
            </Box>
          )}

          {/* Check button */}
          <button
            type="button"
            onClick={onCheck}
            disabled={isLoading || status.checking || !value.trim()}
            style={{
              background: status.checking
                ? "transparent"
                : status.checked && status.available
                  ? theme.colors.status.success
                  : value.trim()
                    ? theme.colors.interactive.primary
                    : "transparent",
              color:
                status.checked && status.available
                  ? theme.colors.text.inverse
                  : value.trim()
                    ? theme.colors.text.inverse
                    : theme.colors.text.tertiary,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: value.trim() && !status.checking && !isLoading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              transition: "all 0.2s ease",
              opacity: value.trim() ? 1 : 0.5,
              outline: "none",
            }}
            onMouseEnter={e => {
              if (value.trim() && !status.checking && !isLoading) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {status.checking ? (
              <CircleNotch size={14} className="spin" weight="bold" />
            ) : status.checked && status.available ? (
              <>
                <Check size={14} weight="bold" />
                <span>Valid</span>
              </>
            ) : (
              <>
                <MagnifyingGlass size={14} weight="bold" />
                <span>Check</span>
              </>
            )}
          </button>
        </Box>
      </Box>

      {/* Status messages */}
      {status.message && (
        <Text
          style={{
            ...errorTextStyle,
            color: status.available ? theme.colors.status.success : theme.colors.status.error,
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {status.message}
        </Text>
      )}
      {error && !status.message && <Text style={errorTextStyle}>{error}</Text>}
    </Box>
  );
});
