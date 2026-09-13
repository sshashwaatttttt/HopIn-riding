/**
 * Firebase configuration for HopIn PWA
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * SETUP INSTRUCTIONS — 5 minutes, completely FREE:
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. Go to https://console.firebase.google.com
 * 2. Click "Add project" → name it "HopIn BBD" → Create project
 * 3. Click the Web icon (</>) → Register app as "hopin-pwa" → Continue
 * 4. Copy the firebaseConfig values and PASTE them below (replacing placeholders)
 * 5. In Firebase Console → Authentication → Get started → Sign-in method:
 *      ✅ Enable "Email/Password"
 *      ✅ Enable "Email link (passwordless sign-in)"
 * 6. Go to Authentication → Settings → Authorized domains:
 *      Add your deployed domain (e.g. hopin-bbd.vercel.app)
 *      Also add: localhost
 * 7. Save. Done! Real OTPs will now reach every student's Gmail inbox.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';

// Firebase project config for HopIn BBD
const firebaseConfig = {
  apiKey: "AIzaSyB5Aivr3c2Nca3tqEX3tid33vi6UHx6GYw",
  authDomain: "hopin-bbd.firebaseapp.com",
  projectId: "hopin-bbd",
  storageBucket: "hopin-bbd.firebasestorage.app",
  messagingSenderId: "284555919273",
  appId: "1:284555919273:web:bf20ffa6074707b9f8ceb8",
  measurementId: "G-XXWNCQZHRZ"
};

// Check if Firebase is properly configured
export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('REPLACE'));

let app = null;
let auth = null;
let db = null;
let analytics = null;
let googleProvider = null;

if (isFirebaseConfigured()) {
  // Avoid duplicate initialization in hot-reload environments
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
}

export {
  auth,
  db,
  analytics,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
};

export default app;
