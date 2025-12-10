import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../ui/tokens/theme';
import { useTheme } from '../ui/tokens/theme.tsx';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAvatar } from '../ui/providers/AvatarProvider';
import * as ImagePicker from 'expo-image-picker';
import AuthInput from './auth/AuthInput';

type GenderOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '';

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const defaultAvatar = useMemo(() => require('../../assets/android-profile-icon-2.jpg'), []);
  const { avatarUri, setAvatarUri } = useAvatar();
  const { theme: t } = useTheme();

  const [photoSource, setPhotoSource] = useState<any>(avatarUri ? { uri: avatarUri } : defaultAvatar);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderOption>('');
  const [phone, setPhone] = useState('');
  // Inputs are rendered via AuthInput which manages its own focus styling

  // Success modal state
  const [successVisible, setSuccessVisible] = useState(false);
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);
  const [alertVisible, setAlertVisible] = useState(false);

  const handleOpenPicker = () => setPickerVisible(true);
  const handleClosePicker = () => setPickerVisible(false);

  const pickImageWeb = async (): Promise<string | null> => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      return await new Promise((resolve) => {
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return resolve(null);
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        };
        input.click();
      });
    } catch (e) {
      console.warn('[Avatar] Web picker failed:', e);
      return null;
    }
  };

  const handleChooseFromLibrary = async () => {
    if (Platform.OS === 'web') {
      const dataUrl = await pickImageWeb();
      if (dataUrl) {
        setPhotoSource({ uri: dataUrl });
        await setAvatarUri(dataUrl);
      }
      setPickerVisible(false);
      return;
    }
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert('Permission required', 'Please grant gallery access to choose a profile image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
      });
      if ((result as any)?.canceled) return;
      const asset = (result as any)?.assets?.[0];
      if (!asset) return;
      setPhotoSource({ uri: asset.uri });
      await setAvatarUri(asset.uri);
    } catch (e) {
      Alert.alert('Library unavailable', 'Install expo-image-picker to enable native gallery selection.');
      console.warn('[Avatar] Native pick failed:', e);
    } finally {
      setPickerVisible(false);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera unsupported', 'Please use “Choose from Library” on web.');
      return;
    }
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm?.granted) {
        Alert.alert('Permission required', 'Please grant camera access to take a profile image.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
      });
      if ((result as any)?.canceled) return;
      const asset = (result as any)?.assets?.[0];
      if (!asset) return;
      setPhotoSource({ uri: asset.uri });
      await setAvatarUri(asset.uri);
    } catch (e) {
      Alert.alert('Camera unavailable', 'Install expo-image-picker to enable native camera capture.');
      console.warn('[Avatar] Camera pick failed:', e);
    } finally {
      setPickerVisible(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoSource(defaultAvatar);
    await setAvatarUri(null);
    setPickerVisible(false);
  };

  const handleCreateAccount = () => {
    const missing = !fullName.trim() || !dob.trim() || !gender || !phone.trim() || !email.trim();
    if (missing) {
      setAlertVisible(true);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => {
        setAlertVisible(false);
      }, 1200);
      return;
    }
    // All fields filled: process account creation as normal without showing success modal
    navigation.replace('Home');
  };

  useEffect(() => {
    // Sync local photo source if avatar changes externally
    if (avatarUri) setPhotoSource({ uri: avatarUri });
    else setPhotoSource(defaultAvatar);
  }, [avatarUri]);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.colors.background }]}>
      <View style={styles.contentNoScroll}>
        {/* Avatar header on light background (no outer rounded card) */}
        <View style={styles.avatarWrap}>
          <Image source={photoSource} style={styles.avatar} resizeMode="cover" />
          <TouchableOpacity style={styles.cameraBadge} onPress={handleOpenPicker} activeOpacity={0.85}>
            <Ionicons name="camera" size={18} color={theme.colors.secondaryBg} />
          </TouchableOpacity>
        </View>

        {/* Form fields below avatar */}
        <View style={styles.form}>
          <AuthInput label="Full Name" placeholder="Enter your full name" value={fullName} onChangeText={setFullName} icon={'person-outline'} variant="light" />

          <AuthInput label="Date of Birth" placeholder="YYYY-MM-DD" value={dob} onChangeText={setDob} keyboardType="numeric" icon={'calendar-outline'} variant="light" />

          <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              {(['Male', 'Female', 'Other'] as GenderOption[]).map((opt) => {
                const active = gender === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.genderChip, active && styles.genderChipActive]}
                    onPress={() => setGender(opt)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.genderText, active && styles.genderTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          <AuthInput label="Phone Number" placeholder="+1 234 567 890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon={'call-outline'} variant="light" />

          <AuthInput label="Email Address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" icon={'mail-outline'} variant="light" />
        </View>

        {/* Primary action button matching Sign In/Create Account style */}
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: t.colors.buttonPrimary }]}
          onPress={handleCreateAccount}
          activeOpacity={0.92}
        >
          <Text style={[styles.updateButtonText, { color: t.colors.onPrimary }]}>Create Account</Text>
        </TouchableOpacity>

        {/* Image picker options */}
        <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={handleClosePicker}>
          <View style={styles.modalBackdrop}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Profile Photo</Text>
              <TouchableOpacity style={styles.sheetItem} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={18} color={theme.colors.textDark} />
                <Text style={styles.sheetText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetItem} onPress={handleChooseFromLibrary}>
                <Ionicons name="image" size={18} color={theme.colors.textDark} />
                <Text style={styles.sheetText}>Choose from Library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetItem} onPress={handleRemovePhoto}>
                <Ionicons name="trash" size={18} color={theme.colors.textDark} />
                <Text style={styles.sheetText}>Remove Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetCancel} onPress={handleClosePicker}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Inline alert modal */}
        <Modal visible={alertVisible} transparent animationType="fade" onRequestClose={() => setAlertVisible(false)}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setAlertVisible(false)}>
            <View style={styles.alertCard}>
              <Text style={styles.alertText}>Please fill all required fields.</Text>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F7FB' },
  contentNoScroll: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 18 },
  // Simplified header/avatar section
  avatarWrap: { alignItems: 'center', marginTop: 12, marginBottom: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#ccd8f0',
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6286cb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  form: { width: '92%', maxWidth: 420 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.textDark, marginBottom: 8 },

  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  genderChip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.25,
    borderColor: theme.colors.cardBorder,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  genderChipActive: { borderColor: theme.colors.brandYellow, backgroundColor: theme.colors.brandYellow },
  genderText: { fontSize: 13, fontWeight: '600', color: theme.colors.textDark },
  genderTextActive: { fontWeight: '700', color: '#FFFFFF' },

  // Primary button styled like Login/Sign Up
  primaryButton: {
    width: '92%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: '#3f60a0',
    borderRadius: 16,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    marginTop: 8,
  },
  updateButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '88%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e3ebfb' },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textDark, marginBottom: 8 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  sheetText: { fontSize: 14, color: theme.colors.textDark },
  sheetCancel: { marginTop: 6, alignItems: 'center', paddingVertical: 10 },
  sheetCancelText: { fontSize: 14, color: theme.colors.subtleText },

  // Inline alert styles
  alertCard: {
    width: '62%',
    maxWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6286cb',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  alertText: { color: '#3f60a0', fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
});
