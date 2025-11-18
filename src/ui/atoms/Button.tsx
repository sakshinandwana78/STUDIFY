import React from 'react';
import { TouchableOpacity, ViewStyle, TextStyle, StyleSheet, View } from 'react-native';
import Text from './Text';
import { Colors, Gradients } from '../tokens/colors';
import Gradient from './Gradient';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const Button: React.FC<Props> = ({ title, onPress, variant = 'primary', style, textStyle, disabled }) => {
  if (variant === 'primary' || variant === 'secondary') {
    const grad = variant === 'primary' ? Gradients.primary : Gradients.secondary;
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={disabled} style={[styles.touch, disabled && styles.disabledTouch, style]}>
        <Gradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, styles.gradient]}
        >
          <Text variant="label" weight="bold" color="#fff" style={[styles.text, textStyle]}>
            {title}
          </Text>
        </Gradient>
      </TouchableOpacity>
    );
  }

  const scheme = variant === 'outline' ? styles.outline : styles.ghost;
  const textColor = variant === 'outline' ? Colors.textPrimary : Colors.textSecondary;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={disabled} style={[styles.touch, disabled && styles.disabledTouch, style]}>
      <View style={[styles.button, scheme]}>
        <Text variant="label" weight="medium" color={textColor} style={[styles.text, textStyle]}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touch: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  disabledTouch: { opacity: 0.6 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  outline: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  ghost: {
    backgroundColor: Colors.backgroundAlt,
  },
  text: {
    letterSpacing: 0.25,
  },
});

export default Button;