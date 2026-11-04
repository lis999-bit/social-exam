// 버전을 올리면 새 회차가 앱에 반영됩니다.
const CACHE = "soc-exam-v23";
const CORE = ["./", "./index.html", "./history.html", "./soc_gichul.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate" || url.origin === location.origin) {
    // 앱 파일: 항상 서버에 최신본 확인(브라우저 캐시 무시), 오프라인이면 저장본
    e.respondWith(fetch(req.url, { cache: "no-cache" }).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html"))));
  } else if (url.hostname.includes("fonts.g")) {
    // 글꼴: 캐시 우선
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })));
  }
});
