import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsSection from '../ui/molecules/SettingsSection';
import SettingsToggle from '../ui/atoms/SettingsToggle';
import SettingsButton from '../ui/atoms/SettingsButton';
import Text from '../ui/atoms/Text';
import i18n from 'i18next';

type Lang = 'en' | 'hi';

// Safe storage adapter: prefers AsyncStorage if available; falls back to localStorage (web) or in-memory
const memStore: Record<string, string | null> = {};
const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return memStore[key] ?? null;
    }
  },
  setItem: async (key: string, val: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
      return;
    }
    try {
      await AsyncStorage.setItem(key, val);
    } catch {
      memStore[key] = val;
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memStore[key] = null;
    }
  },
};

// Optional i18n bridge (safe): uses i18next if available, otherwise no-op
async function safeChangeLanguage(lang: Lang) {
  try {
    if (typeof i18n?.changeLanguage === 'function') {
      await i18n.changeLanguage(lang);
    }
  } catch {}
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [showPlacementGuide, setShowPlacementGuide] = useState<boolean>(true);
  const [autoPlacementHint, setAutoPlacementHint] = useState<boolean>(false);
  const [language, setLanguage] = useState<Lang>('en');

  // Load persisted settings
  useEffect(() => {
    (async () => {
      const spg = await safeStorage.getItem('settings.showPlacementGuide');
      const aph = await safeStorage.getItem('settings.autoPlacementHint');
      const lang = await safeStorage.getItem('settings.language');
      if (spg !== null) setShowPlacementGuide(spg === 'true');
      if (aph !== null) setAutoPlacementHint(aph === 'true');
      if (lang === 'en' || lang === 'hi') {
        setLanguage(lang);
        await safeChangeLanguage(lang);
      }
    })();
  }, []);

  // Handlers
  const handleToggleSPG = async (next: boolean) => {
    setShowPlacementGuide(next);
    await safeStorage.setItem('settings.showPlacementGuide', String(next));
  };
  const handleToggleAPH = async (next: boolean) => {
    setAutoPlacementHint(next);
    await safeStorage.setItem('settings.autoPlacementHint', String(next));
  };
  const handleResetTips = async () => {
    // UI-only reset flag
    await safeStorage.removeItem('settings.tipsDismissed');
  };
  const handleClearCache = async () => {
    // UI-only cache key namespace
    await safeStorage.removeItem('settings.cache');
  };
  const handleSetLanguage = async (lang: Lang) => {
    setLanguage(lang);
    await safeStorage.setItem('settings.language', lang);
    await safeChangeLanguage(lang);
  };

  const writingDirection = useMemo(() => (language === 'hi' ? 'rtl' : 'ltr'), [language]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <ScrollView
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24), paddingHorizontal: 14 }}
        style={{ flex: 1 }}
      >
        <Text variant="title" weight="bold" style={[styles.screenTitle, { writingDirection }]}>Settings</Text>

        <SettingsSection title="AR Preferences">
          <SettingsToggle
            label="Show AR Placement Guide"
            value={showPlacementGuide}
            onChange={handleToggleSPG}
            icon={'grid-outline'}
          />
          <SettingsToggle
            label="Enable Auto-Placement Hint"
            value={autoPlacementHint}
            onChange={handleToggleAPH}
            icon={'compass-outline'}
          />
          <SettingsButton label="Reset AR Tips / Coachmarks" onPress={handleResetTips} icon={'refresh-outline'} />
          <SettingsButton label="Clear AR Local Cache" onPress={handleClearCache} icon={'trash-outline'} />
        </SettingsSection>

        <SettingsSection title="Language">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={[styles.langOption, language === 'en' && styles.langActive]}>
              <SettingsButton label="English" onPress={() => handleSetLanguage('en')} icon={'globe-outline'} />
            </View>
            <View style={[styles.langOption, language === 'hi' && styles.langActive]}>
              <SettingsButton label="Hindi" onPress={() => handleSetLanguage('hi')} icon={'globe-outline'} />
            </View>
          </View>
          <Text variant="caption" style={styles.langNote}>Front-end text direction only. No logic changes.</Text>
        </SettingsSection>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  screenTitle: { color: '#1A1D1F', marginBottom: 12 },
  langOption: { flex: 1 },
  langActive: { opacity: 0.95 },
  langNote: { color: '#64748B', marginTop: 6 },
});