import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { Colors } from '../tokens/colors';
import { Typography } from '../tokens/typography';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  weight?: 'regular' | 'medium' | 'bold';
}

const mapVariant = (variant: Variant) => {
  switch (variant) {
    case 'title':
      return { fontSize: Typography.size.xl, lineHeight: Typography.lineHeight.lg };
    case 'subtitle':
      return { fontSize: Typography.size.lg, lineHeight: Typography.lineHeight.lg };
    case 'caption':
      return { fontSize: Typography.size.xs, lineHeight: Typography.lineHeight.sm };
    case 'label':
      return { fontSize: Typography.size.sm, lineHeight: Typography.lineHeight.md };
    case 'body':
    default:
      return { fontSize: Typography.size.md, lineHeight: Typography.lineHeight.md };
  }
};

const Text: React.FC<Props> = ({ variant = 'body', color = Colors.textPrimary, weight = 'regular', style, children, ...rest }) => {
  const variantStyle = mapVariant(variant);
  const weightStyle =
    weight === 'bold' ? styles.bold : weight === 'medium' ? styles.medium : styles.regular;
  return (
    <RNText style={[styles.base, variantStyle, weightStyle, { color }, style]} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Typography.fontFamily.regular,
  },
  regular: {
    fontWeight: '400',
  },
  medium: {
    fontWeight: '600',
  },
  bold: {
    fontWeight: '700',
  },
});

export default Text;