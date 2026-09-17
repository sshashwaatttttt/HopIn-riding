import React, { useState, useEffect, useRef } from 'react';
import { HUB_COORDINATES, HUB_KEYWORDS } from '../utils/fareEngine';
import { MapPin, Search, X, Loader2, Navigation } from 'lucide-react';

/**
 * LocationSearchInput:
 * Clean, simple, and decent location search with autocomplete suggestions.
 */
export const LocationSearchInput = ({
  id,
  label,
  value,
  onChange,
  onSelectLocation,
  placeholder = "Search area, colony, metro or landmark...",
  required = false
}) => {
  const [query, setQuery] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocations = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const clean = searchTerm.trim().toLowerCase();
    const localMatches = [];

    // 1. Local Database lookup
    for (const [name, coord] of Object.entries(HUB_COORDINATES)) {
      const matchFound =
        name.toLowerCase().includes(clean) ||
        (coord.name && coord.name.toLowerCase().includes(clean));

      if (matchFound) {
        localMatches.push({
          title: name,
          subtitle: coord.name || "Lucknow, Uttar Pradesh",
          source: "Campus Landmark",
          lat: coord.lat,
          lng: coord.lng
        });
      }
    }

    for (const item of HUB_KEYWORDS) {
      if (item.match.some((k) => k.includes(clean) || clean.includes(k))) {
        const hubName = item.key;
        const coord = HUB_COORDINATES[hubName];
        if (coord && !localMatches.some((m) => m.title === hubName)) {
          localMatches.push({
            title: hubName,
            subtitle: coord.name || "Lucknow, Uttar Pradesh",
            source: "Verified Hub",
            lat: coord.lat,
            lng: coord.lng
          });
        }
      }
    }

    setSuggestions(localMatches.slice(0, 6));

    // 2. Dynamic geocoding
    setIsLoading(true);
    try {
      const searchQuery = `${clean}, Lucknow, Uttar Pradesh, India`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const remoteItems = data.map((item) => {
            const parts = (item.display_name || '').split(',');
            const primary = parts[0]?.trim() || item.name;
            const secondary = parts.slice(1, 4).join(',').trim();
            return {
              title: primary,
              subtitle: secondary || "Lucknow, Uttar Pradesh",
              source: "Live Maps",
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            };
          });

          const combined = [...localMatches];
          remoteItems.forEach((r) => {
            if (!combined.some((c) => c.title.toLowerCase() === r.title.toLowerCase())) {
              combined.push(r);
            }
          });

          setSuggestions(combined.slice(0, 7));
        }
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchLocations(val);
    }, 250);
  };

  const handleSelect = (item) => {
    setQuery(item.title);
    onChange(item.title);
    if (onSelectLocation) {
      onSelectLocation(item);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange('');
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <span className="text-[10px] text-slate-400">Type for suggestions</span>
        </div>
      )}

      {/* Input Field Container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-600 dark:text-slate-400" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>

        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 1) {
              setIsOpen(true);
              searchLocations(query);
            }
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full min-h-[44px] pl-10 pr-10 py-2 text-xs sm:text-sm font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 focus:border-slate-500 transition-colors"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Simple Decent Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-in fade-in duration-100">
          <div className="max-h-56 overflow-y-auto">
            {suggestions.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                      {item.subtitle}
                    </span>
                  </div>
                </div>

                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                  {item.source}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
