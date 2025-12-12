import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../ui/tokens/theme';
import AuthInput from './AuthInput';
// Firebase Auth: use existing configured instance
import { auth, isFirebaseConfigured } from '../../auth/firebaseClient';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AuthStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    setInfo(null);
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Missing email', 'Please enter your account email.');
      return;
    }
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (!isFirebaseConfigured || !auth) {
      Alert.alert('Error', 'Unable to send reset email right now. Please try again later.');
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, trimmed);
      // Neutral success message (does not reveal account existence)
      setInfo('If an account exists for this email, a password reset link has been sent.');
      // Optional: keep user on this screen; they can use Back to Login
      // navigation.replace('Login');
    } catch (e: any) {
      // Treat user-not-found as neutral success to avoid disclosure
      if (e?.code === 'auth/user-not-found') {
        setInfo('If an account exists for this email, a password reset link has been sent.');
      } else {
        Alert.alert('Error', 'Unable to send reset email right now. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Use the same background as Login/Signup to keep the theme consistent
  const bgAuth = require('../../../assets/Copy of STUDIFY.png');

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground source={bgAuth} style={styles.bg} resizeMode="cover">
        <ScrollView
          contentContainerStyle={[styles.overlay, { paddingBottom: insets.bottom + 56, paddingTop: insets.top + 8 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title and subtitle aligned like Login */}
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link.</Text>

          <View style={styles.form}>
            <AuthInput
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon={'mail-outline'}
              variant="light"
            />

            <TouchableOpacity
              activeOpacity={loading ? 1 : 0.9}
              style={[styles.primary, loading && styles.primaryDisabled]}
              onPress={loading ? undefined : handleSend}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.secondaryBg} />
              ) : (
                <Text style={styles.primaryLabel}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            {info ? <Text style={styles.info}>{info}</Text> : null}

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Remembered your password?</Text>
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
  title: { color: theme.colors.textDark, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subtitle: { color: theme.colors.subtleText, fontSize: 14, fontWeight: '400', textAlign: 'center', marginBottom: 14 },
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
  primaryDisabled: { opacity: 0.7 },
  primaryLabel: { color: theme.colors.secondaryBg, fontSize: 16, fontWeight: '700' },
  info: { marginTop: 10, color: theme.colors.textDark, fontSize: 13, textAlign: 'center' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  bottomText: { color: theme.colors.subtleText, fontSize: 13, marginRight: 6 },
  bottomLink: { color: theme.colors.accentBlue, fontSize: 13, fontWeight: '600' },
});
