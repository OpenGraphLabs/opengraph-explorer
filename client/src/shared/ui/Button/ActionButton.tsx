import { ReactNode } from "react";
import {
  Flex,
  Button,
} from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";

interface ActionButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "small" | "medium" | "large";
  icon?: ReactNode;
}

const VARIANT_STYLES = {
  primary: {
    background: "#FF5733",
    color: "white",
    disabledBg: "var(--gray-6)",
  },
  secondary: {
    background: "var(--gray-3)",
    color: "var(--gray-12)",
    disabledBg: "var(--gray-5)",
  },
  danger: {
    background: "#DC2626",
    color: "white",
    disabledBg: "var(--gray-6)",
  },
  success: {
    background: "#16A34A",
    color: "white",
    disabledBg: "var(--gray-6)",
  },
};

const SIZE_STYLES = {
  small: {
    padding: "0 16px",
    height: "32px",
    fontSize: "14px",
  },
  medium: {
    padding: "0 20px",
    height: "40px",
    fontSize: "14px",
  },
  large: {
    padding: "0 24px",
    height: "48px",
    fontSize: "16px",
  },
};

export function ActionButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "medium",
  icon,
}: ActionButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      style={{
        background: isDisabled ? variantStyle.disabledBg : variantStyle.background,
        color: isDisabled ? "var(--gray-9)" : variantStyle.color,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        borderRadius: "8px",
        fontWeight: "600",
        ...sizeStyle,
      }}
    >
      <Flex align="center" gap="2">
        {loading ? (
          <ReloadIcon style={{ animation: "spin 1s linear infinite" }} />
        ) : icon ? (
          icon
        ) : null}
        <span>{children}</span>
      </Flex>
    </Button>
  );
} 