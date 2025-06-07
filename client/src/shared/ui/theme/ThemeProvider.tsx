import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, Theme, ThemeMode } from '../tokens/themes';

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'light' }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Check localStorage first, then use defaultMode
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('opengraph-theme-mode');
      return (saved as ThemeMode) || defaultMode;
    }
    return defaultMode;
  });

  const theme = mode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
  };

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Save to localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('opengraph-theme-mode', mode);
  }, [mode]);

  // Apply CSS custom properties to root
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all existing theme properties
    root.style.removeProperty('--og-bg-primary');
    root.style.removeProperty('--og-bg-secondary');
    root.style.removeProperty('--og-bg-tertiary');
    root.style.removeProperty('--og-bg-card');
    root.style.removeProperty('--og-bg-overlay');
    
    root.style.removeProperty('--og-text-primary');
    root.style.removeProperty('--og-text-secondary');
    root.style.removeProperty('--og-text-tertiary');
    root.style.removeProperty('--og-text-inverse');
    root.style.removeProperty('--og-text-brand');
    
    root.style.removeProperty('--og-border-primary');
    root.style.removeProperty('--og-border-secondary');
    root.style.removeProperty('--og-border-brand');
    
    root.style.removeProperty('--og-interactive-primary');
    root.style.removeProperty('--og-interactive-primary-hover');
    root.style.removeProperty('--og-interactive-primary-active');
    
    root.style.removeProperty('--og-gradient-primary');
    root.style.removeProperty('--og-gradient-primary-light');
    root.style.removeProperty('--og-gradient-warm');
    
    // Apply new theme properties
    root.style.setProperty('--og-bg-primary', theme.colors.background.primary);
    root.style.setProperty('--og-bg-secondary', theme.colors.background.secondary);
    root.style.setProperty('--og-bg-tertiary', theme.colors.background.tertiary);
    root.style.setProperty('--og-bg-card', theme.colors.background.card);
    root.style.setProperty('--og-bg-overlay', theme.colors.background.overlay);
    
    root.style.setProperty('--og-text-primary', theme.colors.text.primary);
    root.style.setProperty('--og-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--og-text-tertiary', theme.colors.text.tertiary);
    root.style.setProperty('--og-text-inverse', theme.colors.text.inverse);
    root.style.setProperty('--og-text-brand', theme.colors.text.brand);
    
    root.style.setProperty('--og-border-primary', theme.colors.border.primary);
    root.style.setProperty('--og-border-secondary', theme.colors.border.secondary);
    root.style.setProperty('--og-border-brand', theme.colors.border.brand);
    
    root.style.setProperty('--og-interactive-primary', theme.colors.interactive.primary);
    root.style.setProperty('--og-interactive-primary-hover', theme.colors.interactive.primaryHover);
    root.style.setProperty('--og-interactive-primary-active', theme.colors.interactive.primaryActive);
    
    root.style.setProperty('--og-gradient-primary', theme.gradients.primary);
    root.style.setProperty('--og-gradient-primary-light', theme.gradients.primaryLight);
    root.style.setProperty('--og-gradient-warm', theme.gradients.warm);
    
    // Set data attribute for theme-aware styling
    root.setAttribute('data-theme', mode);
  }, [theme, mode]);

  const value = {
    theme,
    mode,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility hook for getting theme-aware colors
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

// Utility hook for getting theme-aware gradients
export function useThemeGradients() {
  const { theme } = useTheme();
  return theme.gradients;
}

// Utility hook for getting data type colors
export function useDataTypeColors() {
  const { theme } = useTheme();
  return theme.colors.dataType;
} 