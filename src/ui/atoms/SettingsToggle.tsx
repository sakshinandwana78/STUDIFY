import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

type Props = {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
  icon: keyof typeof Ionicons.glyphMap;
};

const SettingsToggle: React.FC<Props> = ({ label, value, onChange, icon }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onChange(!value)} style={styles.row}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color="#1A1D1F" />
        <Text variant="body" style={styles.label}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
        thumbColor={value ? '#10B981' : '#FFFFFF'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  label: { color: '#1A1D1F', marginLeft: 12 },
});

export default SettingsToggle;