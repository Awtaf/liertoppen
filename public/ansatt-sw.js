// Service worker for the /ansatt PWA (Telia Liertoppen ansatt-app).
//
// Deliberately minimal: it only exists to make the app installable
// ("Legg til på hjemskjerm") and caches the static app-shell assets
// (manifest + icons). It never intercepts navigations, Server Actions, or
// /api/ansatt/* requests, and it never caches the dynamic /ansatt page
// itself — showing a stale cached check-in status while offline would be
// actively misleading for a GPS-gated check-in flow that requires a live
// server round-trip anyway.

const CACHE_NAME = "ansatt-shell-v1";
const SHELL_URLS = [
  "/ansatt/manifest.webmanifest",
  "/ansatt/icon-192.png",
  "/ansatt/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !SHELL_URLS.includes(url.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
