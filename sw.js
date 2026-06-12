// Service worker — caches the app shell so it works offline once installed.
const CACHE = 'maa-tracker-v4';
const ASSETS = [
  'treatment_tracker.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS).catch(function(){}); }));
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  // Only handle same-origin GET; let Google APIs etc. go straight to network
  const url = new URL(e.request.url);
  if(e.request.method !== 'GET' || url.origin !== location.origin){ return; }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(resp){
        const copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy).catch(function(){}); });
        return resp;
      }).catch(function(){ return cached; });
    })
  );
});
