/**
 * HopIn Fare Calculation & Commute Rate Engine
 * Calculates realistic market fare benchmarks (Rapido Bike, Auto Rickshaw, Cab)
 * for ANY custom destination using a comprehensive Lucknow hub database + dynamic OpenStreetMap geocoding.
 */

// Comprehensive Transit Hubs Database around BBD University, Lucknow & NCR
export const HUB_COORDINATES = {
  "HCL IT City Lucknow": { lat: 26.7972, lng: 81.0264, name: "HCL Technologies, IT City, Sultanpur Road, Lucknow" },
  "BBDU Main Gate": { lat: 26.8906, lng: 81.0592, name: "BBD University Main Gate, Lucknow" },
  "Matiyari Chauraha": { lat: 26.8837, lng: 81.0348, name: "Matiyari Chauraha, Chinhat, Lucknow" },
  "Chinhat Tiraha": { lat: 26.8798, lng: 81.0425, name: "Chinhat, Lucknow" },
  "Kamta Chauraha Junction": { lat: 26.8770, lng: 81.0110, name: "Kamta Chauraha, Faizabad Road, Lucknow" },
  "Polytechnic Chauraha": { lat: 26.8711, lng: 80.9902, name: "Polytechnic Chauraha, Indira Nagar, Lucknow" },
  "Indira Nagar Metro": { lat: 26.8732, lng: 80.9854, name: "Indira Nagar Metro Station, Lucknow" },
  "Munshipulia Metro": { lat: 26.8885, lng: 80.9878, name: "Munshipulia Metro Station, Lucknow" },
  "Hazratganj Metro Station": { lat: 26.8529, lng: 80.9462, name: "Hazratganj Metro Station, Lucknow" },
  "Charbagh Railway Station": { lat: 26.8298, lng: 80.9234, name: "Charbagh Railway Station, Lucknow" },
  "Lucknow Junction (NER)": { lat: 26.8285, lng: 80.9215, name: "Lucknow Junction Railway Station" },
  "Lulu Mall Lucknow": { lat: 26.7766, lng: 80.9972, name: "Lulu Mall, Amar Shaheed Path, Lucknow" },
  "Phoenix Palassio": { lat: 26.8085, lng: 81.0135, name: "Phoenix Palassio Mall, Amar Shaheed Path" },
  "Ekana Stadium": { lat: 26.8122, lng: 81.0142, name: "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium" },
  "Gomti Nagar (Patrakarpuram)": { lat: 26.8526, lng: 81.0028, name: "Patrakarpuram Chauraha, Gomti Nagar" },
  "Gomti Nagar Railway Station": { lat: 26.8612, lng: 81.0039, name: "Gomti Nagar Railway Station" },
  "Kathauta Chauraha": { lat: 26.8665, lng: 81.0256, name: "Kathauta Chauraha, Gomti Nagar, Lucknow" },
  "Vibhuti Khand": { lat: 26.8668, lng: 81.0008, name: "Vibhuti Khand, Gomti Nagar, Lucknow" },
  "Alambagh Bus Stand": { lat: 26.8168, lng: 80.9085, name: "Alambagh Bus Stand, Lucknow" },
  "Alambagh Metro": { lat: 26.8155, lng: 80.9068, name: "Alambagh Metro Station, Lucknow" },
  "Singar Nagar Metro": { lat: 26.8048, lng: 80.8988, name: "Singar Nagar Metro, Alambagh" },
  "CCS Airport (Amausi)": { lat: 26.7606, lng: 80.8893, name: "Chaudhary Charan Singh International Airport (Amausi)" },
  "Transport Nagar Metro": { lat: 26.7865, lng: 80.8925, name: "Transport Nagar, Kanpur Road, Lucknow" },
  "Telibagh Chauraha": { lat: 26.7925, lng: 80.9502, name: "Telibagh, Raebareli Road, Lucknow" },
  "Ashiyana (Sector K)": { lat: 26.7885, lng: 80.9255, name: "Ashiyana Colony, Lucknow" },
  "Bangla Bazar": { lat: 26.8021, lng: 80.9388, name: "Bangla Bazar, Lucknow" },
  "Kapoorthala Chauraha": { lat: 26.8835, lng: 80.9458, name: "Kapoorthala, Aliganj, Lucknow" },
  "Engineering College (IET)": { lat: 26.9142, lng: 80.9412, name: "IET Engineering College Chauraha, Sitapur Road" },
  "Jankipuram Extension": { lat: 26.9295, lng: 80.9585, name: "Jankipuram Extension, Lucknow" },
  "Tedhi Pulia": { lat: 26.9015, lng: 80.9568, name: "Tedhi Pulia Ring Road, Lucknow" },
  "IT Chauraha Metro": { lat: 26.8698, lng: 80.9432, name: "IT Chauraha, Lucknow University" },
  "Lucknow University (New Campus)": { lat: 26.9198, lng: 80.9525, name: "University of Lucknow New Campus, Jankipuram" },
  "Aminabad Market": { lat: 26.8458, lng: 80.9275, name: "Aminabad, Lucknow" },
  "Kaisarbagh Bus Stand": { lat: 26.8525, lng: 80.9295, name: "Kaisarbagh Inter-State Bus Stand, Lucknow" },
  "Chowk (Chhota Imambara)": { lat: 26.8688, lng: 80.9125, name: "Chowk, Old Lucknow" },
  "Dubagga Chauraha": { lat: 26.8715, lng: 80.8645, name: "Dubagga, Hardoi Road, Lucknow" },
  "Rajajipuram": { lat: 26.8385, lng: 80.8875, name: "Rajajipuram, Lucknow" },
  "Safedabad (Hind Hospital)": { lat: 26.9158, lng: 81.1225, name: "Safedabad, Faizabad Road, Barabanki" },
  "Barabanki Railway Station": { lat: 26.9325, lng: 81.1965, name: "Barabanki Railway Station" },
  "Amity University Lucknow": { lat: 26.8322, lng: 81.0425, name: "Amity University Campus, Malhaur, Gomti Nagar" },
  "Integral University": { lat: 26.9585, lng: 80.9985, name: "Integral University, Dasauli, Kursi Road" }
};

