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
    if (!pickup || !dropoff) return;

    const depDate = new Date(Date.now() + parseInt(minsUntilDeparture) * 60000);

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
      capacity: parseInt(capacity),
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

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 pb-12">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
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
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {t('createRide')}
          </h1>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
            {t('createRideDesc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Direction Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Step 1: Choose Direction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDirectionChange('toCampus')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  direction === 'toCampus'
                    ? 'bg-amber-500/10 border-amber-500 text-gray-900 dark:text-white ring-2 ring-amber-500/50'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-xl mb-2">🏫</span>
                <span className="text-sm font-extrabold block">{t('toCampus')}</span>
                <span className="text-[10px] font-semibold opacity-70">Hub ➔ BBD University</span>
              </button>

              <button
                type="button"
                onClick={() => handleDirectionChange('fromCampus')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  direction === 'fromCampus'
                    ? 'bg-amber-500/10 border-amber-500 text-gray-900 dark:text-white ring-2 ring-amber-500/50'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                <span className="text-xl mb-2">🏠</span>
                <span className="text-sm font-extrabold block">{t('fromCampus')}</span>
                <span className="text-[10px] font-semibold opacity-70">BBD ➔ Metro / Station</span>
              </button>
            </div>
          </div>

          {/* Step 2: Pickup & Dropoff Hubs */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Step 2: Pickup & Drop-off Locations
            </label>

            <div>
              <span className="text-xs font-extrabold text-gray-600 dark:text-gray-400 block mb-1.5">
                Pickup Point 📍
              </span>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full px-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <span className="text-xs font-extrabold text-gray-600 dark:text-gray-400 block mb-1.5">
                Drop-off Location 🏁
              </span>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full px-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Quick Select Hub Chips */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 block mb-2">
                Quick Select BBD Lucknow Hubs:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {BBD_HUBS.map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => {
                      if (direction === 'toCampus') setPickup(hub);
                      else setDropoff(hub);
                    }}
                    className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[11px] font-bold hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 border border-gray-200 dark:border-gray-700 transition-all"
                  >
                    + {hub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Departure & Seat Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Step 3: Departure Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500" />
                <select
                  value={minsUntilDeparture}
                  onChange={(e) => setMinsUntilDeparture(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="10">Leaving in 10 minutes</option>
                  <option value="15">Leaving in 15 minutes</option>
                  <option value="25">Leaving in 25 minutes</option>
                  <option value="40">Leaving in 40 minutes</option>
                  <option value="60">Leaving in 1 hour</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Seat Capacity
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-amber-500" />
                <select
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs font-extrabold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="1">1 Seat Needed</option>
                  <option value="2">2 Seats Capacity</option>
                  <option value="3">3 Seats Capacity (Standard Auto)</option>
                  <option value="4">4 Seats Capacity (Shared Cab)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 text-xs font-black uppercase tracking-wider rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 shadow-xl shadow-amber-500/30 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <span>Publish Ride Slot & Open Chat 🚀</span>
          </button>

        </form>

      </div>
    </div>
  );
};
