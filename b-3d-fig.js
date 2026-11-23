'use strict';
// ===== Stickman Jang 2 — 3D jangchilar: stickman tanasi, qahramon tojlari, Robot va Vertolyot =====
// Tana bo'g'imlari 2D skeletdan (B.skel) olinadi — animatsiyalar aynan 2D'dagidek qoladi.
// Yuz detallari (ko'z, niqob, qalqon) va qurollar hozircha 2D ustqatlam sifatida chiziladi (B.drawFigOverlay).
(function () {
  const G3 = B.g3; if (!G3.ok) return;
  const T = window.THREE, GY = B.GY;
  const UA = 19, FA = 19, TH = 25, SHN = 25, TOR = 34, HR = 11;
  const UP = new T.Vector3(0, 1, 0), v1 = new T.Vector3();
  const root = G3.actors, rigs = new Map();
  let frame = 0, heroSeen = -1;

  // doimiy qahramon nuri (yo'qolib-paydo bo'lganda shader qayta kompilyatsiya bo'lmasligi uchun)
  const heroLight = new T.PointLight(0xffffff, 0, 380, 1); root.add(heroLight);

  // ---------- Geometriya (umumiy, kesh) ----------
  const geo = {};
  // kapsula: 0..L oralig'ida +Y bo'ylab, ikki uchi yarim shar
  function capG(L, r) {
    const k = L.toFixed(1) + '|' + r.toFixed(2); if (geo[k]) return geo[k];
    const pts = [];
    for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i / 5 * Math.PI / 2; pts.push(new T.Vector2(r * Math.cos(a), r * Math.sin(a))); }
    for (let i = 0; i <= 5; i++) { const a = i / 5 * Math.PI / 2; pts.push(new T.Vector2(r * Math.cos(a), L + r * Math.sin(a))); }
    return (geo[k] = new T.LatheGeometry(pts, 12));
  }
  const sphG = new T.SphereGeometry(1, 18, 14), coneG = new T.ConeGeometry(1, 1, 10), torG = new T.TorusGeometry(1, .15, 8, 28),
    boxG = new T.BoxGeometry(1, 1, 1), cylG = new T.CylinderGeometry(1, 1, 1, 14);

  // ---------- Yordamchilar ----------
  const lam = (c, o) => { const m = new T.MeshLambertMaterial(Object.assign({ color: new T.Color(c), transparent: true }, o || {})); m.userData.c = c; return m; };
  const bas = (c, o) => { const m = new T.MeshBasicMaterial(Object.assign({ color: new T.Color(c), transparent: true }, o || {})); m.userData.c = c; return m; };
  // a -> b kesmasiga kapsulani joylash (koordinatalar 3D, y yuqoriga)
  function place(m, ax, ay, bx, by, z) {
    m.position.set(ax, ay, z);
    v1.set(bx - ax, by - ay, 0); const L = v1.length(); if (L < 1e-5) return;
    m.quaternion.setFromUnitVectors(UP, v1.divideScalar(L));
  }
  // konus "tikan": asosi (bx,by,bz), uchi (bx+dx, by+dy)
  function spike(m, bx, by, bz, dx, dy, wid) {
    const L = Math.hypot(dx, dy) || 1; v1.set(dx / L, dy / L, 0);
    m.scale.set(wid, L, wid); m.quaternion.setFromUnitVectors(UP, v1); m.position.set(bx + dx / 2, by + dy / 2, bz);
  }
  const mk = (g, m, parent, shadow) => { const o = new T.Mesh(g, m); if (shadow !== false) o.castShadow = true; parent.add(o); return o; };
  function setLook(r, o) {
    const fl = !!o.flash, a = o.alpha == null ? 1 : Math.max(0, Math.min(1, o.alpha));
    if (r.fl !== fl) { r.fl = fl; r.mats.forEach(m => { if (!m.userData.keep) m.color.set(fl ? '#ffffff' : m.userData.c); if (m.emissive && m.userData.em) m.emissive.set(fl ? '#ffffff' : m.userData.em); }); }
    if (r.a !== a) { r.a = a; r.mats.forEach(m => { m.opacity = a * (m.userData.op == null ? 1 : m.userData.op); }); }
  }
  function dispose(r) { root.remove(r.g); r.mats.forEach(m => m.dispose()); }

  // ---------- Qahramon toji (element belgisi) ----------
  // mahalliy koordinatalar: bosh markazi (0,0), +x — qaragan tomon, birlik = sc
  function makeCrown(H, sc, mats) {
    const g = new T.Group(), parts = [];
    const S = (col, bx, by, bz, dx, dy, wid, anim) => { const m = bas(col); mats.push(m); const o = mk(coneG, m, g, false); parts.push({ o, bx, by, bz, dx, dy, wid, anim }); return o; };
    const el = H.el;
    if (el === 'fire') for (let i = -1; i <= 1; i++) S(i === 0 ? '#ffd24a' : '#ff6a1f', i * 6, 6, 0, -.25 + i * .15, 0, 4.4, (p, t) => { p.dy = 14 + 6 * Math.sin(t * 9 + i * 2) + (i === 0 ? 8 : 0); p.dx = (-.25 + i * .15) * p.dy * .5; });
    else if (el === 'bolt') for (let i = 0; i < 4; i++) S(B.shade(H.col, -.55), -(i * 3.4 - 2), 7, (i % 2 ? 3 : -3), -1.1 * (13 - i * 1.5) * .5, 13 - i * 1.5, 3.4);
    else if (el === 'gold') for (let i = -1; i <= 1; i++) S('#fff2a8', i * 6.4, 6, 0, 0, i === 0 ? 14 : 10, 3.2);
    else if (el === 'ice') { S(H.lite, 0, 6, 0, 0, 19, 4); S('#bff7ff', -6, 5, -3, -.6 * 5.5, 11, 3); S('#bff7ff', 6, 5, 3, .6 * 5.5, 11, 3); S('#bff7ff', 0, 5, -6, 0, 9, 2.6); }
    else if (el === 'arcane') [-1, 1].forEach(s => { S(B.shade(H.col, -.45), s * 6, 6, 0, s * 9, 10, 3.4); S(B.shade(H.col, -.45), s * 11, 15, 0, s * 6, 7, 2.2); });
    else if (el === 'halo') {
      const m = bas('#fff6b0'); mats.push(m); const h = mk(torG, m, g, false); h.scale.set(11.5, 11.5, 11.5); h.rotation.x = Math.PI / 2 - .25;
      parts.push({ halo: h });
    }
    // ko'zlik (qora) — boshni o'rab turgan yupqa halqa
    if (H.band !== false) { const m = lam('#0a0a14'); mats.push(m); const b = mk(cylG, m, g, false); b.scale.set(HR * 1.03, 4.2, HR * 1.03); b.position.y = -3.4; }
    g.scale.set(sc, sc, sc);
    g.userData.upd = (t) => {
      parts.forEach(p => {
        if (p.halo) { p.halo.position.y = 21 + Math.sin(t * 2.4) * 1.4; return; }
        if (p.anim) p.anim(p, t);
        spike(p.o, p.bx, p.by, p.bz, p.dx, p.dy, p.wid);
      });
    };
    return g;
  }

  // ---------- Stickman ----------
  function makeFig(e) {
    const sc = e.sc || 1, hero = e.type === 'hero', H = hero ? (e.hd || B.HEROES.muz) : null;
    const lw = (hero ? 7.4 : 6.6) * sc / 2, tw = (hero ? 9.2 : 8.4) * sc / 2, ol = hero ? 1.5 * sc : 2.3;
    const g = new T.Group(); root.add(g);
    const mats = [];
    const mF = hero ? lam(H.col, { emissive: new T.Color(H.col), emissiveIntensity: .5 }) : lam('#1b1b28');
    const mB = hero ? lam(B.shade(H.col, -.16), { emissive: new T.Color(H.col), emissiveIntensity: .25 }) : lam('#0d0d15');
    if (hero) { mF.userData.em = H.col; mB.userData.em = H.col; }
    const mO = bas(hero ? '#05060f' : (B.rimOf(e.type) || e.col || '#e63946'), { side: T.BackSide });
    if (hero) mO.userData.op = .85;
    mats.push(mF, mB, mO);
    const cap = (L, r, m, sh) => [mk(capG(L, r), m, g, !!sh), mk(capG(L, r + ol), mO, g, false)];   // soyani faqat asosiy qismlar tashlaydi (tezlik uchun)
    const r = {
      g, mats, sc, hero, hid: hero ? H : null, z: hero ? 8 : -(((e.num || rigs.size) * 37) % 6) * 3,
      armB1: cap(UA * sc, lw, mB), armB2: cap(FA * sc, lw, mB), legB1: cap(TH * sc, lw, mB), legB2: cap(SHN * sc, lw, mB),
      torso: cap(TOR * sc, tw, mF, 1), legF1: cap(TH * sc, lw, mF, 1), legF2: cap(SHN * sc, lw, mF, 1), armF1: cap(UA * sc, lw, mF), armF2: cap(FA * sc, lw, mF),
      head: [mk(sphG, mF, g), mk(sphG, mO, g, false)]
    };
    r.head[0].scale.setScalar(HR * sc); r.head[1].scale.setScalar(HR * sc + ol);
    if (hero) { r.crown = makeCrown(H, sc, mats); g.add(r.crown); }
    return r;
  }

  // e — jangchi, P — poza (B.poseOf), o — { flash, alpha }
  G3.fig = (e, P, o) => {
    let r = rigs.get(e);
    if (r && (r.sc !== (e.sc || 1) || (r.hero && r.hid !== e.hd))) { dispose(r); rigs.delete(e); r = null; }
    if (!r) { r = makeFig(e); rigs.set(e, r); }
    r.seen = frame; r.g.visible = true;
    setLook(r, o || {});
    const lying = e.pk === 'down', S = B.skel(e, P, lying), sc = r.sc, fc = e.face;
    // yotgan / aylangan holat: hammasi son atrofida buriladi (2D'dagidek)
    let rot = 0; if (lying || e.rot) rot = e.rot != null ? e.rot : -1.5 * fc;
    const cr = Math.cos(rot), sn = Math.sin(rot);
    const X = p => S.hx + (p[0] - S.hx) * cr - (p[1] - S.hy) * sn, Y = p => GY - (S.hy + (p[0] - S.hx) * sn + (p[1] - S.hy) * cr);
    const zb = r.z, zf = zb + 5 * sc, zk = zb - 5 * sc;
    const sh = [S.sx, S.sy], hp = [S.hx, S.hy], nk = [S.nx, S.ny];
    const L = (pair, a, b, z) => { const ax = X(a), ay = Y(a), bx = X(b), by = Y(b); place(pair[0], ax, ay, bx, by, z); place(pair[1], ax, ay, bx, by, z); };
    L(r.armB1, sh, S.elbB, zk); L(r.armB2, S.elbB, S.handB, zk);
    L(r.legB1, hp, S.kneeB, zk); L(r.legB2, S.kneeB, S.footB, zk);
    L(r.torso, hp, nk, zb);
    L(r.legF1, hp, S.kneeF, zf); L(r.legF2, S.kneeF, S.footF, zf);
    L(r.armF1, sh, S.elbF, zf); L(r.armF2, S.elbF, S.handF, zf);
    const hd = [S.hdx, S.hdy], hx = X(hd), hy = Y(hd);
    r.head[0].position.set(hx, hy, zb); r.head[1].position.set(hx, hy, zb);
    if (r.crown) {
      r.crown.position.set(hx, hy, zb);
      r.crown.scale.set(sc * fc, sc, sc);
      r.crown.rotation.z = -(P[0] + P[10]) * fc - rot;
      r.crown.userData.upd(e.t || 0);
    }
    if (G3.wepUpd) G3.wepUpd(r, e, S, X, Y, zf, zk, rot, e.t || 0);
    if (r.hero) {
      heroSeen = frame;
      heroLight.color.set(r.fl ? '#ffffff' : r.hid.col);
      heroLight.intensity = 1.7 * (r.a == null ? 1 : r.a);
      heroLight.position.set(X(hp), Y(hp) + 30 * sc, zb + 60);
    }
  };

  // ---------- Robot (mech) ----------
  // mahalliy koordinatalar 2D chizmadan olingan: (lx, -ly) -> (x, y)
  function makeMech() {
    const g = new T.Group(); root.add(g);
    const mats = [], M = (c, o) => { const m = lam(c, o); mats.push(m); return m; }, Bm = (c, o) => { const m = bas(c, o); mats.push(m); return m; };
    const body = M('#5c6b82'), dark = M('#2f3a4d'), light = M('#9db0cc'), acc = M('#e63946'), ink = M('#0b0f16');
    const glass = Bm('#ff5a5f'), blink = Bm('#ff4d4d'), glow = Bm('#ffd27a', { opacity: 0, blending: T.AdditiveBlending, depthWrite: false });
    glow.userData.op = 0;
    const box = (m, w, h, d, x, y, z, p) => { const o = mk(boxG, m, p || g); o.scale.set(w, h, d); o.position.set(x, y, z); return o; };
    const legs = [-1, 1].map(s => ({ s, thigh: mk(capG(37, 8.5), s < 0 ? dark : body, g), shin: mk(capG(37, 8.5), s < 0 ? dark : body, g), knee: mk(sphG, light, g), foot: box(dark, 40, 14, 30, 0, 7, s * 20) }));
    legs.forEach(l => l.knee.scale.setScalar(9));
    const armB = new T.Group(); armB.position.set(-34, 118, -30); g.add(armB);
    place(mk(capG(38.5, 6.5), dark, armB), 0, 0, -6, -38, 0); const hb = mk(sphG, light, armB); hb.scale.setScalar(8); hb.position.set(-6, -42, 0);
    box(body, 92, 82, 70, 0, 109, 0); box(light, 86, 10, 66, 0, 146, 0); box(acc, 80, 8, 72, 0, 100, 0);
    for (let i = 0; i < 4; i++) { const rv = mk(sphG, ink, g, false); rv.scale.setScalar(3); rv.position.set(-34 + i * 22, 86, 36); }
    box(dark, 50, 34, 46, 23, 159, 0); const gl = box(glass, 34, 14, 48, 26, 161, 0); gl.castShadow = false;
    const ant = mk(cylG, ink, g); ant.scale.set(1.5, 20, 1.5); ant.position.set(26, 186, 0); const bl = mk(sphG, blink, g, false); bl.scale.setScalar(4); bl.position.set(24, 198, 0);
    const arm = new T.Group(); arm.position.set(40, 122, 30); g.add(arm);
    box(body, 66, 26, 26, 33, 0, 0, arm); const barrel = box(dark, 36, 20, 20, 80, 0, 0, arm); box(acc, 8, 27, 27, 24, 0, 0, arm);
    const gs = mk(sphG, glow, arm, false); gs.scale.setScalar(24); gs.position.set(100, 0, 0);
    return { g, mats, legs, armB, arm, barrel, gs, glass, bl, z: -10, kind: 'mech' };
  }
  function updMech(r, e, t) {
    const s = e.sc || 1, fc = e.face, walk = Math.sin(e.ph || 0);
    r.g.position.set(e.x, e.z || 0, r.z); r.g.scale.set(fc * s, s, s);
    r.legs.forEach(l => {
      const ph = l.s < 0 ? walk : -walk, ox = l.s * 22, kx = ox + ph * 10, fx = ox + ph * 18 - 4, z = l.s * 20;
      place(l.thigh, ox, 78, kx, 42, z); place(l.shin, kx, 42, fx, 8, z); l.knee.position.set(kx, 42, z + l.s * 4); l.foot.position.set(fx, 7, z);
    });
    r.armB.rotation.z = -(.2 + (e.armUp || 0));
    r.arm.rotation.z = -((e.armUp || 0) * .5 - .05 + (e.recoil || 0) * -.15);
    const bl = 36 - (e.recoil || 0) * 6; r.barrel.scale.x = bl; r.barrel.position.x = 62 + bl / 2;
    if (!r.fl) r.glass.color.set((e.st === 'wind' || e.st === 'fire') ? '#ffe066' : '#ff5a5f');
    r.gs.material.userData.op = e.glow || 0; r.gs.material.opacity = (e.glow || 0) * (r.a == null ? 1 : r.a); r.gs.visible = !!e.glow;
    r.bl.visible = Math.sin(t * 8) > 0;
  }

  // ---------- Jang vertolyoti (heli) ----------
  function makeHeli() {
    const g = new T.Group(); root.add(g);
    const mats = [], M = (c, o) => { const m = lam(c, o); mats.push(m); return m; }, Bm = (c, o) => { const m = bas(c, o); mats.push(m); return m; };
    const body = M('#3c4a3a'), dark = M('#232c22'), light = M('#6a7e66'), ink = M('#0b100a'), red = M('#e63946');
    const glass = M('#4aa3d6', { emissive: new T.Color('#1d5d86'), emissiveIntensity: .6 }); glass.userData.em = '#1d5d86';
    const flash = Bm('#ffe066', { blending: T.AdditiveBlending, depthWrite: false }), blink = Bm('#ff3b3b');
    const sph = (m, sx, sy, sz, x, y, z, p) => { const o = mk(sphG, m, p || g); o.scale.set(sx, sy, sz); o.position.set(x, y, z); return o; };
    const box = (m, w, h, d, x, y, z, p) => { const o = mk(boxG, m, p || g); o.scale.set(w, h, d); o.position.set(x, y, z); return o; };
    sph(body, 70, 38, 40, 0, 64, 0); sph(glass, 34, 25, 34, 30, 72, 0); sph(light, 40, 8, 38, -6, 92, 0);
    box(red, 40, 6, 80, -10, 57, 0);
    place(mk(capG(82, 7), body, g), -50, 70, -130, 82, 0); box(body, 22, 26, 5, -128, 90, 0);
    const tr = new T.Group(); tr.position.set(-128, 84, 8); g.add(tr); box(ink, 30, 4, 2, 0, 0, 0, tr); box(ink, 4, 30, 2, 0, 0, 0, tr);
    [-1, 1].forEach(s => {
      const sk = mk(cylG, ink, g); sk.scale.set(2.5, 108, 2.5); sk.rotation.z = Math.PI / 2; sk.position.set(0, 12, s * 26);
      place(mk(capG(16, 2), ink, g), -30, 30, -34, 13, s * 26); place(mk(capG(16, 2), ink, g), 30, 30, 34, 13, s * 26);
    });
    place(mk(capG(32, 4.5), dark, g), 52, 40, 84, 34, 18);
    const mz = sph(flash, 14, 14, 14, 90, 34, 18); mz.castShadow = false;
    const mast = mk(cylG, ink, g); mast.scale.set(3.4, 12, 3.4); mast.position.set(0, 104, 0);
    const rotor = new T.Group(); rotor.position.set(0, 110, 0); g.add(rotor);
    box(ink, 300, 2, 11, 0, 0, 0, rotor); box(ink, 11, 2, 300, 0, 0, 0, rotor);
    const bl = sph(blink, 3.4, 3.4, 3.4, -4, 100, 20); bl.castShadow = false;
    return { g, mats, tr, rotor, mz, bl, z: -20, kind: 'heli' };
  }
  function updHeli(r, e, t) {
    r.g.position.set(e.x, e.z || 0, r.z); r.g.scale.set(e.face, 1, 1); r.g.rotation.z = -(e.tilt || 0) * .12;
    r.rotor.rotation.y = t * 26; r.tr.rotation.z = t * 30;
    r.mz.visible = !!e.muzzle; r.bl.visible = Math.sin(t * 6) > 0;
  }

  // e — jangari boss (pk: 'mech' | 'heli')
  G3.boss = (e, t, flash, alpha) => {
    let r = rigs.get(e);
    if (!r) { r = e.pk === 'heli' ? makeHeli() : makeMech(); rigs.set(e, r); }
    r.seen = frame; r.g.visible = true;
    setLook(r, { flash, alpha });
    if (r.kind === 'heli') updHeli(r, e, t); else updMech(r, e, t);
  };

  // ---------- Yashik va bochka ----------
  const texC = {};
  function tex(k, draw) {
    if (texC[k]) return texC[k];
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; draw(cv.getContext('2d'));
    const t = new T.CanvasTexture(cv); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return (texC[k] = t);
  }
  const crateTex = () => tex('crate', c => {
    c.fillStyle = '#c58b4e'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#a06b36'; c.fillRect(0, 0, 128, 20); c.fillRect(0, 108, 128, 20);
    c.strokeStyle = '#6b4423'; c.lineWidth = 13; c.beginPath(); c.moveTo(10, 10); c.lineTo(118, 118); c.moveTo(118, 10); c.lineTo(10, 118); c.stroke();
    c.strokeStyle = '#4a2c12'; c.lineWidth = 8; c.strokeRect(4, 4, 120, 120);
    c.fillStyle = '#d0d6dc'; [[4, 4], [106, 4], [4, 106], [106, 106]].forEach(p => c.fillRect(p[0], p[1], 18, 18));
  });
  const barrelTex = () => tex('barrel', c => {
    c.fillStyle = '#c0392b'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#ffd23f'; c.fillRect(0, 42, 128, 26); c.fillStyle = '#111';
    for (let i = -16; i < 128; i += 32) { c.beginPath(); c.moveTo(i, 42); c.lineTo(i + 16, 42); c.lineTo(i + 32, 68); c.lineTo(i + 16, 68); c.fill(); }
    c.fillStyle = '#7a1f1a'; c.fillRect(0, 0, 128, 6); c.fillRect(0, 122, 128, 6);
  });
  function makeCrate(cr) {
    const g = new T.Group(); root.add(g);
    let m, o;
    if (cr.k === 'crate') { m = lam('#ffffff', { map: crateTex() }); o = mk(boxG, m, g); o.scale.set(56, 56, 56); o.position.y = 28; }
    else { m = lam('#ffffff', { map: barrelTex() }); o = mk(new T.CylinderGeometry(24, 24, 60, 20), m, g); o.position.y = 30; }
    o.receiveShadow = true;
    return { g, mats: [m], z: -32, kind: 'crate' };
  }
  G3.crate = cr => {
    let r = rigs.get(cr); if (!r) { r = makeCrate(cr); rigs.set(cr, r); }
    r.seen = frame; r.g.visible = true;
    r.g.position.set(cr.x + (cr.sh > 0 ? (Math.random() * 4 - 2) : 0), 0, r.z);
  };

  // kadr oxiri: ko'rinmagan jangchilarni yashirish, uzoq vaqt ko'rinmaganlarini o'chirish
  G3.actorsEnd = () => {
    for (const [e, r] of rigs) if (r.seen !== frame) { r.g.visible = false; if (frame - r.seen > 240 || e.gone) { dispose(r); rigs.delete(e); } }
    if (heroSeen !== frame) heroLight.intensity = 0;
    frame++;
  };
  G3.actorsClear = () => { for (const [, r] of rigs) dispose(r); rigs.clear(); heroLight.intensity = 0; };
})();
