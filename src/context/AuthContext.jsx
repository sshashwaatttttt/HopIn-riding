import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  db,
  isFirebaseConfigured,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

const ALLOWED_COLLEGE_DOMAINS = ['bbdu.ac.in', 'bbdniit.ac.in', 'bbdnitm.ac.in'];

export const isCollegeDomain = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return ALLOWED_COLLEGE_DOMAINS.some(
    (allowed) => domain === allowed || domain.endsWith('.' + allowed)
  );
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hopin_real_user_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [needsProfile, setNeedsProfile] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  // Sync active user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hopin_real_user_v2', JSON.stringify(user));
    } else {
      localStorage.removeItem('hopin_real_user_v2');
    }
  }, [user]);

  // Helper to fetch user profile from Firestore or local fallback
  const fetchUserProfile = async (uid, email) => {
    // 1. Try Firestore
    if (db) {
      try {
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          return userSnap.data();
        }
      } catch (err) {
        console.warn('Firestore user lookup warning, checking local storage:', err);
      }
    }

    // 2. Try localStorage by UID
    try {
      const saved = localStorage.getItem(`hopin_user_${uid}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // 3. Try active local session if email matches
    try {
      const active = JSON.parse(localStorage.getItem('hopin_real_user_v2') || 'null');
      if (active && (active.id === uid || active.email?.toLowerCase() === email?.toLowerCase())) {
        return active;
      }
    } catch (e) {}

    return null;
  };

  // Helper to process authenticated Google user
  const processAuthenticatedUser = async (fbUser) => {
    const email = (fbUser.email || '').toLowerCase().trim();

    // Verify official BBD college domain
    if (!isCollegeDomain(email)) {
      try {
        await signOut(auth);
      } catch (e) {}
      setLoading(false);
      setPendingGoogleUser(null);
      setNeedsProfile(false);
      const err = `Access Restricted: "${email}" is not a recognized BBD college Google account. Only @bbdu.ac.in, @bbdniit.ac.in, or @bbdnitm.ac.in accounts are permitted.`;
      setAuthError(err);
      return {
        success: false,
        isDomainBlocked: true,
        email,
        message: err
      };
    }

    // Check if user has already registered in the past
    const existingProfile = await fetchUserProfile(fbUser.uid, email);

    if (existingProfile) {
      // Returning user: Log in directly without asking for profile setup again
      setUser(existingProfile);
      setNeedsProfile(false);
      setPendingGoogleUser(null);
      localStorage.setItem('hopin_real_user_v2', JSON.stringify(existingProfile));
      localStorage.setItem(`hopin_user_${fbUser.uid}`, JSON.stringify(existingProfile));
      setLoading(false);
      return { success: true, isNewUser: false, user: existingProfile };
    } else {
      // New user: Trigger profile creation step
      const domain = '@' + email.split('@')[1];
      const pendingData = {
        uid: fbUser.uid,
        email,
        displayName: fbUser.displayName || email.split('@')[0],
        photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        domain
      };
      setPendingGoogleUser(pendingData);
      setNeedsProfile(true);
      setLoading(false);
      return { success: true, isNewUser: true, pendingUser: pendingData };
    }
  };

  // ── Firebase auth state listener & redirect result handler ────────────────
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) return;

    // Check if coming back from signInWithRedirect
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          processAuthenticatedUser(result.user);
        }
      })
      .catch((err) => {
        console.error('getRedirectResult error:', err);
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const email = (fbUser.email || '').toLowerCase().trim();
        if (!isCollegeDomain(email)) {
          try {
            await signOut(auth);
          } catch (e) {}
          return;
        }

        // If no user is loaded in state yet, check if profile exists
        if (!user) {
          const profile = await fetchUserProfile(fbUser.uid, email);
          if (profile) {
            setUser(profile);
            setNeedsProfile(false);
          } else {
            const domain = '@' + email.split('@')[1];
            setPendingGoogleUser({
              uid: fbUser.uid,
              email,
              displayName: fbUser.displayName || email.split('@')[0],
              photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
              domain
            });
            setNeedsProfile(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  // ── Sign in with Google (forces account picker) ───────────────────────────
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      return { success: false, message: 'Firebase authentication is not ready.' };
    }

    setLoading(true);
    setAuthError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return await processAuthenticatedUser(result.user);
    } catch (err) {
      console.error('Google sign-in error:', err);

      if (err.code === 'auth/popup-blocked') {
        // Fallback to redirect on devices where popups are blocked
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true, redirecting: true };
        } catch (redirectErr) {
          setLoading(false);
          setAuthError(redirectErr.message);
          return { success: false, message: redirectErr.message };
        }
      }

      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Sign-in window closed. Please select your college Google account.' };
      }

      let message = err.message || 'Failed to sign in with Google.';
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Google provider is not enabled in Firebase. Please enable "Google" under Firebase Console → Authentication → Sign-in method (takes 10 seconds).';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized in Firebase. Add localhost and your ngrok domain in Firebase Console → Authentication → Settings → Authorized Domains.';
      }

      setAuthError(message);
      return { success: false, code: err.code, message };
    }
  };

  // ── Complete Profile Registration (for New Users) ─────────────────────────
  const completeGoogleProfile = async ({ fullName, gender = 'female', phone = '', branch = '', customAvatar = null }) => {
    if (!pendingGoogleUser) {
      return { success: false, message: 'No pending Google sign-in found. Please sign in with Google first.' };
    }

    setLoading(true);
    try {
      const name = (fullName || pendingGoogleUser.displayName || '').trim();
      const profile = {
        id: pendingGoogleUser.uid,
        name: name || pendingGoogleUser.email.split('@')[0],
        email: pendingGoogleUser.email,
        domain: pendingGoogleUser.domain,
        avatar: customAvatar || pendingGoogleUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(pendingGoogleUser.email)}`,
        gender: gender || 'female',
        phone: phone ? phone.trim() : '',
        branch: branch ? branch.trim() : '',
        rating: 5.0,
        verifiedStatus: 'verified_google',
        joinedAt: new Date().toISOString()
      };

      // Save to Cloud Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'users', pendingGoogleUser.uid), profile, { merge: true });
        } catch (e) {
          console.warn('Could not save user profile to Firestore:', e);
        }
      }

      // Save locally for instant offline/fast loading
      localStorage.setItem(`hopin_user_${pendingGoogleUser.uid}`, JSON.stringify(profile));
      localStorage.setItem('hopin_real_user_v2', JSON.stringify(profile));

      setUser(profile);
      setNeedsProfile(false);
      setPendingGoogleUser(null);
      setLoading(false);
      return { success: true, user: profile };
    } catch (err) {
      setLoading(false);
      console.error('Failed to complete profile:', err);
      return { success: false, message: err.message || 'Failed to save profile.' };
    }
  };

  // ── Cancel pending profile creation / switch account ─────────────────────
  const cancelGoogleSignIn = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {}
    setPendingGoogleUser(null);
    setNeedsProfile(false);
    setAuthError('');
  };

  // ── Update Profile (Avatar, Photo, Name, Gender, Branch, Phone) ─────────────
  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, message: 'Not logged in.' };

    try {
      const updatedProfile = { ...user, ...updates };

      // Save to Cloud Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'users', user.id), updates, { merge: true });
        } catch (e) {
          console.warn('Could not save updated profile to Firestore:', e);
        }
      }

      // Save to localStorage
      localStorage.setItem(`hopin_user_${user.id}`, JSON.stringify(updatedProfile));
      localStorage.setItem('hopin_real_user_v2', JSON.stringify(updatedProfile));

      setUser(updatedProfile);
      return { success: true, user: updatedProfile };
    } catch (err) {
      console.error('Error updating user profile:', err);
      return { success: false, message: err.message || 'Failed to update profile.' };
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.error(e);
      }
    }
    setUser(null);
    setPendingGoogleUser(null);
    setNeedsProfile(false);
    localStorage.removeItem('hopin_real_user_v2');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        needsProfile,
        pendingGoogleUser,
        firebaseReady: isFirebaseConfigured(),
        signInWithGoogle,
        completeGoogleProfile,
        updateUserProfile,
        cancelGoogleSignIn,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
