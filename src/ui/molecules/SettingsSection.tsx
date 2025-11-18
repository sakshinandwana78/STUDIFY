import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../atoms/Text';

type Props = {
  title: string;
  children?: React.ReactNode;
};

const SettingsSection: React.FC<Props> = ({ title, children }) => {
  return (
    <View style={styles.card}>
      <Text variant="subtitle" weight="bold" style={styles.title}>{title}</Text>
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 14,
  },
  title: { color: '#1A1D1F' },
});

export default SettingsSection;