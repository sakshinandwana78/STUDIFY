import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Text from '../atoms/Text';
import { Colors } from '../tokens/colors';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title?: string;
  onProfilePress?: () => void;
}

const Header: React.FC<Props> = ({ title = 'STUDIFY', onProfilePress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={require('../../../assets/icon.png')} style={styles.logo} />
        <Text variant="title" weight="bold">{title}</Text>
      </View>
      <TouchableOpacity onPress={onProfilePress} style={styles.profile}>
        <Ionicons name="person-circle-outline" size={32} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.backgroundAlt,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 32, height: 32, borderRadius: 8, marginRight: 8 },
  profile: { padding: 4 },
});

export default Header;