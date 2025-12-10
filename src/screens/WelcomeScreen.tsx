import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../ui/tokens/theme';
import { auth } from '../auth/firebaseClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Auth: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

// Full-screen background image (case-sensitive path)
const bgImg = require('../../assets/STUDIFY (20).png');

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={bgImg} style={styles.bg} resizeMode="cover">
        <View style={[styles.overlay, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cta}
            onPress={() => {
              const isLoggedIn = !!auth && !!auth.currentUser;
              navigation.reset({ index: 0, routes: [{ name: isLoggedIn ? 'MainTabs' : 'Auth' }] });
            }}
          >
            <Text style={styles.ctaLabel}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cta: {
    width: '65%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3f60a0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaLabel: {
    color: theme.colors.secondaryBg,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
});
