import React from 'react';

export const HopInLogo = ({ size = 44, className = '', showGlow = true }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center shrink-0 select-none group cursor-pointer ${className}`}
    >
      {/* Outer ambient pulsing neon glow */}
      {showGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-300"></div>
      )}

      {/* Main glass badge container */}
      <div className="relative w-full h-full rounded-2xl p-[1.5px] bg-gradient-to-b from-amber-300/80 via-amber-500/40 to-amber-950/80 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center p-2 relative overflow-hidden">
          
          {/* Subtle light streak reflection */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          {/* Premium Custom SVG Emblem */}
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full relative z-10 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Primary Electric Amber Gradient */}
              <linearGradient id="hopinGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="30%" stopColor="#FBBF24" />
                <stop offset="70%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              {/* Accent Cyber Cyan-Indigo Trail */}
              <linearGradient id="hopinSpeedTrail" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#FDE047" stopOpacity="0.9" />
              </linearGradient>

              {/* Shadow effect */}
              <filter id="glowShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#F59E0B" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* Background speed pulse arc */}
            <path
              d="M18 50 C18 32, 32 18, 50 18 C68 18, 82 32, 82 50"
              stroke="url(#hopinGoldGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="4 6"
              opacity="0.4"
            />

            {/* Left Dynamic Wing / Pillar */}
            <path
              d="M26 24 C26 20 30 18 34 20 L40 23 C44 25 46 29 46 33 L46 76 C46 80 41 82 37 80 L31 77 C28 75 26 71 26 67 Z"
              fill="url(#hopinGoldGrad)"
            />

            {/* Right Dynamic Wing / Pillar */}
            <path
              d="M74 24 C74 20 70 18 66 20 L60 23 C56 25 54 29 54 33 L54 76 C54 80 59 82 63 80 L69 77 C72 75 74 71 74 67 Z"
              fill="url(#hopinGoldGrad)"
            />

            {/* High-Velocity Converging Speed Bridge (Hop In Arrow) */}
            <path
              d="M34 50 L66 50"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#glowShadow)"
            />

            {/* Dynamic Center Hop Beacon */}
            <circle
              cx="50"
              cy="50"
              r="6.5"
              fill="#FFFFFF"
              className="animate-pulse"
            />
            <circle
              cx="50"
              cy="50"
              r="12"
              stroke="#FDE047"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Forward Motion Accent Arrowhead */}
            <path
              d="M58 42 L67 50 L58 58"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
