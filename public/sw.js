// EduTrack Offline-First Service Worker
const CACHE_NAME = "edutrack-pwa-cache-v1";
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/learn",
  "/ncert",
  "/formulas",
  "/flashcards",
  "/community",
  "/viva",
  "/feynman",
  "/podcast",
  "/arena",
  "/skill-tree",
  "/simulations",
  "/exam-generator",
  "/manifest.json",
  "/favicon.ico"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("Pre-caching offline routes warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-First with Offline Fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback to dashboard if route not found
          if (event.request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/dashboard");
          }
        });
      })
  );
});
