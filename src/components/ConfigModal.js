import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import {
  parseFirebaseConfigSnippet,
  isConfigured,
} from '../config/firebaseConfig';

export default function ConfigModal({
  visible,
  currentConfig,
  onSave,
  onRemove,
  onClose,
}) {
  const [prevConfig, setPrevConfig] = useState(currentConfig);
  const [config, setConfig] = useState(() => ({
    apiKey: currentConfig?.apiKey || '',
    authDomain: currentConfig?.authDomain || '',
    projectId: currentConfig?.projectId || '',
    storageBucket: currentConfig?.storageBucket || '',
    messagingSenderId: currentConfig?.messagingSenderId || '',
    appId: currentConfig?.appId || '',
  }));

  if (currentConfig !== prevConfig) {
    setPrevConfig(currentConfig);
    setConfig({
      apiKey: currentConfig?.apiKey || '',
      authDomain: currentConfig?.authDomain || '',
      projectId: currentConfig?.projectId || '',
      storageBucket: currentConfig?.storageBucket || '',
      messagingSenderId: currentConfig?.messagingSenderId || '',
      appId: currentConfig?.appId || '',
    });
  }

  const [rawSnippet, setRawSnippet] = useState('');
  const [showJsonPaste, setShowJsonPaste] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value.trim() }));
  };

  const handleApplySnippet = () => {
    if (!rawSnippet.trim()) {
      setStatusMessage({ type: 'error', text: 'Please paste your Firebase config snippet first.' });
      return;
    }

    const parsed = parseFirebaseConfigSnippet(rawSnippet);
    if (!parsed) {
      setStatusMessage({
        type: 'error',
        text: 'Could not parse config snippet. Please paste the JSON or "const firebaseConfig = { ... }".',
      });
      return;
    }

    setConfig((prev) => ({
      apiKey: parsed.apiKey || prev.apiKey,
      authDomain: parsed.authDomain || prev.authDomain,
      projectId: parsed.projectId || prev.projectId,
      storageBucket: parsed.storageBucket || prev.storageBucket,
      messagingSenderId: parsed.messagingSenderId || prev.messagingSenderId,
      appId: parsed.appId || prev.appId,
    }));

    setShowJsonPaste(false);
    setRawSnippet('');
    setStatusMessage({ type: 'success', text: 'Firebase config snippet parsed and populated!' });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setRawSnippet(text);
        const parsed = parseFirebaseConfigSnippet(text);
        if (parsed) {
          setConfig((prev) => ({
            apiKey: parsed.apiKey || prev.apiKey,
            authDomain: parsed.authDomain || prev.authDomain,
            projectId: parsed.projectId || prev.projectId,
            storageBucket: parsed.storageBucket || prev.storageBucket,
            messagingSenderId: parsed.messagingSenderId || prev.messagingSenderId,
            appId: parsed.appId || prev.appId,
          }));
          setStatusMessage({ type: 'success', text: 'Clipboard contents parsed and applied!' });
        } else {
          setShowJsonPaste(true);
        }
      } else {
        setStatusMessage({ type: 'error', text: 'Clipboard is empty.' });
      }
    } catch (err) {
      console.warn('Failed to read clipboard:', err);
    }
  };

  const handleSave = async () => {
    if (!config.apiKey || !config.projectId || !config.authDomain) {
      setStatusMessage({
        type: 'error',
        text: 'apiKey, authDomain, and projectId are required to connect.',
      });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    const result = await onSave(config);
    setSaving(false);

    if (result && result.success) {
      setStatusMessage({ type: 'success', text: 'Firebase connected successfully!' });
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setStatusMessage({
        type: 'error',
        text: result?.error || 'Failed to initialize Firebase with these credentials.',
      });
    }
  };

  const handleConfirmRemove = () => {
    Alert.alert(
      'Remove Firebase Configuration',
      'This will erase saved Firebase credentials and disconnect the project. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove & Disconnect',
          style: 'destructive',
          onPress: async () => {
            if (onRemove) {
              await onRemove();
            }
            setConfig({
              apiKey: '',
              authDomain: '',
              projectId: '',
              storageBucket: '',
              messagingSenderId: '',
              appId: '',
            });
            setStatusMessage({ type: 'info', text: 'Configuration removed and project disconnected.' });
          },
        },
      ]
    );
  };

  const currentlyConfigured = isConfigured(currentConfig) || isConfigured(config);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {/* Modal Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleGroup}>
            <View style={styles.iconCircle}>
              <Ionicons name="settings" size={18} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Firebase Settings</Text>
              <Text style={styles.headerSubtitle}>Connect or Remove Configuration</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Status Alert Banner */}
          {statusMessage && (
            <View
              style={[
                styles.statusBanner,
                statusMessage.type === 'error' && styles.statusBannerError,
                statusMessage.type === 'success' && styles.statusBannerSuccess,
                statusMessage.type === 'info' && styles.statusBannerInfo,
              ]}
            >
              <Ionicons
                name={
                  statusMessage.type === 'error'
                    ? 'alert-circle'
                    : statusMessage.type === 'success'
                    ? 'checkmark-circle'
                    : 'information-circle'
                }
                size={18}
                color={
                  statusMessage.type === 'error'
                    ? '#dc2626'
                    : statusMessage.type === 'success'
                    ? '#16a34a'
                    : '#0284c7'
                }
              />
              <Text
                style={[
                  styles.statusBannerText,
                  statusMessage.type === 'error' && styles.statusBannerTextError,
                  statusMessage.type === 'success' && styles.statusBannerTextSuccess,
                  statusMessage.type === 'info' && styles.statusBannerTextInfo,
                ]}
              >
                {statusMessage.text}
              </Text>
            </View>
          )}

          {/* Quick Actions Row */}
          <View style={styles.quickActionsCard}>
            <Text style={styles.cardSectionTitle}>Fast Configuration</Text>
            <Text style={styles.cardSectionSubtitle}>
              Paste the Firebase Web App config directly from your Firebase Console.
            </Text>

            <View style={styles.quickButtonsRow}>
              <TouchableOpacity
                style={styles.actionPillBtn}
                onPress={handlePasteFromClipboard}
              >
                <Ionicons name="clipboard-outline" size={16} color="#15803d" />
                <Text style={styles.actionPillBtnText}>Paste from Clipboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionPillBtnOutline}
                onPress={() => setShowJsonPaste(!showJsonPaste)}
              >
                <Ionicons name="code-slash-outline" size={16} color="#475569" />
                <Text style={styles.actionPillBtnOutlineText}>
                  {showJsonPaste ? 'Hide Snippet Box' : 'Paste Code Snippet'}
                </Text>
              </TouchableOpacity>
            </View>

            {showJsonPaste && (
              <View style={styles.snippetInputContainer}>
                <TextInput
                  style={styles.snippetTextInput}
                  placeholder={`Paste snippet here, e.g.:\nconst firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "your-project",\n  ...\n};`}
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={5}
                  value={rawSnippet}
                  onChangeText={setRawSnippet}
                />
                <TouchableOpacity
                  style={styles.applySnippetBtn}
                  onPress={handleApplySnippet}
                >
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                  <Text style={styles.applySnippetBtnText}>Apply Snippet</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Manual Input Fields */}
          <View style={styles.formCard}>
            <Text style={styles.cardSectionTitle}>Firebase Project Credentials</Text>
            <Text style={styles.cardSectionSubtitle}>
              Found in: Firebase Console &gt; Project Settings &gt; General &gt; Your apps &gt; Web app
            </Text>

            {/* Field: API Key */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>API Key *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="AIzaSy..."
                placeholderTextColor="#94a3b8"
                value={config.apiKey}
                onChangeText={(v) => handleFieldChange('apiKey', v)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Field: Auth Domain */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Auth Domain *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="your-project.firebaseapp.com"
                placeholderTextColor="#94a3b8"
                value={config.authDomain}
                onChangeText={(v) => handleFieldChange('authDomain', v)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Field: Project ID */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Project ID *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="your-project-id"
                placeholderTextColor="#94a3b8"
                value={config.projectId}
                onChangeText={(v) => handleFieldChange('projectId', v)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Field: Storage Bucket */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Storage Bucket (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="your-project.firebasestorage.app"
                placeholderTextColor="#94a3b8"
                value={config.storageBucket}
                onChangeText={(v) => handleFieldChange('storageBucket', v)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Field: Messaging Sender ID */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Messaging Sender ID (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="123456789012"
                placeholderTextColor="#94a3b8"
                value={config.messagingSenderId}
                onChangeText={(v) => handleFieldChange('messagingSenderId', v)}
                keyboardType="numeric"
              />
            </View>

            {/* Field: App ID */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>App ID (optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1:123456789012:web:abcdef"
                placeholderTextColor="#94a3b8"
                value={config.appId}
                onChangeText={(v) => handleFieldChange('appId', v)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <View style={styles.btnRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.saveBtnText}>Connecting to Firebase...</Text>
                </View>
              ) : (
                <View style={styles.btnRow}>
                  <Ionicons name="link" size={18} color="#ffffff" />
                  <Text style={styles.saveBtnText}>Save & Connect Firebase</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Prominent Remove / Reset Button */}
            {currentlyConfigured && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={handleConfirmRemove}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
                <Text style={styles.removeBtnText}>Remove Configuration & Disconnect</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statusBannerError: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusBannerSuccess: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  statusBannerInfo: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  statusBannerText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  statusBannerTextError: {
    color: '#b91c1c',
  },
  statusBannerTextSuccess: {
    color: '#15803d',
    fontWeight: '600',
  },
  statusBannerTextInfo: {
    color: '#0369a1',
  },
  quickActionsCard: {
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
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#064e3b',
    marginBottom: 4,
  },
  cardSectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 16,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionPillBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d',
  },
  actionPillBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  actionPillBtnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  snippetInputContainer: {
    marginTop: 14,
    gap: 10,
  },
  snippetTextInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 12,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#0f172a',
    textAlignVertical: 'top',
    height: 110,
  },
  applySnippetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 10,
  },
  applySnippetBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2ece5',
    marginBottom: 20,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveBtn: {
    backgroundColor: '#16a34a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtnDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
  },
  removeBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
  },
});
