import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../tokens/colors';
import Text from '../atoms/Text';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}

const NavTile: React.FC<Props> = ({ label, icon, onPress, style }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pressIn = () => (scale.value = withSpring(0.98, { damping: 18 }));
  const pressOut = () => (scale.value = withSpring(1, { damping: 18 }));
  const hoverIn = () => (scale.value = withSpring(1.02, { damping: 18 }));
  const hoverOut = () => (scale.value = withSpring(1, { damping: 18 }));

  return (
    <Animated.View style={[animatedStyle]}>
      <Pressable
        style={[styles.tile, style]}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onHoverIn={hoverIn}
        onHoverOut={hoverOut}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        <Text variant="label" weight="medium" color={Colors.textPrimary}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#172041',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});

export default NavTile;