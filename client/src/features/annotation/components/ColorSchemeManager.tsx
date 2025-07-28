import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useTheme } from "@/shared/ui/design-system";

// Professional color schemes inspired by modern design systems
export interface ColorScheme {
  name: string;
  colors: ColorDefinition[];
  description: string;
}

export interface ColorDefinition {
  id: string;
  main: string;        // Primary color
  light: string;       // Light variant for fills
  dark: string;        // Dark variant for borders
  contrast: string;    // High contrast color for text/borders
  semantic?: string;   // Semantic meaning (primary, secondary, success, warning, error)
}

// OpenGraph Professional Color Schemes
const COLOR_SCHEMES: Record<string, ColorScheme> = {
  opengraph: {
    name: "OpenGraph Professional",
    description: "Refined palette aligned with OpenGraph's brand identity",
    colors: [
      { id: "primary", main: "#2563EB", light: "#2563EB30", dark: "#1D4ED8", contrast: "#FFFFFF", semantic: "primary" },
      { id: "success", main: "#059669", light: "#05966930", dark: "#047857", contrast: "#FFFFFF", semantic: "success" },
      { id: "warning", main: "#D97706", light: "#D9770630", dark: "#B45309", contrast: "#FFFFFF", semantic: "warning" },
      { id: "error", main: "#DC2626", light: "#DC262630", dark: "#B91C1C", contrast: "#FFFFFF", semantic: "error" },
      { id: "purple", main: "#7C3AED", light: "#7C3AED30", dark: "#5B21B6", contrast: "#FFFFFF" },
      { id: "pink", main: "#DB2777", light: "#DB277730", dark: "#BE185D", contrast: "#FFFFFF" },
      { id: "teal", main: "#0891B2", light: "#0891B230", dark: "#0E7490", contrast: "#FFFFFF" },
      { id: "indigo", main: "#4F46E5", light: "#4F46E530", dark: "#3730A3", contrast: "#FFFFFF" },
      { id: "emerald", main: "#10B981", light: "#10B98130", dark: "#047857", contrast: "#FFFFFF" },
      { id: "amber", main: "#F59E0B", light: "#F59E0B30", dark: "#D97706", contrast: "#000000" },
    ],
  },
  
  sam_inspired: {
    name: "SAM Inspired",
    description: "Color palette inspired by Meta's SAM demo interface",
    colors: [
      { id: "sam-blue", main: "#007AFF", light: "#007AFF25", dark: "#005CBF", contrast: "#FFFFFF" },
      { id: "sam-red", main: "#FF3B30", light: "#FF3B3025", dark: "#D70015", contrast: "#FFFFFF" },
      { id: "sam-green", main: "#34C759", light: "#34C75925", dark: "#248A3D", contrast: "#FFFFFF" },
      { id: "sam-orange", main: "#FF9500", light: "#FF950025", dark: "#C7730A", contrast: "#FFFFFF" },
      { id: "sam-purple", main: "#AF52DE", light: "#AF52DE25", dark: "#8E44AD", contrast: "#FFFFFF" },
      { id: "sam-pink", main: "#FF2D92", light: "#FF2D9225", dark: "#E91E63", contrast: "#FFFFFF" },
      { id: "sam-teal", main: "#5AC8FA", light: "#5AC8FA25", dark: "#2196F3", contrast: "#FFFFFF" },
      { id: "sam-yellow", main: "#FFCC00", light: "#FFCC0025", dark: "#FFA000", contrast: "#000000" },
      { id: "sam-coral", main: "#FF6B6B", light: "#FF6B6B25", dark: "#E74C3C", contrast: "#FFFFFF" },
      { id: "sam-mint", main: "#4ECDC4", light: "#4ECDC425", dark: "#26A69A", contrast: "#FFFFFF" },
    ],
  },

  pastel_professional: {
    name: "Pastel Professional",
    description: "Soft, professional colors for detailed annotation work",
    colors: [
      { id: "sage", main: "#87A96B", light: "#87A96B25", dark: "#6B8E4E", contrast: "#FFFFFF" },
      { id: "lavender", main: "#B19CD9", light: "#B19CD925", dark: "#9B7AC7", contrast: "#FFFFFF" },
      { id: "peach", main: "#FFAB91", light: "#FFAB9125", dark: "#FF8A65", contrast: "#000000" },
      { id: "sky", main: "#81C784", light: "#81C78425", dark: "#66BB6A", contrast: "#FFFFFF" },
      { id: "rose", main: "#F8BBD9", light: "#F8BBD925", dark: "#F48FB1", contrast: "#000000" },
      { id: "mint", main: "#A7FFEB", light: "#A7FFEB25", dark: "#64FFDA", contrast: "#000000" },
      { id: "butter", main: "#FFF9C4", light: "#FFF9C425", dark: "#FFF176", contrast: "#000000" },
      { id: "periwinkle", main: "#B39DDB", light: "#B39DDB25", dark: "#9575CD", contrast: "#FFFFFF" },
      { id: "coral", main: "#FFCC80", light: "#FFCC8025", dark: "#FFB74D", contrast: "#000000" },
      { id: "seafoam", main: "#B2DFDB", light: "#B2DFDB25", dark: "#80CBC4", contrast: "#000000" },
    ],
  },
};

