import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getBlockedUsers, unblockUser, subscribeToSync } from '../utils/store';
import {
  ShieldCheck,
  ShieldAlert,
  Star,
  Sparkles,
  LogOut,
  CheckCircle2,
  Dices,
  User,
  Phone,
  GraduationCap,
  Save,
  Check,
  RefreshCw,
  Palette,
  UserX,
  UserCheck
} from 'lucide-react';

// Curated stylish avatar presets
const PRESET_AVATARS = [
  // Cyber Bots
  { id: 'bot-1', name: 'Cyber Neon', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberNeon' },
  { id: 'bot-2', name: 'Matrix Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=MatrixBot' },
  { id: 'bot-3', name: 'Quantum AI', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumAI' },
  { id: 'bot-4', name: 'Astro Mech', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AstroMech' },
  // Adventurers / Students
  { id: 'adv-1', name: 'Aria', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria' },
  { id: 'adv-2', name: 'Leo', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo' },
  { id: 'adv-3', name: 'Maya', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Maya' },
  { id: 'adv-4', name: 'Kabir', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Kabir' },
  // Cool Expressive Faces
  { id: 'lore-1', name: 'Zara', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zara' },
  { id: 'lore-2', name: 'Rohan', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Rohan' },
  { id: 'lore-3', name: 'Ananya', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Ananya' },
  { id: 'lore-4', name: 'Vikram', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Vikram' }
];

export const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'female');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // UI status
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Blocked users management state
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [unblockNotice, setUnblockNotice] = useState('');

  useEffect(() => {
    setBlockedUsers(getBlockedUsers());
    const unsubscribe = subscribeToSync(() => {
      setBlockedUsers(getBlockedUsers());
    });
    return () => unsubscribe();
  }, []);

  const handleUnblock = (targetUserId, targetUserName) => {
    unblockUser(targetUserId);
    setBlockedUsers(getBlockedUsers());
    setUnblockNotice(`${targetUserName || 'Member'} unblocked successfully.`);
    setTimeout(() => setUnblockNotice(''), 3500);
  };

  if (!user) return null;

  // Generate random avatar
  const handleRandomizeAvatar = async () => {
    const randomSeed = 'hopin_' + Math.random().toString(36).substring(2, 9);
    const styles = ['bottts', 'adventurer', 'lorelei'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const newAvatarUrl = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`;
    
    setAvatar(newAvatarUrl);
    await updateUserProfile({ avatar: newAvatarUrl });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Select preset avatar
  const handleSelectPreset = async (presetUrl) => {
    setAvatar(presetUrl);
    setShowAvatarPicker(false);
    await updateUserProfile({ avatar: presetUrl });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Save all profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    const res = await updateUserProfile({
      name: name.trim(),
      gender,
      phone: phone.trim(),
      avatar
    });
    setSaving(false);

    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      alert(res.message || 'Failed to save changes.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-4 space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Main Profile & Avatar Card */}
      <div className="aesthetic-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80">
        
        {/* Top ambient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>

        {/* ── Avatar Customization ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl p-1 bg-slate-100 dark:bg-slate-800 border-2 border-amber-500 shadow-md">
              <img
                src={avatar || user.avatar}
                alt={user.name}
                className="w-full h-full rounded-[22px] object-cover bg-slate-100 dark:bg-slate-800"
              />
            </div>

            {/* Verified student check badge */}
            <span className="absolute -top-1 -left-1 p-1.5 rounded-xl bg-emerald-500 text-white shadow ring-2 ring-white dark:ring-[#0b0f19]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {user.name}
            </h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{user.email}</span>
              <span className="font-black text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20">
                {user.domain}
              </span>
            </div>
          </div>

          {/* Avatar Customization Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 w-full">
            {/* Choose avatar gallery */}
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-md border ${
                showAvatarPicker
                  ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20 scale-102'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200/60 dark:border-gray-700'
              }`}
            >
              <Palette className="w-4 h-4 text-pink-500" />
              <span>{showAvatarPicker ? 'Close Avatars' : 'Pick Avatar 🎭'}</span>
            </button>

            {/* Randomize dice */}
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-black flex items-center gap-2 transition-all active:scale-95 shadow-md border border-gray-200/60 dark:border-gray-700"
            >
              <Dices className="w-4 h-4 text-cyan-500" />
              <span>Shuffle 🎲</span>
            </button>
          </div>

          {/* ── Preset Avatar Picker Drawer ───────────────────────────────── */}
          {showAvatarPicker && (
            <div className="w-full pt-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3 text-left">
                <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Choose Your HopIn Avatar</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400">
                  Tap to apply
                </span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-1.5 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${
                      avatar === preset.url
                        ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/30'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full aspect-square rounded-xl object-cover bg-gray-100 dark:bg-gray-800"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Save Success Toast ───────────────────────────────────────────── */}
        {saveSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center gap-2 animate-in zoom-in-95">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Profile and Avatar updated successfully!</span>
          </div>
        )}

        {/* ── Editable Profile Form ────────────────────────────────────────── */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800 text-left">
          
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Member Details
            </h3>
            <span className="text-[11px] font-bold text-amber-500">
              Editable
            </span>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Gender Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Gender (Used for 'Women Only' Ride Filter)</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Self-declared profile setting. Female riders can choose to join or create female-only ride pools.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {[
                { id: 'female', label: 'Female', icon: '👩' },
                { id: 'male', label: 'Male', icon: '👨' },
                { id: 'other', label: 'Other', icon: '👤' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id)}
                  className={`min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                    gender === item.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>


          {/* WhatsApp / Phone with Clear Privacy Notice */}
          <div className="space-y-1.5">
            <label htmlFor="profile-phone-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp / Phone Number</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Optional</span>
            </label>
            <input
              id="profile-phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full min-h-[44px] px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              🔒 <strong>Privacy:</strong> Only visible to accepted co-riders in your squad for pickup coordination. Never shared publicly.
            </p>
          </div>

          {/* Save Profile Button */}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </form>

        {/* ── Stats & Trust Scope ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 text-center">
          <div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Rider Rating</span>
            <span className="text-sm font-black text-amber-500 flex items-center justify-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>{user.rating ? `${user.rating} ★` : '5.0 ★'}</span>
              <span className="text-[10px] text-gray-400 font-medium">(New Member)</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block">Verification Scope</span>
            <span className="text-xs font-extrabold text-emerald-500 block mt-0.5">
              College Email Verified ✓
            </span>
            <span className="text-[9px] text-gray-400 block">
              Official BBD Domain Access
            </span>
          </div>
        </div>

        {/* ── Blocked Users / Safety & Privacy Section ───────────────────── */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                {t('blockedUsersTitle')}
              </h3>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              blockedUsers.length > 0
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
            }`}>
              {blockedUsers.length} Blocked
            </span>
          </div>

          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {t('blockedUsersDesc')}
          </p>

          {unblockNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>{unblockNotice}</span>
            </div>
          )}

          {blockedUsers.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-white/70 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t('noBlockedUsers')}</span>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              {(blockedUsers || []).filter(Boolean).map((bUser) => (
                <div
                  key={bUser.id}
                  className="p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 shadow-sm hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={bUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${bUser.id}`}
                      alt={bUser.name}
                      className="w-9 h-9 rounded-xl object-cover border border-red-500/30 bg-gray-100 dark:bg-gray-800 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-xs font-black text-gray-900 dark:text-white block truncate">
                        {bUser.name}
                      </span>
                      <span className="text-[10px] font-bold text-red-500 block truncate">
                        {bUser.reason || 'SOS / Safety Block'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUnblock(bUser.id, bUser.name)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-500 text-gray-900 hover:text-white dark:bg-gray-800 dark:hover:bg-emerald-500 dark:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 border border-gray-200 dark:border-gray-700 hover:border-emerald-500"
                    title={`Unblock ${bUser.name}`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500 group-hover:text-white" />
                    <span>{t('unblockBtn')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Language Preference */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Language Mode</span>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all active:scale-95"
          >
            {lang === 'genz' ? 'Gen-Z 💀' : 'English 🇬🇧'}
          </button>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="w-full py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of HopIn</span>
        </button>

      </div>
    </div>
  );
};
