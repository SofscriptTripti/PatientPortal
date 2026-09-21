import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  THEME_COLOR_OPTIONS,
  ThemeColorOption,
  getPaletteForOption,
} from './themeColors';

export type AppTheme = 'Light' | 'Dark';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accent: string;
  cardBg: string;
  divider: string;
  colorOptionId: string;
}

export const buildThemeColors = (
  themeMode: AppTheme,
  colorOptionId: string = 'cyan'
): ThemeColors => {
  const isDark = themeMode === 'Dark';
  const palette = getPaletteForOption(themeMode, colorOptionId);

  if (isDark) {
    return {
      isDark: true,
      background: '#0B132B',
      surface: '#1E293B',
      surfaceVariant: '#162032',
      border: '#334155',
      borderLight: '#243248',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      primary: palette.primary,
      primaryLight: palette.primaryLight,
      accent: palette.accent,
      cardBg: '#1E293B',
      divider: '#334155',
      colorOptionId,
    };
  }

  return {
    isDark: false,
    background: '#EDF5F8',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    textPrimary: '#0F253E',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    accent: palette.accent,
    cardBg: '#FFFFFF',
    divider: '#E2E8F0',
    colorOptionId,
  };
};

export const lightColors: ThemeColors = buildThemeColors('Light', 'cyan');
export const darkColors: ThemeColors = buildThemeColors('Dark', 'cyan');

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  colorOptionId: string;
  setColorOptionId: (id: string) => void;
  colorOptions: ThemeColorOption[];
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'Light',
  setTheme: () => {},
  toggleTheme: () => {},
  colorOptionId: 'cyan',
  setColorOptionId: () => {},
  colorOptions: THEME_COLOR_OPTIONS,
  isDark: false,
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>('Light');
  const [colorOptionId, setColorOptionId] = useState<string>('cyan');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'Light' ? 'Dark' : 'Light'));
  };

  const isDark = theme === 'Dark';
  const colors = buildThemeColors(theme, colorOptionId);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        colorOptionId,
        setColorOptionId,
        colorOptions: THEME_COLOR_OPTIONS,
        isDark,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => useContext(ThemeContext);

export default ThemeContext;
