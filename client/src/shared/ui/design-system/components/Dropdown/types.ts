import { ReactNode } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
}

export type DropdownVariant =
  | "default" // 기본 스타일
  | "minimal" // 미니멀한 스타일
  | "outlined" // 외곽선 강조
  | "filled"; // 배경 채움

export type DropdownSize =
  | "sm" // 작은 크기 (28px height)
  | "md" // 중간 크기 (36px height)
  | "lg"; // 큰 크기 (46px height)

export interface DropdownProps {
  // Core props
  options: DropdownOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;

  // Styling
  variant?: DropdownVariant;
  size?: DropdownSize;
  fullWidth?: boolean;

  // State
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;

  // Customization
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean; // 향후 확장용

  // Accessibility & UX
  "aria-label"?: string;
  "data-testid"?: string;

  // Event handlers
  onOpen?: () => void;
  onClose?: () => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
}
