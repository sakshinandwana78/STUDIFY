import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../tokens/colors';
import Text from '../atoms/Text';
import { useNavigation } from '@react-navigation/native';

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const items: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home', route: 'Home' },
  { key: 'ar', label: 'AR', icon: 'camera', route: 'ARCamera' },
  { key: 'library', label: 'Library', icon: 'library', route: 'ARLibrary' },
  { key: 'downloads', label: 'Downloads', icon: 'download', route: 'Downloads' },
  { key: 'settings', label: 'Settings', icon: 'settings', route: 'Settings' },
];

const FloatingTabBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {items.map((item) => (
        <TouchableOpacity key={item.key} style={styles.item} onPress={() => navigation.navigate(item.route as never)} activeOpacity={0.9}>
          <Ionicons name={item.icon} size={20} color={Colors.textSecondary} />
          <Text variant="caption" weight="medium" color={Colors.textSecondary} style={{ marginTop: 4 }}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: Colors.card,
    borderColor: Colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 22,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
});

export default FloatingTabBar;