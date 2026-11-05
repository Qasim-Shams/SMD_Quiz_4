import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header({
  isConnected,
  projectId,
  onOpenConfig,
  onOpenGuide,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={22} color="#16a34a" />
          </View>
          <View>
            <Text style={styles.title}>Firebase OTP Auth</Text>
            <Text style={styles.subtitle}>Spark Plan Free Tier</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onOpenGuide}
            accessibilityLabel="Open Firebase Setup Guide"
          >
            <Ionicons name="help-circle-outline" size={22} color="#15803d" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.configButton]}
            onPress={onOpenConfig}
            accessibilityLabel="Firebase Settings"
          >
            <Ionicons name="settings-outline" size={20} color="#16a34a" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Connection Status Badge */}
      <TouchableOpacity
        style={[
          styles.statusBadge,
          isConnected ? styles.statusBadgeConnected : styles.statusBadgeDisconnected,
        ]}
        onPress={onOpenConfig}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.statusDot,
            isConnected ? styles.statusDotConnected : styles.statusDotDisconnected,
          ]}
        />
        <Text
          style={[
            styles.statusText,
            isConnected ? styles.statusTextConnected : styles.statusTextDisconnected,
          ]}
          numberOfLines={1}
        >
          {isConnected
            ? `Firebase Active: ${projectId || 'Connected'}`
            : 'Tap here to configure Firebase credentials'}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={14}
          color={isConnected ? '#15803d' : '#a16207'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#064e3b',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  configButton: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  statusBadgeConnected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  statusBadgeDisconnected: {
    backgroundColor: '#fefce8',
    borderColor: '#fef08a',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotConnected: {
    backgroundColor: '#16a34a',
  },
  statusDotDisconnected: {
    backgroundColor: '#eab308',
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextConnected: {
    color: '#15803d',
  },
  statusTextDisconnected: {
    color: '#a16207',
  },
});
