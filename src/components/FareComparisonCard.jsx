import React, { useState, useEffect, useMemo } from 'react';
import { 
  calculateFareEstimates, 
  getPlatformDeepLinks,
  fetchCustomLocationCoords,
  resolveLocationCoords,
  fetchLiveLucknowWeather,
  getSurgeContext
} from '../utils/fareEngine';
import { 
  Navigation, 
  Clock, 
  ExternalLink, 
  TrendingDown, 
  Sliders, 
  Check, 
  MapPin, 
  RefreshCw,
  CloudRain,
  Moon,
  Zap,
  Sun
} from 'lucide-react';

/**
 * FareComparisonCard:
 * Simple, decent, and clean ride comparison card.
 * Minimalist aesthetic with high legibility, clear rate comparisons, and contextual surge detection.
 */
export const FareComparisonCard = ({
  pickup,
  dropoff,
  capacity = 3,
  departureTime = null,
  onSelectEstimatedFare,
  compact = false
}) => {
  const [manualDistance, setManualDistance] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [resolvedPickup, setResolvedPickup] = useState(null);
  const [resolvedDropoff, setResolvedDropoff] = useState(null);
  const [showSlider, setShowSlider] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);
  const [copiedApp, setCopiedApp] = useState(null);

  // Fetch real-time Lucknow weather on mount
  useEffect(() => {
    let isMounted = true;
    fetchLiveLucknowWeather().then((w) => {
      if (isMounted) setLiveWeather(w);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    setManualDistance(null);
    let isMounted = true;

    const resolveLocations = async () => {
      if (!pickup || !dropoff) return;

      const pCoord = resolveLocationCoords(pickup);
      const dCoord = resolveLocationCoords(dropoff);

      setResolvedPickup(pCoord);
      setResolvedDropoff(dCoord);

      if (!pCoord || !dCoord) {
        setIsGeocoding(true);
        try {
          const [fetchedP, fetchedD] = await Promise.all([
            pCoord ? Promise.resolve(pCoord) : fetchCustomLocationCoords(pickup),
            dCoord ? Promise.resolve(dCoord) : fetchCustomLocationCoords(dropoff)
          ]);

          if (isMounted) {
            if (fetchedP) setResolvedPickup(fetchedP);
            if (fetchedD) setResolvedDropoff(fetchedD);
          }
        } finally {
          if (isMounted) setIsGeocoding(false);
        }
      }
    };

    resolveLocations();

    return () => {
      isMounted = false;
    };
  }, [pickup, dropoff]);

  const surgeContext = useMemo(() => {
    const targetDate = departureTime ? new Date(departureTime) : new Date();
    return getSurgeContext(targetDate, liveWeather);
  }, [departureTime, liveWeather]);

  const estimates = useMemo(() => {
    return calculateFareEstimates(pickup, dropoff, capacity, manualDistance, surgeContext);
  }, [pickup, dropoff, capacity, manualDistance, resolvedPickup, resolvedDropoff, surgeContext]);

  const deepLinks = useMemo(() => {
    return getPlatformDeepLinks(pickup, dropoff);
  }, [pickup, dropoff]);

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

  const getPlatformHref = (platform) => {
    if (!isMobile) {
      // Desktop: Open official web portal directly in new tab
      if (platform === 'uber') return deepLinks.uberWeb || deepLinks.uber;
      if (platform === 'ola') return deepLinks.olaWeb || deepLinks.ola;
      if (platform === 'rapido') return deepLinks.rapidoWeb || deepLinks.rapido;
      return deepLinks.gmaps;
    }

    if (isAndroid) {
      // Android: Native intent with S.browser_fallback_url (launches app directly, falls back to web if not installed)
      if (platform === 'uber') return deepLinks.uberIntent || deepLinks.uberApp;
      if (platform === 'ola') return deepLinks.olaIntent || deepLinks.olaApp;
      if (platform === 'rapido') return deepLinks.rapidoIntent || deepLinks.rapidoApp;
      return deepLinks.gmaps;
    }

    // iOS mobile
    if (platform === 'uber') return deepLinks.uberApp || deepLinks.uberWeb;
    if (platform === 'ola') return deepLinks.olaApp || deepLinks.olaWeb;
    if (platform === 'rapido') return deepLinks.rapidoApp || deepLinks.rapidoWeb;
    return deepLinks.gmaps;
  };

  const handleAppClick = (platform) => {
    if (platform === 'rapido' && deepLinks.dropoffName) {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(deepLinks.dropoffName);
          setCopiedApp('rapido');
          setTimeout(() => setCopiedApp(null), 4000);
        }
      } catch (err) {
        console.warn('Clipboard copy error:', err);
      }
    }
  };

  if (!pickup || !dropoff) return null;

  const { distanceKm, estMins, isExactGPS, rapido, auto, cab, hopinPool } = estimates;

  return (
    <div className="rounded-2xl aesthetic-card p-4 sm:p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all">
      
      {/* Header: Clean & Decent Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Estimated Route Fares
            </span>
            {isExactGPS || resolvedPickup || resolvedDropoff ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                <span>GPS Mapped</span>
              </span>
            ) : isGeocoding ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Locating...</span>
              </span>
            ) : null}
          </div>

          {/* Dynamic Context Surge Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            {surgeContext.badges.length > 0 ? (
              surgeContext.badges.map((b, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                    b.type === 'night'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      : b.type === 'rain'
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}
                  title={b.detail}
                >
                  <span>{b.icon}</span>
                  <span>{b.label}</span>
                </span>
              ))
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <span>☀️</span>
                <span>Normal Traffic Rate</span>
              </span>
            )}
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              • Solo rates vs HopIn shared pool
            </span>
          </div>
        </div>

        {/* Distance & Travel Duration Badges */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSlider(!showSlider)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              showSlider || manualDistance !== null
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="Adjust distance"
          >
            <Navigation className="w-3 h-3" />
            <span>~{distanceKm} km</span>
            <Sliders className="w-3 h-3 opacity-60 ml-0.5" />
          </button>

          <div className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 text-slate-500" />
            <span>~{estMins}m</span>
          </div>
        </div>
      </div>

      {/* Distance Slider (Simple & Clean) */}
      {showSlider && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>Adjust Distance manually:</span>
            <span className="font-bold text-slate-900 dark:text-white">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="35"
            step="0.5"
            value={distanceKm}
            onChange={(e) => setManualDistance(parseFloat(e.target.value))}
            className="w-full accent-slate-700 dark:accent-slate-300 cursor-pointer"
          />
          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 pt-1">
            <button
              type="button"
              onClick={() => setManualDistance(3)}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              3 km
            </button>
            <button
              type="button"
              onClick={() => setManualDistance(6)}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              6 km
            </button>
            <button
              type="button"
              onClick={() => setManualDistance(12)}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              12 km
            </button>
            <button
              type="button"
              onClick={() => setManualDistance(18)}
              className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
            >
              18 km
            </button>
            {manualDistance !== null && (
              <button
                type="button"
                onClick={() => setManualDistance(null)}
                className="px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 font-bold"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* HopIn Pool Split (Decent & Elegant Card) */}
      <div className="rounded-xl bg-slate-900 text-white dark:bg-slate-800/90 border border-slate-800 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                HopIn Shared Fare ({capacity} Seats)
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                ₹{hopinPool.perPersonFare}
              </span>
              <span className="text-xs text-slate-300">/ student</span>
              <span className="text-xs text-slate-400 line-through">
                ₹{hopinPool.totalVehicleFare} solo
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Save ~₹{hopinPool.savedAmount} ({hopinPool.savedPercent}%) by pooling together</span>
            </p>
          </div>

          {onSelectEstimatedFare && (
            <button
              type="button"
              onClick={() => onSelectEstimatedFare(hopinPool.perPersonFare)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Use Fare (₹{hopinPool.perPersonFare})</span>
            </button>
          )}
        </div>
      </div>

      {/* Side-by-Side Market Rate Cards (Simple & Decent) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Solo Estimates (Market Reference)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          
          {/* Rapido Bike */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>{rapido.icon}</span>
                <span>{rapido.name}</span>
              </span>
              <span className="text-[10px] text-slate-500">1 Rider</span>
            </div>
            <div className="mt-2">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                ₹{rapido.low} – ₹{rapido.high}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Avg ~₹{rapido.avg} solo
              </span>
            </div>
          </div>

          {/* Auto Rickshaw */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>{auto.icon}</span>
                <span>{auto.name}</span>
              </span>
              <span className="text-[10px] text-slate-500">3 Seats</span>
            </div>
            <div className="mt-2">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                ₹{auto.low} – ₹{auto.high}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Total auto fare
              </span>
            </div>
          </div>

          {/* Cab */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span>{cab.icon}</span>
                <span>{cab.name}</span>
              </span>
              <span className="text-[10px] text-slate-500">4 Seats</span>
            </div>
            <div className="mt-2">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                ₹{cab.low} – ₹{cab.high}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Total cab fare
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 1-Tap App Deep Link Launchers */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <span>Direct App Booking & Live Price Check</span>
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            Auto-Fills Route
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          
          {/* Uber */}
          <a
            href={getPlatformHref('uber')}
            target={isMobile ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="min-h-[44px] px-3 py-2 rounded-xl bg-black hover:bg-slate-900 text-white font-black text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-md active:scale-95 group text-center no-underline cursor-pointer"
            title={`Open Uber directly for ${deepLinks.dropoffName}`}
          >
            <div className="w-5 h-5 rounded-md bg-white text-black flex items-center justify-center font-black text-[10px] shrink-0">
              U
            </div>
            <span>Uber</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </a>

          {/* Ola */}
          <a
            href={getPlatformHref('ola')}
            target={isMobile ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="min-h-[44px] px-3 py-2 rounded-xl bg-[#000000] hover:bg-slate-900 text-[#b5ff00] font-black text-xs flex items-center justify-center gap-2 transition-all border border-[#b5ff00]/40 shadow-md active:scale-95 group text-center no-underline cursor-pointer"
            title={`Open Ola directly for ${deepLinks.dropoffName}`}
          >
            <div className="w-5 h-5 rounded-md bg-[#b5ff00] text-black flex items-center justify-center font-black text-[10px] shrink-0">
              O
            </div>
            <span>Ola</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </a>

          {/* Rapido */}
          <a
            href={getPlatformHref('rapido')}
            target={isMobile ? '_self' : '_blank'}
            rel="noopener noreferrer"
            onClick={() => handleAppClick('rapido')}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-[#F9D100] hover:bg-yellow-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all border border-yellow-500 shadow-md active:scale-95 group text-center no-underline cursor-pointer"
            title={`Open Rapido directly for ${deepLinks.dropoffName}`}
          >
            <div className="w-5 h-5 rounded-md bg-slate-950 text-white flex items-center justify-center font-black text-[10px] shrink-0">
              R
            </div>
            <span>Rapido</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </a>

          {/* Google Maps */}
          <a
            href={getPlatformHref('gmaps')}
            target={isMobile ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white font-black text-xs flex items-center justify-center gap-2 transition-all border border-slate-300 dark:border-slate-700 shadow-sm active:scale-95 group text-center no-underline cursor-pointer"
            title={`Open Google Maps ride comparison for ${deepLinks.dropoffName}`}
          >
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
          </a>

        </div>

        {/* Rapido Instant Clipboard Notification */}
        {copiedApp === 'rapido' && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Destination <strong className="underline decoration-amber-500">"{deepLinks.dropoffName}"</strong> copied to clipboard! (If Rapido shows the search bar, simply tap paste)
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
