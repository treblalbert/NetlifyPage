const CACHE = 'basicmaxxer-v1';
const ASSETS = [
  '/basicmaxxer/',
  '/basicmaxxer/index.html',
  '/basicmaxxer/manifest.json',
  '/basicmaxxer/icon-192.png',
  '/basicmaxxer/icon-512.png',
  '/basicmaxxer/apple-touch-icon.png',
  '/basicmaxxer/icon.svg',
];

// Install: cache all core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network, update cache in background
self.addEventListener('fetch', e => {
  // Only handle GET requests for our own origin
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (!url.pathname.startsWith('/basicmaxxer')) return;

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const networkFetch = fetch(e.request)
        .then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; })
        .catch(() => null);
      // Return cached immediately, update in background
      return cached || networkFetch;
    })
  );
});