// Fuzzy keyword search index
export const HUB_KEYWORDS = [
  { match: ["hcl", "it city", "hcltech", "chak ganjaria", "sultanpur road"], key: "HCL IT City Lucknow" },
  { match: ["bbd", "bbdu", "babu banarasi das", "campus"], key: "BBDU Main Gate" },
  { match: ["matiyari", "matiari"], key: "Matiyari Chauraha" },
  { match: ["chinhat"], key: "Chinhat Tiraha" },
  { match: ["kamta"], key: "Kamta Chauraha Junction" },
  { match: ["polytechnic"], key: "Polytechnic Chauraha" },
  { match: ["indira nagar", "indiranagar"], key: "Indira Nagar Metro" },
  { match: ["munshipulia", "munshi pulia"], key: "Munshipulia Metro" },
  { match: ["hazratganj", "ganj"], key: "Hazratganj Metro Station" },
  { match: ["charbagh", "char bagh", "lko"], key: "Charbagh Railway Station" },
  { match: ["ner", "lucknow junction"], key: "Lucknow Junction (NER)" },
  { match: ["lulu", "lulu mall"], key: "Lulu Mall Lucknow" },
  { match: ["palassio", "palasio"], key: "Phoenix Palassio" },
  { match: ["ekana", "stadium"], key: "Ekana Stadium" },
  { match: ["patrakarpuram"], key: "Gomti Nagar (Patrakarpuram)" },
  { match: ["kathauta"], key: "Kathauta Chauraha" },
  { match: ["vibhuti"], key: "Vibhuti Khand" },
  { match: ["gomti nagar", "gomtinagar"], key: "Gomti Nagar (Patrakarpuram)" },
  { match: ["alambagh", "alam bagh"], key: "Alambagh Bus Stand" },
  { match: ["singar nagar", "singarnagar"], key: "Singar Nagar Metro" },
  { match: ["airport", "amausi", "ccs"], key: "CCS Airport (Amausi)" },
  { match: ["transport nagar", "t nagar"], key: "Transport Nagar Metro" },
  { match: ["telibagh", "teli bagh"], key: "Telibagh Chauraha" },
  { match: ["ashiyana", "aashiana"], key: "Ashiyana (Sector K)" },
  { match: ["bangla bazar", "banglabazar"], key: "Bangla Bazar" },
  { match: ["kapoorthala", "kapoorthla"], key: "Kapoorthala Chauraha" },
  { match: ["engineering college", "iet"], key: "Engineering College (IET)" },
  { match: ["jankipuram", "jankipuram ext"], key: "Jankipuram Extension" },
  { match: ["tedhi pulia", "tedhipulia"], key: "Tedhi Pulia" },
  { match: ["it chauraha", "it college"], key: "IT Chauraha Metro" },
  { match: ["lucknow university", "lu new campus"], key: "Lucknow University (New Campus)" },
  { match: ["aminabad"], key: "Aminabad Market" },
  { match: ["kaisarbagh", "qaisarbagh"], key: "Kaisarbagh Bus Stand" },
  { match: ["chowk", "imambara"], key: "Chowk (Chhota Imambara)" },
  { match: ["dubagga"], key: "Dubagga Chauraha" },
  { match: ["rajajipuram"], key: "Rajajipuram" },
  { match: ["safedabad", "hind hospital"], key: "Safedabad (Hind Hospital)" },
  { match: ["barabanki"], key: "Barabanki Railway Station" },
  { match: ["amity", "malhaur"], key: "Amity University Lucknow" },
  { match: ["integral", "kursi road"], key: "Integral University" }
];

