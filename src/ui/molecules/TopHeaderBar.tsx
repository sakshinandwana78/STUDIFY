import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../tokens/theme';

type Props = {
  onToggleTheme?: () => void;
  onMenuPress?: () => void;
};

export default function TopHeaderBar({ onToggleTheme, onMenuPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <View style={styles.leftRow}>
          <TouchableOpacity style={styles.menuBtn} activeOpacity={0.85} onPress={onMenuPress}>
            <Ionicons name="menu-outline" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.appName}>STUDIFY</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => (onToggleTheme ? onToggleTheme() : undefined)}
            style={styles.toggle}
          >
            <Ionicons name={'sunny-outline'} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // background overridden via theme
    backgroundColor: '#283763',
  },
  inner: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    paddingLeft: 16,
  },
  leftRow: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  appName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.8,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginLeft: 6,
  },
  right: { flexDirection: 'row', alignItems: 'center' },
  toggle: { marginLeft: 14 },
});
