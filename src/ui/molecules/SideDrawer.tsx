import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../atoms/Text';
import { theme } from '../tokens/theme';

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onEditProfile?: () => void;
};

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = Math.round(width * 0.58); // 50–60% width

const menuItems = [
  { key: 'editProfile', label: 'Edit Profile', icon: 'person-outline' as const },
  { key: 'courses', label: 'Courses', icon: 'book-outline' as const },
  { key: 'performance', label: 'Performance', icon: 'stats-chart-outline' as const },
  { key: 'payments', label: 'Payments', icon: 'card-outline' as const },
  { key: 'privacy', label: 'Privacy Policy', icon: 'shield-checkmark-outline' as const },
  { key: 'support', label: 'Help & Support', icon: 'headset-outline' as const },
  { key: 'logout', label: 'Logout', icon: 'log-out-outline' as const },
];

const SideDrawer: React.FC<Props> = ({ open, onClose, onLogout, onEditProfile }) => {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  if (!open) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      {/* Tap outside to close */}
      <Pressable style={styles.touchOutside} onPress={onClose} />

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <View style={styles.drawerHeader}>
          <Text variant="subtitle" weight="bold" style={styles.drawerTitle}>Menu</Text>
        </View>
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.menuItem}
              activeOpacity={0.85}
              onPress={() => {
                if (item.key === 'logout') {
                  // Delegate to parent to avoid coupling this UI to auth logic
                  try { onLogout && onLogout(); } catch {}
                  return;
                }
                if (item.key === 'editProfile') {
                  try { onEditProfile && onEditProfile(); } catch {}
                  onClose();
                  return;
                }
              }}
            >
              <Ionicons name={item.icon} size={26} color={'#0F172A'} style={styles.menuIcon} />
              <Text variant="body" style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 50,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.32)', // dimmed backdrop (subtle)
  },
  touchOutside: {
    position: 'absolute',
    left: DRAWER_WIDTH,
    right: 0,
    top: 0,
    bottom: 0,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.card,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 6, height: 0 },
    elevation: 6,
  },
  drawerHeader: {
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E9F2',
  },
  drawerTitle: { color: '#0F172A' },
  menuList: { paddingVertical: 6 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E9F2',
  },
  menuIcon: { marginRight: 12 },
  menuLabel: { color: '#0F172A' },
});

export default SideDrawer;
