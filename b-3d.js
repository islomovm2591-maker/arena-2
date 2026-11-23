'use strict';
// ===== Stickman Jang 2 — 3D qatlam (Three.js): sahna, kamera, 3D xaritalar =====
// O'yin mantig'i 2D koordinatalarda qoladi (x — o'ng, y — pastga, GY — yer chizig'i).
// 3D dunyoda: X = o'yin x, Y = GY - o'yin y (yuqoriga), Z = chuqurlik (manfiy — uzoqda).
// Kamera shunday turadiki, Z = 0 tekisligi 2D ekran bilan piksel-piksel ustma-ust tushadi:
// shuning uchun jangchilar (hozircha 2D) 3D pol ustida aniq turadi.
(function () {
  const GY = B.GY, TAU = Math.PI * 2;
  const G3 = B.g3 = { ok: false, on: () => false, render: () => { }, resize: () => { } };
  if (!window.THREE) return;
  const T = window.THREE;

  let R, cv3;
  try {
    cv3 = document.getElementById('c3');
    R = new T.WebGLRenderer({ canvas: cv3, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { return; }
  if (!R || !R.getContext()) return;
  R.setClearColor(0x000000, 1);
  R.shadowMap.enabled = true;
  R.shadowMap.type = T.PCFSoftShadowMap;
  R.outputEncoding = T.sRGBEncoding;
  G3.ok = true;
  G3.on = () => G3.ok && B.S0.set.g3 !== 0;

  const FOV = 40, D = 270 / Math.tan(FOV / 2 * Math.PI / 180);   // Z=0 tekislikda 540 birlik balandlik ko'rinadi
  const camera = new T.PerspectiveCamera(FOV, B.VW / 540, 20, 9000);
  const scene = new T.Scene();
  let root = null, key = '', anims = [], sun = null, hemi = null, alarmL = null;

  // ---------- O'lcham ----------
  G3.resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, B.dprCap);
    R.setPixelRatio(dpr); R.setSize(innerWidth, innerHeight, true);
    const x = B.ox / dpr, y = B.oy / dpr, w = B.VW * B.S / dpr, h = 540 * B.S / dpr;
    R.setViewport(x, y, w, h); R.setScissor(x, y, w, h); R.setScissorTest(true);
    camera.aspect = B.VW / 540; camera.updateProjectionMatrix();
  };
  const r0 = B.resize; B.resize = () => { r0(); G3.resize(); };
  addEventListener('resize', G3.resize);

  // ---------- Yordamchilar ----------
  let seed = 1;
  const sr = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const srr = (a, b) => a + sr() * (b - a);
  const col = c => new T.Color(c);
  const mcache = {};
  const lam = (c, o) => { const k = 'l' + c + JSON.stringify(o || 0); return mcache[k] || (mcache[k] = new T.MeshLambertMaterial(Object.assign({ color: col(c) }, o || {}))); };
  const glow = (c, o) => { const k = 'g' + c + JSON.stringify(o || 0); return mcache[k] || (mcache[k] = new T.MeshBasicMaterial(Object.assign({ color: col(c), fog: true }, o || {}))); };
  const boxG = new T.BoxGeometry(1, 1, 1), cylG = new T.CylinderGeometry(1, 1, 1, 14), sphG = new T.SphereGeometry(1, 16, 12), plG = new T.PlaneGeometry(1, 1);
  function mesh(g, m, x, y, z, sx, sy, sz, sh) {
    const o = new T.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz);
    if (sh !== false) { o.castShadow = true; o.receiveShadow = true; }
    root.add(o); return o;
  }
  // quti: y — pastki qirrasi
  const box = (w, h, d, m, x, y, z, sh) => mesh(boxG, m, x, y + h / 2, z, w, h, d, sh);
  const cyl = (r, h, m, x, y, z, sh) => mesh(cylG, m, x, y + h / 2, z, r, h, r, sh);
  const sph = (r, m, x, y, z, sh) => mesh(sphG, m, x, y, z, r, r, r, sh);
  const plane = (w, h, m, x, y, z) => mesh(plG, m, x, y, z, w, h, 1, false);
  function canvasTex(w, h, draw, rx, ry) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
    const tx = new T.CanvasTexture(cv); tx.encoding = T.sRGBEncoding; tx.anisotropy = 4;
    if (rx) { tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(rx, ry || 1); }
    return tx;
  }
  const sky = stops => canvasTex(4, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  // bino fasadi: derazalar (ba'zilari yoniq)
  function facade(base, lit, chance) {
    return canvasTex(64, 128, (c, w, h) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h);
      for (let y = 6; y < h - 6; y += 12) for (let x = 5; x < w - 5; x += 11) {
        c.fillStyle = sr() < chance ? (sr() < .3 ? '#fff3c4' : lit) : 'rgba(0,0,0,.35)'; c.fillRect(x, y, 6, 7);
      }
    });
  }
  // polga naqsh: taxta, plitka, panjara...
  const floorTex = (kind, a, b, rx, ry) => canvasTex(128, 128, (c, w, h) => {
    c.fillStyle = a; c.fillRect(0, 0, w, h); c.strokeStyle = b; c.lineWidth = 3;
    if (kind === 'plank') { for (let y = 0; y < h; y += 32) { c.strokeRect(-2, y, w + 4, 32); c.beginPath(); c.moveTo((y * 1.7) % w, y); c.lineTo((y * 1.7) % w, y + 32); c.stroke(); } }
    else if (kind === 'tile') { c.strokeRect(0, 0, 64, 64); c.strokeRect(64, 0, 64, 64); c.strokeRect(0, 64, 64, 64); c.strokeRect(64, 64, 64, 64); }
    else if (kind === 'grate') { for (let i = 0; i < w; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }
    else if (kind === 'tatami') { c.lineWidth = 5; c.strokeRect(0, 0, 128, 64); c.strokeRect(0, 64, 64, 64); c.strokeRect(64, 64, 64, 64); c.globalAlpha = .12; for (let i = 0; i < h; i += 4) { c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }
    else if (kind === 'road') { c.fillStyle = b; for (let x = 0; x < w; x += 64) c.fillRect(x + 8, 60, 34, 6); }
    else { c.globalAlpha = .18; for (let i = 0; i < 160; i++) { c.fillStyle = sr() < .5 ? b : '#fff'; c.fillRect(sr() * w, sr() * h, 3, 3); } }
  }, rx, ry);
  const floor = (m, z0, z1, x0, x1, y) => { const o = mesh(plG, m, (x0 + x1) / 2, y || 0, (z0 + z1) / 2, x1 - x0, z0 - z1, 1, false); o.rotation.x = -Math.PI / 2; o.receiveShadow = true; return o; };
  const wall = (m, z, x0, x1, h) => { const o = mesh(plG, m, (x0 + x1) / 2, h / 2, z, x1 - x0, h, 1, false); o.receiveShadow = true; return o; };
  const stars = (n, c) => {
    const g = new T.BufferGeometry(), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { p[i * 3] = srr(-4000, 9000); p[i * 3 + 1] = srr(700, 3400); p[i * 3 + 2] = -5200; }
    g.setAttribute('position', new T.BufferAttribute(p, 3));
    const o = new T.Points(g, new T.PointsMaterial({ color: col(c), size: 7, fog: false })); root.add(o); return o;
  };
  // uzoqdagi shahar: bir necha qavat binolar
  function skyline(x0, x1, yb, zs, base, lit, chance, antenna) {
    const fs = [facade(base, lit, chance), facade(base, lit, chance * .7), facade(base, lit, chance * 1.2)];
    zs.forEach((z, k) => {
      for (let x = x0; x < x1;) {
        const w = srr(110, 260), h = srr(250, 900) * (1 + k * .35), tx = fs[Math.floor(sr() * 3)].clone(); tx.needsUpdate = true;
        tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(Math.max(1, Math.round(w / 70)), Math.max(1, Math.round(h / 140)));
        box(w, h, 120, new T.MeshBasicMaterial({ map: tx, color: col(k ? '#9aa0c8' : '#ffffff') }), x + w / 2, yb, z, false);
        if (antenna && sr() < .3) { cyl(2, 80, glow(base), x + w / 2, yb + h, z, false); const b = sph(6, glow('#ff4d4d'), x + w / 2, yb + h + 82, z, false); anims.push(t => { b.visible = Math.sin(t * 3 + x) > .1; }); }
        x += w + srr(10, 90);
      }
    });
  }

  // ---------- Xaritalar ----------
  // x0..x1 — qurish oralig'i (bosqich uzunligidan kengroq: uzoq qatlamlar kengroq ko'rinadi)
  const TH = {
    room(x0, x1) {
      scene.background = col('#2a1d12');
      floor(lam('#ffffff', { map: floorTex('plank', '#b98552', '#8a5a30', (x1 - x0) / 220, 3) }), 500, -300, x0, x1);
      wall(lam('#f7ead0'), -300, x0, x1, 900);
      box(x1 - x0, 26, 10, lam('#dcc08a'), (x0 + x1) / 2, 0, -294);
      for (let x = x0; x < x1; x += 420) {
        const wx = x + 120;
        box(170, 170, 8, lam('#fffaf0'), wx, 150, -297, false);
        plane(150, 150, glow('#bfe6ff'), wx, 235, -292);
        box(6, 150, 4, lam('#fffaf0'), wx, 160, -290, false); box(150, 6, 4, lam('#fffaf0'), wx, 232, -290, false);
        if (sr() < .5) { box(150, 50, 70, lam('#7c4a8f'), x + 320, 0, -250); box(150, 50, 20, lam('#6a3c7c'), x + 320, 50, -275); }
        else { box(80, 180, 40, lam('#9b6a3e'), x + 320, 0, -278); for (let s = 0; s < 3; s++) box(70, 4, 34, lam('#6d4524'), x + 320, 45 + s * 55, -270, false); }
      }
      hemi.color.set('#fff3dd'); hemi.groundColor.set('#6b4a2a'); hemi.intensity = .75; sun.color.set('#ffe7bf'); sun.intensity = .55;
      scene.fog = new T.Fog('#2a1d12', 2000, 6000);
    },
    lab(x0, x1) {
      scene.background = col('#0f2226');
      floor(lam('#ffffff', { map: floorTex('tile', '#a4c5cd', '#7fa5ae', (x1 - x0) / 128, 6) }), 500, -320, x0, x1);
      wall(lam('#e2f1f3'), -320, x0, x1, 900);
      for (let x = x0; x < x1; x += 160) box(4, 900, 4, lam('#c3dde2'), x, 0, -318, false);
      for (let x = x0; x < x1; x += 520) {
        box(240, 70, 70, lam('#566470'), x + 150, 0, -260); box(250, 8, 80, lam('#7e8d99'), x + 150, 70, -260);
        for (let k = 0; k < 4; k++) { const tb = cyl(9, srr(30, 55), glow(['#2bd9c5', '#6bff8f', '#5ab8ff'][k % 3], { transparent: true, opacity: .8 }), x + 60 + k * 55, 78, -255, false); anims.push(t => { tb.material.opacity = .65 + .25 * Math.sin(t * 2 + k); }); }
        cyl(45, 220, lam('#2b8795', { transparent: true, opacity: .45 }), x + 400, 0, -250, false);
        const lq = cyl(40, 150, glow('#38f2ff', { transparent: true, opacity: .35 }), x + 400, 10, -250, false);
        anims.push(t => { lq.scale.y = 150 + 10 * Math.sin(t * 1.5 + x); });
        box(260, 10, 40, glow('#f4ffff'), x + 260, 560, -200, false);
      }
      hemi.color.set('#e8ffff'); hemi.groundColor.set('#3d5a60'); hemi.intensity = .8; sun.color.set('#dffcff'); sun.intensity = .5;
      scene.fog = new T.Fog('#0f2226', 2200, 6000);
    },
    factory(x0, x1) {
      scene.background = col('#140e18');
      floor(lam('#ffffff', { map: floorTex('grate', '#4a3a40', '#2a1e24', (x1 - x0) / 64, 5) }), 500, -360, x0, x1);
      wall(lam('#3c2a36'), -360, x0, x1, 1100);
      [120, 300, 470].forEach((y, i) => { const p = mesh(cylG, lam(i === 1 ? '#a8531f' : '#5c4a52'), (x0 + x1) / 2, y, -330 + i * 6, 16 - i * 3, x1 - x0, 16 - i * 3); p.rotation.z = Math.PI / 2; });
      for (let x = x0; x < x1; x += 480) {
        cyl(20, 700, lam('#5c4a52'), x + 60, 0, -320);
        box(180, 160, 110, lam('#2e2228'), x + 260, 0, -280); plane(90, 60, glow('#ff7a1f'), x + 260, 60, -224);
        const wl = sph(10, glow('#e63946'), x + 60, 620, -300, false); anims.push(t => { wl.material.color.set(Math.sin(t * 5 + x) > 0 ? '#ff3b3b' : '#4a0c10'); });
        if (sr() < .6) { box(70, 70, 70, lam('#7a5a3a'), x + 400, 0, -200); box(60, 60, 60, lam('#6a4a2e'), x + 405, 70, -205); }
      }
      hemi.color.set('#ffb48a'); hemi.groundColor.set('#2a1418'); hemi.intensity = .55; sun.color.set('#ff9a5a'); sun.intensity = .6;
      scene.fog = new T.Fog('#140e18', 1600, 5000);
    },
    dojo(x0, x1) {
      scene.background = col('#1a080b');
      floor(lam('#ffffff', { map: floorTex('tatami', '#c9a66b', '#6b4a22', (x1 - x0) / 200, 3) }), 500, -300, x0, x1);
      const shoji = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffe9bd'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a0f14'; c.lineWidth = 4; for (let i = 0; i <= w; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); } }, (x1 - x0) / 160, 3);
      const sw = wall(glow('#ffffff', { map: shoji }), -300, x0, x1, 480); sw.position.y = 240;
      wall(lam('#2a0f14'), -302, x0, x1, 1200);
      box(x1 - x0, 40, 30, lam('#4a1a1e'), (x0 + x1) / 2, 480, -295);
      for (let x = x0; x < x1; x += 360) {
        box(30, 900, 30, lam('#4a1a1e'), x, 0, -285);
        const ln = sph(22, glow('#ff5a3a'), x + 180, 420, -200, false), lc = cyl(2, 70, lam('#2a0f14'), x + 180, 440, -200, false);
        anims.push(t => { const a = Math.sin(t * 1.3 + x) * .06; ln.position.x = x + 180 + Math.sin(a) * 60; lc.rotation.z = a; });
      }
      hemi.color.set('#ffd9a0'); hemi.groundColor.set('#3a1410'); hemi.intensity = .65; sun.color.set('#ffcf8a'); sun.intensity = .55;
      scene.fog = new T.Fog('#1a080b', 1800, 5500);
    },
    roof(x0, x1, o) {
      scene.background = sky(o.sunset ? ['#1a0f40', '#6e2a7a', '#ff5a4a', '#ffb36b', '#ffe0a3'] : ['#2a1a5e', '#8e3b8f', '#ff6f61', '#ffb36b']);
      floor(lam('#ffffff', { map: floorTex('noise', '#5a4a6a', '#2a2238', (x1 - x0) / 160, 3) }), 500, -160, x0, x1);
      box(x1 - x0, 34, 20, lam('#4a3a5a'), (x0 + x1) / 2, 0, -150);
      for (let x = x0; x < x1; x += 620) {
        box(90, 70, 70, lam('#8a8fa8'), x + 120, 0, -110); const fan = cyl(28, 4, lam('#3a3f58'), x + 120, 70, -110);
        anims.push(t => { fan.rotation.y = t * 6; });
        if (sr() < .5) { cyl(55, 110, lam('#7a4a3a'), x + 400, 110, -120); for (let k = -1; k <= 1; k += 2) box(8, 110, 8, lam('#3a2a2a'), x + 400 + k * 40, 0, -120); }
      }
      skyline(x0 - 1500, x1 + 2500, -700, [-900, -1700, -2600], '#1f2a6e', '#ffd86b', .25, true);
      const s = sph(260, glow('#ffd08a', { fog: false }), x0 + (x1 - x0) * .55, 150, -6000, false); s.material.fog = false;
      hemi.color.set('#ffc4a0'); hemi.groundColor.set('#3a2050'); hemi.intensity = .7; sun.color.set('#ffb070'); sun.intensity = o.sunset ? .95 : .75;
      scene.fog = new T.Fog(o.sunset ? '#c0506a' : '#a04a80', 1500, 6500);
    },
    street(x0, x1) {
      scene.background = sky(['#0d1433', '#1d2a5b', '#5a4a8a', '#c06a7a']);
      floor(lam('#ffffff', { map: floorTex('road', '#232a52', '#d8d06a', (x1 - x0) / 128, 1) }), 500, -140, x0, x1);
      box(x1 - x0, 14, 160, lam('#3a3f6a'), (x0 + x1) / 2, 0, -220);
      const fs = [facade('#2b2f5e', '#ffd86b', .45), facade('#3a2a4e', '#ffb0d0', .4), facade('#1f3a4a', '#9ff0ff', .4)];
      for (let x = x0; x < x1;) {
        const w = srr(220, 360), h = srr(420, 760), tx = fs[Math.floor(sr() * 3)].clone(); tx.needsUpdate = true; tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(Math.round(w / 70), Math.round(h / 140));
        box(w, h, 140, new T.MeshLambertMaterial({ map: tx, emissive: col('#ffffff'), emissiveMap: tx, emissiveIntensity: .55 }), x + w / 2, 14, -380);
        const sg = plane(w * .6, 46, glow(['#ff4d8a', '#38f2ff', '#ffd23f', '#7dff6a'][Math.floor(sr() * 4)]), x + w / 2, 90, -308);
        anims.push(t => { sg.visible = Math.sin(t * 2.2 + x * .01) > -.85; });
        x += w + srr(20, 60);
      }
      for (let x = x0; x < x1; x += 520) { cyl(4, 260, lam('#20243e'), x, 14, -160); sph(14, glow('#fff0b0'), x, 278, -160, false); }
      skyline(x0 - 1500, x1 + 2500, 0, [-1600, -2600], '#151a3a', '#ffd86b', .2, true);
      hemi.color.set('#b0a8ff'); hemi.groundColor.set('#201838'); hemi.intensity = .6; sun.color.set('#ff9a8a'); sun.intensity = .45;
      scene.fog = new T.Fog('#3a2a5a', 1600, 6500);
    },
    night(x0, x1) {
      scene.background = sky(['#02030e', '#05061a', '#14123a', '#2d1f5a', '#5a2f6e']);
      floor(lam('#ffffff', { map: floorTex('noise', '#1e1c38', '#0c0b1c', (x1 - x0) / 160, 3) }), 500, -160, x0, x1);
      box(x1 - x0, 34, 20, lam('#14122a'), (x0 + x1) / 2, 0, -150);
      for (let x = x0; x < x1; x += 700) { box(120, 50, 60, lam('#2a2848'), x + 200, 0, -110); cyl(3, 160, lam('#2a2848'), x + 500, 0, -120); const r = sph(5, glow('#ff4d4d'), x + 500, 162, -120, false); anims.push(t => { r.visible = Math.sin(t * 3 + x) > 0; }); }
      skyline(x0 - 1500, x1 + 2500, -700, [-900, -1700, -2600], '#0b0d26', '#ffd86b', .35, true);
      stars(400, '#eef3ff');
      const m = sph(170, glow('#eef3ff', { fog: false }), x0 + (x1 - x0) * .7, 1500, -5000, false); m.material.fog = false;
      hemi.color.set('#8a9aff'); hemi.groundColor.set('#0c0a1e'); hemi.intensity = .5; sun.color.set('#cfd8f5'); sun.intensity = .55;
      scene.fog = new T.Fog('#14123a', 1500, 6000);
    }
  };

  // ---------- Sahnani qurish (bosqich o'zgarganda) ----------
  function build(L) {
    if (root) {
      scene.remove(root);
      root.traverse(o => { if (o.material && !Object.values(mcache).includes(o.material)) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
      Object.values(mcache).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); for (const k in mcache) delete mcache[k];
    }
    while (scene.children.length) scene.remove(scene.children[0]);
    root = new T.Group(); scene.add(root); anims = [];
    seed = 1 + (B.LV.indexOf(L) + 2) * 7919;
    hemi = new T.HemisphereLight(0xffffff, 0x444444, .7); scene.add(hemi);
    sun = new T.DirectionalLight(0xffffff, .6); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -900, right: 900, top: 700, bottom: -300, near: 10, far: 2600 });
    sun.shadow.bias = -.002; scene.add(sun); scene.add(sun.target);
    alarmL = null;
    const len = L.len || 3000, fn = TH[L.bg] || TH.room;
    fn(-1200, len + 1600, L);
    if (L.alarm) { alarmL = new T.AmbientLight(0xff2020, 0); scene.add(alarmL); }
  }

  // ---------- Har kadr ----------
  // cam — 2D kamera siljishi; shx/shy — silkinish; zm, sx, sy — 2D'dagi zum markazi (mantiqiy koordinatada)
  G3.render = (cam, t, L, shx, shy, zm, sx, sy) => {
    const k = L.bg + '|' + L.len + '|' + (L.alarm ? 1 : 0) + (L.sunset ? 1 : 0) + '|' + L.n;
    if (k !== key) { key = k; build(L); }
    const VW = B.VW;
    if (Math.abs(camera.aspect - VW / 540) > 1e-4) G3.resize();
    zm = zm || 1;
    const qx = (sx || 0) + (VW / 2 - shx - (sx || 0)) / zm, qy = (sy || 0) + (270 - shy - (sy || 0)) / zm;
    camera.position.set(cam + qx, GY - qy, D / zm);
    const cx = cam + VW / 2;
    sun.position.set(cx - 500, 1400, 900); sun.target.position.set(cx, 0, -200);
    if (alarmL) alarmL.intensity = .25 + .25 * Math.sin(t * 6);
    for (let i = 0; i < anims.length; i++) anims[i](t);
    R.render(scene, camera);
  };
  G3.dbg = () => ({ scene, camera, R, key });
  G3.show = v => { cv3.style.display = v ? 'block' : 'none'; document.body.classList.toggle('g3', !!v); };
  G3.show(false);
})();
