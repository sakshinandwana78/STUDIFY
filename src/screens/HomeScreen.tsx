import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Dimensions, Image, ScrollView, ImageBackground } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import FeatureCard from '../components/FeatureCard';
import { StartLessonIcon, TakeQuizIcon, DownloadOfflineIcon, ARPlayerIcon, TeacherReportsIcon, AdminFlagsIcon } from '../ui/atoms/BrandIcons';
import { theme } from '../ui/tokens/theme';
import { useTheme } from '../ui/tokens/theme.tsx';
import TopHeaderBar from '../ui/molecules/TopHeaderBar';
// Removed gradient wrapper to use a clean light grey-blue root background
import SideDrawer from '../ui/molecules/SideDrawer';
import LogoutModal from '../ui/molecules/LogoutModal';
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
      { key: 'StudentLessons', title: 'Start Lesson', icon: 'book-outline' as const, accent: theme.colors.accentBlue, assetIcon: require('../../assets/icons/educational-video.png') },
      { key: 'Quiz', title: 'Take Quiz', icon: 'clipboard-outline' as const, accent: theme.colors.accentGreen, assetIcon: require('../../assets/icons/quiz.png') },
    ],
    []
  );

  const resources = useMemo(
    () => [
      { key: 'OfflineDownloads', title: 'Download Offline', icon: 'cloud-download-outline' as const, accent: theme.colors.accentCoral, assetIcon: require('../../assets/icons/play.png') },
      { key: 'ARCamera', title: 'AR Player', icon: 'camera-outline' as const, accent: theme.colors.accentTeal, assetIcon: require('../../assets/icons/virtual-reality.png') },
    ],
    []
  );

  const teacherPanel = useMemo(
    () => [
      { key: 'TeacherReports', title: 'Teacher Reports', icon: 'stats-chart-outline' as const, accent: theme.colors.accentPurple, assetIcon: require('../../assets/icons/training.png') },
      { key: 'AdminLiteFlags', title: 'Admin Flags', icon: 'flag-outline' as const, accent: theme.colors.accentGray, assetIcon: require('../../assets/icons/flag.png') },
    ],
    []
  );

  // After all hooks are declared, it's safe to short-circuit render
  if (!fontsLoaded) {
    return null;
  }

  return (
      <SafeAreaView style={styles.safe}>
        <ImageBackground
          source={require('../../assets/Copy of STUDIFY (7).png')}
          style={{ flex: 1, width: '100%', height: '100%' }}
          resizeMode="cover"
        >
          <View style={styles.container}>
            <TopHeaderBar onMenuPress={() => setDrawerOpen(true)} />

            {/* Scrollable content area; cards anchored near bottom */}
              <ScrollView
                contentContainerStyle={[
                  styles.contentScroll,
                  { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: insets.bottom + 40 }
                ]}
                showsVerticalScrollIndicator={false}
              >
              {/* Old hero illustration removed as requested */}

              {/* Feature cards grid: 2 columns × 3 rows (wrapped) */}
              <View style={styles.gridWrap}>
                {[
                  learning[0],
                  learning[1],
                  resources[0],
                  resources[1],
                  teacherPanel[0],
                  teacherPanel[1],
                ].map((item) => (
                  <View key={item.key} style={styles.cardCellTwoCol}>
                    <FeatureCard
                      title={item.title}
                      icon={item.icon}
                      iconAsset={item.assetIcon}
                      onPress={() => navigation.navigate(item.key as any)}
                      accentColor={item.accent}
                      backgroundColor={'#FFFFFF'}
                      height={112}
                    />
                  </View>
                ))}
              </View>
            </ScrollView>

            <SideDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              onLogout={requestLogout}
              onEditProfile={() => {
                setDrawerOpen(false);
                navigation.navigate('EditProfile');
              }}
            />

            {/* Logout modal */}
            <LogoutModal
              visible={logoutConfirmVisible}
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
        </ImageBackground>
      </SafeAreaView>
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
  heroCentered: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
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
    fontWeight: '800',
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
    // White card for content areas
    backgroundColor: theme.colors.card,
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
    backgroundColor: theme.colors.background,
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
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
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
    color: theme.colors.subtleText,
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
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 18,
    marginTop: 26,
    paddingBottom: 36,
  },
  contentScroll: {
    paddingBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  contentScroll: {
    paddingBottom: theme.spacing.sm,
  },
  cardCellTwoCol: {
    width: '43%',
    flexBasis: '43%',
    flexGrow: 0,
    flexShrink: 0,
    marginHorizontal: 0,
    marginBottom: 16,
  },
});
