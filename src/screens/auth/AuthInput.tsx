import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../ui/tokens/theme';

type Props = {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  isPassword?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  // visual variant: default is dark. Use 'light' for white cards.
  variant?: 'dark' | 'light';
};

const AuthInput: React.FC<Props> = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  isPassword = false,
  icon,
  variant = 'dark',
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isLight = variant === 'light';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, isLight && styles.labelLight]}>{label}</Text>
      <View style={[styles.field, isLight && styles.fieldLight, focused && styles.fieldFocused]}>
        {icon && (
          <Ionicons name={icon} size={18} color={isLight ? theme.colors.textDark : theme.colors.secondaryBg} style={{ marginRight: 8 }} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={isLight ? theme.colors.subtleText : theme.colors.lightText}
          secureTextEntry={isPassword ? !showPassword : false}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          keyboardType={keyboardType}
          style={[styles.input, isLight && styles.inputLight]}
        />
        {isPassword && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Toggle password visibility"
            onPress={() => setShowPassword((s) => !s)}
            style={styles.toggle}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={isLight ? '#0F172A' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { color: theme.colors.secondaryBg, fontSize: 13, fontWeight: '600', marginBottom: 8 },
  labelLight: { color: theme.colors.textDark },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: theme.colors.primaryBg,
  },
  fieldLight: {
    borderColor: theme.colors.cardBorder,
    backgroundColor: '#FAFCFF',
  },
  fieldFocused: { borderColor: theme.colors.accentBlue, shadowColor: theme.colors.shadow, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  input: { flex: 1, color: theme.colors.secondaryBg, fontSize: 14 },
  inputLight: { color: theme.colors.textDark },
  toggle: { marginLeft: 8, padding: 4 },
});

export default AuthInput;
