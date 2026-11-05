import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Header from './src/components/Header';
import PhoneInputStep from './src/components/PhoneInputStep';
import OtpVerificationStep from './src/components/OtpVerificationStep';
import UserProfileStep from './src/components/UserProfileStep';
import RecaptchaModal from './src/components/RecaptchaModal';
import ConfigModal from './src/components/ConfigModal';
import FreeTierGuideModal from './src/components/FreeTierGuideModal';
import {
  loadFirebaseConfig,
  saveFirebaseConfig,
  removeFirebaseConfig,
  isConfigured,
} from './src/config/firebaseConfig';
import {
  initializeFirebase,
  teardownFirebase,
  onAuthStateChange,
  signOutFirebase,
  getFirebaseAuth,
} from './src/config/firebaseService';
import { sendPhoneOtp, verifyOtp } from './src/services/authService';

export default function App() {
  const [config, setConfig] = useState(null);
  const [authInstance, setAuthInstance] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStep, setAuthStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [guideModalVisible, setGuideModalVisible] = useState(false);

  // Universal reCAPTCHA verifier ref
  const recaptchaRef = useRef(null);

  // Initialize Firebase on mount
  useEffect(() => {
    let unsubscribe = () => {};

    const setup = async () => {
      const loadedConfig = await loadFirebaseConfig();
      setConfig(loadedConfig);

      if (isConfigured(loadedConfig)) {
        const initResult = await initializeFirebase(loadedConfig);
        if (initResult.success) {
          setAuthInstance(initResult.auth);

          unsubscribe = onAuthStateChange((user) => {
            setCurrentUser(user);
            if (user) {
              setAuthStep('profile');
            } else {
              setAuthStep((prev) => (prev === 'profile' ? 'phone' : prev));
            }
          });
        }
      }
    };

    setup();

    return () => {
      unsubscribe();
    };
  }, []);

  // Save new configuration from ConfigModal
  const handleSaveConfig = async (newConfig) => {
    const saved = await saveFirebaseConfig(newConfig);
    if (!saved) {
      return { success: false, error: 'Failed to write config to storage.' };
    }

    setConfig(newConfig);
    const initResult = await initializeFirebase(newConfig);
    if (initResult.success) {
      setAuthInstance(initResult.auth);
      setError(null);

      onAuthStateChange((user) => {
        setCurrentUser(user);
        if (user) {
          setAuthStep('profile');
        }
      });
      return { success: true };
    }

    return { success: false, error: initResult.error };
  };

  // Remove Firebase configuration completely
  const handleRemoveConfig = async () => {
    await removeFirebaseConfig();
    await teardownFirebase();

    setConfig({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    });
    setAuthInstance(null);
    setCurrentUser(null);
    setAuthStep('phone');
    setError(null);
  };

  // Step 1: Send SMS OTP via Firebase
  const handleSendOtp = async () => {
    setError(null);

    if (!isConfigured(config)) {
      setConfigModalVisible(true);
      setError('Please configure your Firebase credentials in Settings first.');
      return;
    }

    if (!recaptchaRef.current) {
      setError('Firebase security verifier is loading. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const result = await sendPhoneOtp(phoneNumber, recaptchaRef.current);
      setLoading(false);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setPhoneNumber(result.phoneNumber);
        setAuthStep('otp');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setLoading(false);
      setError(err?.message || 'Failed to send OTP code.');
    }
  };

  // Step 2: Confirm OTP via Firebase
  const handleVerifyOtp = async (code) => {
    setError(null);
    setLoading(true);

    const result = await verifyOtp(confirmationResult, code);
    setLoading(false);

    if (result.success) {
      setCurrentUser(result.user);
      setAuthStep('profile');
    } else {
      setError(result.error);
    }
  };

  // Resend OTP via Firebase
  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);

    const result = await sendPhoneOtp(phoneNumber, recaptchaRef.current);
    setLoading(false);

    if (result.success) {
      setConfirmationResult(result.confirmationResult);
    } else {
      setError(result.error);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await signOutFirebase();
    setCurrentUser(null);
    setConfirmationResult(null);
    setAuthStep('phone');
    setError(null);
  };

  const handleSelectTestNumber = (number) => {
    setPhoneNumber(number);
  };

  const isConnected = isConfigured(config);

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        behavior="padding"
        style={styles.keyboardContainer}
      >
        {/* App Header */}
        <Header
          isConnected={isConnected}
          projectId={config?.projectId}
          onOpenConfig={() => setConfigModalVisible(true)}
          onOpenGuide={() => setGuideModalVisible(true)}
        />

        {/* Content Area */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {authStep === 'phone' && (
            <PhoneInputStep
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onSendCode={handleSendOtp}
              loading={loading}
              error={error}
              isConnected={isConnected}
              onOpenConfig={() => setConfigModalVisible(true)}
            />
          )}

          {authStep === 'otp' && (
            <OtpVerificationStep
              phoneNumber={phoneNumber}
              onVerifyCode={handleVerifyOtp}
              onResendCode={handleResendOtp}
              onChangeNumber={() => {
                setAuthStep('phone');
                setError(null);
              }}
              loading={loading}
              error={error}
            />
          )}

          {authStep === 'profile' && (
            <UserProfileStep user={currentUser} onSignOut={handleSignOut} />
          )}
        </ScrollView>

        {/* Universal reCAPTCHA Verifier Modal */}
        <RecaptchaModal
          ref={recaptchaRef}
          firebaseConfig={config}
          auth={authInstance || getFirebaseAuth()}
        />

        {/* Firebase Config Modal */}
        <ConfigModal
          visible={configModalVisible}
          currentConfig={config}
          onSave={handleSaveConfig}
          onRemove={handleRemoveConfig}
          onClose={() => setConfigModalVisible(false)}
        />

        {/* Free Tier Guide Modal */}
        <FreeTierGuideModal
          visible={guideModalVisible}
          onClose={() => setGuideModalVisible(false)}
          onSelectTestNumber={handleSelectTestNumber}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f3fbf6',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
});
