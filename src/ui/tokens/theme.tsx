import React, { createContext, useContext, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export type Theme = {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryAlt: string;
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
    primary: '#3B82F6',
    primaryAlt: '#8B5CF6',
    secondary: '#22D3EE',
    secondaryAlt: '#A855F7',
    background: '#0B1020',
    backgroundAlt: '#0E1630',
    textPrimary: '#E6E9F5',
    textSecondary: '#B5BCD1',
    border: '#1F2A44',
    card: '#111936',
    muted: '#64748B',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
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
    primary: '#3B82F6',
    primaryAlt: '#6366F1',
    secondary: '#22D3EE',
    secondaryAlt: '#A855F7',
    background: '#FFFFFF',
    backgroundAlt: '#F8FAFC',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    border: '#E5E7EB',
    card: '#FFFFFF',
    muted: '#94A3B8',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
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

const ThemeContext = createContext<{ theme: Theme; setMode: (m: ThemeMode) => void }>({
  theme: darkTheme,
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ initialMode?: ThemeMode; children?: React.ReactNode }> = ({
  initialMode = 'dark',
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const theme = useMemo(() => (mode === 'dark' ? darkTheme : lightTheme), [mode]);
  return (
    <ThemeContext.Provider value={{ theme, setMode }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);