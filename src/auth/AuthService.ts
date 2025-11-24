/**
 * AuthService (Firebase)
 *
 * Typed, modular functions for Login, Signup, Forgot Password flows.
 * Isolated from AR and other app features. Only used by auth screens.
 */

import { auth, isFirebaseConfigured } from './firebaseClient';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut as fbSignOut,
} from 'firebase/auth';

export type ProfileData = {
  firstName?: string;
  lastName?: string;
};

export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export type AuthError = {
  code: string;
  message: string;
};

function toAuthUser(user: FirebaseUser | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  if (!isFirebaseConfigured || !auth) {
    return { user: null, error: { code: 'CONFIG', message: 'Firebase Auth not configured. Set EXPO_PUBLIC_FIREBASE_* env vars.' } };
  }
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { user: toAuthUser(cred.user), error: null };
  } catch (e: any) {
    return { user: null, error: { code: e.code || 'AUTH_ERROR', message: e.message || 'Sign in failed' } };
  }
}

export async function signUp(
  email: string,
  password: string,
  profile?: ProfileData,
): Promise<{ user: AuthUser | null; error: AuthError | null }> {
  if (!isFirebaseConfigured || !auth) {
    return { user: null, error: { code: 'CONFIG', message: 'Firebase Auth not configured. Set EXPO_PUBLIC_FIREBASE_* env vars.' } };
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const displayName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return { user: toAuthUser(cred.user), error: null };
  } catch (e: any) {
    return { user: null, error: { code: e.code || 'AUTH_ERROR', message: e.message || 'Sign up failed' } };
  }
}

export async function sendReset(email: string): Promise<{ error: AuthError | null }> {
  if (!isFirebaseConfigured || !auth) {
    return { error: { code: 'CONFIG', message: 'Firebase Auth not configured. Set EXPO_PUBLIC_FIREBASE_* env vars.' } };
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { error: null };
  } catch (e: any) {
    return { error: { code: e.code || 'AUTH_ERROR', message: e.message || 'Reset failed' } };
  }
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  if (!isFirebaseConfigured || !auth) {
    return { error: { code: 'CONFIG', message: 'Firebase Auth not configured. Set EXPO_PUBLIC_FIREBASE_* env vars.' } };
  }
  try {
    await fbSignOut(auth);
    return { error: null };
  } catch (e: any) {
    return { error: { code: e.code || 'AUTH_ERROR', message: e.message || 'Sign out failed' } };
  }
}

export async function getUser(): Promise<{ user: AuthUser | null }> {
  if (!isFirebaseConfigured || !auth) {
    return { user: null };
  }
  return { user: toAuthUser(auth.currentUser) };
}