import React from 'react';
import { Download, Sparkles, X } from 'lucide-react';

export const PWAPrompt = ({ deferredPrompt, onInstall, onDismiss }) => {
  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 p-4 rounded-3xl bg-gradient-to-r from-gray-900 to-indigo-950 text-white shadow-2xl border border-amber-500/40 animate-float">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-gray-950 text-2xl flex items-center justify-center font-black shadow-lg shadow-amber-500/30">
            🛺
          </div>
          <div>
            <h4 className="text-sm font-black flex items-center gap-1.5">
              <span>Install HopIn App</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p className="text-[11px] text-gray-300 mt-0.5 font-medium">
              Add to Home Screen for instant BBD Lucknow ride pooling!
            </p>
          </div>
        </div>

        <button onClick={onDismiss} className="text-gray-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 flex gap-2">
        <button
          onClick={onInstall}
          className="flex-1 py-2 px-3 text-xs font-black rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center justify-center gap-1.5 shadow"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install Now</span>
        </button>
        <button
          onClick={onDismiss}
          className="py-2 px-3 text-xs font-extrabold rounded-xl bg-white/10 hover:bg-white/20 text-gray-300"
        >
          Not Now
        </button>
      </div>
    </div>
  );
};
