import { BBD_HUBS } from './seedData';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

const RIDES_KEY = 'hopin_rides_v2';
const CHATS_KEY = 'hopin_chats_v2';
const BLOCKED_USERS_KEY = 'hopin_blocked_users_v2';

// In-memory subscribers for live UI updates
const subscribers = new Set();

const notifySubscribers = (event) => {
  subscribers.forEach((callback) => {
    try {
      callback(event);
    } catch (e) {
      console.error('Subscriber callback error:', e);
    }
  });
};

// Setup BroadcastChannel for multi-tab real-time synchronization
const syncChannel = typeof BroadcastChannel !== 'undefined' 
  ? new BroadcastChannel('hopin_realtime_channel_v2') 
  : null;

export const broadcastUpdate = (type, payload) => {
  notifySubscribers({ type, payload });
  if (syncChannel) {
    try {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    } catch (e) {
      console.warn("BroadcastChannel error:", e);
    }
  }
};

// Listen to other browser tabs
if (syncChannel) {
  syncChannel.addEventListener('message', (event) => {
    if (event.data) {
      notifySubscribers(event.data);
    }
  });
}

// ── Real-Time Cloud Firestore Sync ──────────────────────────────────────────
let firestoreInitialized = false;

const initFirestoreSync = () => {
  if (firestoreInitialized || !db) return;
  firestoreInitialized = true;

  try {
    // 1. Real-time listener for Rides across ALL browsers & devices
    onSnapshot(collection(db, 'rides'), (snapshot) => {
      const cloudRides = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.id) {
          cloudRides.push(data);
        }
      });

      // Sort by creation time (newest first)
      cloudRides.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      // Update local cache
      localStorage.setItem(RIDES_KEY, JSON.stringify(cloudRides));
      broadcastUpdate('RIDES_UPDATED', cloudRides);
    }, (error) => {
      console.warn('Firestore rides listener error:', error);
    });

    // 2. Real-time listener for Chats across ALL devices
    onSnapshot(collection(db, 'chats'), (snapshot) => {
      const cloudChats = {};
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && Array.isArray(data.messages)) {
          cloudChats[docSnap.id] = data.messages;
        }
      });

      localStorage.setItem(CHATS_KEY, JSON.stringify(cloudChats));
      broadcastUpdate('CHAT_UPDATED', cloudChats);
    }, (error) => {
      console.warn('Firestore chats listener error:', error);
    });
  } catch (err) {
    console.error('Failed to initialize Firestore sync:', err);
  }
};

// Initialize Store cleanly
export const initStore = () => {
  if (!localStorage.getItem(RIDES_KEY)) {
    localStorage.setItem(RIDES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(CHATS_KEY)) {
    localStorage.setItem(CHATS_KEY, JSON.stringify({}));
  }
  if (!localStorage.getItem(BLOCKED_USERS_KEY)) {
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify([]));
  }
  initFirestoreSync();
};

// Automatically try initializing Firestore sync
initStore();

// ── Rides API ───────────────────────────────────────────────────────────────
export const getRides = () => {
  initStore();
  try {
    const data = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
    const now = Date.now();
    // Return non-cancelled active rides created by real users
    return data.filter(ride => {
      const depTime = new Date(ride.departureTime).getTime();
      return (depTime + 60 * 60 * 1000) > now && ride.status !== 'cancelled' && !ride.isDeleted;
    });
  } catch (e) {
    return [];
  }
};

export const getRideById = (id) => {
  initStore();
  try {
    const rides = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
    return rides.find(r => r.id === id && !r.isDeleted) || null;
  } catch {
    return null;
  }
};

export const saveRide = (newRide) => {
  initStore();
  const cleanRide = JSON.parse(JSON.stringify(newRide));

  // 1. Instant local update for optimistic UI
  const rides = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
  const existingIdx = rides.findIndex(r => r.id === cleanRide.id);
  if (existingIdx >= 0) {
    rides[existingIdx] = cleanRide;
  } else {
    rides.unshift(cleanRide);
  }
  localStorage.setItem(RIDES_KEY, JSON.stringify(rides));
  broadcastUpdate('RIDES_UPDATED', rides);

  // 2. Sync to Cloud Firestore in background
  if (db) {
    setDoc(doc(db, 'rides', cleanRide.id), cleanRide, { merge: true })
      .catch((err) => console.error('Error saving ride to Firestore:', err));
  }

  return cleanRide;
};

export const updateRide = (rideId, updatedFields) => {
  const ride = getRideById(rideId);
  if (!ride) return null;

  const updatedRide = {
    ...ride,
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };

  return saveRide(updatedRide);
};

export const deleteRide = (rideId) => {
  initStore();
  const rides = JSON.parse(localStorage.getItem(RIDES_KEY) || '[]');
  const filtered = rides.filter(r => r.id !== rideId);
  localStorage.setItem(RIDES_KEY, JSON.stringify(filtered));
  broadcastUpdate('RIDES_UPDATED', filtered);

  if (db) {
    deleteDoc(doc(db, 'rides', rideId))
      .catch((err) => console.error('Error deleting ride from Firestore:', err));
  }
  return true;
};

