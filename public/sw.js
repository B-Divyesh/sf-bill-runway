const VERSION = 'bill-runway-v8';
const SHELL = ['/', '/index.html', '/offline.html', '/manifest.webmanifest', '/icons/icon.svg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon-maskable-512.png', '/art/runway-hero-720.webp', '/art/runway-hero-1200.webp', '/art/social-card.webp'];

async function cacheFresh(cache, url) {
  const response = await fetch(new Request(url, { cache: 'reload' }));
  if (!response.ok) throw new Error(`Could not precache ${url}`);
  await cache.put(url, response);
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    await Promise.all(SHELL.map(url => cacheFresh(cache, url)));
    try {
      const html = await (await cache.match('/index.html')).text();
      const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
      await Promise.all(assets.map(url => cacheFresh(cache, url)));
    } catch {}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then(response => { const copy=response.clone(); caches.open(VERSION).then(cache=>cache.put(request,copy)); return response; }).catch(async () => (await caches.match(request)) || (await caches.match('/index.html')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => { if (response.ok) { const copy=response.clone(); caches.open(VERSION).then(cache=>cache.put(request,copy)); } return response; })));
});
