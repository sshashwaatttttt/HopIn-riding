import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  getRideById, 
  respondJoinRequest, 
  subscribeToSync, 
  requestJoinRide,
  leaveRideSlot,
  cancelJoinRequest,
  updateRide,
  deleteRide,
  getChatsForRide,
  addChatMessage,
  editChatMessage,
  deleteChatMessage,
  updateRideStatus,
  getBlockedUserIds,
  unblockUser
} from '../utils/store';
import { SOSModal } from '../components/SOSModal';
import { RatingModal } from '../components/RatingModal';
import { FareComparisonCard } from '../components/FareComparisonCard';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Users, 
  Check, 
  X, 
  MessageSquare, 
  ArrowRight,
  Pencil, 
  Trash2,
  Send,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  FileText,
  SlidersHorizontal,
  Lock,
  UserCheck,
  LogOut
} from 'lucide-react';

export const RideDetail = () => {
  const { rideId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { t, quickReplies } = useLanguage();
  const navigate = useNavigate();

  // Slide switcher state: 'details' (default) or 'chat'
  const initialSlide = searchParams.get('slide') === 'chat' ? 'chat' : 'details';
  const [activeSlide, setActiveSlide] = useState(initialSlide);

  const [ride, setRide] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editPickup, setEditPickup] = useState('');
  const [editDropoff, setEditDropoff] = useState('');
  const [editDepartureTime, setEditDepartureTime] = useState('');
  const [editCapacity, setEditCapacity] = useState(3);
  const [editEstimatedFare, setEditEstimatedFare] = useState(50);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);

  // Modals
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [blockedUserIds, setBlockedUserIds] = useState([]);

  const fetchRideAndChat = () => {
    const data = getRideById(rideId);
    setRide(data);
    setBlockedUserIds(getBlockedUserIds());
    if (data) {
      setEditPickup(data.pickup);
      setEditDropoff(data.dropoff);
      setEditCapacity(data.capacity || 3);
      setEditEstimatedFare(data.estimatedFare || 50);
      try {
        const d = new Date(data.departureTime);
        setEditDepartureTime(d.toTimeString().slice(0, 5));
      } catch {
        setEditDepartureTime('17:00');
      }
    }
    const msgs = getChatsForRide(rideId);
    setMessages(Array.isArray(msgs) ? msgs : []);
  };

  const handleUnblockMember = (memberId) => {
    unblockUser(memberId);
    setBlockedUserIds(getBlockedUserIds());
  };

  useEffect(() => {
    fetchRideAndChat();
    const unsubscribe = subscribeToSync(() => {
      fetchRideAndChat();
    });
    return () => unsubscribe();
  }, [rideId]);

  useEffect(() => {
    if (activeSlide === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSlide]);

  if (!ride) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-black text-gray-900 dark:text-white">Ride slot expired or not found</h3>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 text-xs font-bold bg-amber-500 text-gray-950 rounded-xl">
          Back to Live Board
        </button>
      </div>
    );
  }

  const isHost = Boolean(
    user && (
      (ride.host?.id && ride.host.id === user.id) ||
      (ride.host?.email && user.email && ride.host.email.toLowerCase() === user.email.toLowerCase())
    )
  );
  const isMember = (ride.members || []).some(m => 
    m.id === user?.id || 
    (m.email && user?.email && m.email.toLowerCase() === user.email.toLowerCase())
  ) || isHost;
  const isPending = (ride.pendingRequests || []).some(p => 
    p.id === user?.id || 
    (p.email && user?.email && p.email.toLowerCase() === user.email.toLowerCase())
  );

  const justCreated = searchParams.get('created') === 'true';
  const justBooked = searchParams.get('booked') === 'true';
  const isBookedOrCreated = isHost || isMember || isPending || justCreated || justBooked;

  // ── Host Actions ──
  const handleRespond = (userId, accept) => {
    const updated = respondJoinRequest(ride.id, userId, accept);
    setRide(updated);
  };

  const handleJoinRequest = () => {
    const updated = requestJoinRide(ride.id, user);
    setRide(updated);
    setSearchParams({ booked: 'true' });
  };

  const handleLeaveSlot = () => {
    if (!user) return;
    const confirmMsg = t('leaveSlotConfirm') || "Are you sure you want to leave this ride slot? Your reserved seat will be released for other students.";
    if (window.confirm(confirmMsg)) {
      leaveRideSlot(ride.id, user.id);
      alert(t('leftSlotSuccess') || "You have left the ride slot.");
      navigate('/');
    }
  };

  const handleCancelRequest = () => {
    if (!user) return;
    const confirmMsg = t('cancelRequestConfirm') || "Are you sure you want to cancel your join request?";
    if (window.confirm(confirmMsg)) {
      const updated = cancelJoinRequest(ride.id, user.id);
      setRide(updated);
    }
  };

  const handleDeleteRide = () => {
    if (window.confirm("Are you sure you want to delete this ride slot? This will cancel the ride for all squad members.")) {
      deleteRide(ride.id);
      navigate('/');
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editPickup.trim() || !editDropoff.trim()) {
      alert("Pickup and dropoff locations cannot be empty.");
      return;
    }

    let newDepIso = ride.departureTime;
    if (editDepartureTime) {
      const [h, m] = editDepartureTime.split(':');
      const now = new Date();
      now.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      newDepIso = now.toISOString();
    }

    const updated = updateRide(ride.id, {
      pickup: editPickup.trim(),
      dropoff: editDropoff.trim(),
      capacity: parseInt(editCapacity, 10),
      estimatedFare: parseInt(editEstimatedFare, 10) || 50,
      departureTime: newDepIso
    });

    setRide(updated);
    setIsEditing(false);
  };

  // ── Chat Actions ──
  const sendMessage = (text, isLocation = false) => {
    if (!text || !text.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isLocation
    };

    const updated = addChatMessage(rideId, newMsg);
    if (Array.isArray(updated)) {
      setMessages(updated);
    } else {
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), newMsg]);
    }
    setInputText('');
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your device or browser.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        sendMessage(`📍 My Exact GPS Location (±${accuracy}m): ${mapUrl}`, true);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        let errorMsg = "Could not fetch exact location. ";
        if (err.code === 1) {
          errorMsg += "Location permission was denied. Please allow location access in your browser settings.";
        } else if (err.code === 2) {
          errorMsg += "Position unavailable. Please ensure your device GPS is turned on.";
        } else {
          errorMsg += "Request timed out. Please try again.";
        }
        alert(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    );
  };

  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveMsgEdit = (msgId) => {
    if (!editText.trim()) return;
    const updated = editChatMessage(rideId, msgId, editText.trim());
    if (Array.isArray(updated)) setMessages(updated);
    setEditingMsgId(null);
    setEditText('');
  };

  const handleDeleteMsg = (msgId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      const updated = deleteChatMessage(rideId, msgId);
      if (Array.isArray(updated)) setMessages(updated);
    }
  };

  const handleCompleteRide = () => {
    updateRideStatus(rideId, 'completed');
    setIsRatingOpen(true);
  };

  return (
    <div className="max-w-3xl mx-auto py-3 space-y-4 pb-12">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-black text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Live Board</span>
        </button>

        {isHost && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveSlide('details');
                setIsEditing(!isEditing);
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close Edit' : 'Edit Slot'}</span>
            </button>
            <button
              onClick={handleDeleteRide}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Slot</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Slide Shuffle Switcher (Slot Details ⟷ Live Chat) ── */}
      <div className="bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-300/80 dark:border-slate-700/60 shadow-inner">
        <button
          onClick={() => {
            setActiveSlide('details');
            setSearchParams({});
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            activeSlide === 'details'
              ? 'bg-amber-500 text-slate-950 shadow-sm scale-[1.01]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Slot Details & Management</span>
        </button>

        <button
          onClick={() => {
            if (isMember) {
              setActiveSlide('chat');
              setSearchParams({ slide: 'chat' });
            } else {
              alert("You must request to join and be accepted by the host before entering the Squad Chat.");
            }
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
            activeSlide === 'chat'
              ? 'bg-amber-500 text-slate-950 shadow-sm scale-[1.01]'
              : isMember
                ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
          }`}
        >
          {isMember ? (
            <>
              <MessageSquare className="w-4 h-4" />
              <span>Live Squad Chat</span>
              {messages.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              )}
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Chat (Join Required)</span>
            </>
          )}
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SLIDE 1: SLOT DETAILS & HOST MANAGEMENT                              */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeSlide === 'details' && (
        <div className="aesthetic-card rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 border border-slate-200/80 dark:border-slate-800/80 animate-in fade-in duration-200">
          
          {/* Post-Creation & Post-Booking Notification Banners */}
          {justCreated && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">🎉 Ride Slot Created Successfully!</p>
                <p className="text-xs font-medium mt-0.5 opacity-90 leading-relaxed">
                  Your ride slot is now live. Your route's estimated prices, co-rider split, and 1-tap app booking links (Uber, Ola, Rapido, Google Maps) have been unlocked below!
                </p>
              </div>
            </div>
          )}

          {justBooked && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase tracking-wider">✅ Slot Booking Requested!</p>
                <p className="text-xs font-medium mt-0.5 opacity-90 leading-relaxed">
                  You have booked this ride slot! Your route's dynamic fare split and 1-tap booking URLs (Uber, Ola, Rapido, Google Maps) are unlocked below.
                </p>
              </div>
            </div>
          )}

          {/* Host Action Bar inside Card */}
          {isHost && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">👑</span>
                <div>
                  <span className="text-xs font-black text-amber-600 dark:text-amber-400 block">You are the Host</span>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Manage, modify, or cancel this ride slot below.</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Close Edit' : 'Edit Slot Details'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDeleteRide}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 font-black text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Slot</span>
                </button>
              </div>
            </div>
          )}

          {/* Edit Form Modal/Panel for Host */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
                <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Pencil className="w-4 h-4 text-amber-500" />
                  <span>Edit Your Ride Slot</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={editPickup}
                    onChange={(e) => setEditPickup(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Dropoff Location
                  </label>
                  <input
                    type="text"
                    value={editDropoff}
                    onChange={(e) => setEditDropoff(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Departure Time
                  </label>
                  <input
                    type="time"
                    value={editDepartureTime}
                    onChange={(e) => setEditDepartureTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-700 dark:text-gray-300 uppercase mb-1">
                    Seat Capacity
                  </label>
                  <select
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="1">1 Seat</option>
                    <option value="2">2 Seats</option>
                    <option value="3">3 Seats (Auto)</option>
                    <option value="4">4 Seats (Cab)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-black shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            /* Route Details Banner */
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    {ride.direction === 'toCampus' ? t('toCampus') : t('fromCampus')}
                  </span>
                  {isHost && (
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      👑 You are the Host
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{ride.pickup}</span>
                  <ArrowRight className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{ride.dropoff}</span>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end">
                <span className="text-[10px] uppercase font-bold text-gray-400">Departure</span>
                <span className="text-sm font-extrabold text-amber-500 flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-4 h-4" />
                  {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}

          {/* Live Fare Estimation & App Launcher: Appears after slot booking or creation */}
          {isBookedOrCreated ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Estimated Route Fares & 1-Tap Booking Apps</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Unlocked for Booked Squad
                </span>
              </div>

              <FareComparisonCard
                pickup={ride.pickup}
                dropoff={ride.dropoff}
                capacity={ride.capacity || 3}
                departureTime={ride.departureTime}
                onSelectEstimatedFare={isHost ? (fare) => {
                  updateRide(ride.id, { estimatedFare: fare });
                  fetchRideAndChat();
                } : undefined}
              />
            </div>
          ) : (
            /* Locked Preview: Appears before slot booking */
            <div className="p-5 rounded-2xl aesthetic-card border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3 shadow-sm">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  Estimated Prices & Booking URLs Locked
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  Book or join this ride slot to reveal the exact dynamic fare split and unlock 1-tap booking URLs for Uber, Ola, Rapido, and Google Maps.
                </p>
              </div>
              <button
                type="button"
                onClick={handleJoinRequest}
                disabled={(ride.members || []).length >= ride.capacity}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {(ride.members || []).length >= ride.capacity ? 'Ride Slot Full' : 'Book This Slot to Unlock Fares 🛺'}
              </button>
            </div>
          )}

          {/* Squad Members List */}
          <div>
            <h3 className="text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Confirmed Squad Members ({(ride.members || []).length}/{ride.capacity})</span>
              <span className="text-amber-500">{Math.max(0, ride.capacity - (ride.members || []).length)} spots remaining</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(ride.members || []).map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-2xl object-cover border-2 border-amber-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white block">
                        {member.name}
                      </span>
                      <span className="flex items-center text-[11px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        {member.rating || 5.0} ⭐
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.isHost && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-500 text-gray-950">
                        HOST
                      </span>
                    )}

                    {member && member.id === user?.id && !member.isHost && (
                      <button
                        type="button"
                        onClick={handleLeaveSlot}
                        className="px-2.5 py-1 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500 text-[11px] font-black flex items-center gap-1 transition-all shadow-sm active:scale-95"
                        title="Leave this slot if there is any misconception"
                      >
                        <LogOut className="w-3 h-3" />
                        <span>Leave Slot</span>
                      </button>
                    )}

                    {member && member.id !== user?.id && (blockedUserIds || []).includes(member.id) && (
                      <button
                        type="button"
                        onClick={() => handleUnblockMember(member.id)}
                        className="px-2 py-1 rounded-lg bg-red-500/10 hover:bg-emerald-500 text-red-600 hover:text-white dark:text-red-400 dark:hover:text-white border border-red-500/30 hover:border-emerald-500 text-[10px] font-black flex items-center gap-1 transition-all shadow-sm active:scale-95"
                        title="Click to Unblock student"
                      >
                        <UserCheck className="w-3 h-3 text-emerald-500 hover:text-white" />
                        <span>Unblock</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Host Control View: Pending Join Requests */}
          {isHost && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span>Pending Join Requests ({(ride.pendingRequests || []).length})</span>
                {(ride.pendingRequests || []).length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </h3>

              {(!ride.pendingRequests || ride.pendingRequests.length === 0) ? (
                <p className="text-xs font-medium text-gray-400 italic">No pending join requests.</p>
              ) : (
                <div className="space-y-2">
                  {ride.pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} alt={req.name} className="w-9 h-9 rounded-xl object-cover" />
                        <div>
                          <span className="text-xs font-extrabold text-gray-900 dark:text-white block">{req.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{req.email} • {req.rating || 5.0} ⭐</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRespond(req.id, true)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1 hover:bg-emerald-400 shadow"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRespond(req.id, false)}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 font-extrabold text-xs flex items-center gap-1 hover:bg-red-500/30"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {isMember ? (
              isHost ? (
                <button
                  onClick={() => {
                    setActiveSlide('chat');
                    setSearchParams({ slide: 'chat' });
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enter Live Squad Chat 💬 ➔</span>
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveSlide('chat');
                      setSearchParams({ slide: 'chat' });
                    }}
                    className="flex-1 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enter Live Squad Chat 💬 ➔</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveSlot}
                    className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-black text-xs uppercase tracking-wider border border-red-500/30 hover:border-red-500 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                    title="Leave this slot if there was any misconception or change of mind"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Leave Slot 🚪</span>
                  </button>
                </div>
              )
            ) : isPending ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full py-4 px-6 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-black text-xs uppercase tracking-wider text-center">
                  Request Sent ➔ Awaiting Host Acceptance ⏳
                </div>
                <button
                  type="button"
                  onClick={handleCancelRequest}
                  className="w-full sm:w-auto py-4 px-5 rounded-2xl bg-gray-100 hover:bg-red-500/20 dark:bg-gray-800 dark:hover:bg-red-500/20 text-gray-700 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 font-black text-xs uppercase tracking-wider border border-gray-300 dark:border-gray-700 flex items-center justify-center gap-2 transition-all active:scale-98"
                  title="Cancel your join request"
                >
                  <span>Cancel Request ✕</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleJoinRequest}
                disabled={(ride.members || []).length >= ride.capacity}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 disabled:opacity-50 text-gray-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/30 hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>
                  {(ride.members || []).length >= ride.capacity
                    ? 'Ride Slot Full'
                    : t('enrollSquad')}
                </span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* SLIDE 2: LIVE SQUAD CHAT                                             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeSlide === 'chat' && (
        <div className="flex flex-col h-[calc(100vh-13rem)] animate-in fade-in duration-200">
          
          {/* Top Chat Sub-Header with Back-to-Details Shuffle */}
          <div className="aesthetic-card rounded-t-3xl p-3.5 border border-slate-200/80 dark:border-slate-800/80 shadow-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  setActiveSlide('details');
                  setSearchParams({});
                }}
                className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center gap-1 transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Slot Details</span>
              </button>
              
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{ride.pickup} ➔ {ride.dropoff}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isHost && (
                <button
                  type="button"
                  onClick={handleLeaveSlot}
                  className="px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500 text-xs font-black flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                  title="Leave this ride slot if there is any misconception"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Leave Slot</span>
                </button>
              )}

              <button
                onClick={() => setIsSosOpen(true)}
                className="p-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 font-black text-xs flex items-center gap-1"
                title="Emergency SOS"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>SOS</span>
              </button>

              {isHost && ride.status !== 'completed' && (
                <button
                  onClick={handleCompleteRide}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs shadow flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Done</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 aesthetic-bg p-4 overflow-y-auto space-y-3.5 border-x border-slate-200/80 dark:border-slate-800/80">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400 max-w-sm mx-auto">
              <span>🛺 Real-time Squad Chat. Share exact GPS pin below!</span>
            </div>

            {(Array.isArray(messages) ? messages : []).map((msg) => {
              const isMe = msg.senderId === user?.id;
              const isEditingThis = editingMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`group flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 mt-1"
                  />

                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 px-1 mb-0.5">
                      <span className="text-[10px] font-extrabold text-slate-400">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.edited && (
                        <span className="text-[9px] font-bold text-slate-400 italic">(edited)</span>
                      )}
                    </div>

                    {isEditingThis ? (
                      <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500 space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 outline-none"
                          autoFocus
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleSaveMsgEdit(msg.id)}
                            className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingMsgId(null);
                              setEditText('');
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className={`p-3 rounded-2xl text-xs font-medium shadow-sm ${
                          isMe
                            ? 'bg-amber-500 text-slate-950 rounded-tr-none font-bold'
                            : 'aesthetic-card text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/70 rounded-tl-none'
                        }`}>
                          {msg.isLocation ? (
                            <a
                              href={
                                msg.text.includes('https://www.google.com/maps')
                                  ? msg.text.substring(msg.text.indexOf('https://www.google.com/maps'))
                                  : msg.text
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-black underline hover:opacity-80"
                            >
                              <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                              <span>{msg.text}</span>
                            </a>
                          ) : (
                            <span>{msg.text}</span>
                          )}
                        </div>

                        {isMe && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 justify-end">
                            {!msg.isLocation && (
                              <button
                                onClick={() => handleStartEdit(msg)}
                                className="p-1 rounded-md text-slate-400 hover:text-amber-500"
                                title="Edit message"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteMsg(msg.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-500"
                              title="Delete message"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies & Message Input */}
          <div className="aesthetic-card rounded-b-3xl p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xl space-y-2.5 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickReplies.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-all shrink-0 active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={handleShareLocation}
                disabled={geoLoading}
                className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all flex items-center justify-center"
                title="Share Exact GPS Pin"
              >
                <MapPin className={`w-4 h-4 ${geoLoading ? 'animate-bounce text-red-500' : ''}`} />
              </button>

              <input
                type="text"
                placeholder="Type a message to squad..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-xs font-semibold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold shadow-md transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SOS Modal */}
      <SOSModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        rideMembers={ride.members}
        currentUserId={user?.id}
      />

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingOpen}
        onClose={() => setIsRatingOpen(false)}
        members={ride.members}
        currentUserId={user?.id}
        onComplete={() => navigate('/')}
      />

    </div>
  );
};
