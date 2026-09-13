const CACHE_NAME = 'hopin-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install: pre-cache shell and skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: purge ALL legacy caches immediately and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Message handler for manual skipWaiting or cache reset
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE' || (event.data && event.data.type === 'CLEAR_CACHE')) {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore cross-origin requests like Google Fonts, Dicebear, Firebase, etc.
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. Navigation / HTML Requests: NETWORK-FIRST
  // Ensures user always gets the latest deployed index.html containing newest asset hashes
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback only when network fails completely
          return caches.match(event.request).then((cached) => cached || caches.match('/index.html') || caches.match('/'));
        })
    );
    return;
  }

  // 2. Static Assets (/assets/*, JS, CSS)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // CRITICAL SAFETY CHECK:
          // If a JS/CSS file request returned text/html (e.g. from a SPA 404 rewrite),
          // DO NOT CACHE IT! Returning HTML as JS causes fatal SyntaxError: Unexpected token '<'
          const contentType = networkResponse.headers.get('content-type') || '';
          if (
            (url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.includes('/assets/')) &&
            contentType.includes('text/html')
          ) {
            console.warn('[SW] Rejected HTML masquerading as JS/CSS asset:', url.pathname);
            return new Response('Asset not found or outdated hash', { status: 404, statusText: 'Not Found' });
          }

          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch((err) => {
          console.warn('[SW] Asset fetch failed:', url.pathname, err);
          return cachedResponse || new Response('Asset unavailable offline', { status: 503 });
        });
    })
  );
});
