import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { saveRide } from '../utils/store';
import { BBD_HUBS } from '../utils/seedData';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Navigation
} from 'lucide-react';

export const CreateRide = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form State
  const [direction, setDirection] = useState('toCampus'); // 'toCampus' or 'fromCampus'
  const [pickup, setPickup] = useState('Charbagh Railway Station');
  const [dropoff, setDropoff] = useState('BBDU Main Gate');
  const [minsUntilDeparture, setMinsUntilDeparture] = useState('15');
  const [capacity, setCapacity] = useState(3);
  const [womenOnly, setWomenOnly] = useState(user?.gender === 'female');

  const [formError, setFormError] = useState('');

  // Clock time helper for departure preview
  const getClockTime = (mins) => {
    const d = new Date(Date.now() + parseInt(mins, 10) * 60000);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle Hub Chip Selection
  const handleDirectionChange = (newDir) => {
    setDirection(newDir);
    if (newDir === 'toCampus') {
      setDropoff('BBDU Main Gate');
      if (pickup === 'BBDU Main Gate') setPickup('Charbagh Railway Station');
    } else {
      setPickup('BBDU Main Gate');
      if (dropoff === 'BBDU Main Gate') setDropoff('Kamta Chauraha Junction');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      setFormError('Please enter both pickup and drop-off locations.');
      return;
    }

    setFormError('');
    const depDate = new Date(Date.now() + parseInt(minsUntilDeparture, 10) * 60000);

    const newRide = {
      id: `ride-bbd-${Date.now()}`,
      host: {
        id: user.id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        avatar: user.avatar,
        rating: user.rating || 5.0,
        gender: user.gender || 'female'
      },
      direction,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      departureTime: depDate.toISOString(),
      capacity: parseInt(capacity, 10),
      members: [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          rating: user.rating || 5.0,
          isHost: true
        }
      ],
      pendingRequests: [],
      womenOnly: Boolean(womenOnly),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    saveRide(newRide);
    navigate(`/ride/${newRide.id}`);
  };

  const coRidersNeeded = Math.max(1, parseInt(capacity, 10) - 1);

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 pb-12">
      
      {/* Back Button (Min 44px touch target) */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs font-black text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Back to Live Ride Board"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Ride Board</span>
      </button>

      {/* Main Builder Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Ride Coordination Wizard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight" tabIndex="-1">
            {t('createRide')}
          </h1>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
            {t('createRideDesc')}
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
          
          {/* Step 1: Direction Selector with Radio Semantics */}
          <div className="space-y-2">
            <span id="direction-group-label" className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Step 1: Choose Direction
            </span>
            <div
              role="radiogroup"
              aria-labelledby="direction-group-label"
              className="grid grid-cols-2 gap-3"
            >
              <button
                type="button"
                role="radio"
                aria-checked={direction === 'toCampus'}
                onClick={() => handleDirectionChange('toCampus')}
                className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  direction === 'toCampus'
                    ? 'bg-amber-500/10 border-amber-500 text-gray-900 dark:text-white ring-2 ring-amber-500/50'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400/50'
                }`}
              >
                <span className="text-xl mb-1">🏫</span>
                <span className="text-sm font-extrabold block">{t('toCampus')}</span>
                <span className="text-[11px] font-semibold opacity-75">City Hub ➔ BBD University</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={direction === 'fromCampus'}
                onClick={() => handleDirectionChange('fromCampus')}
                className={`min-h-[72px] p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  direction === 'fromCampus'
                    ? 'bg-amber-500/10 border-amber-500 text-gray-900 dark:text-white ring-2 ring-amber-500/50'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-400/50'
                }`}
              >
                <span className="text-xl mb-1">🏠</span>
                <span className="text-sm font-extrabold block">{t('fromCampus')}</span>
                <span className="text-[11px] font-semibold opacity-75">BBD Campus ➔ Metro / Home</span>
              </button>
            </div>
          </div>

          {/* Step 2: Pickup & Dropoff Hubs with Explicit Labels */}
          <div className="space-y-4">
            <span className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Step 2: Pickup & Drop-off Locations
            </span>

            <div>
              <label htmlFor="ride-pickup-input" className="text-xs font-extrabold text-gray-700 dark:text-gray-300 block mb-1.5">
                Pickup Point 📍
              </label>
              <input
                id="ride-pickup-input"
                type="text"
                value={pickup}
                onChange={(e) => {
                  setPickup(e.target.value);
                  if (formError) setFormError('');
                }}
                className="w-full min-h-[44px] px-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter pickup point (e.g., Charbagh, Kamta, BBD Gate)"
                required
              />
            </div>

            <div>
              <label htmlFor="ride-dropoff-input" className="text-xs font-extrabold text-gray-700 dark:text-gray-300 block mb-1.5">
                Drop-off Location 🏁
              </label>
              <input
                id="ride-dropoff-input"
                type="text"
                value={dropoff}
                onChange={(e) => {
                  setDropoff(e.target.value);
                  if (formError) setFormError('');
                }}
                className="w-full min-h-[44px] px-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter destination location"
                required
              />
            </div>

            {/* Dynamic Location Shortcuts */}
            <div>
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-2">
                {direction === 'toCampus'
                  ? 'Popular pickup points (sets Pickup):'
                  : 'Popular destinations (sets Drop-off):'}
              </span>
              <div className="flex flex-wrap gap-2">
                {BBD_HUBS.map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => {
                      if (direction === 'toCampus') setPickup(hub);
                      else setDropoff(hub);
                      if (formError) setFormError('');
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 border border-gray-200 dark:border-gray-700 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span>+</span>
                    <span>{hub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Departure Time & Co-Rider Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ride-departure-select" className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Step 3: Departure Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500 pointer-events-none" />
                <select
                  id="ride-departure-select"
                  value={minsUntilDeparture}
                  onChange={(e) => setMinsUntilDeparture(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="10">In 10 mins (approx. {getClockTime(10)})</option>
                  <option value="15">In 15 mins (approx. {getClockTime(15)})</option>
                  <option value="25">In 25 mins (approx. {getClockTime(25)})</option>
                  <option value="40">In 40 mins (approx. {getClockTime(40)})</option>
                  <option value="60">In 1 hour (approx. {getClockTime(60)})</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                Scheduled for <strong>~{getClockTime(minsUntilDeparture)}</strong> ({minsUntilDeparture}m from now)
              </p>
            </div>

            <div>
              <label htmlFor="ride-capacity-select" className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Additional Co-Riders Needed
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500 pointer-events-none" />
                <select
                  id="ride-capacity-select"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="2">Looking for 1 Co-Rider (2 seats total)</option>
                  <option value="3">Looking for 2 Co-Riders (Standard Auto • 3 seats total)</option>
                  <option value="4">Looking for 3 Co-Riders (Shared Cab • 4 seats total)</option>
                  <option value="5">Looking for 4 Co-Riders (Campus E-Rickshaw • 5 seats total)</option>
                </select>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 font-medium">
                You + <strong>{coRidersNeeded} open co-rider slot{coRidersNeeded > 1 ? 's' : ''}</strong>
              </p>
            </div>
          </div>

          {/* Pre-Publish Compact Summary Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-gray-900 dark:text-gray-100 space-y-1.5 text-xs">
            <div className="font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pre-Publish Summary</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium text-[11px]">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Route:</span>
                <span className="font-bold">{pickup || '...'} ➔ {dropoff || '...'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Departure:</span>
                <span className="font-bold">~{getClockTime(minsUntilDeparture)} ({minsUntilDeparture}m)</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block">Squad Slots:</span>
                <span className="font-bold">{coRidersNeeded} co-rider{coRidersNeeded > 1 ? 's' : ''} needed</span>
              </div>
            </div>
          </div>

          {/* Submit Button (44px min height) */}
          <button
            type="submit"
            className="w-full min-h-[48px] py-3.5 px-6 text-xs font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-xl shadow-amber-500/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Publish Ride Slot & Open Chat 🚀</span>
          </button>

        </form>

      </div>
    </div>
  );
};
