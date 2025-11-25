import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomNavBar from '../components/BottomNavBar';
import FeatureCard from '../components/FeatureCard';
import { StartLessonIcon, TakeQuizIcon, DownloadOfflineIcon, ARPlayerIcon, TeacherReportsIcon, AdminFlagsIcon } from '../ui/atoms/BrandIcons';
import { theme } from '../ui/tokens/theme';
import { ThemeProvider, useTheme } from '../ui/tokens/theme.tsx';
import GradientBackground from '../ui/molecules/GradientBackground';
import TopHeaderBar from '../ui/molecules/TopHeaderBar';
import SideDrawer from '../ui/molecules/SideDrawer';
import ConfirmModal from '../ui/molecules/ConfirmModal';
import Snackbar from '../ui/atoms/Snackbar';
import { signOut } from '../auth/AuthService';
import { Chewy_400Regular } from '@expo-google-fonts/chewy';
import { useFonts } from 'expo-font';

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
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fontsLoaded] = useFonts({ Chewy_400Regular });
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackType, setSnackType] = useState<'success' | 'error' | 'info'>('info');

  const requestLogout = () => {
    setDrawerOpen(false);
    setLogoutConfirmVisible(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      // Proceed to Welcome regardless; persisted session is cleared
      if (error) {
        console.warn('[Auth] Sign out error:', error.message || error.code);
        setSnackMessage('Logout failed. Please try again.');
        setSnackType('error');
        setSnackVisible(true);
        setLogoutConfirmVisible(false);
        return;
      }
      // Success toast that matches app aesthetic
      setSnackMessage('Logged out successfully');
      setSnackType('success');
      setSnackVisible(true);
    } catch (e: any) {
      console.warn('[Auth] Sign out threw:', e?.message || String(e));
      setSnackMessage('Logout failed. Please try again.');
      setSnackType('error');
      setSnackVisible(true);
      setLogoutConfirmVisible(false);
      return;
    } finally {
      setLogoutConfirmVisible(false);
      // Small delay so the snackbar is visible before navigation reset
      setTimeout(() => {
        navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
      }, 900);
    }
  };

  const learning = useMemo(
    () => [
      { key: 'StudentLessons', title: 'Start Lesson', icon: 'book-outline' as const, accent: theme.colors.accentBlue, brandIcon: <StartLessonIcon size={28} /> },
      { key: 'Quiz', title: 'Take Quiz', icon: 'clipboard-outline' as const, accent: theme.colors.accentGreen, brandIcon: <TakeQuizIcon size={28} /> },
    ],
    []
  );

  const resources = useMemo(
    () => [
      { key: 'OfflineDownloads', title: 'Download Offline', icon: 'cloud-download-outline' as const, accent: theme.colors.accentCoral, brandIcon: <DownloadOfflineIcon size={28} /> },
      { key: 'ARCamera', title: 'AR Player', icon: 'camera-outline' as const, accent: theme.colors.accentTeal, brandIcon: <ARPlayerIcon size={28} /> },
    ],
    []
  );

  const teacherPanel = useMemo(
    () => [
      { key: 'TeacherReports', title: 'Teacher Reports', icon: 'stats-chart-outline' as const, accent: theme.colors.accentPurple, brandIcon: <TeacherReportsIcon size={28} /> },
      { key: 'AdminLiteFlags', title: 'Admin Flags', icon: 'flag-outline' as const, accent: theme.colors.accentGray, brandIcon: <AdminFlagsIcon size={28} /> },
    ],
    []
  );

  // After all hooks are declared, it's safe to short-circuit render
  if (!fontsLoaded) {
    return null;
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safe}>
        <ThemeProvider initialMode={'light'}>
          <View style={styles.container}>
            <TopHeaderBar onMenuPress={() => setDrawerOpen(true)} />

            {/* Hero section (centered) */}
            <View style={[styles.heroCentered, { paddingTop: insets.top + 6 }]}> 
              {/* Illustration: centered below header, revert to impactful size */}
              <View style={[styles.illustrationBox, { height: Dimensions.get('window').height * 0.25 }]}> 
                <Image
                  source={require('../../assets/ChatGPT Image Nov 20, 2025, 01_49_58 PM.png')}
                  style={styles.illustration}
                  resizeMode="cover"
                />
              </View>
              {/* Hero tagline removed per request */}

              {/* Premium horizontal promo card (between illustration and grid) */}
              <View style={styles.promoCard}>
                <View style={styles.promoLeft}>
                  <Text style={styles.promoText}>
                    Master every concept with Studify, the AR solution designed to make learning clearer, faster, and more engaging.
                  </Text>
                </View>
                <View style={styles.promoBadge}>
                  {/* Logo: replace the require path below with your logo file.
                      Example: require('../../assets/android-profile-icon-2.jpg') */}
                  <Image
                    source={require('../../assets/tudify (4).png')}
                    style={styles.promoLogo}
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>

            {/* Feature grid: 2 rows x 3 columns (responsive) */}
            <View style={[styles.gridRows, { paddingBottom: insets.bottom + 112 }]}>              
              {/* Row 1 */}
              <View style={styles.row}> 
                {[learning[0], resources[0], teacherPanel[0]].map((item) => (
                  <View key={item.key} style={styles.cardCell}>
                    <FeatureCard
                      title={item.title}
                      icon={item.icon}
                      brandIcon={item.brandIcon}
                      onPress={() => navigation.navigate(item.key as any)}
                      accentColor={item.accent}
                    />
                  </View>
                ))}
              </View>
              {/* Row 2 */}
              <View style={styles.row}> 
                {[learning[1], resources[1], teacherPanel[1]].map((item) => (
                  <View key={item.key} style={styles.cardCell}>
                    <FeatureCard
                      title={item.title}
                      icon={item.icon}
                      brandIcon={item.brandIcon}
                      onPress={() => navigation.navigate(item.key as any)}
                      accentColor={item.accent}
                    />
                  </View>
                ))}
              </View>
            </View>

            <BottomNavBar />
            <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onLogout={requestLogout} />

            {/* Confirm logout modal */}
            <ConfirmModal
              visible={logoutConfirmVisible}
              title="Confirm Logout"
              message="Are you sure you want to logout?"
              confirmLabel="Logout"
              cancelLabel="Cancel"
              onConfirm={handleLogout}
              onCancel={() => setLogoutConfirmVisible(false)}
            />

            {/* Success/error snackbar */}
            <Snackbar
              visible={snackVisible}
              message={snackMessage}
              type={snackType}
              onHide={() => setSnackVisible(false)}
            />
          </View>
        </ThemeProvider>
      </SafeAreaView>
    </GradientBackground>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F2F2F2' },
  container: {
    flex: 1,
    backgroundColor:'#F2F2F2',
  },
  content: {
    paddingTop: 0,
  },
  heroCentered: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl, // sizeable gap above grid for future content
  },
  illustrationBox: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  heroHeadline: {
    marginTop: 10,
    fontSize: 22,
    letterSpacing: 0.4,
    textAlign: 'center',
    color: theme.colors.primary,
    fontFamily: 'Chewy_400Regular',
  },
  titleCentered: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
    includeFontPadding: false,
    textAlign: 'center',
  },
  subtitleCentered: {
    marginTop: 6,
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500',
    includeFontPadding: false,
    textAlign: 'center',
  },
  // Promo card styles
  promoCard: {
    width: '100%',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    // Slightly darker grey for premium contrast
    backgroundColor: '#E6E6E6',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  promoLeft: {
    flex: 1,
    paddingRight: theme.spacing.lg,
    justifyContent: 'center',
  },
  promoText: {
    color: '#444444',
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    flexShrink: 1,
  },
  promoBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginLeft: theme.spacing.lg,
  },
  promoLogo: {
    width: 40,
    height: 40,
  },
  // CTA removed per request
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
  gridRows: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: theme.spacing.lg,
  },
  cardCell: {
    width: '31%',
  },
});
