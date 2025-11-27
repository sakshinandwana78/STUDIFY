import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AvatarContextValue = {
  avatarUri: string | null;
  setAvatarUri: (uri: string | null) => Promise<void>;
};

const AvatarContext = createContext<AvatarContextValue | undefined>(undefined);

const STORAGE_KEY = '@studify_avatar_uri';

export function AvatarProvider({ children }: { children: ReactNode }) {
  const [avatarUri, setAvatarUriState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setAvatarUriState(saved);
      } catch (e) {
        // Non-fatal: fallback to default avatar
        console.warn('[Avatar] Failed to load saved avatar:', e);
      }
    })();
  }, []);

  const setAvatarUri = async (uri: string | null) => {
    try {
      if (uri) {
        await AsyncStorage.setItem(STORAGE_KEY, uri);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setAvatarUriState(uri);
    } catch (e) {
      console.warn('[Avatar] Failed to persist avatar:', e);
      setAvatarUriState(uri);
    }
  };

  return (
    <AvatarContext.Provider value={{ avatarUri, setAvatarUri }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const ctx = useContext(AvatarContext);
  if (!ctx) throw new Error('useAvatar must be used within AvatarProvider');
  return ctx;
}

