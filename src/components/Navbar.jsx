import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HopInLogo } from './HopInLogo';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  PlusCircle, 
  ShieldCheck, 
  User, 
  LogOut, 
  Download,
  Info,
  Share2
} from 'lucide-react';
import { AboutModal } from './AboutModal';
import { ShareModal } from './ShareModal';

export const Navbar = ({ deferredPrompt, installPWA }) => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hopin_theme') === 'dark' || 
      (!('hopin_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hopin_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hopin_theme', 'light');
    }
  }, [darkMode]);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand Logo & Domain Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <HopInLogo size={42} />
              <div>
                <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                  HopIn
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
              </div>
            </Link>

            {user && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3" />
                {user.organization ? `${user.organization} (${user.domain})` : user.domain}
              </span>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* About HopIn Button */}
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="min-h-[44px] px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0"
              aria-label="About HopIn and Contact"
              title="About HopIn, Instagram & Business Contact"
            >
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">About</span>
            </button>

            {/* Share HopIn Web App Button */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="min-h-[44px] px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 border border-amber-500/30 shrink-0 shadow-sm active:scale-95"
              aria-label="Share HopIn with Campus Friends"
              title="Share HopIn on WhatsApp, Instagram & more"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={installPWA}
                className="min-h-[44px] min-w-[44px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-md transition-all animate-bounce"
                aria-label="Install HopIn Progressive Web App"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Install PWA</span>
              </button>
            )}

            {/* Gen-Z Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="min-h-[44px] flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-extrabold rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all shadow-sm active:scale-95 shrink-0"
              aria-label={`Switch language mode. Currently in ${lang === 'genz' ? 'Gen-Z' : 'English'} mode.`}
              title="Toggle Normal English vs Gen-Z Mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="text-[11px] sm:text-xs">{lang === 'genz' ? 'Gen-Z 💀' : 'EN 🇬🇧'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shrink-0"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Post Login Actions */}
            {user && (
              <>
                {/* Create Ride Button */}
                <Link
                  to="/create"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all transform active:scale-95 shrink-0"
                  aria-label="Create a Ride"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Create Ride</span>
                </Link>

                {/* Profile Avatar & Logout */}
                <div className="relative flex items-center gap-1 sm:gap-2 shrink-0">
                  <Link
                    to="/profile"
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={`View profile of ${user.name}`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0 rounded-full border-2 border-amber-500 object-cover cursor-pointer hover:scale-105 transition-transform"
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={logout}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Log out of HopIn"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </nav>

      {/* About Modal */}
      <AboutModal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)}
        onOpenShare={() => {
          setShowAboutModal(false);
          setShowShareModal(true);
        }}
      />

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
      />
    </>
  );
};
