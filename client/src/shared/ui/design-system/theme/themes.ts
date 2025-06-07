// Theme Definitions
import { lightThemeColors, darkThemeColors, gradients } from "../tokens/colors";
import { textStyles } from "../tokens/typography";
import { spacing, semanticSpacing } from "../tokens/spacing";
import { boxShadows, semanticShadows, darkShadows } from "../tokens/shadows";
import { borderRadius, semanticBorderRadius } from "../tokens/borders";
import { transitions, keyframes } from "../tokens/animations";
import type { LightTheme, DarkTheme } from "./types";

// Light theme configuration
export const lightTheme: LightTheme = {
  mode: "light",
  colors: lightThemeColors,
  gradients,
  typography: textStyles,
  spacing: {
    base: spacing,
    semantic: semanticSpacing,
  },
  shadows: {
    base: boxShadows,
    semantic: semanticShadows,
  },
  borders: {
    radius: borderRadius,
    semantic: semanticBorderRadius,
  },
  animations: {
    transitions,
    keyframes,
  },
} as const;

// Dark theme configuration
export const darkTheme: DarkTheme = {
  mode: "dark",
  colors: darkThemeColors,
  gradients,
  typography: textStyles,
  spacing: {
    base: spacing,
    semantic: semanticSpacing,
  },
  shadows: {
    base: darkShadows,
    semantic: {
      ...semanticShadows,
      card: {
        flat: darkShadows.none,
        low: darkShadows.sm,
        medium: darkShadows.md,
        high: darkShadows.lg,
        highest: darkShadows.xl,
      },
      interactive: {
        default: darkShadows.sm,
        hover: darkShadows.md,
        active: darkShadows.xs,
        focus: darkShadows.glowFocus,
      },
      overlay: {
        modal: darkShadows["2xl"],
        dropdown: darkShadows.lg,
        tooltip: darkShadows.md,
        popover: darkShadows.xl,
      },
      status: {
        success: "0 0 0 3px rgb(34 197 94 / 0.15)",
        warning: "0 0 0 3px rgb(251 191 36 / 0.15)",
        error: "0 0 0 3px rgb(239 68 68 / 0.15)",
        info: "0 0 0 3px rgb(59 130 246 / 0.15)",
      },
    },
  },
  borders: {
    radius: borderRadius,
    semantic: semanticBorderRadius,
  },
  animations: {
    transitions,
    keyframes,
  },
} as const;

// Theme selector utility
export function getTheme(mode: "light" | "dark"): LightTheme | DarkTheme {
  return mode === "light" ? lightTheme : darkTheme;
}