// In-memory geocache to minimize API requests
const GEO_CACHE = {};

// Load persistent geocache from localStorage if available
try {
  const cached = localStorage.getItem('hopin_geocache_v2');
  if (cached) {
    Object.assign(GEO_CACHE, JSON.parse(cached));
  }
} catch {
  // Ignore storage errors in private mode
}

/**
 * Resolves location coordinates from local database or memory cache.
 */
export const resolveLocationCoords = (locationStr) => {
  if (!locationStr || typeof locationStr !== 'string') return null;
  const clean = locationStr.trim();
  const lower = clean.toLowerCase();

  // 1. Direct key match
  if (HUB_COORDINATES[clean]) {
    return HUB_COORDINATES[clean];
  }

  // 2. Keyword match
  for (const item of HUB_KEYWORDS) {
    if (item.match.some((k) => lower.includes(k))) {
      return HUB_COORDINATES[item.key];
    }
  }

  // 3. Check cached geocoding
  if (GEO_CACHE[lower]) {
    return GEO_CACHE[lower];
  }

  return null;
};

/**
 * Dynamic OpenStreetMap Geocoding:
 * Fetches real GPS coordinates for ANY custom address typed by the user.
 */
export const fetchCustomLocationCoords = async (locationStr) => {
  if (!locationStr || typeof locationStr !== 'string') return null;
  const clean = locationStr.trim();
  const lower = clean.toLowerCase();

  // Return existing local result if known
  const localResult = resolveLocationCoords(clean);
  if (localResult) return localResult;

  try {
    const query = `${clean}, Lucknow, Uttar Pradesh, India`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      const resolved = {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name || clean,
        isCustomGeo: true
      };

      GEO_CACHE[lower] = resolved;
      try {
        localStorage.setItem('hopin_geocache_v2', JSON.stringify(GEO_CACHE));
      } catch {
        // storage quota full, ignore
      }
      return resolved;
    }
  } catch (err) {
    console.warn('Geocoding lookup error:', err);
  }

  return null;
};

/**
 * Haversine formula to calculate straight-line distance in kilometers.
 */
export const calculateHaversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Dynamic OpenStreetMap Reverse Geocoding:
 * Converts GPS (lat, lng) to a recognizable street / area address.
 */
