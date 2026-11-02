/* Zentorum Agency service worker: pages network-first (always fresh online), versioned assets cache-first,
   and a branded /offline/ page when there is no connection. Videos, 3D models and other sites are never cached. */
const V = 'zta-2026-11-02y';
const CORE = ['/offline/', '/assets/fonts/cg.woff2', '/assets/fonts/inter.woff2', '/assets/zta-404-car-900.webp', '/assets/zta-icon-192.png'];
const PAGES = 'zta-pages', ASSETS = 'zta-assets';

self.addEventListener('install', e => {
  e.waitUntil(Promise.all([
    caches.open(V).then(c => c.addAll(CORE)),
    // the installed app opens "/": keep it ready for the very first offline launch
    caches.open(PAGES).then(c => c.add('/')).catch(() => {})
  ]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [V, PAGES, ASSETS];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

async function trim(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

async function page(e) {
  const req = e.request;
  try {
    const res = (await e.preloadResponse) || await fetch(req);
    if (res.ok && res.type === 'basic') {
      const copy = res.clone();
      e.waitUntil(caches.open(PAGES).then(c => c.put(req.url.split('#')[0].split('?')[0], copy)).then(() => trim(PAGES, 40)));
    }
    return res;
  } catch (_) {
    return (await caches.match(req.url.split('#')[0].split('?')[0], {cacheName: PAGES})) || (await caches.match('/offline/')) || Response.error();
  }
}

async function asset(e, url) {
  const get = () => fetch(e.request).then(res => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); e.waitUntil(caches.open(ASSETS).then(c => c.put(e.request, copy)).then(() => trim(ASSETS, 150))); }
    return res;
  });
  const hit = await caches.match(e.request);
  if (!hit) return get();
  // versioned files (?v=) and fonts never change: cached copy only. Other images: cached copy now, refreshed in the background.
  if (!url.search && !url.pathname.startsWith('/assets/fonts/')) e.waitUntil(get().catch(() => {}));
  return hit;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (req.mode === 'navigate') return e.respondWith(page(e));
  if (url.pathname.startsWith('/assets/') && !/\.(mp4|webm|glb|gltf|bin|ktx2)$/i.test(url.pathname) && !req.headers.has('range')) return e.respondWith(asset(e, url));
});
