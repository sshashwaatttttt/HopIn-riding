import React, { useState, useEffect } from 'react';
import { useAuth, getDomainOrgInfo } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getRides, subscribeToSync, getBlockedUserIds } from '../utils/store';
import { CityStreetAnimation } from '../components/CityStreetAnimation';
import { RideCard } from '../components/RideCard';
import { resolveLocationCoords, calculateHaversineKm, detectLiveCoordinates } from '../utils/fareEngine';
import { 
  Search, 
  Filter, 
  Sparkles, 
  PlusCircle, 
  MapPin, 
  Navigation,
  CheckCircle2,
  X,
  RotateCcw,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveRideBoard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [rides, setRides] = useState([]);
  const [directionFilter, setDirectionFilter] = useState('all'); // 'all', 'toCampus', 'fromCampus'
  const [searchQuery, setSearchQuery] = useState('');
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);
  
  // 2 KM Radius Proximity Filter State (Active by default)
  const [radiusFilterActive, setRadiusFilterActive] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locatingGps, setLocatingGps] = useState(false);

  // Determine user's base organization hub
  const userOrgInfo = getDomainOrgInfo(user?.email || user?.domain);
  const baseHubName = userOrgInfo?.hub || (user?.domain?.includes('hcltech.com') ? 'HCL IT City Lucknow' : 'BBDU Main Gate');
  const baseCoords = userOrgInfo?.hubCoords || resolveLocationCoords(baseHubName) || { lat: 26.7972, lng: 81.0264 };

  // Current effective location (GPS if available, else organization hub)
  const effectiveLocation = userLocation || {
    lat: baseCoords.lat,
    lng: baseCoords.lng,
    label: `${userOrgInfo?.org || 'Your Hub'} (${baseHubName})`,
    isGps: false
  };

  const refreshRides = () => {
    const data = getRides();
    const blocked = getBlockedUserIds() || [];
    const clean = (Array.isArray(data) ? data : []).filter(r => r && (!r.host || !blocked.includes(r.host.id)));
    setRides(clean);
  };

  useEffect(() => {
    refreshRides();
    const unsubscribe = subscribeToSync(() => {
      refreshRides();
    });
    return () => unsubscribe();
  }, []);

  // Detect user live location with seamless multi-layer fallback
  const detectLiveLocation = async () => {
    setLocatingGps(true);
    try {
      const coords = await detectLiveCoordinates();
      if (coords && coords.lat && coords.lng) {
        setUserLocation({
          lat: coords.lat,
          lng: coords.lng,
          label: coords.source === 'gps' ? 'Live GPS Location' : 'Detected Area (Near Campus)',
          isGps: coords.source === 'gps'
        });
        setRadiusFilterActive(true);
      }
    } catch (err) {
      console.warn('Location detection fallback:', err);
    } finally {
      setLocatingGps(false);
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setDirectionFilter('all');
    setWomenOnlyFilter(false);
    setRadiusFilterActive(false);
  };

  const isFiltered = searchQuery.trim() !== '' || directionFilter !== 'all' || womenOnlyFilter || radiusFilterActive;

  // Filter rides based on criteria and 2 KM radius
  const filteredRides = rides.filter(ride => {
    // 1. Direction Filter
    if (directionFilter !== 'all' && ride.direction !== directionFilter) return false;
    
    // 2. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPickup = ride.pickup?.toLowerCase().includes(q);
      const matchDrop = ride.dropoff?.toLowerCase().includes(q);
      const matchHost = ride.host?.name?.toLowerCase().includes(q);
      const matchOrg = ride.host?.organization?.toLowerCase().includes(q);
      if (!matchPickup && !matchDrop && !matchHost && !matchOrg) return false;
    }

    // 3. Women Only Filter
    if (womenOnlyFilter && !ride.womenOnly) return false;

    // 4. 2 KM Proximity Radius Filter
    if (radiusFilterActive && effectiveLocation) {
      const pickupCoords = ride.pickupCoords || resolveLocationCoords(ride.pickup);
      const dropoffCoords = ride.dropoffCoords || resolveLocationCoords(ride.dropoff);

      if (pickupCoords || dropoffCoords) {
        let distPickup = pickupCoords ? calculateHaversineKm(effectiveLocation.lat, effectiveLocation.lng, pickupCoords.lat, pickupCoords.lng) : 999;
        let distDropoff = dropoffCoords ? calculateHaversineKm(effectiveLocation.lat, effectiveLocation.lng, dropoffCoords.lat, dropoffCoords.lng) : 999;
        const minDist = Math.min(distPickup, distDropoff);

        // Strict 2.0 km radius threshold
        if (minDist > 2.0) {
          return false;
        }
      } else {
        // Fallback if ride has no recognizable coordinates: match organization domain
        const userDomainClean = (user?.domain || '').replace(/^@/, '').toLowerCase();
        const hostDomainClean = (ride.host?.domain || '').replace(/^@/, '').toLowerCase();
        if (userDomainClean && hostDomainClean && userDomainClean !== hostDomainClean) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Animated City Street Background Banner */}
      <CityStreetAnimation />

      {/* Main Board Control Toolbar */}
      <div className="aesthetic-card rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        
        {/* Top Header & Active Count Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2" tabIndex="-1">
              <span>BBD Student Ride Board</span>
              <span className="text-amber-500 animate-pulse">⚡</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Find co-riders for auto-rickshaws & cabs to split fares to/from campus
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-extrabold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{filteredRides.length} {t('activeRidesCount')}</span>
            </div>

            <Link
              to="/create"
              aria-label="Post a new ride"
              className="min-h-[44px] px-4 py-2 text-xs font-black rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md hover:brightness-105 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Ride Slot</span>
            </Link>
          </div>
        </div>

        {/* ── 2 KM Radius Filter Status & Location Anchor Bar ────────────────── */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Location Anchor:
              </span>
              <span className="text-slate-600 dark:text-slate-300 ml-1 font-semibold">
                {effectiveLocation.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* GPS Detect Button */}
            <button
              type="button"
              onClick={detectLiveLocation}
              disabled={locatingGps}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold hover:border-amber-500 flex items-center gap-1 transition-all"
              title="Use your phone/laptop GPS coordinates"
            >
              <Navigation className={`w-3 h-3 text-amber-500 ${locatingGps ? 'animate-spin' : ''}`} />
              <span>{effectiveLocation.isGps ? 'GPS Active' : 'Use Live GPS'}</span>
            </button>

            {/* 2 KM Toggle Button */}
            <button
              type="button"
              onClick={() => setRadiusFilterActive(!radiusFilterActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                radiusFilterActive
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{radiusFilterActive ? 'Within 2 km Radius' : 'All City Routes'}</span>
            </button>
          </div>
        </div>

        {/* Direction Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div
            role="tablist"
            aria-label="Filter rides by route direction"
            className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 max-w-full overflow-x-auto gap-1"
          >
            <button
              role="tab"
              aria-selected={directionFilter === 'all'}
              onClick={() => setDirectionFilter('all')}
              className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-black transition-all ${
                directionFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Routes 🛺
            </button>
            <button
              role="tab"
              aria-selected={directionFilter === 'toCampus'}
              onClick={() => setDirectionFilter('toCampus')}
              className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-black transition-all ${
                directionFilter === 'toCampus'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('toCampus')}
            </button>
            <button
              role="tab"
              aria-selected={directionFilter === 'fromCampus'}
              onClick={() => setDirectionFilter('fromCampus')}
              className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-black transition-all ${
                directionFilter === 'fromCampus'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('fromCampus')}
            </button>
          </div>

          {/* Reset Filters Shortcut */}
          {isFiltered && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <label htmlFor="ride-board-search" className="sr-only">
            Search pickup or destination hub
          </label>
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400 pointer-events-none" />
          <input
            id="ride-board-search"
            type="text"
            placeholder="Search by pickup, destination, organization, or host name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-11 pr-10 py-3 text-xs font-bold rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-400"
            aria-label="Search pickup or destination hub"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Ride Cards Grid & Contextual Empty States */}
      {filteredRides.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-gray-800 shadow-xl my-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 text-3xl flex items-center justify-center mx-auto mb-3">
            📍
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white">
            {radiusFilterActive ? 'No ride slots within 2 km of your location' : 'No ride slots found'}
          </h3>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {radiusFilterActive
              ? `We are filtering slots within 2 km of ${effectiveLocation.label}. Try creating a slot or switch to "All City Routes".`
              : 'No active rides match this filter right now. Be the first to publish a slot!'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            {radiusFilterActive && (
              <button
                type="button"
                onClick={() => setRadiusFilterActive(false)}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-300 dark:border-gray-700"
              >
                <span>View All City Routes</span>
              </button>
            )}
            <Link
              to="/create"
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Ride Slot Here</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRides.map((ride) => (
            <RideCard key={ride.id} ride={ride} onUpdate={refreshRides} />
          ))}
        </div>
      )}

    </div>
  );
};
