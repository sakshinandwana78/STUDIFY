import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../ui/tokens/theme';
import type { ReactElement } from 'react';

type FeatureCardProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accentColor?: string;
  disabled?: boolean;
  brandIcon?: ReactElement;
};

export default function FeatureCard({ title, icon, onPress, accentColor, disabled, brandIcon }: FeatureCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={disabled}
    >
      <View style={styles.iconWrap}>
        {brandIcon ? <View style={styles.brandIconScale}>{brandIcon}</View> : (
          <Ionicons name={icon} size={40} color={theme.colors.brandBlack} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 122,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md, // moderate rounding for classic premium cards
    backgroundColor: theme.colors.card, // clean flat white
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle, clean elevation
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.softSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.cardBorder,
    marginTop: 6,
    marginBottom: 8,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  brandIconScale: {
    transform: [{ scale: 1.45 }],
  },
  title: {
    color: theme.colors.primary,
    fontSize: 12,
    lineHeight: 16,
    includeFontPadding: false,
    fontWeight: '700',
    textAlign: 'center',
  },
});
