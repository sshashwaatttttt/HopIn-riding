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
  Download
} from 'lucide-react';

export const Navbar = ({ deferredPrompt, installPWA }) => {
  const { user, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('hopin_theme') === 'dark' || 
      (!('hopin_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

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
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & BBD Badge */}
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
              {user.domain}
            </span>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* PWA Install Button */}
          {deferredPrompt && (
            <button
              onClick={installPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-md transition-all animate-bounce"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Install PWA</span>
            </button>
          )}

          {/* Gen-Z Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 transition-all shadow-sm active:scale-95"
            title="Toggle Normal English vs Gen-Z Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>{lang === 'genz' ? 'Gen-Z 💀' : 'English 🇬🇧'}</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 hover:brightness-110 shadow-md shadow-amber-500/20 transition-all transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('createRide')}</span>
              </Link>

              {/* Profile Avatar & Logout */}
              <div className="relative group flex items-center gap-2 pl-1">
                <Link to="/profile">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border-2 border-amber-500 object-cover cursor-pointer hover:scale-105 transition-transform"
                  />
                </Link>

                <button
                  onClick={logout}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
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
  );
};
