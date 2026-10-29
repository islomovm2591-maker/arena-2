'use strict';
// ===== Stickman Jang — tasvir: jangchi, qurollar, fonlar, effektlar (hammasi kod bilan chiziladi) =====
(function () {
  const GY = B.GY = 452;
  const TAU = Math.PI * 2;

  // ---------- Qurollar (ma'lumot) ----------
  B.W = {
    pipe: { n: 'Quvur', d: 'Boshlang\'ich qurol', dmg: 14, dur: .32, reach: 82, kb: 120, len: 66, price: 0, skill: 'wave', col: '#9fb4c8', pose: 's' },
    katana: { n: 'Katana', d: 'Tez va o\'tkir', dmg: 20, dur: .32, reach: 104, kb: 140, len: 104, price: 250, skill: 'wave', col: '#7fd6ff', pose: 's' },
    spear: { n: 'Nayza', d: 'Uzun masofa', dmg: 24, dur: .4, reach: 152, kb: 150, len: 142, price: 900, skill: 'wave', col: '#ffd166', pose: 't' },
    axe: { n: 'Jang boltasi', d: 'Og\'ir zarba, aylanma hujum', dmg: 34, dur: .46, reach: 98, kb: 230, len: 94, price: 700, skill: 'spin', col: '#ff9f43', pose: 's' },
    hammer: { n: 'Bolg\'a', d: 'Yerni larzaga soladi', dmg: 50, dur: .6, reach: 94, kb: 320, len: 96, price: 1200, skill: 'pound', col: '#ff6b6b', pose: 's' },
    dual: { n: 'Qo\'sh xanjar', d: 'Juda tez', dmg: 12, dur: .26, reach: 76, kb: 90, len: 48, price: 1800, skill: 'spin', col: '#b6f0ff', pose: 's' },
    plasma: { n: 'Plazma qilich', d: 'Maxsus: 25 olmos', dmg: 42, dur: .3, reach: 124, kb: 200, len: 112, price: 0, gem: 25, skill: 'wave', col: '#38f2ff', pose: 's' },
    great: { n: 'Buyuk qilich', d: 'Katta va og\'ir, keng zarba', dmg: 46, dur: .5, reach: 126, kb: 280, len: 130, price: 2600, skill: 'wave', wsz: 1.35, col: '#b8c4ff', pose: 's' },
    scythe: { n: 'O\'roq', d: 'Aylanib hammani o\'radi', dmg: 38, dur: .42, reach: 136, kb: 230, len: 124, price: 3400, skill: 'spin', col: '#c77dff', pose: 's' },
    flame: { n: 'Alanga qilich', d: 'Maxsus: 30 olmos. Olov!', dmg: 41, dur: .27, reach: 120, kb: 190, len: 112, price: 0, gem: 30, skill: 'wave', col: '#ff7a1f', pose: 's' }
  };
  B.WORDER = ['pipe', 'katana', 'spear', 'axe', 'hammer', 'dual', 'great', 'scythe', 'plasma', 'flame'];

  // ---------- Kichik chizish yordamchilari ----------
  const ln = (c, x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const circ = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const lg = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  B.rr = rr; B.circ = circ; B.lg = lg;
  const shade = (hex, k) => { // k: -1..1
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = k < 0 ? 0 : 255, p = Math.abs(k);
    r = Math.round((f - r) * p + r); g = Math.round((f - g) * p + g); b = Math.round((f - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  B.shade = shade;

  // ---------- Qurol chizish (qo'l nuqtasida, pichoq +x yo'nalishda) ----------
  const WD = {
    pipe(c, L) {
      c.lineCap = 'round';
      c.strokeStyle = '#1d2128'; c.lineWidth = 10; ln(c, -12, 0, L, 0);
      c.strokeStyle = '#8d97a3'; c.lineWidth = 6.5; ln(c, -12, 0, L, 0);
      c.strokeStyle = '#e3e9f0'; c.lineWidth = 2; ln(c, -8, -1.8, L - 6, -1.8);
      c.strokeStyle = '#d62839'; c.lineWidth = 7; c.setLineDash([4, 4]); ln(c, -10, 0, 16, 0); c.setLineDash([]);
      c.strokeStyle = '#1d2128'; c.lineWidth = 10; ln(c, L - 4, 0, L, 0);
    },
    katana(c, L) {
      c.lineCap = 'round';
      c.strokeStyle = '#10151f'; c.lineWidth = 7.5; ln(c, -14, 0, 20, 0);
      c.strokeStyle = '#243a6b'; c.lineWidth = 5.5; ln(c, -14, 0, 20, 0);
      c.strokeStyle = '#9fb7ff'; c.lineWidth = 1.4; c.setLineDash([3, 5]); ln(c, -12, 0, 18, 0); c.setLineDash([]);
      c.fillStyle = '#e6b800'; c.strokeStyle = '#5a4300'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(21, 0, 3.5, 9, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(23, -3.8); c.lineTo(L - 14, -5); c.quadraticCurveTo(L - 4, -4, L + 2, 1.5); c.lineTo(L - 12, 3.4); c.lineTo(23, 3.4); c.closePath();
      c.fillStyle = lg(c, 0, -5, 0, 4, ['#ffffff', '#c9dcf0', '#6e87a3']); c.fill(); c.strokeStyle = '#141b26'; c.lineWidth = 1.6; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1; ln(c, 26, -2.2, L - 10, -3);
    },
    axe(c, L) {
      c.lineCap = 'round';
      c.strokeStyle = '#2a170a'; c.lineWidth = 9; ln(c, -14, 0, L, 0);
      c.strokeStyle = '#8a5a2b'; c.lineWidth = 5.5; ln(c, -14, 0, L, 0);
      c.strokeStyle = '#c28a52'; c.lineWidth = 1.6; ln(c, -10, -1.4, L - 4, -1.4);
      c.beginPath(); c.moveTo(L - 30, -3); c.lineTo(L - 38, -34); c.quadraticCurveTo(L + 6, -48, L + 14, -8); c.lineTo(L + 8, 3); c.lineTo(L - 28, 4); c.closePath();
      c.fillStyle = lg(c, L - 30, -40, L + 10, 0, ['#f4f7fb', '#9aa7b6', '#4b5766']); c.fill(); c.strokeStyle = '#11161d'; c.lineWidth = 2; c.stroke();
      c.beginPath(); c.moveTo(L - 28, 4); c.lineTo(L - 46, 12); c.lineTo(L - 26, -3); c.closePath(); c.fillStyle = '#6b7684'; c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(L - 30, -28); c.quadraticCurveTo(L + 2, -40, L + 8, -10); c.stroke();
    },
    hammer(c, L) {
      c.lineCap = 'round';
      c.strokeStyle = '#2a170a'; c.lineWidth = 9; ln(c, -14, 0, L, 0);
      c.strokeStyle = '#7b4d25'; c.lineWidth = 5.5; ln(c, -14, 0, L, 0);
      c.strokeStyle = '#d62839'; c.lineWidth = 6; c.setLineDash([4, 3]); ln(c, -10, 0, 18, 0); c.setLineDash([]);
      rr(c, L - 26, -26, 44, 52, 7); c.fillStyle = lg(c, 0, -26, 0, 26, ['#e8edf3', '#8996a5', '#3d4856']); c.fill(); c.strokeStyle = '#0f141b'; c.lineWidth = 2.4; c.stroke();
      c.fillStyle = '#d62839'; c.fillRect(L - 26, -5, 44, 10); c.strokeRect(L - 26, -5, 44, 10);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(L - 22, -22, 36, 4);
      circ(c, L - 18, -17, 2, '#222'); circ(c, L + 10, -17, 2, '#222'); circ(c, L - 18, 17, 2, '#222'); circ(c, L + 10, 17, 2, '#222');
    },
    dual(c, L) {
      c.lineCap = 'round';
      c.strokeStyle = '#2a1500'; c.lineWidth = 7; ln(c, -8, 0, 8, 0);
      c.strokeStyle = '#ff9f1c'; c.lineWidth = 4.5; ln(c, -8, 0, 8, 0);
      c.fillStyle = '#444'; c.fillRect(7, -6, 3, 12);
      c.beginPath(); c.moveTo(10, -3.5); c.lineTo(L - 10, -4.5); c.quadraticCurveTo(L + 2, -3, L + 6, 4); c.lineTo(L - 8, 3); c.lineTo(10, 3.5); c.closePath();
      c.fillStyle = lg(c, 0, -5, 0, 4, ['#ffffff', '#bfeaff', '#5aa9d0']); c.fill(); c.strokeStyle = '#0d1a24'; c.lineWidth = 1.6; c.stroke();
    },
    spear(c, L) {
      c.lineCap = 'round';
      c.strokeStyle = '#2a170a'; c.lineWidth = 8; ln(c, -30, 0, L - 20, 0);
      c.strokeStyle = '#a9743c'; c.lineWidth = 4.8; ln(c, -30, 0, L - 20, 0);
      c.strokeStyle = '#d62839'; c.lineWidth = 6; c.setLineDash([5, 4]); ln(c, -6, 0, 24, 0); c.setLineDash([]);
      c.beginPath(); c.moveTo(L - 28, 0); c.lineTo(L - 40, -14); c.lineTo(L - 22, -4); c.closePath(); c.fillStyle = '#e63946'; c.fill();
      c.beginPath(); c.moveTo(L - 24, -2.6); c.quadraticCurveTo(L - 12, -13, L + 14, 0); c.quadraticCurveTo(L - 12, 13, L - 24, 2.6); c.closePath();
      c.fillStyle = lg(c, 0, -12, 0, 12, ['#ffffff', '#c3ccd6', '#6a7684']); c.fill(); c.strokeStyle = '#11161d'; c.lineWidth = 1.8; c.stroke();
    },
    plasma(c, L, t) {
      c.lineCap = 'round';
      c.strokeStyle = '#05080c'; c.lineWidth = 8; ln(c, -12, 0, 18, 0);
      c.strokeStyle = '#2d3b4a'; c.lineWidth = 5.5; ln(c, -12, 0, 18, 0);
      c.fillStyle = '#38f2ff'; c.fillRect(17, -8, 3, 16);
      const pulse = .85 + Math.sin((t || 0) * 14) * .15;
      c.save(); c.globalCompositeOperation = 'lighter';
      c.strokeStyle = 'rgba(56,242,255,' + (.28 * pulse) + ')'; c.lineWidth = 17; ln(c, 20, 0, L, 0);
      c.strokeStyle = 'rgba(120,255,255,.6)'; c.lineWidth = 9; ln(c, 20, 0, L, 0);
      c.restore();
      c.strokeStyle = '#ffffff'; c.lineWidth = 4; ln(c, 20, 0, L - 2, 0);
    },
    great(c, L) {
      c.lineCap = 'round';
      c.strokeStyle = '#0d1020'; c.lineWidth = 9.5; ln(c, -16, 0, 18, 0);
      c.strokeStyle = '#5a2a1a'; c.lineWidth = 6.6; ln(c, -16, 0, 18, 0);
      c.strokeStyle = '#d6a419'; c.lineWidth = 2; c.setLineDash([3, 4]); ln(c, -14, 0, 16, 0); c.setLineDash([]);
      circ(c, -19, 0, 6, '#d6a419'); c.strokeStyle = '#4a3600'; c.lineWidth = 1.6; c.beginPath(); c.arc(-19, 0, 6, 0, TAU); c.stroke();
      c.fillStyle = '#e6b800'; c.strokeStyle = '#4a3600'; c.lineWidth = 2; rr(c, 17, -17, 8, 34, 3); c.fill(); c.stroke();
      circ(c, 21, -17, 3.4, '#d62839'); circ(c, 21, 17, 3.4, '#d62839');
      c.beginPath(); c.moveTo(25, -9); c.lineTo(L - 32, -10); c.lineTo(L + 4, 0); c.lineTo(L - 32, 10); c.lineTo(25, 9); c.closePath();
      c.fillStyle = lg(c, 0, -10, 0, 10, ['#ffffff', '#c8d3f5', '#6c7bb0']); c.fill(); c.strokeStyle = '#121a33'; c.lineWidth = 2.2; c.stroke();
      c.strokeStyle = 'rgba(40,60,130,.6)'; c.lineWidth = 3; ln(c, 32, 0, L - 28, 0);
      c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.3; ln(c, 28, -6, L - 34, -7);
    },
    scythe(c, L, t) {
      c.lineCap = 'round';
      c.strokeStyle = '#1b1020'; c.lineWidth = 9.5; ln(c, -26, 0, L - 16, 0);
      c.strokeStyle = '#6a4a7a'; c.lineWidth = 5.4; ln(c, -26, 0, L - 16, 0);
      c.strokeStyle = '#caa7e8'; c.lineWidth = 1.4; ln(c, -22, -1.6, L - 20, -1.6);
      c.strokeStyle = '#2a1038'; c.lineWidth = 6.4; c.setLineDash([3, 6]); ln(c, -8, 0, 24, 0); c.setLineDash([]);
      c.beginPath(); c.moveTo(L - 30, -3); c.quadraticCurveTo(L - 26, -62, L + 34, -70); c.quadraticCurveTo(L + 2, -46, L - 8, -2); c.closePath();
      c.fillStyle = lg(c, L - 30, -70, L + 20, -4, ['#ffffff', '#cdb4ee', '#6a3fa0']); c.fill(); c.strokeStyle = '#1a0a2e'; c.lineWidth = 2.2; c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(199,125,255,' + (.55 + .25 * Math.sin((t || 0) * 9)) + ')'; c.lineWidth = 5; c.beginPath(); c.moveTo(L + 30, -69); c.quadraticCurveTo(L + 2, -46, L - 8, -4); c.stroke(); c.restore();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(L - 24, -10); c.quadraticCurveTo(L - 22, -52, L + 22, -64); c.stroke();
      circ(c, L - 16, 0, 5, '#caa7e8');
    },
    flame(c, L, t) {
      c.lineCap = 'round'; t = t || 0;
      c.strokeStyle = '#2a0a00'; c.lineWidth = 8; ln(c, -14, 0, 20, 0);
      c.strokeStyle = '#a3200f'; c.lineWidth = 5.6; ln(c, -14, 0, 20, 0);
      c.strokeStyle = '#ffd166'; c.lineWidth = 1.5; c.setLineDash([3, 5]); ln(c, -12, 0, 18, 0); c.setLineDash([]);
      c.fillStyle = '#ffb703'; c.strokeStyle = '#5a2a00'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(21, 0, 3.6, 10, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(24, -4); c.lineTo(L - 14, -5.5); c.quadraticCurveTo(L - 4, -4.5, L + 3, 1.5); c.lineTo(L - 12, 4); c.lineTo(24, 4); c.closePath();
      c.fillStyle = lg(c, 0, -6, 0, 5, ['#fff9d6', '#ffb03a', '#e03a00']); c.fill(); c.strokeStyle = '#4a0f00'; c.lineWidth = 1.8; c.stroke();
      c.save(); c.globalCompositeOperation = 'lighter';
      c.strokeStyle = 'rgba(255,120,20,.35)'; c.lineWidth = 15; ln(c, 26, 0, L - 2, 0);
      for (let i = 0; i < 6; i++) {
        const x = 34 + i * (L - 46) / 5, h = 13 + 8 * Math.sin(t * 15 + i * 1.9) + (i % 2) * 4, w = 7;
        c.fillStyle = 'rgba(255,140,30,.72)'; c.beginPath(); c.moveTo(x - w, -3); c.quadraticCurveTo(x - w * .4, -h * .55, x + Math.sin(t * 11 + i) * 3, -h); c.quadraticCurveTo(x + w * .5, -h * .5, x + w, -3); c.fill();
        c.fillStyle = 'rgba(255,235,140,.85)'; c.beginPath(); c.moveTo(x - w * .5, -3); c.quadraticCurveTo(x, -h * .5, x + Math.sin(t * 11 + i) * 2, -h * .62); c.quadraticCurveTo(x + w * .3, -h * .3, x + w * .5, -3); c.fill();
      }
      c.restore();
    },
    club(c, L) {
      c.beginPath(); c.moveTo(-6, -3.5); c.lineTo(L - 36, -7); c.quadraticCurveTo(L + 6, -16, L + 8, 0); c.quadraticCurveTo(L + 6, 16, L - 36, 7); c.lineTo(-6, 3.5); c.closePath();
      c.fillStyle = lg(c, 0, -14, 0, 14, ['#b07a45', '#7a4a22', '#3d230f']); c.fill(); c.strokeStyle = '#1a0e05'; c.lineWidth = 2.2; c.stroke();
      c.fillStyle = '#c9d1db'; [[L - 30, -9], [L - 12, -13], [L - 12, 13], [L - 30, 9], [L + 4, 0]].forEach(p => { c.beginPath(); c.moveTo(p[0] - 3, p[1] * .7); c.lineTo(p[0] + (p[1] === 0 ? 8 : 0), p[1] * (p[1] === 0 ? 0 : 1.5)); c.lineTo(p[0] + 3, p[1] * .7); c.closePath(); c.fill(); c.stroke(); });
    },
    knife(c, L) {
      c.beginPath(); c.moveTo(0, -2); c.lineTo(L, 0); c.lineTo(0, 2.5); c.closePath(); c.fillStyle = '#cfd8e3'; c.fill(); c.strokeStyle = '#111'; c.lineWidth = 1.4; c.stroke();
      c.strokeStyle = '#3a2a1a'; c.lineWidth = 4; c.lineCap = 'round'; ln(c, -8, 0, 0, 0);
    }
  };
  B.weaponDraw = (c, kind, L, t) => (WD[kind] || WD.pipe)(c, L, t);

  // ---------- Skelet / poza ----------
  const UA = 19, FA = 19, TH = 25, SHN = 25, TOR = 34, HR = 11;
  const I = [.1, 1.0, 1.1, .5, 1.3, .35, .35, -.4, .25, 0, 0, 0];
  const kf = (fr, u) => {
    if (u <= fr[0][0]) return fr[0].slice(1);
    for (let i = 1; i < fr.length; i++) if (u <= fr[i][0]) {
      const a = fr[i - 1], b = fr[i]; let t = (u - a[0]) / (b[0] - a[0]); t = t * t * (3 - 2 * t);
      const o = new Array(12); for (let j = 0; j < 12; j++) o[j] = a[j + 1] + (b[j + 1] - a[j + 1]) * t; return o;
    }
    return fr[fr.length - 1].slice(1);
  };
  //            t   lean  shF  elF  shB  elB hipF  kF  hipB  kB wOff tilt  dx
  const POSES = {
    s1: [[0, ...I], [.32, -.1, -.7, .3, .9, 1.0, .55, .3, -.55, .2, 0, 0, -8], [.5, .35, 1.7, .1, -.4, .5, .75, .5, -.65, .1, 0, 0, 12], [.68, .3, 2.1, 0, -.2, .6, .8, .5, -.6, .1, 0, 0, 16], [1, ...I]],
    s2: [[0, ...I], [.32, -.3, 2.9, .4, 2.2, .6, .3, .4, -.45, .3, .1, -.05, -6], [.5, .5, 1.0, .1, .8, .4, .9, .6, -.7, .15, 0, 0, 14], [.68, .55, .7, .1, .6, .4, .95, .6, -.7, .15, 0, 0, 18], [1, ...I]],
    s3: [[0, ...I], [.4, -.35, 2.7, .8, 2.4, .7, .2, .5, -.6, .5, .1, -.1, -10], [.58, .7, .85, .05, .7, .2, 1.0, .7, -.8, .2, 0, .1, 26], [.78, .7, .85, .05, .7, .2, 1.0, .7, -.8, .2, 0, .1, 26], [1, ...I]],
    t: [[0, ...I], [.3, -.05, -.1, 1.6, .9, 1, .5, .3, -.55, .2, 0, 0, -10], [.5, .3, 1.45, .05, -.2, .6, .85, .5, -.7, .1, 0, 0, 18], [.7, .3, 1.45, .05, -.2, .6, .85, .5, -.7, .1, 0, 0, 18], [1, ...I]],
    wave: [[0, ...I], [.45, -.4, -.9, .2, .7, 1, .5, .4, -.6, .3, 0, 0, -12], [.6, .7, 1.6, .05, .6, .3, 1.0, .7, -.8, .2, 0, 0, 24], [.85, .7, 1.7, .05, .6, .3, 1.0, .7, -.8, .2, 0, 0, 24], [1, ...I]],
    pound: [[0, ...I], [.45, -.4, 3.05, .5, 2.8, .5, .2, .5, -.5, .4, .1, -.1, -8], [.62, .85, .45, 0, .4, 0, 1.0, .7, -.8, .2, 0, .1, 24], [.85, .85, .45, 0, .4, 0, 1.0, .7, -.8, .2, 0, .1, 24], [1, ...I]]
  };
  const HURT = [-.35, 2.0, .7, 1.6, .6, .5, .4, -.5, .3, 0, -.15, -6];
  const JUMP = [.12, 1.7, .5, 1.3, .7, 1.1, 1.3, .2, 1.4, 0, 0, 0];
  const FALL = [.1, 2.3, .4, 1.9, .6, .5, .3, -.3, .3, 0, 0, 0];
  const LIMP = [0, .5, .3, .7, .3, .1, .05, -.1, .05, 0, 0, 0];
  const DIVE = [.95, 2.2, .1, 2.0, .1, -.5, .3, -.9, .2, 0, 0, 0];
  const ARCH = [.05, 1.55, 0, 1.5, 2.2, .35, .3, -.35, .25, 0, 0, 0];
  const PANIC = [.1, 2.6, .3, 2.4, .3, .5, .6, -.5, .5, 0, 0, 0];

  B.poseOf = f => {
    const t = f.t || 0, pk = f.pk || 'idle', u = f.pu || 0;
    switch (pk) {
      case 'idle': { const b = Math.sin(t * 3.2 + (f.num || 0)) * .5; return [I[0] + b * .03, I[1] + b * .05, I[2], I[3] - b * .05, I[4], I[5], I[6] + b * .04, I[7], I[8] + b * .03, 0, 0, 0]; }
      case 'show': { const b = Math.sin(t * 3.2 + (f.num || 0)) * .5; return [.06 + b * .02, .45, .5, -.25 - b * .05, .6, .12 + b * .04, .1, -.35, .2, 2.19, 0, 0]; }   // vitrina: qurol tik
      case 'run': {
        const p = f.ph || 0, s = Math.sin(p), c = Math.cos(p);
        return [.24, .95 + .25 * s, 1.0, .25 - .9 * s, 1.1, .8 * s, .2 + .8 * Math.max(0, -c), -.8 * s, .2 + .8 * Math.max(0, c), 0, 0, 0];
      }
      case 'air': return (f.vz || 0) > 0 ? JUMP : FALL;
      case 'hurt': return HURT;
      case 'down': return LIMP;
      case 'dive': return DIVE;
      case 'arch': return ARCH;
      case 'panic': { const j = Math.sin(t * 40) * .3; return [PANIC[0], PANIC[1] + j, PANIC[2], PANIC[3] - j, PANIC[4], PANIC[5] + j * .5, PANIC[6], PANIC[7] - j * .5, PANIC[8], 0, 0, 0]; }
      case 'spin': { const a = u * 12.566; return [.28, a, 0, a + Math.PI, 0, .5, .5, -.5, .4, 0, 0, 0]; }
      default: {
        const fr = POSES[pk]; if (!fr) return I;
        const P = kf(fr, u);
        if (f.wep === 'dual') { P[3] = P[1] - .6 + Math.sin(u * 9) * .2; P[4] = P[2]; }
        return P;
      }
    }
  };

  B.skel = (f, P, lying) => {
    const sc = f.sc, fc = f.face;
    const lean = P[0], shF = P[1], elF = P[2], shB = P[3], elB = P[4], hipF = P[5], kF = P[6], hipB = P[7], kB = P[8], tilt = P[10], dx = P[11];
    const legY = (h, k) => TH * Math.cos(h) + SHN * Math.cos(h - k);
    const hipH = lying ? 6 / sc : Math.max(legY(hipF, kF), legY(hipB, kB));
    const D = (a) => [Math.sin(a) * fc, Math.cos(a)];
    const hx = f.x + dx * fc, hy = (f.gy || GY) - f.z - hipH * sc;
    const nx = hx + Math.sin(lean) * TOR * sc * fc, ny = hy - Math.cos(lean) * TOR * sc;
    const sx = nx - Math.sin(lean) * 5 * sc * fc, sy = ny + Math.cos(lean) * 5 * sc;
    const hdx = nx + Math.sin(lean + tilt) * (HR + 2) * sc * fc, hdy = ny - Math.cos(lean + tilt) * (HR + 2) * sc;
    const pt = (x, y, a, l) => { const d = D(a); return [x + d[0] * l * sc, y + d[1] * l * sc]; };
    const kneeF = pt(hx, hy, hipF, TH), footF = pt(kneeF[0], kneeF[1], hipF - kF, SHN);
    const kneeB = pt(hx, hy, hipB, TH), footB = pt(kneeB[0], kneeB[1], hipB - kB, SHN);
    const elbF = pt(sx, sy, shF, UA), handF = pt(elbF[0], elbF[1], shF + elF, FA);
    const elbB = pt(sx, sy, shB, UA), handB = pt(elbB[0], elbB[1], shB + elB, FA);
    const wa = shF + elF + P[9], wd = D(wa), wab = shB + elB + P[9], wdb = D(wab);
    return { hx, hy, nx, ny, sx, sy, hdx, hdy, kneeF, footF, kneeB, footB, elbF, handF, elbB, handB, wa, wd, wab, wdb, fc, sc };
  };

  // ---------- Jangchini chizish ----------
  const LOOK = {
    hero: { fill: '#0b0b12', back: '#1c1c2a' },
    grunt: { fill: '#e63946', rim: '#ff3b4a' }, runner: { fill: '#9b5de5', rim: '#b57bff' }, brute: { fill: '#2ecc71', rim: '#35e07a' }, archer: { fill: '#3a86ff', rim: '#4a9bff' }, bomber: { fill: '#ff9f1c', rim: '#ffae2e' }, ogre: { fill: '#2f9e5b', rim: '#3ddc84' }, shield: { fill: '#4b6d9b', rim: '#9fc6ff' }, ninja: { fill: '#3b2f63', rim: '#8a63ff' }, samurai: { fill: '#2b2d42', rim: '#e0242f' }
  };
  B.rimOf = ty => (LOOK[ty] && LOOK[ty].rim) || null;
  const polyline = (c, a) => { c.beginPath(); c.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) c.lineTo(a[i], a[i + 1]); c.stroke(); };

  B.drawFig = (c, f, P, o) => {
    o = o || {};
    const lying = f.pk === 'down';
    const S = B.skel(f, P, lying), sc = f.sc, fc = f.face, t = f.t || 0;
    const hero = f.type === 'hero';
    const look = LOOK[f.type] || LOOK.hero;
    let fill = o.flash ? '#ffffff' : (f.col || look.fill), back = o.flash ? '#e8e8e8' : (look.back || shade(fill, -.22));
    const lw = (hero ? 7.4 : 6.6) * sc, tw = (hero ? 9.2 : 8.4) * sc;
    c.save();
    if (o.alpha != null) c.globalAlpha = o.alpha;
    if (lying || f.rot) { const r = f.rot != null ? f.rot : -1.5 * fc; c.translate(S.hx, S.hy); c.rotate(r); c.translate(-S.hx, -S.hy); }
    c.lineCap = 'round'; c.lineJoin = 'round';
    const parts = (colFront, colBack, extra, deco) => {
      c.lineWidth = lw + extra; c.strokeStyle = colBack;
      polyline(c, [S.sx, S.sy, S.elbB[0], S.elbB[1], S.handB[0], S.handB[1]]);
      if (deco && f.wep === 'dual' && f.pk !== 'down') { c.save(); c.translate(S.handB[0], S.handB[1]); c.rotate(Math.atan2(S.wdb[1], S.wdb[0])); if (fc < 0) c.scale(1, -1); c.scale(sc * .95 * (f.wscale || 1), sc * .95 * (f.wscale || 1)); B.weaponDraw(c, 'dual', 48, t); c.restore(); c.strokeStyle = colBack; c.lineWidth = lw + extra; }
      polyline(c, [S.hx, S.hy, S.kneeB[0], S.kneeB[1], S.footB[0], S.footB[1]]);
      c.strokeStyle = colFront; c.lineWidth = tw + extra; polyline(c, [S.hx, S.hy, S.nx, S.ny]);
      c.lineWidth = lw + extra; polyline(c, [S.hx, S.hy, S.kneeF[0], S.kneeF[1], S.footF[0], S.footF[1]]);
      // bosh
      c.fillStyle = colFront; c.beginPath(); c.arc(S.hdx, S.hdy, HR * sc + extra / 2, 0, TAU); c.fill();
      if (deco) decor(c, f, S, t, o);
      c.strokeStyle = colFront; c.lineWidth = lw + extra;
      polyline(c, [S.sx, S.sy, S.elbF[0], S.elbF[1], S.handF[0], S.handF[1]]);
    };
    if (hero) {
      // neon qahramon: tashqi nur (2 qatlam) + rangli tana + yorqin "naycha" yadrosi
      const H = f.hd || B.HEROES.muz, fl = !!o.flash;
      parts(fl ? '#fff' : B.rgba(H.col, .15), fl ? '#fff' : B.rgba(H.col, .15), 11, false);
      parts(fl ? '#fff' : B.rgba(H.col, .34), fl ? '#fff' : B.rgba(H.col, .3), 4.6, false);
      if (!fl) parts('rgba(4,6,16,.55)', 'rgba(4,6,16,.5)', 3.2, false);                       // yupqa qora chegara: och fonlarda ham ajralib turadi
      parts(fl ? '#fff' : H.col, fl ? '#e8e8e8' : shade(H.col, -.16), 0, true);
      if (!fl) parts(B.rgba(H.lite, .4), B.rgba(H.lite, .22), -lw * .56, false);
    }
    else {
      // dushman: qora siluet + rangli yupqa chegara (tur rangi)
      const rim = o.flash ? '#fff' : (look.rim || f.col || '#e63946'), dk = o.flash ? '#fff' : '#12121b', dk2 = o.flash ? '#e8e8e8' : '#08080e';
      const seg = (arr, w, col) => { c.lineWidth = w + 4.4; c.strokeStyle = rim; polyline(c, arr); c.lineWidth = w; c.strokeStyle = col; polyline(c, arr); };
      seg([S.sx, S.sy, S.elbB[0], S.elbB[1], S.handB[0], S.handB[1]], lw, dk2);
      seg([S.hx, S.hy, S.kneeB[0], S.kneeB[1], S.footB[0], S.footB[1]], lw, dk2);
      seg([S.hx, S.hy, S.nx, S.ny], tw, dk);
      seg([S.hx, S.hy, S.kneeF[0], S.kneeF[1], S.footF[0], S.footF[1]], lw, dk);
      c.beginPath(); c.arc(S.hdx, S.hdy, HR * sc, 0, TAU); c.fillStyle = dk; c.fill(); c.lineWidth = 3.4; c.strokeStyle = rim; c.stroke();
      decor(c, f, S, t, o);
      seg([S.sx, S.sy, S.elbF[0], S.elbF[1], S.handF[0], S.handF[1]], lw, dk);
    }
    // qurol (old qo'lda)
    const wk = f.wep;
    if (wk && f.pk !== 'down') {
      c.save(); c.translate(S.handF[0], S.handF[1]); c.rotate(Math.atan2(S.wd[1], S.wd[0])); if (fc < 0) c.scale(1, -1);
      const wl = (wk === 'club' ? 96 : wk === 'knife' ? 28 : (B.W[wk] ? B.W[wk].len : 60));
      c.scale(sc * (hero ? 1 : .92) * (f.wscale || 1), sc * (hero ? 1 : .92) * (f.wscale || 1));
      if (wk === 'bow') drawBow(c, f.pu || 0, f.pk === 'arch'); else B.weaponDraw(c, wk, wl, t);
      c.restore();
    }
    c.restore();
    return S;
  };

  function drawBow(c, pu, aim) {
    c.lineCap = 'round'; c.strokeStyle = '#2a170a'; c.lineWidth = 6; c.beginPath(); c.arc(-10, 0, 30, -1.2, 1.2); c.stroke();
    c.strokeStyle = '#a9743c'; c.lineWidth = 3.4; c.beginPath(); c.arc(-10, 0, 30, -1.2, 1.2); c.stroke();
    const px = -10 + Math.cos(1.2) * 30, py = Math.sin(1.2) * 30, pull = aim ? -16 : 0;
    c.strokeStyle = '#eee'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(px, -py); c.lineTo(pull + 2, 0); c.lineTo(px, py); c.stroke();
    if (aim) { c.strokeStyle = '#ddd'; c.lineWidth = 2; ln(c, pull + 2, 0, 34, 0); c.fillStyle = '#ddd'; c.beginPath(); c.moveTo(40, 0); c.lineTo(32, -4); c.lineTo(32, 4); c.fill(); }
  }

  function decor(c, f, S, t, o) {
    const sc = f.sc, fc = f.face, x = S.hdx, y = S.hdy, ty = f.type;
    if (ty === 'hero') {
      const H = f.hd || B.HEROES.muz, fl = !!o.flash, top = y - 8 * sc;
      // element belgisi: bosh ustida (olov, shox, toj, muz toji, nur halqasi)
      const spike = (bx, by, dx, len, wid, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(bx - wid, by); c.lineTo(bx + dx * len * .5, by - len); c.lineTo(bx + wid, by); c.closePath(); c.fill(); };
      if (H.el === 'fire') { for (let i = -1; i <= 1; i++) spike(x + i * 6 * sc, top + 2 * sc, -fc * .25 + i * .15, (14 + 6 * Math.sin(t * 9 + i * 2) + (i === 0 ? 8 : 0)) * sc, 4.4 * sc, fl ? '#fff' : (i === 0 ? '#ffd24a' : '#ff8a2a')); }
      else if (H.el === 'bolt') { for (let i = 0; i < 4; i++) spike(x - fc * (i * 3.4 - 2) * sc, top + 1 * sc, -fc * 1.1, (13 - i * 1.5) * sc, 3.4 * sc, fl ? '#fff' : shade(H.col, -.55)); }
      else if (H.el === 'gold') { for (let i = -1; i <= 1; i++) spike(x + i * 6.4 * sc, top + 2 * sc, 0, (i === 0 ? 14 : 10) * sc, 3.2 * sc, fl ? '#fff' : '#fff2a8'); }
      else if (H.el === 'ice') { spike(x, top + 2 * sc, 0, 19 * sc, 4 * sc, fl ? '#fff' : H.lite); spike(x - fc * 6 * sc, top + 3 * sc, -fc * .6, 11 * sc, 3 * sc, fl ? '#fff' : '#bff7ff'); spike(x + fc * 6 * sc, top + 3 * sc, fc * .6, 10 * sc, 3 * sc, fl ? '#fff' : '#bff7ff'); }
      else if (H.el === 'arcane') { [-1, 1].forEach(s => { c.strokeStyle = fl ? '#fff' : shade(H.col, -.45); c.lineWidth = 3.4 * sc; c.beginPath(); c.moveTo(x + s * 6 * sc, top + 2 * sc); c.quadraticCurveTo(x + s * 14 * sc, top - 4 * sc, x + s * 11 * sc, top - 15 * sc); c.stroke(); }); }
      else if (H.el === 'halo') { const hb = Math.sin(t * 2.4) * 1.4 * sc, hy = y - 21 * sc + hb; c.strokeStyle = 'rgba(255,240,150,.4)'; c.lineWidth = 6.4 * sc; c.beginPath(); c.ellipse(x, hy, 11.5 * sc, 3.8 * sc, 0, 0, TAU); c.stroke(); c.strokeStyle = fl ? '#fff' : '#fff2a0'; c.lineWidth = 2.6 * sc; c.beginPath(); c.ellipse(x, hy, 11.5 * sc, 3.8 * sc, 0, 0, TAU); c.stroke(); }
      // ko'zlik chizig'i (qora) + oq ko'z; bosh bog'ich lentasi (halo qahramonda yo'q)
      c.strokeStyle = fl ? '#fff' : '#0a0a14'; c.lineWidth = 4.2 * sc; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x - fc * 9.6 * sc, y - 3.4 * sc); c.lineTo(x + fc * 10.2 * sc, y - 3.4 * sc); c.stroke();
      if (H.band !== false) {
        const sp = Math.min(40, Math.abs(f.vx || 0) / 7), w1 = Math.sin(t * 11) * 3, w2 = Math.sin(t * 11 + 1.5) * 3;
        const bx = x - fc * 9 * sc, by = y - 6.4 * sc;
        c.strokeStyle = fl ? '#fff' : H.acc; c.lineWidth = 3.6 * sc;
        c.beginPath(); c.moveTo(bx, by); c.lineTo(x + fc * 9 * sc, by); c.stroke();
        c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo(bx - fc * (12 + sp * .5) * sc, by + (w1 - 4) * sc, bx - fc * (26 + sp) * sc, by + (w1 + 5 + sp * .1) * sc); c.stroke();
        c.lineWidth = 3 * sc;
        c.beginPath(); c.moveTo(bx, by + 1); c.quadraticCurveTo(bx - fc * (10 + sp * .4) * sc, by + (w2 + 3) * sc, bx - fc * (20 + sp * .8) * sc, by + (w2 + 12 + sp * .1) * sc); c.stroke();
      }
      c.fillStyle = '#fff'; const ex = x + fc * 5.5 * sc; c.beginPath(); c.ellipse(ex + fc * 1.5 * sc, y - 3.2 * sc, 3.4 * sc, 1.8 * sc, 0, 0, TAU); c.fill();
      return;
    }
    const wh = '#fff';
    // ko'zlar va qosh
    const ex1 = x + fc * 2.6 * sc, ex2 = x + fc * 7.2 * sc, ey = y - 1.5 * sc;
    if (ty !== 'ogre') {
      circ(c, ex1, ey, 2.8 * sc, wh); circ(c, ex2, ey, 2.8 * sc, wh);
      circ(c, ex1 + fc * 1 * sc, ey + .3, 1.3 * sc, '#111'); circ(c, ex2 + fc * 1 * sc, ey + .3, 1.3 * sc, '#111');
      c.strokeStyle = '#111'; c.lineWidth = 1.8 * sc; c.lineCap = 'round';
      c.beginPath(); c.moveTo(ex1 - fc * 3 * sc, ey - 5.2 * sc); c.lineTo(ex1 + fc * 3 * sc, ey - 3.2 * sc); c.moveTo(ex2 - fc * 3 * sc, ey - 3.2 * sc); c.lineTo(ex2 + fc * 3 * sc, ey - 5.4 * sc); c.stroke();
    }
    const dk = shade(f.col || '#888', -.45);
    if (ty === 'grunt') { c.strokeStyle = '#f4f1de'; c.lineWidth = 3 * sc; c.beginPath(); c.moveTo(x - fc * 10 * sc, y - 7 * sc); c.lineTo(x + fc * 10 * sc, y - 7 * sc); c.stroke(); c.beginPath(); c.moveTo(x - fc * 9 * sc, y - 7 * sc); c.lineTo(x - fc * 20 * sc, y - 4 * sc + Math.sin(t * 9) * 2); c.stroke(); }
    if (ty === 'runner') { c.fillStyle = dk; c.beginPath(); c.arc(x, y, HR * sc, .15 * Math.PI, .85 * Math.PI); c.fill(); c.strokeStyle = dk; c.lineWidth = 3.6 * sc; c.beginPath(); c.moveTo(x - fc * 7 * sc, y - 8 * sc); c.quadraticCurveTo(x - fc * 22 * sc, y - 16 * sc, x - fc * 28 * sc, y - 4 * sc + Math.sin(t * 10) * 3); c.stroke(); }
    if (ty === 'brute') { c.strokeStyle = '#7a1f1f'; c.lineWidth = 2 * sc; c.beginPath(); c.moveTo(x + fc * 1 * sc, y - 10 * sc); c.lineTo(x + fc * 4 * sc, y - 2 * sc); c.stroke(); circ(c, S.sx - fc * 1 * sc, S.sy + 2 * sc, 7.5 * sc, dk); circ(c, S.sx + fc * 1 * sc, S.sy + 2 * sc, 6 * sc, dk); }
    if (ty === 'archer') { c.fillStyle = dk; c.beginPath(); c.arc(x, y - 1 * sc, HR * sc + 1, Math.PI * 1.05, Math.PI * 1.95); c.closePath(); c.fill(); c.fillStyle = '#6b4423'; const qx = S.sx - fc * 10 * sc, qy = S.sy + 8 * sc; c.save(); c.translate(qx, qy); c.rotate(-fc * .5); c.fillRect(-4 * sc, -4 * sc, 8 * sc, 22 * sc); c.strokeStyle = '#ddd'; c.lineWidth = 1.4; ln(c, -2 * sc, -4 * sc, -3 * sc, -12 * sc); ln(c, 1 * sc, -4 * sc, 2 * sc, -13 * sc); c.restore(); }
    if (ty === 'bomber') {
      const bx = (S.hx + S.nx) / 2 - fc * 12 * sc, by = (S.hy + S.ny) / 2 + 2 * sc;
      circ(c, bx, by, 10 * sc, '#15151c'); c.strokeStyle = '#555'; c.lineWidth = 1.6; c.beginPath(); c.arc(bx, by, 10 * sc, 0, TAU); c.stroke(); circ(c, bx - 3 * sc, by - 3 * sc, 2.6 * sc, 'rgba(255,255,255,.4)');
      c.strokeStyle = '#a88'; c.lineWidth = 2; ln(c, bx, by - 9 * sc, bx - fc * 3 * sc, by - 15 * sc);
      if (Math.sin(t * 18) > 0 || f.pk === 'panic') circ(c, bx - fc * 3 * sc, by - 16 * sc, 3.4 * sc, '#ffd23f');
      c.strokeStyle = '#222'; c.lineWidth = 3 * sc; c.beginPath(); c.arc(x + fc * 4.5 * sc, ey, 6.6 * sc, 0, TAU); c.stroke();
    }
    if (ty === 'shield') {
      c.strokeStyle = '#d9e2ef'; c.lineWidth = 3 * sc; c.beginPath(); c.moveTo(x - fc * 10 * sc, y - 6 * sc); c.lineTo(x + fc * 10 * sc, y - 6 * sc); c.stroke();
      circ(c, x - fc * 3 * sc, y - 8 * sc, 3.4 * sc, '#d9e2ef');                       // dubulg'a cho'qqisi
      if (f.shd > 0) {
        const sx = S.sx + fc * 22 * sc, sy = S.sy + 30 * sc, hh = 40 * sc, ww = 17 * sc, k = f.shdMax ? f.shd / f.shdMax : 1;
        c.save(); c.translate(sx, sy);
        c.beginPath(); c.moveTo(0, -hh); c.quadraticCurveTo(ww * 1.25, -hh * .7, ww, hh * .1); c.quadraticCurveTo(ww * .5, hh * .85, 0, hh); c.quadraticCurveTo(-ww * .5, hh * .85, -ww, hh * .1); c.quadraticCurveTo(-ww * 1.25, -hh * .7, 0, -hh); c.closePath();
        c.fillStyle = f.flash > 0 ? '#fff' : lg(c, -ww, 0, ww, 0, ['#e9eff7', '#9fb0c4', '#56667c']); c.fill(); c.strokeStyle = '#0c121c'; c.lineWidth = 3; c.stroke();
        c.strokeStyle = '#2a3c58'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, -hh * .86); c.lineTo(0, hh * .86); c.moveTo(-ww * .8, -hh * .12); c.lineTo(ww * .8, -hh * .12); c.stroke();
        circ(c, 0, -hh * .12, 4.5 * sc, '#ffd23f');
        if (k < .55) { c.strokeStyle = '#0c121c'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-ww * .6, -hh * .6); c.lineTo(-ww * .1, -hh * .25); c.lineTo(-ww * .5, hh * .1); c.moveTo(ww * .4, hh * .2); c.lineTo(0, hh * .5); c.lineTo(ww * .3, hh * .75); c.stroke(); }
        c.restore();
      }
    }
    if (ty === 'ninja') {
      c.fillStyle = '#14122a'; c.beginPath(); c.arc(x, y + 1 * sc, HR * sc + .5, .05 * Math.PI, .95 * Math.PI); c.fill();            // yuz niqobi
      c.strokeStyle = '#27d3ff'; c.lineWidth = 3.4 * sc; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x - fc * 10 * sc, y - 5 * sc); c.lineTo(x + fc * 10 * sc, y - 5 * sc); c.stroke();
      c.beginPath(); c.moveTo(x - fc * 9 * sc, y - 5 * sc); c.quadraticCurveTo(x - fc * 22 * sc, y - 11 * sc + Math.sin(t * 10) * 2, x - fc * 34 * sc, y - 3 * sc + Math.sin(t * 10 + 1) * 4); c.stroke();
      circ(c, x + fc * 6 * sc, y - 1.2 * sc, 2 * sc, '#ff3b3b');
    }
    if (ty === 'samurai') {
      c.fillStyle = '#9c1220'; c.strokeStyle = '#0a0a12'; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y - 1 * sc, HR * sc + 2, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fill(); c.stroke();                 // kabuto
      c.fillStyle = '#d9a520'; c.beginPath(); c.moveTo(x - fc * 3 * sc, y - 10 * sc); c.lineTo(x + fc * 14 * sc, y - 30 * sc); c.lineTo(x + fc * 5 * sc, y - 9 * sc); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(x - fc * 3 * sc, y - 10 * sc); c.lineTo(x - fc * 18 * sc, y - 29 * sc); c.lineTo(x - fc * 7 * sc, y - 8 * sc); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#ffd23f'; c.beginPath(); c.moveTo(x + fc * 1 * sc, y - 3 * sc); c.lineTo(x + fc * 12 * sc, y - 1 * sc); c.lineTo(x + fc * 1 * sc, y + 1.5 * sc); c.closePath(); c.fill();
      c.strokeStyle = '#c1121f'; c.lineWidth = 3.8 * sc; c.lineCap = 'round';                                                               // belbog' + uchib turgan lenta
      c.beginPath(); c.moveTo(S.hx - fc * 4 * sc, S.hy - 2 * sc); c.quadraticCurveTo(S.hx - fc * 24 * sc, S.hy + 6 * sc + Math.sin(t * 8) * 4, S.hx - fc * 40 * sc, S.hy + 18 * sc + Math.sin(t * 8 + 1) * 5); c.stroke();
      c.strokeStyle = '#c1121f'; c.lineWidth = 7 * sc; c.beginPath(); c.moveTo(S.hx - 7 * sc, S.hy - 3 * sc); c.lineTo(S.hx + 7 * sc, S.hy - 3 * sc); c.stroke();
      c.fillStyle = '#d9a520'; c.beginPath(); c.moveTo(S.sx - 9 * sc, S.sy - 2 * sc); c.lineTo(S.sx + 9 * sc, S.sy - 2 * sc); c.lineTo(S.sx + 6 * sc, S.sy + 8 * sc); c.lineTo(S.sx - 6 * sc, S.sy + 8 * sc); c.closePath(); c.fill();   // yelka plastinasi
    }
    if (ty === 'ogre') {
      circ(c, x + fc * 3 * sc, y - 2 * sc, 2.6 * sc, '#ffec99'); circ(c, x + fc * 8 * sc, y - 2 * sc, 2.6 * sc, '#ffec99');
      circ(c, x + fc * 3.6 * sc, y - 2 * sc, 1.3 * sc, '#c1121f'); circ(c, x + fc * 8.6 * sc, y - 2 * sc, 1.3 * sc, '#c1121f');
      c.strokeStyle = '#111'; c.lineWidth = 2 * sc; c.beginPath(); c.moveTo(x - fc * 1 * sc, y - 7 * sc); c.lineTo(x + fc * 6 * sc, y - 3.4 * sc); c.moveTo(x + fc * 5 * sc, y - 7 * sc); c.lineTo(x + fc * 11 * sc, y - 5 * sc); c.stroke();
      c.fillStyle = '#f2e9d0'; c.strokeStyle = '#111'; c.lineWidth = 1.5;
      [-1, 1].forEach(s => { c.beginPath(); c.moveTo(x + s * 6 * sc - 3 * sc, y - 10 * sc); c.lineTo(x + s * 11 * sc, y - 24 * sc); c.lineTo(x + s * 6 * sc + 4 * sc, y - 9 * sc); c.closePath(); c.fill(); c.stroke(); });
      c.beginPath(); c.moveTo(x + fc * 6 * sc, y + 5 * sc); c.lineTo(x + fc * 8 * sc, y + 1 * sc); c.lineTo(x + fc * 10 * sc, y + 5 * sc); c.fill();
    }
  }

  // yer osti soyasi
  B.shadow = (c, x, z, r, a) => { c.save(); c.globalAlpha = (a == null ? .32 : a) / (1 + z / 120); c.fillStyle = '#000'; c.beginPath(); c.ellipse(x, GY + 3, r * (1 - Math.min(.5, z / 400)), r * .16, 0, 0, TAU); c.fill(); c.restore(); };

  // ---------- Jangari: kosmik ko'rinishlar (robot, vertolyot) ----------
  B.drawMech = (c, e, t, flash) => {
    const x = e.x, gy = GY - e.z, fc = e.face, s = e.sc || 1;
    c.save(); c.translate(x, gy); c.scale(fc * s, s);
    const walk = Math.sin(e.ph || 0), tint = flash ? '#fff' : null;
    const body = tint || '#5c6b82', dark = tint || '#2f3a4d', light = tint || '#9db0cc', acc = tint || '#e63946';
    c.lineJoin = 'round'; c.lineCap = 'round';
    // oyoqlar
    const leg = (ox, ph, col) => {
      const kx = ox + ph * 10, ky = -42;
      c.strokeStyle = '#0b0f16'; c.lineWidth = 24; ln(c, ox, -78, kx, ky); ln(c, kx, ky, ox + ph * 18 - 4, -8);
      c.strokeStyle = col; c.lineWidth = 17; ln(c, ox, -78, kx, ky); ln(c, kx, ky, ox + ph * 18 - 4, -8);
      circ(c, kx, ky, 11, '#0b0f16'); circ(c, kx, ky, 7, light);
      rr(c, ox + ph * 18 - 20, -14, 40, 14, 4); c.fillStyle = dark; c.fill(); c.strokeStyle = '#0b0f16'; c.lineWidth = 2.5; c.stroke();
    };
    leg(-22, walk, dark); leg(22, -walk, body);
    // qo'l-to'p (orqada)
    c.save(); c.translate(-34, -118); c.rotate(.2 + (e.armUp || 0));
    c.strokeStyle = '#0b0f16'; c.lineWidth = 20; ln(c, 0, 0, -6, 38); c.strokeStyle = dark; c.lineWidth = 13; ln(c, 0, 0, -6, 38);
    circ(c, -6, 42, 12, '#0b0f16'); circ(c, -6, 42, 8, light); c.restore();
    // tana
    rr(c, -46, -150, 92, 82, 14); c.fillStyle = lg(c, 0, -150, 0, -68, [light, body, dark]); c.fill(); c.strokeStyle = '#0b0f16'; c.lineWidth = 3.5; c.stroke();
    c.fillStyle = acc; c.fillRect(-40, -104, 80, 8); c.strokeStyle = '#0b0f16'; c.lineWidth = 2; c.strokeRect(-40, -104, 80, 8);
    for (let i = 0; i < 4; i++) { circ(c, -34 + i * 22, -86, 3, '#0b0f16'); }
    // kabina
    rr(c, -2, -176, 50, 34, 11); c.fillStyle = dark; c.fill(); c.strokeStyle = '#0b0f16'; c.lineWidth = 3.2; c.stroke();
    const gl = (e.st === 'wind' || e.st === 'fire') ? '#ffe066' : '#ff5a5f';
    rr(c, 9, -168, 34, 14, 7); c.fillStyle = tint || gl; c.fill();
    c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(14, -166, 14, 3);
    // antenna
    c.strokeStyle = '#0b0f16'; c.lineWidth = 3; ln(c, 28, -176, 24, -196); circ(c, 24, -198, 4, Math.sin(t * 8) > 0 ? '#ff4d4d' : '#6b1a1a');
    // to'p qo'l (old)
    c.save(); c.translate(40, -122); c.rotate((e.armUp || 0) * .5 - .05 + (e.recoil || 0) * -.15);
    rr(c, 0, -13, 66, 26, 7); c.fillStyle = lg(c, 0, -13, 0, 13, [light, body, dark]); c.fill(); c.strokeStyle = '#0b0f16'; c.lineWidth = 3.4; c.stroke();
    rr(c, 62, -10, 36 - (e.recoil || 0) * 6, 20, 5); c.fillStyle = dark; c.fill(); c.stroke();
    c.fillStyle = acc; c.fillRect(20, -13, 8, 26);
    if (e.glow) { const g = c.createRadialGradient(100, 0, 2, 100, 0, 30); g.addColorStop(0, 'rgba(255,230,120,' + e.glow + ')'); g.addColorStop(1, 'rgba(255,100,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(100, 0, 30, 0, TAU); c.fill(); }
    c.restore();
    c.restore();
  };

  B.drawHeli = (c, e, t, flash) => {
    const x = e.x, gy = GY - e.z, fc = e.face;
    c.save(); c.translate(x, gy); c.scale(fc, 1); c.rotate((e.tilt || 0) * .12);
    const tint = flash ? '#fff' : null, body = tint || '#3c4a3a', dark = tint || '#232c22', light = tint || '#6a7e66';
    c.lineJoin = 'round'; c.lineCap = 'round';
    // dum
    c.beginPath(); c.moveTo(-50, -64); c.lineTo(-130, -76); c.lineTo(-134, -88); c.lineTo(-118, -88); c.lineTo(-48, -78); c.closePath(); c.fillStyle = body; c.fill(); c.strokeStyle = '#0b100a'; c.lineWidth = 3.4; c.stroke();
    // dum rotori
    c.save(); c.translate(-128, -82); c.rotate(t * 30); c.strokeStyle = '#0b100a'; c.lineWidth = 4; ln(c, -14, 0, 14, 0); ln(c, 0, -14, 0, 14); c.restore();
    // kokpit-tana
    c.beginPath(); c.ellipse(0, -64, 70, 38, 0, 0, TAU); c.fillStyle = lg(c, 0, -102, 0, -26, [light, body, dark]); c.fill(); c.lineWidth = 3.6; c.stroke();
    c.beginPath(); c.ellipse(28, -72, 34, 24, -.1, Math.PI, TAU * .98 + 0.2); c.closePath(); c.fillStyle = tint || lg(c, 0, -96, 0, -50, ['#bfeaff', '#4aa3d6', '#1d5d86']); c.fill(); c.lineWidth = 2.6; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(34, -82, 12, 4, -.3, 0, TAU); c.fill();
    c.fillStyle = tint || '#e63946'; c.fillRect(-30, -60, 40, 6);
    // slide + pulemyot
    c.strokeStyle = '#0b100a'; c.lineWidth = 4; ln(c, -30, -30, -34, -14); ln(c, 30, -30, 34, -14); ln(c, -54, -12, 54, -12);
    c.strokeStyle = dark; c.lineWidth = 8; ln(c, 52, -40, 84, -34); c.strokeStyle = '#0b100a'; c.lineWidth = 2; ln(c, 52, -44, 84, -38);
    if (e.muzzle) { const g = c.createRadialGradient(88, -34, 1, 88, -34, 16); g.addColorStop(0, 'rgba(255,240,150,.95)'); g.addColorStop(1, 'rgba(255,120,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(88, -34, 16, 0, TAU); c.fill(); }
    // asosiy rotor
    const sw = Math.cos(t * 26);
    c.strokeStyle = '#0b100a'; c.lineWidth = 5; ln(c, 0, -100, 0, -108);
    c.strokeStyle = 'rgba(20,24,18,.85)'; c.lineWidth = 4.6; ln(c, -150 * sw, -110, 150 * sw, -110);
    c.strokeStyle = 'rgba(20,24,18,.16)'; c.lineWidth = 12; ln(c, -150, -110, 150, -110);
    circ(c, 0, -108, 6, '#0b100a');
    if (Math.sin(t * 6) > 0) circ(c, -4, -100, 3.4, '#ff3b3b');
    c.restore();
  };

  // ---------- Fonlar ----------
  const TW = 960;
  let bgd = null;
  const rng = seed => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  B.bgInit = kind => {
    bgd = { kind };
    const r = rng(kind === 'roof' ? 77 : kind === 'street' ? 31 : 11);
    const sky = (n, minH, maxH, wmin, wmax) => { const a = []; let x = 0; while (x < TW) { const w = wmin + r() * (wmax - wmin), h = minH + r() * (maxH - minH); a.push({ x, w, h, ant: r() < .3, win: Math.floor(r() * 3) }); x += w - 2; } return a; };
    bgd.far = sky(0, 80, 210, 60, 130); bgd.mid = sky(0, 110, 270, 70, 150); bgd.win = []; for (let i = 0; i < 160; i++) bgd.win.push(r());
    // g'isht naqshi
    const p = document.createElement('canvas'); p.width = 64; p.height = 40; const q = p.getContext('2d');
    q.fillStyle = 'rgba(0,0,0,.28)'; q.fillRect(0, 0, 64, 40); q.fillStyle = 'rgba(255,200,170,.16)'; q.fillRect(0, 0, 64, 3); q.fillRect(0, 20, 64, 3);
    q.fillStyle = 'rgba(0,0,0,.35)'; q.fillRect(0, 18, 64, 2); q.fillRect(0, 38, 64, 2); q.fillRect(31, 0, 2, 18); q.fillRect(0, 20, 2, 18); q.fillRect(62, 20, 2, 18);
    bgd.brick = B.cx.createPattern(p, 'repeat');
  };
  const tiles = (cam, par, fn) => { const px = cam * par, i0 = Math.floor(px / TW); for (let i = i0; i * TW - px < B.VW + 4; i++) fn(i, i * TW - px, (i % 2 + 2) % 2); };
  const winlit = (c, arr, off, n, col, a) => { c.fillStyle = col; c.globalAlpha = a; }; // (reserved)

  function skyline(c, cam, par, list, col, hor, t, lit, rim) {
    tiles(cam, par, (i, ox) => {
      list.forEach((b, k) => {
        const x = ox + b.x, y = hor - b.h;
        c.fillStyle = col; c.fillRect(x, y, b.w, b.h + 80);
        if (rim) { c.fillStyle = rim; c.fillRect(x, y, b.w, 2.5); }
        if (b.ant) { c.strokeStyle = col; c.lineWidth = 2; ln(c, x + b.w / 2, y, x + b.w / 2, y - 26); if (Math.sin(t * 3 + k) > .2) circ(c, x + b.w / 2, y - 27, 2, '#ff4d4d'); }
        if (lit) for (let wy = y + 12, r = 0; wy < hor - 6; wy += 17, r++) for (let wx = x + 7, cc = 0; wx < x + b.w - 8; wx += 14, cc++) {
          const v = bgd.win[((k * 31 + r * 7 + cc * 13 + (i & 1) * 5) % 160 + 160) % 160];
          if (v > lit) { c.fillStyle = v > .93 ? '#ffd86b' : 'rgba(255,214,120,.65)'; c.fillRect(wx, wy, 6, 8); }
        }
      });
    });
  }

  const BG = {};
  BG.room = (c, cam, t, o) => {
    const VW = B.VW;
    c.fillStyle = lg(c, 0, 0, 0, 440, ['#f7ead0', '#ecd6a5', '#dcc08a']); c.fillRect(0, 0, VW, 442);
    tiles(cam, 1, (i, ox, v) => {
      c.fillStyle = 'rgba(150,100,40,.06)'; for (let x = 0; x < TW; x += 64) c.fillRect(ox + x, 0, 30, 430);
      const win = (x, y, w, h) => {
        x += ox; c.fillStyle = '#fffaf0'; c.fillRect(x - 9, y - 9, w + 18, h + 18);
        c.fillStyle = lg(c, 0, y, 0, y + h, ['#7cc8ff', '#bfe6ff', '#effaff']); c.fillRect(x, y, w, h);
        c.fillStyle = 'rgba(70,110,150,.45)'; for (let k = 0; k < 6; k++) c.fillRect(x + k * w / 6 + 4, y + h - 30 - ((k * 37) % 40), w / 6 - 8, 90);
        c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(x + w * .3, y + h * .3, 26, 10, 0, 0, TAU); c.ellipse(x + w * .42, y + h * .26, 20, 9, 0, 0, TAU); c.fill();
        c.fillStyle = '#fffaf0'; c.fillRect(x + w / 2 - 3, y, 6, h); c.fillRect(x, y + h / 2 - 3, w, 6);
        c.fillStyle = '#b4414f'; c.fillRect(x - 16, y - 18, 34, h + 56); c.fillRect(x + w - 18, y - 18, 34, h + 56);
        c.fillStyle = 'rgba(0,0,0,.14)'; for (let k = 0; k < 3; k++) { c.fillRect(x - 12 + k * 10, y - 18, 3, h + 56); c.fillRect(x + w - 14 + k * 10, y - 18, 3, h + 56); }
        c.fillStyle = '#7a5230'; c.fillRect(x - 24, y - 26, w + 48, 8); c.fillRect(x - 14, y + h + 10, w + 28, 8);
        c.fillStyle = 'rgba(255,240,170,.18)'; c.beginPath(); c.moveTo(x, y + h + 18); c.lineTo(x + w, y + h + 18); c.lineTo(x + w + 90, 442); c.lineTo(x - 40, 442); c.fill();
      };
      const frame = (x, y, w, h, k) => {
        x += ox; c.fillStyle = '#d9a520'; c.fillRect(x - 6, y - 6, w + 12, h + 12); c.fillStyle = '#8c6a10'; c.fillRect(x - 3, y - 3, w + 6, h + 6);
        c.fillStyle = lg(c, 0, y, 0, y + h, k ? ['#ffb86b', '#ff7b8c'] : ['#8fd0ff', '#d9f2ff']); c.fillRect(x, y, w, h);
        c.fillStyle = k ? '#3b2a63' : '#58b36b'; c.beginPath(); c.moveTo(x, y + h); c.quadraticCurveTo(x + w * .35, y + h * .35, x + w * .7, y + h * .7); c.lineTo(x + w, y + h * .6); c.lineTo(x + w, y + h); c.fill();
        circ(c, x + w * .75, y + h * .28, 9, '#fff3b0');
      };
      const shelf = (x, y, w) => {
        x += ox; const cols = ['#e63946', '#2a9d8f', '#f4a261', '#264653', '#8e44ad', '#457b9d', '#e9c46a'];
        let bx = x + 6; for (let k = 0; bx < x + w - 24; k++) { const bw = 11 + (k * 5) % 9, bh = 30 + (k * 13) % 22; c.fillStyle = cols[k % cols.length]; c.fillRect(bx, y - bh, bw, bh); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(bx, y - bh, 2, bh); bx += bw + 1; }
        c.fillStyle = '#8a5a34'; c.fillRect(x, y, w, 9); c.fillStyle = '#5c3b1f'; c.fillRect(x, y + 9, w, 3);
        circ(c, x + w - 14, y - 12, 10, '#e07a5f'); c.fillStyle = '#2d7a3a'; c.beginPath(); c.ellipse(x + w - 14, y - 28, 9, 14, .3, 0, TAU); c.ellipse(x + w - 24, y - 24, 6, 11, -.5, 0, TAU); c.fill();
      };
      const door = (x, y, w, h) => {
        x += ox; c.fillStyle = '#5c3b1f'; c.fillRect(x - 8, y - 8, w + 16, h + 8); c.fillStyle = lg(c, x, 0, x + w, 0, ['#a56a3a', '#8a5a34']); c.fillRect(x, y, w, h);
        c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + 12, y + 16, w - 24, h * .36); c.fillRect(x + 12, y + h * .5, w - 24, h * .4);
        circ(c, x + w - 14, y + h * .55, 5, '#f2c94c');
      };
      const lamp = (x) => {
        x += ox; const g = c.createRadialGradient(x, 230, 8, x, 230, 170); g.addColorStop(0, 'rgba(255,230,150,.45)'); g.addColorStop(1, 'rgba(255,230,150,0)'); c.fillStyle = g; c.fillRect(x - 170, 60, 340, 380);
        c.strokeStyle = '#4a3320'; c.lineWidth = 5; ln(c, x, 440, x, 250); c.fillStyle = '#f4d58d'; c.beginPath(); c.moveTo(x - 26, 260); c.lineTo(x + 26, 260); c.lineTo(x + 16, 214); c.lineTo(x - 16, 214); c.fill(); c.strokeStyle = '#8a6a30'; c.lineWidth = 2; c.stroke();
      };
      const sofa = (x, y, w) => {
        x += ox; c.fillStyle = '#7a1f2b'; rr(c, x, y, w, 70, 16); c.fill(); c.fillStyle = '#c4414f'; rr(c, x + 14, y - 38, w - 28, 66, 14); c.fill(); rr(c, x + 6, y + 10, w - 12, 54, 12); c.fill();
        c.fillStyle = 'rgba(255,255,255,.14)'; rr(c, x + 24, y - 30, w - 48, 14, 6); c.fill(); c.fillStyle = '#7a1f2b'; c.fillRect(x + 8, y + 68, 10, 14); c.fillRect(x + w - 18, y + 68, 10, 14);
        c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x + w / 2 - 1, y + 14, 2, 48);
      };
      const plant = (x, y) => { x += ox; c.fillStyle = '#c1663a'; c.beginPath(); c.moveTo(x - 20, y - 36); c.lineTo(x + 20, y - 36); c.lineTo(x + 14, y); c.lineTo(x - 14, y); c.fill(); c.fillStyle = '#2d8a46'; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x + (k - 2.5) * 9, y - 62 - (k % 2) * 14, 7, 28, (k - 2.5) * .24, 0, TAU); c.fill(); } };
      if (v === 0) { win(90, 60, 210, 190); frame(390, 100, 90, 68, 1); shelf(560, 240, 190); door(790, 120, 120, 310); lamp(350); plant(530, 440); }
      else { frame(90, 95, 84, 110, 0); win(260, 60, 220, 190); sofa(560, 355, 280); frame(600, 120, 100, 70, 1); lamp(880); plant(150, 440); }
    });
    c.fillStyle = '#7a5230'; c.fillRect(0, 428, VW, 14); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(0, 428, VW, 3);
    // pol
    c.fillStyle = lg(c, 0, 442, 0, 540, ['#c9915a', '#a8713f', '#835328']); c.fillRect(0, 442, VW, 100);
    tiles(cam, 1, (i, ox) => {
      c.fillStyle = 'rgba(70,40,15,.5)'; for (let r = 0; r < 5; r++) { const y = 442 + r * 20; c.fillRect(ox, y, TW, 1.5); const off = (r % 2) * 120; for (let x = off; x < TW; x += 240) c.fillRect(ox + x, y, 1.5, 20); }
      c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(ox + 40, 446, 420, 5); c.fillRect(ox + 560, 466, 300, 4);
      c.fillStyle = 'rgba(122,31,43,.55)'; c.beginPath(); c.ellipse(ox + 460, 496, 340, 24, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,220,160,.5)'; c.lineWidth = 3; c.beginPath(); c.ellipse(ox + 460, 496, 322, 19, 0, 0, TAU); c.stroke();
    });
  };

  BG.lab = (c, cam, t, o) => {
    const VW = B.VW;
    c.fillStyle = lg(c, 0, 0, 0, 440, ['#e2f1f3', '#c3dde2', '#a4c5cd']); c.fillRect(0, 0, VW, 442);
    tiles(cam, 1, (i, ox, v) => {
      c.strokeStyle = 'rgba(20,80,100,.12)'; c.lineWidth = 2; for (let x = 0; x <= TW; x += 80) ln(c, ox + x, 60, ox + x, 430); for (let y = 60; y <= 430; y += 80) ln(c, ox, y, ox + TW, y);
      c.fillStyle = '#2b8795'; c.fillRect(ox, 336, TW, 22); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(ox, 336, TW, 4);
      // quvurlar
      c.fillStyle = '#7e8d99'; c.fillRect(ox, 28, TW, 16); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(ox, 30, TW, 4); c.fillStyle = '#566470'; for (let x = 70; x < TW; x += 220) c.fillRect(ox + x, 24, 14, 24);
      c.fillStyle = '#6f7f8b'; c.fillRect(ox + (v ? 420 : 640), 44, 14, 300);
      // chiroqlar
      for (let x = 100; x < TW; x += 300) { c.fillStyle = '#fff'; c.fillRect(ox + x, 50, 140, 8); const g = c.createLinearGradient(0, 58, 0, 330); g.addColorStop(0, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(ox + x, 58); c.lineTo(ox + x + 140, 58); c.lineTo(ox + x + 220, 336); c.lineTo(ox + x - 80, 336); c.fill(); }
      const tank = (x) => {
        x += ox; const y0 = 84, y1 = 424, w = 130;
        c.fillStyle = '#4b5a66'; rr(c, x - 6, y0 - 14, w + 12, 20, 6); c.fill(); rr(c, x - 6, y1 - 6, w + 12, 24, 6); c.fill();
        c.fillStyle = 'rgba(190,230,240,.5)'; rr(c, x, y0, w, y1 - y0, 12); c.fill();
        c.fillStyle = lg(c, 0, 140, 0, y1, ['rgba(130,255,160,.85)', 'rgba(30,170,90,.9)']); rr(c, x + 4, 140, w - 8, y1 - 146, 10); c.fill();
        for (let k = 0; k < 7; k++) { const by = y1 - 12 - ((t * (22 + k * 4) + k * 53) % (y1 - 150)); circ(c, x + 22 + (k * 37) % (w - 44) + Math.sin(t * 2 + k) * 5, by, 3 + k % 3, 'rgba(255,255,255,.65)'); }
        c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x + 12, y0 + 10, 8, y1 - y0 - 30);
        c.strokeStyle = '#2a3640'; c.lineWidth = 3; rr(c, x, y0, w, y1 - y0, 12); c.stroke();
        // ichidagi siluet
        c.fillStyle = 'rgba(10,50,30,.55)'; c.beginPath(); c.arc(x + w / 2, 230 + Math.sin(t * 1.3) * 6, 14, 0, TAU); c.fill(); c.fillRect(x + w / 2 - 6, 242 + Math.sin(t * 1.3) * 6, 12, 60);
      };
      const mon = (x, y, w, h, ph) => {
        x += ox; c.fillStyle = '#1b242c'; rr(c, x - 6, y - 6, w + 12, h + 12, 6); c.fill(); c.fillStyle = '#04201f'; c.fillRect(x, y, w, h);
        c.strokeStyle = '#37ff8b'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k <= w; k += 4) { const yy = y + h / 2 + Math.sin(k * .12 + t * 3 + ph) * h * .28 * Math.sin(k * .03 + ph); k ? c.lineTo(x + k, yy) : c.moveTo(x, yy); } c.stroke();
        c.fillStyle = 'rgba(55,255,139,.18)'; c.fillRect(x, y, w, h);
      };
      if (v === 0) { tank(100); mon(330, 130, 120, 80, 0); mon(470, 130, 120, 80, 2); mon(330, 230, 120, 60, 4); mon(470, 230, 120, 60, 6); tank(680);
        c.fillStyle = '#e8c21a'; c.beginPath(); c.moveTo(ox + 850, 150); c.lineTo(ox + 890, 150); c.lineTo(ox + 870, 112); c.fill(); c.fillStyle = '#111'; c.fillRect(ox + 868, 124, 4, 14); }
      else { mon(80, 130, 150, 90, 1); mon(250, 130, 110, 90, 3); tank(430); c.fillStyle = '#7d8a96'; rr(c, ox + 650, 120, 150, 306, 6); c.fill(); c.fillStyle = '#5d6a76'; c.fillRect(ox + 724, 120, 3, 306); c.fillStyle = '#9bdcf0'; c.fillRect(ox + 668, 160, 44, 70); c.fillRect(ox + 738, 160, 44, 70); circ(c, ox + 725, 140, 6, Math.sin(t * 4) > 0 ? '#ff4d4d' : '#702020'); mon(840, 150, 90, 70, 5); }
    });
    // xavf chiziqlari
    c.fillStyle = '#17202a'; c.fillRect(0, 426, VW, 16);
    tiles(cam, 1, (i, ox) => { c.fillStyle = '#f2c500'; for (let x = 0; x < TW; x += 40) { c.beginPath(); c.moveTo(ox + x, 442); c.lineTo(ox + x + 20, 442); c.lineTo(ox + x + 32, 426); c.lineTo(ox + x + 12, 426); c.fill(); } });
    c.fillStyle = lg(c, 0, 442, 0, 540, ['#8fa2ac', '#6a7b85', '#45545e']); c.fillRect(0, 442, VW, 100);
    tiles(cam, 1, (i, ox) => {
      c.strokeStyle = 'rgba(10,25,35,.55)'; c.lineWidth = 2; for (let x = 0; x <= TW; x += 160) ln(c, ox + x, 442, ox + x, 540); ln(c, ox, 478, ox + TW, 478); ln(c, ox, 512, ox + TW, 512);
      c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(ox + 30, 446, 300, 5); c.fillRect(ox + 520, 484, 260, 4);
      c.fillStyle = 'rgba(0,0,0,.35)'; for (let x = 12; x < TW; x += 160) { circ(c, ox + x, 452, 2, 'rgba(0,0,0,.4)'); circ(c, ox + x + 136, 452, 2, 'rgba(0,0,0,.4)'); }
    });
    if (o && o.alarm) { const a = .1 + .1 * Math.sin(t * 5); c.fillStyle = 'rgba(255,30,30,' + a + ')'; c.fillRect(0, 0, VW, 540); }
  };

  BG.roof = (c, cam, t, o) => {
    const VW = B.VW, pink = o && o.sunset;
    c.fillStyle = lg(c, 0, 0, 0, 420, pink ? ['#2a1a5e', '#8e3b8f', '#ff6f61', '#ffb36b', '#ffe0a3'] : ['#1f2a6e', '#5b3a8f', '#c9507a', '#ff8a5b', '#ffd08a']); c.fillRect(0, 0, VW, 442);
    // quyosh
    const sx = VW * .72, sy = 330, g = c.createRadialGradient(sx, sy, 10, sx, sy, 260); g.addColorStop(0, 'rgba(255,240,190,.95)'); g.addColorStop(.25, 'rgba(255,190,110,.5)'); g.addColorStop(1, 'rgba(255,140,90,0)'); c.fillStyle = g; c.fillRect(0, 0, VW, 442);
    circ(c, sx, sy, 56, '#fff3c4');
    // bulutlar
    c.fillStyle = 'rgba(255,170,160,.35)'; tiles(cam, .06, (i, ox) => { [[90, 90, 140, 12], [420, 140, 200, 14], [760, 70, 120, 10]].forEach(p => { c.beginPath(); c.ellipse(ox + p[0], p[1], p[2], p[3], 0, 0, TAU); c.fill(); }); });
    skyline(c, cam, .14, bgd.far, pink ? '#6a2f7c' : '#5a3a86', 425, t, 0.97, null);
    skyline(c, cam, .32, bgd.mid, pink ? '#3d1d5c' : '#2d1b52', 428, t, 0.8, 'rgba(255,170,120,.5)');
    // parapet
    c.fillStyle = lg(c, 0, 402, 0, 442, ['#8c7ba6', '#5d5078']); c.fillRect(0, 404, VW, 38); c.fillStyle = '#c9b8e6'; c.fillRect(0, 402, VW, 5); c.fillStyle = 'rgba(0,0,0,.2)'; tiles(cam, 1, (i, ox) => { for (let x = 0; x < TW; x += 120) c.fillRect(ox + x, 407, 2, 35); });
    tiles(cam, 1, (i, ox, v) => {
      // suv minorasi, antenna, shamollatish
      const tank = (x) => { x += ox; c.fillStyle = '#1b1236'; c.fillRect(x - 40, 250, 6, 154); c.fillRect(x + 34, 250, 6, 154); c.fillRect(x - 40, 330, 80, 4); rr(c, x - 52, 170, 104, 84, 14); c.fill(); c.fillStyle = '#2a1d4c'; c.fillRect(x - 52, 205, 104, 5); c.fillRect(x - 52, 232, 104, 5); c.fillStyle = 'rgba(255,170,120,.5)'; c.fillRect(x + 46, 180, 4, 70); };
      const vent = (x, y, w, h) => { x += ox; c.fillStyle = '#241a44'; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,170,120,.4)'; c.fillRect(x + w - 3, y, 3, h); c.fillStyle = '#35285e'; for (let k = 0; k < 4; k++) c.fillRect(x + 6, y + 8 + k * 9, w - 14, 3); };
      const sign = (x) => { x += ox; c.fillStyle = '#1b1236'; c.fillRect(x + 10, 300, 5, 104); c.fillRect(x + 150, 300, 5, 104); c.fillStyle = '#2a1d4c'; rr(c, x, 230, 166, 80, 6); c.fill(); const a = .6 + .4 * Math.sin(t * 3); c.fillStyle = 'rgba(255,80,160,' + a + ')'; c.font = '900 34px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.fillText('JANG', x + 83, 282); c.textAlign = 'left'; };
      if (v === 0) { tank(130); vent(300, 340, 90, 64); sign(560); vent(820, 350, 70, 54); } else { vent(60, 346, 80, 58); tank(330); vent(500, 344, 100, 60); sign(700); }
    });
    c.fillStyle = lg(c, 0, 442, 0, 540, pink ? ['#6a4a7e', '#3b2c58', '#241a40'] : ['#5b5470', '#3d3858', '#272244']); c.fillRect(0, 442, VW, 100);
    tiles(cam, 1, (i, ox) => {
      c.strokeStyle = 'rgba(10,5,30,.5)'; c.lineWidth = 2; for (let x = 0; x <= TW; x += 160) ln(c, ox + x, 442, ox + x, 540); ln(c, ox, 486, ox + TW, 486);
      c.fillStyle = 'rgba(255,190,130,.14)'; c.fillRect(ox + 20, 446, 440, 6); c.fillRect(ox + 500, 490, 320, 4);
      c.fillStyle = 'rgba(255,255,255,.06)'; for (let x = 30; x < TW; x += 160) c.fillRect(ox + x, 500, 60, 3);
    });
  };

  BG.street = (c, cam, t, o) => {
    const VW = B.VW;
    c.fillStyle = lg(c, 0, 0, 0, 300, ['#1d2a5b', '#5a4a8a', '#c06a7a']); c.fillRect(0, 0, VW, 442);
    skyline(c, cam, .2, bgd.far, '#232a52', 300, t, 0.9, null);
    skyline(c, cam, .4, bgd.mid, '#181d3d', 330, t, 0.7, 'rgba(255,160,120,.35)');
    // asosiy g'isht devor
    const top = 150;
    c.fillStyle = lg(c, 0, top, 0, 430, ['#b5593f', '#9a4733', '#7a3626']); c.fillRect(0, top, VW, 430 - top);
    c.save(); c.translate(-((cam % 64) + 64) % 64, 0); c.fillStyle = bgd.brick; c.fillRect(0, top, VW + 64, 430 - top); c.restore();
    c.fillStyle = '#d8c3a5'; c.fillRect(0, top - 14, VW, 16); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(0, top + 2, VW, 5);
    tiles(cam, 1, (i, ox, v) => {
      const win = (x, y) => { x += ox; c.fillStyle = '#d8c3a5'; c.fillRect(x - 8, y - 8, 76, 116); c.fillStyle = lg(c, 0, y, 0, y + 100, ['#ffd88a', '#e8923a']); c.fillRect(x, y, 60, 100); c.strokeStyle = '#1a1a22'; c.lineWidth = 3; for (let k = 1; k < 5; k++) ln(c, x + k * 12, y, x + k * 12, y + 100); ln(c, x, y + 50, x + 60, y + 50); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + 30, y + 30, 22, 70); };
      const lampP = (x) => { x += ox; const gg = c.createLinearGradient(0, 150, 0, 440); gg.addColorStop(0, 'rgba(255,220,130,.5)'); gg.addColorStop(1, 'rgba(255,220,130,0)'); c.fillStyle = gg; c.beginPath(); c.moveTo(x + 6, 160); c.lineTo(x + 100, 440); c.lineTo(x - 100, 440); c.fill(); c.fillStyle = '#16161d'; c.fillRect(x, 150, 7, 290); c.fillRect(x - 24, 144, 34, 8); circ(c, x - 18, 156, 8, '#ffe9a8'); };
      const dump = (x) => { x += ox; c.fillStyle = '#1e5c3a'; c.fillRect(x, 372, 130, 62); c.fillStyle = '#2b8a57'; c.beginPath(); c.moveTo(x - 6, 372); c.lineTo(x + 136, 372); c.lineTo(x + 130, 358); c.lineTo(x, 358); c.fill(); c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x, 398, 130, 4); c.fillStyle = '#111'; circ(c, x + 14, 436, 7, '#111'); circ(c, x + 116, 436, 7, '#111'); };
      const neon = (x, txt, col) => { x += ox; const a = .55 + .45 * (Math.sin(t * 7 + x) > -.6 ? 1 : 0); c.save(); c.shadowColor = col; c.shadowBlur = 22; c.fillStyle = '#1a1a22'; rr(c, x, 190, 120, 54, 8); c.fill(); c.globalAlpha = a; c.fillStyle = col; c.font = '900 30px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.fillText(txt, x + 60, 228); c.textAlign = 'left'; c.restore(); };
      const graf = (x) => { x += ox; c.lineCap = 'round'; c.lineWidth = 9; c.strokeStyle = '#ffd23f'; c.beginPath(); c.moveTo(x, 330); c.quadraticCurveTo(x + 40, 270, x + 80, 330); c.quadraticCurveTo(x + 120, 380, x + 150, 320); c.stroke(); c.strokeStyle = '#2ec4b6'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 10, 350); c.quadraticCurveTo(x + 60, 300, x + 100, 350); c.stroke(); c.fillStyle = '#ff4d8d'; c.font = '900 40px Impact, Arial Black, sans-serif'; c.save(); c.translate(x + 20, 300); c.rotate(-.08); c.fillText('ZOR!', 0, 0); c.restore(); };
      const door = (x) => { x += ox; c.fillStyle = '#16161d'; c.fillRect(x - 8, 228, 106, 208); c.fillStyle = lg(c, x, 0, x + 90, 0, ['#5d6670', '#3b434b']); c.fillRect(x, 236, 90, 200); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 8, 250, 74, 80); c.fillStyle = '#e8c21a'; c.fillRect(x + 66, 340, 8, 24); };
      if (v === 0) { win(50, 190); lampP(190); dump(250); win(450, 190); neon(590, 'BAR', '#ff3d9a'); door(750); graf(850 - 20); }
      else { door(40); win(180, 190); graf(300); lampP(520); dump(580); neon(760, 'OPEN', '#35f2c8'); win(840, 190); }
    });
    // yo'l
    c.fillStyle = lg(c, 0, 430, 0, 456, ['#a3a6b4', '#7b7e8e']); c.fillRect(0, 430, VW, 26); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 454, VW, 3);
    c.fillStyle = lg(c, 0, 456, 0, 540, ['#3d3f4e', '#2a2c37', '#1c1d26']); c.fillRect(0, 456, VW, 90);
    tiles(cam, 1, (i, ox) => {
      c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x < TW; x += 160) c.fillRect(ox + x + 10, 438, 3, 14);
      c.fillStyle = '#e8c21a'; for (let x = 0; x < TW; x += 140) c.fillRect(ox + x + 20, 506, 80, 6);
      c.fillStyle = 'rgba(140,170,255,.18)'; c.beginPath(); c.ellipse(ox + 300, 488, 90, 9, 0, 0, TAU); c.ellipse(ox + 760, 520, 120, 10, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,230,160,.12)'; c.beginPath(); c.ellipse(ox + 190, 470, 140, 8, 0, 0, TAU); c.fill();
    });
  };

  // ---------- v6: yangi fonlar ----------
  const gear = (c, x, y, r, teeth, rot, col, dark) => {
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    for (let i = 0; i < teeth * 2; i++) { const a = i / (teeth * 2) * TAU, rr2 = i % 2 ? r * .86 : r * 1.08, a2 = (i + 1) / (teeth * 2) * TAU; c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); c.lineTo(Math.cos(a + (a2 - a) * .5) * rr2, Math.sin(a + (a2 - a) * .5) * rr2); }
    c.closePath(); c.fillStyle = col; c.fill(); c.strokeStyle = dark; c.lineWidth = 3; c.stroke();
    c.beginPath(); c.arc(0, 0, r * .55, 0, TAU); c.fillStyle = dark; c.fill(); c.beginPath(); c.arc(0, 0, r * .22, 0, TAU); c.fillStyle = col; c.fill();
    for (let i = 0; i < 4; i++) { c.save(); c.rotate(i * Math.PI / 2); c.fillStyle = dark; c.fillRect(-r * .1, -r * .55, r * .2, r * .5); c.restore(); }
    c.restore();
  };

  BG.factory = (c, cam, t, o) => {
    const VW = B.VW;
    c.fillStyle = lg(c, 0, 0, 0, 440, ['#241a2a', '#4a2a2c', '#a8531f']); c.fillRect(0, 0, VW, 442);
    // uzoqdagi mo'rilar va tutun
    tiles(cam, .16, (i, ox) => {
      [[120, 150, 46], [470, 100, 56], [800, 170, 40]].forEach((m, k) => {
        c.fillStyle = '#1b1320'; c.beginPath(); c.moveTo(ox + m[0] - m[2] / 2, 430); c.lineTo(ox + m[0] - m[2] * .32, 430 - m[1] - 100); c.lineTo(ox + m[0] + m[2] * .32, 430 - m[1] - 100); c.lineTo(ox + m[0] + m[2] / 2, 430); c.fill();
        c.fillStyle = '#e63946'; c.fillRect(ox + m[0] - m[2] * .32, 430 - m[1] - 100, m[2] * .64, 8);
        for (let q = 0; q < 5; q++) { const ph = ((t * .12 + q * .2 + k * .31) % 1), px = ox + m[0] + ph * 70 + Math.sin(ph * 6 + k) * 10, py = 430 - m[1] - 104 - ph * 130; c.fillStyle = 'rgba(40,30,45,' + (.5 * (1 - ph)) + ')'; c.beginPath(); c.arc(px, py, 14 + ph * 36, 0, TAU); c.fill(); }
      });
    });
    c.fillStyle = 'rgba(255,140,50,.12)'; c.fillRect(0, 250, VW, 190);
    // orqa devor: gofrirovka
    c.fillStyle = lg(c, 0, 130, 0, 430, ['#3c2a36', '#2d2029']); c.fillRect(0, 130, VW, 300);
    tiles(cam, 1, (i, ox, v) => {
      c.fillStyle = 'rgba(0,0,0,.22)'; for (let x = 0; x < TW; x += 40) c.fillRect(ox + x, 130, 4, 300);
      c.fillStyle = 'rgba(255,170,100,.07)'; for (let x = 0; x < TW; x += 40) c.fillRect(ox + x + 4, 130, 3, 300);
      c.fillStyle = '#6b4a3a'; c.fillRect(ox, 128, TW, 10); c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(ox, 128, TW, 3);
      // quvurlar
      c.fillStyle = '#7a4a3a'; c.fillRect(ox, 60, TW, 18); c.fillStyle = 'rgba(255,220,180,.35)'; c.fillRect(ox, 62, TW, 4);
      c.fillStyle = '#5a3a30'; c.fillRect(ox, 92, TW, 12); for (let x = 60; x < TW; x += 180) { c.fillStyle = '#3b2620'; c.fillRect(ox + x, 56, 12, 52); }
      c.fillStyle = '#6a4234'; c.fillRect(ox + (v ? 300 : 620), 78, 16, 350); c.fillStyle = 'rgba(255,220,180,.3)'; c.fillRect(ox + (v ? 304 : 624), 78, 4, 350);
      // dastgoh/pech
      const furnace = x => { x += ox; c.fillStyle = '#2a1c22'; rr(c, x - 10, 250, 170, 182, 10); c.fill(); const g = c.createRadialGradient(x + 75, 330, 6, x + 75, 330, 120); g.addColorStop(0, 'rgba(255,200,80,.85)'); g.addColorStop(.45, 'rgba(255,110,20,.45)'); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.fillRect(x - 80, 230, 310, 220);
        c.fillStyle = '#ff9a2e'; rr(c, x + 20, 300, 110, 70, 8); c.fill(); c.fillStyle = '#ffe08a'; rr(c, x + 34, 312, 82, 46, 6); c.fill(); c.fillStyle = '#1a0f12'; for (let k = 0; k < 4; k++) c.fillRect(x + 20, 305 + k * 17, 110, 4);
        c.fillStyle = 'rgba(255,190,90,' + (.25 + .12 * Math.sin(t * 9 + x)) + ')'; c.beginPath(); c.arc(x + 75, 335, 74, 0, TAU); c.fill(); };
      const ctrl = x => { x += ox; c.fillStyle = '#2e3a46'; rr(c, x, 300, 120, 128, 8); c.fill(); c.fillStyle = '#0d2a22'; c.fillRect(x + 12, 314, 96, 44); c.strokeStyle = '#37ff8b'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k <= 96; k += 4) { const yy = 336 + Math.sin(k * .14 + t * 4) * 9; k ? c.lineTo(x + 12 + k, yy) : c.moveTo(x + 12, yy); } c.stroke(); [0, 1, 2, 3].forEach(k => circ(c, x + 22 + k * 24, 382, 6, (Math.floor(t * 2 + k) % 3 === 0) ? '#ff4d4d' : '#35e07a')); };
      if (v === 0) { gear(c, ox + 190, 215, 76, 12, t * .5, '#8a6a58', '#2c1f1f'); gear(c, ox + 296, 262, 42, 8, -t * .95 + .3, '#a37e63', '#2c1f1f'); furnace(430); ctrl(760); }
      else { ctrl(60); furnace(210); gear(c, ox + 560, 210, 60, 10, -t * .6, '#8a6a58', '#2c1f1f'); gear(c, ox + 650, 262, 38, 8, t * .95, '#a37e63', '#2c1f1f'); gear(c, ox + 830, 190, 84, 14, t * .4, '#8a6a58', '#2c1f1f'); }
      // konveyer
      c.fillStyle = '#1a1418'; c.fillRect(ox, 376, TW, 14); c.fillStyle = '#4a3a40'; c.fillRect(ox, 372, TW, 6);
      c.fillStyle = '#7a6a70'; for (let x = (t * 50) % 24 - 24; x < TW; x += 24) c.fillRect(ox + x, 372, 10, 4);
      c.fillStyle = '#2a1e24'; for (let x = 20; x < TW; x += 200) c.fillRect(ox + x, 390, 10, 40);
      [[60, 0], [360, 1], [700, 2]].forEach(b => { const bx = ox + ((b[0] + t * 50) % TW), col = ['#b8742a', '#8a8f9a', '#a33a2a'][b[1]]; c.fillStyle = col; c.fillRect(bx, 340, 34, 32); c.strokeStyle = '#1a1010'; c.lineWidth = 2; c.strokeRect(bx, 340, 34, 32); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(bx + 15, 340, 4, 32); });
    });
    // xavf chiziqlari + pol
    c.fillStyle = '#17121a'; c.fillRect(0, 426, VW, 16);
    tiles(cam, 1, (i, ox) => { c.fillStyle = '#f2a900'; for (let x = 0; x < TW; x += 40) { c.beginPath(); c.moveTo(ox + x, 442); c.lineTo(ox + x + 20, 442); c.lineTo(ox + x + 32, 426); c.lineTo(ox + x + 12, 426); c.fill(); } });
    c.fillStyle = lg(c, 0, 442, 0, 540, ['#6a5a58', '#463a3a', '#2c2424']); c.fillRect(0, 442, VW, 100);
    tiles(cam, 1, (i, ox) => {
      c.strokeStyle = 'rgba(10,6,8,.6)'; c.lineWidth = 2; for (let x = 0; x <= TW; x += 120) ln(c, ox + x, 442, ox + x, 540); ln(c, ox, 484, ox + TW, 484); ln(c, ox, 516, ox + TW, 516);
      c.fillStyle = 'rgba(255,150,60,.12)'; c.fillRect(ox + 30, 446, 360, 5); c.fillRect(ox + 520, 488, 300, 4);
      c.fillStyle = 'rgba(0,0,0,.35)'; for (let x = 12; x < TW; x += 120) { circ(c, ox + x, 452, 2, 'rgba(0,0,0,.45)'); circ(c, ox + x + 96, 452, 2, 'rgba(0,0,0,.45)'); }
    });
  };

  BG.night = (c, cam, t, o) => {
    const VW = B.VW;
    c.fillStyle = lg(c, 0, 0, 0, 340, ['#05061a', '#14123a', '#2d1f5a', '#5a2f6e']); c.fillRect(0, 0, VW, 442);
    // yulduzlar va oy
    c.fillStyle = '#fff'; for (let k = 0; k < 46; k++) { const sx = ((k * 211 + 40) % 1000) / 1000 * VW, sy = (k * 97 % 230) + 10; c.globalAlpha = .35 + .5 * Math.abs(Math.sin(t * 1.4 + k)); c.fillRect(sx, sy, 2, 2); } c.globalAlpha = 1;
    const mx = VW * .22, my = 96, mg = c.createRadialGradient(mx, my, 20, mx, my, 220); mg.addColorStop(0, 'rgba(190,210,255,.5)'); mg.addColorStop(1, 'rgba(120,140,255,0)'); c.fillStyle = mg; c.fillRect(0, 0, VW, 400);
    circ(c, mx, my, 50, '#eef3ff'); circ(c, mx - 14, my - 8, 9, '#cfd8f5'); circ(c, mx + 16, my + 14, 6, '#cfd8f5'); circ(c, mx + 8, my - 22, 5, '#d8e0fa');
    skyline(c, cam, .12, bgd.far, '#1b1a45', 330, t, 0.93, null);
    skyline(c, cam, .3, bgd.mid, '#0f0e2c', 360, t, 0.62, 'rgba(120,150,255,.35)');
    // yaqin binolar + neon
    const top = 190;
    c.fillStyle = lg(c, 0, top, 0, 430, ['#1c1a3d', '#12112b']); c.fillRect(0, top, VW, 430 - top);
    c.fillStyle = '#2a2858'; c.fillRect(0, top - 8, VW, 10);
    tiles(cam, 1, (i, ox, v) => {
      const win = (x, y, w, h, lit) => { x += ox; c.fillStyle = '#0a0a1a'; c.fillRect(x - 5, y - 5, w + 10, h + 10); c.fillStyle = lit ? lg(c, 0, y, 0, y + h, ['#ffe29a', '#ff9a4a']) : '#161638'; c.fillRect(x, y, w, h); c.strokeStyle = '#0a0a1a'; c.lineWidth = 3; ln(c, x + w / 2, y, x + w / 2, y + h); ln(c, x, y + h / 2, x + w, y + h / 2); };
      const neon = (x, y, txt, col, w) => { x += ox; const fl = Math.sin(t * 6 + x) > -.8 ? 1 : .35; c.save(); c.shadowColor = col; c.shadowBlur = 24; c.fillStyle = '#0a0a1a'; rr(c, x, y, w, 52, 8); c.fill(); c.globalAlpha = .55 + .45 * fl; c.strokeStyle = col; c.lineWidth = 3; rr(c, x + 4, y + 4, w - 8, 44, 6); c.stroke(); c.fillStyle = col; c.font = '900 28px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.fillText(txt, x + w / 2, y + 37); c.textAlign = 'left'; c.restore(); };
      const lamp = x => { x += ox; const g = c.createLinearGradient(0, 200, 0, 440); g.addColorStop(0, 'rgba(160,190,255,.4)'); g.addColorStop(1, 'rgba(160,190,255,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 4, 206); c.lineTo(x + 100, 440); c.lineTo(x - 100, 440); c.fill(); c.fillStyle = '#0a0a1a'; c.fillRect(x, 200, 6, 240); c.fillRect(x - 22, 196, 32, 7); circ(c, x - 16, 206, 8, '#cfe0ff'); };
      const door = x => { x += ox; c.fillStyle = '#0a0a1a'; c.fillRect(x - 6, 270, 96, 166); c.fillStyle = lg(c, x, 0, x + 84, 0, ['#3a3a66', '#25254a']); c.fillRect(x, 278, 84, 158); c.fillStyle = 'rgba(255,255,255,.07)'; c.fillRect(x + 8, 290, 68, 60); c.fillStyle = '#ffd23f'; circ(c, x + 70, 360, 4, '#ffd23f'); };
      if (v === 0) { win(40, 226, 50, 80, true); win(130, 226, 50, 80, false); neon(220, 220, 'RAMEN', '#ff3d9a', 150); lamp(420); door(500); win(650, 226, 50, 80, true); neon(740, 250, 'KARAOKE', '#35f2c8', 190); }
      else { neon(40, 224, 'HOTEL', '#ffb703', 150); win(240, 226, 50, 80, false); win(330, 226, 50, 80, true); lamp(500); door(580); neon(720, 220, 'ARCADE', '#7a5cff', 190); }
    });
    // yomg'ir
    c.save(); c.strokeStyle = 'rgba(170,190,255,.28)'; c.lineWidth = 1.4; c.beginPath();
    for (let k = 0; k < 70; k++) { const rx = ((k * 137 + t * 60 * (1 + (k % 3) * .2)) % (VW + 80)) - 40, ry = ((k * 71 + t * 520) % 460) - 10; c.moveTo(rx, ry); c.lineTo(rx - 6, ry + 16); } c.stroke(); c.restore();
    // yo'l
    c.fillStyle = lg(c, 0, 430, 0, 456, ['#5a5f8a', '#3a3e66']); c.fillRect(0, 430, VW, 26); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, 454, VW, 3);
    c.fillStyle = lg(c, 0, 456, 0, 540, ['#23253f', '#181a2e', '#10111f']); c.fillRect(0, 456, VW, 90);
    tiles(cam, 1, (i, ox) => {
      c.fillStyle = 'rgba(255,255,255,.14)'; for (let x = 0; x < TW; x += 160) c.fillRect(ox + x + 10, 438, 3, 14);
      c.fillStyle = '#c9a517'; for (let x = 0; x < TW; x += 140) c.fillRect(ox + x + 20, 506, 80, 5);
      [[260, 488, 100], [700, 520, 130]].forEach(p => { c.fillStyle = 'rgba(255,61,154,.2)'; c.beginPath(); c.ellipse(ox + p[0], p[1], p[2], 9, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(53,242,200,.16)'; c.beginPath(); c.ellipse(ox + p[0] + 40, p[1] + 3, p[2] * .6, 6, 0, 0, TAU); c.fill(); });
    });
    c.fillStyle = 'rgba(30,40,110,.14)'; c.fillRect(0, 0, VW, 540);
  };

  BG.dojo = (c, cam, t, o) => {
    const VW = B.VW;
    c.fillStyle = lg(c, 0, 0, 0, 440, ['#2a0f14', '#4a1a1e', '#6b2a22']); c.fillRect(0, 0, VW, 442);
    tiles(cam, 1, (i, ox, v) => {
      // shoji: qog'oz panellar
      const shoji = (x, w) => { x += ox; c.fillStyle = '#2b1a14'; c.fillRect(x - 8, 96, w + 16, 336); const g = c.createLinearGradient(0, 100, 0, 430); g.addColorStop(0, '#ffe9bd'); g.addColorStop(1, '#f3c98b'); c.fillStyle = g; c.fillRect(x, 104, w, 322);
        c.strokeStyle = '#3a2218'; c.lineWidth = 4; for (let k = 0; k <= 3; k++) ln(c, x + k * w / 3, 104, x + k * w / 3, 426); for (let k = 0; k <= 5; k++) ln(c, x, 104 + k * 322 / 5, x + w, 104 + k * 322 / 5);
        c.fillStyle = 'rgba(255,170,60,.16)'; c.fillRect(x, 104, w, 322); };
      const pillar = x => { x += ox; c.fillStyle = lg(c, x, 0, x + 34, 0, ['#8a1722', '#c1121f', '#6a0f19']); c.fillRect(x, 70, 34, 366); c.fillStyle = '#1a0d0d'; c.fillRect(x - 4, 70, 42, 10); c.fillRect(x - 4, 420, 42, 16); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x + 6, 80, 5, 340); };
      const lantern = (x, y) => { x += ox; const sw = Math.sin(t * 1.3 + x) * 4; c.strokeStyle = '#1a0d0d'; c.lineWidth = 3; ln(c, x, 60, x + sw * .3, y - 28); const g = c.createRadialGradient(x + sw, y, 6, x + sw, y, 110); g.addColorStop(0, 'rgba(255,190,90,.55)'); g.addColorStop(1, 'rgba(255,150,40,0)'); c.fillStyle = g; c.fillRect(x - 120, y - 110, 240, 220);
        c.fillStyle = '#d62839'; c.beginPath(); c.ellipse(x + sw, y, 22, 30, 0, 0, TAU); c.fill(); c.strokeStyle = '#1a0d0d'; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = 'rgba(80,0,10,.5)'; c.lineWidth = 1.6; for (let k = -1; k <= 1; k++) { c.beginPath(); c.ellipse(x + sw, y, 22 * (1 - Math.abs(k) * .35), 30, 0, 0, TAU); c.stroke(); } c.fillStyle = '#1a0d0d'; c.fillRect(x + sw - 10, y - 34, 20, 6); c.fillRect(x + sw - 10, y + 29, 20, 6); };
      const scroll = (x, y) => { x += ox; c.fillStyle = '#1a0d0d'; c.fillRect(x - 3, y - 8, 76, 8); c.fillStyle = '#f6e7c1'; c.fillRect(x, y, 70, 150); c.fillStyle = '#1a0d0d'; c.fillRect(x - 3, y + 150, 76, 8); c.strokeStyle = '#1a1a1a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 18, y + 30); c.quadraticCurveTo(x + 52, y + 40, x + 36, y + 70); c.quadraticCurveTo(x + 18, y + 100, x + 50, y + 124); c.stroke(); circ(c, x + 36, y + 24, 7, '#c1121f'); };
      const rack = x => { x += ox; c.fillStyle = '#2b1a14'; c.fillRect(x, 300, 150, 8); c.fillRect(x, 350, 150, 8); c.fillRect(x + 6, 290, 8, 140); c.fillRect(x + 136, 290, 8, 140);
        [[26, '#3a5a8a'], [54, '#8a2a2a'], [82, '#2a2a30'], [110, '#5a8a4a']].forEach((w, k) => { c.save(); c.translate(x + w[0], 296); c.rotate(-.06 + k * .03); c.strokeStyle = '#0a0a10'; c.lineWidth = 8; ln(c, 0, 0, 0, 64); c.strokeStyle = w[1]; c.lineWidth = 5.5; ln(c, 0, 0, 0, 64); c.fillStyle = '#d9a520'; c.fillRect(-7, 62, 14, 4); c.strokeStyle = '#e8f0ff'; c.lineWidth = 3; ln(c, 0, 66, 0, 122); c.restore(); }); };
      const drum = x => { x += ox; c.fillStyle = '#5a2a1a'; rr(c, x, 340, 110, 92, 14); c.fill(); c.fillStyle = '#e8c78a'; c.beginPath(); c.ellipse(x + 55, 340, 55, 16, 0, 0, TAU); c.fill(); c.strokeStyle = '#2a1008'; c.lineWidth = 3; c.stroke(); c.strokeStyle = '#d9a520'; c.lineWidth = 2; for (let k = 0; k < 6; k++) circ(c, x + 10 + k * 18, 360, 3, '#d9a520'); };
      if (v === 0) { shoji(30, 240); pillar(300); lantern(380, 170); scroll(450, 150); rack(570); pillar(750); shoji(800, 150); }
      else { pillar(30); drum(100); lantern(250, 170); shoji(300, 230); pillar(560); scroll(620, 150); lantern(760, 170); shoji(780, 160); }
      c.fillStyle = '#1a0d0d'; c.fillRect(ox, 60, TW, 14); c.fillStyle = '#c1121f'; c.fillRect(ox, 74, TW, 10);
    });
    // yog'och pol + tatami
    c.fillStyle = '#1a0d0d'; c.fillRect(0, 426, VW, 16);
    c.fillStyle = lg(c, 0, 442, 0, 540, ['#b07a45', '#8a5a30', '#5c3a1c']); c.fillRect(0, 442, VW, 100);
    tiles(cam, 1, (i, ox) => {
      c.strokeStyle = 'rgba(40,20,5,.45)'; c.lineWidth = 2; for (let x = 0; x <= TW; x += 120) ln(c, ox + x, 442, ox + x, 540); for (let y = 466; y < 540; y += 24) ln(c, ox, y, ox + TW, y);
      c.fillStyle = 'rgba(170,190,110,.35)'; rr(c, ox + 120, 470, 300, 60, 4); c.fill(); rr(c, ox + 540, 470, 300, 60, 4); c.fill();
      c.strokeStyle = 'rgba(40,40,10,.55)'; c.lineWidth = 3; rr(c, ox + 120, 470, 300, 60, 4); c.stroke(); rr(c, ox + 540, 470, 300, 60, 4); c.stroke();
      c.fillStyle = 'rgba(255,230,170,.1)'; c.fillRect(ox + 30, 446, 400, 5);
    });
    if (o && o.alarm) { const a = .08 + .08 * Math.sin(t * 4); c.fillStyle = 'rgba(255,20,20,' + a + ')'; c.fillRect(0, 0, VW, 540); }
  };

  B.drawBG = (c, kind, cam, t, o) => { if (!bgd || bgd.kind !== kind) B.bgInit(kind); BG[kind](c, cam, t, o || {}); };
  B.vignette = (c) => {
    const VW = B.VW, g = c.createRadialGradient(VW / 2, 270, 220, VW / 2, 270, VW * .62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.38)'); c.fillStyle = g; c.fillRect(0, 0, VW, 540);
  };

  // ---------- Kichik ikonkalar ----------
  B.icoCoin = (c, x, y, r) => {
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = lg(c, x - r, y - r, x + r, y + r, ['#fff2a8', '#ffc400', '#c98400']); c.fill(); c.lineWidth = Math.max(1.5, r * .16); c.strokeStyle = '#7a4d00'; c.stroke();
    c.beginPath(); c.arc(x, y, r * .66, 0, TAU); c.strokeStyle = 'rgba(122,77,0,.6)'; c.lineWidth = Math.max(1, r * .1); c.stroke();
    c.fillStyle = '#8a5a00'; c.font = '900 ' + (r * 1.15) + 'px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', x, y + r * .06); c.restore();
  };
  B.icoGem = (c, x, y, r) => {
    c.save(); c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y - r * .25); c.lineTo(x + r * .62, y + r * .9); c.lineTo(x - r * .62, y + r * .9); c.lineTo(x - r, y - r * .25); c.closePath();
    c.fillStyle = lg(c, x - r, y - r, x + r, y + r, ['#c8f3ff', '#3bb8ff', '#0b5fb5']); c.fill(); c.lineWidth = Math.max(1.5, r * .14); c.strokeStyle = '#06315e'; c.lineJoin = 'round'; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = Math.max(1, r * .1); c.beginPath(); c.moveTo(x - r, y - r * .25); c.lineTo(x + r, y - r * .25); c.moveTo(x - r * .35, y - r * .25); c.lineTo(x - r * .1, y + r * .9); c.moveTo(x + r * .35, y - r * .25); c.lineTo(x + r * .1, y + r * .9); c.stroke(); c.restore();
  };
  B.icoHeart = (c, x, y, r) => {
    c.save(); c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.6, y - r * .2, x - r * .7, y - r * 1.3, x, y - r * .4); c.bezierCurveTo(x + r * .7, y - r * 1.3, x + r * 1.6, y - r * .2, x, y + r * .9);
    c.fillStyle = lg(c, x, y - r, x, y + r, ['#ff9aa8', '#e5233f']); c.fill(); c.lineWidth = 2; c.strokeStyle = '#5a0a18'; c.stroke(); c.restore();
  };
  B.icoBolt = (c, x, y, r) => {
    c.save(); c.beginPath(); c.moveTo(x + r * .2, y - r); c.lineTo(x - r * .7, y + r * .15); c.lineTo(x - r * .05, y + r * .15); c.lineTo(x - r * .3, y + r); c.lineTo(x + r * .75, y - r * .22); c.lineTo(x + r * .08, y - r * .22); c.closePath();
    c.fillStyle = lg(c, x, y - r, x, y + r, ['#e8fbff', '#38c6ff']); c.fill(); c.lineWidth = 2; c.strokeStyle = '#05406b'; c.lineJoin = 'round'; c.stroke(); c.restore();
  };
  // komiks matn
  B.comic = (c, txt, x, y, size, fill, stroke, rot) => {
    c.save(); c.translate(x, y); if (rot) c.rotate(rot);
    c.font = 'italic 900 ' + size + 'px Impact, "Arial Black", "Roboto Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    c.lineWidth = Math.max(3, size * .2); c.strokeStyle = stroke || '#111'; c.strokeText(txt, 0, 0); c.fillStyle = fill || '#fff'; c.fillText(txt, 0, 0); c.restore();
  };
})();
