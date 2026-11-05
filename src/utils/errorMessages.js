/**
 * Maps Firebase Auth error codes to friendly explanations and troubleshooting tips.
 */
export const formatFirebaseError = (error) => {
  if (!error) return 'An unknown error occurred.';

  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'The phone number format is invalid. Make sure to include the country code (e.g., +1 for USA, +44 for UK, +92 for PK).';
    case 'auth/missing-phone-number':
      return 'Please enter a valid phone number with the country code.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for this Firebase project. Free Spark tier allows up to 10,000 verifications/month. For testing, add test phone numbers in the Firebase Console (they have zero quota limits).';
    case 'auth/too-many-requests':
      return 'Too many requests sent from this device or number. Please wait a few minutes before trying again or use a test phone number.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA verification failed or was cancelled. Please complete the security challenge to continue.';
    case 'auth/invalid-verification-code':
      return 'Incorrect verification code. Please check the 6-digit code and try again.';
    case 'auth/code-expired':
      return 'The SMS verification code has expired. Please request a new code.';
    case 'auth/app-not-authorized':
      return 'App is not authorized to use Firebase Authentication with the provided API key or domain. Add your domain to Firebase Console > Authentication > Settings > Authorized domains.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connectivity.';
    case 'auth/operation-not-allowed':
      if (/region/i.test(message)) {
        return 'SMS is blocked for this phone number\'s country. In Firebase Console go to Authentication > Settings > SMS region policy and allow the region (e.g. United States for +1, Pakistan for +92).';
      }
      return 'Phone authentication is not enabled in your Firebase project. Go to Firebase Console > Authentication > Sign-in method and enable "Phone".';
    default:
      if (message.includes('reCAPTCHA') || message.includes('recaptcha')) {
        return 'reCAPTCHA verification issue. Ensure your domain is listed under Authorized Domains in the Firebase Console.';
      }
      return message || 'An error occurred during authentication. Please try again.';
  }
};
