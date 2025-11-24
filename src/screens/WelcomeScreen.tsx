import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '../ui/tokens/theme';
import GradientBackground from '../ui/molecules/GradientBackground';
import { auth } from '../auth/firebaseClient';

type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Auth: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

// Use the illustration from assets (case-sensitive path)
const illo = require('../../assets/Audiobook-bro.png');

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image source={illo} style={styles.image} resizeMode="contain" />
          <Text style={styles.chewyHeadline}>Transforming Learning Through AR Innovation</Text>
          <Text style={styles.subText}>
            Immerse in interactive 3D lessons, practice with smart quizzes,
            and explore models that bring complex concepts to life.
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cta}
            onPress={() => {
              const isLoggedIn = !!auth && !!auth.currentUser;
              navigation.replace(isLoggedIn ? 'Home' : 'Auth');
            }}
          >
            <Text style={styles.ctaLabel}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: '90%',
    height: 320,
    marginBottom: 28,
  },
  chewyHeadline: {
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 0.2,
    textAlign: 'center',
    fontWeight: '700',
  },
  subText: {
    marginTop: 10,
    color: theme.colors.headerGray,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cta: {
    backgroundColor: theme.colors.brandYellow,
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    // Premium, smooth elevation
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  ctaLabel: {
    color: theme.colors.brandBlack,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});