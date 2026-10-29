'use strict';
// ===== Stickman Jang — yadro: yordamchilar, saqlash, ovoz, boshqaruv, ekran =====
const B = window.B = { H: 540, VW: 960, S: 1, ox: 0, oy: 0, touch: false, VER: '2.0' };
B.clamp = (v, a, b) => v < a ? a : v > b ? b : v;
B.rnd = (a, b) => a + Math.random() * (b - a);
B.rndi = (a, b) => Math.floor(B.rnd(a, b + 1));
B.pick = a => a[Math.floor(Math.random() * a.length)];
B.lerp = (a, b, t) => a + (b - a) * t;
B.ease = t => t * t * (3 - 2 * t);
B.fmt = n => String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
B.mmss = s => { s = Math.floor(s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

// ---------- Saqlash ----------
const KEY = 'sj2_save_v1';
B.defSave = () => ({ coins: 100, gems: 0, pot: 3, hpL: 0, mpL: 0, own: { pipe: 1 }, wl: { pipe: 1 }, eq: 'pipe', hero: 'muz', heroOwn: { muz: 1 }, unl: 1, stars: {}, best: { endless: 0 }, set: { snd: 1, vib: 1, blood: 1 }, diff: 1 });
B.S0 = B.defSave();
B.load = () => {
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null'), d = B.defSave();
    if (o) { Object.assign(d, o); d.set = Object.assign(B.defSave().set, o.set || {}); d.best = Object.assign({ endless: 0 }, o.best || {}); d.own = o.own || d.own; d.wl = o.wl || d.wl; d.stars = o.stars || {}; d.heroOwn = Object.assign({ muz: 1 }, o.heroOwn || {}); if (!d.heroOwn[d.hero]) d.hero = 'muz'; }
    B.S0 = d;
  } catch (e) { B.S0 = B.defSave(); }
};
B.persist = () => { try { localStorage.setItem(KEY, JSON.stringify(B.S0)); } catch (e) { } };
B.load();

// ---------- Tebranish ----------
B.buzz = ms => { if (B.S0.set.vib && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { } } };

// ---------- Ovoz (WebAudio, tayyor fayl kerak emas) ----------
let AC = null, master = null, nbuf = null;
const lastS = {};
B.audioInit = () => {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = .55; master.connect(AC.destination);
    nbuf = AC.createBuffer(1, AC.sampleRate * 1, AC.sampleRate);
    const d = nbuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { AC = null; }
};
function tone(f0, f1, dur, type, vol, delay) {
  const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .02);
}
function noise(dur, vol, f, q, delay) {
  const t = AC.currentTime + (delay || 0), s = AC.createBufferSource(), g = AC.createGain(), fl = AC.createBiquadFilter();
  s.buffer = nbuf; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q || .8;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
}
B.sfx = n => {
  if (!AC || !B.S0.set.snd) return;
  const now = performance.now(); if (lastS[n] && now - lastS[n] < 35) return; lastS[n] = now;
  switch (n) {
    case 'swing': noise(.14, .22, 1800, .6); break;
    case 'hit': noise(.1, .5, 900, .7); tone(180, 70, .1, 'square', .25); break;
    case 'heavy': noise(.22, .7, 500, .6); tone(120, 40, .25, 'sawtooth', .4); break;
    case 'hurt': tone(300, 90, .22, 'sawtooth', .35); noise(.12, .3, 700); break;
    case 'jump': tone(260, 560, .12, 'sine', .22); break;
    case 'coin': tone(988, 988, .07, 'square', .12); tone(1319, 1319, .12, 'square', .12, .06); break;
    case 'gem': tone(880, 1760, .18, 'triangle', .25); tone(1320, 2640, .25, 'triangle', .2, .1); break;
    case 'pick': tone(500, 900, .12, 'triangle', .25); break;
    case 'potion': tone(400, 800, .15, 'sine', .3); tone(600, 1200, .2, 'sine', .3, .1); break;
    case 'boom': noise(.7, .9, 220, .4); tone(90, 25, .6, 'sawtooth', .5); break;
    case 'skill': tone(200, 900, .3, 'sawtooth', .3); noise(.3, .4, 1200, .5); break;
    case 'break': noise(.25, .55, 1400, .5); tone(240, 110, .1, 'square', .2); break;
    case 'shot': tone(900, 220, .1, 'square', .16); break;
    case 'bolt': tone(1400, 300, .08, 'square', .1); break;
    case 'win': [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .22, 'square', .2, i * .13)); break;
    case 'lose': [392, 330, 262, 196].forEach((f, i) => tone(f, f * .96, .3, 'sawtooth', .22, i * .2)); break;
    case 'click': tone(700, 700, .05, 'square', .12); break;
    case 'buy': tone(660, 660, .07, 'square', .15); tone(990, 990, .12, 'square', .15, .07); break;
    case 'warn': tone(220, 220, .18, 'square', .2); tone(220, 220, .18, 'square', .2, .25); break;
    case 'roar': tone(110, 50, .6, 'sawtooth', .5); noise(.5, .4, 300, .5); break;
  }
};

