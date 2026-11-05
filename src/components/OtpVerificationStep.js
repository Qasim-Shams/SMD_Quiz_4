import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function OtpVerificationStep({
  phoneNumber,
  onVerifyCode,
  onResendCode,
  onChangeNumber,
  loading,
  error,
}) {
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handlePasteCode = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      const cleaned = text.replace(/\D/g, '').slice(0, 6);
      if (cleaned) {
        setCode(cleaned);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(60);
    onResendCode();
  };

  const handleVerify = () => {
    onVerifyCode(code);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#16a34a" />
        </View>

        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit verification code sent by Firebase to{' '}
          <Text style={styles.highlightPhone}>{phoneNumber}</Text>
        </Text>

        <TouchableOpacity style={styles.changePhoneRow} onPress={onChangeNumber}>
          <Ionicons name="create-outline" size={14} color="#16a34a" />
          <Text style={styles.changePhoneText}>Change phone number</Text>
        </TouchableOpacity>

        {/* OTP Input Field */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.otpInput}
            value={code}
            onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
            placeholder="······"
            placeholderTextColor="#cbd5e1"
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          <TouchableOpacity style={styles.pasteBtn} onPress={handlePasteCode}>
            <Ionicons name="clipboard-outline" size={16} color="#16a34a" />
            <Text style={styles.pasteBtnText}>Paste</Text>
          </TouchableOpacity>
        </View>

        {/* 6-Digit Visual Boxes */}
        <View style={styles.digitsRow}>
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const digit = code[index];
            const isFilled = digit !== undefined;
            const isCurrent = code.length === index;
            return (
              <View
                key={index}
                style={[
                  styles.digitBox,
                  isFilled && styles.digitBoxFilled,
                  isCurrent && styles.digitBoxCurrent,
                ]}
              >
                <Text style={styles.digitText}>{digit || ''}</Text>
              </View>
            );
          })}
        </View>

        {/* Error Alert */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, (code.length < 6 || loading) && styles.verifyButtonDisabled]}
          onPress={handleVerify}
          disabled={code.length < 6 || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.buttonLoadingContent}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.verifyButtonText}>Verifying with Firebase...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.verifyButtonText}>Verify & Sign In</Text>
              <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Resend Countdown */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>{"Didn't receive the code? "}</Text>
          {countdown > 0 ? (
            <Text style={styles.countdownText}>Resend in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={loading}>
              <Text style={styles.resendActionText}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2ece5',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#064e3b',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  highlightPhone: {
    color: '#15803d',
    fontWeight: '700',
  },
  changePhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 18,
  },
  changePhoneText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 52,
  },
  otpInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 8,
    color: '#0f172a',
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#ecfdf5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  pasteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  digitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  digitBox: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  digitBoxCurrent: {
    borderColor: '#22c55e',
    backgroundColor: '#ffffff',
  },
  digitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#064e3b',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  verifyButton: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  countdownText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  resendActionText: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '700',
  },
});
