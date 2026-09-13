import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HopInLogo } from './HopInLogo';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  School,
  ArrowRight,
  Lock,
  User,
  Phone,
  GraduationCap,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const GatekeeperAuth = () => {
  const {
    signInWithGoogle,
    loading,
    authError,
    needsProfile,
    pendingGoogleUser,
    completeGoogleProfile,
    cancelGoogleSignIn
  } = useAuth();

  const [localError, setLocalError] = useState('');

  // Profile creation state
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('female');
  const [branch, setBranch] = useState('B.Tech CSE');
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
      branch: branch.trim(),
      phone: phone.trim()
    });
    setSavingProfile(false);

    if (!res.success) {
      setLocalError(res.message || 'Failed to complete profile.');
    }
  };

  const displayError = localError || authError;

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 2: First-Time Profile Creation Form (Vibrant Colors)
  // ──────────────────────────────────────────────────────────────────────────
  if (needsProfile && pendingGoogleUser) {
    return (
      <div className="w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
        {/* Card outer gradient glow border */}
        <div className="p-[1.5px] rounded-3xl bg-gradient-to-b from-amber-500/50 via-purple-500/40 to-cyan-500/50 shadow-2xl shadow-amber-500/10">
          <div className="bg-[#0e121d]/95 backdrop-blur-2xl rounded-[23px] p-6 sm:p-8 space-y-6 relative overflow-hidden text-white">
            
            {/* Top ambient color bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400"></div>

            {/* Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="relative inline-block mx-auto mb-1">
                <img
                  src={
                    pendingGoogleUser.photoURL ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(pendingGoogleUser.email)}`
                  }
                  alt={pendingGoogleUser.displayName || 'Avatar'}
                  className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-xl shadow-amber-500/20 object-cover bg-gray-800"
                />
                <span className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full ring-4 ring-[#0e121d] shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              
              <h1 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  Complete Your Profile
                </span>
                <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              </h1>
              <p className="text-xs font-semibold text-gray-400">
                Welcome! Set up your student profile to start pooling rides.
              </p>
            </div>

            {/* Verified College Account Pill */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/50 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">
                    Verified College Email
                  </p>
                  <p className="text-xs font-bold text-gray-200 truncate">
                    {pendingGoogleUser.email}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black shrink-0">
                {pendingGoogleUser.domain}
              </span>
            </div>

            {/* Error Message */}
            {displayError && (
              <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{displayError}</span>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700/80 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all placeholder:text-gray-500"
                />
              </div>

              {/* Gender Selection */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-300">
                  <span>Gender * (Used for 'Girls Only' safe ride matching)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'female', label: 'Female', icon: '👩', activeBg: 'from-pink-500 to-rose-600 border-pink-400 shadow-pink-500/30' },
                    { id: 'male', label: 'Male', icon: '👨', activeBg: 'from-blue-600 to-cyan-600 border-blue-400 shadow-blue-500/30' },
                    { id: 'other', label: 'Other', icon: '👤', activeBg: 'from-purple-600 to-indigo-600 border-purple-400 shadow-purple-500/30' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGender(item.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                        gender === item.id
                          ? `bg-gradient-to-r ${item.activeBg} text-white shadow-lg scale-102`
                          : 'bg-gray-900/80 text-gray-400 border-gray-800 hover:border-gray-700 hover:text-gray-200'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch / Course */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Branch / Course</span>
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700/80 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all cursor-pointer"
                >
                  <option value="B.Tech CSE">B.Tech Computer Science (CSE)</option>
                  <option value="B.Tech IT">B.Tech Information Technology</option>
                  <option value="B.Tech AI/ML">B.Tech AI & Data Science</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Pharm">B.Pharm / Pharmacy</option>
                  <option value="BA LLB">Law / BA LLB</option>
                  <option value="B.Com">B.Com</option>
                  <option value="Other">Other Department</option>
                </select>
              </div>

              {/* WhatsApp / Contact (Optional) */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-gray-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp / Phone</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">Optional</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210 (for ride updates)"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/90 border border-gray-700/80 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all placeholder:text-gray-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={savingProfile || !fullName.trim()}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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
                className="text-xs font-bold text-gray-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different Google account</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 1: Main Google Sign-In Gatekeeper (Vibrant Colorful UI)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in zoom-in-95 duration-300">
      {/* Outer Card with Dynamic Multi-Color Gradient Border & Glow */}
      <div className="p-[1.5px] rounded-3xl bg-gradient-to-b from-amber-500/60 via-purple-500/40 to-cyan-500/60 shadow-2xl shadow-amber-500/15">
        <div className="bg-[#0c101a]/95 backdrop-blur-3xl rounded-[23px] p-6 sm:p-8 space-y-6 relative overflow-hidden text-white">
          
          {/* Top ambient glowing rainbow strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400"></div>

          {/* Brand Header */}
          <div className="text-center space-y-2 pt-2">
            <HopInLogo size={70} className="mx-auto mb-3" />
            <h1 className="text-3xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                HopIn
              </span>
            </h1>
            <p className="text-xs font-semibold text-gray-400 max-w-xs mx-auto leading-relaxed">
              Live Student Ride-Pooling & Shared Commute Coordination
            </p>
          </div>

          {/* Error Alert Message with 1-Click Firebase helper */}
          {displayError && (
            <div className="p-4 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-300 text-xs font-bold flex items-start gap-2.5 animate-in slide-in-from-top-2 text-left shadow-lg">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <div className="space-y-2 w-full">
                <span className="block font-black text-sm text-red-200">
                  {displayError.includes('Google provider is not enabled') || displayError.includes('auth/operation-not-allowed')
                    ? 'Action Required: Enable Google Provider'
                    : 'Access Restricted'}
                </span>
                <span className="block font-medium leading-relaxed opacity-95 text-red-300">{displayError}</span>
                {(displayError.includes('Firebase Console') || displayError.includes('operation-not-allowed')) && (
                  <a
                    href="https://console.firebase.google.com/project/hopin-bbd/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 mt-1 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-extrabold transition-all shadow-md active:scale-95"
                  >
                    <span>Enable Google in Firebase Console (1-Click)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* College Domain Gatekeeper Card with Vibrant Color Pills */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-gray-950/90 border border-gray-800/90 space-y-3 text-left shadow-inner">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <School className="w-4 h-4 text-amber-400" />
              <span>Eligible BBD Institutions</span>
            </div>

            {/* Three distinct vibrant colorful pills */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40 shadow-sm shadow-emerald-500/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                @bbdu.ac.in
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/40 shadow-sm shadow-cyan-500/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                @bbdniit.ac.in
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-purple-300 text-xs font-black border border-purple-500/40 shadow-sm shadow-purple-500/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                @bbdnitm.ac.in
              </span>
            </div>

            <p className="text-[11px] font-medium text-gray-400 leading-relaxed pt-0.5">
              Personal Gmail accounts are blocked. Please choose your official college Google account (<span className="font-bold text-gray-300">@bbdu.ac.in</span>, <span className="font-bold text-gray-300">@bbdniit.ac.in</span>, or <span className="font-bold text-gray-300">@bbdnitm.ac.in</span>).
            </p>
          </div>

          {/* Main "Sign in with Google" Action Button & Recovery Flow */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-sm border-2 border-white/80 hover:border-amber-400 shadow-xl shadow-white/10 transition-all flex items-center justify-center gap-3 active:scale-98 disabled:opacity-85 disabled:cursor-wait group relative overflow-hidden"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Multi-Color Google "G" Icon */}
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
                  <span className="text-gray-900 font-black tracking-tight text-sm">
                    Sign in with Google
                  </span>
                  <ArrowRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-amber-600 transition-colors" />
                </>
              )}
            </button>

            {/* Recovery Action if Stalled */}
            {loading && (
              <div className="flex items-center justify-center gap-2 pt-1 animate-in fade-in duration-300">
                <span className="text-[11px] text-gray-400">Taking longer than expected?</span>
                <button
                  type="button"
                  onClick={() => cancelGoogleSignIn()}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  Cancel & Retry
                </button>
              </div>
            )}

            {!loading && (
              <div className="space-y-1.5 pt-1 text-center">
                <p className="text-[11px] font-medium text-gray-300 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Choose your official college Google account on your device</span>
                </p>
                <p className="text-[10px] text-gray-400">
                  Wrong account selected? Tap above and choose <em>"Use another account"</em> in the Google prompt.
                </p>
              </div>
            )}
          </div>

          {/* Concrete Campus Value Statement */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs font-semibold flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Connect with verified BBD batchmates heading in your direction & split auto/cab fares.</span>
          </div>

          {/* Security / Privacy Trust Badge */}
          <div className="pt-2 border-t border-gray-800/80 flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Student Domain Access • Safe Campus Commuting</span>
          </div>

        </div>
      </div>
    </div>
  );
};
