import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

export const lightColors: ThemeColors = {
  isDark: false,
  background: '#EDF5F8',
  surface: '#FFFFFF',
  surfaceVariant: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F253E',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  primary: '#0083B0',
  primaryLight: '#DEF0FD',
  accent: '#0083B0',
  cardBg: '#FFFFFF',
  divider: '#E2E8F0',
};

export const darkColors: ThemeColors = {
  isDark: true,
  background: '#0B132B',
  surface: '#1E293B',
  surfaceVariant: '#162032',
  border: '#334155',
  borderLight: '#243248',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#0083B0',
  primaryLight: '#1E3A5F',
  accent: '#38BDF8',
  cardBg: '#1E293B',
  divider: '#334155',
};

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'Light',
  setTheme: () => {},
  toggleTheme: () => {},
  isDark: false,
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>('Light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'Light' ? 'Dark' : 'Light'));
  };

  const isDark = theme === 'Dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
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
