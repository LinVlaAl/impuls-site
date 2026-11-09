var CACHE = 'impul-v1';

self.addEventListener('install', function (e) { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(e.request).then(function (hit) {
        var net = fetch(e.request).then(function (res) {
          if (res && res.ok && (url.pathname === '/' || url.pathname.endsWith('.html') || url.pathname.indexOf('/brochures/') === 0 || url.pathname.indexOf('/icon-') === 0)) {
            c.put(e.request, res.clone());
          }
          return res;
        }).catch(function () { return null; });

        if (hit) { net.catch(function () {}); return hit; }
        return net.then(function (res) { return res || Response.error(); });
      });
    })
  );
});
