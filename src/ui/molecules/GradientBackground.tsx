import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../tokens/theme';

type Props = {
  children?: React.ReactNode;
};

// Lightweight, library-free vertical gradient using layered translucent bands.
// Top is a very light blue that fades to white towards the bottom.
export default function GradientBackground({ children }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.gradient} pointerEvents="none">
        <View style={styles.band1} />
        <View style={styles.band2} />
        <View style={styles.band3} />
        <View style={styles.band4} />
        <View style={styles.band5} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // Light grey base for the home page background
    backgroundColor: theme.colors.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  // Subtle neutral bands to keep depth without color cast
  band1: { flex: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  band2: { flex: 2, backgroundColor: 'rgba(255, 255, 255, 0.04)' },
  band3: { flex: 2, backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  band4: { flex: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' },
  band5: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.015)' },
});