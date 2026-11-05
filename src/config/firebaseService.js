import { Platform } from 'react-native';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isConfigured } from './firebaseConfig';

let currentApp = null;
let currentAuth = null;
let currentConfig = null;

/**
 * True when EXPO_PUBLIC_FIREBASE_AUTH_TEST_MODE=true — only Firebase test
 * phone numbers (Console > Authentication > Sign-in method > Phone) will work.
 */
export const isAuthTestMode = () =>
  process.env.EXPO_PUBLIC_FIREBASE_AUTH_TEST_MODE === 'true';

/**
 * Cleanly tear down any active Firebase app and auth instances.
 */
export const teardownFirebase = async () => {
  try {
    if (currentAuth) {
      await FirebaseAuth.signOut(currentAuth).catch(() => {});
    }
    const existingApps = getApps();
    for (const app of existingApps) {
      try {
        await deleteApp(app);
      } catch (err) {
        console.warn('Error deleting Firebase app:', err);
      }
    }
  } finally {
    currentApp = null;
    currentAuth = null;
    currentConfig = null;
  }
  return { success: true };
};

/**
 * Initializes or re-initializes Firebase App and Auth with the given config.
 */
export const initializeFirebase = async (config) => {
  if (!isConfigured(config)) {
    return { success: false, error: 'Firebase credentials are incomplete or invalid.' };
  }

  try {
    // If an app already exists, delete it cleanly before re-initializing
    await teardownFirebase();

    // Initialize new Firebase App
    currentApp = initializeApp(config);
    currentConfig = config;

    // Initialize Auth with platform-appropriate persistence
    if (Platform.OS === 'web') {
      currentAuth = FirebaseAuth.getAuth(currentApp);
    } else {
      // React Native environment
      // eslint-disable-next-line import/namespace
      const getRNPersistence = FirebaseAuth['getReactNativePersistence'];
      if (
        typeof FirebaseAuth.initializeAuth === 'function' &&
        typeof getRNPersistence === 'function'
      ) {
        try {
          currentAuth = FirebaseAuth.initializeAuth(currentApp, {
            persistence: getRNPersistence(AsyncStorage),
          });
        } catch {
          currentAuth = FirebaseAuth.getAuth(currentApp);
        }
      } else {
        currentAuth = FirebaseAuth.getAuth(currentApp);
      }
    }

    // Test-number mode: skip reCAPTCHA so Firebase "Phone numbers for testing"
    // work on every platform (no real SMS is sent, real numbers will fail).
    if (isAuthTestMode()) {
      currentAuth.settings.appVerificationDisabledForTesting = true;
    }

    return { success: true, app: currentApp, auth: currentAuth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return { success: false, error: error.message || 'Failed to initialize Firebase' };
  }
};

/**
 * Returns current Firebase App instance.
 */
export const getFirebaseApp = () => currentApp;

/**
 * Returns current Firebase Auth instance.
 */
export const getFirebaseAuth = () => currentAuth;

/**
 * Returns currently active configuration object.
 */
export const getCurrentConfig = () => currentConfig;

/**
 * Subscribe to Auth state changes.
 */
export const onAuthStateChange = (callback) => {
  if (!currentAuth) return () => {};
  return FirebaseAuth.onAuthStateChanged(currentAuth, callback);
};

/**
 * Sign out current user.
 */
export const signOutFirebase = async () => {
  if (!currentAuth) return { success: true };
  try {
    await FirebaseAuth.signOut(currentAuth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
