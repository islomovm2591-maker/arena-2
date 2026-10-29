// Stickman Jang 2 — offline kesh (service worker)
// Har yangi versiyada VER ni oshiring — shunda telefon yangi fayllarni oladi.
// Kesh nomi "sj2-" bilan boshlanadi: eski "Arena" o'yinining keshiga tegmaydi.
const VER = 'sj2-v1';
const FILES = ['./', 'index.html', 'b-style.css', 'b-core.js', 'b-art.js', 'b-hero.js', 'b-game.js', 'b-net.js', 'b-config.js', 'b-ui.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'icon-180.png', 'icon-maskable-512.png'];
// har bir fayl alohida yuklanadi: bittasi xato bersa ham qolganlari saqlanadi
async function precache() {
  const c = await caches.open(VER), bad = [];
  await Promise.all(FILES.map(async f => {
    try { const r = await fetch(new Request(f, { cache: 'reload' })); if (!r.ok) throw new Error(r.status); await c.put(f, r); } catch (_) { bad.push(f); }
  }));
  await c.put(new URL('__status', self.registration.scope).href, new Response(JSON.stringify({ ok: !bad.length, bad })));
  return !bad.length;
}
self.addEventListener('install', e => { e.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sj2-') && k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// sahifa «offline tayyor emas» holatida qolsa — qayta yuklashni so'raydi
self.addEventListener('message', e => { if (e.data && e.data.type === 'precache') e.waitUntil(precache()); });
// Avval keshdan beradi (internetsiz ishlaydi), fonda yangisini yuklab qo'yadi
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(VER);
    let hit = await c.match(r, { ignoreSearch: true });
    if (!hit && r.mode === 'navigate') hit = await c.match('index.html');
    const net = fetch(r).then(res => { if (res && res.ok && res.type === 'basic') c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline', { status: 503 });
  })());
});
