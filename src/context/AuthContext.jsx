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

// Verified College Domains (BBD Institutions)
export const ALLOWED_COLLEGE_DOMAINS = [
  {
    domain: 'bbdu.ac.in',
    org: 'BBD University',
    category: 'University Campus',
    hub: 'BBDU Main Gate',
    hubCoords: { lat: 26.8906, lng: 81.0592 }
  },
  {
    domain: 'bbdniit.ac.in',
    org: 'BBD NIIT',
    category: 'Engineering & Tech Campus',
    hub: 'BBDU Main Gate',
    hubCoords: { lat: 26.8906, lng: 81.0592 }
  },
  {
    domain: 'bbdnitm.ac.in',
    org: 'BBD NITM',
    category: 'Management & Tech Campus',
    hub: 'BBDU Main Gate',
    hubCoords: { lat: 26.8906, lng: 81.0592 }
  }
];

export const ALLOWED_DOMAINS = ALLOWED_COLLEGE_DOMAINS;

export const isCollegeDomain = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return ALLOWED_COLLEGE_DOMAINS.some(
    (item) => domain === item.domain || domain.endsWith('.' + item.domain)
  );
};

export const isAllowedDomain = isCollegeDomain;

export const getDomainOrgInfo = (emailOrDomain) => {
  if (!emailOrDomain) return null;
  const clean = emailOrDomain.replace(/^@/, '').toLowerCase().trim();
  const domain = clean.includes('@') ? clean.split('@')[1] : clean;
  return ALLOWED_COLLEGE_DOMAINS.find(item => domain === item.domain || domain?.endsWith('.' + item.domain)) || null;
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

    try {
      const saved = localStorage.getItem(`hopin_user_${uid}`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    try {
      const active = JSON.parse(localStorage.getItem('hopin_real_user_v2') || 'null');
      if (active && (active.id === uid || active.email?.toLowerCase() === email?.toLowerCase())) {
        return active;
      }
    } catch (e) {}

    return null;
  };

  // Process authenticated Google user
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
      const err = `Access Restricted: "${email}" is not a recognized BBD college Google account. Only @bbdu.ac.in, @bbdniit.ac.in, or @bbdnitm.ac.in student accounts are permitted.`;
      setAuthError(err);
      return {
        success: false,
        isDomainBlocked: true,
        email,
        message: err
      };
    }

    // Check if user has registered previously
    const existingProfile = await fetchUserProfile(fbUser.uid, email);

    if (existingProfile) {
      setUser(existingProfile);
      setNeedsProfile(false);
      setPendingGoogleUser(null);
      localStorage.setItem('hopin_real_user_v2', JSON.stringify(existingProfile));
      localStorage.setItem(`hopin_user_${fbUser.uid}`, JSON.stringify(existingProfile));
      setLoading(false);
      return { success: true, isNewUser: false, user: existingProfile };
    } else {
      const domain = '@' + email.split('@')[1];
      const orgInfo = getDomainOrgInfo(email);
      const pendingData = {
        uid: fbUser.uid,
        email,
        displayName: fbUser.displayName || email.split('@')[0],
        photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        domain,
        organization: orgInfo ? orgInfo.org : 'BBD University',
        hub: 'BBDU Main Gate'
      };
      setPendingGoogleUser(pendingData);
      setNeedsProfile(true);
      setLoading(false);
      return { success: true, isNewUser: true, pendingUser: pendingData };
    }
  };

  // Listen for redirect results and auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) return;

    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          processAuthenticatedUser(result.user);
        }
      })
      .catch((err) => {
        console.error('getRedirectResult error:', err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          const email = (fbUser.email || '').toLowerCase().trim();
          if (!isCollegeDomain(email)) {
            try {
              await signOut(auth);
            } catch (e) {}
            return;
          }

          if (!user) {
            const profile = await fetchUserProfile(fbUser.uid, email);
            if (profile) {
              setUser(profile);
              setNeedsProfile(false);
            } else {
              const domain = '@' + email.split('@')[1];
              const orgInfo = getDomainOrgInfo(email);
              setPendingGoogleUser({
                uid: fbUser.uid,
                email,
                displayName: fbUser.displayName || email.split('@')[0],
                photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
                domain,
                organization: orgInfo ? orgInfo.org : 'BBD University',
                hub: 'BBDU Main Gate'
              });
              setNeedsProfile(true);
            }
          }
        }
      } catch (err) {
        console.error('onAuthStateChanged error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured() || !auth || !googleProvider) {
      return { success: false, message: 'Firebase authentication is not ready.' };
    }

    setLoading(true);
    setAuthError('');

    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        const timeoutErr = new Error('Google sign-in window took too long to respond. Please check if a popup was blocked, or tap Retry.');
        timeoutErr.code = 'auth/timeout';
        reject(timeoutErr);
      }, 12000);
    });

    try {
      const signInPromise = signInWithPopup(auth, googleProvider);
      const result = await Promise.race([signInPromise, timeoutPromise]);
      clearTimeout(timeoutId);
      return await processAuthenticatedUser(result.user);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Google sign-in error:', err);

      if (err.code === 'auth/popup-blocked') {
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
        return { success: false, message: 'Sign-in window closed. Please select your official college Google account.' };
      }

      let message = err.message || 'Failed to sign in with Google.';
      if (err.code === 'auth/timeout') {
        message = 'Connection to Google timed out. If a pop-up was blocked or hidden, please tap Retry.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Google provider is not enabled in Firebase. Please enable "Google" under Firebase Console → Authentication → Sign-in method.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized in Firebase. Add localhost and your live domain in Firebase Console → Authentication → Settings → Authorized Domains.';
      }

      setAuthError(message);
      return { success: false, code: err.code, message };
    }
  };

  // 1-Click Test Sign-In for BBD Campus
  const signInWithDemoAccount = async () => {
    const demoEmail = 'student@bbdu.ac.in';
    const demoProfile = {
      id: 'user-demo-bbdu',
      name: 'BBD Student',
      email: demoEmail,
      domain: '@bbdu.ac.in',
      organization: 'BBD University',
      hub: 'BBDU Main Gate',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(demoEmail)}`,
      gender: 'female',
      phone: '9876543210',
      rating: 5.0,
      verifiedStatus: 'verified_google',
      joinedAt: new Date().toISOString()
    };

    localStorage.setItem(`hopin_user_${demoProfile.id}`, JSON.stringify(demoProfile));
    localStorage.setItem('hopin_real_user_v2', JSON.stringify(demoProfile));
    setUser(demoProfile);
    setNeedsProfile(false);
    setPendingGoogleUser(null);
    return { success: true, user: demoProfile };
  };

  // Complete Profile Registration
  const completeGoogleProfile = async ({ fullName, gender = 'female', phone = '', customAvatar = null }) => {
    if (!pendingGoogleUser) {
      return { success: false, message: 'No pending Google sign-in found. Please sign in first.' };
    }

    setLoading(true);
    try {
      const name = (fullName || pendingGoogleUser.displayName || '').trim();
      const orgInfo = getDomainOrgInfo(pendingGoogleUser.email);
      const profile = {
        id: pendingGoogleUser.uid,
        name: name || pendingGoogleUser.email.split('@')[0],
        email: pendingGoogleUser.email,
        domain: pendingGoogleUser.domain,
        organization: orgInfo ? orgInfo.org : 'BBD University',
        hub: 'BBDU Main Gate',
        avatar: customAvatar || pendingGoogleUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(pendingGoogleUser.email)}`,
        gender: gender || 'female',
        phone: phone ? phone.trim() : '',
        rating: 5.0,
        verifiedStatus: 'verified_google',
        joinedAt: new Date().toISOString()
      };

      if (db) {
        try {
          await setDoc(doc(db, 'users', pendingGoogleUser.uid), profile, { merge: true });
        } catch (e) {
          console.warn('Could not save user profile to Firestore:', e);
        }
      }

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

  const cancelGoogleSignIn = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {}
    setPendingGoogleUser(null);
    setNeedsProfile(false);
    setAuthError('');
  };

  const updateUserProfile = async (updates) => {
    if (!user) return { success: false, message: 'Not logged in.' };

    try {
      const updatedProfile = { ...user, ...updates };

      if (db) {
        try {
          await setDoc(doc(db, 'users', user.id), updates, { merge: true });
        } catch (e) {
          console.warn('Could not save updated profile to Firestore:', e);
        }
      }

      localStorage.setItem(`hopin_user_${user.id}`, JSON.stringify(updatedProfile));
      localStorage.setItem('hopin_real_user_v2', JSON.stringify(updatedProfile));

      setUser(updatedProfile);
      return { success: true, user: updatedProfile };
    } catch (err) {
      console.error('Error updating user profile:', err);
      return { success: false, message: err.message || 'Failed to update profile.' };
    }
  };

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
        signInWithDemoAccount,
        completeGoogleProfile,
        completeUserProfile: completeGoogleProfile,
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
