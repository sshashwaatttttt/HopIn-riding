import React from 'react';
import { RotateCcw, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('HopIn Application Error:', error, errorInfo);
  }

  handleHardRefresh = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
    } catch (e) {
      console.warn('Cache clearing error:', e);
    }

    try {
      // Fix corrupt blocked users key if invalid
      const raw = localStorage.getItem('hopin_blocked_users_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.some((x) => !x)) {
          localStorage.setItem('hopin_blocked_users_v2', JSON.stringify([]));
        }
      }
    } catch {
      localStorage.setItem('hopin_blocked_users_v2', JSON.stringify([]));
    }

    sessionStorage.removeItem('hopin_auto_recovered');
    window.location.href = window.location.origin + '/?ts=' + Date.now();
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('hopin_blocked_users_v2');
      localStorage.removeItem('hopin_rides_v2');
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
    this.handleHardRefresh();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden font-sans">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-md w-full bg-gray-900/90 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-5 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/10">
              🛺
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-white tracking-tight">
                HopIn Quick Recovery
              </h2>
              <p className="text-xs text-gray-400 font-medium">
                HopIn updated its real-time ride and safety synchronization. Tap below to refresh your connection.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleHardRefresh}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Launch Latest HopIn 🚀</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-gray-200 font-bold text-[11px] transition-all cursor-pointer"
              >
                Reset Stored Cache & Reload
              </button>
            </div>

            {this.state.error && (
              <div className="pt-1 text-left">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="text-[10px] text-gray-500 hover:text-gray-400 flex items-center gap-1 font-bold mx-auto cursor-pointer"
                >
                  <span>Technical details</span>
                  {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {this.state.showDetails && (
                  <pre className="mt-2 p-2.5 rounded-xl bg-black/50 border border-gray-800 text-[10px] text-red-400 font-mono overflow-x-auto max-h-24 whitespace-pre-wrap break-all">
                    {this.state.error?.message || String(this.state.error)}
                  </pre>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-gray-800/80 flex items-center justify-center gap-1.5 text-[10px] text-gray-500 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>BBD Student Ride-Pooling Platform</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
