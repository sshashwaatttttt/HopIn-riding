import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  getRideById, 
  getChatsForRide, 
  addChatMessage, 
  editChatMessage,
  deleteChatMessage,
  updateRideStatus, 
  subscribeToSync 
} from '../utils/store';
import { SOSModal } from '../components/SOSModal';
import { RatingModal } from '../components/RatingModal';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Users,
  Navigation,
  Pencil,
  Trash2,
  Check,
  X
} from 'lucide-react';

export const SquadChat = () => {
  const { rideId } = useParams();
  const { user } = useAuth();
  const { t, quickReplies } = useLanguage();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);

  // Edit message state
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState('');

  // Modals
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const loadData = () => {
    const r = getRideById(rideId);
    setRide(r);
    const msgs = getChatsForRide(rideId);
    setMessages(Array.isArray(msgs) ? msgs : []);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToSync(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!ride) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-black text-gray-900 dark:text-white">Ride not found</h3>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 text-xs font-bold bg-amber-500 text-gray-950 rounded-xl">
          Back to Board
        </button>
      </div>
    );
  }

  const isHost = ride.host?.id === user?.id;

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
      setMessages((prev) => [...(Array.isArray(prev) ? prev : []), newMsg]);
    }
    setInputText('');
  };

  // High-Accuracy Geolocation Handler
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
          errorMsg += "Location permission was denied. Please allow location access in your browser/phone settings.";
        } else if (err.code === 2) {
          errorMsg += "Position unavailable. Please ensure your device GPS is turned on.";
        } else {
          errorMsg += "Request timed out. Please try again.";
        }
        alert(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 0
      }
    );
  };

  // Chat Edit Handlers
  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditText(msg.text);
  };

  const handleSaveEdit = (msgId) => {
    if (!editText.trim()) return;
    const updated = editChatMessage(rideId, msgId, editText.trim());
    if (Array.isArray(updated)) setMessages(updated);
    setEditingMsgId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMsgId(null);
    setEditText('');
  };

  // Chat Delete Handler
  const handleDeleteMessage = (msgId) => {
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
    <div className="max-w-3xl mx-auto py-2 flex flex-col h-[calc(100vh-5rem)]">
      
      {/* Top Chat Header */}
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-4 border border-gray-200 dark:border-gray-800 shadow-lg flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/ride/${rideId}`)}
            className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <h2 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>{ride.pickup} ➔ {ride.dropoff}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-[11px] font-bold text-gray-400">
              {ride.members.length} Squad Members Online
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Floating SOS Safety Button */}
          <button
            onClick={() => setIsSosOpen(true)}
            className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 hover:bg-red-500/20 font-black text-xs flex items-center gap-1"
            title="Emergency SOS Safety Button"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* Complete Ride Button (Host Only) */}
          {isHost && ride.status !== 'completed' && (
            <button
              onClick={handleCompleteRide}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('completeRide')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Messages Feed Area */}
      <div className="flex-1 bg-gray-50/50 dark:bg-gray-950/50 p-4 overflow-y-auto space-y-3.5 border-x border-gray-200 dark:border-gray-800">
        
        {/* Ride Info Pin */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center text-xs font-bold text-amber-600 dark:text-amber-400 max-w-md mx-auto">
          <span>🛺 Live Squad Coordination Active. Send exact GPS pin below!</span>
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
                  <span className="text-[10px] font-extrabold text-gray-400">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.edited && (
                    <span className="text-[9px] font-bold text-gray-400 italic">
                      (edited)
                    </span>
                  )}
                </div>

                {/* Edit Mode Inline Input */}
                {isEditingThis ? (
                  <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500 space-y-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 outline-none"
                      autoFocus
                    />
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => handleSaveEdit(msg.id)}
                        className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-bold flex items-center gap-1"
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
                        ? 'bg-amber-500 text-gray-950 rounded-tr-none font-bold'
                        : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-tl-none'
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
                          className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300 font-black underline hover:opacity-80"
                        >
                          <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                          <span>{msg.text}</span>
                        </a>
                      ) : (
                        <span>{msg.text}</span>
                      )}
                    </div>

                    {/* Edit / Delete Message Controls for Author */}
                    {isMe && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 justify-end">
                        {!msg.isLocation && (
                          <button
                            onClick={() => handleStartEdit(msg)}
                            className="p-1 rounded-md text-gray-400 hover:text-amber-500 hover:bg-gray-200 dark:hover:bg-gray-800"
                            title="Edit message"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-gray-800"
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

      {/* Quick Reply Chips & Message Input */}
      <div className="bg-white dark:bg-gray-900 rounded-b-3xl p-3 md:p-4 border border-gray-200 dark:border-gray-800 shadow-xl space-y-3 shrink-0">
        
        {/* Quick Reply Chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {quickReplies.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(chip)}
              className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-amber-500/20 text-gray-700 dark:text-gray-300 text-[11px] font-extrabold whitespace-nowrap border border-gray-200 dark:border-gray-700 transition-all shrink-0 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar & Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* One-Tap Exact High-Accuracy GPS Share Button */}
          <button
            type="button"
            onClick={handleShareLocation}
            disabled={geoLoading}
            className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all flex items-center justify-center"
            title="Share Exact Live GPS Pin"
          >
            <MapPin className={`w-4 h-4 ${geoLoading ? 'animate-bounce text-red-500' : ''}`} />
          </button>

          <input
            type="text"
            placeholder="Type a message to squad..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 text-xs font-semibold rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />

          <button
            type="submit"
            className="p-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold shadow-md transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

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
