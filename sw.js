const CACHE_VERSION = "v1";
const APP_CACHE = `app-shell-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;

const APP_SHELL = [
  "/",
  "/index.html",
  "/calendar.html",
  "/form.html",
  "/main.js",
  "/manifest.json",
  "/images/icons/192.png",
  "/images/icons/512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error("[SW] Install/caching failed:", err);
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== APP_CACHE && k !== DYNAMIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          return caches.open(DYNAMIC_CACHE).then((cache) => {
            try {
              cache.put(event.request, networkResponse.clone());
            } catch (e) {}
            return networkResponse;
          });
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
