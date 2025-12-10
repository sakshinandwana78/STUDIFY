import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
// Static styling: remove theme dependency to prevent dynamic recoloring
import { useAvatar } from '../ui/providers/AvatarProvider';

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

type Props = { backgroundColor?: string };
export default function BottomNavBar({ backgroundColor }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { avatarUri } = useAvatar();

  const scales = React.useMemo(
    () => ({
      Home: new Animated.Value(1),
      StudentLessons: new Animated.Value(1),
      ARCamera: new Animated.Value(1),
      Settings: new Animated.Value(1),
      Profile: new Animated.Value(1),
    }),
    []
  );

  const animate = (key: TabItem['key'], to: number) => {
    Animated.timing(scales[key], { toValue: to, duration: 160, useNativeDriver: true }).start();
  };

  // Resolve current active route name robustly (handles nested state)
  const resolveActiveRoute = (state: any): string => {
    if (!state || !state.routes || state.routes.length === 0) return route.name;
    const i = state.index ?? 0;
    const r = state.routes[i];
    return r?.state ? resolveActiveRoute(r.state) : r?.name ?? route.name;
  };
  const navState = useNavigationState((s) => s);
  const activeRouteName = resolveActiveRoute(navState);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: backgroundColor ?? '#FFFFFF',
        },
      ]}
    >
      {items.map((item) => {
        const active = activeRouteName === item.key;
        const activeColor = '#0A6B8E';
        const inactiveColor = '#6B7280';
        const color = active ? activeColor : inactiveColor;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => navigation.navigate(item.key as never)}
            onPressIn={() => animate(item.key, 0.97)}
            onPressOut={() => animate(item.key, 1)}
            activeOpacity={0.85}
          >
            <Animated.View
              style={[
                styles.iconWrap,
                { transform: [{ scale: scales[item.key] }] },
              ]}
            >
              {item.useImage ? (
                <Image
                  source={avatarUri ? { uri: avatarUri } : require('../../assets/android-profile-icon-2.jpg')}
                  style={[
                    styles.profileIcon,
                    active && styles.activeProfile,
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name={item.icon!} size={24} color={color} />
              )}
            </Animated.View>
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
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    // subtle top shadow for elevated nav on tinted background
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {},
  
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 13,
    borderWidth: 0,
  },
  activeProfile: { borderColor: '#0A6B8E' },
});
