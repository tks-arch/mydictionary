// グローバル設定
let cacheConfig = {
  enableCache: true,
  cacheVersion: 'v4'
};

// toggle.jsonから設定を読み込む
async function loadCacheConfig() {
  try {
    const response = await fetch('./toggle.json', { cache: 'no-store' });
    const config = await response.json();
    cacheConfig = config;
    console.log('Cache config loaded:', cacheConfig);
  } catch (error) {
    console.log('Failed to load toggle.json, using defaults:', error);
  }
}

const urlsToCache = [
  './',
  './index.html',
  './script.js',
  './pwa.js',
  './manifest.json',
  './data.json',
  './style.css'
];

// インストールイベント
self.addEventListener('install', function(event) {
  event.waitUntil(
    loadCacheConfig().then(function() {
      if (!cacheConfig.enableCache) {
        console.log('Cache disabled by toggle.json');
        return Promise.resolve();
      }
      const CACHE_NAME = 'data-sort-' + cacheConfig.cacheVersion;
      return caches.open(CACHE_NAME)
        .then(function(cache) {
          console.log('Opened cache:', CACHE_NAME);
          return cache.addAll(urlsToCache);
        });
    })
  );
  self.skipWaiting();
});

// フェッチイベント
self.addEventListener('fetch', function(event) {
  const request = event.request;
  
  event.respondWith(
    loadCacheConfig().then(function() {
      // キャッシュが無効の場合は直接ネットワークから取得
      if (!cacheConfig.enableCache) {
        return fetch(request);
      }
      
      // キャッシュが有効の場合はキャッシュ優先
      const CACHE_NAME = 'data-sort-' + cacheConfig.cacheVersion;
      return caches.match(request).then(function(response) {
        if (response) {
          return response;
        }
        return fetch(request).then(function(networkResponse) {
          // 成功したレスポンスをキャッシュに保存
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(function(cache) {
              cache.put(request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
      });
    })
  );
});

// アクティベートイベント
self.addEventListener('activate', function(event) {
  event.waitUntil(
    loadCacheConfig().then(function() {
      const CACHE_NAME = 'data-sort-' + cacheConfig.cacheVersion;
      return caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
  self.clients.claim();
});
