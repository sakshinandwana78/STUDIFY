import React, { useMemo, useState } from 'react';
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
  ToastAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../ui/tokens/theme';

type GenderOption = 'Male' | 'Female' | 'Other' | 'Prefer not to say' | '';

export default function ProfileScreen() {
  const defaultAvatar = useMemo(() => require('../../assets/android-profile-icon-2.jpg'), []);

  const [photoSource, setPhotoSource] = useState<any>(defaultAvatar);
  const [pickerVisible, setPickerVisible] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderOption>('');
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  const handleOpenPicker = () => setPickerVisible(true);
  const handleClosePicker = () => setPickerVisible(false);

  const handleChooseFromLibrary = () => {
    // Placeholder: swap to a bundled demo image. To enable real picking, install expo-image-picker.
    setPhotoSource(require('../../assets/tudify (4).png'));
    setPickerVisible(false);
  };

  const handleTakePhoto = () => {
    Alert.alert('Camera not wired', 'To enable camera capture, install expo-image-picker and connect this action.');
  };

  const handleRemovePhoto = () => {
    setPhotoSource(defaultAvatar);
    setPickerVisible(false);
  };

  const handleSave = () => {
    // Persist logic can be added here; show success feedback now
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity('Profile Updated!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else {
      Alert.alert('Profile Updated!', 'Your changes have been saved.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.contentNoScroll}>
        {/* Card with arc header */}
        <View style={styles.card}>
          <View style={styles.arcHeader} />

          {/* Overlapped avatar */}
          <View style={styles.avatarWrap}>
            <Image source={photoSource} style={styles.avatar} resizeMode="cover" />
            <TouchableOpacity style={styles.cameraBadge} onPress={handleOpenPicker} activeOpacity={0.85}>
              <Ionicons name="camera" size={18} color={theme.colors.brandBlack} />
            </TouchableOpacity>
          </View>

          {/* Form fields start directly under avatar */}
          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.fieldRow}>
              <Ionicons name="person-outline" size={18} color={theme.colors.brandBlack} style={styles.fieldIcon} />
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
              <Ionicons name="calendar-outline" size={18} color={theme.colors.brandBlack} style={styles.fieldIcon} />
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
              <Ionicons name="call-outline" size={18} color={theme.colors.brandBlack} style={styles.fieldIcon} />
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
              <Ionicons name="mail-outline" size={18} color={theme.colors.brandBlack} style={styles.fieldIcon} />
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
          </View>
        </View>

        {/* Floating save button */
        }
        <TouchableOpacity style={styles.fab} onPress={handleSave} activeOpacity={0.9}>
          <Ionicons name="checkmark" size={22} color={theme.colors.brandBlack} />
        </TouchableOpacity>

        {/* Image picker options */}
        <Modal visible={pickerVisible} transparent animationType="fade" onRequestClose={handleClosePicker}>
          <View style={styles.modalBackdrop}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Profile Photo</Text>
              <TouchableOpacity style={styles.sheetItem} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={18} color={theme.colors.brandBlack} />
                <Text style={styles.sheetText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetItem} onPress={handleChooseFromLibrary}>
                <Ionicons name="image" size={18} color={theme.colors.brandBlack} />
                <Text style={styles.sheetText}>Choose from Library</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetItem} onPress={handleRemovePhoto}>
                <Ionicons name="trash" size={18} color={theme.colors.brandBlack} />
                <Text style={styles.sheetText}>Remove Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetCancel} onPress={handleClosePicker}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B0F13' },
  contentNoScroll: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 18 },
  card: {
    width: '92%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
    overflow: 'hidden',
    alignItems: 'center',
  },
  arcHeader: {
    width: '100%',
    height: 100,
    backgroundColor: theme.colors.brandYellow,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
  },
  avatarWrap: { position: 'absolute', top: 60, alignItems: 'center' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: theme.colors.cardBorder,
    },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  form: { width: '100%', paddingHorizontal: 20, paddingTop: 70, paddingBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.brandBlack, marginBottom: 8 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  fieldIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: theme.colors.brandBlack },
  inputFocused: { borderColor: theme.colors.brandYellow },

  genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  genderChip: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.25,
    borderColor: theme.colors.brandBlack,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  genderChipActive: { borderColor: theme.colors.brandBlack, backgroundColor: theme.colors.brandYellow },
  genderText: { fontSize: 13, color: theme.colors.brandBlack },
  genderTextActive: { fontWeight: '700', color: theme.colors.brandBlack },

  fab: {
    position: 'absolute',
    right: 22,
    bottom: 22,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.brandYellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '88%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.brandBlack, marginBottom: 8 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  sheetText: { fontSize: 14, color: theme.colors.brandBlack },
  sheetCancel: { marginTop: 6, alignItems: 'center', paddingVertical: 10 },
  sheetCancelText: { fontSize: 14, color: theme.colors.headerGray },
});