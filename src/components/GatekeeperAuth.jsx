import React, { useState, useEffect } from 'react';
import { useAuth, ALLOWED_COLLEGE_DOMAINS } from '../context/AuthContext';
import { HopInLogo } from './HopInLogo';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  School,
  ArrowRight,
  User,
  Phone,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const GatekeeperAuth = () => {
  const {
    signInWithGoogle,
    signInWithDemoAccount,
    loading,
    authError,
    needsProfile,
    pendingGoogleUser,
    completeGoogleProfile,
    cancelGoogleSignIn
  } = useAuth();

  const [localError, setLocalError] = useState('');

  // Profile creation state (branch section removed)
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('female');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Pre-fill full name when pendingGoogleUser becomes available
  useEffect(() => {
    if (pendingGoogleUser?.displayName) {
      setFullName(pendingGoogleUser.displayName);
    } else if (pendingGoogleUser?.email) {
      setFullName(pendingGoogleUser.email.split('@')[0]);
    }
  }, [pendingGoogleUser]);

  const handleGoogleSignIn = async () => {
    setLocalError('');
    const res = await signInWithGoogle();
    if (!res.success && res.message) {
      setLocalError(res.message);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }

    setSavingProfile(true);
    setLocalError('');
    const res = await completeGoogleProfile({
      fullName: fullName.trim(),
      gender,
      phone: phone.trim()
    });
    setSavingProfile(false);

    if (!res.success) {
      setLocalError(res.message || 'Failed to complete profile.');
    }
  };

  const displayError = localError || authError;

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 2: First-Time Profile Creation Form (Student Profile / Branch Removed)
  // ──────────────────────────────────────────────────────────────────────────
  if (needsProfile && pendingGoogleUser) {
    return (
      <div className="w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="aesthetic-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>

          {/* Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="relative inline-block mx-auto mb-1">
              <img
                src={
                  pendingGoogleUser.photoURL ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(pendingGoogleUser.email)}`
                }
                alt={pendingGoogleUser.displayName || 'Avatar'}
                className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-lg object-cover bg-slate-100 dark:bg-slate-800"
              />
              <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full ring-4 ring-white dark:ring-[#0b0f19] shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
              <span>Complete Your Profile</span>
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Welcome! Set up your student profile to start pooling rides with verified campus batchmates.
            </p>
          </div>

          {/* Verified Account Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Verified College Email
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {pendingGoogleUser.email}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-black shrink-0">
              {pendingGoogleUser.domain}
            </span>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Profile Form (Branch Removed) */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Gender Selection */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>Gender * (Used for 'Girls Only' safe ride matching)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'female', label: 'Female', icon: '👩' },
                  { id: 'male', label: 'Male', icon: '👨' },
                  { id: 'other', label: 'Other', icon: '👤' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGender(item.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                      gender === item.id
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* WhatsApp / Contact (Optional) */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp / Phone Number</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210 (for ride updates)"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={savingProfile || !fullName.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {savingProfile ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Your Profile...</span>
                </>
              ) : (
                <>
                  <span>Complete Profile & Hop In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Account */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={cancelGoogleSignIn}
              className="text-xs font-bold text-slate-500 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Use a different Google account</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 1: Main College Student Google Sign-In Gatekeeper
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="aesthetic-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200/80 dark:border-slate-800/80">
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>

        {/* Brand Header */}
        <div className="text-center space-y-2 pt-2">
          <HopInLogo size={70} className="mx-auto mb-3" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>HopIn</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Live Student Ride-Pooling & Shared Commute Coordination
          </p>
        </div>

        {/* Error Alert Message */}
        {displayError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2 text-left shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div className="space-y-2 w-full">
              <span className="block font-black text-sm text-red-800 dark:text-red-200">
                Access Restricted
              </span>
              <span className="block font-medium leading-relaxed opacity-95 text-red-700 dark:text-red-300">{displayError}</span>
            </div>
          </div>
        )}

        {/* College Domain Gatekeeper Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-3 text-left">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
            <School className="w-4 h-4 text-amber-500" />
            <span>Eligible BBD Institutions</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              @bbdu.ac.in
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              @bbdniit.ac.in
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              @bbdnitm.ac.in
            </span>
          </div>

          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed pt-0.5">
            Personal Gmail accounts are blocked. Please sign in with your official college Google account (<span className="font-bold text-slate-700 dark:text-slate-300">@bbdu.ac.in</span>, <span className="font-bold text-slate-700 dark:text-slate-300">@bbdniit.ac.in</span>, or <span className="font-bold text-slate-700 dark:text-slate-300">@bbdnitm.ac.in</span>).
          </p>
        </div>

        {/* Main "Sign in with Google" Action Button */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 shadow-lg transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-85 disabled:cursor-wait group relative overflow-hidden"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.43 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.97 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.57 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-slate-900 dark:text-white font-black tracking-tight text-sm">
                  Sign in with Google
                </span>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-400 group-hover:text-amber-500 transition-colors" />
              </>
            )}
          </button>

          {!loading && (
            <div className="space-y-1 pt-1 text-center">
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Select your official college Google account</span>
              </p>
            </div>
          )}
        </div>

        {/* Concrete Campus Value Statement */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
          <span>Connect with verified BBD batchmates heading in your direction & split auto/cab fares.</span>
        </div>

        {/* Security / Privacy Trust Badge */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verified Student Domain Access • Safe Campus Commuting</span>
        </div>

      </div>
    </div>
  );
};
