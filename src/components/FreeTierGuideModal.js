import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function FreeTierGuideModal({ visible, onClose, onSelectTestNumber }) {
  const exampleTestNumber = '+1 650 555 1234';

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.iconCircle}>
              <Ionicons name="book-outline" size={20} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Firebase Phone Auth Guide</Text>
              <Text style={styles.headerSubtitle}>Spark Plan (Free Tier) Setup</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Free Tier Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.badgeRow}>
              <View style={styles.infoBadge}>
                <Ionicons name="sparkles" size={12} color="#15803d" />
                <Text style={styles.infoBadgeText}>Firebase Spark Plan</Text>
              </View>
            </View>
            <Text style={styles.infoTitle}>10,000 Free Phone Verifications / Month</Text>
            <Text style={styles.infoText}>
              Firebase provides 10,000 free SMS phone verifications per month with zero subscription fees. You can use real phone numbers or add test phone numbers in the Firebase Console.
            </Text>
          </View>

          {/* Test Phone Numbers in Firebase Console */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="flash" size={18} color="#16a34a" />
              <Text style={styles.cardTitle}>How to Add Test Phone Numbers in Firebase</Text>
            </View>
            <Text style={styles.cardBodyText}>
              To test without sending real SMS or using quota:
            </Text>

            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#15803d" />
              <Text style={styles.bulletText}>
                Go to <Text style={styles.bold}>Firebase Console &gt; Authentication &gt; Sign-in method &gt; Phone</Text>.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#15803d" />
              <Text style={styles.bulletText}>
                Expand <Text style={styles.bold}>Phone numbers for testing (Optional)</Text>.
              </Text>
            </View>

            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#15803d" />
              <Text style={styles.bulletText}>
                Add your chosen test number and whatever verification code you prefer.
              </Text>
            </View>

            <View style={styles.testExampleRow}>
              <View style={styles.testCol}>
                <Text style={styles.testLabel}>Example Test Number</Text>
                <TouchableOpacity
                  style={styles.copyPill}
                  onPress={() => copyToClipboard(exampleTestNumber)}
                >
                  <Text style={styles.copyPillText}>{exampleTestNumber}</Text>
                  <Ionicons name="copy-outline" size={13} color="#15803d" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.useNumberBtn}
                onPress={() => {
                  if (onSelectTestNumber) onSelectTestNumber(exampleTestNumber);
                  onClose();
                }}
              >
                <Ionicons name="arrow-forward" size={14} color="#ffffff" />
                <Text style={styles.useNumberBtnText}>Use Number</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Steps */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings-outline" size={18} color="#16a34a" />
              <Text style={styles.cardTitle}>Setting Up Credentials in the App</Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepHead}>Get Web App Credentials</Text>
                <Text style={styles.stepDesc}>
                  In Firebase Console &gt; Project Settings &gt; General &gt; Your apps &gt; click the Web (&lt;/&gt;) icon to copy the config object.
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
              <View style={styles.stepContent}>
                <Text style={styles.stepHead}>Save in Settings</Text>
                <Text style={styles.stepDesc}>
                  Open Settings in this app (gear icon), tap &quot;Paste from Clipboard&quot;, then tap &quot;Save &amp; Connect Firebase&quot;.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3fbf6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#064e3b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#059669',
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#064e3b',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2ece5',
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064e3b',
    flex: 1,
  },
  cardBodyText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#1e293b',
  },
  testExampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  testCol: {
    flex: 1,
  },
  testLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  copyPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
  },
  useNumberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  useNumberBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  stepContent: {
    flex: 1,
  },
  stepHead: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f291e',
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
});
