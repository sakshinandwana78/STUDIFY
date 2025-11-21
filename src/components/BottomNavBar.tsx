import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../ui/tokens/theme';

type TabItem = {
  key: 'Home' | 'StudentLessons' | 'ARCamera' | 'Profile' | 'Settings';
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  useImage?: boolean;
};

const items: TabItem[] = [
  { key: 'Home', label: 'Home', icon: 'home-outline' },
  { key: 'StudentLessons', label: 'Lessons', icon: 'book-outline' },
  { key: 'ARCamera', label: 'AR', icon: 'camera-outline' },
  { key: 'Settings', label: 'Settings', icon: 'settings-outline' },
  { key: 'Profile', label: 'Profile', useImage: true },
];

export default function BottomNavBar() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.sm) },
      ]}
    >
      {items.map((item) => {
        const active = route.name === item.key;
        const color = active ? theme.colors.brandBlack : theme.colors.navInactiveGray;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => navigation.navigate(item.key as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              {item.useImage ? (
                <Image
                  source={require('../../assets/android-profile-icon-2.jpg')}
                  style={[styles.profileIcon, active && styles.activeProfile]}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name={item.icon!} size={26} color={color} />
              )}
            </View>
            <Text style={[styles.label, active ? styles.labelActive : null, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: '#E9ECF2',
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.md,
    // subtle shadow for elevation on Android
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 3,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: theme.colors.brandYellow,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  label: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: '600',
  },
  profileIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  activeProfile: {
    borderColor: theme.colors.brandBlack,
  },
});
