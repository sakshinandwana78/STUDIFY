import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../ui/tokens/theme';
import AuthInput from './AuthInput';
// NEW: Modular auth service (Firebase). Does not touch AR features.
import { sendReset } from '../../auth/AuthService';

export type AuthStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');

  const handleSend = async () => {
    if (!email) {
      Alert.alert('Missing email', 'Please enter your account email.');
      return;
    }
    const { error } = await sendReset(email);
    if (error) {
      Alert.alert('Reset failed', error.message || 'Please try again.');
      return;
    }
    Alert.alert('Email sent', 'Check your inbox for the reset link.');
    navigation.replace('Login');
  };

  // Use an existing illustration to avoid bundling errors
  const illo = require('../../../assets/reading.png');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.tint} />
      <View style={styles.card}>
        <Image source={illo} style={styles.illustration} resizeMode="contain" />
        <Text style={styles.heading}>Forgot Password</Text>

        <AuthInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          icon={'mail-outline'}
          variant="light"
        />

        <TouchableOpacity activeOpacity={0.9} style={styles.primary} onPress={handleSend}>
          <Text style={styles.primaryLabel}>Send Reset Link</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.replace('Login')} style={styles.linkWrap}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.primaryBg, padding: 24, justifyContent: 'center', alignItems: 'center' },
  tint: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10, 107, 142, 0.08)' },
  card: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  illustration: { width: '100%', height: 140, marginBottom: 12 },
  heading: { color: theme.colors.textDark, fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  primary: {
    marginTop: 6,
    backgroundColor: theme.colors.accentBlue,
    borderRadius: 18,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryLabel: { color: theme.colors.secondaryBg, fontSize: 16, fontWeight: '700' },
  linkWrap: { alignItems: 'center', marginTop: 12 },
  link: { color: theme.colors.accentBlue, fontSize: 13, fontWeight: '600' },
});
