import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';

type Props = {
  label: string;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
};

const SettingsButton: React.FC<Props> = ({ label, onPress, icon }) => {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.row}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color="#1A1D1F" />
        <Text variant="body" style={styles.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color="#64748B" />
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

export default SettingsButton;