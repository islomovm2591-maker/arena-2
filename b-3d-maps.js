'use strict';
// ===== Stickman Jang 2 — 3D xaritalar: qo'shimcha detallar, harakat, zarrachalar, kayfiyat =====
// b-3d.js har bir xaritani qurgandan so'ng G3.extra[bg](api, x0, x1, L) va G3.extra.mood(...) ni chaqiradi.
// api: T, root, hemi, sun, sunOff, anims, box, cyl, sph, plane, mesh, lam, glow, canvasTex, sr, srr, ...
(function () {
  const G3 = B.g3; if (!G3.ok) return;
  const T = window.THREE, TAU = Math.PI * 2;
  const X = G3.extra = {};

  // ---------- Umumiy yordamchilar ----------
  // yumshoq nuqta (zarracha uchun)
  let dotT = null, petalT = null;
  const dot = A => dotT || (dotT = A.canvasTex(32, 32, (c, w) => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); }));
  const petal = A => petalT || (petalT = A.canvasTex(32, 32, c => { c.fillStyle = '#ffd0e0'; c.beginPath(); c.ellipse(16, 16, 13, 7, .6, 0, TAU); c.fill(); c.fillStyle = '#ff9fc0'; c.beginPath(); c.ellipse(18, 15, 6, 3, .6, 0, TAU); c.fill(); }));
  // kamera atrofida doimo mavjud zarrachalar (yomg'ir, qor, chang, gullar...)
  // o: { n, col, size, map, add, op, y:[a,b], z:[a,b], w (kenglik), vx, vy, sway, rise (true — tepaga) }
  function particles(A, o) {
    const n = Math.max(4, Math.round(o.n * G3.Q().part)), g = new T.BufferGeometry(), p = new Float32Array(n * 3), ph = new Float32Array(n), W = o.w || 1800;
    for (let i = 0; i < n; i++) { p[i * 3] = A.srr(-W, W); p[i * 3 + 1] = A.srr(o.y[0], o.y[1]); p[i * 3 + 2] = A.srr(o.z[0], o.z[1]); ph[i] = A.sr() * TAU; }
    g.setAttribute('position', new T.BufferAttribute(p, 3));
    const m = new T.PointsMaterial({ color: new T.Color(o.col), size: o.size, map: o.map || dot(A), transparent: true, opacity: o.op == null ? .9 : o.op, depthWrite: false, blending: o.add ? T.AdditiveBlending : T.NormalBlending });
    const pts = new T.Points(g, m); pts.frustumCulled = false; A.root.add(pts);
    let last = null;
    A.anims.push((t, cx) => {
      const dt = last == null ? 0 : Math.min(.1, Math.max(0, t - last));
      const a = g.attributes.position.array, H = o.y[1] - o.y[0];
      if (last == null) for (let i = 0; i < n; i++) a[i * 3] += cx;   // birinchi kadr: kamera atrofiga joylash
      last = t;
      const vx = typeof o.vx === 'function' ? o.vx() : (o.vx || 0);
      for (let i = 0; i < n; i++) {
        let x = a[i * 3] + (vx + (o.sway ? Math.sin(t * 1.3 + ph[i]) * o.sway : 0)) * dt, y = a[i * 3 + 1] + (o.vy || 0) * dt;
        // kameradan uzoqlashsa qarama-qarshi tomonga o'tkaziladi
        const rx = x - cx; if (rx < -W) x += 2 * W; else if (rx > W) x -= 2 * W;
        if (y < o.y[0]) y += H; else if (y > o.y[1]) y -= H;
        a[i * 3] = x; a[i * 3 + 1] = y;
      }
      g.attributes.position.needsUpdate = true;
    });
    return pts;
  }
  // tekis (polga yotgan) sirt
  function decal(A, w, d, m, x, z, y) { const o = A.mesh(A.plG, m, x, y || .6, z, w, d, 1, false); o.rotation.x = -Math.PI / 2; o.receiveShadow = true; return o; }
  // aylanuvchi ogohlantirish chirog'i (qizil signal)
  function beacon(A, x, y, z, col) {
    A.cyl(16, 14, A.lam('#3a3a44'), x, y - 14, z);
    const cap = A.sph(15, A.glow(col), x, y + 4, z, false);
    // nur konusi gorizontal (+x tomonga), vertikal o'q atrofida aylanadi — politsiya chirog'idek
    const geo = new T.ConeGeometry(90, 520, 18, 1, true); geo.translate(0, -260, 0); geo.rotateZ(Math.PI / 2);
    const beam = new T.Mesh(geo, new T.MeshBasicMaterial({ color: new T.Color(col), transparent: true, opacity: .3, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    const piv = new T.Group(); piv.position.set(x, y + 4, z); piv.add(beam); A.root.add(piv);
    A.anims.push(t => { piv.rotation.y = t * 4 + x; cap.material.color.set(Math.sin(t * 8) > 0 ? col : '#551010'); });
  }
  // teksturali materiallar (kesh kalitisiz — har biri o'z teksturasi bilan)
  const tm = o => new T.MeshLambertMaterial(o), tb = o => new T.MeshBasicMaterial(o);
  const pick = (A, arr) => arr[Math.floor(A.sr() * arr.length)];

  // ---------- Xona ----------
  X.room = (A, x0, x1) => {
    const rug = A.canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#8b2e3c'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8c27a'; c.lineWidth = 5; c.strokeRect(8, 8, w - 16, h - 16); c.fillStyle = '#e8c27a'; for (let i = 24; i < w - 20; i += 20) { c.beginPath(); c.moveTo(i, 32); c.lineTo(i + 8, 22); c.lineTo(i + 16, 32); c.lineTo(i + 8, 42); c.fill(); } });
    const art = ['#5aa9e6', '#ff8c42', '#7fd36b', '#c77dff'];
    for (let x = x0; x < x1; x += 840) decal(A, 360, 150, tm({ map: rug }), x + 420, -40);
    for (let x = x0; x < x1; x += 420) {
      // shiftdagi chiroq: sim, abajur, lampa — sekin tebranadi
      const lx = x + 210, g = new T.Group(); g.position.set(lx, 760, -180); A.root.add(g);
      const cord = new T.Mesh(A.cylG, A.lam('#222222')); cord.scale.set(1.2, 300, 1.2); cord.position.y = -150; g.add(cord);
      const shade = new T.Mesh(new T.ConeGeometry(34, 30, 20, 1, true), A.lam('#2f6f5e', { side: T.DoubleSide })); shade.position.y = -310; g.add(shade);
      const bulb = new T.Mesh(A.sphG, A.glow('#fff3c4')); bulb.scale.setScalar(9); bulb.position.y = -322; g.add(bulb);
      A.anims.push(t => { g.rotation.z = Math.sin(t * .9 + lx) * .03; });
      // devordagi rasm
      if (A.sr() < .6) {
        const ax = x + 60, c1 = pick(A, art), c2 = pick(A, art);
        A.box(96, 76, 6, A.lam('#5b3a1e'), ax, 330, -296);
        A.plane(82, 62, tm({ map: A.canvasTex(32, 32, (c, w) => { const gr = c.createLinearGradient(0, 0, w, w); gr.addColorStop(0, c1); gr.addColorStop(1, c2); c.fillStyle = gr; c.fillRect(0, 0, w, w); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.arc(22, 10, 5, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(0, 32); c.lineTo(12, 16); c.lineTo(20, 24); c.lineTo(32, 12); c.lineTo(32, 32); c.fill(); }) }), ax, 368, -292);
      } else {
        // gul tuvagi
        A.cyl(16, 34, A.lam('#c0603a'), x + 40, 0, -250);
        for (let k = 0; k < 4; k++) A.sph(A.srr(16, 22), A.lam('#3f9b4a'), x + 40 + A.srr(-12, 12), 52 + k * 14, -250 + A.srr(-8, 8));
      }
    }
    // televizor
    for (let x = x0 + 600; x < x1; x += 1680) {
      A.box(170, 60, 60, A.lam('#6d4524'), x, 0, -262);
      A.box(150, 90, 10, A.lam('#15151c'), x, 64, -270);
      const scr = A.plane(136, 76, A.glow('#6ab8ff'), x, 109, -264);
      A.anims.push(t => { const v = .65 + .35 * Math.abs(Math.sin(t * 3.7 + x)) * (Math.sin(t * 13) > -.9 ? 1 : .3); scr.material.color.setRGB(.42 * v, .72 * v, 1 * v); });
    }
    particles(A, { n: 60, col: '#fff1c8', size: 5, add: true, op: .55, y: [40, 480], z: [-260, 120], vx: 4, vy: 3, sway: 10 });
  };

  // ---------- Laboratoriya ----------
  X.lab = (A, x0, x1) => {
    const stripe = A.canvasTex(64, 16, (c, w, h) => { c.fillStyle = '#ffd23f'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let i = -16; i < w; i += 16) { c.beginPath(); c.moveTo(i, 16); c.lineTo(i + 8, 16); c.lineTo(i + 16, 0); c.lineTo(i + 8, 0); c.fill(); } }, (x1 - x0) / 64, 1);
    decal(A, x1 - x0, 18, tm({ map: stripe }), (x0 + x1) / 2, -205);
    for (let x = x0; x < x1; x += 520) {
      // devordagi monitor: grafik chiziqlari siljib turadi
      const tx = A.canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#031a1f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2bd9c5'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= w; i += 4) c.lineTo(i, 32 + Math.sin(i * .15) * 12 + Math.sin(i * .05) * 8); c.stroke(); c.fillStyle = 'rgba(43,217,197,.5)'; for (let i = 0; i < 6; i++) c.fillRect(6, 6 + i * 9, A.srr(10, 50), 3); }, 1, 1);
      tx.wrapS = T.RepeatWrapping;
      A.box(150, 90, 8, A.lam('#2a3a44'), x + 290, 300, -316);
      A.plane(136, 76, tb({ map: tx }), x + 290, 345, -311);
      A.anims.push(t => { tx.offset.x = (t * .15) % 1; });
      // golografik model: sekin aylanadi
      const holo = new T.Mesh(new T.IcosahedronGeometry(26, 0), new T.MeshBasicMaterial({ color: '#5ff6ff', wireframe: true, transparent: true, opacity: .8, blending: T.AdditiveBlending, depthWrite: false }));
      holo.position.set(x + 150, 150, -255); A.root.add(holo);
      const base = A.plane(60, 60, new T.MeshBasicMaterial({ color: '#38f2ff', transparent: true, opacity: .25, blending: T.AdditiveBlending, depthWrite: false }), x + 150, 112, -255); base.rotation.x = -Math.PI / 2;
      A.anims.push(t => { holo.rotation.set(t * .6, t * 1.1, 0); holo.position.y = 150 + Math.sin(t * 1.7 + x) * 6; });
    }
    particles(A, { n: 40, col: '#9ffcff', size: 6, add: true, op: .5, y: [20, 400], z: [-280, 100], vy: 14, sway: 6 });
  };

  // ---------- Tom ----------
  X.roof = (A, x0, x1, L) => {
    // vertolyot maydonchasi belgisi
    const hp = A.canvasTex(128, 128, (c, w) => { c.strokeStyle = 'rgba(255,230,120,.9)'; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 54, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,230,120,.9)'; c.font = '900 80px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('H', 64, 68); });
    for (let x = x0 + 900; x < x1; x += 1800) decal(A, 220, 140, tm({ map: hp, transparent: true }), x, 40);
    // neon reklama taxtasi
    for (let x = x0 + 300; x < x1; x += 1400) {
      A.box(8, 260, 8, A.lam('#2a2238'), x - 140, 0, -135); A.box(8, 260, 8, A.lam('#2a2238'), x + 140, 0, -135);
      A.box(320, 110, 10, A.lam('#1a1028'), x, 250, -140);
      const word = pick(A, ['ARENA', 'JANG', 'STICK', 'NEON']), cl = pick(A, ['#ff4d8a', '#38f2ff', '#ffd23f']);
      const sg = A.plane(300, 90, tb({ map: A.canvasTex(256, 80, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.shadowColor = cl; c.shadowBlur = 16; c.fillStyle = cl; c.font = 'italic 900 58px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(word, w / 2, h / 2 + 2); }), blending: T.AdditiveBlending, transparent: true }), x, 305, -134);
      A.anims.push(t => { sg.visible = !(Math.sin(t * 7 + x) > .93 && Math.sin(t * 23) > 0); });
    }
    // tutun chiqaruvchi mo'ri
    for (let x = x0 + 500; x < x1; x += 1300) { A.box(50, 120, 50, A.lam('#6b4a4a'), x, 0, -120); }
    particles(A, { n: 50, col: '#c9a0c0', size: 40, op: .22, y: [130, 700], z: [-140, -100], w: 1800, vy: 28, sway: 14 });
    // bulutlar
    const cl = A.canvasTex(128, 64, (c, w, h) => { const g = c.createRadialGradient(64, 36, 4, 64, 36, 60); g.addColorStop(0, 'rgba(255,220,230,.75)'); g.addColorStop(1, 'rgba(255,220,230,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(64, 34, 62, 26, 0, 0, TAU); c.fill(); });
    for (let i = 0; i < 9; i++) {
      const m = A.plane(A.srr(700, 1300), A.srr(160, 260), new T.MeshBasicMaterial({ map: cl, transparent: true, opacity: L.sunset ? .55 : .4, depthWrite: false, fog: false }), A.srr(x0 - 1500, x1 + 1500), A.srr(900, 1900), -4200);
      const sp = A.srr(8, 22), bx = m.position.x; A.anims.push(t => { m.position.x = bx + t * sp; });
    }
  };

  // ---------- Ko'cha ----------
  X.street = (A, x0, x1) => {
    // nam asfalt: neon yorug'lik aks etadi
    A.root.traverse(o => { if (o.material && o.material.type === 'MeshPhongMaterial') { o.material.shininess = 70; o.material.specular = new T.Color('#5a5a80'); } });
    // ko'lmaklar
    const pd = A.canvasTex(64, 32, (c, w, h) => { const g = c.createRadialGradient(32, 16, 2, 32, 16, 30); g.addColorStop(0, 'rgba(150,170,255,.55)'); g.addColorStop(1, 'rgba(150,170,255,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(32, 16, 31, 15, 0, 0, TAU); c.fill(); });
    for (let x = x0; x < x1; x += A.srr(380, 700)) decal(A, A.srr(120, 220), A.srr(40, 70), new T.MeshBasicMaterial({ map: pd, transparent: true, blending: T.AdditiveBlending, depthWrite: false }), x, A.srr(-90, 120), .8);
    // svetofor
    for (let x = x0 + 260; x < x1; x += 1040) {
      A.cyl(4, 220, A.lam('#20243e'), x, 14, -170); A.box(26, 70, 20, A.lam('#15182a'), x, 234, -170);
      const ls = ['#ff3b3b', '#ffd23f', '#3bff6b'].map((c, i) => A.sph(7, A.glow(c), x, 290 - i * 22, -158, false));
      A.anims.push(t => { const s = Math.floor((t + x * .01) / 2.5) % 3; ls.forEach((l, i) => { l.visible = i === s; }); });
    }
    // yomg'ir
    const rain = A.canvasTex(4, 32, (c) => { const g = c.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, 'rgba(200,210,255,0)'); g.addColorStop(1, 'rgba(200,210,255,.9)'); c.fillStyle = g; c.fillRect(1, 0, 2, 32); });
    particles(A, { n: 520, col: '#dfe6ff', size: 44, map: rain, op: .85, y: [0, 900], z: [-300, 300], vx: -60, vy: -900 });
    // vaqti-vaqti bilan chaqmoq
    const hemi = A.hemi, base = hemi.intensity;
    A.anims.push(t => { const k = (t % 9.3); hemi.intensity = base + (k < .08 || (k > .18 && k < .24) ? 1.4 : 0); });
  };

  // ---------- Zavod ----------
  X.factory = (A, x0, x1) => {
    // konveyer lentasi va ustidagi qutilar
    const belt = A.canvasTex(64, 16, (c, w, h) => { c.fillStyle = '#222'; c.fillRect(0, 0, w, h); c.fillStyle = '#444'; for (let i = 0; i < w; i += 8) c.fillRect(i, 0, 3, h); }, (x1 - x0) / 64, 1);
    belt.wrapS = T.RepeatWrapping;
    A.box(x1 - x0, 60, 70, A.lam('#3a2e34'), (x0 + x1) / 2, 0, -300);
    const top = A.mesh(A.plG, tm({ map: belt }), (x0 + x1) / 2, 61, -300, x1 - x0, 70, 1, false); top.rotation.x = -Math.PI / 2;
    const crates = [];
    for (let x = x0; x < x1; x += A.srr(220, 380)) crates.push({ o: A.box(44, 40, 44, A.lam(pick(A, ['#7a5a3a', '#8a6a3a', '#6a4a2e'])), x, 62, -300), bx: x });
    const span = x1 - x0;
    A.anims.push(t => { belt.offset.x = -(t * .8) % 1; crates.forEach(c => { c.o.position.x = x0 + ((c.bx - x0 + t * 50) % span); }); });
    // aylanuvchi tishli g'ildiraklar
    for (let x = x0 + 200; x < x1; x += 760) {
      [[0, 420, 60, 1], [95, 360, 38, -1.6]].forEach(q => {
        const g = new T.Group(); g.position.set(x + q[0], q[1], -352); A.root.add(g);
        const m = A.lam('#7a6a72');
        const disc = new T.Mesh(A.cylG, m); disc.scale.set(q[2], 10, q[2]); disc.rotation.x = Math.PI / 2; g.add(disc);
        const hub = new T.Mesh(A.cylG, A.lam('#2a1e24')); hub.scale.set(q[2] * .3, 12, q[2] * .3); hub.rotation.x = Math.PI / 2; g.add(hub);
        const nT = Math.round(q[2] / 5); for (let i = 0; i < nT; i++) { const tth = new T.Mesh(A.boxG, m); const a = i / nT * TAU; tth.scale.set(12, 14, 10); tth.position.set(Math.cos(a) * q[2], Math.sin(a) * q[2], 0); tth.rotation.z = a; g.add(tth); }
        A.anims.push(t => { g.rotation.z = t * .6 * q[3]; });
      });
    }
    // payvand uchqunlari va bug'
    particles(A, { n: 70, col: '#ffb04a', size: 6, add: true, y: [0, 600], z: [-320, -200], w: 1400, vy: -160, sway: 30 });
    particles(A, { n: 36, col: '#bfb0b8', size: 50, op: .16, y: [60, 700], z: [-330, -260], w: 1500, vy: 40, sway: 12 });
  };

  // ---------- Tungi shahar ----------
  X.night = (A, x0, x1) => {
    // projektor nurlari osmonda aylanib turadi
    for (let i = 0; i < 4; i++) {
      const bx = A.srr(x0, x1), beam = new T.Mesh(new T.ConeGeometry(130, 2600, 20, 1, true), new T.MeshBasicMaterial({ color: '#9fb6ff', transparent: true, opacity: .08, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide, fog: false }));
      beam.geometry.translate(0, 1300, 0); beam.position.set(bx, -500, -2400); A.root.add(beam);
      const ph = A.sr() * TAU; A.anims.push(t => { beam.rotation.z = Math.sin(t * .35 + ph) * .55; });
    }
    // oy atrofida nur gardishi
    const halo = A.canvasTex(64, 64, (c, w) => { const g = c.createRadialGradient(32, 32, 8, 32, 32, 32); g.addColorStop(0, 'rgba(220,230,255,.5)'); g.addColorStop(1, 'rgba(220,230,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
    A.plane(900, 900, new T.MeshBasicMaterial({ map: halo, transparent: true, depthWrite: false, blending: T.AdditiveBlending, fog: false }), x0 + (x1 - x0) * .7, 1500, -5100);
    // samolyot chiroqlari
    const pl = A.sph(10, A.glow('#ff4d4d', { fog: false }), 0, 2300, -4800, false); pl.material.fog = false;
    A.anims.push((t, cx) => { pl.position.x = cx - 3000 + (t * 90) % 6000; pl.visible = Math.sin(t * 5) > 0; });
    particles(A, { n: 50, col: '#c8ff8a', size: 7, add: true, op: .8, y: [30, 300], z: [-140, 150], vy: 6, sway: 22 });
  };

  // ---------- Dojo ----------
  X.dojo = (A, x0, x1, L) => {
    for (let x = x0; x < x1; x += 360) {
      // osma o'ram (kakemono)
      if (A.sr() < .7) {
        const sx = x + 90;
        A.cyl(3, 4, A.lam('#3a2010'), sx, 452, -286);
        A.plane(56, 150, tm({ map: A.canvasTex(32, 96, (c, w, h) => { c.fillStyle = '#f3e3c3'; c.fillRect(0, 0, w, h); c.fillStyle = '#8a1c1c'; c.fillRect(0, 0, w, 4); c.fillRect(0, h - 4, w, 4); c.strokeStyle = '#1a1010'; c.lineWidth = 3; c.lineCap = 'round'; for (let k = 0; k < 3; k++) { const y = 18 + k * 26; c.beginPath(); c.moveTo(9 + A.sr() * 4, y); c.lineTo(22 + A.sr() * 4, y + A.sr() * 6); c.moveTo(16, y - 6); c.lineTo(15 + A.sr() * 4, y + 14); c.stroke(); } c.fillStyle = '#c1121f'; c.fillRect(20, h - 18, 7, 7); }) }), sx, 375, -284);
      }
    }
    // gong
    for (let x = x0 + 700; x < x1; x += 1440) {
      A.box(10, 220, 10, A.lam('#3a1810'), x - 70, 0, -240); A.box(10, 220, 10, A.lam('#3a1810'), x + 70, 0, -240); A.box(160, 12, 12, A.lam('#3a1810'), x, 214, -240);
      const gong = new T.Mesh(A.cylG, new T.MeshStandardMaterial({ color: '#d4a32a', metalness: .8, roughness: .35 })); gong.scale.set(52, 6, 52); gong.rotation.x = Math.PI / 2; gong.position.set(x, 140, -240); gong.castShadow = true; A.root.add(gong);
      A.anims.push(t => { gong.rotation.z = Math.sin(t * 1.1 + x) * .05; });
    }
    // bonsay
    for (let x = x0 + 1100; x < x1; x += 1440) {
      A.cyl(26, 26, A.lam('#2b1a14'), x, 0, -260); A.cyl(5, 60, A.lam('#5a3a22'), x, 26, -260);
      for (let k = 0; k < 5; k++) A.sph(A.srr(16, 24), A.lam('#ffb7d0'), x + A.srr(-30, 30), 92 + A.srr(-6, 16), -260 + A.srr(-14, 14));
    }
    // sakura gulbarglari
    particles(A, { n: 90, col: '#ffffff', size: 13, map: petal(A), op: .95, y: [0, 620], z: [-260, 220], vx: 28, vy: -45, sway: 40 });
    // imperator qal'asi: mash'allar va uchqunlar
    if (L.alarm) {
      for (let x = x0 + 180; x < x1; x += 720) {
        A.cyl(5, 120, A.lam('#2a1408'), x, 0, -230); A.cyl(11, 16, A.lam('#3a2a1a'), x, 120, -230);
        const f1 = A.sph(14, A.glow('#ff7a1f'), x, 150, -230, false), f2 = A.sph(8, A.glow('#ffe08a'), x, 146, -228, false);
        A.anims.push(t => { const s = 1 + .25 * Math.sin(t * 17 + x) + .15 * Math.sin(t * 29); f1.scale.set(14 * s, 20 * s, 14 * s); f2.scale.setScalar(8 * s); });
      }
      particles(A, { n: 60, col: '#ff8a2a', size: 6, add: true, y: [60, 600], z: [-240, 100], vy: 70, sway: 20 });
    }
  };

  // boshqa fayllar (b-3d-maps2.js) uchun
  G3.mapUtil = { particles, decal, beacon, dot, pick };

  // ---------- Kayfiyat: qizil signal va quyosh botishi ----------
  X.mood = (A, x0, x1, L) => {
    if (L.alarm && L.bg !== 'dojo') {
      for (let x = x0 + 300; x < x1; x += 700) beacon(A, x, 400, L.bg === 'roof' ? -140 : -250, '#ff2a2a');
      const h = A.hemi, c0 = h.color.clone(), red = new T.Color('#ff5050');
      A.anims.push(t => { h.color.copy(c0).lerp(red, .35 + .35 * Math.sin(t * 6)); });
    }
    if (L.alarm && L.bg === 'dojo') {
      const h = A.hemi, c0 = h.color.clone(), red = new T.Color('#ff6a3a');
      A.anims.push(t => { h.color.copy(c0).lerp(red, .3 + .1 * Math.sin(t * 2.3)); });
    }
    if (L.sunset) {
      // past quyosh — uzun soyalar, iliq yorug'lik
      A.sunOff.set(-1700, 520, -400); A.sun.intensity = 1.1; A.sun.color.set('#ff9a50');
      A.hemi.color.set('#ffb48a'); A.hemi.groundColor.set('#4a1a40');
    }
  };
})();
