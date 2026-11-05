import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function UserProfileStep({ user, onSignOut }) {
  const copyUid = async () => {
    if (user?.uid) {
      await Clipboard.setStringAsync(user.uid);
      Alert.alert('Copied', 'Firebase UID copied to clipboard.');
    }
  };

  const creationTime = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleString()
    : 'Just now';

  const lastSignInTime = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : 'Just now';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-done" size={32} color="#16a34a" />
        </View>

        <Text style={styles.title}>Firebase Verified!</Text>
        <Text style={styles.subtitle}>
          Your phone number has been authenticated through Firebase.
        </Text>

        {/* Verified Phone Number */}
        <View style={styles.phoneBadge}>
          <Ionicons name="call" size={16} color="#15803d" />
          <Text style={styles.phoneBadgeText}>{user?.phoneNumber || 'Verified Phone User'}</Text>
        </View>

        {/* User Details Table */}
        <View style={styles.detailsList}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Firebase UID</Text>
            <TouchableOpacity style={styles.uidPill} onPress={copyUid}>
              <Text style={styles.uidText} numberOfLines={1}>
                {user?.uid || 'N/A'}
              </Text>
              <Ionicons name="copy-outline" size={12} color="#15803d" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Provider</Text>
            <View style={styles.badgeSmall}>
              <Text style={styles.badgeSmallText}>phone (Firebase OTP)</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailValue}>{creationTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Sign-In</Text>
            <Text style={styles.detailValue}>{lastSignInTime}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Session</Text>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#dc2626" />
          <Text style={styles.signOutBtnText}>Sign Out from Firebase</Text>
        </TouchableOpacity>
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
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: '#86efac',
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  phoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  phoneBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
  },
  detailsList: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  uidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    maxWidth: 180,
  },
  uidText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#064e3b',
    fontWeight: '600',
  },
  badgeSmall: {
    backgroundColor: '#ecfdf5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  badgeSmallText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#dcfce7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  activeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 13,
  },
  signOutBtnText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '700',
  },
});
