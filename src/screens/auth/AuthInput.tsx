import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
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
  const isLight = variant === 'light';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, isLight && styles.labelLight]}>{label}</Text>
      <View style={[styles.field, isLight && styles.fieldLight, focused && styles.fieldFocused]}>
        {icon && (
          <Ionicons name={icon} size={18} color={isLight ? '#0F172A' : '#FFFFFF'} style={{ marginRight: 8 }} />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={isLight ? '#9CA3AF' : '#B5BCD1'}
          secureTextEntry={isPassword}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          keyboardType={keyboardType}
          style={[styles.input, isLight && styles.inputLight]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  labelLight: { color: '#0F172A' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F2A44',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#0E1630',
  },
  fieldLight: {
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  fieldFocused: { borderColor: theme.colors.brandYellow, shadowColor: theme.colors.shadow, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  input: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  inputLight: { color: '#0F172A' },
});

export default AuthInput;