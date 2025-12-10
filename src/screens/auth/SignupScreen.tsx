import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground, ScrollView, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../ui/tokens/theme';
import AuthInput from './AuthInput';
// NEW: Modular auth service (Firebase). Does not touch AR features.
import { signUp } from '../../auth/AuthService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AuthStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

// Full-screen background (second Email/Username illustration)
const bgSignup = require('../../../assets/Copy of STUDIFY.png');
// Illustration shown above the sign up form
const illSignup = require('../../../assets/Sign up-amico (1).png');

export default function SignupScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const insets = useSafeAreaInsets();

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

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground source={bgSignup} style={styles.bg} resizeMode="cover">
        <ScrollView contentContainerStyle={[styles.overlay, { paddingBottom: insets.bottom + 56, paddingTop: insets.top + 8 }]} keyboardShouldPersistTaps="handled">
          {/* Form stacked directly on background, consistent with Sign In */}
          {/* Illustration only at the top (title/subtitle removed) */}
          <Image source={illSignup} style={styles.illustration} resizeMode="contain" />

          <View style={styles.form}>

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
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: { flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 24 },
  illustration: { width: '75%', height: 180, alignSelf: 'center', marginBottom: 12 },
  form: { width: '92%', maxWidth: 420 },
  primary: {
    marginTop: 12,
    backgroundColor: '#3f60a0',
    borderRadius: 16,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryLabel: { color: theme.colors.secondaryBg, fontSize: 16, fontWeight: '700' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  bottomText: { color: theme.colors.subtleText, fontSize: 13, marginRight: 6 },
  bottomLink: { color: theme.colors.accentBlue, fontSize: 13, fontWeight: '600' },
});
