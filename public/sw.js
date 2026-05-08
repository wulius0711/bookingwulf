const CACHE = 'gast-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  const isPortalPage = url.pathname.startsWith('/gast/');
  const isPortalApi = url.pathname.startsWith('/api/gast/');

  if (!isPortalPage && !isPortalApi) return;

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      try {
        const fresh = await fetch(e.request);
        if (fresh.ok) cache.put(e.request, fresh.clone());
        return fresh;
      } catch {
        const cached = await cache.match(e.request);
        return cached ?? new Response('Offline — bitte öffnen Sie die Seite mit einer Internetverbindung.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    })
  );
});
