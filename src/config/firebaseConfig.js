import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@smd_firebase_config_v1';

// Default template configuration.
// Replace these with your actual Firebase project credentials or enter them in the app settings modal.
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Checks whether a configuration has minimal valid keys.
 */
export const isConfigured = (config) => {
  if (!config) return false;
  return Boolean(
    config.apiKey &&
    config.projectId &&
    config.authDomain &&
    !config.apiKey.includes('YOUR_') &&
    config.apiKey.trim().length > 10
  );
};

/**
 * Load saved Firebase config from AsyncStorage or fall back to default template.
 */
export const loadFirebaseConfig = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn('Failed to load saved Firebase config:', err);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

/**
 * Save Firebase config to AsyncStorage.
 */
export const saveFirebaseConfig = async (config) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to save Firebase config:', err);
    return false;
  }
};

/**
 * Reset and remove config from AsyncStorage.
 */
export const resetFirebaseConfig = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear Firebase config:', err);
    return false;
  }
};

export const removeFirebaseConfig = resetFirebaseConfig;

/**
 * Parses a raw snippet (such as JSON or const firebaseConfig = { ... })
 * copied directly from the Firebase Console.
 */
export const parseFirebaseConfigSnippet = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return null;

  const trimmed = rawText.trim();

  // 1. Try direct JSON parse
  try {
    const obj = JSON.parse(trimmed);
    if (obj && typeof obj === 'object') {
      return {
        apiKey: obj.apiKey || '',
        authDomain: obj.authDomain || '',
        projectId: obj.projectId || '',
        storageBucket: obj.storageBucket || '',
        messagingSenderId: obj.messagingSenderId || '',
        appId: obj.appId || '',
      };
    }
  } catch {
    // Continue to regex parser
  }

  // 2. Extract using regex (handles JS object syntax like apiKey: "AIza...")
  const extractField = (key) => {
    const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"\`]([^'"\`]+)['"\`]`, 'i');
    const match = trimmed.match(regex);
    return match ? match[1].trim() : '';
  };

  const parsed = {
    apiKey: extractField('apiKey'),
    authDomain: extractField('authDomain'),
    projectId: extractField('projectId'),
    storageBucket: extractField('storageBucket'),
    messagingSenderId: extractField('messagingSenderId'),
    appId: extractField('appId'),
  };

  if (parsed.apiKey || parsed.projectId) {
    return parsed;
  }

  return null;
};
