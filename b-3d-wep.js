'use strict';
// ===== Stickman Jang 2 — 3D qurollar va effektlar =====
// Qurol mahalliy koordinatalari 2D chizma bilan bir xil: +x — tig' yo'nalishi (qo'ldan), y — 2D'dagi -y.
// Tig'lar 2D chizmadagi shakldan ekstruziya qilinadi — siluet aynan avvalgidek.
(function () {
  const G3 = B.g3; if (!G3.ok) return;
  const T = window.THREE, GY = B.GY;
  const root = G3.actors;

  // ---------- Materiallar (umumiy) ----------
  const MC = {};
  const lam = (c, o) => { const k = 'l' + c + (o ? JSON.stringify(o) : ''); return MC[k] || (MC[k] = new T.MeshLambertMaterial(Object.assign({ color: new T.Color(c) }, o || {}))); };
  const std = (c, metal, rough, o) => { const k = 's' + c + metal + rough + (o ? JSON.stringify(o) : ''); return MC[k] || (MC[k] = new T.MeshStandardMaterial(Object.assign({ color: new T.Color(c), metalness: metal, roughness: rough }, o || {}))); };
  const glow = (c, op) => { const k = 'g' + c + op; return MC[k] || (MC[k] = new T.MeshBasicMaterial({ color: new T.Color(c), transparent: true, opacity: op == null ? 1 : op, blending: T.AdditiveBlending, depthWrite: false })); };
  const steel = c => std(c || '#dfe7f0', .75, .28), wood = c => lam(c || '#8a5a2b');

  // ---------- Geometriya ----------
  const GC = {};
  const cylG = new T.CylinderGeometry(1, 1, 1, 12), sphG = new T.SphereGeometry(1, 14, 10), boxG = new T.BoxGeometry(1, 1, 1), coneG = new T.ConeGeometry(1, 1, 8);
  const mesh = (g, geo, m, shadow) => { const o = new T.Mesh(geo, m); o.castShadow = shadow !== false; g.add(o); return o; };
  // x0..x1 oralig'ida x o'qi bo'ylab tayoq
  const rod = (g, x0, x1, r, m) => { const o = mesh(g, cylG, m); o.rotation.z = Math.PI / 2; o.scale.set(r, x1 - x0, r); o.position.x = (x0 + x1) / 2; return o; };
  const ball = (g, x, y, sx, sy, sz, m) => { const o = mesh(g, sphG, m); o.position.set(x, y, 0); o.scale.set(sx, sy, sz); return o; };
  const cube = (g, x, y, w, h, d, m) => { const o = mesh(g, boxG, m); o.position.set(x, y, 0); o.scale.set(w, h, d); return o; };
  // 2D yo'ldan (y pastga) qalin shakl: cmds = [['m',x,y],['l',x,y],['q',cx,cy,x,y]]
  function ext(key, cmds, depth, bevel) {
    if (GC[key]) return GC[key];
    const s = new T.Shape();
    cmds.forEach(c => { if (c[0] === 'm') s.moveTo(c[1], -c[2]); else if (c[0] === 'l') s.lineTo(c[1], -c[2]); else s.quadraticCurveTo(c[1], -c[2], c[3], -c[4]); });
    const b = bevel == null ? Math.min(1.2, depth * .4) : bevel;
    const g = new T.ExtrudeGeometry(s, { depth, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b * .8, bevelSegments: 2, curveSegments: 10 });
    g.translate(0, 0, -depth / 2); return (GC[key] = g);
  }
  const blade = (g, key, cmds, depth, m, bevel) => mesh(g, ext(key, cmds, depth, bevel), m);

  // ---------- Qurollar ----------
  const WB = {
    pipe(g, L) { rod(g, -12, L, 3.3, steel('#8d97a3')); rod(g, -10, 16, 3.8, lam('#d62839')); rod(g, L - 4, L, 5, lam('#1d2128')); },
    katana(g, L) {
      rod(g, -14, 20, 2.9, lam('#243a6b')); ball(g, 21, 0, 3.5, 9, 9, std('#e6b800', .8, .35));
      blade(g, 'katana' + L, [['m', 23, -3.8], ['l', L - 14, -5], ['q', L - 4, -4, L + 2, 1.5], ['l', L - 12, 3.4], ['l', 23, 3.4]], 1.4, steel());
    },
    axe(g, L) {
      rod(g, -14, L, 3, wood());
      blade(g, 'axe' + L, [['m', L - 30, -3], ['l', L - 38, -34], ['q', L + 6, -48, L + 14, -8], ['l', L + 8, 3], ['l', L - 28, 4]], 3.4, steel('#b7c2cf'));
      blade(g, 'axeb' + L, [['m', L - 28, 4], ['l', L - 46, 12], ['l', L - 26, -3]], 2.6, steel('#6b7684'));
    },
    hammer(g, L) {
      rod(g, -14, L, 3, wood('#7b4d25')); rod(g, -10, 18, 3.4, lam('#d62839'));
      cube(g, L - 4, 0, 44, 52, 34, steel('#9aa6b4')); cube(g, L - 4, 0, 45, 10, 35, lam('#d62839'));
    },
    dual(g, L) {
      rod(g, -8, 8, 2.4, lam('#ff9f1c')); cube(g, 8.5, 0, 3, 12, 6, lam('#444444'));
      blade(g, 'dual' + L, [['m', 10, -3.5], ['l', L - 10, -4.5], ['q', L + 2, -3, L + 6, 4], ['l', L - 8, 3], ['l', 10, 3.5]], 1.2, steel('#cfefff'));
    },
    spear(g, L) {
      rod(g, -30, L - 20, 2.5, wood('#a9743c')); rod(g, -6, 24, 3, lam('#d62839'));
      blade(g, 'speart' + L, [['m', L - 28, 0], ['l', L - 40, -14], ['l', L - 22, -4]], 1.6, lam('#e63946'));
      blade(g, 'spear' + L, [['m', L - 24, -2.6], ['q', L - 12, -13, L + 14, 0], ['q', L - 12, 13, L - 24, 2.6]], 2.6, steel());
    },
    plasma(g, L) {
      rod(g, -12, 18, 2.9, lam('#2d3b4a')); cube(g, 18.5, 0, 3, 16, 7, glow('#38f2ff'));
      rod(g, 20, L - 2, 2, new T.MeshBasicMaterial({ color: '#ffffff' }));
      const a = rod(g, 20, L, 4.6, glow('#78ffff', .55)), b = rod(g, 20, L, 8.5, glow('#38f2ff', .22)); a.castShadow = b.castShadow = false;
      return t => { const p = .85 + Math.sin(t * 14) * .15; b.scale.x = b.scale.z = 8.5 * p; };
    },
    great(g, L) {
      rod(g, -16, 18, 3.3, lam('#5a2a1a')); ball(g, -19, 0, 6, 6, 6, std('#d6a419', .8, .35));
      cube(g, 21, 0, 8, 34, 10, std('#e6b800', .8, .35)); ball(g, 21, 17, 3.4, 3.4, 3.4, lam('#d62839')); ball(g, 21, -17, 3.4, 3.4, 3.4, lam('#d62839'));
      blade(g, 'great' + L, [['m', 25, -9], ['l', L - 32, -10], ['l', L + 4, 0], ['l', L - 32, 10], ['l', 25, 9]], 3, steel('#d6defa'));
    },
    scythe(g, L) {
      rod(g, -26, L - 16, 2.7, lam('#6a4a7a')); ball(g, L - 16, 0, 5, 5, 5, lam('#caa7e8'));
      const m = std('#cdb4ee', .6, .3, { emissive: '#6a3fa0', emissiveIntensity: .5 });
      blade(g, 'scythe' + L, [['m', L - 30, -3], ['q', L - 26, -62, L + 34, -70], ['q', L + 2, -46, L - 8, -2]], 2, m);
      return t => { m.emissiveIntensity = .45 + .3 * Math.sin(t * 9); };
    },
    flame(g, L) {
      rod(g, -14, 20, 2.8, lam('#a3200f')); ball(g, 21, 0, 3.6, 10, 10, std('#ffb703', .7, .4));
      blade(g, 'flame' + L, [['m', 24, -4], ['l', L - 14, -5.5], ['q', L - 4, -4.5, L + 3, 1.5], ['l', L - 12, 4], ['l', 24, 4]], 1.6, std('#ffb03a', .4, .4, { emissive: '#e03a00', emissiveIntensity: .7 }));
      const fl = [];
      for (let i = 0; i < 6; i++) { const o = mesh(g, coneG, glow(i % 2 ? '#ffeb8c' : '#ff8c1e', .8), false); o.position.x = 34 + i * (L - 46) / 5; fl.push(o); }
      return t => fl.forEach((o, i) => { const h = 13 + 8 * Math.sin(t * 15 + i * 1.9) + (i % 2) * 4; o.scale.set(6, h, 6); o.position.y = 3 + h / 2; o.position.z = Math.sin(t * 11 + i) * 2; });
    },
    club(g, L) {
      const k = 'club' + L;
      if (!GC[k]) {
        const p = [[0, -6], [3.5, -6], [7, L - 36], [12, L - 22], [15, L - 8], [12, L + 2], [5, L + 7], [0, L + 8]].map(q => new T.Vector2(q[0], q[1]));
        GC[k] = new T.LatheGeometry(p, 14);
      }
      const o = mesh(g, GC[k], lam('#7a4a22')); o.rotation.z = -Math.PI / 2;
      const sp = steel('#c9d1db');
      [[L - 30, 1, 0], [L - 12, 1, 0], [L - 12, -1, 0], [L - 30, -1, 0], [L - 20, 0, 1], [L - 20, 0, -1]].forEach(q => {
        const c = mesh(g, coneG, sp); const r = q[0] > L - 20 ? 15 : 9; c.scale.set(2.6, 8, 2.6);
        const v = new T.Vector3(0, q[1], q[2]).normalize(); c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v); c.position.set(q[0], q[1] * (r + 3), q[2] * (r + 3));
      });
      const tip = mesh(g, coneG, sp); tip.scale.set(2.6, 8, 2.6); tip.rotation.z = -Math.PI / 2; tip.position.x = L + 11;
    },
    knife(g, L) { rod(g, -8, 0, 2, lam('#3a2a1a')); blade(g, 'knife' + L, [['m', 0, -2], ['l', L, 0], ['l', 0, 2.5]], .8, steel('#cfd8e3'), .3); },
    bow(g) {
      const wm = lam('#a9743c');
      const arc = mesh(g, GC.bow || (GC.bow = new T.TorusGeometry(30, 1.9, 6, 24, 2.4)), wm); arc.position.x = -10; arc.rotation.z = -1.2;
      const sm = new T.MeshBasicMaterial({ color: '#eeeeee' });
      const s1 = mesh(g, cylG, sm, false), s2 = mesh(g, cylG, sm, false), ar = new T.Group(); g.add(ar);
      rod(ar, 0, 34, 1, lam('#dddddd')); const hd = mesh(ar, coneG, lam('#dddddd')); hd.rotation.z = -Math.PI / 2; hd.scale.set(4, 8, 4); hd.position.x = 36;
      const px = -10 + Math.cos(1.2) * 30, py = Math.sin(1.2) * 30, up = new T.Vector3(0, 1, 0), v = new T.Vector3();
      const str = (o, ax, ay, bx, by) => { v.set(bx - ax, by - ay, 0); const l = v.length(); o.scale.set(.65, l, .65); o.quaternion.setFromUnitVectors(up, v.divideScalar(l)); o.position.set((ax + bx) / 2, (ay + by) / 2, 0); };
      return (t, f) => {
        const aim = f.pk === 'arch', pull = aim ? -16 : 0;
        str(s1, px, py, pull + 2, 0); str(s2, px, -py, pull + 2, 0);
        ar.visible = aim; ar.position.x = pull + 2;
      };
    }
  };
  const wlen = wk => wk === 'club' ? 96 : wk === 'knife' ? 28 : (B.W[wk] ? B.W[wk].len : 60);
  function makeWep(wk) {
    const g = new T.Group(), L = wlen(wk);
    const upd = (WB[wk] || WB.pipe)(g, L);
    g.userData.upd = upd || null; g.userData.wk = wk;
    return g;
  }

  // jangchi qurolini 3D qo'lga joylash (b-3d-fig.js chaqiradi)
  // pt — 2D nuqtani 3D'ga o'tkazuvchi (aylantirish hisobga olingan), rot — yotish burchagi
  G3.wepUpd = (r, f, S, X, Y, zf, zk, rot, t) => {
    const wk = f.pk === 'down' ? null : f.wep;
    const want = wk || null;
    if ((r.wf && r.wf.userData.wk) !== want) {
      if (r.wf) r.g.remove(r.wf); r.wf = null;
      if (want) { r.wf = makeWep(want); r.g.add(r.wf); }
    }
    const wantB = wk === 'dual' ? 'dual' : null;
    if ((r.wb && r.wb.userData.wk) !== wantB) {
      if (r.wb) r.g.remove(r.wb); r.wb = null;
      if (wantB) { r.wb = makeWep('dual'); r.g.add(r.wb); }
    }
    const hero = f.type === 'hero', fc = f.face;
    const place = (w, hand, dir, z, k) => {
      w.position.set(X(hand), Y(hand), z);
      w.rotation.z = -(Math.atan2(dir[1], dir[0]) + rot);
      const s = f.sc * k * (f.wscale || 1); w.scale.set(s, fc < 0 ? -s : s, s);
      if (w.userData.upd) w.userData.upd(t, f);
    };
    if (r.wf) place(r.wf, S.handF, S.wd, zf + 3, hero ? 1 : .92);
    if (r.wb) place(r.wb, S.handB, S.wdb, zk - 3, .95);
  };

  // ---------- Effektlar ----------
  // Yorug'lik chaqnashlari: doimiy 3 ta nur (shader qayta kompilyatsiyasiz), navbat bilan ishlatiladi
  const flashes = [0, 1, 2].map(() => { const l = new T.PointLight(0xffffff, 0, 500, 1); root.add(l); return { l, t: 1, life: 1, p: 0 }; });
  let fi = 0;
  G3.flash = (x, y, col, power, rad, life) => {
    if (!G3.Q().lights) return;
    const f = flashes[fi = (fi + 1) % flashes.length];
    f.l.color.set(col); f.l.position.set(x, y, 90); f.l.distance = rad || 500; f.p = power; f.t = 0; f.life = life || .35;
  };
  // ring/pillar effektlari -> 3D meshlar (fx obyektiga bog'langan)
  const fxm = new Map(); let ffr = 0;
  const ringG = new T.RingGeometry(.86, 1, 48), pilG = new T.CylinderGeometry(1, 1, 1, 20, 1, true);
  G3.fx = (p) => {
    let m = fxm.get(p);
    if (!m) {
      if (p.k === 'ring') {
        const mat = new T.MeshBasicMaterial({ color: new T.Color(p.col), transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
        m = new T.Mesh(ringG, mat); m.renderOrder = 5;
        if (p.z <= 20) m.rotation.x = -Math.PI / 2;
        if (p.r >= 70) G3.flash(p.x, p.z + 40, p.col, Math.min(4, p.r / 40), p.r * 3.2, p.life * 1.3);
      } else {
        const mat = new T.MeshBasicMaterial({ color: new T.Color(p.col), transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
        m = new T.Mesh(pilG, mat); m.renderOrder = 5;
        G3.flash(p.x, 120, p.col, 3.5, 480, p.life);
      }
      root.add(m); fxm.set(p, m);
    }
    m.userData.f = ffr;
    const k = Math.min(1, p.t / p.life), a = 1 - k;
    if (p.k === 'ring') {
      const r = p.r * Math.min(1, k * 1.4 + .1), w = Math.max(.04, Math.min(.5, (p.w * a + 1) / Math.max(10, r)));
      m.scale.set(r, r, r); m.position.set(p.x, Math.max(1.5, p.z), p.z <= 20 ? 0 : 20);
      m.material.opacity = a; m.geometry = ringG;
      m.scale.z = r; m.userData.w = w;
    } else {
      const w = (p.kind === 'fire' ? 56 : 64) * (k < .2 ? k / .2 : 1 - (k - .2) * .9);
      m.scale.set(Math.max(1, w * .6), 900, Math.max(1, w * .6)); m.position.set(p.x, 450, 0); m.material.opacity = .9 * a;
    }
  };
  G3.fxEnd = (dt) => {
    for (const [p, m] of fxm) if (m.userData.f !== ffr) { root.remove(m); m.material.dispose(); fxm.delete(p); }
    ffr++;
    flashes.forEach(f => { if (f.t < f.life) { f.t += dt; const k = Math.min(1, f.t / f.life); f.l.intensity = f.p * (1 - k) * (1 - k); } else f.l.intensity = 0; });
  };
})();
