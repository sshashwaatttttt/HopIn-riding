import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { saveRide } from '../utils/store';
import { POPULAR_HUBS } from '../utils/seedData';
import { fetchAddressFromCoords, resolveLocationCoords, detectLiveCoordinates } from '../utils/fareEngine';
import { LocationSearchInput } from '../components/LocationSearchInput';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle2,
  Navigation,
  RefreshCw,
  MapPin
} from 'lucide-react';

/**
 * Parses user-typed time string:
 * - "5:30 PM", "5:30pm", "08:15 AM", "5 pm"
 * - "17:30", "09:00"
 * - "15", "15m", "15 mins", "in 20 mins"
 */
const parseTimeString = (inputStr) => {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const str = inputStr.trim().toLowerCase();

  // 1. Relative minutes: "15", "15m", "15 mins", "in 20 mins"
  const relMatch = str.match(/^(?:in|\+)?\s*(\d+)\s*(?:m|min|mins|minutes)?$/);
  if (relMatch) {
    const mins = parseInt(relMatch[1], 10);
    if (mins >= 1 && mins <= 1440) {
      return new Date(Date.now() + mins * 60000);
    }
  }

  // 2. 12-hour AM/PM: "5:30 pm", "5pm", "11:15am"
  const ampmMatch = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPm = ampmMatch[3] === 'pm';

    if (hours >= 1 && hours <= 12 && minutes >= 0 && minutes < 60) {
      if (hours === 12) hours = isPm ? 12 : 0;
      else if (isPm) hours += 12;

      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      if (d.getTime() < Date.now() - 10 * 60000) {
        d.setDate(d.getDate() + 1);
      }
      return d;
    }
  }

  // 3. 24-hour time: "17:30", "08:45"
  const militaryMatch = str.match(/^(\d{1,2}):(\d{2})$/);
  if (militaryMatch) {
    const hours = parseInt(militaryMatch[1], 10);
    const minutes = parseInt(militaryMatch[2], 10);
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      if (d.getTime() < Date.now() - 10 * 60000) {
        d.setDate(d.getDate() + 1);
      }
      return d;
    }
  }

  return null;
};

