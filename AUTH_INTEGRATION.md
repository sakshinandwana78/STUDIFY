# Auth Integration (Firebase) — Isolated, Typed, Modular

This project integrates authentication using the official Firebase JS SDK, with type-safe, modular functions. All changes are isolated to auth-related files and do not touch AR features, scenes, or non-auth UI.

## What Was Added

- `src/auth/firebaseClient.ts`: Platform-aware Firebase initialization.
  - Web uses `firebase/auth`.
  - React Native (Expo managed) uses `firebase/auth/react-native` with `AsyncStorage` persistence.
- `src/auth/AuthService.ts`: Typed functions for `signIn`, `signUp`, `sendReset`, `signOut`, `getUser`.
- Updated only auth screens to call the service:
  - `src/screens/auth/LoginScreen.tsx`
  - `src/screens/auth/SignupScreen.tsx`
  - `src/screens/auth/ForgotPasswordScreen.tsx`

No AR files, scenes, or navigation outside the `AuthNavigator` were modified.

## Dependencies

Install:

- `firebase`
- `@react-native-async-storage/async-storage` (already present in the project)

## Configuration

Set your Firebase config via Expo public env vars or hardcode temporarily in `src/auth/firebaseClient.ts`:

```
EXPO_PUBLIC_FIREBASE_API_KEY=... 
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

These are used inside `src/auth/firebaseClient.ts` to initialize Firebase. If empty, the app still compiles, but auth calls will fail at runtime until valid keys are provided.

## Usage

- Login: Email + password on the Login screen (`signIn`).
- Sign Up: Email + password; optional `firstName`/`lastName` stored as `displayName` (`signUp`).
- Forgot Password: Sends a password reset email (`sendReset`). Users complete the reset flow in the browser; no deep links required.
- Sign Out: Logs out the current user (`signOut`).
- Get User: Returns the current user (`getUser`) with a typed `AuthUser` shape.

## Revert / Remove Firebase Auth

1. Delete:
   - `src/auth/firebaseClient.ts`
   - `src/auth/AuthService.ts`
2. Remove imports from:
   - `src/screens/auth/LoginScreen.tsx`
   - `src/screens/auth/SignupScreen.tsx`
   - `src/screens/auth/ForgotPasswordScreen.tsx`
3. Uninstall packages:
   - `firebase`

## Migration Notes (Supabase → Firebase)

- Supabase client and related polyfills were removed:
  - Files removed: `src/auth/supabaseClient.ts`
  - Packages uninstalled: `@supabase/supabase-js`, `react-native-get-random-values`, `react-native-url-polyfill`
- Auth screen logic was updated to consume Firebase service return contracts (`{ user, error }`).

## Non-Invasive Design

- This integration does not gate the app behind auth or alter AR logic.
- If you later want to gate navigation or add session-aware guards, add an `AuthProvider` scoped to the auth navigator. That is outside the current scope.
