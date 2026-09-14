import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, ColorTheme, lightColors, darkColors } from '../constants/colors';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  colors: ColorTheme;
}

const THEME_STORAGE_KEY = '@staycircle_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  setMode: async () => {},
  isDark: false,
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadPersistedTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setModeState(saved);
        }
      } catch (err) {
        console.warn('Failed to load theme preference:', err);
      } finally {
        setIsReady(true);
      }
    };
    loadPersistedTheme();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (err) {
      console.warn('Failed to save theme preference:', err);
    }
  };

  const isDark = mode === 'dark' || (mode === 'system' && deviceColorScheme === 'dark');
  const activeColors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark, colors: activeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default useTheme;
