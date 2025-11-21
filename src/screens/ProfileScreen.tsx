import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
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
    Alert.alert('Saved', 'Your profile changes have been saved locally.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Top: Avatar with camera overlay */}
      <View style={styles.topSection}>
        <View style={styles.avatarWrap}>
          <Image source={photoSource} style={styles.avatar} resizeMode="cover" />
          <TouchableOpacity style={styles.cameraBadge} onPress={handleOpenPicker} activeOpacity={0.85}>
            <Ionicons name="camera" size={18} color={theme.colors.brandBlack} />
          </TouchableOpacity>
        </View>
        <Text style={styles.nameText}>{fullName || 'Your Name'}</Text>
        <Text style={styles.emailText}>{email || 'you@example.com'}</Text>
      </View>

      {/* Form: Personal Information */}
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused(null)}
            placeholder="Enter your full name"
            style={[styles.input, focused === 'name' && styles.inputFocused]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date of Birth / Age</Text>
          <TextInput
            value={dob}
            onChangeText={setDob}
            onFocus={() => setFocused('dob')}
            onBlur={() => setFocused(null)}
            placeholder="DD/MM/YYYY or Age"
            style={[styles.input, focused === 'dob' && styles.inputFocused]}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderRow}>
            {(['Male', 'Female', 'Other', 'Prefer not to say'] as GenderOption[]).map((opt) => {
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
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
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

        <View style={styles.field}>
          <Text style={styles.label}>Email Address</Text>
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  topSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 16 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 116,
    height: 116,
    borderRadius: 58,
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
  nameText: { marginTop: 12, fontSize: 20, fontWeight: '700', color: theme.colors.brandBlack },
  emailText: { marginTop: 6, fontSize: 14, color: theme.colors.headerGray },

  form: { marginTop: 18 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.brandBlack, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: theme.colors.brandBlack,
    backgroundColor: '#FAFAFA',
  },
  inputFocused: { borderColor: theme.colors.brandYellow },

  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genderChip: {
    borderWidth: 1,
    borderColor: theme.colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  genderChipActive: { borderColor: theme.colors.brandYellow, backgroundColor: '#FFF7CC' },
  genderText: { fontSize: 13, color: theme.colors.brandBlack },
  genderTextActive: { fontWeight: '600' },

  saveButton: {
    marginTop: 18,
    backgroundColor: theme.colors.brandYellow,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  saveText: {
    color: theme.colors.brandBlack,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '88%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.brandBlack, marginBottom: 8 },
  sheetItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  sheetText: { fontSize: 14, color: theme.colors.brandBlack },
  sheetCancel: { marginTop: 6, alignItems: 'center', paddingVertical: 10 },
  sheetCancelText: { fontSize: 14, color: theme.colors.headerGray },
});