import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../ui/tokens/theme';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/android-profile-icon-2.jpg')}
        style={styles.avatar}
        resizeMode="cover"
      />
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Placeholder screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: theme.spacing.md, borderWidth: 2, borderColor: theme.colors.cardBorder },
  title: { fontSize: 22, fontWeight: '700', color: theme.colors.primary },
  subtitle: { marginTop: 8, fontSize: 14, color: theme.colors.subtleText },
});