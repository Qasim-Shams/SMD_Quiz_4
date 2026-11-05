import * as FirebaseAuth from 'firebase/auth';
import { getFirebaseAuth, isAuthTestMode } from '../config/firebaseService';
import { formatFirebaseError } from '../utils/errorMessages';

// Minimal ApplicationVerifier for Firebase test phone numbers.
// Firebase requires type === 'recaptcha', verify() -> string, and _reset().
const testModeVerifier = {
  type: 'recaptcha',
  verify: async () => `test-mode-token-${Date.now()}`,
  _reset: () => {},
};

/**
 * Normalizes a phone number to standard international E.164 format.
 * Ensures the '+' prefix is present.
 */
export const normalizePhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  return cleaned;
};

/**
 * Initiates Firebase Phone Auth SMS / OTP verification directly through Firebase.
 * All verification codes are handled exclusively by Firebase.
 *
 * @param {string} phoneNumber - Full phone number with country code (e.g. +16505551234)
 * @param {object} appVerifier - Instance implementing ApplicationVerifier (reCAPTCHA verifier)
 */
export const sendPhoneOtp = async (phoneNumber, appVerifier) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    return {
      success: false,
      error: 'Firebase is not initialized. Please verify your Firebase credentials in Settings.',
    };
  }

  const formattedNumber = normalizePhoneNumber(phoneNumber);
  if (formattedNumber.length < 8) {
    return {
      success: false,
      error: 'Please enter a valid phone number including country code (e.g., +1 650 555 1234).',
    };
  }

  try {
    // Test mode: use a self-contained mock verifier so no reCAPTCHA UI is involved.
    // Firebase only accepts this for numbers listed under "Phone numbers for testing".
    const verifier = isAuthTestMode() ? testModeVerifier : appVerifier;
    if (isAuthTestMode()) {
      auth.settings.appVerificationDisabledForTesting = true;
    }

    const confirmationResult = await FirebaseAuth.signInWithPhoneNumber(
      auth,
      formattedNumber,
      verifier
    );

    return {
      success: true,
      confirmationResult,
      phoneNumber: formattedNumber,
    };
  } catch (error) {
    console.error('Firebase Phone OTP request failed:', error?.code, error?.message, error?.stack);
    return {
      success: false,
      error: formatFirebaseError(error),
      rawError: error,
    };
  }
};

/**
 * Verifies the 6-digit OTP code directly against Firebase's confirmation result.
 *
 * @param {object} confirmationResult - Object returned from Firebase signInWithPhoneNumber
 * @param {string} verificationCode - 6-digit SMS code
 */
export const verifyOtp = async (confirmationResult, verificationCode) => {
  if (!confirmationResult || typeof confirmationResult.confirm !== 'function') {
    return {
      success: false,
      error: 'Firebase verification session expired. Please request a new code.',
    };
  }

  const code = verificationCode.trim();
  if (!code || code.length < 4) {
    return {
      success: false,
      error: 'Please enter the verification code sent by Firebase.',
    };
  }

  try {
    const userCredential = await confirmationResult.confirm(code);
    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error) {
    console.error('Firebase OTP verification failed:', error?.code, error?.message, error?.stack);
    return {
      success: false,
      error: formatFirebaseError(error),
      rawError: error,
    };
  }
};
