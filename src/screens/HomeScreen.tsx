import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeatureCard from '../components/FeatureCard';
import BottomNavBar from '../components/BottomNavBar';
import { theme } from '../ui/tokens/theme';
import { ThemeProvider } from '../ui/tokens/theme.tsx';
import GradientBackground from '../ui/molecules/GradientBackground';
import FeatureSection from '../ui/molecules/FeatureSection';
import TopHeaderBar from '../ui/molecules/TopHeaderBar';
import SideDrawer from '../ui/molecules/SideDrawer';

type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ARCamera: undefined;
  StudentLessons: undefined;
  Quiz: undefined;
  OfflineDownloads: undefined;
  TeacherReports: undefined;
  AdminLiteFlags: undefined;
  Settings: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const logoSource = useMemo(() => require('../../assets/STUDIFY (1).png'), []);
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const learning = useMemo(
    () => [
      { key: 'StudentLessons', title: 'Start Lesson', icon: 'book-outline' as const, accent: theme.colors.accentBlue },
      { key: 'Quiz', title: 'Take Quiz', icon: 'clipboard-outline' as const, accent: theme.colors.accentTeal },
    ],
    []
  );

  const resources = useMemo(
    () => [
      { key: 'OfflineDownloads', title: 'Download Offline', icon: 'cloud-download-outline' as const, accent: theme.colors.accentOrange },
      { key: 'ARCamera', title: 'AR Player', icon: 'camera-outline' as const, accent: theme.colors.accentPink },
    ],
    []
  );

  const teacherPanel = useMemo(
    () => [
      { key: 'TeacherReports', title: 'Teacher Reports', icon: 'stats-chart-outline' as const, accent: theme.colors.accentPurple },
      { key: 'AdminLiteFlags', title: 'Admin Flags', icon: 'flag-outline' as const, accent: theme.colors.accentGray },
    ],
    []
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ThemeProvider initialMode={'light'}>
          <View style={styles.container}>
            <TopHeaderBar onMenuPress={() => setDrawerOpen(true)} />
            <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
              <View style={styles.header}>
                <Image source={logoSource} style={styles.logo} resizeMode="contain" />
                <Text style={styles.welcomeTitle}>Welcome to STUDIFY</Text>
                <Text style={styles.welcomeSubtitle}>Empowering Learning Through AR</Text>
              </View>

              <View style={[styles.groupCard, { marginBottom: insets.bottom + 72 }]}>
                <FeatureSection
                  title="Learning"
                  items={learning.map((item) => ({
                    title: item.title,
                    icon: item.icon,
                    accentColor: item.accent,
                    onPress: () => navigation.navigate(item.key as any),
                  }))}
                />

                <FeatureSection
                  title="Resources"
                  items={resources.map((item) => ({
                    title: item.title,
                    icon: item.icon,
                    accentColor: item.accent,
                    onPress: () => navigation.navigate(item.key as any),
                  }))}
                />

                <FeatureSection
                  title="Teacher Panel"
                  items={teacherPanel.map((item) => ({
                    title: item.title,
                    icon: item.icon,
                    accentColor: item.accent,
                    onPress: () => navigation.navigate(item.key as any),
                  }))}
                />
              </View>
            </View>

            <BottomNavBar />
            <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </View>
        </ThemeProvider>
      </SafeAreaView>
    </GradientBackground>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 0,
  },
  logo: {
    width: Math.min(180, width * 0.5),
    height: Math.min(180, width * 0.5),
    borderRadius: theme.radius.lg,
    marginTop: -12,
    marginBottom: -12,
  },
  welcomeTitle: {
    marginTop: -12,
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 22,
    paddingTop: 0,
    paddingBottom: 0,
    includeFontPadding: false,
  },
  welcomeSubtitle: {
    marginTop: 4,
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 14,
    fontStyle: 'italic',
    paddingTop: 0,
    paddingBottom: 0,
    includeFontPadding: false,
  },
  groupCard: {
    marginTop: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    padding: theme.spacing.xs,
    borderRadius: 0,
    // Make container blend with home background (whitish blue)
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
});