export const CreateRide = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form State
  const [direction, setDirection] = useState('toCampus'); // 'toCampus' or 'fromCampus'
  const [pickup, setPickup] = useState('Charbagh Railway Station');
  const [dropoff, setDropoff] = useState('BBDU Main Gate');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [locatingLive, setLocatingLive] = useState(false);

  // Manual Departure Time Input State
  const [departureTimeInput, setDepartureTimeInput] = useState('In 15 mins');
  const [capacity, setCapacity] = useState(3);
  const [womenOnly, setWomenOnly] = useState(user?.gender === 'female');
  const [formError, setFormError] = useState('');

  // Resolved parsed departure date
  const parsedDate = parseTimeString(departureTimeInput);

  // Formatted display
  const getParsedTimeDisplay = () => {
    if (!parsedDate) return null;
    const isToday = parsedDate.getDate() === new Date().getDate();
    const timeStr = parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const diffMins = Math.round((parsedDate.getTime() - Date.now()) / 60000);
    
    if (diffMins > 0 && diffMins <= 120) {
      return `${timeStr} (in ~${diffMins} mins)`;
    }
    return `${isToday ? 'Today' : 'Tomorrow'} at ${timeStr}`;
  };

  // Direction Switch
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

  // 1-Tap "Set Live Location" handler with multi-layer fallback (GPS -> Network -> Campus Hub)
  const handleSetLiveLocation = async () => {
    setLocatingLive(true);
    setFormError('');

    try {
      const coords = await detectLiveCoordinates();
      if (coords && coords.lat && coords.lng) {
        setPickupCoords({ lat: coords.lat, lng: coords.lng });

        const resolvedAddress = await fetchAddressFromCoords(coords.lat, coords.lng);
        if (resolvedAddress) {
          setPickup(resolvedAddress);
        } else {
          setPickup(`Live Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        }
      } else {
        setPickup('BBDU Main Gate, Lucknow');
      }
    } catch (err) {
      console.warn('Location detection fallback:', err);
      setPickup('BBDU Main Gate, Lucknow');
    } finally {
      setLocatingLive(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickup.trim() || !dropoff.trim()) {
      setFormError('Please enter both pickup and drop-off locations.');
      return;
    }

    const depDate = parseTimeString(departureTimeInput) || new Date(Date.now() + 15 * 60000);

    setFormError('');

    // Resolve coordinates for proximity filtering
    const resolvedPickup = pickupCoords || resolveLocationCoords(pickup);
    const resolvedDropoff = resolveLocationCoords(dropoff);

    const newRide = {
      id: `ride-${Date.now()}`,
      host: {
        id: user.id,
        name: user.name,
        email: user.email,
        domain: user.domain,
        organization: user.organization || (isHcl ? 'HCL Technologies' : 'Verified Campus'),
        avatar: user.avatar,
        rating: user.rating || 5.0,
        gender: user.gender || 'female'
      },
      direction,
      pickup: pickup.trim(),
      dropoff: dropoff.trim(),
      pickupCoords: resolvedPickup ? { lat: resolvedPickup.lat, lng: resolvedPickup.lng } : null,
      dropoffCoords: resolvedDropoff ? { lat: resolvedDropoff.lat, lng: resolvedDropoff.lng } : null,
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
    navigate(`/ride/${newRide.id}?created=true`);
  };

  const coRidersNeeded = Math.max(1, parseInt(capacity, 10) - 1);

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-5 pb-16">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Back to Live Ride Board"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Board</span>
      </button>

      {/* Main Card */}
      <div className="rounded-2xl aesthetic-card p-4 sm:p-6 md:p-7 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] space-y-5 sm:space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3.5 sm:pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Create a Ride Slot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Coordinate shared auto-rickshaws and cabs with fellow verified students.
          </p>
        </div>

        {formError && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          
          {/* Step 1: Direction Selector */}
          <div className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              1. Direction
            </span>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => handleDirectionChange('toCampus')}
                className={`min-h-[64px] sm:min-h-[72px] p-3 sm:p-3.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                  direction === 'toCampus'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm sm:text-base font-bold block leading-tight">To Campus</span>
                <span className={`text-[10px] sm:text-[11px] mt-0.5 leading-tight ${direction === 'toCampus' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}>
                  City Hub ➔ BBD Univ
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDirectionChange('fromCampus')}
                className={`min-h-[64px] sm:min-h-[72px] p-3 sm:p-3.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
                  direction === 'fromCampus'
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm sm:text-base font-bold block leading-tight">From Campus</span>
                <span className={`text-[10px] sm:text-[11px] mt-0.5 leading-tight ${direction === 'fromCampus' ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500'}`}>
                  BBD Campus ➔ Metro / Home
                </span>
              </button>
            </div>
          </div>

          {/* Step 2: Route Locations with 1-Tap "Set Live Location" */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                2. Route Locations
              </span>
              {/* 1-Tap GPS Button */}
              <button
                type="button"
                onClick={handleSetLiveLocation}
                disabled={locatingLive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-extrabold transition-all active:scale-95 disabled:opacity-50"
                title="Use current GPS live location for pickup"
              >
                {locatingLive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Locating GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Set Live Location</span>
                  </>
                )}
              </button>
            </div>

            {/* Pickup */}
            <LocationSearchInput
              id="ride-pickup-input"
              label="Pickup Location"
              value={pickup}
              onChange={(val) => {
                setPickup(val);
                setPickupCoords(null);
                if (formError) setFormError('');
              }}
              placeholder="Enter pickup place or tap Set Live Location..."
              required
            />

            {/* Dropoff */}
            <LocationSearchInput
              id="ride-dropoff-input"
              label="Drop-off Destination"
              value={dropoff}
              onChange={(val) => {
                setDropoff(val);
                if (formError) setFormError('');
              }}
              placeholder="Enter destination or workplace gate..."
              required
            />

            {/* Quick Presets for Popular Hubs */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                {direction === 'toCampus' ? 'Popular pickup spots:' : 'Popular destinations:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_HUBS.map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => {
                      if (direction === 'toCampus') setPickup(hub);
                      else setDropoff(hub);
                      if (formError) setFormError('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                      hub.includes('HCL')
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Departure Time */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label htmlFor="ride-departure-input" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3. Departure Time
              </label>
              <span className="text-[10px] text-slate-400">e.g. 5:30 PM, 17:30, or in 20m</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <input
                id="ride-departure-input"
                type="text"
                value={departureTimeInput}
                onChange={(e) => setDepartureTimeInput(e.target.value)}
                placeholder="Type any time e.g. 5:30 PM, 17:30, in 25 mins..."
                className="w-full min-h-[44px] pl-10 pr-4 py-2 text-sm font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-slate-500 transition-colors"
                required
              />
            </div>

            {/* Live Parsing Status */}
            {parsedDate ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Leaving {getParsedTimeDisplay()}</span>
              </div>
            ) : departureTimeInput.trim() ? (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Please type a time like "5:30 PM", "17:30", or "20 mins"
              </p>
            ) : null}

            {/* Quick 1-tap presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-400 mr-1">Quick fill:</span>
              {[
                { label: '+10 mins', text: 'In 10 mins' },
                { label: '+15 mins', text: 'In 15 mins' },
                { label: '+30 mins', text: 'In 30 mins' },
                { label: '+1 hour', text: 'In 1 hour' },
                { label: '5:00 PM', text: '5:00 PM' },
                { label: '6:30 PM', text: '6:30 PM' }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDepartureTimeInput(preset.text)}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                    departureTimeInput === preset.text
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Step 4: Seat Capacity */}
            <div className="pt-2">
              <label htmlFor="ride-capacity-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                4. Co-Riders Needed (Capacity)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <select
                  id="ride-capacity-select"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="2">Looking for 1 Co-Rider (2 seats total • Bike / Cab)</option>
                  <option value="3">Looking for 2 Co-Riders (Standard Auto • 3 seats total)</option>
                  <option value="4">Looking for 3 Co-Riders (Shared Cab • 4 seats total)</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                You + <strong>{coRidersNeeded} open co-rider slot{coRidersNeeded > 1 ? 's' : ''}</strong>
              </p>
            </div>
          </div>

          {/* Ride Slot Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 space-y-1 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Ride Slot Summary</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400 block">Route:</span>
                <span className="font-semibold truncate block">{pickup || '...'} ➔ {dropoff || '...'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Departure:</span>
                <span className="font-semibold block">{getParsedTimeDisplay() || departureTimeInput}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Open Seats:</span>
                <span className="font-semibold block">{coRidersNeeded} seat{coRidersNeeded > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Solid Submit Button */}
          <button
            type="submit"
            className="w-full min-h-[48px] py-3 px-5 text-sm font-bold rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>Publish Ride Slot</span>
          </button>

        </form>

      </div>
    </div>
  );
};
