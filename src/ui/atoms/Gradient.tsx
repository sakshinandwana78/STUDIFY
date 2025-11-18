import React from 'react';
import { View, ViewStyle } from 'react-native';
import { LinearGradient as LG } from 'expo-linear-gradient';

interface Props {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
}

// Safe gradient wrapper: uses expo-linear-gradient when available, otherwise falls back to a solid background
const Gradient: React.FC<Props> = ({ colors, start, end, style, children }) => {
  const isLGAvailable = typeof LG === 'function' || (LG as any)?.render;
  if (isLGAvailable) {
    return (
      <LG colors={colors} start={start} end={end} style={style as any}>
        {children}
      </LG>
    );
  }
  return (
    <View style={[{ backgroundColor: colors?.[0] ?? '#000' }, style as any]}>{children}</View>
  );
};

export default Gradient;