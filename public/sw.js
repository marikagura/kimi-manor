// Minimal service worker — caches the app shell so the PWA installs & opens offline.
// The terminal itself needs the live WS; this only makes the chrome installable/instant.
const CACHE = 'cc-gild-v3';
const SHELL = [
  './', './index.html', './boot.js', './theme.js', './mucha.js',
  './manifest.webmanifest', './icons/icon.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // never cache cross-origin (CDN xterm) or the state endpoint — network first / passthrough
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('state.sample.json') || url.search.includes('state=')) return;
  // network-first: always try the live server (so edits show), fall back to cache only offline
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
