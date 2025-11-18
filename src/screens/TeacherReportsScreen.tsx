import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TeacherReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Teacher Reports</Text>
      <Text style={styles.subtitle}>View-only reports and analytics.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#0B1229' },
  subtitle: { marginTop: 8, fontSize: 14, color: '#606D8A' },
});