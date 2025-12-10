import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  Platform,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../ui/tokens/theme';
import { useTheme } from '../ui/tokens/theme.tsx';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAvatar } from '../ui/providers/AvatarProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

type GenderOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '';

const STORAGE_KEYS = {
  fullName: 'profile_fullName',
  email: 'profile_email',
  dob: 'profile_dob',
  gender: 'profile_gender',
  phone: 'profile_phone',
};

export default function EditProfileScreen() {
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
  const [focused, setFocused] = useState<string | null>(null);

  // Inline alert state (small popup)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'error'>('error');
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);

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

  const showAlert = (message: string, variant: 'success' | 'error', duration = 1200) => {
    setAlertMessage(message);
    setAlertVariant(variant);
    setAlertVisible(true);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => {
      setAlertVisible(false);
      if (variant === 'success') {
        navigation.goBack();
      }
    }, duration);
  };

  const handleSaveChanges = async () => {
    const missing = !fullName.trim() || !dob.trim() || !gender || !phone.trim() || !email.trim();
    if (missing) {
      showAlert('Please fill all required fields', 'error', 1300);
      return;
    }
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.fullName, fullName],
        [STORAGE_KEYS.email, email],
        [STORAGE_KEYS.dob, dob],
        [STORAGE_KEYS.gender, gender],
        [STORAGE_KEYS.phone, phone],
      ]);
      showAlert('Profile updated!', 'success', 1000);
    } catch (e) {
      console.warn('[Profile] Save failed:', e);
      showAlert('Update failed. Please try again.', 'error', 1400);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const entries = await AsyncStorage.multiGet([
          STORAGE_KEYS.fullName,
          STORAGE_KEYS.email,
          STORAGE_KEYS.dob,
          STORAGE_KEYS.gender,
          STORAGE_KEYS.phone,
        ]);
        const map = Object.fromEntries(entries);
        setFullName(map[STORAGE_KEYS.fullName] || '');
        setEmail(map[STORAGE_KEYS.email] || '');
        setDob(map[STORAGE_KEYS.dob] || '');
        setGender((map[STORAGE_KEYS.gender] as GenderOption) || '');
        setPhone(map[STORAGE_KEYS.phone] || '');
      } catch (e) {
        console.warn('[Profile] Load failed:', e);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
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
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.fieldRow}>
              <Ionicons name="person-outline" size={18} color={theme.colors.textDark} style={styles.fieldIcon} />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                placeholder="Enter your full name"
                style={[styles.input, focused === 'name' && styles.inputFocused]}
              />
            </View>

            <Text style={styles.label}>Date of Birth</Text>
            <View style={styles.fieldRow}>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textDark} style={styles.fieldIcon} />
              <TextInput
                value={dob}
                onChangeText={setDob}
                onFocus={() => setFocused('dob')}
                onBlur={() => setFocused(null)}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
                style={[styles.input, focused === 'dob' && styles.inputFocused]}
              />
            </View>

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

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.fieldRow}>
              <Ionicons name="call-outline" size={18} color={theme.colors.textDark} style={styles.fieldIcon} />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocused('phone')}
                onBlur={() => setFocused(null)}
                placeholder="+1 234 567 890"
                keyboardType="phone-pad"
                style={[styles.input, focused === 'phone' && styles.inputFocused]}
              />
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.fieldRow}>
              <Ionicons name="mail-outline" size={18} color={theme.colors.textDark} style={styles.fieldIcon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, focused === 'email' && styles.inputFocused]}
              />
            </View>

            {/* Primary action button styled like Login/Sign Up */}
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: t.colors.buttonPrimary }]}
              onPress={handleSaveChanges}
              activeOpacity={0.92}
            >
              <Text style={[styles.saveButtonText, { color: t.colors.onPrimary }]}>Save Changes</Text>
            </TouchableOpacity>
          </View>

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
              <Text style={[styles.alertText, alertVariant === 'success' ? styles.alertTextSuccess : styles.alertTextError]}>
                {alertMessage}
              </Text>
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
  avatarWrap: { alignItems: 'center', marginTop: 6, marginBottom: 18 },
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
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccd8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFCFF',
    marginBottom: 14,
  },
  fieldIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: theme.colors.textDark },
  inputFocused: { borderColor: '#6286cb', shadowColor: theme.colors.shadow, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  genderChip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.25,
    borderColor: '#ccd8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  genderChipActive: { borderColor: '#6286cb', backgroundColor: '#6286cb' },
  genderText: { fontSize: 13, color: theme.colors.textDark },
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
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

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
  alertTextSuccess: { color: '#3f60a0' },
  alertTextError: { color: '#3f60a0' },
});
