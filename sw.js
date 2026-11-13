// 오프라인 실행용: 같은 사이트의 파일만 저장해 두고, 다음 접속 때 새 버전으로 갱신
const VERSION = 'ink-v1';
const SHELL = ['./', 'index.html', 'diary/', 'diary/index.html', 'shared/base.css', 'shared/core.js', 'shared/config.js', 'shared/firebase.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'fonts/pretendard.woff2', 'fonts/gowun-batang-400.woff2', 'fonts/gowun-batang-700.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.includes('/fonts/')) {           // 글꼴: 한 번 받으면 계속 사용
    e.respondWith(caches.open(VERSION).then(async c => (await c.match(req)) || fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; })));
    return;
  }
  e.respondWith(caches.open(VERSION).then(async c => {   // 나머지: 저장본을 바로 보여 주고 뒤에서 갱신
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
