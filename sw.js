// Network first (so updates show up when online), cache fallback (so it works offline).
const CACHE = 'antrenman';
const PICS = 'leg-press cs-row chest-press lat-pulldown leg-curl lateral-raise biceps-curl dead-bug box-squat cable-row incline-press glute-bridge face-pull triceps-pushdown hammer-curl cat-cow';
const SHELL = ['./', 'index.html', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png',
  ...PICS.split(' ').flatMap(id => [`img/${id}-0.jpg`, `img/${id}-1.jpg`])];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }) // always revalidate, so edits show up on next open
      .then(res => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
