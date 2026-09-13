import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getRides, subscribeToSync, getBlockedUserIds } from '../utils/store';
import { CityStreetAnimation } from '../components/CityStreetAnimation';
import { RideCard } from '../components/RideCard';
import { 
  Search, 
  Filter, 
  Sparkles, 
  Plus, 
  PlusCircle,
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowRight,
  ShieldCheck,
  X,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LiveRideBoard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [rides, setRides] = useState([]);
  const [directionFilter, setDirectionFilter] = useState('all'); // 'all', 'toCampus', 'fromCampus'
  const [searchQuery, setSearchQuery] = useState('');
  const [womenOnlyFilter, setWomenOnlyFilter] = useState(false);

  const refreshRides = () => {
    const data = getRides();
    const blocked = getBlockedUserIds() || [];
    // Filter out rides from blocked users safely
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

  const resetAllFilters = () => {
    setSearchQuery('');
    setDirectionFilter('all');
    setWomenOnlyFilter(false);
  };

  const isFiltered = searchQuery.trim() !== '' || directionFilter !== 'all' || womenOnlyFilter;

  // Filter rides based on criteria
  const filteredRides = rides.filter(ride => {
    // Direction
    if (directionFilter !== 'all' && ride.direction !== directionFilter) return false;
    
    // Search query on pickup/dropoff or host name
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPickup = ride.pickup?.toLowerCase().includes(q);
      const matchDrop = ride.dropoff?.toLowerCase().includes(q);
      const matchHost = ride.host?.name?.toLowerCase().includes(q);
      if (!matchPickup && !matchDrop && !matchHost) return false;
    }

    // Women Only filter
    if (womenOnlyFilter && !ride.womenOnly) return false;

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Animated City Street Background Banner */}
      <CityStreetAnimation />

      {/* Main Board Control Toolbar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-6 border border-gray-200 dark:border-gray-800 shadow-xl space-y-4">
        
        {/* Top Header & Active Count Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2" tabIndex="-1">
              <span>BBD Student Ride Board</span>
              <span className="text-amber-500 animate-pulse">⚡</span>
            </h1>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
              Find co-riders for auto-rickshaws & cabs to split fare to/from campus
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-extrabold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{filteredRides.length} {t('activeRidesCount')}</span>
            </div>

            <Link
              to="/create"
              aria-label="Post a new ride"
              className="min-h-[44px] px-4 py-2 text-xs font-black rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-md hover:brightness-110 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('createRide')}</span>
            </Link>
          </div>
        </div>

        {/* Direction Switcher Tabs with Accessible Semantics */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          <div
            role="tablist"
            aria-label="Filter rides by route direction"
            className="flex bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700/60 max-w-full overflow-x-auto gap-1"
          >
            <button
              role="tab"
              aria-selected={directionFilter === 'all'}
              onClick={() => setDirectionFilter('all')}
              className={`min-h-[38px] px-4 py-2 rounded-xl text-xs font-black transition-all ${
                directionFilter === 'all'
                  ? 'bg-amber-500 text-gray-950 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
                  ? 'bg-amber-500 text-gray-950 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
                  ? 'bg-amber-500 text-gray-950 shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('fromCampus')}
            </button>
          </div>

          {/* Reset Filters Shortcut (Visible when filters are active) */}
          {isFiltered && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-amber-500/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search Bar Input with Associated Label and Clear Action */}
        <div className="relative">
          <label htmlFor="ride-board-search" className="sr-only">
            Search pickup or destination hub
          </label>
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
          <input
            id="ride-board-search"
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-11 pr-10 py-3 text-xs font-bold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            aria-label="Search pickup or destination hub"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
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
          {isFiltered ? (
            /* Contextual Empty State: Search or Filter resulted in 0 matches */
            <div>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 text-3xl flex items-center justify-center mx-auto mb-3">
                🔍
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                No rides found matching your filters
              </h3>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `No active rides currently match "${searchQuery}". Clear your search query to browse all available campus rides.`
                  : 'No active rides match this route direction right now.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-black text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-300 dark:border-gray-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear Search & Reset Filters</span>
                </button>
                <Link
                  to="/create"
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a Ride on this Route</span>
                </Link>
              </div>
            </div>
          ) : (
            /* General Empty State: No active rides at all */
            <div>
              <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-500 text-4xl flex items-center justify-center mx-auto mb-4 animate-bounce">
                🛺
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white">
                {t('noRides')}
              </h3>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                {t('noRidesDesc')}
              </p>
              <Link
                to="/create"
                className="min-h-[44px] inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-2xl bg-amber-500 text-gray-950 font-black text-xs uppercase tracking-wider shadow-lg hover:bg-amber-400 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('createRide')}</span>
              </Link>
            </div>
          )}
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
