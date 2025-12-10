import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import Text from '../atoms/Text';

export type FeatureCardProps = {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  bgColor: string;
  onPress: () => void;
  index?: number; // for staggered animation
  testID?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  widthPercent?: number; // set by grid
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  iconName,
  accentColor,
  bgColor,
  onPress,
  index = 0,
  testID,
  accessibilityLabel,
  disabled,
  widthPercent,
}) => {
  const delay = 40 + index * 50;

  const handleKeyDown = (e: any) => {
    if (Platform.OS === 'web') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onPress();
      }
    }
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay)} style={{ width: widthPercent ? `${widthPercent}%` : '47.5%' }}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        onPress={onPress}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={({ pressed, hovered, focused }) => [
          styles.card,
          focused && styles.focused,
          hovered && Platform.OS === 'web' ? styles.hovered : null,
          pressed ? styles.pressed : null,
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: bgColor }]}> 
          <Ionicons name={iconName} size={26} color={accentColor} />
        </View>
        <Text variant="label" style={styles.cardLabel} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E9F2',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
    minHeight: 110,
    marginBottom: 16,
  },
  focused: {
    borderColor: '#2563EB',
    shadowOpacity: 0.12,
  },
  hovered: {
    shadowOpacity: 0.12,
    transform: [{ translateY: -1 }],
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: { color: '#0F172A', textAlign: 'center' },
});

export default FeatureCard;
