'use strict';
// ===== Stickman Jang — onlayn qatlam (reyting, bulutga saqlash, kunlik bonus) =====
// Muhim: bu qism ixtiyoriy. Internet yo'q bo'lsa yoki server manzili yozilmagan bo'lsa — o'yin odatdagidek ishlaydi.
(function () {
  const AK = 'sj2_acc_v1', NK = 'sj2_net_v1';
  const cfg = String((window.BCFG && window.BCFG.API) || '').trim();
  const API = /^https?:\/\/[^\s]+$/i.test(cfg) && !/USERNAME/i.test(cfg) ? cfg.replace(/\/+$/, '') : '';
  const rd = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  const N = B.net = {
    api: API,
    acc: rd(AK, null),                                            // {id, token, name}
    meta: Object.assign({ rev: 0, dirty: 0, pend: null }, rd(NK, {})),
    busy: false, gen: 0, status: API ? 'idle' : 'off',                    // off | idle | ok | auth | net
    daily: null, onChange: null, onDaily: null
  };
  N.enabled = () => !!API;
  const saveAcc = () => wr(AK, N.acc), saveMeta = () => wr(NK, N.meta);
  const A = () => ({ id: N.acc.id, token: N.acc.token });
  const online = () => navigator.onLine !== false;

  async function req(path, data, get) {
    if (!API) return { ok: false, err: 'off' };
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const to = setTimeout(() => { try { ctl && ctl.abort(); } catch (e) { } }, 9000);
    try {
      const r = await fetch(API + path, get ? { signal: ctl && ctl.signal, cache: 'no-store' } :
        { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(data || {}), signal: ctl && ctl.signal, cache: 'no-store' });
      const j = await r.json().catch(() => null);
      if (!j || typeof j !== 'object') { N.status = 'net'; return { ok: false, err: 'net' }; }
      j.status = r.status;
      if (r.status === 401) N.status = 'auth'; else if (N.status === 'net' || N.status === 'idle') N.status = 'ok';
      return j;
    } catch (e) { N.status = 'net'; return { ok: false, err: 'net' }; }
    finally { clearTimeout(to); }
  }
  N.req = req;

  // ---------- hisob ----------
  N.register = async name => {
    const r = await req('/api/register', { name });
    if (r.ok) { N.acc = { id: r.id, token: r.token, name: r.name }; saveAcc(); N.meta.rev = 0; N.meta.dirty = 1; saveMeta(); N.status = 'ok'; N.flush(); N.sync(true); }
    return r;
  };
  N.useCode = async code => {
    const r = await req('/api/link/use', { code });
    if (r.ok) { N.acc = { id: r.id, token: r.token, name: r.name }; saveAcc(); N.meta.rev = 0; N.meta.dirty = 0; saveMeta(); N.status = 'ok'; await N.sync(true); }
    return r;
  };
  N.newCode = () => N.acc ? req('/api/link/new', A()) : Promise.resolve({ ok: false, err: 'noacc' });
  N.rename = async name => {
    if (!N.acc) return { ok: false, err: 'noacc' };
    const r = await req('/api/rename', Object.assign(A(), { name }));
    if (r.ok) { N.acc.name = r.name; saveAcc(); }
    return r;
  };
  N.logout = () => { N.acc = null; N.meta = { rev: 0, dirty: 0, pend: null }; try { localStorage.removeItem(AK); } catch (e) { } saveMeta(); N.status = API ? 'idle' : 'off'; N.daily = null; };

  // ---------- reyting ----------
  // natijani navbatga qo'yadi (eng yaxshisini saqlaydi) va yuborishga urinadi
  N.submit = async r => {
    if (!API || !r || !r.wave) return { ok: false, err: 'off' };
    const p = { wave: r.wave, score: Math.max(0, Math.round(r.score || 0)), kills: r.kills || 0, time: Math.max(1, Math.round(r.time || 1)) };
    const q = N.meta.pend;
    if (!q || p.wave > q.wave || (p.wave === q.wave && p.score > q.score)) { N.meta.pend = p; saveMeta(); }
    return N.flush();
  };
  N.flush = async () => {
    const q = N.meta.pend;
    if (!API || !N.acc || !q || !online()) return { ok: false, err: q ? 'wait' : 'none' };
    const r = await req('/api/score', Object.assign(A(), { mode: 'endless' }, q));
    if (r.ok || r.err === 'implausible' || r.err === 'bad_score' || r.err === 'mode') { N.meta.pend = null; saveMeta(); }
    else if (r.err === 'cooldown') setTimeout(() => N.flush(), 13000);
    return r;
  };
  N.top = () => req('/api/top?mode=endless&limit=30' + (N.acc ? '&id=' + encodeURIComponent(N.acc.id) : ''), null, true);

  // ---------- kunlik bonus ----------
  N.checkDaily = async () => {
    if (!API || !N.acc || !online()) return null;
    const r = await req('/api/daily', Object.assign(A(), { claim: false }));
    if (r.ok) { N.daily = r; N.onDaily && N.onDaily(r); }
    return r;
  };
  N.claimDaily = async () => {
    if (!N.acc) return { ok: false, err: 'noacc' };
    const r = await req('/api/daily', Object.assign(A(), { claim: true }));
    if (r.ok && r.claimed) {
      const s = B.S0; s.coins += r.reward.coins; s.gems += r.reward.gems; B.persist();
      N.daily = Object.assign({}, r, { can_claim: false }); N.onDaily && N.onDaily(N.daily);
    }
    return r;
  };

  // ---------- bulutga saqlash ----------
  const sum = o => Object.keys(o || {}).reduce((x, k) => x + (+o[k] || 0), 0);
  const prog = s => (s.unl || 1) * 1000 + sum(s.wl) * 60 + sum(s.stars) * 25 + ((s.best || {}).endless || 0) * 12 + ((s.hpL || 0) + (s.mpL || 0)) * 40 + Object.keys(s.own || {}).length * 80 + Object.keys(s.heroOwn || {}).length * 150;
  const maxMap = (a, b) => { const o = {}; Object.keys(Object.assign({}, a, b)).forEach(k => { o[k] = Math.max(+(a || {})[k] || 0, +(b || {})[k] || 0); }); return o; };
  // yutuqlar (qurol, daraja, yulduz, rekord) hech qachon yo'qolmaydi; tanga/olmos — "ilgarilab ketgan" saqlashdan olinadi
  N.merge = (loc, rem) => {
    const base = prog(loc) > prog(rem) ? loc : rem, oth = base === loc ? rem : loc;
    const m = JSON.parse(JSON.stringify(base));
    m.own = Object.assign({}, oth.own || {}, base.own || {});
    m.heroOwn = Object.assign({ muz: 1 }, oth.heroOwn || {}, base.heroOwn || {}); if (!m.heroOwn[m.hero]) m.hero = 'muz';
    m.wl = maxMap(loc.wl, rem.wl); m.stars = maxMap(loc.stars, rem.stars);
    m.unl = Math.max(loc.unl || 1, rem.unl || 1); m.hpL = Math.max(loc.hpL || 0, rem.hpL || 0); m.mpL = Math.max(loc.mpL || 0, rem.mpL || 0);
    m.best = Object.assign({}, base.best || {}, { endless: Math.max((loc.best || {}).endless || 0, (rem.best || {}).endless || 0) });
    Object.keys(m.own).forEach(k => { if (!m.wl[k]) m.wl[k] = 1; });
    if (!m.own[m.eq]) m.eq = 'pipe';
    return m;
  };
  const pack = () => { const o = JSON.parse(JSON.stringify(B.S0)); delete o.set; return o; };
  const apply = m => {
    const d = B.defSave(), s = B.S0;
    Object.keys(d).forEach(k => { if (k === 'set') return; s[k] = m[k] != null ? m[k] : d[k]; });
    B.persistLocal();
  };
  let tmr = 0;
  N.schedule = ms => { clearTimeout(tmr); if (API && N.acc) tmr = setTimeout(() => N.sync(), ms || 5000); };
  N.sync = async force => {
    if (!API || !N.acc || !online()) return { ok: false };
    if (N.busy) { N.schedule(2000); return { ok: false, err: 'busy' }; }
    if (B.isPlaying() && !force) { N.schedule(9000); return { ok: false, err: 'playing' }; }
    N.busy = true; let changed = false; const g0 = N.gen;
    try {
      await N.flush();
      const L = await req('/api/load', A());
      if (!L.ok) return L;
      const remote = L.data;
      if (remote && L.rev > N.meta.rev) { apply(N.merge(B.S0, remote)); N.meta.dirty = 1; N.gen++; changed = true; }
      N.meta.rev = L.rev;
      if (N.meta.dirty || !remote) {
        for (let i = 0; i < 2; i++) {
          const r = await req('/api/save', Object.assign(A(), { rev: N.meta.rev, data: pack() }));
          if (r.ok) { N.meta.rev = r.rev; N.meta.dirty = N.gen === g0 ? 0 : 1; break; }
          if (r.err === 'conflict') { if (r.data) { apply(N.merge(B.S0, r.data)); N.gen++; changed = true; } N.meta.rev = r.rev; continue; }
          break;
        }
      }
      saveMeta();
      return { ok: true, changed };
    } finally { N.busy = false; if (N.meta.dirty && N.acc) N.schedule(4000); if (changed && N.onChange) N.onChange(); }
  };
  N.cloudState = () => !API ? 'off' : !N.acc ? 'noacc' : N.status === 'auth' ? 'auth' : N.busy ? 'busy' : N.meta.dirty ? 'dirty' : N.status === 'net' ? 'net' : 'ok';

  // ---------- B.persist ga ulanish ----------
  const basePersist = B.persist;
  B.persistLocal = basePersist;
  B.persist = () => { basePersist(); if (API && N.acc) { N.meta.dirty = 1; N.gen++; saveMeta(); N.schedule(5000); } };
  addEventListener('online', () => { if (N.acc) { N.flush(); N.sync(); N.checkDaily(); } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && N.acc && !N.busy) N.schedule(1500); });
  // o'yin ochilganda: kutilayotgan natijalarni yuborish, buluttan yangilash, kunlik bonusni tekshirish
  N.boot = () => { if (!API || !N.acc) return; setTimeout(async () => { await N.sync(); N.checkDaily(); }, 900); };
})();
