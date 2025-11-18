import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../tokens/theme.tsx';

type Props = {
  onToggleTheme?: () => void;
  onMenuPress?: () => void;
};

export default function TopHeaderBar({ onToggleTheme, onMenuPress }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, setMode } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <View style={styles.leftRow}>
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.85} onPress={onMenuPress}>
            <Ionicons name="menu-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>STUDIFY</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => (onToggleTheme ? onToggleTheme() : setMode(theme.mode === 'dark' ? 'light' : 'dark'))}
            style={styles.toggle}
          >
            <Ionicons
              name={theme.mode === 'dark' ? 'moon-outline' : 'sunny-outline'}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1089FF',
  },
  inner: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftRow: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginLeft: 8,
  },
  right: { flexDirection: 'row', alignItems: 'center' },
  toggle: { marginLeft: 14 },
});
