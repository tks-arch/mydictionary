const CACHE_NAME = 'data-sort-v3';
const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './pwa.js',
  './manifest.json'
];

// インストールイベント
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// フェッチイベント
self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = new URL(request.url);
  // JSON はネットワーク優先（更新を即時反映）、オフライン時のみキャッシュにフォールバック
  if (url.pathname.endsWith('/data.json') || url.pathname.endsWith('data.json')) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(function(networkResponse) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(request, responseClone);
          });
          return networkResponse;
        })
        .catch(function() {
          return caches.match(request);
        })
    );
    return;
  }
  // それ以外は従来どおりキャッシュ優先
  event.respondWith(
    caches.match(request).then(function(response) {
      return response || fetch(request);
    })
  );
});

// アクティベートイベント
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
