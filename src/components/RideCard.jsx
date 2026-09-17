import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { requestJoinRide, leaveRideSlot, cancelJoinRequest } from '../utils/store';
import { Star, Clock, Users, ArrowRight, ShieldAlert, Sparkles, CheckCircle2, LogOut } from 'lucide-react';

export const RideCard = ({ ride, onUpdate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const dep = new Date(ride.departureTime).getTime();
      const now = Date.now();
      const diffMins = Math.round((dep - now) / 60000);

      if (diffMins <= 0) {
        setTimeLeft('Leaving now 🛺');
      } else {
        setTimeLeft(`in ${diffMins} min`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000);
    return () => clearInterval(interval);
  }, [ride.departureTime]);

  const isMember = (ride?.members || []).some(m => m?.id === user?.id);
  const isHost = (ride?.host?.id || ride?.host) === user?.id;
  const isPending = (ride?.pendingRequests || []).some(p => p?.id === user?.id);
  const seatsRemaining = (ride?.capacity || 4) - (ride?.members || []).length;
  const isFull = seatsRemaining <= 0;

  const handleJoin = (e) => {
    e.preventDefault();
    if (!user) return;
    if (isMember) {
      navigate(`/chat/${ride.id}`);
      return;
    }

    const updated = requestJoinRide(ride.id, user);
    setRequested(true);
    if (onUpdate) onUpdate(updated);
    navigate(`/ride/${ride.id}?booked=true`);
  };

  const handleLeaveSlot = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const confirmMsg = t('leaveSlotConfirm') || "Are you sure you want to leave this ride slot? Your reserved seat will be released for other students.";
    if (window.confirm(confirmMsg)) {
      const updated = leaveRideSlot(ride.id, user.id);
      if (onUpdate) onUpdate(updated);
    }
  };

  const handleCancelRequest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    const confirmMsg = t('cancelRequestConfirm') || "Cancel your join request?";
    if (window.confirm(confirmMsg)) {
      const updated = cancelJoinRequest(ride.id, user.id);
      setRequested(false);
      if (onUpdate) onUpdate(updated);
    }
  };

  return (
    <div className="relative group aesthetic-card rounded-3xl p-5 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      
      {/* Accent Header Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>

      <div>
        {/* Top Meta: Host & Badges */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div className="flex items-center gap-3">
            <img
              src={ride?.host?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${ride?.id || 'host'}`}
              alt={ride?.host?.name || 'Host'}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-500 shadow-sm bg-slate-100 dark:bg-slate-800"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                  {ride?.host?.name || 'Student Host'}
                </span>
                {isHost && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 uppercase">
                    HOST
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                  {ride?.host?.rating || 5.0}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  • {ride?.host?.domain || 'BBD Student'}
                </span>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{timeLeft}</span>
            </span>
          </div>
        </div>

        {/* Route Details */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
            <span>{ride.direction === 'toCampus' ? t('toCampus') : t('fromCampus')}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">From</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
                {ride.pickup}
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-amber-500 shrink-0 mx-1" />

            <div className="flex-1 min-w-0 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">To</span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate block">
                {ride.dropoff}
              </span>
            </div>
          </div>
        </div>

        {/* Squad Capacity Bar & Member Avatars */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              {ride.members.length}/{ride.capacity} {t('seatsAvailable')}
            </span>
          </div>

          <div className="flex -space-x-2 overflow-hidden">
            {ride.members.map((m) => (
              <img
                key={m.id}
                src={m.avatar}
                alt={m.name}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-[#0b0f19] object-cover"
                title={`${m.name} (${m.rating} ⭐)`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        {isMember ? (
          isHost ? (
            <Link
              to={`/ride/${ride.id}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Manage Slot & Details 👑</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={`/ride/${ride.id}`}
                className="flex-1 py-3.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>View Slot 📋</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleLeaveSlot}
                className="py-3.5 px-3.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                title="Leave this ride slot if there is any misconception"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave</span>
              </button>
            </div>
          )
        ) : isPending || requested ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 py-3 px-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-extrabold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 animate-spin shrink-0 text-amber-500" />
              <span className="truncate">Pending Approval ⏳</span>
            </div>
            <button
              type="button"
              onClick={handleCancelRequest}
              className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-red-500/20 dark:bg-slate-800 dark:hover:bg-red-500/20 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 font-bold text-xs uppercase transition-all shrink-0"
              title="Cancel join request"
            >
              <span>Cancel ✕</span>
            </button>
          </div>
        ) : isFull ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
          >
            Squad Full 🚫
          </button>
        ) : (
          <button
            onClick={handleJoin}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-105 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-98"
          >
            <span>{t('enrollSquad')}</span>
          </button>
        )}
      </div>

    </div>
  );
};
