import React, { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FirebaseAuth from 'firebase/auth';

/**
 * Universal reCAPTCHA Verifier Modal for Firebase Phone Authentication.
 * - On Web: Sets up RecaptchaVerifier on the DOM.
 * - On Native (iOS/Android): Renders a modal containing WebView with Firebase reCAPTCHA.
 */
const RecaptchaModal = forwardRef(({ firebaseConfig, auth }, ref) => {
  const [visible, setVisible] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const resolverRef = useRef(null);
  const webRecaptchaVerifierRef = useRef(null);

  // Setup Web reCAPTCHA on web platform
  useEffect(() => {
    if (Platform.OS === 'web' && auth) {
      try {
        let container = document.getElementById('firebase-recaptcha-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'firebase-recaptcha-container';
          document.body.appendChild(container);
        }

        webRecaptchaVerifierRef.current = new FirebaseAuth.RecaptchaVerifier(
          auth,
          'firebase-recaptcha-container',
          {
            size: 'invisible',
            callback: () => {
              // reCAPTCHA solved
            },
            'expired-callback': () => {
              console.warn('Web reCAPTCHA expired');
            },
          }
        );
      } catch (err) {
        console.warn('Failed to initialize Web RecaptchaVerifier:', err);
      }
    }

    return () => {
      if (webRecaptchaVerifierRef.current) {
        try {
          webRecaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, [auth]);

  // Expose an ApplicationVerifier interface
  useImperativeHandle(ref, () => ({
    type: 'recaptcha',
    verify: () => {
      if (Platform.OS === 'web') {
        if (webRecaptchaVerifierRef.current) {
          return webRecaptchaVerifierRef.current.verify();
        }
        return Promise.reject(new Error('Web reCAPTCHA verifier not initialized.'));
      }

      // Native (iOS/Android) in test mode: Firebase accepts any token for
      // test phone numbers, so skip the WebView challenge entirely.
      if (auth?.settings?.appVerificationDisabledForTesting) {
        return Promise.resolve(`test-mode-token-${Date.now()}`);
      }

      setWebViewLoading(true);
      setVisible(true);

      return new Promise((resolve, reject) => {
        resolverRef.current = { resolve, reject };
      });
    },
    // Firebase calls verifier._reset() after every phone request (success or
    // failure). Without it signInWithPhoneNumber throws a TypeError on native.
    _reset: () => {
      if (Platform.OS === 'web') {
        webRecaptchaVerifierRef.current?._reset?.();
      }
    },
  }), [auth]);

  const handleClose = () => {
    setVisible(false);
    if (resolverRef.current) {
      resolverRef.current.reject({
        code: 'auth/captcha-check-failed',
        message: 'reCAPTCHA verification was cancelled.',
      });
      resolverRef.current = null;
    }
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loaded') {
        setWebViewLoading(false);
      } else if (data.type === 'success' && data.token) {
        setVisible(false);
        if (resolverRef.current) {
          resolverRef.current.resolve(data.token);
          resolverRef.current = null;
        }
      } else if (data.type === 'error') {
        setVisible(false);
        if (resolverRef.current) {
          resolverRef.current.reject({
            code: 'auth/captcha-check-failed',
            message: data.message || 'reCAPTCHA challenge failed',
          });
          resolverRef.current = null;
        }
      }
    } catch (err) {
      console.error('Failed to parse WebView message:', err);
    }
  };

  if (Platform.OS === 'web') {
    return null; // Handled via DOM
  }

  const safeConfig = {
    apiKey: firebaseConfig?.apiKey || '',
    authDomain: firebaseConfig?.authDomain || '',
    projectId: firebaseConfig?.projectId || '',
    storageBucket: firebaseConfig?.storageBucket || '',
    messagingSenderId: firebaseConfig?.messagingSenderId || '',
    appId: firebaseConfig?.appId || '',
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 24px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #f3fbf6;
            color: #064e3b;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #064e3b;
          }
          .subtitle {
            font-size: 13px;
            color: #475569;
            font-weight: 600;
            margin-bottom: 8px;
            color: #38bdf8;
            text-align: center;
          }
          .desc {
            font-size: 13px;
            color: #94a3b8;
            margin-bottom: 24px;
            text-align: center;
            max-width: 320px;
          }
          #recaptcha-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80px;
          }
          .badge-free {
            margin-top: 24px;
            padding: 6px 12px;
            background: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.2);
            border-radius: 999px;
            font-size: 12px;
            color: #7dd3fc;
          }
        </style>
        <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"></script>
        <script src="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js"></script>
      </head>
      <body>
        <div class="title">Security Verification</div>
        <div class="desc">Please complete the challenge below to request your verification code.</div>
        
        <div id="recaptcha-container"></div>
        <div class="badge-free">Firebase Phone Authentication (Free Spark Tier)</div>

        <script>
          (function() {
            try {
              var config = ${JSON.stringify(safeConfig)};
              if (!firebase.apps.length) {
                firebase.initializeApp(config);
              }

              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'loaded' }));

              var verifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
                'size': 'normal',
                'callback': function(token) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'success',
                    token: token
                  }));
                },
                'expired-callback': function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'expired'
                  }));
                },
                'error-callback': function(err) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'error',
                    message: (err && err.message) ? err.message : String(err)
                  }));
                }
              });

              verifier.render().catch(function(err) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: (err && err.message) ? err.message : String(err)
                }));
              });
            } catch(e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                message: e.message || String(e)
              }));
            }
          })();
        </script>
      </body>
    </html>
  `;

  const baseUrl = safeConfig.authDomain
    ? `https://${safeConfig.authDomain}`
    : 'https://localhost';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Google reCAPTCHA Verification</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {webViewLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#16a34a" />
            <Text style={styles.loadingText}>Loading Security Check...</Text>
          </View>
        )}

        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent, baseUrl }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={styles.webView}
        />
      </SafeAreaView>
    </Modal>
  );
});

RecaptchaModal.displayName = 'RecaptchaModal';

export default RecaptchaModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f3fbf6',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    color: '#064e3b',
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 8,
  },
  closeText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3fbf6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
    backgroundColor: '#f3fbf6',
  },
});
