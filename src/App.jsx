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
import { AboutModal } from './components/AboutModal';

const AppRoutes = ({ deferredPrompt, installPWA }) => {
  const { user } = useAuth();
  const [pwaDismissed, setPwaDismissed] = useState(false);
  const [showFooterAbout, setShowFooterAbout] = useState(false);

  // Strict Gatekeeper Protection: Unauthenticated users cannot view board
  if (!user) {
    return (
      <div className="min-h-screen aesthetic-bg text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-200">
        {/* Subtle Classy Ambient Background Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-amber-500/[0.04] via-indigo-500/[0.03] to-transparent pointer-events-none blur-3xl -z-10" />
        <div className="fixed bottom-0 right-1/4 w-72 h-72 bg-amber-500/[0.03] pointer-events-none blur-3xl -z-10" />

        <div className="relative z-10 w-full flex justify-center">
          <GatekeeperAuth />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aesthetic-bg text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 relative selection:bg-amber-500/20 selection:text-amber-800 dark:selection:text-amber-200">
      
      {/* Subtle Aesthetic Ambient Aura */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-gradient-to-b from-indigo-500/[0.04] via-amber-500/[0.03] to-transparent pointer-events-none -z-10 blur-3xl" />

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
      <footer className="py-6 text-center border-t border-gray-200 dark:border-gray-800 text-xs font-semibold text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 px-4">
        <span>HopIn • Live Student Ride-Pooling Platform</span>
        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
        <button
          type="button"
          onClick={() => setShowFooterAbout(true)}
          className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
        >
          About & Contact
        </button>
      </footer>

      {/* Footer About Modal */}
      <AboutModal isOpen={showFooterAbout} onClose={() => setShowFooterAbout(false)} />

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
