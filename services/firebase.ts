// Firebase Web SDK — works in Expo Go without native build
// Uses @firebase/app (modular v9+)
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence } from 'firebase/auth';

// ── Paste your Firebase Web config here ─────────────────────────────────────
// Firebase Console → Project Settings → Your Apps → Web App → Config
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY            ?? '',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN        ?? '',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID         ?? '',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET     ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID             ?? '',
};

// Prevent duplicate app initialization (hot reload safe)
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

// Auth with AsyncStorage persistence so session survives app restarts
let firebaseAuth: ReturnType<typeof getAuth>;
try {
  firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch {
  // Already initialized (hot reload)
  firebaseAuth = getAuth(app);
}

export { firebaseAuth };
export default app;
