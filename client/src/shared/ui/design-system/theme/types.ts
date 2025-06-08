// Theme System Types
import type { lightThemeColors, darkThemeColors, gradients } from "../tokens/colors";
import type { textStyles } from "../tokens/typography";
import type { spacing, semanticSpacing } from "../tokens/spacing";
import type { boxShadows, semanticShadows, darkShadows } from "../tokens/shadows";
import type { borderRadius, semanticBorderRadius } from "../tokens/borders";
import type { transitions, keyframes } from "../tokens/animations";

export type ThemeMode = "light" | "dark";

// Base color scheme structure (allows for different implementations)
export interface BaseColorScheme {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    overlay: string;
    accent: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    brand: string;
    muted: string;
  };
  border: {
    primary: string;
    secondary: string;
    brand: string;
    focus: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    disabled: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  dataType: Record<string, string>;
  selection: {
    background: string;
    text: string;
  };
}

// Base shadow scheme structure
export interface BaseShadowScheme {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  inner: string;
  glow: string;
  glowFocus: string;
}

// Base semantic shadow structure
export interface BaseSemanticShadows {
  card: {
    flat: string;
    low: string;
    medium: string;
    high: string;
    highest: string;
  };
  interactive: {
    default: string;
    hover: string;
    active: string;
    focus: string;
  };
  overlay: {
    modal: string;
    dropdown: string;
    tooltip: string;
    popover: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// Color scheme types
export type LightColorScheme = typeof lightThemeColors;
export type DarkColorScheme = typeof darkThemeColors;
export type GradientScheme = typeof gradients;

// Component variant types
export type ComponentVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "success"
  | "warning"
  | "info";
export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";
export type ComponentState = "default" | "hover" | "active" | "disabled" | "focus";

// Theme configuration (generic to allow different color schemes)
export interface Theme<
  TColorScheme extends BaseColorScheme = BaseColorScheme,
  TShadowScheme extends BaseShadowScheme = BaseShadowScheme,
  TSemanticShadows extends BaseSemanticShadows = BaseSemanticShadows,
> {
  mode: ThemeMode;
  colors: TColorScheme;
  gradients: GradientScheme;
  typography: typeof textStyles;
  spacing: {
    base: typeof spacing;
    semantic: typeof semanticSpacing;
  };
  shadows: {
    base: TShadowScheme;
    semantic: TSemanticShadows;
  };
  borders: {
    radius: typeof borderRadius;
    semantic: typeof semanticBorderRadius;
  };
  animations: {
    transitions: typeof transitions;
    keyframes: typeof keyframes;
  };
}

// Specific theme types
export type LightTheme = Theme<LightColorScheme, typeof boxShadows, typeof semanticShadows>;
export type DarkTheme = Theme<DarkColorScheme, typeof darkShadows, BaseSemanticShadows>;

// Theme context type
export interface ThemeContextType {
  theme: LightTheme | DarkTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

// Component styling props
export interface StyleProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

// Responsive value type
export type ResponsiveValue<T> =
  | T
  | {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      "2xl"?: T;
    };
