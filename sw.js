// sw.js — servicio offline básico
const CACHE_NAME = "sl-checklist-v1.0.0";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instalar: cachea los archivos básicos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activar: limpia caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// Fetch: responde desde cache y, si falta, va a la red
self.addEventListener("fetch", (event) => {
  const req = event.request;
  // Estrategia "cache first" para GET
  if (req.method === "GET") {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req).then((res) => {
            // Opcional: cachear recursos de la misma origen
            try {
              const url = new URL(req.url);
              const sameOrigin = url.origin === self.location.origin;
              if (sameOrigin) {
                const copy = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
              }
            } catch (_) {}
            return res;
          })
        );
      })
    );
  }
});
