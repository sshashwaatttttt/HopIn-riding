import React, { useState, useEffect, useRef } from 'react';
import { Car } from 'lucide-react';

export const CityStreetAnimation = () => {
  // Vehicle physics state
  // Phases: 'approaching' -> 'stopped-drop' -> 'stopped-pick' -> 'accelerating' -> 'exited'
  const [phase, setPhase] = useState('approaching');
  const [vehicleType, setVehicleType] = useState('car'); // 'car' or 'auto'
  const [carLeft, setCarLeft] = useState(-30); // percentage across screen
  const [noTransition, setNoTransition] = useState(false);
  const [brakeLightsOn, setBrakeLightsOn] = useState(false);

  const loopTimeoutRef = useRef(null);

  useEffect(() => {
    let active = true;

    // Respect system reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCarLeft(38);
      setPhase('stopped-pick');
      setNoTransition(true);
      return;
    }

    // Automated loop: Cab arrives, picks up, leaves -> Auto arrives, picks up, leaves -> repeat
    const runCycle = (currentVehicle = 'car') => {
      if (!active) return;

      setVehicleType(currentVehicle);
      setNoTransition(true);
      setCarLeft(-30);
      setBrakeLightsOn(false);
      setPhase('approaching');

      // Next tick: enable smooth forward transition into Hub (stop at ~38%)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!active) return;
          setNoTransition(false);
          setCarLeft(38);
        });
      });

      // 1. Approaching stop: brake lights ignite as vehicle comes to rest (at 3.5s)
      const t1 = setTimeout(() => {
        if (!active) return;
        setBrakeLightsOn(true);
        setPhase('stopped-drop');
      }, 3400);

      // 2. Stopped at Hub: Passenger boarding (at 4.5s)
      const t2 = setTimeout(() => {
        if (!active) return;
        setPhase('stopped-pick');
      }, 4500);

      // 3. Accelerate forward: release brakes, power forward to exit right (at 7.2s)
      const t3 = setTimeout(() => {
        if (!active) return;
        setBrakeLightsOn(false);
        setPhase('accelerating');
        setNoTransition(false);
        setCarLeft(125);
      }, 7200);

      // 4. Vehicle completely exited off screen right (at 10.8s)
      // Switch vehicle: Cab -> Auto -> Cab on seamless infinite loop!
      const t4 = setTimeout(() => {
        if (!active) return;
        setPhase('exited');
        const nextVehicle = currentVehicle === 'car' ? 'auto' : 'car';
        runCycle(nextVehicle);
      }, 11000);

      loopTimeoutRef.current = [t1, t2, t3, t4];
    };

    runCycle('car');

    return () => {
      active = false;
      if (Array.isArray(loopTimeoutRef.current)) {
        loopTimeoutRef.current.forEach(clearTimeout);
      }
    };
  }, []);

  const isDriving = phase === 'approaching' || phase === 'accelerating';
  const isStopped = phase === 'stopped-drop' || phase === 'stopped-pick';
  const isAccelerating = phase === 'accelerating';

  return (
    <div className="relative w-full h-52 sm:h-60 overflow-hidden rounded-3xl bg-gradient-to-b from-[#080d1a] via-[#0f172a] to-[#0a0e1a] border border-amber-500/20 shadow-2xl group select-none">
      
      {/* Active Vehicle Indicator Badge (Top Right) */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gray-900/80 backdrop-blur-md border border-gray-700/60 shadow-lg text-xs font-black text-amber-400">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>{vehicleType === 'car' ? '🚕 City Taxi Cab' : '🛺 Auto Rickshaw'}</span>
      </div>

      {/* ── Night Sky, Stars & Distant Lucknow Skyline ────────────────────── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1200 240">
        <defs>
          <radialGradient id="moonGlow" cx="85%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Twinkling stars */}
        <circle cx="80" cy="25" r="1.5" fill="#fff" opacity="0.8" className="animate-pulse" />
        <circle cx="240" cy="40" r="1.0" fill="#fff" opacity="0.6" />
        <circle cx="420" cy="20" r="1.8" fill="#FBBF24" opacity="0.9" className="animate-ping" style={{ animationDuration: '3s' }} />
        <circle cx="680" cy="35" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="890" cy="18" r="1.5" fill="#fff" opacity="0.8" />
        <circle cx="1080" cy="30" r="1.3" fill="#38BDF8" opacity="0.7" />

        {/* Soft Moon */}
        <circle cx="1020" cy="45" r="28" fill="url(#moonGlow)" />
        <circle cx="1020" cy="45" r="12" fill="#fef08a" opacity="0.85" />

        {/* Distant Lucknow & BBD Campus Silhouette */}
        <path
          d="M 0 175 L 40 175 L 40 135 L 75 115 L 110 135 L 110 175 L 170 175 L 170 95 L 210 75 L 250 95 L 250 175 L 320 175 L 320 140 L 380 140 L 380 175 L 470 175 L 470 85 Q 520 45 570 85 L 570 175 L 660 175 L 700 120 L 740 120 L 780 175 L 870 175 L 870 100 L 920 80 L 970 100 L 970 175 L 1050 175 L 1050 130 L 1120 130 L 1120 175 L 1200 175 L 1200 240 L 0 240 Z"
          fill="#0c1322"
          opacity="0.85"
        />

        {/* Architectural Dome Accent */}
        <path d="M 470 85 Q 520 45 570 85" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 4" opacity="0.45" />
        <text x="520" y="40" fill="#F59E0B" fontSize="10" fontWeight="900" textAnchor="middle" opacity="0.85" letterSpacing="2">
          COMMUNITY MOBILITY • TRANSIT CORRIDOR
        </text>

        {/* Trees */}
        <ellipse cx="280" cy="170" rx="20" ry="14" fill="#0f2137" opacity="0.9" />
        <ellipse cx="620" cy="170" rx="24" ry="16" fill="#0f2137" opacity="0.9" />
        <ellipse cx="820" cy="170" rx="18" ry="12" fill="#0f2137" opacity="0.9" />
      </svg>

      {/* ── Streetlamp Overhead ────────────────────────────────────────────── */}
      <div className="absolute bottom-12 left-[48%] -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center">
        <div className="relative">
          <div className="w-8 h-2 bg-gray-700 rounded-full border border-gray-600"></div>
          <div className="w-5 h-2.5 mx-auto bg-amber-200 rounded-b-full shadow-[0_0_20px_rgba(251,191,36,0.9)]"></div>
          <div
            className="w-48 h-36 -mt-1 opacity-20 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.7) 0%, rgba(251, 191, 36, 0) 75%)',
              clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)'
            }}
          ></div>
        </div>
        <div className="w-1.5 h-16 bg-gradient-to-r from-gray-600 via-gray-400 to-gray-700 shadow-lg -mt-36"></div>
      </div>

      {/* ── Community Transit Shelter & Platform Hub ─────────────────────────────── */}
      <div className="absolute bottom-12 left-[36%] sm:left-[40%] z-15 flex flex-col items-center pointer-events-none">
        <div className="px-3.5 py-1 rounded-t-xl bg-cyan-950/70 border-t-2 border-x-2 border-cyan-400/40 backdrop-blur-md shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-[10px] font-black text-cyan-300 tracking-wider">
            HOP-IN PICKUP HUB
          </span>
        </div>
        <div className="w-28 h-1.5 bg-gradient-to-r from-cyan-400/40 via-amber-400/50 to-cyan-400/40 rounded-full"></div>
      </div>

      {/* ── Realistic Asphalt Road & Dashed Lane Markings ─────────────────── */}
      <div className="absolute bottom-0 w-full h-14 bg-gradient-to-b from-[#181d28] via-[#10141e] to-[#0a0d14] border-t-2 border-gray-700/80 shadow-2xl overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent pointer-events-none"></div>

        {/* Yellow Dashed Road Markings (scrolls to the left when car moves forward) */}
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
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-500/30"></div>
      </div>

      {/* ── Interactive Passenger Badges at Hub ───────────────────────────── */}
      {/* Alighting Passengers (Drop-off) */}
      {phase === 'stopped-drop' && (
        <div className="absolute bottom-14 left-[33%] sm:left-[37%] flex items-end gap-2.5 z-35 animate-in fade-in slide-in-from-bottom-2 duration-500">
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

      {/* Boarding Passengers (Pick-up) */}
      {phase === 'stopped-pick' && (
        <div className="absolute bottom-14 left-[46%] sm:left-[50%] flex items-end gap-2.5 z-35 animate-in fade-in slide-in-from-bottom-2 duration-500">
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

      {/* ── Vehicle Container with Pure Forward Physics & Inertia ─────────── */}
      <div
        className="absolute bottom-3.5 z-30"
        style={{
          left: `${carLeft}%`,
          transition: noTransition
            ? 'none'
            : phase === 'approaching'
            ? 'left 4.2s cubic-bezier(0.15, 0.85, 0.35, 1)' // smooth braking ease-out
            : phase === 'accelerating'
            ? 'left 4.2s cubic-bezier(0.4, 0, 0.2, 1)' // smooth acceleration ease-in
            : 'none'
        }}
      >
        {/* Dynamic Suspension & Pitch Tilt */}
        <div
          className={`relative ${
            isDriving ? 'animate-suspension' : ''
          } ${brakeLightsOn ? 'animate-braking' : ''} ${
            isAccelerating ? 'animate-accelerating' : ''
          }`}
        >

          {/* ═══════════════ OPTION A: ACCURATE SEDAN TAXI (FACING RIGHT) ═══════════════ */}
          {vehicleType === 'car' ? (
            <div className="relative w-48 sm:w-56 h-24">
              
              {/* Forward Projecting Volumetric Headlight Cone (Ahead on Right) */}
              <div
                className="absolute top-10 left-[82%] w-72 h-28 pointer-events-none z-10 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(ellipse at left, rgba(254, 240, 138, 0.55) 0%, rgba(254, 240, 138, 0.18) 45%, transparent 75%)',
                  clipPath: 'polygon(0% 28%, 100% 0%, 100% 100%, 0% 72%)',
                  opacity: isStopped ? 0.35 : 0.85
                }}
              ></div>

              {/* Road Asphalt Illumination Glow Ahead */}
              <div
                className="absolute top-16 left-[90%] w-60 h-10 pointer-events-none rounded-full blur-md transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(ellipse, rgba(254, 240, 138, 0.4) 0%, transparent 70%)',
                  opacity: isStopped ? 0.25 : 0.75
                }}
              ></div>

              {/* Rear Brake Light Glow onto Road (Behind on Left) */}
              {brakeLightsOn && (
                <div
                  className="absolute top-11 -left-12 w-20 h-16 pointer-events-none rounded-full blur-lg animate-pulse"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(239, 68, 68, 0.85) 0%, transparent 70%)'
                  }}
                ></div>
              )}

              {/* Realistic Car SVG - Anatomically Correct (Front on Right, Rear on Left) */}
              <svg viewBox="0 0 340 140" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
                <defs>
                  {/* Taxi Vibrant Yellow Body with Metallic Reflection */}
                  <linearGradient id="taxiBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="20%" stopColor="#FACC15" />
                    <stop offset="65%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#854D0E" />
                  </linearGradient>

                  {/* Glossy Black Roof */}
                  <linearGradient id="taxiRoofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="50%" stopColor="#1E293B" />
                    <stop offset="100%" stopColor="#0F172A" />
                  </linearGradient>

                  {/* Tinted Automotive Glass */}
                  <linearGradient id="tintedGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#0369A1" stopOpacity="0.95" />
                  </linearGradient>

                  {/* Polished Alloy Rim */}
                  <linearGradient id="alloyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="50%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow */}
                <ellipse cx="170" cy="128" rx="155" ry="9" fill="#000" opacity="0.7" filter="blur(3px)" />

                {/* ── 1. Main Car Body Chassis ── */}
                {/* Correct Sedan Profile:
                    Left: Rear bumper, trunk lid, rear window
                    Center: Cabin roof, doors
                    Right: Sloped windshield, sculpted long hood, front bumper & headlights */}
                <path
                  d="M 22 96 
                     C 18 90, 18 78, 24 74 
                     L 68 70 
                     C 80 55, 96 40, 118 34 
                     L 216 34 
                     C 236 44, 252 58, 264 68 
                     L 306 73 
                     C 316 76, 324 84, 322 92 
                     L 318 106 
                     C 305 106, 298 94, 280 94 
                     C 260 94, 246 104, 238 110 
                     L 116 110 
                     C 108 102, 94 94, 76 94 
                     C 58 94, 44 104, 38 110 
                     L 24 108 
                     Z"
                  fill="url(#taxiBodyGrad)"
                  stroke="#CA8A04"
                  strokeWidth="1.2"
                />

                {/* ── 2. Aerodynamic Black Roof Canopy ── */}
                <path
                  d="M 115 34 
                     L 218 34 
                     C 234 44, 248 57, 260 67 
                     L 74 69 
                     C 88 54, 102 40, 115 34 
                     Z"
                  fill="url(#taxiRoofGrad)"
                />

                {/* ── 3. Illuminated TAXI Rooftop Sign ── */}
                <g transform="translate(155, 17)">
                  {/* Base mount */}
                  <rect x="0" y="14" width="30" height="3" rx="1.5" fill="#1E293B" />
                  {/* Luminous Taxi Sign Wedge */}
                  <path d="M 2 14 L 6 3 L 24 3 L 28 14 Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" filter="drop-shadow(0 0 6px rgba(254, 240, 138, 0.85))" />
                  <text x="15" y="11" fill="#000" fontSize="7.5" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
                    TAXI
                  </text>
                </g>

                {/* ── 4. Windows with Driver & Passenger Silhouettes ── */}
                {/* Rear Passenger Window (Left) */}
                <path
                  d="M 80 67 
                     C 92 53, 104 42, 118 38 
                     L 158 38 
                     L 158 67 
                     Z"
                  fill="url(#tintedGlass)"
                />
                {/* Front Driver Window (Right) */}
                <path
                  d="M 164 38 
                     L 210 38 
                     C 225 46, 238 56, 248 67 
                     L 164 67 
                     Z"
                  fill="url(#tintedGlass)"
                />

                {/* Interior Silhouettes */}
                {/* Rear Passenger */}
                <circle cx="125" cy="53" r="6" fill="#1E293B" />
                <path d="M 132 65 L 130 59 L 120 59 L 118 65 Z" fill="#1E293B" />
                {/* Driver (facing forward to the right) */}
                <circle cx="195" cy="51" r="6.5" fill="#0F172A" />
                <path d="M 204 65 L 201 57 L 189 57 L 186 65 Z" fill="#0F172A" />
                {/* Steering Wheel (slanted forward to right) */}
                <line x1="210" y1="55" x2="216" y2="67" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />

                {/* ── 5. Classic Checkered Taxi Stripe Across Door ── */}
                <g transform="translate(68, 78)">
                  <rect x="0" y="0" width="195" height="7" fill="#1E293B" rx="1.5" />
                  {/* Alternating white/amber checkers */}
                  <rect x="6" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="22" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="38" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="54" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="70" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="86" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="102" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="118" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="134" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="150" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="166" y="1" width="8" height="5" fill="#FEF08A" />
                  <rect x="182" y="1" width="8" height="5" fill="#FEF08A" />
                </g>

                {/* HopIn Badge on Door */}
                <g transform="translate(142, 88)">
                  <rect width="32" height="13" rx="4" fill="#0F172A" />
                  <text x="16" y="9.5" fill="#FACC15" fontSize="7" fontWeight="900" textAnchor="middle">
                    HopIn
                  </text>
                </g>

                {/* Door Seam & Handles */}
                <line x1="161" y1="38" x2="161" y2="108" stroke="#854D0E" strokeWidth="1.2" />
                <rect x="135" y="73" width="12" height="3" rx="1.5" fill="#854D0E" />
                <rect x="180" y="73" width="12" height="3" rx="1.5" fill="#854D0E" />

                {/* Aerodynamic Side Mirror (facing forward on right) */}
                <ellipse cx="222" cy="67" rx="6" ry="4" fill="#FACC15" stroke="#854D0E" strokeWidth="1" />
                <circle cx="225" cy="67" r="1.5" fill="#FEF08A" />

                {/* ── 6. FRONT HEADLIGHT ASSEMBLY (Right Side Facing Forward) ── */}
                {/* Aerodynamic wrap-around headlight casing */}
                <path d="M 296 73 L 316 78 L 314 88 L 294 84 Z" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="0.8" />
                {/* Projector LED eye */}
                <circle cx="308" cy="81" r="3.5" fill="#38BDF8" className={isDriving ? 'animate-pulse' : ''} />
                <circle cx="308" cy="81" r="1.5" fill="#FFFFFF" />
                {/* Amber corner turn indicator */}
                <rect x="313" y="78" width="2" height="7" rx="1" fill="#F59E0B" />

                {/* ── 7. REAR TAILLIGHT ASSEMBLY (Left Side) ── */}
                {/* Dual stage rear lamp */}
                <path
                  d="M 20 74 L 28 75 L 26 86 L 19 84 Z"
                  fill={brakeLightsOn ? '#EF4444' : '#DC2626'}
                  filter={brakeLightsOn ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 1))' : 'drop-shadow(0 0 3px rgba(220, 38, 38, 0.7))'}
                />

                {/* Exhaust tip on rear bottom left */}
                <rect x="15" y="103" width="7" height="3" rx="1.5" fill="#64748B" />

                {/* ── 8. Detailed Rotating Wheels ── */}
                {/* Rear Wheel (Left) */}
                <g transform="translate(76, 110)">
                  <circle cx="0" cy="0" r="22" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="17" fill="#27272A" />
                  <circle cx="0" cy="0" r="13" fill="#52525B" />
                  <circle cx="0" cy="0" r="12" fill="#71717A" stroke="#3F3F46" strokeWidth="0.5" />
                  {/* Fixed Red Brake Caliper */}
                  <path d="M -5 -12 Q 0 -13 5 -12 L 4 -7 Q 0 -8 -4 -7 Z" fill="#DC2626" />
                  {/* Rotating 5-Spoke Alloy Rim (Rotates strictly around local center 0, 0) */}
                  <g>
                    {isDriving && (
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 0 0"
                        to="360 0 0"
                        dur="0.32s"
                        repeatCount="indefinite"
                      />
                    )}
                    <circle cx="0" cy="0" r="11" fill="none" stroke="url(#alloyGrad)" strokeWidth="2.5" />
                    <line x1="0" y1="-11" x2="0" y2="11" stroke="url(#alloyGrad)" strokeWidth="2.4" />
                    <line x1="-10.5" y1="-3.4" x2="10.5" y2="3.4" stroke="url(#alloyGrad)" strokeWidth="2.4" />
                    <line x1="-6.5" y1="8.9" x2="6.5" y2="-8.9" stroke="url(#alloyGrad)" strokeWidth="2.4" />
                    <circle cx="0" cy="0" r="3.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.5" />
                  </g>
                </g>

                {/* Front Wheel (Right) */}
                <g transform="translate(258, 110)">
                  <circle cx="0" cy="0" r="22" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="17" fill="#27272A" />
                  <circle cx="0" cy="0" r="13" fill="#52525B" />
                  <circle cx="0" cy="0" r="12" fill="#71717A" stroke="#3F3F46" strokeWidth="0.5" />
                  {/* Fixed Red Brake Caliper */}
                  <path d="M -5 -12 Q 0 -13 5 -12 L 4 -7 Q 0 -8 -4 -7 Z" fill="#DC2626" />
                  {/* Rotating 5-Spoke Alloy Rim (Rotates strictly around local center 0, 0) */}
                  <g>
                    {isDriving && (
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 0 0"
                        to="360 0 0"
                        dur="0.32s"
                        repeatCount="indefinite"
                      />
                    )}
                    <circle cx="0" cy="0" r="11" fill="none" stroke="url(#alloyGrad)" strokeWidth="2.5" />
                    <line x1="0" y1="-11" x2="0" y2="11" stroke="url(#alloyGrad)" strokeWidth="2.4" />
                    <line x1="-10.5" y1="-3.4" x2="10.5" y2="3.4" stroke="url(#alloyGrad)" strokeWidth="2.4" />
                    <line x1="-6.5" y1="8.9" x2="6.5" y2="-8.9" stroke="url(#alloyGrad)" strokeWidth="2.4" />
                    <circle cx="0" cy="0" r="3.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.5" />
                  </g>
                </g>
              </svg>
            </div>
          ) : (
            /* ═══════════════ OPTION B: AUTHENTIC CURVED INDIAN BBD E-RICKSHAW ═══════════════ */
            <div className="relative w-48 sm:w-56 h-24">
              
              {/* Forward Projecting Volumetric Headlight Cone (Ahead on Right) */}
              <div
                className="absolute top-9 left-[80%] w-68 h-26 pointer-events-none z-10 transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(ellipse at left, rgba(254, 240, 138, 0.6) 0%, rgba(254, 240, 138, 0.15) 50%, transparent 75%)',
                  clipPath: 'polygon(0% 25%, 100% 0%, 100% 100%, 0% 75%)',
                  opacity: isStopped ? 0.35 : 0.85
                }}
              ></div>

              {/* Road Asphalt Illumination Glow Ahead */}
              <div
                className="absolute top-15 left-[88%] w-56 h-9 pointer-events-none rounded-full blur-md transition-opacity duration-500"
                style={{
                  background: 'radial-gradient(ellipse, rgba(254, 240, 138, 0.4) 0%, transparent 70%)',
                  opacity: isStopped ? 0.25 : 0.75
                }}
              ></div>

              {/* Rear Brake Light Glow onto Road (Behind on Left) */}
              {brakeLightsOn && (
                <div
                  className="absolute top-11 -left-12 w-20 h-16 pointer-events-none rounded-full blur-lg animate-pulse"
                  style={{
                    background: 'radial-gradient(ellipse, rgba(239, 68, 68, 0.85) 0%, transparent 70%)'
                  }}
                ></div>
              )}

              <svg viewBox="0 0 340 140" className="w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
                <defs>
                  {/* High Gloss Lucknow Emerald Green */}
                  <linearGradient id="rickshawGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="35%" stopColor="#059669" />
                    <stop offset="85%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </linearGradient>

                  {/* High Gloss Campus Golden Yellow */}
                  <linearGradient id="rickshawYellow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FEF08A" />
                    <stop offset="30%" stopColor="#FACC15" />
                    <stop offset="75%" stopColor="#EAB308" />
                    <stop offset="100%" stopColor="#9A3412" />
                  </linearGradient>

                  {/* Polished Chrome Tubular Frame */}
                  <linearGradient id="chromeTubing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="30%" stopColor="#CBD5E1" />
                    <stop offset="70%" stopColor="#64748B" />
                    <stop offset="100%" stopColor="#F1F5F9" />
                  </linearGradient>

                  {/* Tinted Safety Glass Windshield */}
                  <linearGradient id="rickshawGlass" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.85" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#0284C7" stopOpacity="0.75" />
                  </linearGradient>
                </defs>

                {/* Ground Shadow */}
                <ellipse cx="170" cy="128" rx="148" ry="9" fill="#000" opacity="0.65" filter="blur(3px)" />

                {/* ── 1. Aerodynamic Fiberglass Canopy Roof with Contours & Visor ── */}
                {/* Curved Roof Shell (Not a box: sculpted aerodynamic curves) */}
                <path
                  d="M 46 42 
                     C 42 30, 56 22, 74 18 
                     C 120 12, 195 12, 238 18 
                     C 252 20, 262 25, 268 32 
                     C 272 37, 266 43, 256 44 
                     L 245 42 
                     C 210 38, 110 38, 48 44 
                     Z"
                  fill="url(#rickshawYellow)"
                  stroke="#CA8A04"
                  strokeWidth="1.2"
                />

                {/* Top Center Green Racing/Campus Accent Ribbon */}
                <path
                  d="M 52 38 
                     C 70 24, 130 18, 232 24 
                     L 252 34 
                     L 242 37 
                     C 150 28, 90 30, 50 40 
                     Z"
                  fill="url(#rickshawGreen)"
                  opacity="0.95"
                />

                {/* Rooftop Chrome Luggage / Parcel Carrier Rails */}
                <path
                  d="M 72 16 L 228 16 M 85 16 L 85 20 M 130 14 L 130 18 M 175 14 L 175 18 M 215 16 L 215 20"
                  stroke="url(#chromeTubing)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* ── 2. Curved Tubular Stainless Steel Roll Cage Architecture ── */}
                {/* Front A-Pillar (Gracefully raked curved tube supporting windshield) */}
                <path
                  d="M 252 41 
                     C 246 54, 238 72, 232 94"
                  fill="none"
                  stroke="url(#chromeTubing)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Middle B-Pillar (Curved center arch with smooth 45° bends) */}
                <path
                  d="M 152 40 
                     L 150 96"
                  fill="none"
                  stroke="url(#chromeTubing)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Rear C-Pillar (Wraps into rear support) */}
                <path
                  d="M 54 42 
                     C 50 58, 48 76, 48 96"
                  fill="none"
                  stroke="url(#chromeTubing)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Curved Side Safety Passenger Rail (Wavy ergonomic chrome tube, NOT a flat wall) */}
                <path
                  d="M 50 82 
                     C 80 80, 110 74, 142 82 
                     C 148 84, 150 92, 148 96 
                     L 54 96"
                  fill="none"
                  stroke="url(#chromeTubing)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <line x1="96" y1="80" x2="96" y2="96" stroke="url(#chromeTubing)" strokeWidth="2" />

                {/* ── 3. Aerodynamic Curved Front Windshield & Wiper ── */}
                <path
                  d="M 248 37 
                     L 258 35 
                     C 255 52, 246 72, 240 82 
                     L 228 82 
                     Z"
                  fill="url(#rickshawGlass)"
                  stroke="#0284C7"
                  strokeWidth="0.8"
                />
                {/* Delicate Wiper blade */}
                <line x1="238" y1="62" x2="248" y2="52" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" />

                {/* ── 4. Sculpted Front Nose Cowl / Apron (Green & Yellow) ── */}
                {/* Aerodynamic leg-shield curved apron */}
                <path
                  d="M 228 82 
                     C 236 83, 246 83, 252 87 
                     C 258 92, 260 100, 256 107 
                     L 236 107 
                     C 234 98, 230 89, 228 82 
                     Z"
                  fill="url(#rickshawGreen)"
                  stroke="#047857"
                  strokeWidth="1.2"
                />
                {/* Yellow front nose stripe */}
                <path d="M 242 84 L 249 86 L 244 106 L 238 106 Z" fill="url(#rickshawYellow)" />

                {/* ── 5. Driver & College Passenger Silhouettes ── */}
                {/* Interior warm dome light glow under canopy */}
                <ellipse cx="140" cy="45" rx="55" ry="6" fill="#FEF08A" opacity="0.3" filter="blur(4px)" />

                {/* Passengers (Rear Cabin) */}
                {/* Passenger 1 (Girl with ponytail) */}
                <circle cx="82" cy="62" r="6" fill="#F472B6" />
                <path d="M 76 63 Q 71 67 74 72" fill="none" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
                <path d="M 75 74 L 89 74 L 87 92 L 73 92 Z" fill="#4F46E5" rx="2" />
                {/* College Backpack */}
                <rect x="68" y="72" width="7" height="14" rx="2.5" fill="#E11D48" />

                {/* Passenger 2 (Boy with headphone band) */}
                <circle cx="116" cy="61" r="6.5" fill="#38BDF8" />
                <path d="M 109 60 Q 116 53 123 60" fill="none" stroke="#FBBF24" strokeWidth="1.8" />
                <path d="M 108 73 L 124 73 L 122 92 L 106 92 Z" fill="#0D9488" rx="2" />

                {/* Passenger Cushioned Bench with Padded Backrest */}
                <rect x="62" y="78" width="82" height="16" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="1" />
                <rect x="64" y="90" width="78" height="5" rx="1.5" fill="#334155" />

                {/* Driver (Front Saddle) */}
                {/* Driver Head & Cap */}
                <circle cx="204" cy="58" r="6.5" fill="#F59E0B" />
                <path d="M 200 53 L 213 54 L 208 57 Z" fill="#1E293B" />
                {/* Driver Body leaning forward */}
                <path d="M 196 69 L 212 69 L 215 88 L 194 88 Z" fill="#1E293B" rx="2" />
                {/* Driver Leather Saddle Seat */}
                <path d="M 188 88 C 188 84, 214 84, 214 88 L 210 94 L 192 94 Z" fill="#0F172A" />
                {/* Chrome Handlebars with Grips & Mirror */}
                <line x1="214" y1="74" x2="228" y2="78" stroke="url(#chromeTubing)" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="228" cy="78" r="2" fill="#0F172A" />
                <line x1="223" y1="74" x2="225" y2="68" stroke="url(#chromeTubing)" strokeWidth="1.5" />
                <ellipse cx="225" cy="67" rx="2.5" ry="4" fill="#38BDF8" stroke="#334155" strokeWidth="0.8" />

                {/* ── 6. Front Fork & Chrome Bullbar Assembly ── */}
                {/* Heavy Duty Telescopic Hydraulic Twin Forks (Leading to front axle) */}
                <line x1="240" y1="78" x2="265" y2="112" stroke="url(#chromeTubing)" strokeWidth="4" strokeLinecap="round" />
                {/* Chrome Twin Shock Absorber Coils */}
                <line x1="244" y1="84" x2="257" y2="102" stroke="#FACC15" strokeWidth="3" strokeDasharray="2 3" />

                {/* Front Chrome Crash Guard / Bullbar */}
                <path
                  d="M 245 106 
                     C 264 104, 280 104, 282 108 
                     C 282 114, 270 118, 258 118"
                  fill="none"
                  stroke="url(#chromeTubing)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />

                {/* Large Round Crystal LED Headlight (High Mounted on Fork, Facing Right) */}
                <g transform="translate(260, 80)">
                  {/* Chrome housing */}
                  <circle cx="0" cy="0" r="7" fill="url(#chromeTubing)" stroke="#475569" strokeWidth="1" />
                  {/* Glowing lens */}
                  <circle cx="1" cy="0" r="5" fill="#FEF08A" filter="drop-shadow(0 0 6px rgba(254, 240, 138, 0.95))" />
                  <circle cx="2" cy="0" r="2.5" fill="#FFFFFF" />
                  {/* Amber Bullet Turn Indicator */}
                  <rect x="-3" y="6" width="3" height="4" rx="1.5" fill="#F59E0B" />
                </g>

                {/* ── 7. Lower Body Chassis, Battery Pack & Footstep ── */}
                {/* Lower Side Body Skirt with Emerald Green & Yellow Pinstripe */}
                <path
                  d="M 44 96 
                     L 234 96 
                     C 230 106, 222 114, 214 116 
                     L 138 116 
                     C 134 108, 126 102, 116 102 
                     C 106 102, 98 108, 94 116 
                     L 46 116 
                     Z"
                  fill="url(#rickshawGreen)"
                  stroke="#047857"
                  strokeWidth="1.2"
                />

                {/* Battery Compartment Cover with HopIn Badge */}
                <g transform="translate(142, 100)">
                  <rect width="44" height="14" rx="3" fill="#0F172A" stroke="#FACC15" strokeWidth="1" />
                  <text x="22" y="10" fill="#FACC15" fontSize="7" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
                    HopIn EV
                  </text>
                </g>

                {/* Diamond-Plate Aluminum Passenger Footboard / Boarding Step */}
                <rect x="58" y="112" width="76" height="4" rx="1.5" fill="url(#chromeTubing)" stroke="#64748B" strokeWidth="0.8" />

                {/* Rear Chrome Bumper Bar (Facing Left) */}
                <path d="M 42 104 L 35 107 L 35 116 L 44 116" fill="none" stroke="url(#chromeTubing)" strokeWidth="3" strokeLinecap="round" />

                {/* Multi-Element Rear LED Taillight (Facing Left) */}
                <g transform="translate(38, 92)">
                  <rect
                    x="0"
                    y="0"
                    width="6"
                    height="12"
                    rx="2"
                    fill={brakeLightsOn ? '#EF4444' : '#DC2626'}
                    filter={brakeLightsOn ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 1))' : 'drop-shadow(0 0 3px rgba(220, 38, 38, 0.7))'}
                  />
                  <circle cx="3" cy="3" r="1.5" fill="#FEF08A" />
                </g>

                {/* ── 8. High-Detail Wheels with Concentric Rotating Spokes ── */}
                {/* Rear Wheel (Left) */}
                <g transform="translate(76, 112)">
                  {/* Stationary Tire & Mudguard */}
                  <path d="M -22 -2 C -22 -14, 22 -14, 22 -2" fill="none" stroke="url(#rickshawGreen)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="19" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="14" fill="#27272A" />
                  <circle cx="0" cy="0" r="12" fill="#475569" stroke="#334155" strokeWidth="0.5" />
                  {/* Concentric Rotating Chrome Spokes (Centered strictly on 0, 0) */}
                  <g>
                    {isDriving && (
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 0 0"
                        to="360 0 0"
                        dur="0.32s"
                        repeatCount="indefinite"
                      />
                    )}
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <line x1="-8.5" y1="-8.5" x2="8.5" y2="8.5" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <line x1="-8.5" y1="8.5" x2="8.5" y2="-8.5" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <circle cx="0" cy="0" r="3.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.6" />
                  </g>
                </g>

                {/* Front Single Wheel (Right) with Chrome Mudguard */}
                <g transform="translate(265, 112)">
                  {/* Chrome Curved Front Mudguard */}
                  <path d="M -22 -4 C -22 -16, 16 -16, 20 -2" fill="none" stroke="url(#chromeTubing)" strokeWidth="3" strokeLinecap="round" />
                  {/* Tire */}
                  <circle cx="0" cy="0" r="19" fill="#18181B" stroke="#09090B" strokeWidth="2" />
                  <circle cx="0" cy="0" r="14" fill="#27272A" />
                  <circle cx="0" cy="0" r="12" fill="#475569" stroke="#334155" strokeWidth="0.5" />
                  {/* Concentric Rotating Chrome Spokes (Centered strictly on 0, 0) */}
                  <g>
                    {isDriving && (
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 0 0"
                        to="360 0 0"
                        dur="0.32s"
                        repeatCount="indefinite"
                      />
                    )}
                    <line x1="0" y1="-12" x2="0" y2="12" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <line x1="-12" y1="0" x2="12" y2="0" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <line x1="-8.5" y1="-8.5" x2="8.5" y2="8.5" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <line x1="-8.5" y1="8.5" x2="8.5" y2="-8.5" stroke="url(#chromeTubing)" strokeWidth="1.8" />
                    <circle cx="0" cy="0" r="3.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="0.6" />
                  </g>
                </g>
              </svg>
            </div>
          )}

        </div>
      </div>

      {/* ── Status Indicator Bar (Bottom Left) ───────────────────────────── */}
      <div className="absolute bottom-2 left-3 z-40 flex items-center gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Street Preview: BBD Transit Corridor ⚡</span>
        </span>
      </div>

    </div>
  );
};
