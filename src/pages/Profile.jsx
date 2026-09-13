import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  ShieldCheck,
  Star,
  Sparkles,
  LogOut,
  CheckCircle2,
  Camera,
  Upload,
  Dices,
  User,
  Phone,
  GraduationCap,
  Save,
  Check,
  RefreshCw,
  Palette
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

// Helper to resize and compress uploaded image using HTML5 Canvas
const compressImage = (file, maxWidth = 320, maxHeight = 320, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const { lang, toggleLanguage } = useLanguage();

  const fileInputRef = useRef(null);

  // Form state
  const [name, setName] = useState(user?.name || '');
  const [gender, setGender] = useState(user?.gender || 'female');
  const [branch, setBranch] = useState(user?.branch || 'B.Tech CSE');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // UI status
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!user) return null;

  // Handle image file upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    try {
      setUploadingPhoto(true);
      const compressedDataUrl = await compressImage(file);
      setAvatar(compressedDataUrl);

      // Auto-save the new photo to profile
      await updateUserProfile({ avatar: compressedDataUrl });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('Failed to process image. Please try another photo.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      branch: branch.trim(),
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
      
      {/* Hidden file input for real photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Main Profile & Avatar Card */}
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-gray-200/80 dark:border-gray-800 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top ambient color glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400"></div>

        {/* ── Avatar & Photo Customization ─────────────────────────────────── */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl p-1 bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 shadow-xl shadow-amber-500/20">
              <img
                src={avatar || user.avatar}
                alt={user.name}
                className="w-full h-full rounded-[22px] object-cover bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900"
              />
            </div>

            {/* Camera action badge button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              title="Upload profile photo"
              className="absolute -bottom-1 -right-1 p-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white shadow-lg ring-4 ring-white dark:ring-gray-900 transition-transform active:scale-90 hover:scale-105"
            >
              {uploadingPhoto ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>

            {/* Verified student check badge */}
            <span className="absolute -top-1 -left-1 p-1.5 rounded-xl bg-emerald-500 text-white shadow ring-2 ring-white dark:ring-gray-900">
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
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
            {/* Upload real photo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-amber-500" />
              <span>{uploadingPhoto ? 'Processing...' : 'Upload Photo'}</span>
            </button>

            {/* Choose avatar gallery */}
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm border ${
                showAvatarPicker
                  ? 'bg-amber-500 text-white border-amber-500 shadow-amber-500/20'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-transparent'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span>Pick Avatar</span>
            </button>

            {/* Randomize dice */}
            <button
              type="button"
              onClick={handleRandomizeAvatar}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Dices className="w-3.5 h-3.5 text-cyan-500" />
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
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Student Details
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
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Gender Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
              <span>Gender ('Girls Only' Ride Safety Filter)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'female', label: 'Female', icon: '👩', activeBg: 'from-pink-500 to-rose-600 border-pink-400' },
                { id: 'male', label: 'Male', icon: '👨', activeBg: 'from-blue-600 to-cyan-600 border-blue-400' },
                { id: 'other', label: 'Other', icon: '👤', activeBg: 'from-purple-600 to-indigo-600 border-purple-400' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGender(item.id)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition-all ${
                    gender === item.id
                      ? `bg-gradient-to-r ${item.activeBg} text-white shadow-md`
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Branch / Course */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-500" />
              <span>Branch / Department</span>
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
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

          {/* WhatsApp / Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp / Phone Number</span>
              </span>
              <span className="text-[10px] text-gray-400">For ride pickup coordination</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Save Profile Button */}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all disabled:opacity-50"
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

        {/* ── Stats & Preferences ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 text-center">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Rider Rating</span>
            <span className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-500" />
              {user.rating || 5.0} ⭐
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Security Status</span>
            <span className="text-xs font-extrabold text-emerald-500 block mt-1">
              Verified Student ✓
            </span>
          </div>
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
