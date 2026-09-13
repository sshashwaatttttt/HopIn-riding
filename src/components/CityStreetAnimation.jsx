import React, { useState, useEffect } from 'react';
import { Car, Zap, Sparkles } from 'lucide-react';

export const CityStreetAnimation = () => {
  const [phase, setPhase] = useState('driving-in'); // 'driving-in', 'stopped-drop', 'stopped-pick', 'driving-out'
  const [cycle, setCycle] = useState(0);
  const [vehicleType, setVehicleType] = useState('car'); // 'car' or 'auto'

  useEffect(() => {
    // 14-Second Realistic Animation Timeline:
    // 0s - 4.2s: Approaching BBD Hub, smooth deceleration, brake lights ignite
    // 4.2s - 7s: Stopped at Hub - Passengers Alighting (Drop off)
    // 7s - 9.8s: Stopped at Hub - New Passengers Boarding, suspension compress
    // 9.8s - 14s: Accelerate forward, rear squat, headlight beams sweep into night

    const timer1 = setTimeout(() => setPhase('stopped-drop'), 4000);
    const timer2 = setTimeout(() => setPhase('stopped-pick'), 7000);
    const timer3 = setTimeout(() => setPhase('driving-out'), 9800);

    const interval = setInterval(() => {
      setPhase('driving-in');
      setCycle(c => c + 1);
    }, 14000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(interval);
    };
  }, [cycle]);

  const isDriving = phase === 'driving-in' || phase === 'driving-out';
  const isBraking = phase === 'stopped-drop';
  const isAccelerating = phase === 'driving-out';
  const isStopped = phase === 'stopped-drop' || phase === 'stopped-pick';

  return (
    <div className="relative w-full h-52 sm:h-60 overflow-hidden rounded-3xl bg-gradient-to-b from-[#080d1a] via-[#0f172a] to-[#0a0e1a] border border-amber-500/20 shadow-2xl group select-none">
      
      {/* ── Vehicle Type Switcher Toggle (Top Right) ─────────────────────── */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-gray-700/60 shadow-lg">
        <button
          type="button"
          onClick={() => setVehicleType('car')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
            vehicleType === 'car'
              ? 'bg-amber-500 text-gray-950 shadow-md scale-102'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>Sleek Cab</span>
        </button>
        <button
          type="button"
          onClick={() => setVehicleType('auto')}
          className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
            vehicleType === 'auto'
              ? 'bg-amber-500 text-gray-950 shadow-md scale-102'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <span>🛺</span>
          <span>E-Rickshaw</span>
        </button>
      </div>

      {/* ── Sky & Ambient Stars ───────────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 240">
        <defs>
          <radialGradient id="moonGlow" cx="85%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#050814" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Twinkling stars */}
        <circle cx="80" cy="25" r="1.5" fill="#fff" opacity="0.8" className="animate-pulse" />
        <circle cx="240" cy="40" r="1.0" fill="#fff" opacity="0.6" />
        <circle cx="420" cy="20" r="1.8" fill="#FBBF24" opacity="0.9" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="680" cy="35" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="890" cy="18" r="1.5" fill="#fff" opacity="0.8" />
        <circle cx="1080" cy="30" r="1.3" fill="#38BDF8" opacity="0.7" />

        {/* Soft Moon Glow */}
        <circle cx="1020" cy="45" r="28" fill="url(#moonGlow)" />
        <circle cx="1020" cy="45" r="12" fill="#fef08a" opacity="0.85" />

        {/* Distant Lucknow & BBD Campus Silhouette */}
        <path
          d="M 0 175 L 40 175 L 40 135 L 75 115 L 110 135 L 110 175 L 170 175 L 170 95 L 210 75 L 250 95 L 250 175 L 320 175 L 320 140 L 380 140 L 380 175 L 470 175 L 470 85 Q 520 45 570 85 L 570 175 L 660 175 L 700 120 L 740 120 L 780 175 L 870 175 L 870 100 L 920 80 L 970 100 L 970 175 L 1050 175 L 1050 130 L 1120 130 L 1120 175 L 1200 175 L 1200 240 L 0 240 Z"
          fill="#0c1322"
          opacity="0.85"
        />

        {/* BBD Architectural Dome Accent Stroke */}
        <path d="M 470 85 Q 520 45 570 85" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        <text x="520" y="40" fill="#F59E0B" fontSize="10" fontWeight="900" textAnchor="middle" opacity="0.85" letterSpacing="2">
          BBD UNIVERSITY • CAMPUS TRANSIT
        </text>

        {/* Midground Trees & Silhouettes */}
        <ellipse cx="280" cy="170" rx="20" ry="14" fill="#0f2137" opacity="0.9" />
        <ellipse cx="620" cy="170" rx="24" ry="16" fill="#0f2137" opacity="0.9" />
        <ellipse cx="820" cy="170" rx="18" ry="12" fill="#0f2137" opacity="0.9" />
      </svg>

      {/* ── Modern Streetlamp with Glowing Light Pool ─────────────────────── */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center">
        {/* Lamp Fixture */}
        <div className="relative">
          <div className="w-8 h-2 bg-gray-700 rounded-full border border-gray-600"></div>
          {/* Luminous Warm Light Bulb */}
          <div className="w-5 h-2.5 mx-auto bg-amber-200 rounded-b-full shadow-[0_0_18px_rgba(251,191,36,0.9)]"></div>
          {/* Volumetric Street Light Cone */}
          <div
            className="w-48 h-36 -mt-1 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.7) 0%, rgba(251, 191, 36, 0) 75%)',
              clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)'
            }}
          ></div>
        </div>
        {/* Lamp Post Pole */}
        <div className="w-1.5 h-16 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-700 shadow-lg -mt-36"></div>
      </div>

      {/* ── BBD Transit Shelter & Platform ─────────────────────────────────── */}
      <div className="absolute bottom-12 left-[38%] sm:left-[43%] z-15 flex flex-col items-center pointer-events-none">
        {/* Glass Modern Transit Canopy */}
        <div className="px-4 py-1 rounded-t-xl bg-cyan-950/70 border-t-2 border-x-2 border-cyan-400/40 backdrop-blur-md shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[10px] font-black text-cyan-300 tracking-wider">
            HOPIN PICKUP HUB
          </span>
        </div>
        {/* Bench / Platform bar */}
        <div className="w-24 h-1.5 bg-gradient-to-r from-cyan-400/40 via-amber-400/40 to-cyan-400/40 rounded-full"></div>
      </div>

      {/* ── Realistic Asphalt Road with Moving Dash Markings ──────────────── */}
      <div className="absolute bottom-0 w-full h-14 bg-gradient-to-b from-[#181d28] via-[#10141e] to-[#0a0d14] border-t-2 border-gray-700/80 shadow-2xl overflow-hidden flex flex-col justify-center">
        {/* Road surface texture & reflection sheen */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent pointer-events-none"></div>

        {/* Moving Yellow & White Center Lane Dashes */}
        <svg className="w-full h-3 relative z-10" preserveAspectRatio="none">
          <line
            x1="0"
            y1="1.5"
            x2="100%"
            y2="1.5"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeDasharray="24 16"
            className={isDriving ? 'animate-road-move' : ''}
            strokeOpacity="0.75"
          />
        </svg>

        {/* Road Curb line with curb markers */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-500/30"></div>
      </div>

      {/* ── Dynamic Passenger Avatars (Alighting & Boarding) ──────────────── */}
      {/* Alighting Passengers (Drop off) */}
      {phase === 'stopped-drop' && (
        <div className="absolute bottom-14 left-[34%] sm:left-[39%] flex items-end gap-2.5 z-25 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col items-center animate-bounce">
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
              Thanks! ✌️
            </span>
            <div className="w-7 h-7 rounded-full ring-2 ring-emerald-400 overflow-hidden shadow-lg bg-pink-500 flex items-center justify-center text-xs">
              👩
            </div>
          </div>
          <div className="flex flex-col items-center animate-bounce delay-150">
            <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
              Safe ride! ✨
            </span>
            <div className="w-7 h-7 rounded-full ring-2 ring-emerald-400 overflow-hidden shadow-lg bg-purple-500 flex items-center justify-center text-xs">
              👦
            </div>
          </div>
        </div>
      )}

      {/* Boarding Passengers (Pick up) */}
      {phase === 'stopped-pick' && (
        <div className="absolute bottom-14 left-[46%] sm:left-[51%] flex items-end gap-2.5 z-25 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col items-center animate-bounce">
            <span className="bg-amber-400 text-gray-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
              Hop In! 🚀
            </span>
            <div className="w-7 h-7 rounded-full ring-2 ring-amber-400 overflow-hidden shadow-lg bg-indigo-500 flex items-center justify-center text-xs">
              👩‍🦱
            </div>
          </div>
          <div className="flex flex-col items-center animate-bounce delay-150">
            <span className="bg-amber-400 text-gray-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md mb-1 whitespace-nowrap">
              Let's go! ⚡
            </span>
            <div className="w-7 h-7 rounded-full ring-2 ring-amber-400 overflow-hidden shadow-lg bg-teal-500 flex items-center justify-center text-xs">
              👱‍♂️
            </div>
          </div>
        </div>
      )}

      {/* ── Real Vehicle with Advanced Physics & Lighting ─────────────────── */}
      <div
        className={`absolute bottom-3.5 z-30 transition-all ${
          phase === 'driving-in'
            ? 'left-[-35%] sm:left-[-25%] duration-[4200ms] ease-out'
            : phase === 'stopped-drop' || phase === 'stopped-pick'
            ? 'left-[32%] sm:left-[38%] duration-[1000ms] ease-out'
            : 'left-[115%] duration-[4200ms] ease-in'
        }`}
      >
        {/* Realistic Car Body Container with Dynamic Suspension & Inertia Pitch */}
        <div
          className={`relative ${
            isDriving ? 'animate-suspension' : ''
          } ${isBraking ? 'animate-braking' : ''} ${
            isAccelerating ? 'animate-accelerating' : ''
          }`}
        >

          {/* ═══════════════ OPTION A: REALISTIC SLEEK CAB ═══════════════ */}
          {vehicleType === 'car' ? (
            <div className="relative w-44 sm:w-52 h-24">
              
              {/* Volumetric Forward Headlight Beam casting onto road */}
              <div
                className="absolute top-9 left-[75%] w-64 h-24 pointer-events-none z-10 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(ellipse at left, rgba(254, 240, 138, 0.45) 0%, rgba(254, 240, 138, 0.15) 50%, transparent 80%)',
                  clipPath: 'polygon(0% 25%, 100% 0%, 100% 100%, 0% 75%)',
                  opacity: isStopped ? 0.4 : 0.85
                }}
              ></div>

              {/* Realistic Car SVG */}
              <svg viewBox="0 0 320 150" className="w-full h-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]">
                <defs>
                  {/* Metallic Gloss Gradient for Chassis */}
                  <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="25%" stopColor="#F59E0B" />
                    <stop offset="60%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>

                  {/* Sleek Dark Aerodynamic Roof */}
                  <linearGradient id="carRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="60%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>

                  {/* Tinted Glass Windows */}
                  <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#0284C7" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0C4A6E" stopOpacity="0.95" />
                  </linearGradient>

                  {/* Alloy Rim Polished Steel */}
                  <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow underneath chassis */}
                <ellipse cx="160" cy="132" rx="140" ry="10" fill="#000" opacity="0.65" filter="blur(3px)" />

                {/* Main Aerodynamic Car Silhouette Body */}
                <path
                  d="M 25 105 
                     C 22 95, 26 85, 38 80 
                     L 85 76 
                     C 105 55, 125 38, 150 35 
                     L 225 35 
                     C 255 35, 275 62, 290 80 
                     L 305 85 
                     C 315 90, 318 100, 312 110 
                     L 300 114 
                     C 290 102, 270 96, 250 96 
                     C 230 96, 215 108, 208 116 
                     L 125 116 
                     C 118 106, 102 96, 82 96 
                     C 62 96, 46 106, 40 115 
                     Z"
                  fill="url(#carBodyGrad)"
                  stroke="#FBBF24"
                  strokeWidth="1.5"
                />

                {/* Aerodynamic Roof & Windshield Frame */}
                <path
                  d="M 90 75 
                     C 110 54, 128 38, 152 36 
                     L 222 36 
                     C 250 36, 268 58, 282 75 
                     Z"
                  fill="url(#carRoofGrad)"
                />

                {/* Front & Rear Tinted Windows with Passenger Silhouettes */}
                {/* Rear Passenger Window */}
                <path
                  d="M 98 73 
                     C 115 56, 130 43, 152 41 
                     L 182 41 
                     L 182 73 
                     Z"
                  fill="url(#glassGrad)"
                />
                {/* Front Driver Window */}
                <path
                  d="M 188 41 
                     L 218 41 
                     C 240 41, 258 56, 274 73 
                     L 188 73 
                     Z"
                  fill="url(#glassGrad)"
                />

                {/* Driver & Passenger Silhouettes Inside */}
                {/* Driver */}
                <circle cx="215" cy="56" r="7" fill="#1E293B" />
                <path d="M 226 68 L 222 62 L 210 62 L 206 68 Z" fill="#1E293B" />
                {/* Steering Wheel line */}
                <line x1="228" y1="58" x2="232" y2="70" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                {/* Rear Passenger */}
                <circle cx="140" cy="58" r="6" fill="#334155" />
                <path d="M 148 70 L 145 64 L 135 64 L 132 70 Z" fill="#334155" />

                {/* Body Character Crease Line & Door Seam */}
                <line x1="185" y1="41" x2="185" y2="114" stroke="#78350F" strokeWidth="1.2" />
                <path d="M 45 84 Q 160 88 300 88" fill="none" stroke="#FEF3C7" strokeWidth="1" opacity="0.6" />
                {/* Recessed Door Handles */}
                <rect x="155" y="80" width="14" height="3" rx="1.5" fill="#78350F" />
                <rect x="200" y="80" width="14" height="3" rx="1.5" fill="#78350F" />

                {/* Side Mirror */}
                <ellipse cx="230" cy="74" rx="6" ry="4" fill="#F59E0B" stroke="#78350F" strokeWidth="1" />

                {/* HopIn Brand Emblem on Car Door */}
                <g transform="translate(145, 94)">
                  <rect width="30" height="12" rx="4" fill="#1E293B" />
                  <text x="15" y="9" fill="#F59E0B" fontSize="7" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                    HopIn
                  </text>
                </g>

                {/* Front LED Projector Headlight */}
                <path d="M 292 84 L 310 88 L 308 96 L 288 94 Z" fill="#F8FAFC" />
                <circle cx="304" cy="91" r="3" fill="#38BDF8" className={isDriving ? 'animate-pulse' : ''} />

                {/* Rear LED Light Bar (Active Red Brake Glow during stopping) */}
                <path
                  d="M 26 82 L 36 82 L 32 94 L 23 92 Z"
                  fill={isStopped ? '#EF4444' : '#DC2626'}
                  filter={isStopped ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 1))' : 'drop-shadow(0 0 2px rgba(220, 38, 38, 0.7))'}
                />

                {/* ── Detailed Realistic Alloy Wheels ── */}
                {/* Rear Wheel */}
                <g transform="translate(82, 116)">
                  {/* Tire Rubber */}
                  <circle cx="0" cy="0" r="23" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="18" fill="#27272A" />
                  {/* Disc Brake & Red Caliper */}
                  <circle cx="0" cy="0" r="13" fill="#71717A" />
                  <rect x="-4" y="-12" width="6" height="8" rx="2" fill="#DC2626" />
                  {/* 5-Spoke Alloy Rim (Rotating when driving) */}
                  <g className={isDriving ? 'animate-wheel-drive' : ''}>
                    <circle cx="0" cy="0" r="12" fill="none" stroke="url(#rimGrad)" strokeWidth="3" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="url(#rimGrad)" strokeWidth="2.5" />
                    <line x1="-11.4" y1="-3.7" x2="11.4" y2="3.7" stroke="url(#rimGrad)" strokeWidth="2.5" />
                    <line x1="-7" y1="9.7" x2="7" y2="-9.7" stroke="url(#rimGrad)" strokeWidth="2.5" />
                    {/* Hub Cap */}
                    <circle cx="0" cy="0" r="4" fill="#F59E0B" />
                  </g>
                </g>

                {/* Front Wheel */}
                <g transform="translate(250, 116)">
                  {/* Tire Rubber */}
                  <circle cx="0" cy="0" r="23" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="18" fill="#27272A" />
                  {/* Disc Brake & Red Caliper */}
                  <circle cx="0" cy="0" r="13" fill="#71717A" />
                  <rect x="-4" y="-12" width="6" height="8" rx="2" fill="#DC2626" />
                  {/* 5-Spoke Alloy Rim (Rotating when driving) */}
                  <g className={isDriving ? 'animate-wheel-drive' : ''}>
                    <circle cx="0" cy="0" r="12" fill="none" stroke="url(#rimGrad)" strokeWidth="3" />
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="url(#rimGrad)" strokeWidth="2.5" />
                    <line x1="-11.4" y1="-3.7" x2="11.4" y2="3.7" stroke="url(#rimGrad)" strokeWidth="2.5" />
                    <line x1="-7" y1="9.7" x2="7" y2="-9.7" stroke="url(#rimGrad)" strokeWidth="2.5" />
                    {/* Hub Cap */}
                    <circle cx="0" cy="0" r="4" fill="#F59E0B" />
                  </g>
                </g>

              </svg>
            </div>
          ) : (
            /* ═══════════════ OPTION B: REALISTIC MODERN E-RICKSHAW ═══════════════ */
            <div className="relative w-40 sm:w-48 h-24">
              
              {/* Headlight cone */}
              <div
                className="absolute top-8 left-[70%] w-56 h-20 pointer-events-none z-10 transition-opacity duration-300"
                style={{
                  background: 'radial-gradient(ellipse at left, rgba(254, 240, 138, 0.45) 0%, rgba(254, 240, 138, 0.1) 60%, transparent 80%)',
                  clipPath: 'polygon(0% 20%, 100% 0%, 100% 100%, 0% 80%)',
                  opacity: isStopped ? 0.35 : 0.8
                }}
              ></div>

              <svg viewBox="0 0 280 150" className="w-full h-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.8)]">
                {/* Shadow */}
                <ellipse cx="140" cy="132" rx="110" ry="8" fill="#000" opacity="0.65" filter="blur(3px)" />

                {/* Canopy Roof Curve (Bright BBD Yellow) */}
                <path
                  d="M 35 55 
                     C 55 22, 120 18, 175 22 
                     L 220 38 
                     C 238 46, 242 58, 238 72 
                     L 225 72 
                     L 35 68 
                     Z"
                  fill="#FACC15"
                  stroke="#EAB308"
                  strokeWidth="2"
                />

                {/* Rickshaw Cabin Frame & Metal Pillars */}
                <line x1="50" y1="65" x2="50" y2="105" stroke="#1E293B" strokeWidth="4" />
                <line x1="140" y1="65" x2="140" y2="105" stroke="#1E293B" strokeWidth="3" />
                <line x1="215" y1="50" x2="205" y2="105" stroke="#1E293B" strokeWidth="4" />

                {/* Tinted Windshield Glass */}
                <path d="M 175 32 L 220 44 L 205 78 L 165 78 Z" fill="#38BDF8" fillOpacity="0.75" />

                {/* Lower Chassis Body (Dual Tone Black & Yellow) */}
                <path
                  d="M 25 88 
                     L 240 88 
                     L 225 118 
                     C 215 106, 195 98, 180 98 
                     C 165 98, 150 106, 142 118 
                     L 75 118 
                     C 68 106, 52 98, 38 98 
                     Z"
                  fill="#111827"
                  stroke="#FACC15"
                  strokeWidth="2"
                />

                {/* Driver Silhouette & Handlebar */}
                <circle cx="185" cy="65" r="7" fill="#F97316" />
                <line x1="195" y1="74" x2="205" y2="82" stroke="#000" strokeWidth="3" strokeLinecap="round" />

                {/* Passenger Silhouettes in Back */}
                <circle cx="95" cy="74" r="6" fill="#3B82F6" />
                <circle cx="120" cy="74" r="6" fill="#EC4899" />

                {/* Front Chrome Headlight */}
                <circle cx="236" cy="86" r="6" fill="#FEF08A" filter="drop-shadow(0 0 6px rgba(254, 240, 138, 0.9))" />

                {/* Rear Tail light */}
                <rect x="22" y="86" width="4" height="10" rx="1" fill={isStopped ? '#EF4444' : '#B91C1C'} />

                {/* Rear Wheel */}
                <g transform="translate(48, 118)">
                  <circle cx="0" cy="0" r="18" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="12" fill="#3F3F46" />
                  <g className={isDriving ? 'animate-wheel-drive' : ''}>
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#E4E4E7" strokeWidth="2" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#E4E4E7" strokeWidth="2" />
                    <circle cx="0" cy="0" r="3" fill="#FACC15" />
                  </g>
                </g>

                {/* Front Wheel */}
                <g transform="translate(198, 118)">
                  <circle cx="0" cy="0" r="18" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="12" fill="#3F3F46" />
                  <g className={isDriving ? 'animate-wheel-drive' : ''}>
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="#E4E4E7" strokeWidth="2" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="#E4E4E7" strokeWidth="2" />
                    <circle cx="0" cy="0" r="3" fill="#FACC15" />
                  </g>
                </g>
              </svg>
            </div>
          )}

        </div>
      </div>

      {/* ── Status Indicator Bar (Bottom Left) ───────────────────────────── */}
      <div className="absolute bottom-2 left-3 z-30 flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-gray-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isDriving ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          ></span>
          <span>
            {phase === 'driving-in'
              ? 'Arriving at Campus Hub...'
              : phase === 'stopped-drop'
              ? 'Alighting Co-Riders ✓'
              : phase === 'stopped-pick'
              ? 'Boarding New Students...'
              : 'Cruising via Ayodhya Highway ⚡'}
          </span>
        </span>
      </div>

    </div>
  );
};
