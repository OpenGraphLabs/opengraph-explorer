import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getTheme } from "./themes";
import type { ThemeContextType, ThemeMode } from "./types";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = "light" }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first, then use defaultMode
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("opengraph-theme-mode");
      return (saved as ThemeMode) || defaultMode;
    }
    return defaultMode;
  });

  const theme = getTheme(mode);

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Save to localStorage when mode changes
  useEffect(() => {
    localStorage.setItem("opengraph-theme-mode", mode);
  }, [mode]);

  // Apply CSS custom properties to root
  useEffect(() => {
    const root = document.documentElement;

    // Remove all existing theme properties
    const removeProperty = (prop: string) => root.style.removeProperty(prop);

    // Background colors
    removeProperty("--og-bg-primary");
    removeProperty("--og-bg-secondary");
    removeProperty("--og-bg-tertiary");
    removeProperty("--og-bg-card");
    removeProperty("--og-bg-overlay");
    removeProperty("--og-bg-accent");

    // Text colors
    removeProperty("--og-text-primary");
    removeProperty("--og-text-secondary");
    removeProperty("--og-text-tertiary");
    removeProperty("--og-text-inverse");
    removeProperty("--og-text-brand");
    removeProperty("--og-text-muted");

    // Border colors
    removeProperty("--og-border-primary");
    removeProperty("--og-border-secondary");
    removeProperty("--og-border-brand");
    removeProperty("--og-border-focus");

    // Interactive colors
    removeProperty("--og-interactive-primary");
    removeProperty("--og-interactive-primary-hover");
    removeProperty("--og-interactive-primary-active");
    removeProperty("--og-interactive-secondary");
    removeProperty("--og-interactive-secondary-hover");
    removeProperty("--og-interactive-disabled");

    // Status colors
    removeProperty("--og-status-success");
    removeProperty("--og-status-warning");
    removeProperty("--og-status-error");
    removeProperty("--og-status-info");

    // Gradients
    removeProperty("--og-gradient-primary");
    removeProperty("--og-gradient-primary-light");
    removeProperty("--og-gradient-secondary");
    removeProperty("--og-gradient-warm");
    removeProperty("--og-gradient-cool");
    removeProperty("--og-gradient-success");

    // Shadows
    removeProperty("--og-shadow-xs");
    removeProperty("--og-shadow-sm");
    removeProperty("--og-shadow-md");
    removeProperty("--og-shadow-lg");
    removeProperty("--og-shadow-xl");
    removeProperty("--og-shadow-2xl");

    // Apply new theme properties
    const setProperty = (prop: string, value: string) => root.style.setProperty(prop, value);

    // Background colors
    setProperty("--og-bg-primary", theme.colors.background.primary);
    setProperty("--og-bg-secondary", theme.colors.background.secondary);
    setProperty("--og-bg-tertiary", theme.colors.background.tertiary);
    setProperty("--og-bg-card", theme.colors.background.card);
    setProperty("--og-bg-overlay", theme.colors.background.overlay);
    setProperty("--og-bg-accent", theme.colors.background.accent);

    // Text colors
    setProperty("--og-text-primary", theme.colors.text.primary);
    setProperty("--og-text-secondary", theme.colors.text.secondary);
    setProperty("--og-text-tertiary", theme.colors.text.tertiary);
    setProperty("--og-text-inverse", theme.colors.text.inverse);
    setProperty("--og-text-brand", theme.colors.text.brand);
    setProperty("--og-text-muted", theme.colors.text.muted);

    // Border colors
    setProperty("--og-border-primary", theme.colors.border.primary);
    setProperty("--og-border-secondary", theme.colors.border.secondary);
    setProperty("--og-border-brand", theme.colors.border.brand);
    setProperty("--og-border-focus", theme.colors.border.focus);

    // Interactive colors
    setProperty("--og-interactive-primary", theme.colors.interactive.primary);
    setProperty("--og-interactive-primary-hover", theme.colors.interactive.primaryHover);
    setProperty("--og-interactive-primary-active", theme.colors.interactive.primaryActive);
    setProperty("--og-interactive-secondary", theme.colors.interactive.secondary);
    setProperty("--og-interactive-secondary-hover", theme.colors.interactive.secondaryHover);
    setProperty("--og-interactive-disabled", theme.colors.interactive.disabled);

    // Status colors
    setProperty("--og-status-success", theme.colors.status.success);
    setProperty("--og-status-warning", theme.colors.status.warning);
    setProperty("--og-status-error", theme.colors.status.error);
    setProperty("--og-status-info", theme.colors.status.info);

    // Gradients
    setProperty("--og-gradient-primary", theme.gradients.primary);
    setProperty("--og-gradient-primary-light", theme.gradients.primary);
    setProperty("--og-gradient-secondary", theme.gradients.secondary);
    setProperty("--og-gradient-warm", theme.gradients.warm);
    setProperty("--og-gradient-cool", theme.gradients.cool);
    setProperty("--og-gradient-success", theme.gradients.success);

    // Shadows
    setProperty("--og-shadow-xs", theme.shadows.base.xs);
    setProperty("--og-shadow-sm", theme.shadows.base.sm);
    setProperty("--og-shadow-md", theme.shadows.base.md);
    setProperty("--og-shadow-lg", theme.shadows.base.lg);
    setProperty("--og-shadow-xl", theme.shadows.base.xl);
    setProperty("--og-shadow-2xl", theme.shadows.base["2xl"]);

    // Data type colors
    Object.entries(theme.colors.dataType).forEach(([key, value]) => {
      setProperty(`--og-data-${key}`, value);
    });

    // Selection styles - use theme-defined colors for consistency
    setProperty("--og-selection-bg", theme.colors.selection.background);
    setProperty("--og-selection-text", theme.colors.selection.text);

    // Set data attribute for theme-aware styling
    root.setAttribute("data-theme", mode);
    root.setAttribute("data-color-scheme", mode);
  }, [theme, mode]);

  const value = {
    theme,
    mode,
    toggleTheme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Utility hooks for getting theme-aware values
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

export function useThemeGradients() {
  const { theme } = useTheme();
  return theme.gradients;
}

export function useThemeSpacing() {
  const { theme } = useTheme();
  return theme.spacing;
}

export function useThemeShadows() {
  const { theme } = useTheme();
  return theme.shadows;
}

export function useThemeTypography() {
  const { theme } = useTheme();
  return theme.typography;
}

export function useThemeAnimations() {
  const { theme } = useTheme();
  return theme.animations;
}

export function useDataTypeColors() {
  const { theme } = useTheme();
  return theme.colors.dataType;
}
