import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemeMode = 'dark' | 'light';

export type Theme = {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryAlt: string;
    onPrimary: string;
    secondary: string;
    secondaryAlt: string;
    background: string;
    backgroundAlt: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    card: string;
    muted: string;
    success: string;
    warning: string;
    danger: string;
    header: string;
    buttonPrimary: string;
    navBackground: string;
    navActive: string;
    navInactive: string;
  };
  gradients: {
    primary: string[];
    secondary: string[];
    surface: string[];
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
    };
    size: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    lineHeight: {
      sm: number;
      md: number;
      lg: number;
    };
  };
};

const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: '#8FB4FF',
    primaryAlt: '#4B6CB7',
    onPrimary: '#FFFFFF',
    secondary: '#22D3EE',
    secondaryAlt: '#A855F7',
    background: '#0E1630',
    backgroundAlt: '#111936',
    textPrimary: '#E6E9F5',
    textSecondary: '#B5BCD1',
    border: '#1F2A44',
    card: '#111936',
    muted: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    header: '#4B6CB7',
    buttonPrimary: '#4B6CB7',
    navBackground: '#0E1630',
    navActive: '#8FB4FF',
    navInactive: '#7E8FB8',
  },
  gradients: {
    // deep navy -> indigo -> violet
    primary: ['#0B1229', '#1E1B4B', '#4C1D95'],
    secondary: ['#0E1630', '#0B1229'],
    surface: ['#0F172A', '#0B1229'],
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    size: { xs: 12, sm: 14, md: 16, lg: 22, xl: 28, xxl: 34 },
    lineHeight: { sm: 18, md: 22, lg: 30 },
  },
};

const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: '#6286cb',
    primaryAlt: '#3f60a0',
    onPrimary: '#FFFFFF',
    secondary: '#22D3EE',
    secondaryAlt: '#A855F7',
    background: '#F4F7FB',
    backgroundAlt: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#3D4B6E',
    border: '#e3ebfb',
    card: '#FFFFFF',
    muted: '#94A3B8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    header: '#3f60a0',
    buttonPrimary: '#3f60a0',
    navBackground: '#FFFFFF',
    navActive: '#6286cb',
    navInactive: '#9FB3C8',
  },
  gradients: {
    primary: ['#3B82F6', '#6366F1'],
    secondary: ['#22D3EE', '#A855F7'],
    surface: ['#FFFFFF', '#F8FAFC'],
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    size: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 },
    lineHeight: { sm: 18, md: 22, lg: 28 },
  },
};

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  setTheme: (m: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  mode: 'light',
  setMode: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = 'app_theme_mode';

export const ThemeProvider: React.FC<{ initialMode?: ThemeMode; children?: React.ReactNode }> = ({
  initialMode = 'light',
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  // Hydrate from persistence once; fall back to system only once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (saved === 'light' || saved === 'dark')) {
          setMode(saved);
          return;
        }
      } catch {}
      try {
        const sys = Appearance?.getColorScheme?.();
        if (!cancelled && (sys === 'dark' || sys === 'light')) {
          setMode(sys as ThemeMode);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  }, [mode]);

  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);
  const setTheme = (m: ThemeMode) => setMode(m);
  const toggleTheme = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
