import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OfflineDownloadsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Downloads</Text>
      <Text style={styles.subtitle}>Manage your offline content.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0B1229' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#606D8A' },
});