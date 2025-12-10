import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, Alert, ImageBackground, ScrollView, Image, Animated } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../../ui/tokens/theme';
import AuthInput from './AuthInput';
// NEW: Modular auth service (Firebase). Does not touch AR features.
import { signIn } from '../../auth/AuthService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type AuthStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// Full-screen background (Email/Username illustration)
const bgLogin = require('../../../assets/Copy of STUDIFY.png');
// Illustration shown above the form
const illLogin = require('../../../assets/Login-cuate (1).png');

export default function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const insets = useSafeAreaInsets();
  // Top popup toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-16)).current;
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mapErrorToMessage = (code?: string): string => {
    const c = String(code || '').toLowerCase();
    if (!c || c === 'auth_error') return 'Unable to sign in. Please try again.';
    if (c.includes('invalid-email') || c.includes('user-not-found')) {
      return 'Invalid email or account does not exist.';
    }
    if (c.includes('wrong-password')) {
      return 'Incorrect password. Please try again.';
    }
    if (c.includes('network-request-failed')) {
      return 'Unable to sign in. Please try again.';
    }
    if (c.includes('too-many-requests')) {
      return 'Unable to sign in. Please try again.';
    }
    if (c.includes('config')) {
      return 'Unable to sign in. Please try again.';
    }
    return 'Unable to sign in. Please try again.';
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(toastTranslateY, { toValue: -16, duration: 160, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(toastTranslateY, { toValue: 0, useNativeDriver: true, friction: 14 }),
    ]).start();
    toastTimerRef.current = setTimeout(() => {
      dismissToast();
    }, 2400);
  };

  useEffect(() => {
    const unsubscribeBlur = navigation.addListener('blur', () => {
      dismissToast();
    });
    return unsubscribeBlur;
  }, [navigation]);

  const handleLogin = async () => {
    if (!identifier || !password) {
      showToast('Please enter email and password.');
      return;
    }
    const { user, error } = await signIn(identifier, password);
    if (error) {
      const msg = mapErrorToMessage(error.code);
      showToast(msg);
      return;
    }
    // Hide any previous error and proceed as usual
    dismissToast();
    Alert.alert('Welcome', `Signed in as ${user?.email ?? 'user'}`);
    navigation.getParent()?.navigate('Home' as never);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ImageBackground source={bgLogin} style={styles.bg} resizeMode="cover">
        <ScrollView contentContainerStyle={[styles.overlay, { paddingBottom: insets.bottom + 56, paddingTop: insets.top + 8 }]}
          keyboardShouldPersistTaps="handled">
          {/* Form stacked directly on background, below decorative top area */}
          {/* Heading, subtitle, and illustration */}
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>To continue using this app, please sign in first.</Text>
          <Image source={illLogin} style={styles.illustration} resizeMode="contain" />

          <View style={styles.form}>

        <AuthInput
          label="Email or Username"
          placeholder="you@example.com"
          value={identifier}
          onChangeText={setIdentifier}
          keyboardType="email-address"
          icon={'mail-outline'}
          variant="light"
        />

        <AuthInput
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
          icon={'lock-closed-outline'}
          variant="light"
        />

        <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ForgotPassword')} style={styles.linkWrap}>
          <Text style={styles.link}>Forgot your password?</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.9} style={styles.primary} onPress={handleLogin}>
          <Text style={styles.primaryLabel}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Don’t have an account?</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.replace('Signup')}>
            <Text style={styles.bottomLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
          </View>
        </ScrollView>
        {/* Top popup toast for login errors */}
        {toastVisible && (
          <Animated.View
            style={[
              styles.toast,
              {
                top: insets.top + 8,
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
              },
            ]}
          >
            <Ionicons name="information-circle-outline" size={20} color="#6286CB" style={styles.toastIcon} />
            <Text style={styles.toastText} numberOfLines={2}>{toastMessage}</Text>
          </Animated.View>
        )}
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
  illustration: { width: '75%', height: 200, alignSelf: 'center', marginBottom: 16 },
  form: { width: '92%', maxWidth: 420 },
  // Top popup toast styles
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignSelf: 'center',
    backgroundColor: '#F4F7FB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    // soft shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 1000,
  },
  toastIcon: { marginRight: 8 },
  toastText: {
    color: '#3F60A0',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
  },
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
  linkWrap: { alignItems: 'center', marginTop: 12 },
  link: { color: theme.colors.accentBlue, fontSize: 13, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 14 },
  bottomText: { color: theme.colors.subtleText, fontSize: 13, marginRight: 6 },
  bottomLink: { color: theme.colors.accentBlue, fontSize: 13, fontWeight: '600' },
});