export const fetchAddressFromCoords = async (lat, lng) => {
  if (!lat || !lng) return null;

  // 1. Check if it's very close (within 500m) of any known Hub
  for (const [hubName, coords] of Object.entries(HUB_COORDINATES)) {
    const dist = calculateHaversineKm(lat, lng, coords.lat, coords.lng);
    if (dist <= 0.6) {
      return hubName;
    }
  }

  // 2. Fetch from Nominatim reverse geocode
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const mainPart = addr.amenity || addr.building || addr.road || addr.suburb || addr.neighbourhood || addr.city_district || addr.quarter;
        const cityPart = addr.suburb || addr.city || 'Lucknow';
        if (mainPart) {
          return `${mainPart}, ${cityPart}`;
        }
        if (data.display_name) {
          const parts = data.display_name.split(',');
          return parts.slice(0, 2).join(',').trim();
        }
      }
    }
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
  }

  return `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
};

/**
 * Multi-layer Live Location Detector:
 * 1. Tries standard browser geolocation (low accuracy first for instant laptop Wi-Fi resolution)
 * 2. If blocked or timed out on desktop, falls back to network IP location
 * 3. If offline or completely unreachable, gracefully falls back to Lucknow Matiyari Hub
 * Always resolves successfully so user is never blocked by OS location permissions!
 */
export const detectLiveCoordinates = () => {
  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            source: 'gps'
          });
        },
        async (err) => {
          console.warn('Browser GPS permission/timeout, using network fallback:', err?.message);
          try {
            const res = await fetch('https://ipapi.co/json/');
            if (res.ok) {
              const data = await res.json();
              if (data && data.latitude && data.longitude) {
                resolve({
                  lat: data.latitude,
                  lng: data.longitude,
                  source: 'network'
                });
                return;
              }
            }
          } catch (netErr) {
            console.warn('Network location fallback failed:', netErr);
          }

          // Default smart Lucknow hub fallback (Matiyari Chauraha, near BBD)
          resolve({
            lat: 26.8837,
            lng: 81.0348,
            source: 'fallback'
          });
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      resolve({
        lat: 26.8837,
        lng: 81.0348,
        source: 'fallback'
      });
    }
  });
};


/**
 * Computes road distance estimate (in KM) between pickup and dropoff.
 * Accepts optional dynamic coordinates for custom user locations.
 */
export const estimateRouteDistanceKm = (pickup, dropoff, customPickupCoord = null, customDropoffCoord = null) => {
  const pickupCoord = customPickupCoord || resolveLocationCoords(pickup);
  const dropoffCoord = customDropoffCoord || resolveLocationCoords(dropoff);

  if (pickupCoord && dropoffCoord) {
    if (pickupCoord.lat === dropoffCoord.lat && pickupCoord.lng === dropoffCoord.lng) {
      return 1.2;
    }
    const straightKm = calculateHaversineKm(
      pickupCoord.lat,
      pickupCoord.lng,
      dropoffCoord.lat,
      dropoffCoord.lng
    );
    // City road multiplier
    const roadKm = Math.round(straightKm * 1.25 * 10) / 10;
    return Math.max(1.5, roadKm);
  }

  // If one coordinate is known (e.g. BBD University) and the other is unknown,
  // estimate a realistic average Lucknow transit distance (9.5 km)
  return 8.5;
};

/**
 * Computes estimated travel time in minutes based on distance.
 */
export const estimateTravelMinutes = (distanceKm) => {
  return Math.max(10, Math.round(distanceKm * 2.5 + 5));
};

/**
 * Method 1: Instant Rate-Card Comparison Engine
 * Computes estimated prices for Rapido Bike, Auto Rickshaw, Cab, and HopIn Pool split.
 */
/**
 * In-memory weather cache (15-min TTL)
 */
let WEATHER_CACHE = {
  data: null,
  timestamp: 0
};

/**
 * Fetches real-time weather for Lucknow coordinates (26.8467, 80.9462)
 * using the free, open Open-Meteo API.
 */
export const fetchLiveLucknowWeather = async () => {
  const now = Date.now();
  if (WEATHER_CACHE.data && (now - WEATHER_CACHE.timestamp) < 15 * 60 * 1000) {
    return WEATHER_CACHE.data;
  }

  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=26.8467&longitude=80.9462&current=weather_code,precipitation,temperature_2m'
    );
    if (!res.ok) throw new Error('Weather API error');
    const json = await res.json();
    const current = json.current || {};
    const code = current.weather_code || 0;
    const precip = current.precipitation || 0;

    // WMO Codes for Rain, Drizzle, Showers, and Thunderstorms
    // 51, 53, 55: Drizzle
    // 61, 63, 65: Rain
    // 80, 81, 82: Rain showers
    // 95, 96, 99: Thunderstorm
    const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 99) || precip > 0.2;
    const isThunderstorm = code >= 95;

    const weatherData = {
      isRaining,
      isThunderstorm,
      weatherCode: code,
      temp: current.temperature_2m,
      condition: isThunderstorm ? 'Thunderstorm ⛈️' : isRaining ? 'Raining 🌧️' : 'Clear ☀️'
    };

    WEATHER_CACHE = {
      data: weatherData,
      timestamp: now
    };

    return weatherData;
  } catch {
    return {
      isRaining: false,
      isThunderstorm: false,
      weatherCode: 0,
      condition: 'Clear ☀️'
    };
  }
};

/**
 * Computes contextual surge multiplier based on:
 * 1. 🌙 Night Tariff (10:00 PM - 06:00 AM) -> 1.25x
 * 2. ⚡ Campus Peak Rush Hours (8:30-10:30 AM & 4:30-7:30 PM) -> 1.20x
 * 3. 🌧️ Real-Time Lucknow Rainfall -> 1.35x (or 1.45x for thunderstorm)
 */
export const getSurgeContext = (departureDate = new Date(), weather = null) => {
  const date = departureDate instanceof Date ? departureDate : new Date(departureDate);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const timeNum = hour + (minute / 60);

  const badges = [];
  let multiplier = 1.0;

  // 1. Night Tariff (10:00 PM to 6:00 AM)
  const isNight = timeNum >= 22.0 || timeNum < 6.0;
  if (isNight) {
    multiplier *= 1.25;
    badges.push({
      type: 'night',
      label: 'Night Tariff (+25%)',
      icon: '🌙',
      detail: 'Standard 10 PM - 6 AM night rates'
    });
  }

  // 2. Peak College & Office Rush Hours (Mon - Sat)
  const isWeekday = day !== 0; // Monday through Saturday
  const isMorningRush = isWeekday && (timeNum >= 8.5 && timeNum <= 10.5);
  const isEveningRush = isWeekday && (timeNum >= 16.5 && timeNum <= 19.5);

  if (!isNight && (isMorningRush || isEveningRush)) {
    multiplier *= 1.20;
    badges.push({
      type: 'rush',
      label: 'Peak Rush (+20%)',
      icon: '⚡',
      detail: isMorningRush ? 'Morning campus arrival rush' : 'Evening college & office dispersal'
    });
  }

  // 3. Rain / Weather Surge
  if (weather && weather.isRaining) {
    const rainMultiplier = weather.isThunderstorm ? 1.45 : 1.35;
    multiplier *= rainMultiplier;
    badges.push({
      type: 'rain',
      label: weather.isThunderstorm ? 'Storm Surge (+45%)' : 'Rain Surge (+35%)',
      icon: weather.isThunderstorm ? '⛈️' : '🌧️',
      detail: `Real-time ${weather.condition} in Lucknow`
    });
  }

  // Cap combined multiplier to a realistic ceiling (max 1.75x)
  const finalMultiplier = Math.min(1.75, Math.round(multiplier * 100) / 100);

  return {
    multiplier: finalMultiplier,
    isSurgeActive: finalMultiplier > 1.0,
    badges,
    isNight,
    isRush: isMorningRush || isEveningRush,
    isRaining: Boolean(weather?.isRaining)
  };
};

/**
 * Method 1: Benchmark Rate Calculation Engine with Contextual Surge
 * Computes realistic market estimates for Rapido Bike, Auto Rickshaw, Cab, and HopIn Pool.
 */
export const calculateFareEstimates = (
  pickup,
  dropoff,
  capacity = 3,
  manualDistanceKm = null,
  surgeContext = null
) => {
  const distanceKm = manualDistanceKm !== null && manualDistanceKm > 0
    ? manualDistanceKm
    : estimateRouteDistanceKm(pickup, dropoff);

  const estMins = estimateTravelMinutes(distanceKm);
  const safeCapacity = Math.max(1, parseInt(capacity, 10) || 3);
  const surgeMult = surgeContext?.multiplier || 1.0;

  // 1. Rapido Bike Taxi (Base ₹20 + ₹7.5/km, min ₹25)
  const rawRapido = Math.max(25, Math.round(20 + Math.max(0, distanceKm - 1.5) * 7.5));
  const rapidoBase = Math.round(rawRapido * surgeMult);
  const rapido = {
    name: "Rapido Bike",
    type: "bike",
    icon: "🛵",
    low: Math.max(20, Math.round(rapidoBase * 0.95)),
    high: Math.round(rapidoBase * 1.15),
    avg: rapidoBase,
    currency: "₹",
    unit: "solo rider"
  };

  // 2. Auto Rickshaw (Ola / Uber Auto / Local Auto)
  // Base ₹30 + ₹10.5/km, min ₹35
  const rawAuto = Math.max(35, Math.round(30 + Math.max(0, distanceKm - 2.0) * 10.5));
  const autoBase = Math.round(rawAuto * surgeMult);
  const auto = {
    name: "Auto Rickshaw",
    type: "auto",
    icon: "🛺",
    low: Math.max(30, Math.round(autoBase * 0.95)),
    high: Math.round(autoBase * 1.15),
    avg: autoBase,
    currency: "₹",
    unit: "vehicle fare"
  };

  // 3. Cab (Uber Go / Ola Mini)
  // Base ₹55 + ₹13.5/km, min ₹85
  const rawCab = Math.max(85, Math.round(55 + Math.max(0, distanceKm - 2.0) * 13.5));
  const cabBase = Math.round(rawCab * surgeMult);
  const cab = {
    name: "Cab (Uber Go / Ola)",
    type: "cab",
    icon: "🚗",
    low: Math.max(75, Math.round(cabBase * 0.95)),
    high: Math.round(cabBase * 1.2),
    avg: cabBase,
    currency: "₹",
    unit: "vehicle fare"
  };

  // 4. HopIn Pool Fare Split
  const poolVehicle = safeCapacity >= 4 ? cab : auto;
  const pooledVehicleFare = poolVehicle.avg;
  const perPersonSplit = Math.ceil(pooledVehicleFare / safeCapacity);
  const soloComparisonFare = safeCapacity >= 4 ? cab.avg : auto.avg;
  const savedAmount = Math.max(0, soloComparisonFare - perPersonSplit);
  const savedPercent = Math.min(85, Math.round((savedAmount / soloComparisonFare) * 100));

  const hopinPool = {
    name: "HopIn Pool",
    type: "pool",
    icon: "👥",
    perPersonFare: perPersonSplit,
    totalVehicleFare: pooledVehicleFare,
    vehicleType: poolVehicle.name,
    capacity: safeCapacity,
    savedAmount,
    savedPercent,
    currency: "₹"
  };

  const isExactGPS = Boolean(
    resolveLocationCoords(pickup) && resolveLocationCoords(dropoff)
  );

  return {
    distanceKm,
    estMins,
    isExactGPS,
    surgeContext,
    rapido,
    auto,
    cab,
    hopinPool
  };
};

/**
 * Method 2: 1-Tap Deep Link Launcher URLs
 * Generates preloaded links for Uber, Ola, Rapido, and Google Maps Transit/Rides for ANY location.
 */
export const getPlatformDeepLinks = (pickup, dropoff) => {
  const cleanPickup = (pickup || "Current Location").trim();
  const cleanDropoff = (dropoff || "BBD University, Lucknow").trim();

  const pickupCoord = resolveLocationCoords(cleanPickup) || { lat: 26.8917, lng: 81.0608, name: cleanPickup };
  const dropoffCoord = resolveLocationCoords(cleanDropoff) || { lat: 26.8917, lng: 81.0608, name: cleanDropoff };

  const pLat = pickupCoord.lat;
  const pLng = pickupCoord.lng;
  const pName = pickupCoord.name || cleanPickup;

  const dLat = dropoffCoord.lat;
  const dLng = dropoffCoord.lng;
  const dName = dropoffCoord.name || cleanDropoff;

  const isMyLocation = cleanPickup.toLowerCase().includes('current') || cleanPickup.toLowerCase().includes('live');

  // 1. Uber: Native App URI Scheme + Universal Web Link (m.uber.com)
  const uberAppUrl = isMyLocation
    ? `uber://?action=setPickup&client_id=hopin_campus&pickup=my_location&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${encodeURIComponent(dName)}&dropoff[formatted_address]=${encodeURIComponent(dName + ", Lucknow")}`
    : `uber://?action=setPickup&client_id=hopin_campus&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[nickname]=${encodeURIComponent(pName)}&pickup[formatted_address]=${encodeURIComponent(pName + ", Lucknow")}&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[nickname]=${encodeURIComponent(dName)}&dropoff[formatted_address]=${encodeURIComponent(dName + ", Lucknow")}`;

  const uberWebUrl = isMyLocation
    ? `https://m.uber.com/ul/?action=setPickup&client_id=hopin_campus&pickup=my_location&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[formatted_address]=${encodeURIComponent(dName + ", Lucknow")}`
    : `https://m.uber.com/ul/?action=setPickup&client_id=hopin_campus&dropoff[latitude]=${dLat}&dropoff[longitude]=${dLng}&dropoff[formatted_address]=${encodeURIComponent(dName + ", Lucknow")}&pickup[latitude]=${pLat}&pickup[longitude]=${pLng}&pickup[formatted_address]=${encodeURIComponent(pName + ", Lucknow")}`;

  // 2. Ola Cabs: Native App URI (olacabs://) + Web Booking App (book.olacabs.com)
  const olaAppUrl = `olacabs://app/launch?lat=${pLat}&lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}&drop_name=${encodeURIComponent(dName)}&pickup_name=${encodeURIComponent(pName)}`;
  const olaWebUrl = `https://book.olacabs.com/?pickup_name=${encodeURIComponent(pName)}&drop_name=${encodeURIComponent(dName)}&pickup_lat=${pLat}&pickup_lng=${pLng}&drop_lat=${dLat}&drop_lng=${dLng}`;

  // 3. Rapido Bike & Auto: Native App URI (rapido://) + Official Web Portal (www.rapido.bike)
  const rapidoAppUrl = `rapido://ride?destination=${encodeURIComponent(dName)}&drop_name=${encodeURIComponent(dName)}&drop_lat=${dLat}&drop_lng=${dLng}&pickup_name=${encodeURIComponent(pName)}&pickup_lat=${pLat}&pickup_lng=${pLng}`;
  const rapidoWebUrl = `https://www.rapido.bike/`;

  // 4. Google Maps "Ride Services": Pre-fills route and shows live Uber/Ola/Rapido booking cards
  const gmapsWebUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pName + ", Lucknow")}&destination=${encodeURIComponent(dName + ", Lucknow")}&travelmode=rides`;

  return {
    uber: uberWebUrl,
    uberApp: uberAppUrl,
    uberWeb: uberWebUrl,
    ola: olaWebUrl,
    olaApp: olaAppUrl,
    olaWeb: olaWebUrl,
    rapido: rapidoWebUrl,
    rapidoApp: rapidoAppUrl,
    rapidoWeb: rapidoWebUrl,
    gmaps: gmapsWebUrl,
    pickupName: pName,
    dropoffName: dName
  };
};