export const requestJoinRide = (rideId, user) => {
  const ride = getRideById(rideId);
  if (!ride) return null;

  const isMember = ride.members?.some(m => m.id === user.id);
  const isPending = ride.pendingRequests?.some(p => p.id === user.id);

  if (isMember || isPending) return ride;

  if (!ride.pendingRequests) ride.pendingRequests = [];
  ride.pendingRequests.push({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    rating: user.rating || 5.0,
    requestedAt: new Date().toISOString()
  });

  saveRide(ride);
  return ride;
};

export const respondJoinRequest = (rideId, userId, accept) => {
  const ride = getRideById(rideId);
  if (!ride) return null;

  const reqIndex = (ride.pendingRequests || []).findIndex(p => p.id === userId);
  if (reqIndex >= 0) {
    const userReq = ride.pendingRequests[reqIndex];
    ride.pendingRequests.splice(reqIndex, 1);

    if (accept && (ride.members?.length || 0) < ride.capacity) {
      if (!ride.members) ride.members = [];
      ride.members.push({
        id: userReq.id,
        name: userReq.name,
        avatar: userReq.avatar,
        rating: userReq.rating || 5.0,
        isHost: false
      });
    }
  }

  saveRide(ride);
  return ride;
};

export const updateRideStatus = (rideId, status) => {
  const ride = getRideById(rideId);
  if (!ride) return null;
  ride.status = status;
  saveRide(ride);
  return ride;
};

// ── Chat API ────────────────────────────────────────────────────────────────
export const getChatsForRide = (rideId) => {
  initStore();
  try {
    const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
    return Array.isArray(chats[rideId]) ? chats[rideId] : [];
  } catch (e) {
    return [];
  }
};

// Returns synchronous array to prevent UI crashing
export const addChatMessage = (rideId, message) => {
  initStore();
  const cleanMsg = JSON.parse(JSON.stringify(message));

  // 1. Instant local update
  const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
  if (!Array.isArray(chats[rideId])) {
    chats[rideId] = [];
  }
  chats[rideId].push(cleanMsg);
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  broadcastUpdate('CHAT_UPDATED', { rideId, message: cleanMsg });

  // 2. Sync to Cloud Firestore in background
  if (db) {
    setDoc(doc(db, 'chats', rideId), {
      messages: chats[rideId]
    }, { merge: true }).catch((err) => {
      console.error('Error adding chat message to Firestore:', err);
    });
  }

  return chats[rideId];
};

export const editChatMessage = (rideId, messageId, newText) => {
  initStore();
  const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
  if (!Array.isArray(chats[rideId])) return [];

  const msgIdx = chats[rideId].findIndex(m => m.id === messageId);
  if (msgIdx >= 0) {
    chats[rideId][msgIdx] = {
      ...chats[rideId][msgIdx],
      text: newText,
      edited: true,
      editedAt: new Date().toISOString()
    };
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    broadcastUpdate('CHAT_UPDATED', { rideId, messages: chats[rideId] });

    if (db) {
      setDoc(doc(db, 'chats', rideId), {
        messages: chats[rideId]
      }, { merge: true }).catch((err) => {
        console.error('Error updating chat in Firestore:', err);
      });
    }
  }

  return chats[rideId];
};

export const deleteChatMessage = (rideId, messageId) => {
  initStore();
  const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '{}');
  if (!Array.isArray(chats[rideId])) return [];

  // Remove the message
  chats[rideId] = chats[rideId].filter(m => m.id !== messageId);
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  broadcastUpdate('CHAT_UPDATED', { rideId, messages: chats[rideId] });

  if (db) {
    setDoc(doc(db, 'chats', rideId), {
      messages: chats[rideId]
    }, { merge: true }).catch((err) => {
      console.error('Error deleting chat in Firestore:', err);
    });
  }

  return chats[rideId];
};

// ── User Blocking API ───────────────────────────────────────────────────────
export const blockUser = (userId) => {
  initStore();
  const blocked = JSON.parse(localStorage.getItem(BLOCKED_USERS_KEY) || '[]');
  if (!blocked.includes(userId)) {
    blocked.push(userId);
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(blocked));
  }
};

export const getBlockedUsers = () => {
  initStore();
  return JSON.parse(localStorage.getItem(BLOCKED_USERS_KEY) || '[]');
};

// ── Real-time Event Subscription helper ─────────────────────────────────────
export const subscribeToSync = (callback) => {
  subscribers.add(callback);

  const storageHandler = (e) => {
    if ([RIDES_KEY, CHATS_KEY].includes(e.key)) {
      callback({ type: 'STORAGE_CHANGE', key: e.key });
    }
  };
  window.addEventListener('storage', storageHandler);

  return () => {
    subscribers.delete(callback);
    window.removeEventListener('storage', storageHandler);
  };
};
