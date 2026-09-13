import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { GatekeeperAuth } from './components/GatekeeperAuth';
import { PWAPrompt } from './components/PWAPrompt';
import { JoinRequestNotification } from './components/JoinRequestNotification';
import { LiveRideBoard } from './pages/LiveRideBoard';
import { CreateRide } from './pages/CreateRide';
import { RideDetail } from './pages/RideDetail';
import { SquadChat } from './pages/SquadChat';
import { Profile } from './pages/Profile';
import { ScrollToTop } from './components/ScrollToTop';

const AppRoutes = ({ deferredPrompt, installPWA }) => {
  const { user } = useAuth();
  const [pwaDismissed, setPwaDismissed] = useState(false);

  // Strict Gatekeeper Protection: Unauthenticated users cannot view board
  if (!user) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
        {/* Colorful ambient glowing background orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-1000"></div>
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-gradient-to-bl from-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-gradient-to-tr from-cyan-500/20 to-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full flex justify-center">
          <GatekeeperAuth />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Route Navigation Scroll & Focus Reset */}
      <ScrollToTop />

      {/* Persistent Navbar */}
      <Navbar deferredPrompt={deferredPrompt} installPWA={installPWA} />

      {/* Real-Time Join Request Host Notification Popup */}
      <JoinRequestNotification />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<LiveRideBoard />} />
          <Route path="/create" element={<CreateRide />} />
          <Route path="/ride/:rideId" element={<RideDetail />} />
          <Route path="/chat/:rideId" element={<SquadChat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* PWA Floating Install Prompt */}
      {!pwaDismissed && (
        <PWAPrompt
          deferredPrompt={deferredPrompt}
          onInstall={installPWA}
          onDismiss={() => setPwaDismissed(true)}
        />
      )}

      {/* Footer */}
      <footer className="py-6 text-center border-t border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400">
        <span>HopIn • Live Student Ride-Pooling Platform</span>
      </footer>

    </div>
  );
};

export function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AppRoutes deferredPrompt={deferredPrompt} installPWA={installPWA} />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