// ---------- Boshqaruv ----------
B.keys = { l: 0, r: 0, j: 0, a: 0, s: 0, p: 0 };
B.press = {};
const setK = (k, v) => { if (v && !B.keys[k]) B.press[k] = 1; B.keys[k] = v ? 1 : 0; };
B.clearInput = () => { for (const k in B.keys) B.keys[k] = 0; B.press = {}; document.querySelectorAll('#pad button.on').forEach(b => b.classList.remove('on')); };
const KM = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'j', KeyW: 'j', Space: 'j', KeyK: 'j', KeyJ: 'a', KeyZ: 'a', KeyL: 's', KeyX: 's', KeyU: 'p', KeyC: 'p' };
const typing = e => e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
addEventListener('keydown', e => {
  if (typing(e)) return;
  if (e.repeat) { if (KM[e.code]) e.preventDefault(); return; }
  B.audioInit();
  if (e.code === 'KeyP' || e.code === 'Escape') { B.onPauseKey && B.onPauseKey(); return; }
  if (e.code === 'KeyF') { B.toggleFS(); return; }
  if (e.code === 'KeyM') { B.S0.set.snd = B.S0.set.snd ? 0 : 1; B.persist(); return; }
  const k = KM[e.code]; if (k) { setK(k, 1); e.preventDefault(); }
});
addEventListener('keyup', e => { if (typing(e)) return; const k = KM[e.code]; if (k) setK(k, 0); });
addEventListener('blur', () => B.clearInput());
// sensorli tugmalar
B.initPad = () => {
  const pad = document.getElementById('pad');
  const owners = {};
  pad.querySelectorAll('button').forEach(btn => {
    const k = btn.dataset.k;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); B.audioInit(); B.touch = true; document.body.classList.add('touch');
      try { btn.setPointerCapture(e.pointerId); } catch (_) { }
      owners[e.pointerId] = k; setK(k, 1); btn.classList.add('on');
    });
    const up = e => { if (owners[e.pointerId] === k) { delete owners[e.pointerId]; setK(k, 0); btn.classList.remove('on'); } };
    btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });
};
addEventListener('touchstart', () => { B.touch = true; document.body.classList.add('touch'); }, { passive: true });

// ---------- Ekran ----------
B.cv = document.getElementById('c'); B.cx = B.cv.getContext('2d');
B.dprCap = 2;
B.resize = () => {
  const w = innerWidth, h = innerHeight, dpr = Math.min(window.devicePixelRatio || 1, B.dprCap);
  const cv = B.cv; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px';
  B.VW = B.clamp(w / h * B.H, 720, 1300);
  B.S = Math.min(cv.width / B.VW, cv.height / B.H);
  B.ox = (cv.width - B.VW * B.S) / 2; B.oy = (cv.height - B.H * B.S) / 2;
  document.documentElement.style.setProperty('--u', (h / 540) + 'px');
  document.body.classList.toggle('portrait', h > w);
};
addEventListener('resize', B.resize); addEventListener('orientationchange', () => setTimeout(B.resize, 200));
B.toggleFS = () => {
  const d = document, el = d.documentElement;
  if (!d.fullscreenElement && !d.webkitFullscreenElement) {
    const p = (el.requestFullscreen || el.webkitRequestFullscreen);
    if (p) { const r = p.call(el); const lock = () => { try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => { }); } catch (_) { } }; if (r && r.then) r.then(lock).catch(() => { }); else lock(); }
  } else { (d.exitFullscreen || d.webkitExitFullscreen).call(d); }
};
B.logical = (clientX, clientY) => {
  const r = B.cv.getBoundingClientRect(), k = B.cv.width / r.width;
  return [((clientX - r.left) * k - B.ox) / B.S, ((clientY - r.top) * k - B.oy) / B.S];
};
