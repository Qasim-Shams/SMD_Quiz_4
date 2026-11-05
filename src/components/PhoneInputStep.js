import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PhoneInputStep({
  phoneNumber,
  setPhoneNumber,
  onSendCode,
  loading,
  error,
  isConnected,
  onOpenConfig,
}) {
  const quickCountryCodes = ['+1', '+44', '+92', '+91', '+61'];

  const handleCountryPrefix = (prefix) => {
    if (phoneNumber.startsWith('+')) {
      const parts = phoneNumber.split(' ');
      if (parts.length > 1) {
        setPhoneNumber(`${prefix} ${parts.slice(1).join(' ')}`);
      } else {
        setPhoneNumber(prefix);
      }
    } else {
      setPhoneNumber(`${prefix} ${phoneNumber}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="phone-portrait-outline" size={26} color="#16a34a" />
        </View>

        <Text style={styles.title}>Firebase Phone Login</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to receive an official Firebase SMS verification code.
        </Text>

        {!isConnected && (
          <TouchableOpacity style={styles.unconfiguredBanner} onPress={onOpenConfig}>
            <Ionicons name="warning-outline" size={18} color="#b45309" />
            <View style={styles.unconfiguredBannerContent}>
              <Text style={styles.unconfiguredTitle}>Firebase Credentials Required</Text>
              <Text style={styles.unconfiguredBody}>
                Tap here to verify your Firebase credentials in Settings.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#b45309" />
          </TouchableOpacity>
        )}

        {/* Quick Country Code Pills */}
        <View style={styles.prefixRow}>
          <Text style={styles.prefixLabel}>Country Code:</Text>
          {quickCountryCodes.map((code) => (
            <TouchableOpacity
              key={code}
              style={[
                styles.prefixPill,
                phoneNumber.startsWith(code) && styles.prefixPillActive,
              ]}
              onPress={() => handleCountryPrefix(code)}
            >
              <Text
                style={[
                  styles.prefixPillText,
                  phoneNumber.startsWith(code) && styles.prefixPillTextActive,
                ]}
              >
                {code}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone Input Box */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#16a34a" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+1 555 123 4567"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!loading}
            autoFocus={false}
          />
          {phoneNumber.length > 0 && (
            <TouchableOpacity onPress={() => setPhoneNumber('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, (!phoneNumber.trim() || loading) && styles.buttonDisabled]}
          onPress={onSendCode}
          disabled={!phoneNumber.trim() || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.buttonLoadingContent}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.buttonText}>Sending OTP via Firebase...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Send Firebase OTP</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Info Footer */}
        <View style={styles.hintContainer}>
          <Ionicons name="shield-checkmark-outline" size={15} color="#15803d" />
          <Text style={styles.hintText}>
            Secured by Firebase Authentication. Standard carrier SMS rates or Firebase testing rules apply.
          </Text>
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
    marginBottom: 16,
  },
  unconfiguredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fefce8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef08a',
    padding: 12,
    marginBottom: 16,
  },
  unconfiguredBannerContent: {
    flex: 1,
  },
  unconfiguredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a16207',
    marginBottom: 2,
  },
  unconfiguredBody: {
    fontSize: 12,
    color: '#713f12',
    lineHeight: 16,
  },
  prefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  prefixLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  prefixPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  prefixPillActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  prefixPillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  prefixPillTextActive: {
    color: '#15803d',
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  clearBtn: {
    padding: 4,
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
  button: {
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
  },
  buttonDisabled: {
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
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  hintText: {
    fontSize: 11,
    color: '#15803d',
    flex: 1,
    lineHeight: 16,
  },
});
