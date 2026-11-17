// Service worker for the static export. scripts/build-sw.mjs fills in the file list and a version hash after `next build`.
const CACHE = 'antrenman-__VERSION__';
const FILES = __FILES__;

// Everything the app needs is downloaded on install, so every page works offline afterwards.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
// A new build means a new cache name: drop the old ones (including the pre-Next.js app's cache).
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const cached = () => caches.match(req, { ignoreSearch: true });
  // Hashed build files never change: cache first. Pages and data: network first so updates arrive, cache when offline.
  e.respondWith(
    url.pathname.includes('/_next/static/')
      ? cached().then(hit => hit || fetch(req))
      : fetch(req, { cache: 'no-cache' }).catch(() => cached().then(hit => hit || Response.error())),
  );
});