// Opacity presets for different use cases
export interface OpacityPreset {
  name: string;
  base: number;
  selected: number;
  hovered: number;
  deselected: number;
  description: string;
}

const OPACITY_PRESETS: Record<string, OpacityPreset> = {
  subtle: {
    name: "Subtle",
    base: 0.25,
    selected: 0.45,
    hovered: 0.35,
    deselected: 0.15,
    description: "Minimal overlay for detailed work",
  },
  
  balanced: {
    name: "Balanced",
    base: 0.4,
    selected: 0.65,
    hovered: 0.5,
    deselected: 0.2,
    description: "Balanced visibility and image clarity",
  },
  
  prominent: {
    name: "Prominent",
    base: 0.55,
    selected: 0.8,
    hovered: 0.65,
    deselected: 0.3,
    description: "High visibility for quick identification",
  },
  
  sam_style: {
    name: "SAM Style",
    base: 0.45,
    selected: 0.7,
    hovered: 0.55,
    deselected: 0.25,
    description: "Optimized like Meta SAM demo",
  },
};

// Color scheme context
interface ColorSchemeContextType {
  currentScheme: ColorScheme;
  currentOpacityPreset: OpacityPreset;
  availableSchemes: ColorScheme[];
  availableOpacityPresets: OpacityPreset[];
  setColorScheme: (schemeName: string) => void;
  setOpacityPreset: (presetName: string) => void;
  getColorForIndex: (index: number) => ColorDefinition;
  getOpacityForState: (state: 'base' | 'selected' | 'hovered' | 'deselected') => number;
  customOpacity: number;
  setCustomOpacity: (opacity: number) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | null>(null);

export function useColorScheme() {
  const context = useContext(ColorSchemeContext);
  if (!context) {
    throw new Error("useColorScheme must be used within a ColorSchemeProvider");
  }
  return context;
}

interface ColorSchemeProviderProps {
  children: React.ReactNode;
  defaultScheme?: string;
  defaultOpacityPreset?: string;
}

export function ColorSchemeProvider({
  children,
  defaultScheme = "opengraph",
  defaultOpacityPreset = "balanced",
}: ColorSchemeProviderProps) {
  const { theme } = useTheme();
  const [currentSchemeName, setCurrentSchemeName] = useState(defaultScheme);
  const [currentOpacityPresetName, setCurrentOpacityPresetName] = useState(defaultOpacityPreset);
  const [customOpacity, setCustomOpacity] = useState(0.45);

  const availableSchemes = useMemo(() => Object.values(COLOR_SCHEMES), []);
  const availableOpacityPresets = useMemo(() => Object.values(OPACITY_PRESETS), []);
  
  const currentScheme = useMemo(() => 
    COLOR_SCHEMES[currentSchemeName] || COLOR_SCHEMES.opengraph, 
    [currentSchemeName]
  );
  
  const currentOpacityPreset = useMemo(() => 
    OPACITY_PRESETS[currentOpacityPresetName] || OPACITY_PRESETS.balanced,
    [currentOpacityPresetName]
  );

  const setColorScheme = useCallback((schemeName: string) => {
    if (COLOR_SCHEMES[schemeName]) {
      setCurrentSchemeName(schemeName);
    }
  }, []);

  const setOpacityPreset = useCallback((presetName: string) => {
    if (OPACITY_PRESETS[presetName]) {
      setCurrentOpacityPresetName(presetName);
    }
  }, []);

  const getColorForIndex = useCallback((index: number): ColorDefinition => {
    return currentScheme.colors[index % currentScheme.colors.length];
  }, [currentScheme]);

  const getOpacityForState = useCallback((state: 'base' | 'selected' | 'hovered' | 'deselected'): number => {
    return currentOpacityPreset[state];
  }, [currentOpacityPreset]);

  const contextValue: ColorSchemeContextType = {
    currentScheme,
    currentOpacityPreset,
    availableSchemes,
    availableOpacityPresets,
    setColorScheme,
    setOpacityPreset,
    getColorForIndex,
    getOpacityForState,
    customOpacity,
    setCustomOpacity,
  };

  return (
    <ColorSchemeContext.Provider value={contextValue}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

// Color scheme control panel component
interface ColorSchemeControlsProps {
  compact?: boolean;
  showOpacitySlider?: boolean;
  className?: string;
}

export function ColorSchemeControls({
  compact = false,
  showOpacitySlider = true,
  className,
}: ColorSchemeControlsProps) {
  const { theme } = useTheme();
  const {
    currentScheme,
    currentOpacityPreset,
    availableSchemes,
    availableOpacityPresets,
    setColorScheme,
    setOpacityPreset,
    customOpacity,
    setCustomOpacity,
  } = useColorScheme();

  return (
    <div
      className={className}
      style={{
        padding: theme.spacing.semantic.component.md,
        background: theme.colors.background.card,
        borderRadius: theme.borders.radius.md,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      {!compact && (
        <div style={{ marginBottom: theme.spacing.semantic.component.md }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
            }}
          >
            Color Scheme
          </label>
          <select
            value={currentScheme.name}
            onChange={(e) => {
              const scheme = availableSchemes.find(s => s.name === e.target.value);
              if (scheme) {
                const schemeName = Object.keys(COLOR_SCHEMES).find(key => 
                  COLOR_SCHEMES[key].name === scheme.name
                );
                if (schemeName) setColorScheme(schemeName);
              }
            }}
            style={{
              width: "100%",
              padding: theme.spacing.semantic.component.sm,
              borderRadius: theme.borders.radius.sm,
              border: `1px solid ${theme.colors.border.primary}`,
              background: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              fontSize: "13px",
            }}
          >
            {availableSchemes.map(scheme => (
              <option key={scheme.name} value={scheme.name}>
                {scheme.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ marginBottom: showOpacitySlider ? theme.spacing.semantic.component.md : 0 }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.xs,
          }}
        >
          Opacity Preset
        </label>
        <select
          value={currentOpacityPreset.name}
          onChange={(e) => {
            const preset = availableOpacityPresets.find(p => p.name === e.target.value);
            if (preset) {
              const presetName = Object.keys(OPACITY_PRESETS).find(key => 
                OPACITY_PRESETS[key].name === preset.name
              );
              if (presetName) setOpacityPreset(presetName);
            }
          }}
          style={{
            width: "100%",
            padding: theme.spacing.semantic.component.sm,
            borderRadius: theme.borders.radius.sm,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: "13px",
          }}
        >
          {availableOpacityPresets.map(preset => (
            <option key={preset.name} value={preset.name}>
              {preset.name} - {preset.description}
            </option>
          ))}
        </select>
      </div>

      {showOpacitySlider && (
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
            }}
          >
            Custom Opacity: {Math.round(customOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={customOpacity}
            onChange={(e) => setCustomOpacity(parseFloat(e.target.value))}
            style={{
              width: "100%",
              height: "4px",
              borderRadius: "2px",
              background: theme.colors.background.secondary,
              outline: "none",
              cursor: "pointer",
            }}
          />
        </div>
      )}

      {/* Color Preview */}
      <div style={{ marginTop: theme.spacing.semantic.component.md }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.xs,
          }}
        >
          Preview
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
          }}
        >
          {currentScheme.colors.slice(0, compact ? 5 : 10).map((color, index) => (
            <div
              key={color.id}
              style={{
                width: compact ? "16px" : "20px",
                height: compact ? "16px" : "20px",
                borderRadius: "3px",
                background: color.main,
                border: `1px solid ${theme.colors.border.primary}`,
                flexShrink: 0,
              }}
              title={`${color.id}: ${color.main}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}