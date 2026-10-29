'use strict';
// ===== Stickman Jang 2 — qahramonlar: ma'lumot, neon aura, sahna (menyu uchun), lazer to'ri =====
(function () {
  const TAU = Math.PI * 2, GY = B.GY;

  // m: o'yin bonuslari (dmg zarba, spd tezlik, hp jon, coin tanga, mpg energiya yig'ish, sk maxsus zarba narxi, atk hujum davomiyligi)
  B.HEROES = {
    muz: { n: 'Muz', t: 'Muzlik jangchisi', el: 'ice', col: '#4fe8ff', lite: '#e4fcff', acc: '#ff4d7a', price: 0, gem: 0, bg: ['#030d14', '#08323f', '#14788f'], perk: 'Tez qo\'l: hujum 8% tezroq', m: { atk: .92 } },
    alanga: { n: 'Alanga', t: 'Olov o\'roqchisi', el: 'fire', col: '#ff5a3a', lite: '#ffe2b0', acc: '#ffe27a', price: 800, gem: 0, bg: ['#1a0602', '#5a1a06', '#c8741a'], perk: '+15% zarba kuchi', m: { dmg: 1.15 } },
    chaqmoq: { n: 'Chaqmoq', t: 'Bo\'ron ustasi', el: 'bolt', col: '#43ff7a', lite: '#e0ffe9', acc: '#0b3a1a', price: 1800, gem: 0, bg: ['#020d06', '#073a22', '#12905a'], perk: '+10% tezlik, energiya tez to\'ladi', m: { spd: 1.1, mpg: 1.4 } },
    quyosh: { n: 'Quyosh', t: 'Oltin himoyachi', el: 'gold', col: '#ffd23f', lite: '#fff6c8', acc: '#d62839', price: 3200, gem: 0, bg: ['#140c02', '#4a2e08', '#b9801a'], perk: '+20% jon, +15% tanga', m: { hp: 1.2, coin: 1.15 } },
    sehr: { n: 'Sehr', t: 'Soya sehrgari', el: 'arcane', col: '#d36bff', lite: '#f8e2ff', acc: '#4cd9ff', price: 0, gem: 20, bg: ['#0a0212', '#31105a', '#7a2fc0'], perk: 'Maxsus zarba 20% arzon', m: { sk: .8 } },
    farishta: { n: 'Farishta', t: 'Nur elchisi', el: 'halo', col: '#fff0a0', lite: '#ffffff', acc: '#ffd23f', price: 0, gem: 40, band: false, bg: ['#0f0d06', '#3e3615', '#a8993f'], perk: '+10% zarba, +10% jon, +5% tezlik', m: { dmg: 1.1, hp: 1.1, spd: 1.05 } }
  };
  B.HORDER = ['muz', 'alanga', 'chaqmoq', 'quyosh', 'sehr', 'farishta'];
  B.heroDef = id => B.HEROES[id || (B.S0 && B.S0.hero)] || B.HEROES.muz;
  const rgba = B.rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return 'rgba(' + (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')'; };
  const rs = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };           // 0..1 (barqaror tasodif)

  // ---------- Neon aura (jangchi atrofida) ----------
  // x,y — tanasi markazi; k — o'lcham (o'yinda 1, menyuda ~2); I — kuch 0..1
  B.aura = (c, H, x, y, t, k, I) => {
    I = I == null ? 1 : I;
    c.save(); c.globalCompositeOperation = 'lighter';
    const R = 118 * k * (1 + .04 * Math.sin(t * 3)), g = c.createRadialGradient(x, y, 4, x, y, R);
    g.addColorStop(0, rgba(H.col, .36 * I)); g.addColorStop(1, rgba(H.col, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
    const el = H.el;
    if (el === 'fire') {
      for (let i = 0; i < 9; i++) {
        const ph = (t * (.8 + rs(i) * .5) + rs(i + 9)) % 1, fx = x + (rs(i + 3) - .5) * 74 * k, fy = y + 60 * k - ph * 150 * k, r = (1 - ph) * (8 + rs(i + 5) * 9) * k * .85;
        c.globalAlpha = (1 - ph) * .95 * I; c.fillStyle = ph < .3 ? '#fff0a8' : ph < .65 ? '#ffb02e' : '#ff4a1c';
        c.beginPath(); c.moveTo(fx, fy - r * 2.3); c.quadraticCurveTo(fx + r, fy - r * .3, fx, fy + r); c.quadraticCurveTo(fx - r, fy - r * .3, fx, fy - r * 2.3); c.fill();
      }
    } else if (el === 'bolt') {
      const q = Math.floor(t * 12); c.lineCap = 'round'; c.lineJoin = 'round';
      for (let i = 0; i < 4; i++) {
        const s = q * 7 + i * 13, a0 = rs(s) * TAU, len = (50 + rs(s + 1) * 60) * k, ca = Math.cos(a0), sa = Math.sin(a0);
        c.beginPath(); c.moveTo(x + ca * 22 * k, y + sa * 34 * k);
        for (let j = 1; j <= 6; j++) { const d = 22 * k + len * j / 6, jg = (rs(s + j * 5) - .5) * 26 * k; c.lineTo(x + ca * d - sa * jg, y + sa * d * .95 + ca * jg); }
        c.strokeStyle = rgba(H.col, .6 * I); c.lineWidth = 5 * k * .6; c.stroke(); c.strokeStyle = 'rgba(255,255,255,' + (.9 * I) + ')'; c.lineWidth = 1.6 * k * .6; c.stroke();
      }
    } else if (el === 'gold') {
      c.save(); c.translate(x, y); c.rotate(t * .25);
      for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; c.fillStyle = rgba(H.col, .13 * I); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - .1) * 190 * k, Math.sin(a - .1) * 190 * k); c.lineTo(Math.cos(a + .1) * 190 * k, Math.sin(a + .1) * 190 * k); c.closePath(); c.fill(); }
      c.restore();
      for (let i = 0; i < 8; i++) { const ph = (t * .6 + rs(i)) % 1, fx = x + (rs(i + 4) - .5) * 80 * k, fy = y + 50 * k - ph * 130 * k, r = (1 - ph) * 3.4 * k; c.globalAlpha = (1 - ph) * I; c.fillStyle = '#fff4b8'; c.beginPath(); c.moveTo(fx, fy - r * 2); c.lineTo(fx + r * .6, fy); c.lineTo(fx, fy + r * 2); c.lineTo(fx - r * .6, fy); c.closePath(); c.fill(); }
    } else if (el === 'ice') {
      c.lineCap = 'round';
      c.strokeStyle = rgba(H.col, .5 * I); c.lineWidth = 5 * k * .7; c.beginPath(); c.ellipse(x, y, 62 * k, 78 * k, t * 1.1, 0, 1.5); c.stroke();
      c.strokeStyle = rgba('#ffffff', .4 * I); c.lineWidth = 3 * k * .7; c.beginPath(); c.ellipse(x, y, 74 * k, 58 * k, -t * 1.4, 2.6, 4.2); c.stroke();
      for (let i = 0; i < 7; i++) { const ang = t * .7 + i * TAU / 7, ex = x + Math.cos(ang) * (52 + 9 * Math.sin(t * 2 + i)) * k, ey = y + Math.sin(ang) * 74 * k, r = (3 + rs(i) * 2.4) * k; c.globalAlpha = .85 * I; c.fillStyle = H.lite; c.beginPath(); c.moveTo(ex, ey - r * 1.6); c.lineTo(ex + r, ey); c.lineTo(ex, ey + r * 1.6); c.lineTo(ex - r, ey); c.closePath(); c.fill(); }
    } else if (el === 'arcane') {
      c.strokeStyle = rgba(H.col, .55 * I); c.lineWidth = 2.6 * k * .7; c.beginPath(); c.ellipse(x, y + 58 * k, 58 * k, 15 * k, 0, 0, TAU); c.stroke();
      c.beginPath(); c.ellipse(x, y + 58 * k, 38 * k, 9 * k, 0, 0, TAU); c.stroke();
      for (let i = 0; i < 3; i++) {
        const ang = t * 1.8 + i * TAU / 3, ex = x + Math.cos(ang) * 58 * k, ey = y + 20 * k + Math.sin(ang) * 22 * k - 20 * k * Math.sin(t + i);
        for (let j = 5; j >= 0; j--) { const a2 = ang - j * .16; c.globalAlpha = (1 - j / 6) * .8 * I; c.fillStyle = j ? rgba(H.col, 1) : '#fff'; c.beginPath(); c.arc(x + Math.cos(a2) * 58 * k, y + 20 * k + Math.sin(a2) * 22 * k - 20 * k * Math.sin(t + i), (6 - j) * .9 * k, 0, TAU); c.fill(); }
      }
    } else if (el === 'halo') {
      for (let i = -3; i <= 3; i++) { const bw = (10 + rs(i + 9) * 8) * k, bx = x + i * 17 * k, a = .1 + .07 * Math.sin(t * 2 + i); c.fillStyle = rgba('#ffffff', a * I); c.beginPath(); c.moveTo(bx - bw * .4, y + 64 * k); c.lineTo(bx + bw * .4, y + 64 * k); c.lineTo(bx + bw, y - 120 * k); c.lineTo(bx - bw, y - 120 * k); c.closePath(); c.fill(); }
      for (let i = 0; i < 8; i++) { const ph = (t * .5 + rs(i)) % 1, fx = x + (rs(i + 4) - .5) * 90 * k, fy = y + 56 * k - ph * 150 * k; c.globalAlpha = (1 - ph) * I; c.fillStyle = '#fff'; c.beginPath(); c.arc(fx, fy, (1 - ph) * 3 * k, 0, TAU); c.fill(); }
    }
    c.restore();
  };

  // ---------- Qahramon paneli (tanlash ekrani va bosh menyu): fon + poydevor + jangchi ----------
  // w,h — maydon o'lchami; o: { wep, sel, big, bgOnly }
  const backdrop = (c, H, w, h, t) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, H.bg[0]); g.addColorStop(.55, H.bg[1]); g.addColorStop(1, H.bg[2]); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.save(); c.globalCompositeOperation = 'lighter';
    const el = H.el;
    if (el === 'fire') { // katta olov oyi
      const gr = c.createRadialGradient(w * .55, h * .3, 4, w * .55, h * .3, w * .62); gr.addColorStop(0, 'rgba(255,230,120,.85)'); gr.addColorStop(.5, 'rgba(255,140,40,.5)'); gr.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = gr; c.beginPath(); c.arc(w * .55, h * .3, w * .62, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,200,90,.55)'; c.lineWidth = w * .035; c.beginPath(); c.arc(w * .55, h * .3, w * .46 + Math.sin(t * 2) * 3, Math.PI * .95, Math.PI * 2.05); c.stroke();
    } else if (el === 'bolt') {
      const q = Math.floor(t * 8); c.lineJoin = 'round';
      for (let i = 0; i < 3; i++) { const s = q + i * 11, x0 = w * (.15 + rs(s) * .7); c.beginPath(); c.moveTo(x0, 0); for (let j = 1; j <= 7; j++) c.lineTo(x0 + (rs(s + j) - .5) * w * .45, j / 7 * h * .6); c.strokeStyle = 'rgba(120,255,160,' + (.18 + .3 * rs(s + 3)) + ')'; c.lineWidth = 7; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.6; c.stroke(); }
    } else if (el === 'gold') {
      c.save(); c.translate(w * .5, h * .4); c.rotate(t * .12); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillStyle = 'rgba(255,210,90,.1)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a - .09) * h, Math.sin(a - .09) * h); c.lineTo(Math.cos(a + .09) * h, Math.sin(a + .09) * h); c.closePath(); c.fill(); } c.restore();
      c.strokeStyle = 'rgba(255,220,120,.6)'; c.lineWidth = w * .05; c.beginPath(); c.arc(w * .5, h * .42, w * .5, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
    } else if (el === 'ice') {
      c.strokeStyle = 'rgba(180,250,255,.35)'; c.lineCap = 'round';
      for (let i = 0; i < 4; i++) { c.lineWidth = w * (.03 + i * .008); c.beginPath(); c.arc(w * .5, h * .45, w * (.3 + i * .12), t * (.6 + i * .15) + i, t * (.6 + i * .15) + i + 1.3); c.stroke(); }
    } else if (el === 'arcane') {
      for (let i = 0; i < 4; i++) { const gr = c.createRadialGradient(w * (.2 + .2 * i), h * (.2 + .15 * ((i * 7) % 4)), 2, w * (.2 + .2 * i), h * (.2 + .15 * ((i * 7) % 4)), w * .45); gr.addColorStop(0, 'rgba(200,110,255,.35)'); gr.addColorStop(1, 'rgba(200,110,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }
      for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(255,255,255,' + (.35 + .5 * Math.sin(t * 2 + i)) + ')'; c.fillRect(rs(i) * w, rs(i + 30) * h * .7, 2, 2); }
    } else if (el === 'halo') {
      for (let i = -4; i <= 4; i++) { c.fillStyle = 'rgba(255,255,230,' + (.07 + .05 * Math.sin(t + i)) + ')'; c.beginPath(); c.moveTo(w * .5, -10); c.lineTo(w * .5 + i * w * .26 - w * .06, h); c.lineTo(w * .5 + i * w * .26 + w * .06, h); c.closePath(); c.fill(); }
    }
    c.restore();
    // pastki qorong'ilik (poydevor fon bilan qo'shilishi uchun)
    const gb = c.createLinearGradient(0, h * .6, 0, h); gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(1, 'rgba(0,0,0,.55)'); c.fillStyle = gb; c.fillRect(0, h * .6, w, h * .4);
  };
  B.backdrop = backdrop;

  B.pedestal = (c, H, x, y, rw, t, I) => {
    I = I == null ? 1 : I;
    c.save();
    c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(x, y + rw * .06, rw * 1.06, rw * .26, 0, 0, TAU); c.fill();
    const g = c.createLinearGradient(0, y - rw * .2, 0, y + rw * .22); g.addColorStop(0, '#3a3c4a'); g.addColorStop(1, '#14151d');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, rw, rw * .22, 0, 0, TAU); c.fill();
    c.strokeStyle = '#08080d'; c.lineWidth = 2.5; c.stroke();
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = rgba(H.col, .85 * I); c.lineWidth = Math.max(2, rw * .05); c.beginPath(); c.ellipse(x, y, rw * .86, rw * .18, 0, 0, TAU); c.stroke();
    c.strokeStyle = rgba(H.col, .4 * I); c.lineWidth = Math.max(1.5, rw * .03); c.beginPath(); c.ellipse(x, y, rw * .6, rw * .125, 0, 0, TAU); c.stroke();
    const pulse = (t * .7) % 1; c.strokeStyle = rgba(H.col, (1 - pulse) * .6 * I); c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, rw * (.5 + pulse * .6), rw * (.1 + pulse * .12), 0, 0, TAU); c.stroke();
    c.restore();
  };

  // jangchi + poydevor + aura. fig — drawFig uchun obyekt qismlari; (x, gy) — oyoq ostidagi nuqta
  B.heroStage = (c, H, x, gy, sc, t, o) => {
    o = o || {};
    const k = sc / 1.3;
    B.pedestal(c, H, x, gy + 6, 40 * sc * .9, t, o.I);
    B.aura(c, H, x, gy - 56 * sc, t, k, o.I == null ? 1 : o.I);
    const atk = o.atk, cyc = (t % 3) / 3;
    const wl = (B.W[o.wep || 'pipe'] || { len: 60 }).len;
    const f = { type: 'hero', hd: H, x, z: 0, gy, face: o.face || 1, sc, pk: 'show', pu: 0, t, ph: 0, wep: o.wep || 'pipe', vx: 0, num: 0, wscale: Math.min(1, (o.maxw || 200) / (wl * sc)) };
    if (atk && cyc > .55 && cyc < .9) { f.pk = 's1'; f.pu = Math.min(1, (cyc - .55) / .35); }
    B.drawFig(c, f, B.poseOf(f), {});
    return f;
  };

  B.heroPanel = (c, H, w, h, t, o) => {
    o = o || {};
    c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip();
    backdrop(c, H, w, h, t);
    B.heroStage(c, H, w * .4, h * .76, h * .0066, t, { wep: o.wep, atk: false, I: o.locked ? .4 : 1, maxw: h * .4 });
    if (o.locked) { c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(0, 0, w, h); }
    c.restore();
  };

  // ---------- Lazer to'ri (maxsus zarba paytida: kesishuvchi yorug' chiziqlar) ----------
  // p — 0..1 (vaqt), (x,y) — markaz
  B.drawWeb = (c, x, y, p, col, seed) => {
    const n = 10, fade = 1 - Math.max(0, (p - .35) / .65);
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const gr = Math.min(1, Math.max(0, (p - i * .012) / .16)); if (gr <= 0) continue;
      const ang = i / n * Math.PI + (rs(seed + i) - .5) * .5, off = (rs(seed + i + 40) - .5) * 190, L = 1500 * gr;
      const cx = x - Math.sin(ang) * off, cy = y + Math.cos(ang) * off * .6, dx = Math.cos(ang), dy = Math.sin(ang) * .62;
      c.beginPath(); c.moveTo(cx - dx * L * .15, cy - dy * L * .15); c.lineTo(cx + dx * L, cy + dy * L); c.moveTo(cx - dx * L * .15, cy - dy * L * .15); c.lineTo(cx - dx * L, cy - dy * L);
      c.strokeStyle = rgba(col, .38 * fade); c.lineWidth = 13 * (1 - p * .5); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,' + (.95 * fade) + ')'; c.lineWidth = 3.2 * (1 - p * .4); c.stroke();
    }
    c.restore();
  };
})();
