const CACHE_NAME = 'data-sort-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/data.json',
  '/manifest.json'
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
});

// フェッチイベント
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュがある場合はそれを返す
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
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
});
