import { initializeApp, type FirebaseApp } from 'firebase/app';
import { Platform } from 'react-native';
import type { Auth } from 'firebase/auth';

// Firebase config is read from Expo public env vars for safety.
// You can also hardcode temporarily while testing if needed.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured: boolean = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

// Initialize app once (module singleton).
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function ensureInitialized() {
  if (!isFirebaseConfigured) {
    // Do not initialize Firebase when config is missing; prevents runtime crashes.
    app = null;
    auth = null;
    return;
  }
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  if (!auth) {
    // Dev-only diagnostic: show which keys are present without exposing values
    if (__DEV__) {
      const presence = {
        platform: Platform.OS,
        keys: {
          apiKey: !!firebaseConfig.apiKey,
          authDomain: !!firebaseConfig.authDomain,
          projectId: !!firebaseConfig.projectId,
          storageBucket: !!firebaseConfig.storageBucket,
          messagingSenderId: !!firebaseConfig.messagingSenderId,
          appId: !!firebaseConfig.appId,
        },
        configured: isFirebaseConfigured,
      };
      // This log avoids printing secrets; only booleans are shown
      console.log('[Auth] Firebase config presence', presence);
    }

    if (Platform.OS === 'web') {
      const { getAuth } = require('firebase/auth');
      auth = getAuth(app);
    } else {
      try {
        const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        auth = initializeAuth(app, {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch (err: any) {
        // If RN-specific init fails, fall back to default getAuth to avoid crashes
        if (__DEV__) {
          console.warn('[Auth] initializeAuth failed; falling back to getAuth:', err?.message || err);
        }
        const { getAuth } = require('firebase/auth');
        auth = getAuth(app);
      }
    }
  }
}

ensureInitialized();

export { app, auth };