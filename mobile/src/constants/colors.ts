export interface ColorTheme {
  background: string;
  surface: string;
  surfaceSubtle: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  card: string;
}

export const lightColors: ColorTheme = {
  background: '#FBF9F6', // Warm off-white
  surface: '#FFFFFF',
  surfaceSubtle: '#F3EFEA', // Soft warm gray
  primary: '#D95D39', // Terracotta / Burnt Orange
  primaryForeground: '#FFFFFF',
  secondary: '#E09F3E', // Muted Amber
  secondaryForeground: '#FFFFFF',
  foreground: '#1C1917', // Deep Charcoal
  muted: '#78716C',
  mutedForeground: '#A8A29E',
  border: '#E7E2D9',
  success: '#2E7D32',
  warning: '#D97706',
  error: '#C62828',
  card: '#FFFFFF',
};

export const darkColors: ColorTheme = {
  background: '#141210', // Deep warm charcoal
  surface: '#24201D', // Dark warm gray
  surfaceSubtle: '#2E2A26',
  primary: '#E26D46', // Terracotta
  primaryForeground: '#FFFFFF',
  secondary: '#E09F3E', // Muted warm amber
  secondaryForeground: '#FFFFFF',
  foreground: '#FBF9F6', // Warm white
  muted: '#A8A29E',
  mutedForeground: '#78716C',
  border: '#3B3530',
  success: '#4CAF50',
  warning: '#F59E0B',
  error: '#EF5350',
  card: '#24201D',
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};

export default colors;
