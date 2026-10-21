const CACHE = 'tidireis-static-v19';
const CORE = [
  './', './index.html', './offline.html', './privacidade.html',
  './styles.css', './advanced.css', './reference.css', './compare.css', './portfolio-projetos.css', './finish.css', './lab.css', './lab-experience.css', './lab-experience.html', './studio.css', './studio-preview.css', './studio-preview.html', './script.js', './advanced.js', './portfolio.js', './lab.js', './lab-data.js', './lab-fixtures.js', './lab-experience.js', './studio.js', './studio-data.js', './studio-colors.js', './studio-preview.js', './portfolio-projects.json', './public/portfolio/relatorio.json', './manifest.webmanifest',
  './assets/logo-tr.webp', './assets/logo-symbol-transparent.webp', './assets/hero-scene-v2.webp', './assets/compare-building.webp', './assets/lab-architecture.webp', './assets/lab-chair.webp', './assets/lab-repair.webp', './assets/nova-side-table.webp', './assets/nova-ceramic-lamp.webp',
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
  if ((url.pathname === '/lab-experience.html' || url.pathname === '/studio-preview.html') && request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./' + url.pathname.slice(1))));
    return;
  }
  if (url.search) return;
  if (request.mode === 'navigate') {
    const allowedPages = new Set(['/', '/index.html', '/privacidade.html', '/offline.html']);
    if (!allowedPages.has(url.pathname)) return;
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
  if (!CORE.some(path => new URL(path, self.registration.scope).pathname === url.pathname) && !url.pathname.startsWith('/assets/studio/')) return;
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
