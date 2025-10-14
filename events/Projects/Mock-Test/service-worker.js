const CACHE_NAME = 'sscgd-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png'
];

// Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

// Activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE_NAME) return caches.delete(k);
    })))
  );
});
