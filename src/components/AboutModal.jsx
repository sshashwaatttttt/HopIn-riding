import React, { useState } from 'react';
import { HopInLogo } from './HopInLogo';
import {
  X,
  Instagram,
  Mail,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  GraduationCap,
  Users,
  Car,
  Share2
} from 'lucide-react';
import { ShareModal } from './ShareModal';

// Official HopIn Links
export const HOPIN_INSTAGRAM_HANDLE = "hopin.poolride";
export const HOPIN_INSTAGRAM_URL = "https://instagram.com/hopin.poolride";
export const HOPIN_BUSINESS_EMAIL = "hopin.ridehelp@gmail.com";
export const HOPIN_EMAIL_SUBJECT = "HopIn Support & Inquiry";
export const HOPIN_GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${HOPIN_BUSINESS_EMAIL}&su=${encodeURIComponent(HOPIN_EMAIL_SUBJECT)}`;

export const AboutModal = ({ isOpen, onClose, onOpenShare }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showInternalShare, setShowInternalShare] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(HOPIN_BUSINESS_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleMailClick = (e) => {
    // Detect mobile device
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      e.preventDefault();
      // On mobile devices, launching mailto triggers the native Gmail / default mail app directly
      window.location.href = `mailto:${HOPIN_BUSINESS_EMAIL}?subject=${encodeURIComponent(HOPIN_EMAIL_SUBJECT)}`;
    }
    // On desktop browsers: allows default anchor behavior to open HOPIN_GMAIL_COMPOSE_URL in new tab directly
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Aesthetic Modal Card */}
      <div 
        className="w-full max-w-lg aesthetic-card rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        {/* Top Amber Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close About Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Logo */}
        <div className="text-center space-y-2 pt-1">
          <HopInLogo size={56} className="mx-auto mb-2" />
          <h2 id="about-modal-title" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            <span>About HopIn</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            The Safe Student Ride-Pooling & Commute Coordination Platform.
          </p>
        </div>

        {/* Core Purpose & Value */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-left text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            <strong>HopIn</strong> empowers verified college students to connect, find co-riders, split auto and cab fares, and commute safely to and from campus.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified College Email</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
              <span>Campus Batchmates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Women-Only Safe Pool</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-purple-500" />
              <span>Live Fare Splitter</span>
            </div>
          </div>
        </div>

        {/* ── Official Social & Business Contact Actions ─────────────────────── */}
        <div className="space-y-3 pt-1">
          
          {/* Instagram Profile Direct Link: hopin.poolride */}
          <a
            href={HOPIN_INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-extrabold text-xs shadow-lg shadow-pink-500/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-medium opacity-90 leading-tight">Follow us on Instagram</p>
                <p className="font-black text-xs leading-tight">@{HOPIN_INSTAGRAM_HANDLE}</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </a>

          {/* Business Email Direct Gmail Action: hopin.ridehelp@gmail.com */}
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <a
              href={HOPIN_GMAIL_COMPOSE_URL}
              onClick={handleMailClick}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 flex-1 min-w-0 hover:opacity-90 transition-all group"
              title="Click to open Gmail compose directly"
              id="hopin-about-mail-btn"
            >
              <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="text-left truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight">
                    Send Email via Gmail
                  </p>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 leading-none">
                    Gmail
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate leading-tight group-hover:text-red-500 transition-colors">
                  {HOPIN_BUSINESS_EMAIL}
                </p>
              </div>
            </a>

            {/* Quick Actions: Direct Web Compose & Copy Button */}
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={HOPIN_GMAIL_COMPOSE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-500 hover:border-red-500/30 transition-colors"
                title="Open Gmail Web in new tab"
                aria-label="Open Gmail Web"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 transition-colors"
                title="Copy email address"
                aria-label="Copy email address"
              >
                {copiedEmail ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Share HopIn with Campus Friends Action */}
          <button
            type="button"
            onClick={() => {
              if (onOpenShare) {
                onOpenShare();
              } else {
                setShowInternalShare(true);
              }
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-98 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-slate-950/15 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-slate-950" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-900/80 leading-tight">Spread the Word</p>
                <p className="font-black text-xs leading-tight">Share on WhatsApp, Instagram & More</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-black bg-slate-950/15 px-2.5 py-1 rounded-xl">
              <span>Share</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

        </div>

        {/* Footer info */}
        <div className="pt-2 text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500">
          HopIn • Built for Safe Campus Commuting
        </div>

      </div>

      {/* Internal Share Modal */}
      <ShareModal isOpen={showInternalShare} onClose={() => setShowInternalShare(false)} />
    </div>
  );
};
