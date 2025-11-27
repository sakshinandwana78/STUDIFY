import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image, Pressable } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
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
  EditProfile: undefined;
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

  // Banner quotes and simple cycling handler
  const quotes = useMemo(
    () => [
      'Step into a new dimension of learning. Understand faster and explore deeper with interactive augmented reality.',
      'Learning that feels alive. Explore more, understand better, and stay curious every day.',
      'Experience lessons the smart way—AR makes every concept interactive and engaging for all learners.',
    ],
    []
  );
  const [quoteIndex, setQuoteIndex] = useState(0);
  const nextQuote = () => setQuoteIndex((i) => (i + 1) % quotes.length);

  const currentQuote = quotes[quoteIndex];
  const [headline, body] = useMemo(() => {
    const parts = String(currentQuote).split('. ');
    if (parts.length > 1) {
      return [parts[0], parts.slice(1).join('. ')];
    }
    return [String(currentQuote), ''];
  }, [currentQuote]);

  // Apply slightly smaller headline for the long “Experience lessons…” quote
  const isExperienceQuote = currentQuote.startsWith('Experience lessons the smart way—');

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
              <Pressable style={styles.banner} onPress={nextQuote}>
                <Svg style={styles.bannerGradientSvg} width="100%" height="100%">
              <Defs>
                <LinearGradient id="bannerGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FFE36E" stopOpacity={0.6} />
                  <Stop offset="100%" stopColor="#FFD64D" stopOpacity={0.9} />
                </LinearGradient>
              </Defs>
              <Rect x={0} y={0} width="100%" height="100%" fill="url(#bannerGrad)" />
            </Svg>
                <View style={styles.bannerContent}>
                  <View style={styles.bannerTextColumn}>
                    <Text style={[styles.bannerHeadline, isExperienceQuote && styles.bannerHeadlineSmall]}>{headline}</Text>
                    {body ? <Text style={styles.bannerBody}>{body}</Text> : null}
                  </View>
                  <Image
                    source={require('../../assets/reading.png')}
                    style={styles.bannerStickerRight}
                    resizeMode="contain"
                  />
                </View>
              </Pressable>
            {/* Hero tagline removed per request */}

            </View>

            {/* Feature grid: 2 rows x 3 columns (responsive) */}
            <View style={[styles.gridRows, { paddingBottom: insets.bottom + 136 }]}>              
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
            <SideDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              onLogout={requestLogout}
              onEditProfile={() => {
                setDrawerOpen(false);
                navigation.navigate('EditProfile');
              }}
            />

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
    paddingBottom: theme.spacing.md, // tighten gap above grid while keeping breathing room
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
    fontSize: 13,
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
  // Replacement static illustration occupying the same slot and margins
  promoImageBox: {
    width: '100%',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    // Maintain original asset aspect ratio: 1080x600 (width/height = 1.8)
    aspectRatio: 1080 / 600,
  },
  // New yellow banner that nestles under the hero illustration
  banner: {
    width: '100%',
    backgroundColor: '#FFD64D',
    borderRadius: 16,
    paddingHorizontal: theme.spacing.lg, // consistent 16dp padding on sides
    paddingVertical: theme.spacing.md,   // tightened vertical padding to curb growth
    position: 'relative',
    // Sit just below the illustration without overlap
    marginTop: 10,
    // Space before the grid so nothing overlaps
    marginBottom: theme.spacing.md,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    zIndex: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E9F2',
  },
  bannerGradientSvg: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center', // align text and sticker as a unit
    justifyContent: 'flex-start',
    paddingHorizontal: 0, // rely on outer banner padding
    paddingVertical: 0,
  },
  bannerTextColumn: {
    flex: 1,
    minWidth: 0,
    paddingRight: theme.spacing.md,
    paddingLeft: 2,
  },
  bannerHeadline: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'left',
  },
  bannerHeadlineSmall: {
    fontSize: 13,
    lineHeight: 17,
  },
  bannerBody: {
    color: theme.colors.subtleText,
    fontSize: 11,
    lineHeight: 13,
    fontStyle: 'italic',
    fontWeight: '400',
    textAlign: 'left',
    marginTop: 6,
  },
  bannerStickerRight: {
    width: 44,
    height: 44,
    marginLeft: theme.spacing.sm,
  },
  bannerHeroArt: {
    width: 96,
    height: 96,
    marginLeft: theme.spacing.md,
    alignSelf: 'center',
    flexShrink: 0,
  },
  bannerArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: theme.spacing.md,
  },
  bannerArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 20,
  },
  bannerSticker: {
    position: 'absolute',
    width: 56,
    height: 56,
    left: 12,
    top: 12,
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
    marginTop: theme.spacing.sm, // slightly closer spacing under banner
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: theme.spacing.lg,
  },
  cardCell: {
    width: '32%',
  },
});
