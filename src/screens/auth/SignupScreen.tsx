import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../ui/tokens/theme';
import AuthInput from './AuthInput';
// NEW: Modular auth service (Firebase). Does not touch AR features.
import { signUp } from '../../auth/AuthService';

export type AuthStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleCreate = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter email and password.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match');
      return;
    }
    // Derive first/last from Full Name to preserve existing signUp shape
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const { user, error } = await signUp(email, password, { firstName, lastName });
    if (error) {
      Alert.alert('Sign up failed', error.message || 'Please try again.');
      return;
    }
    Alert.alert('Account created', `Welcome ${user?.displayName || user?.email || ''}`);
    navigation.replace('Login');
  };

  const illo = require('../../../assets/Sign up-amico.png');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.tint} />
      <View style={styles.card}>
        <Image source={illo} style={styles.illustration} resizeMode="contain" />
        <Text style={styles.heading}>Sign Up</Text>

        <AuthInput label="Full Name" placeholder="Jane Doe" value={fullName} onChangeText={setFullName} icon={'person-outline'} variant="light" />
        <AuthInput label="Email" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" icon={'mail-outline'} variant="light" />
        <AuthInput label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} isPassword icon={'lock-closed-outline'} variant="light" />
        <AuthInput label="Confirm Password" placeholder="••••••••" value={confirm} onChangeText={setConfirm} isPassword icon={'lock-closed-outline'} variant="light" />

        <TouchableOpacity activeOpacity={0.9} style={styles.primary} onPress={handleCreate}>
          <Text style={styles.primaryLabel}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have an account?</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.replace('Login')}>
            <Text style={styles.bottomLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0F13', padding: 24, justifyContent: 'center', alignItems: 'center' },
  tint: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255, 204, 0, 0.06)' },
  card: {
    width: '92%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  illustration: { width: '100%', height: 140, marginBottom: 8 },
  heading: { color: theme.colors.brandBlack, fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  primary: {
    marginTop: 6,
    backgroundColor: theme.colors.brandYellow,
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
  primaryLabel: { color: theme.colors.brandBlack, fontSize: 16, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  bottomText: { color: '#6E6E6E', fontSize: 13, marginRight: 6 },
  bottomLink: { color: theme.colors.brandYellow, fontSize: 13, fontWeight: '600' },
});
