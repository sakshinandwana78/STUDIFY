import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminLiteFlagsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin-Lite Flags</Text>
      <Text style={styles.subtitle}>Lightweight admin controls and flags.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0B1229' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#606D8A' },
});