import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRides, respondJoinRequest, subscribeToSync } from '../utils/store';
import { Bell, Check, ArrowRight, X } from 'lucide-react';

const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio autoplay might be blocked before first interaction
  }
};

export const JoinRequestNotification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeNotification, setActiveNotification] = useState(null);
  const dismissedKeysRef = useRef(new Set());

  const checkForRequests = () => {
    if (!user) return;
    const allRides = getRides();

    // Match host by ID OR verified College Email
    const myHostedRides = allRides.filter(r => {
      const hostId = r.host?.id;
      const hostEmail = r.host?.email?.toLowerCase();
      const currentEmail = user.email?.toLowerCase();
      return (hostId && hostId === user.id) || (hostEmail && currentEmail && hostEmail === currentEmail);
    });

    for (const ride of myHostedRides) {
      const pending = ride.pendingRequests || [];
      for (const req of pending) {
        const key = `${ride.id}_${req.id}`;
        if (!dismissedKeysRef.current.has(key)) {
          playChime();
          setActiveNotification({
            key,
            rideId: ride.id,
            pickup: ride.pickup,
            dropoff: ride.dropoff,
            requester: req
          });
          return; // Show one active alert at a time
        }
      }
    }
  };

  useEffect(() => {
    checkForRequests();
    const unsubscribe = subscribeToSync(() => {
      checkForRequests();
    });
    return () => unsubscribe();
  }, [user]);

  if (!activeNotification) return null;

  const { key, rideId, pickup, dropoff, requester } = activeNotification;

  const handleQuickAccept = () => {
    dismissedKeysRef.current.add(key);
    respondJoinRequest(rideId, requester.id, true);
    setActiveNotification(null);
  };

  const handleDismiss = () => {
    dismissedKeysRef.current.add(key);
    setActiveNotification(null);
  };

  const handleView = () => {
    dismissedKeysRef.current.add(key);
    navigate(`/ride/${rideId}`);
    setActiveNotification(null);
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-gray-900/95 backdrop-blur-xl border-2 border-amber-500 rounded-3xl p-4 shadow-2xl text-white space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center animate-bounce">
              <Bell className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              New Join Request!
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex items-center gap-3 bg-gray-800/80 p-2.5 rounded-2xl border border-gray-700">
          <img
            src={requester.avatar}
            alt={requester.name}
            className="w-10 h-10 rounded-xl object-cover border border-amber-500"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black truncate">{requester.name}</h4>
            <p className="text-[11px] text-gray-400 truncate">
              {pickup} ➔ {dropoff}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleQuickAccept}
            className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept</span>
          </button>
          <button
            onClick={handleView}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <span>Review</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
