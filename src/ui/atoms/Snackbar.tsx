import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Text from './Text';
import { theme } from '../tokens/theme';

type SnackbarProps = {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number; // ms
  onHide?: () => void;
};

const Snackbar: React.FC<SnackbarProps> = ({ visible, message, type = 'info', duration = 1400, onHide }) => {
  const translateY = useRef(new Animated.Value(80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      const t = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 80, duration: 220, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide && onHide());
      }, duration);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const bg = type === 'success' ? theme.colors.accentGreen
    : type === 'error' ? '#EF4444'
    : '#0EA5E9';

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.snack, { backgroundColor: bg, opacity, transform: [{ translateY }] }]}>
        <Text variant="body" weight="bold" style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    zIndex: 100,
  },
  snack: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.lg,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  text: { color: '#FFFFFF' },
});

export default Snackbar;