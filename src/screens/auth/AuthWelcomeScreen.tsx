import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import { theme } from '../../ui/tokens/theme';
import GradientBackground from '../../ui/molecules/GradientBackground';
import { auth } from '../../auth/firebaseClient';

export type AuthStackParamList = {
  AuthWelcome: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'AuthWelcome'>;

const illo = require('../../../assets/Audiobook-bro.png');

export default function AuthWelcomeScreen({ navigation }: Props) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image source={illo} style={styles.image} resizeMode="contain" />
          <Text style={styles.title}>Welcome to Studify</Text>
          <Text style={styles.sub}>Sign in to sync progress and unlock personalized features.</Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.primary}
            onPress={() => {
              const isLoggedIn = !!auth && !!auth.currentUser;
              if (isLoggedIn) {
                // Reset parent (root) navigator to MainTabs (Home is initial tab)
                navigation.getParent()?.dispatch(
                  CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] })
                );
              } else {
                navigation.replace('Login');
              }
            }}
          >
            <Text style={styles.primaryLabel}>Get Started</Text>
          </TouchableOpacity>

          {/* Dev-only: temporary skip button to jump to Home */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.skip}
            onPress={() =>
              navigation.getParent()?.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] })
              )
            }
          >
            <Text style={styles.skipLabel}>Skip (dev)</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  image: { width: '90%', height: 300, marginBottom: 24 },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '700', letterSpacing: 0.2 },
  sub: { marginTop: 10, color: theme.colors.subtleText, fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 10 },
  footer: { paddingHorizontal: 20, paddingBottom: 24 },
  primary: {
    backgroundColor: theme.colors.accentBlue,
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryLabel: { color: theme.colors.secondaryBg, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  skip: { marginTop: 10, alignItems: 'center', paddingVertical: 8 },
  skipLabel: { color: '#B5BCD1', fontSize: 13 },
});
