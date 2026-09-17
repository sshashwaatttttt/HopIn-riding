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
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Brand Logo & Domain Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 group">
              <HopInLogo size={36} />
              <div>
                <span className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
                  HopIn
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
              </div>
            </Link>

            {user && (
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <ShieldCheck className="w-3 h-3" />
                {user.organization ? `${user.organization} (${user.domain})` : user.domain}
              </span>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* About HopIn Button */}
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-extrabold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700 shrink-0"
              aria-label="About HopIn and Contact"
              title="About HopIn, Instagram & Business Contact"
            >
              <Info className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">About</span>
            </button>

            {/* Share HopIn Web App Button */}
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-extrabold rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1 border border-amber-500/30 shrink-0 shadow-sm active:scale-95"
              aria-label="Share HopIn with Campus Friends"
              title="Share HopIn on WhatsApp, Instagram & more"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">Share</span>
            </button>

            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={installPWA}
                className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-md transition-all animate-bounce flex items-center gap-1"
                aria-label="Install HopIn Progressive Web App"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Install</span>
              </button>
            )}

            {/* Gen-Z Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-extrabold rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-1"
              aria-label={`Switch language mode. Currently in ${lang === 'genz' ? 'Gen-Z' : 'English'} mode.`}
              title="Toggle Normal English vs Gen-Z Mode"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
              <span className="hidden sm:inline text-[11px] sm:text-xs">{lang === 'genz' ? 'Gen-Z 💀' : 'EN 🇬🇧'}</span>
              <span className="sm:hidden text-[10px] font-black">{lang === 'genz' ? '💀' : '🇬🇧'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors shrink-0"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Post Login Actions */}
            {user && (
              <>
                {/* Create Ride Button */}
                <Link
                  to="/create"
                  className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center gap-1 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all transform active:scale-95 shrink-0"
                  aria-label="Create a Ride"
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0 text-gray-950" />
                  <span className="hidden sm:inline text-gray-950">Create</span>
                </Link>

                {/* Profile Avatar */}
                <Link
                  to="/profile"
                  className="flex items-center justify-center shrink-0"
                  aria-label={`View profile of ${user.name}`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full border-2 border-amber-500 object-cover cursor-pointer hover:scale-105 transition-transform"
                  />
                </Link>

                {/* Logout (Desktop only, mobile accesses via Profile page) */}
                <button
                  type="button"
                  onClick={logout}
                  className="hidden md:flex p-1.5 items-center justify-center text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  aria-label="Log out of HopIn"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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
