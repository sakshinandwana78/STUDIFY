import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../ui/tokens/theme';
import Text from '../ui/atoms/Text';
import type { ImageSourcePropType } from 'react-native';
import type { ReactElement } from 'react';

type FeatureCardProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accentColor?: string;
  disabled?: boolean;
  brandIcon?: ReactElement;
  backgroundColor?: string;
  height?: number;
  iconAsset?: ImageSourcePropType;
};

export default function FeatureCard({ title, icon, onPress, accentColor, disabled, backgroundColor, height, iconAsset }: FeatureCardProps) {
  const filledIconName = (icon as string).replace('-outline', '') as keyof typeof Ionicons.glyphMap;
  const scale = React.useRef(new Animated.Value(1)).current;
  const animate = (to: number) => {
    Animated.timing(scale, { toValue: to, duration: 160, useNativeDriver: true }).start();
  };

  // Maintain original typography; only adjust spacing for visual balance.
  const effectiveHeight = typeof height === 'number' ? height : 96;
  const verticalIconMargin = Math.max(8, Math.round(effectiveHeight * 0.08));

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[
          styles.card,
          backgroundColor ? { backgroundColor } : null,
          height ? { height } : null,
          disabled && styles.cardDisabled,
        ]}
        onPress={onPress}
        onPressIn={() => animate(0.97)}
        onPressOut={() => animate(1)}
        activeOpacity={0.92}
        disabled={disabled}
      >
        {iconAsset ? (
          <Image source={iconAsset} style={[styles.iconImage, { marginTop: verticalIconMargin, marginBottom: verticalIconMargin }]} resizeMode="contain" />
        ) : (
          <Ionicons name={filledIconName} size={36} color={'#283763'} style={[styles.iconVector, { marginTop: verticalIconMargin, marginBottom: verticalIconMargin }]} />
        )}
        <Text
          variant="label"
          weight="bold"
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 96,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    // Subtle border so the card edge is perceptible on light backgrounds
    borderWidth: 1,
    borderColor: '#E5E9F2',
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle, clean elevation
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconImage: {
    width: 36,
    height: 36,
  },
  iconVector: {},
  brandIconScale: {
    transform: [{ scale: 1 }],
  },
  title: {
    color: '#0B1220',
    textAlign: 'center',
    fontSize: 12,
  },
});
