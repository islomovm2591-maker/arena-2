'use strict';
// ===== Stickman Jang 2 — 3D versiyadagi yangi xaritalar =====
// Muzlik g'ori, Vulqon, Cho'l xarobalari, Metro poyezdi, Kema palubasi, Neon arena.
// b-3d.js: TH[bg] topilmasa G3.themes[bg](api, x0, x1, L) chaqiriladi.
(function () {
  const G3 = B.g3; if (!G3.ok || !G3.mapUtil) return;
  const T = window.THREE, TAU = Math.PI * 2, U = G3.mapUtil;
  const TM = G3.themes = {};
  const tm = o => new T.MeshLambertMaterial(o), tb = o => new T.MeshBasicMaterial(o);
  const add = (o, A) => { A.root.add(o); return o; };
  // tosh (qirrali, yassi soyali)
  const rockG = new T.IcosahedronGeometry(1, 0);
  const rock = (A, r, m, x, y, z, sy) => { const o = new T.Mesh(rockG, m); o.position.set(x, y, z); o.scale.set(r * A.srr(.8, 1.3), r * (sy || A.srr(.6, 1.1)), r * A.srr(.8, 1.2)); o.rotation.set(A.sr() * 3, A.sr() * 3, A.sr() * 3); o.castShadow = o.receiveShadow = true; return add(o, A); };
  const shine = (o, sh, sp) => { o.material.shininess = sh; o.material.specular = new T.Color(sp); return o; };
  // kamera atrofida takrorlanib harakatlanadigan narsa (poyezd manzarasi uchun)
  const scroller = (A, objs, speed, span) => A.anims.push((t, cx) => objs.forEach(o => { let x = o.userData.bx - t * speed; x = ((x - cx + span / 2) % span + span) % span - span / 2 + cx; o.position.x = x; }));

  // ---------- Bosh menyu: qahramon poydevorda, orqada uning rangidagi sahna ----------
  TM.menu = (A, x0, x1, L) => {
    const H = L.hero, px = L.px, col = new T.Color(H.col);
    A.scene.background = A.sky([H.bg[0], H.bg[1], H.bg[2], H.bg[1]]);
    const fl = A.floor(A.lam('#ffffff', { map: A.floorTex('tile', '#14141f', '#22223a', (x1 - x0) / 120, 5) }), 500, -900, x0, x1);
    shine(fl, 90, H.col);
    // poydevor: ikki qavatli disk + yonib turgan halqa + aylanuvchi belgilar halqasi
    A.cyl(120, 22, A.lam('#1a1a2a'), px, 0, 0); A.cyl(96, 14, A.lam('#262640'), px, 22, 0);
    const ring = new T.Mesh(new T.TorusGeometry(108, 3.4, 8, 64), A.glow(H.col)); ring.rotation.x = Math.PI / 2; ring.position.set(px, 23, 0); add(ring, A);
    const rt = A.canvasTex(256, 32, (c, w, h) => { c.fillStyle = H.lite; c.font = '900 22px Arial'; c.textBaseline = 'middle'; for (let i = 0; i < 12; i++) c.fillText('ᚠᚢᚦᚨᚱᚲᚷᚹ'[i % 8], i * 21 + 4, h / 2); });
    const rune = new T.Mesh(new T.CylinderGeometry(122, 122, 16, 48, 1, true), tb({ map: rt, transparent: true, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
    rt.wrapS = T.RepeatWrapping; rt.repeat.x = 3; rune.position.set(px, 10, 0); add(rune, A);
    A.anims.push(t => { rune.rotation.y = t * .4; ring.material.color.copy(col).multiplyScalar(.8 + .2 * Math.sin(t * 3)); });
    // orqada ko'tarilib turgan nur ustunlari
    for (let i = -4; i <= 4; i++) {
      const b = A.mesh(new T.CylinderGeometry(1, 1, 1, 12, 1, true), tb({ color: H.col, transparent: true, opacity: .12, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }), px + i * 260, 600, -700 - Math.abs(i) * 60, 26, 1400, 26, false);
      const ph = i; A.anims.push(t => { b.material.opacity = .07 + .07 * Math.sin(t * 1.4 + ph); });
    }
    U.particles(A, { n: 90, col: H.lite, size: 9, add: true, op: .8, y: [0, 600], z: [-500, 200], vy: 40, sway: 20 });
    A.hemi.color.set(H.lite); A.hemi.groundColor.set(H.bg[0]); A.hemi.intensity = .75; A.sun.color.set('#ffffff'); A.sun.intensity = .7;
    A.sunOff.set(-400, 1300, 1100);
    A.scene.fog = new T.Fog(H.bg[0], 1500, 5000);
  };

  // ---------- Muzlik g'ori ----------
  TM.ice = (A, x0, x1) => {
    A.scene.background = new T.Color('#061826');
    const fl = A.floor(A.lam('#ffffff', { map: A.floorTex('noise', '#cdeef8', '#7fb8d0', (x1 - x0) / 160, 4) }), 500, -320, x0, x1);
    shine(fl, 90, '#9fc8e0');
    A.wall(A.lam('#12304a'), -330, x0, x1, 1400);
    const rm = new T.MeshLambertMaterial({ color: '#2a5272', flatShading: true });
    const ic = new T.MeshLambertMaterial({ color: '#9ff0ff', emissive: '#3aa8d0', emissiveIntensity: .55, transparent: true, opacity: .85, flatShading: true });
    const cone = new T.ConeGeometry(1, 1, 6);
    const crystal = (x, y, z, r, h, down) => { const o = new T.Mesh(cone, ic); o.scale.set(r, h, r); o.position.set(x, y + (down ? -h / 2 : h / 2), z); if (down) o.rotation.z = Math.PI; o.rotation.y = A.sr() * 3; o.castShadow = !down; return add(o, A); };
    for (let x = x0; x < x1; x += A.srr(90, 160)) rock(A, A.srr(60, 140), rm, x, A.srr(0, 60), A.srr(-320, -260));
    for (let x = x0; x < x1; x += A.srr(70, 130)) crystal(x, A.srr(520, 640), A.srr(-280, -80), A.srr(8, 18), A.srr(50, 140), true);   // muz sumalaklar
    for (let x = x0; x < x1; x += A.srr(240, 420)) { const n = 2 + Math.floor(A.sr() * 3); for (let k = 0; k < n; k++) crystal(x + A.srr(-30, 30), 0, A.srr(-250, -190), A.srr(10, 22), A.srr(40, 120), false); }
    // muzlagan ustunlar
    for (let x = x0; x < x1; x += 900) { const p = A.cyl(34, 700, ic, x + 300, 0, -240); p.material = ic; }
    U.particles(A, { n: 160, col: '#ffffff', size: 8, op: .85, y: [0, 620], z: [-280, 220], vx: 10, vy: -40, sway: 18 });
    A.hemi.color.set('#bfefff'); A.hemi.groundColor.set('#0e2a40'); A.hemi.intensity = .75; A.sun.color.set('#cfefff'); A.sun.intensity = .55;
    A.scene.fog = new T.Fog('#0a2236', 1400, 5200);
  };

  // ---------- Vulqon ----------
  TM.volcano = (A, x0, x1, L) => {
    A.scene.background = A.sky(['#120404', '#3a0a06', '#7a1a08', '#c8461a']);
    // bazalt pol: yoriqlaridan lava yaltiraydi
    const ft = A.canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#2a1a18'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ff6a1f'; c.lineWidth = 2; c.shadowColor = '#ff6a1f'; c.shadowBlur = 6; for (let i = 0; i < 5; i++) { c.beginPath(); let x = A.sr() * w, y = A.sr() * h; c.moveTo(x, y); for (let j = 0; j < 5; j++) { x += A.srr(-26, 26); y += A.srr(-26, 26); c.lineTo(x, y); } c.stroke(); } }, (x1 - x0) / 180, 4);
    const fl = A.floor(A.lam('#ffffff', { map: ft }), 500, -230, x0, x1); fl.material.emissive = new T.Color('#ffffff'); fl.material.emissiveMap = ft; fl.material.emissiveIntensity = .35;
    // orqadagi oqayotgan lava daryosi
    const lt = A.canvasTex(128, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffcc4a'); g.addColorStop(.5, '#ff6a1f'); g.addColorStop(1, '#b8200a'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,10,0,.55)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(A.sr() * w, A.sr() * h, A.srr(6, 18), A.srr(2, 6), 0, 0, TAU); c.fill(); } }, (x1 - x0) / 260, 1);
    const lava = A.mesh(A.plG, tb({ map: lt }), (x0 + x1) / 2, -6, -330, x1 - x0, 200, 1, false); lava.rotation.x = -Math.PI / 2;
    A.anims.push(t => { lt.offset.x = -(t * .05) % 1; lt.offset.y = Math.sin(t * .4) * .05; });
    const rm = new T.MeshLambertMaterial({ color: '#2a1c1c', flatShading: true });
    for (let x = x0; x < x1; x += A.srr(110, 200)) rock(A, A.srr(40, 90), rm, x, 10, A.srr(-240, -200));
    for (let x = x0; x < x1; x += A.srr(160, 260)) rock(A, A.srr(90, 200), rm, x, A.srr(-40, 60), A.srr(-560, -440));
    // lava otqinlari joyi (o'yin mantig'i bilan bir xil nuqtalar)
    const vt = A.canvasTex(64, 32, (c, w, h) => { const g = c.createRadialGradient(32, 16, 2, 32, 16, 30); g.addColorStop(0, 'rgba(255,210,90,1)'); g.addColorStop(.5, 'rgba(255,90,20,.8)'); g.addColorStop(1, 'rgba(120,20,0,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(32, 16, 31, 15, 0, 0, TAU); c.fill(); });
    const vents = B.geyserX(L).map(x => U.decal(A, 150, 70, tb({ map: vt, transparent: true, blending: T.AdditiveBlending, depthWrite: false }), x, 0, 1));
    A.anims.push(t => { const hz = B.hazInfo && B.hazInfo(); vents.forEach((v, i) => { const g = hz && hz.gey && hz.gey[i], warn = g && g.ph === 1; v.material.opacity = warn ? .7 + .3 * Math.sin(t * 30) : .45 + .1 * Math.sin(t * 2 + i); v.scale.x = warn ? 190 : 150; }); });
    // uzoqdagi vulqon: krateri yonib turadi, tutun chiqadi
    const vx = x0 + (x1 - x0) * .55;
    const mtn = new T.Mesh(new T.ConeGeometry(1600, 1500, 9, 1, true), new T.MeshLambertMaterial({ color: '#1a0c0a', flatShading: true })); mtn.position.set(vx, 150, -4200); add(mtn, A);
    const crater = A.sph(260, A.glow('#ff7a1f', { fog: false }), vx, 880, -4200, false); crater.scale.y = 60; crater.material.fog = false;
    A.anims.push(t => { crater.material.color.setRGB(1, .4 + .12 * Math.sin(t * 2), .1); });
    U.particles(A, { n: 70, col: '#ff8a2a', size: 7, add: true, y: [0, 700], z: [-300, 160], vy: 80, sway: 25 });
    U.particles(A, { n: 30, col: '#3a2020', size: 120, op: .35, y: [800, 2600], z: [-4300, -4100], w: 900, vy: 60, sway: 40 });
    A.hemi.color.set('#ff9a6a'); A.hemi.groundColor.set('#3a0a06'); A.hemi.intensity = .7; A.sun.color.set('#ff7a3a'); A.sun.intensity = .7;
    A.scene.fog = new T.Fog('#3a120a', 1500, 6500);
  };

  // ---------- Cho'l xarobalari ----------
  TM.desert = (A, x0, x1) => {
    A.scene.background = A.sky(['#5aa8e6', '#9fd0ee', '#f4dcae', '#f0c890']);
    A.floor(A.lam('#ffffff', { map: A.floorTex('noise', '#e2bb7c', '#b88a4a', (x1 - x0) / 160, 4) }), 500, -3000, x0, x1);
    const st = new T.MeshLambertMaterial({ color: '#d8b98a', flatShading: true }), dk = A.lam('#b8925e');
    for (let x = x0; x < x1; x += A.srr(260, 420)) {
      const r = A.sr();
      if (r < .45) { const h = A.srr(120, 380); A.cyl(26, h, st, x, 0, A.srr(-260, -200)); A.cyl(34, 16, dk, x, h, -230); }                 // ustun
      else if (r < .65) { const o = A.cyl(24, 180, st, x, 0, -220); o.rotation.z = Math.PI / 2; o.position.y = 24; }                           // yiqilgan ustun
      else if (r < .85) { A.box(40, 260, 40, st, x - 80, 0, -260); A.box(40, 260, 40, st, x + 80, 0, -260); A.box(220, 44, 50, dk, x, 260, -260); }   // ark
      else { A.cyl(10, 90, A.lam('#3f8a3a'), x, 0, -200); A.cyl(7, 40, A.lam('#3f8a3a'), x + 18, 40, -200); A.cyl(7, 46, A.lam('#3f8a3a'), x - 16, 30, -200); }  // kaktus
    }
    // uzoqda qumtepalar va piramidalar
    const du = A.lam('#e8c48a');
    for (let x = x0 - 2000; x < x1 + 2000; x += A.srr(500, 900)) { const d = A.sph(A.srr(400, 800), du, x, -200, A.srr(-1600, -900), false); d.scale.y *= .35; }
    const py = new T.ConeGeometry(1, 1, 4);
    [[.3, 900], [.42, 600], [.7, 1100]].forEach(q => { const o = new T.Mesh(py, new T.MeshLambertMaterial({ color: '#d4aa6a', flatShading: true })); o.scale.set(q[1], q[1] * .9, q[1]); o.position.set(x0 + (x1 - x0) * q[0], q[1] * .45 - 120, -3600); o.rotation.y = Math.PI / 4; add(o, A); });
    const sand = U.particles(A, { n: 220, col: '#e8c890', size: 9, op: 0, y: [0, 520], z: [-260, 240], vx: () => 600 * ((B.hazInfo && B.hazInfo().sdir) || 1), sway: 30 });
    // qum bo'roni: tuman quyuqlashadi, qum zarrachalari ko'rinadi
    const fog = A.scene.fog = new T.Fog('#e8c890', 2200, 9000), sandC = new T.Color('#c8a070'), clear = new T.Color('#e8c890');
    A.anims.push(() => { const hz = B.hazInfo && B.hazInfo(), s = hz ? hz.storm : 0, d = hz ? hz.sdir : 1; fog.near = 2200 - s * 2000; fog.far = 9000 - s * 7600; fog.color.copy(clear).lerp(sandC, s); sand.material.opacity = s * .9; sand.userData.vx = d; });
    A.hemi.color.set('#fff0d0'); A.hemi.groundColor.set('#b08050'); A.hemi.intensity = .8; A.sun.color.set('#fff2d0'); A.sun.intensity = 1;
    A.sunOff.set(-600, 1600, 500);
  };

  // ---------- Metro poyezdi (vagon tomida jang) ----------
  TM.train = (A, x0, x1) => {
    A.scene.background = A.sky(['#0a0f24', '#1a2450', '#4a3a78', '#c86a7a']);
    const roof = A.floor(A.lam('#ffffff', { map: A.floorTex('tile', '#8a93a6', '#5a6276', (x1 - x0) / 90, 2) }), 140, -140, x0, x1);
    shine(roof, 40, '#5a6276');
    // vagon yon tomoni: derazalari yoniq
    const win = A.canvasTex(128, 64, (c, w, h) => { c.fillStyle = '#c8ccd6'; c.fillRect(0, 0, w, h); c.fillStyle = '#e63946'; c.fillRect(0, 44, w, 8); c.fillStyle = '#ffe9a8'; for (let x = 10; x < w; x += 40) c.fillRect(x, 10, 28, 24); }, (x1 - x0) / 220, 1);
    const side = A.mesh(A.plG, new T.MeshLambertMaterial({ map: win, emissive: '#ffffff', emissiveMap: win, emissiveIntensity: .25 }), (x0 + x1) / 2, -150, 141, x1 - x0, 300, 1, false);
    for (let x = x0; x < x1; x += 700) { A.box(40, 30, 270, A.lam('#3a3f52'), x, 0, 0); A.box(70, 26, 50, A.lam('#5a6276'), x + 350, 0, -90); }   // vagonlar ulanishi va konditsioner
    // pastda tez o'tayotgan relslar
    const rt = A.canvasTex(64, 64, (c, w, h) => { c.fillStyle = '#2a2a30'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a3a2a'; for (let x = 0; x < w; x += 16) c.fillRect(x, 0, 8, h); c.fillStyle = '#9aa0b0'; c.fillRect(0, 20, w, 4); c.fillRect(0, 40, w, 4); }, (x1 - x0) / 60, 4);
    const gr = A.mesh(A.plG, tm({ map: rt }), (x0 + x1) / 2, -320, -200, x1 - x0, 900, 1, false); gr.rotation.x = -Math.PI / 2;
    const SPEED = 900;
    A.anims.push(t => { rt.offset.x = (t * SPEED / 60) % 1; });
    // yonidan uchib o'tayotgan ustunlar va simlar
    const poles = [];
    for (let i = 0; i < 6; i++) { const p = A.box(16, 620, 16, A.lam('#3a3f52'), 0, -320, -330); p.userData.bx = i * 500; poles.push(p); const arm = A.box(120, 10, 10, A.lam('#3a3f52'), 0, 280, -300); arm.userData.bx = i * 500 + 50; poles.push(arm); }
    scroller(A, poles, SPEED, 3000);
    // o'rta masofadagi binolar (sekinroq o'tadi)
    const fs = A.facade('#2b2f5e', '#ffd86b', .4), bl = [];
    for (let i = 0; i < 14; i++) { const w = A.srr(180, 320), h = A.srr(300, 900), tx = fs.clone(); tx.needsUpdate = true; tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(Math.round(w / 70), Math.round(h / 140)); const b = A.box(w, h, 160, tb({ map: tx }), 0, -320, -1100, false); b.userData.bx = i * 360; bl.push(b); }
    scroller(A, bl, SPEED * .35, 14 * 360);
    A.skyline(x0 - 2000, x1 + 2500, -320, [-2600], '#151a3a', '#ffd86b', .25, true);
    U.particles(A, { n: 90, col: '#cfd8ff', size: 5, op: .6, y: [20, 500], z: [-200, 200], vx: -1400 });
    A.hemi.color.set('#b0a8ff'); A.hemi.groundColor.set('#201838'); A.hemi.intensity = .7; A.sun.color.set('#ff9a8a'); A.sun.intensity = .55;
    A.scene.fog = new T.Fog('#3a2a5a', 1400, 6500);
  };

  // ---------- Kema palubasi ----------
  TM.ship = (A, x0, x1) => {
    A.scene.background = A.sky(['#3a8ad8', '#7ec0f0', '#d8f0ff']);
    A.floor(A.lam('#ffffff', { map: A.floorTex('plank', '#a87444', '#6a4422', (x1 - x0) / 240, 3) }), 240, -220, x0, x1);
    // dengiz: to'lqinlanadigan sirt
    const sg = new T.PlaneGeometry(x1 - x0 + 6000, 3800, 90, 30); sg.rotateX(-Math.PI / 2);
    const sea = new T.Mesh(sg, new T.MeshPhongMaterial({ color: '#1f6fae', shininess: 80, specular: '#bfe8ff', flatShading: true }));
    sea.position.set((x0 + x1) / 2, -150, -2000); add(sea, A);
    const sp = sg.attributes.position, base = Float32Array.from(sp.array);
    A.anims.push(t => { for (let i = 0; i < sp.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; sp.array[i * 3 + 1] = Math.sin(x * .004 + t * 1.3) * 22 + Math.cos(z * .006 + t * .9) * 16; } sp.needsUpdate = true; sg.computeVertexNormals(); });
    // kema bortlari (oldi va orqasi) va panjara
    A.box(x1 - x0, 300, 40, A.lam('#5a2e1a'), (x0 + x1) / 2, -300, 250);
    A.box(x1 - x0, 50, 30, A.lam('#6a3a20'), (x0 + x1) / 2, 0, -225);
    for (let x = x0; x < x1; x += 80) A.box(6, 70, 6, A.lam('#d8c8a8'), x, 50, -222);
    A.box(x1 - x0, 6, 8, A.lam('#d8c8a8'), (x0 + x1) / 2, 118, -222);
    // machtalar va yelkanlar
    const cloth = new T.MeshLambertMaterial({ color: '#f4eedc', side: T.DoubleSide });
    for (let x = x0 + 400; x < x1; x += 1100) {
      A.cyl(14, 1100, A.lam('#5a3a20'), x, 0, -170);
      A.box(420, 12, 12, A.lam('#5a3a20'), x, 820, -150);
      const sl = new T.Mesh(new T.PlaneGeometry(400, 360, 8, 4), cloth); sl.position.set(x, 630, -140); sl.castShadow = true; add(sl, A);
      const sp2 = sl.geometry.attributes.position, b2 = Float32Array.from(sp2.array);
      A.anims.push(t => { for (let i = 0; i < sp2.count; i++) { const px = b2[i * 3], py = b2[i * 3 + 1]; sp2.array[i * 3 + 2] = (1 - Math.abs(px) / 200) * (38 + 8 * Math.sin(t * 1.6 + py * .01)); } sp2.needsUpdate = true; });
      A.cyl(3, 4, A.lam('#3a2a1a'), x, 0, 0);
    }
    // uzoqdagi orollar
    for (let i = 0; i < 5; i++) { const o = new T.Mesh(new T.ConeGeometry(1, 1, 7), new T.MeshLambertMaterial({ color: '#3a7a4a', flatShading: true })); const s = A.srr(300, 700); o.scale.set(s, s * .5, s); o.position.set(A.srr(x0 - 1500, x1 + 1500), -150 + s * .2, A.srr(-4600, -3600)); add(o, A); }
    // bulutlar va chayqalar
    const ct = A.canvasTex(128, 64, (c) => { const g = c.createRadialGradient(64, 36, 4, 64, 36, 60); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(64, 34, 62, 26, 0, 0, TAU); c.fill(); });
    for (let i = 0; i < 10; i++) { const m = A.plane(A.srr(600, 1200), A.srr(150, 260), tb({ map: ct, transparent: true, depthWrite: false, fog: false }), A.srr(x0 - 1500, x1 + 1500), A.srr(800, 1800), -4400); const s = A.srr(10, 25), bx = m.position.x; A.anims.push(t => { m.position.x = bx + t * s; }); }
    const gull = A.canvasTex(32, 16, c => { c.strokeStyle = '#ffffff'; c.lineWidth = 3; c.beginPath(); c.moveTo(2, 10); c.quadraticCurveTo(9, 2, 16, 9); c.quadraticCurveTo(23, 2, 30, 10); c.stroke(); });
    U.particles(A, { n: 10, col: '#ffffff', size: 40, map: gull, op: .95, y: [450, 750], z: [-900, -500], w: 1500, vx: 60, sway: 40 });
    A.hemi.color.set('#e8f6ff'); A.hemi.groundColor.set('#6a5a40'); A.hemi.intensity = .85; A.sun.color.set('#fff6e0'); A.sun.intensity = .9;
    A.scene.fog = new T.Fog('#bfe0f4', 2500, 7500);
  };

  // ---------- Neon arena ----------
  TM.neon = (A, x0, x1) => {
    A.scene.background = new T.Color('#07020f');
    const gt = A.canvasTex(128, 128, (c, w) => { c.fillStyle = '#0a0418'; c.fillRect(0, 0, w, w); c.strokeStyle = '#ff2fd0'; c.lineWidth = 3; c.shadowColor = '#ff2fd0'; c.shadowBlur = 8; c.strokeRect(1, 1, w - 2, w - 2); c.strokeStyle = '#2ff6ff'; c.shadowColor = '#2ff6ff'; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, w); c.moveTo(0, w / 2); c.lineTo(w, w / 2); c.stroke(); }, (x1 - x0) / 140, 6);
    const fl = A.floor(A.lam('#ffffff', { map: gt }), 500, -320, x0, x1);
    fl.material.emissive = new T.Color('#ffffff'); fl.material.emissiveMap = gt; shine(fl, 60, '#6a4a9a');
    A.anims.push(t => { const b = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * .9)), 6); fl.material.emissiveIntensity = .45 + b * .6; });
    // zinapoyali tomoshabinlar o'rindiqlari va olomon
    for (let k = 0; k < 4; k++) A.box(x1 - x0, 70 + k * 80, 90, A.lam(k % 2 ? '#1a1030' : '#22143a'), (x0 + x1) / 2, 0, -380 - k * 90);
    const n = 700, cg = new T.BufferGeometry(), cp = new Float32Array(n * 3), cc = new Float32Array(n * 3), pal = ['#ff4dd2', '#2ff6ff', '#ffd23f', '#ffffff', '#7a5cff'].map(c => new T.Color(c));
    for (let i = 0; i < n; i++) { const k = Math.floor(A.sr() * 4); cp[i * 3] = A.srr(x0, x1); cp[i * 3 + 1] = 70 + k * 80 + 14; cp[i * 3 + 2] = -380 - k * 90 + A.srr(-20, 20); const c = pal[Math.floor(A.sr() * pal.length)]; cc[i * 3] = c.r; cc[i * 3 + 1] = c.g; cc[i * 3 + 2] = c.b; }
    cg.setAttribute('position', new T.BufferAttribute(cp, 3)); cg.setAttribute('color', new T.BufferAttribute(cc, 3));
    const crowd = new T.Points(cg, new T.PointsMaterial({ size: 16, map: U.dot(A), vertexColors: true, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    add(crowd, A); A.anims.push(t => { crowd.material.opacity = .65 + .35 * Math.sin(t * 5.7); crowd.position.y = Math.abs(Math.sin(t * 5.7)) * 4; });
    // katta LED ekranlar
    for (let x = x0 + 300; x < x1; x += 1200) {
      const tx = A.canvasTex(128, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#ff2fd0'); g.addColorStop(.5, '#2a0a5a'); g.addColorStop(1, '#2ff6ff'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'italic 900 30px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FIGHT!', w / 2, h / 2); }, 1, 1);
      tx.wrapS = T.RepeatWrapping;
      A.box(520, 280, 20, A.lam('#120a20'), x, 560, -760);
      A.plane(500, 260, tb({ map: tx }), x, 700, -748);
      A.anims.push(t => { tx.offset.x = (t * .12) % 1; });
    }
    // neon chiziqli ustunlar
    for (let x = x0; x < x1; x += 600) { A.box(30, 900, 30, A.lam('#140a24'), x, 0, -300); A.box(6, 900, 6, A.glow(x % 1200 ? '#ff2fd0' : '#2ff6ff'), x, 0, -284, false); }
    // aylanib turuvchi projektorlar
    for (let i = 0; i < 6; i++) {
      const bx = x0 + (x1 - x0) * (i + .5) / 6, c = i % 2 ? '#ff2fd0' : '#2ff6ff';
      const geo = new T.ConeGeometry(120, 900, 18, 1, true); geo.translate(0, -450, 0);
      const beam = new T.Mesh(geo, tb({ color: c, transparent: true, opacity: .14, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide }));
      beam.position.set(bx, 880, -200); add(beam, A);
      const ph = i * 1.3; A.anims.push(t => { beam.rotation.z = Math.sin(t * .8 + ph) * .5; beam.rotation.x = Math.cos(t * .6 + ph) * .25; });
    }
    U.particles(A, { n: 80, col: '#ff9af0', size: 7, add: true, y: [40, 600], z: [-300, 150], vy: 20, sway: 30 });
    A.hemi.color.set('#d0a0ff'); A.hemi.groundColor.set('#1a0830'); A.hemi.intensity = .6; A.sun.color.set('#ff8af0'); A.sun.intensity = .5;
    A.scene.fog = new T.Fog('#12061f', 1800, 6000);
  };
})();
