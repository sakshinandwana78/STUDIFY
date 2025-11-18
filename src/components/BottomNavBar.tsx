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
        { paddingBottom: Math.max(insets.bottom, theme.spacing.xs) },
      ]}
    >
      {items.map((item) => {
        const active = route.name === item.key;
        const color = active ? theme.colors.primary : theme.colors.subtleText;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => navigation.navigate(item.key as never)}
            activeOpacity={0.85}
          >
            {item.useImage ? (
              <Image
                source={require('../../assets/android-profile-icon-2.jpg')}
                style={[styles.profileIcon, active && styles.activeProfile]}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name={item.icon!} size={22} color={color} />
            )}
            <Text style={[styles.label, { color }]}>{item.label}</Text>
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
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.xs,
    // subtle shadow for elevation on Android
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -2 },
    elevation: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  profileIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
  },
  activeProfile: {
    borderColor: theme.colors.primary,
  },
});