# SMD OTP App

An Expo (SDK 58) React Native app that signs users in with **Firebase Phone Authentication (OTP)** using the Firebase JS SDK. It runs on **Android, iOS (Expo Go)** and **Web**.

The default setup uses **Firebase test phone numbers**, so the whole flow works without real SMS, billing, or reCAPTCHA.

---

## Features

- Phone number → OTP → signed-in profile flow (Firebase `signInWithPhoneNumber`)
- **Test mode** (`EXPO_PUBLIC_FIREBASE_AUTH_TEST_MODE=true`): skips reCAPTCHA so Firebase test numbers work in Expo Go
- reCAPTCHA via a WebView on native and an invisible verifier on web (used when test mode is off)
- Firebase config from `.env`, or pasted at runtime in the in-app **Settings** screen (saved in AsyncStorage)
- Persistent login (AsyncStorage persistence on native)
- Safe-area aware layout (works with Android edge-to-edge)
- Clear error messages for common Firebase errors (blocked SMS region, wrong code, quota, etc.)

---

## Requirements

- Node.js 20+
- [Expo Go](https://expo.dev/go) on your phone, or a web browser
- A Firebase project

---

## Getting started

```bash
npm install
cp .env.example .env      # then fill in your Firebase values (see below)
npx expo start -c
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS), or press `w` for web.

> **Restart with `-c` after every `.env` change.** `EXPO_PUBLIC_*` variables are baked into the bundle at build time.

---

## Firebase setup

### 1. Create a project and a Web app
1. Open the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. **Project settings → General → Your apps → Web (`</>`)**, then register an app.
3. Copy the values from the `firebaseConfig` snippet into `.env`.

### 2. Enable Phone sign-in and add a test number
1. **Build → Authentication → Sign-in method → Phone**, then **Enable**.
2. Under **Phone numbers for testing**, add a number and code, for example:
   - Phone: `+1 650 555 1234`
   - Code: `123456`
3. Save.

### 3. Allow the SMS region (required)
**Authentication → Settings → SMS region policy**: allow the country of your test/real numbers (e.g. *United States* for `+1`, *Pakistan* for `+92`), or turn the policy off.

If you skip this step you get `auth/operation-not-allowed`: *"SMS unable to be sent until this region enabled by the app developer"*, even though Phone sign-in is enabled.

---

## Environment variables

`.env` (never commit it; it is git-ignored):

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# true  = skip reCAPTCHA; ONLY Firebase "Phone numbers for testing" work (no real SMS)
# false = real SMS with reCAPTCHA challenge
EXPO_PUBLIC_FIREBASE_AUTH_TEST_MODE=true
```

**Config priority:** a config saved from the in-app **Settings** screen overrides `.env`. Use **Settings → Remove Configuration & Disconnect** to go back to the `.env` values.

---

## Using the app

1. Enter the test number (e.g. `+1 650 555 1234`) and tap **Send Firebase OTP**.
2. Enter the code you set in the console (e.g. `123456`) and verify.
3. The profile screen shows the Firebase user (UID, phone). Tap **Sign Out from Firebase** to start again.

The **help (?)** icon in the header opens a guide on test numbers. The **gear** icon opens Firebase settings.

---

## Real SMS (test mode off)

Set `EXPO_PUBLIC_FIREBASE_AUTH_TEST_MODE=false` and restart with `npx expo start -c`. The app then shows a reCAPTCHA challenge before sending the SMS. Notes:
- The region of the number must be allowed in the SMS region policy.
- Firebase may require the **Blaze** plan for real SMS on newer projects; test numbers work on Spark.
- On web, add your domain (e.g. `localhost`) under **Authentication → Settings → Authorized domains**.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `auth/operation-not-allowed` / "region enabled by the app developer" | Allow the country in **SMS region policy** |
| reCAPTCHA still appears in test mode | `.env` not reloaded: stop Metro, run `npx expo start -c`, reopen the app |
| `undefined is not a function` after reCAPTCHA | Stale bundle from an old version: restart with `-c` |
| `auth/invalid-verification-code` | Code doesn't match the one set for that test number |
| Wrong project used | A config saved in Settings overrides `.env`; remove it in Settings |

---

## Scripts

```bash
npx expo start          # dev server (add -c to clear cache)
npx expo start --web    # web
npx expo lint           # lint
npx expo-doctor         # check dependencies/config
```

---

## Project structure

```
App.js                          # Root: state, auth flow, modals
app.json                        # Expo config
metro.config.js                 # Adds .cjs support for Firebase
.env.example                    # Env template
src/
├── components/
│   ├── Header.js               # Status badge, guide & settings buttons
│   ├── PhoneInputStep.js       # Phone number entry
│   ├── OtpVerificationStep.js  # OTP entry, paste, resend timer
│   ├── UserProfileStep.js      # Signed-in user & sign-out
│   ├── ConfigModal.js          # Paste/save/remove Firebase config
│   ├── FreeTierGuideModal.js   # Test-number guide
│   └── RecaptchaModal.js       # reCAPTCHA verifier (WebView native / DOM web)
├── config/
│   ├── firebaseConfig.js       # Load/save/parse config (AsyncStorage + .env)
│   └── firebaseService.js      # Firebase init, auth persistence, test mode
├── services/
│   └── authService.js          # sendPhoneOtp / verifyOtp
└── utils/
    └── errorMessages.js        # Friendly Firebase error messages
```

## License

See [LICENSE](LICENSE).
