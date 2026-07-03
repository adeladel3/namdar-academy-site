/**
 * Service worker — minimal PWA scaffolding.
 *
 * Goals: satisfy the installability criteria (Chrome/Android needs a SW
 * that responds to `fetch`), keep shell-safe offline fallback for the
 * home and a lightweight offline page, stay out of the way for admin
 * and API traffic (always network-first so staff never see a stale
 * admin panel or cached authenticated data).
 *
 * Upgrade strategy: bump CACHE_VERSION when the shell changes; old
 * caches are cleaned on activate.
 */

const CACHE_VERSION = "namdar-v1";
const OFFLINE_URL = "/offline.html";

// Precache only lightweight shell resources. Everything else is
// fetched network-first and only cached opportunistically.
const PRECACHE_ASSETS = [
  OFFLINE_URL,
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_VERSION)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET; let POST/PATCH/etc. flow straight to network so
  // forms, mutations and auth requests are never intercepted.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Skip cross-origin + chrome-extension:// etc.
  if (url.origin !== self.location.origin) return;

  // Never cache admin, dashboard, API, or Next.js internal traffic —
  // authenticated content should always be fresh.
  if (
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    return; // default network behavior
  }

  // HTML navigations: network-first with offline fallback.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(OFFLINE_URL).then((r) => r || Response.error())
      )
    );
    return;
  }

  // Everything else (images, fonts, static chunks): stale-while-
  // revalidate keeps the UI fast while refreshing in the background.
  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(req);
      const fetchPromise = fetch(req)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(req, response.clone()).catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
