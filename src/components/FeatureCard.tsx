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
    height: 112,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md, // moderate rounding for classic premium cards
    backgroundColor: theme.colors.card, // clean flat white
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle, clean elevation
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4, // nudge icon lower within card
    marginBottom: 6, // reduce gap to label for visual connection
  },
  brandIconScale: {
    transform: [{ scale: 1.4 }],
  },
  title: {
    color: theme.colors.primary,
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
    fontWeight: '700',
    textAlign: 'center',
  },
});