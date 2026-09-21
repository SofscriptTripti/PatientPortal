/**
 * Theme Color Options Registry
 * 
 * Separate, clean, and extensible theme color definition module.
 * To add more accent color options in the future:
 * Simply append a new ThemeColorOption object to the `THEME_COLOR_OPTIONS` array below!
 */

export interface ColorPalette {
  primary: string;       // Primary brand color
  primaryLight: string;  // Light tint for badge/card highlights
  accent: string;        // Accent highlight color
  gradientStart: string; // Gradient start color
  gradientEnd: string;   // Gradient end color
}

export interface ThemeColorOption {
  id: string;
  name: string;
  swatch: string; // Preview hex color used in UI swatches
  light: ColorPalette;
  dark: ColorPalette;
}

/**
 * 🎨 5 Distinct Color Options for Light and Dark Themes
 */
export const THEME_COLOR_OPTIONS: ThemeColorOption[] = [
  {
    id: 'cyan',
    name: 'Teal Cyan',
    swatch: '#0083B0',
    light: {
      primary: '#0083B0',
      primaryLight: '#DEF0FD',
      accent: '#02AAB0',
      gradientStart: '#0083B0',
      gradientEnd: '#00B4DB',
    },
    dark: {
      primary: '#02AAB0',
      primaryLight: '#1E3A5F',
      accent: '#38BDF8',
      gradientStart: '#0284C7',
      gradientEnd: '#06B6D4',
    },
  },
  {
    id: 'blue',
    name: 'Royal Blue',
    swatch: '#2563EB',
    light: {
      primary: '#2563EB',
      primaryLight: '#DBEAFE',
      accent: '#3B82F6',
      gradientStart: '#1D4ED8',
      gradientEnd: '#3B82F6',
    },
    dark: {
      primary: '#3B82F6',
      primaryLight: '#1E293B',
      accent: '#60A5FA',
      gradientStart: '#2563EB',
      gradientEnd: '#60A5FA',
    },
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    swatch: '#059669',
    light: {
      primary: '#059669',
      primaryLight: '#D1FAE5',
      accent: '#10B981',
      gradientStart: '#047857',
      gradientEnd: '#10B981',
    },
    dark: {
      primary: '#10B981',
      primaryLight: '#064E3B',
      accent: '#34D399',
      gradientStart: '#059669',
      gradientEnd: '#34D399',
    },
  },
  {
    id: 'purple',
    name: 'Amethyst Purple',
    swatch: '#7C3AED',
    light: {
      primary: '#7C3AED',
      primaryLight: '#EDE9FE',
      accent: '#8B5CF6',
      gradientStart: '#6D28D9',
      gradientEnd: '#8B5CF6',
    },
    dark: {
      primary: '#8B5CF6',
      primaryLight: '#3B0764',
      accent: '#A78BFA',
      gradientStart: '#7C3AED',
      gradientEnd: '#A78BFA',
    },
  },
  {
    id: 'rose',
    name: 'Rose Crimson',
    swatch: '#E11D48',
    light: {
      primary: '#E11D48',
      primaryLight: '#FFE4E6',
      accent: '#F43F5E',
      gradientStart: '#BE123C',
      gradientEnd: '#F43F5E',
    },
    dark: {
      primary: '#F43F5E',
      primaryLight: '#4C0519',
      accent: '#FB7185',
      gradientStart: '#E11D48',
      gradientEnd: '#FB7185',
    },
  },
];

/**
 * Helper function to retrieve specific color palette by ID and mode
 */
export const getPaletteForOption = (
  themeMode: 'Light' | 'Dark',
  colorOptionId: string = 'cyan'
): ColorPalette => {
  const found =
    THEME_COLOR_OPTIONS.find((opt) => opt.id === colorOptionId) ||
    THEME_COLOR_OPTIONS[0];
  return themeMode === 'Dark' ? found.dark : found.light;
};
