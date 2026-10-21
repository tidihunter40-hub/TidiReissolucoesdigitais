const CACHE = 'tidireis-static-v10';
const CORE = [
  './', './index.html', './offline.html', './privacidade.html',
  './styles.css', './advanced.css', './reference.css', './compare.css', './showcase.css', './script.js', './advanced.js', './showcase.js', './manifest.webmanifest',
  './assets/logo-tr.webp', './assets/logo-symbol-transparent.png', './assets/hero-scene-v2.webp', './assets/compare-building.webp',
  './assets/icon-192.png', './assets/favicon.png',
  './assets/apple-touch-icon.png', './assets/icon-maskable.png', './assets/og-image.jpg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('tidireis-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
        }
        return response;
      }).catch(async () => (await caches.match(request)) || (await caches.match('./offline.html')))
    );
    return;
  }
  if (!CORE.some(path => new URL(path, self.registration.scope).pathname === url.pathname)) return;
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(request, copy)));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
