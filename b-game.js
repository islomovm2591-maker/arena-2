'use strict';
// ===== Stickman Jang — o'yin mantig'i: jang, dushmanlar, bosslar, bosqichlar, HUD =====
(function () {
  const c = B.cx, GY = B.GY, W = B.W, TAU = Math.PI * 2;
  const rnd = B.rnd, clamp = B.clamp, rndi = B.rndi;
  const G = B.G = { mode: 'menu', paused: false };
  const SPD0 = 285, GRAV = 2100, JUMPV = 760, SKCOST = 25;
  let HM = { dmg: 1, spd: 1, hp: 1, coin: 1, mpg: 1, sk: 1, atk: 1 };          // tanlangan qahramon bonuslari
  const skc = () => SKCOST * HM.sk;
  const zov = (a0, a1, b0, b1) => a0 < b1 && b0 < a1;
  const R = (t, n) => new Array(n).fill(t);

  // ---------- Dushmanlar ----------
  const ET = {
    grunt: { col: '#e63946', hp: 58, spd: 112, dmg: 9, sc: 1.15, hw: 20, hz: 115, reach: 66, wind: .46, strike: .16, rec: .5, coin: [2, 4], kb: 130, pose: 't' },
    runner: { col: '#9b5de5', hp: 40, spd: 205, dmg: 9, sc: 1.1, hw: 18, hz: 110, coin: [2, 4], kb: 150 },
    brute: { col: '#2ecc71', hp: 250, spd: 66, dmg: 21, sc: 1.6, hw: 32, hz: 168, reach: 120, wind: .8, strike: .2, rec: .9, coin: [7, 11], kb: 200, wep: 'club', pose: 's2', armor: true },
    archer: { col: '#3a86ff', hp: 46, spd: 92, dmg: 10, sc: 1.1, hw: 18, hz: 110, coin: [3, 5], kb: 130, wep: 'bow' },
    bomber: { col: '#ff9f1c', hp: 30, spd: 178, dmg: 26, sc: 1.1, hw: 18, hz: 110, coin: [2, 4], kb: 160 },
    ogre: { col: '#2f9e5b', hp: 1050, spd: 84, dmg: 22, sc: 2.1, hw: 46, hz: 220, coin: [22, 28], kb: 0, wep: 'club', boss: true, name: 'KATTA DEV' },
    mech: { col: '#5c6b82', hp: 1150, spd: 55, dmg: 15, sc: 1.1, hw: 58, hz: 195, coin: [24, 30], kb: 0, boss: true, name: 'TEMIR ROBOT' },
    heli: { col: '#3c4a3a', hp: 620, spd: 150, dmg: 8, sc: 1, hw: 80, hz: 100, coin: [24, 30], kb: 0, boss: true, name: 'JANG VERTOLYOTI' },
    shield: { col: '#4b6d9b', hp: 130, spd: 78, dmg: 14, sc: 1.2, hw: 24, hz: 118, reach: 72, wind: .55, strike: .16, rec: .6, coin: [4, 7], kb: 150, wep: 'knife', pose: 't' },
    ninja: { col: '#3b2f63', hp: 56, spd: 150, dmg: 12, sc: 1.1, hw: 18, hz: 110, reach: 74, wind: .34, strike: .14, rec: .6, coin: [3, 6], kb: 140, wep: 'knife', pose: 's1' },
    samurai: { col: '#2b2d42', hp: 1150, spd: 92, dmg: 17, sc: 1.55, hw: 36, hz: 178, coin: [30, 38], kb: 0, wep: 'katana', boss: true, name: 'QORA SAMURAY' }
  };
  B.ET = ET;

  // ---------- Bosqichlar ----------
  const LV = [
    { n: 'Xona', bg: 'room', par: 130, crates: [380, 1000, 1560, 2150], encs: [
      { x: 640, w: [[...R('grunt', 2)]] }, { x: 1250, w: [[...R('grunt', 2), 'runner']] }, { x: 1900, w: [[...R('grunt', 3)], ['brute', 'grunt']] }] },
    { n: 'Laboratoriya', bg: 'lab', par: 200, crates: [420, 1050, 1700, 2300], encs: [
      { x: 650, w: [[...R('grunt', 2), 'archer']] }, { x: 1250, w: [[...R('runner', 3)], [...R('grunt', 2), 'archer']] }, { x: 1900, w: [['brute', ...R('archer', 2)]] }, { x: 2550, w: [['mech']], boss: true }] },
    { n: 'Tom', bg: 'roof', par: 210, crates: [450, 1100, 1750, 2350], encs: [
      { x: 650, w: [[...R('runner', 2), ...R('bomber', 2)]] }, { x: 1250, w: [[...R('grunt', 3), ...R('archer', 2)]] }, { x: 1900, w: [['brute', ...R('bomber', 2)], [...R('runner', 3)]] }, { x: 2550, w: [['heli']], boss: true }] },
    { n: "Ko'cha", bg: 'street', par: 240, crates: [400, 1000, 1650, 2300, 2900], encs: [
      { x: 620, w: [[...R('grunt', 3), ...R('runner', 2)]] }, { x: 1200, w: [[...R('brute', 2)], [...R('archer', 2), ...R('bomber', 2)]] }, { x: 1850, w: [[...R('runner', 4), ...R('bomber', 2)], [...R('grunt', 3), 'brute']] }, { x: 2650, w: [['ogre']], boss: true }] },
    { n: 'Qizil signal', bg: 'lab', alarm: true, par: 270, crates: [400, 1000, 1650, 2300, 2900], encs: [
      { x: 650, w: [[...R('grunt', 4), ...R('archer', 2)]] }, { x: 1250, w: [[...R('brute', 2), ...R('runner', 3)]] }, { x: 1900, w: [[...R('bomber', 4)], [...R('brute', 2), ...R('archer', 2)]] }, { x: 2600, w: [['mech', ...R('runner', 2)]], boss: true }] },
    { n: 'Oxirgi jang', bg: 'roof', sunset: true, par: 330, crates: [420, 1050, 1700, 2350, 3000], encs: [
      { x: 650, w: [[...R('runner', 4), ...R('bomber', 2)]] }, { x: 1250, w: [[...R('brute', 2), ...R('archer', 3)]] }, { x: 1900, w: [['ogre']], boss: true }, { x: 2600, w: [['heli'], ['mech']], boss: true }] },
    { n: 'Zavod', bg: 'factory', par: 340, crates: [400, 1000, 1650, 2300, 2900], encs: [
      { x: 650, w: [[...R('grunt', 3), 'shield']] }, { x: 1250, w: [[...R('shield', 2), ...R('archer', 2)]] }, { x: 1900, w: [[...R('runner', 3), ...R('bomber', 3)], ['brute', ...R('shield', 2)]] }, { x: 2650, w: [['mech', 'shield']], boss: true }] },
    { n: 'Tungi shahar', bg: 'night', par: 350, crates: [420, 1050, 1700, 2350, 3000], encs: [
      { x: 650, w: [[...R('ninja', 3)]] }, { x: 1250, w: [[...R('ninja', 2), ...R('runner', 2)], [...R('shield', 2), ...R('archer', 2)]] }, { x: 1900, w: [[...R('ninja', 3), ...R('bomber', 2)], ['brute', ...R('ninja', 2)]] }, { x: 2650, w: [['heli', ...R('ninja', 2)]], boss: true }] },
    { n: 'Dojo', bg: 'dojo', par: 370, crates: [420, 1050, 1700, 2350, 3000], encs: [
      { x: 650, w: [[...R('ninja', 4)]] }, { x: 1250, w: [[...R('shield', 2), ...R('ninja', 3)]] }, { x: 1900, w: [[...R('brute', 2), ...R('archer', 3)], [...R('bomber', 4), 'ninja']] }, { x: 2700, w: [['samurai']], boss: true }] },
    { n: "Imperator qal'asi", bg: 'dojo', alarm: true, par: 430, crates: [420, 1050, 1700, 2350, 3000, 3600], encs: [
      { x: 650, w: [[...R('ninja', 3), ...R('shield', 2)]] }, { x: 1250, w: [[...R('brute', 3), ...R('bomber', 3)], [...R('ninja', 4), ...R('runner', 3)]] }, { x: 1900, w: [['ogre', ...R('shield', 2)]], boss: true }, { x: 2750, w: [['samurai'], ['mech', ...R('ninja', 2)]], boss: true }] }
  ];
  B.LV = LV;

  // ---------- Holat ----------
  let hero, en, items, pr, ep, fx, tx, crates, stains, trail;
  let cam, camLock, shake, flashA, hitstop, slow, slowT, L, li, endless, time, enc, encIdx, goT, banner, waveN;
  let combo, comboT, maxCombo, kills, earnedC, earnedG, score, dmgTaken, usedPot, endT, hintT, atkers, bossRef, ewave;
  const diffM = () => [{ h: .8, d: .7, c: .85 }, { h: 1, d: 1, c: 1 }, { h: 1.4, d: 1.35, c: 1.4 }][B.S0.diff == null ? 1 : B.S0.diff];
  const lvM = () => endless ? { h: 1 + .09 * (ewave - 1), d: 1 + .045 * (ewave - 1) } : { h: 1 + .2 * li, d: 1 + .1 * li };
  const curW = () => hero.wep;
  // Qahramon bora oladigan oraliq (sensorli tugmalar uchun chetlar bo'sh qoldiriladi). Bosslar shu oraliqdan 90 pikseldan ortiq tashqariga chiqmaydi — shunda ularga doim yetib bo'ladi.
  const band = () => {
    const t = B.touch, lo = camLock != null ? camLock + (t ? 200 : 34) : cam + 34, hi = camLock != null ? camLock + B.VW - (t ? 250 : 34) : cam + B.VW - 34;
    return [Math.max(cam + 70, lo - 90), Math.min(cam + B.VW - 70, hi + 90)];
  };
  const wmul = k => (1 + .2 * ((B.S0.wl[k] || 3) - 1)) * HM.dmg;

  // ---------- Boshlash ----------
  B.startLevel = (idx, isEndless) => {
    B.audioInit(); const s = B.S0;
    endless = !!isEndless; li = idx || 0; L = endless ? { n: 'Cheksiz jang', bg: 'roof', sunset: true, par: 0, crates: [], encs: [] } : LV[li];
    en = []; items = []; pr = []; ep = []; fx = []; tx = []; stains = []; trail = []; crates = [];
    cam = 0; camLock = null; shake = 0; flashA = 0; hitstop = 0; slow = 1; slowT = 0; time = 0; enc = null; encIdx = 0; goT = 0; banner = null;
    combo = 0; comboT = 0; maxCombo = 0; kills = 0; earnedC = 0; earnedG = 0; score = 0; dmgTaken = 0; usedPot = 0; endT = 0; hintT = 0; atkers = 0; bossRef = null; ewave = 0;
    const hd = B.heroDef(); HM = Object.assign({ dmg: 1, spd: 1, hp: 1, coin: 1, mpg: 1, sk: 1, atk: 1 }, hd.m);
    const maxhp = Math.round((100 + 25 * s.hpL) * HM.hp), maxmp = 60 + 10 * s.mpL;
    hero = { type: 'hero', hd, x: 150, z: 0, vx: 0, vz: 0, face: 1, sc: 1.3, hp: maxhp, maxhp, mp: maxmp * .6, maxmp, st: 'idle', t: 0, ph: 0, pk: 'idle', pu: 0, ci: 0, dur: .3, hit: false, inv: 0, buf: 0, jbuf: 0, cool: 0, wep: s.eq, wtmp: 0, num: 0, dead: false, flash: 0, apose: 's1', skillK: 'wave', tick: 0, potCd: 0 };
    if (endless) { L.len = Math.max(B.VW, 1100); camLock = (L.len - B.VW) / 2; cam = camLock; hero.x = L.len / 2 - 150; startEndlessWave(); }
    else {
      L.len = L.encs[L.encs.length - 1].x + B.VW / 2 + 300;
      L.crates.forEach(x => crates.push({ x, hp: 1, k: (L.bg === 'lab' || L.bg === 'roof' || L.bg === 'factory') ? 'barrel' : 'crate', sh: 0 }));
    }
    sch.length = 0; B.bgInit(L.bg); G.mode = 'play'; G.paused = false; G.ended = false; G.result = null;
    banner = { t: 0, a: endless ? 'CHEKSIZ JANG' : 'LEVEL ' + (li + 1), b: endless ? 'Qancha chidaysiz?' : L.n, life: 2.4 };
    B.clearInput(); B.persist();
  };
  B.curLevel = () => ({ li, endless, L });
  B.stats = () => ({ coins: earnedC, gems: earnedG, time, kills, maxCombo, score, hp: hero.hp, maxhp: hero.maxhp, wave: ewave, dmg: dmgTaken, pots: usedPot });

  // ---------- Yordamchilar ----------
  function addTx(x, y, s, col, big, life) { tx.push({ k: 'd', x, y, s, col: col || '#ffe14d', big: big || 0, t: 0, life: life || .8 }); if (tx.length > 40) tx.shift(); }
  function addWord(x, y, s, col) { tx.push({ k: 'w', x, y, s, col: col || '#fff', t: 0, life: .5, rot: rnd(-.25, .25) }); }
  function blood(x, z, n, dir, col) {
    if (!B.S0.set.blood && !col) { for (let i = 0; i < Math.min(n, 5); i++) fx.push({ k: 'spark', x, z, vx: rnd(-200, 200) + dir * 80, vz: rnd(60, 300), t: 0, life: .3, col: '#fff' }); return; }
    for (let i = 0; i < n; i++) fx.push({ k: 'blood', x, z, vx: dir * rnd(40, 320) + rnd(-90, 90), vz: rnd(80, 420), r: rnd(2, 5.2), t: 0, life: 1.2, col: col || (Math.random() < .3 ? '#ff3b3b' : '#c1121f') });
    if (fx.length > 420) fx.splice(0, 60);
  }
  function sparks(x, z, n, col) { for (let i = 0; i < n; i++) fx.push({ k: 'spark', x, z, vx: rnd(-380, 380), vz: rnd(-60, 380), t: 0, life: rnd(.2, .45), col: col || '#ffe08a' }); }
  function star(x, z, big, col) { fx.push({ k: 'star', x, z, t: 0, life: .22, r: big ? 56 : 34, col: col || '#fff7b0', rot: rnd(0, 6) }); }
  function ring(x, z, r, col, life, w) { fx.push({ k: 'ring', x, z, r, t: 0, life: life || .4, col: col || '#fff', w: w || 5 }); }
  function smoke(x, z, n, big) { for (let i = 0; i < n; i++) fx.push({ k: 'smoke', x: x + rnd(-14, 14), z: z + rnd(-8, 8), vx: rnd(-40, 40), vz: rnd(30, 120), r: rnd(10, big ? 34 : 20), t: 0, life: rnd(.5, 1.1) }); }
  function addShake(v) { shake = Math.max(shake, v); }
  function coinsAt(x, z, n, val) { for (let i = 0; i < n; i++) items.push({ k: 'coin', v: val, x, z: z + 20, vx: rnd(-170, 170), vz: rnd(260, 520), t: 0, life: 14, r: 0 }); }
  function item(k, x, z, extra) { items.push(Object.assign({ k, v: 0, x, z: z + 20, vx: rnd(-90, 90), vz: rnd(300, 460), t: 0, life: 16 }, extra || {})); }
  const coinVal = () => Math.max(1, Math.round(3 * (endless ? 1 + .05 * ewave : 1 + .22 * li) * diffM().c));
  function loot(x, big) {
    const r = Math.random();
    if (r < .42) coinsAt(x, 20, big ? 9 : 6, coinVal());
    else if (r < .56) item('hp', x, 20);
    else if (r < .70) item('mp', x, 20);
    else if (r < .78) item('pot', x, 20);
    else if (r < .93) { const pool = ['katana', 'axe', 'hammer', 'spear', 'dual', 'great', 'scythe']; item('wep', x, 20, { wk: B.pick(pool), life: 20 }); }
    else if (r < .97) item('gem', x, 20);
    else coinsAt(x, 20, 8, coinVal());
  }

  // ---------- Portlash ----------
  function boom(x, z, r, dmg, team) {
    ring(x, z, r, '#ffd166', .45, 8); ring(x, z, r * .6, '#fff', .3, 5);
    for (let i = 0; i < 16; i++) fx.push({ k: 'fire', x, z: z + rnd(0, 20), vx: rnd(-1, 1) * r * 2.2, vz: rnd(-.2, 1.2) * r * 2.4, r: rnd(8, 20), t: 0, life: rnd(.3, .6) });
    smoke(x, z, 6, true); sparks(x, z, 10, '#ffb703'); star(x, z + 20, true, '#fff3b0');
    B.sfx('boom'); addShake(.55); B.buzz(60); flashA = Math.max(flashA, .25);
    if (team === 1) {
      const dx = Math.abs(hero.x - x);
      if (dx < r + 16 && hero.z < r * .9 + 20) hurtHero(dmg * (1 - .35 * Math.min(1, dx / (r + 16))), hero.x >= x ? 1 : -1, { kb: 320, up: 240 });
    } else if (dmg > 0) {
      en.forEach(e => { if (!e.dead && Math.abs(e.x - x) < r + e.hw && e.z < r) hitEnemy(e, dmg, e.x >= x ? 1 : -1, { kb: 300, down: true, heavy: true }); });
    }
    crates.forEach(cr => { if (cr.hp > 0 && Math.abs(cr.x - x) < r + 20) breakCrate(cr); });
  }
  function shockRing(x, r, dmg, kb) {
    ring(x, 6, r, '#fff', .35, 7); smoke(x, 10, 5);
    for (let i = -3; i <= 3; i++) fx.push({ k: 'spark', x: x + i * r / 3, z: 6, vx: i * 40, vz: rnd(120, 300), t: 0, life: .35, col: '#ffe7a8' });
    addShake(.5); B.sfx('heavy');
    if (Math.abs(hero.x - x) < r && hero.z < 50) hurtHero(dmg, hero.x >= x ? 1 : -1, { kb: kb || 300, up: 260 });
  }

  // ---------- Qahramonga zarar ----------
  function hurtHero(dmg, dir, o) {
    const h = hero; o = o || {};
    if (h.inv > 0 || h.dead || G.mode !== 'play') return false;
    dmg = Math.max(1, dmg * diffM().d); h.hp -= dmg; dmgTaken += dmg; combo = 0; comboT = 0; h.inv = o.inv || .9; h.flash = .12;
    addShake(.3); B.buzz(35); B.sfx('hurt'); blood(h.x, h.z + 60, 9, -dir); addTx(h.x, GY - h.z - 140, '-' + Math.round(dmg), '#ff5a5a', 1); star(h.x, h.z + 70, false, '#ffd0d0');
    flashA = Math.max(flashA, .12);
    if (h.hp <= 0) { heroDie(dir); return true; }
    if (h.st !== 'skill' && o.stun !== false) { h.st = 'hurt'; h.t = 0; h.vx = dir * (o.kb || 220); if (o.up) h.vz = Math.max(h.vz, o.up); }
    return true;
  }
  function heroDie(dir) {
    const h = hero; h.hp = 0; h.dead = true; h.st = 'dead'; h.vx = dir * 340; h.vz = 460; h.t = 0; h.rot = -1.5 * h.face;
    slow = .3; slowT = 1.6; B.sfx('lose'); blood(h.x, h.z + 60, 24, dir); addShake(.6); endT = 0; G.mode = 'dying';
  }
  B.revive = () => {
    const h = hero; h.dead = false; h.st = 'idle'; h.hp = h.maxhp * .6; h.inv = 2.5; h.z = 0; h.vz = 0; h.vx = 0; h.rot = 0; slow = 1; slowT = 0; G.mode = 'play'; G.paused = false; G.ended = false;
    ring(h.x, 40, 160, '#7dffb0', .6, 8); B.sfx('potion'); en.forEach(e => { if (!e.boss && Math.abs(e.x - h.x) < 260) { e.vx = (e.x >= h.x ? 1 : -1) * 400; e.st = 'hurt'; e.t = 0; } });
  };

  // ---------- Dushmanga zarar ----------
  const WORDS = ['POW!', 'BAM!', 'WHAM!', 'CRACK!', 'BOOM!', 'SMASH!', 'ZAP!'];
  function hitEnemy(e, dmg, dir, o) {
    if (e.dead || e.inv > 0) return;
    o = o || {}; const T = ET[e.type];
    if (T.armor) dmg *= .85;
    let blocked = false, broke = false;
    if (e.type === 'shield' && e.shd > 0 && dir === -e.face) {            // qalqon oldidan kelgan zarba
      blocked = true; e.shd -= dmg * (o.heavy ? 1.7 : 1); dmg *= o.heavy ? .4 : .06;
      sparks(e.x + e.face * 30, e.z + 72, 7, '#cfe3ff'); addWord(e.x + e.face * 26, GY - e.z - 130, 'BLOK!', '#9fd0ff'); e.sf = .12;
      if (e.shd <= 0) {
        e.shd = 0; broke = true; B.sfx('heavy'); addShake(.3); star(e.x + e.face * 28, e.z + 72, true, '#cfe3ff'); addWord(e.x, GY - e.z - 160, 'QALQON SINDI!', '#ffd23f');
        for (let i = 0; i < 6; i++) fx.push({ k: 'seg', x1: e.x + e.face * 26 + rnd(-8, 8), y1: GY - e.z - 70 + rnd(-24, 24), x2: e.x + e.face * 26 + rnd(-14, 14), y2: GY - e.z - 70 + rnd(-24, 24), vx: e.face * rnd(60, 260), vy: rnd(-420, -120), rot: 0, vr: rnd(-9, 9), w: 6, col: '#9fb0c4', t: 0, life: 1.1 });
      }
    }
    e.hp -= dmg; e.flash = .09; e.acc = (e.acc || 0) + dmg;
    combo++; comboT = 2.6; if (combo > maxCombo) maxCombo = combo; hero.mp = Math.min(hero.maxmp, hero.mp + (o.mp == null ? 2.6 : o.mp) * HM.mpg); score += Math.round(dmg);
    const hx = e.x, hz = e.z + e.hz * .55;
    addTx(hx + rnd(-10, 10), GY - hz - 30, Math.round(dmg), o.heavy ? '#ff9f1c' : '#ffe14d', o.heavy ? 1 : 0);
    blood(hx, hz, o.heavy ? 14 : 7, dir); star(hx, hz, o.heavy); sparks(hx, hz, 4);
    if (o.heavy || Math.random() < .18) addWord(hx + rnd(-20, 20), GY - hz - 60, B.pick(WORDS), o.heavy ? '#ffd23f' : '#fff');
    B.sfx(o.heavy ? 'heavy' : 'hit'); B.buzz(o.heavy ? 22 : 10);
    if (e.hp <= 0) { killEnemy(e, dir, o); return; }
    if (blocked && !broke) { e.vx += dir * 50; return; }
    if (broke) { e.st = 'hurt'; e.t = 0; e.vx = dir * 90; e.hdur = .7; e.hit = false; return; }
    if (e.boss) {
      if (e.type === 'mech' && e.acc > e.maxhp * .16 && e.st !== 'stagger') { e.acc = 0; e.st = 'stagger'; e.t = 0; e.vx = 0; sparks(e.x, 120, 14, '#9ecbff'); }
      e.vx += dir * 8; return;
    }
    if (T.armor && !o.down && dmg < 34 && !o.heavy) { e.vx += dir * (o.kb || 100) * .35; return; }
    e.hit = false;
    if (o.down) { e.st = 'down'; e.t = 0; e.vz = 300; e.vx = dir * (o.kb || 200) * 1.2; e.z = Math.max(e.z, 1); e.lie = 0; }
    else { e.st = 'hurt'; e.t = 0; e.vx = dir * (o.kb || 130); e.hdur = o.heavy ? .4 : .28; if (e.st === 'leap') e.vz = 0; }
  }
  function killEnemy(e, dir, o) {
    e.dead = true; e.st = 'dead'; e.t = 0; kills++; e.vx = dir * (360 + (o && o.kb || 0) * .5); e.vz = 380; e.z = Math.max(e.z, 1); e.rot = -1.5 * e.face; e.spin = -dir * 7;
    const T = ET[e.type]; const n = rndi(T.coin[0], T.coin[1]); coinsAt(e.x, e.z + 20, n, coinVal());
    if (!e.boss) { const r = Math.random(); if (r < .08) item('hp', e.x, 30); else if (r < .2) item('mp', e.x, 30); else if (r < .22) item('gem', e.x, 30); }
    if (e.boss) { for (let i = 0; i < 3; i++) item('gem', e.x + rnd(-30, 30), 40); earnedG += 0; addShake(.8); slow = .25; slowT = 1.3; flashA = .6; B.sfx('boom'); }
    if (e.type === 'bomber') boom(e.x, e.z, 95, 18, 1);
    if (e.type === 'mech') { e.dyn = 0; e.vx = 0; e.vz = 0; e.st = 'dead'; e.rot = 0; e.spin = 0; }
    if (e.type === 'heli') { e.vx = e.vx * .4; e.vz = 0; e.rot = 0; e.spin = 0; }
    if (e.type === 'ogre' || e.type === 'samurai') { e.vx *= .3; e.vz = 0; e.z = 0; e.burn = 0; }
    e.burn = 0;
  }
  function burst(e) { // jasadni siniq bo'laklarga ajratish
    const f = { x: e.x, z: e.z, face: e.face, sc: e.sc, gy: GY, pk: 'down', t: 0 }, S = B.skel(f, [0, .5, .3, .7, .3, .1, .05, -.1, .05, 0, 0, 0], true);
    const col = '#12121b', rim = B.rimOf(e.type) || e.col, parts = [[S.hx, S.hy, S.nx, S.ny], [S.hx, S.hy, S.kneeF[0], S.kneeF[1]], [S.kneeF[0], S.kneeF[1], S.footF[0], S.footF[1]], [S.sx, S.sy, S.elbF[0], S.elbF[1]], [S.elbF[0], S.elbF[1], S.handF[0], S.handF[1]], [S.hx, S.hy, S.kneeB[0], S.kneeB[1]]];
    parts.forEach(p => fx.push({ k: 'seg', x1: p[0], y1: p[1], x2: p[2], y2: p[3], vx: rnd(-260, 260), vy: rnd(-420, -80), rot: 0, vr: rnd(-9, 9), w: 6 * e.sc, col, rim, t: 0, life: 1.3 }));
    fx.push({ k: 'head', x: S.hdx, y: S.hdy, vx: rnd(-200, 200), vy: rnd(-500, -200), r: 11 * e.sc, col, rim, t: 0, life: 1.3 });
    blood(e.x, 40, 14, 0); smoke(e.x, 30, 3);
  }

  // ---------- Qutilar ----------
  function breakCrate(cr) {
    if (cr.hp <= 0) return; cr.hp = 0; B.sfx('break'); addShake(.15);
    for (let i = 0; i < 9; i++) fx.push({ k: 'seg', x1: cr.x + rnd(-20, 20), y1: GY - rnd(8, 50), x2: cr.x + rnd(-20, 20), y2: GY - rnd(8, 50), vx: rnd(-240, 240), vy: rnd(-420, -60), rot: 0, vr: rnd(-9, 9), w: 5, col: cr.k === 'barrel' ? '#c0392b' : '#8a5a2b', t: 0, life: 1 });
    smoke(cr.x, 20, 3); loot(cr.x, false);
  }

  // ---------- Hujum ----------
  function startAtk(ci, air) {
    const h = hero, w = W[curW()];
    h.st = 'atk'; h.ci = ci; h.t = 0; h.hit = false; h.buf = 0; h.air = air;
    h.dur = w.dur * HM.atk * (ci === 2 ? 1.28 : 1) * (air ? .9 : 1);
    h.apose = w.pose === 't' ? 't' : (air ? 's2' : ['s1', 's2', 's3'][ci]);
    h.vx += h.face * (ci === 2 ? 250 : 150) * (air ? .5 : 1); B.sfx('swing'); h.sw = 0;
  }
  function doStrike() {
    const h = hero, wk = curW(), w = W[wk], heavyHit = h.ci === 2 && !h.air;
    const base = w.dmg * wmul(wk) * (heavyHit ? 1.6 : 1) * (h.air ? .9 : 1);
    const reach = w.reach * (heavyHit ? 1.08 : 1), x0 = h.x - h.face * 14, x1 = h.x + h.face * reach, lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    let hits = 0, big = false;
    en.forEach(e => {
      if (e.dead || e.inv > 0) return;
      if (e.x + e.hw > lo && e.x - e.hw < hi && zov(h.z - 15, h.z + 128, e.z, e.z + e.hz)) {
        hitEnemy(e, base * rnd(.92, 1.08), h.face, { kb: w.kb * (heavyHit ? 1.7 : 1), down: heavyHit && !e.boss, heavy: heavyHit || wk === 'hammer' }); hits++;
      }
    });
    crates.forEach(cr => { if (cr.hp > 0 && cr.x + 26 > lo && cr.x - 26 < hi && h.z < 70) { breakCrate(cr); hits++; } });
    if (hits) { hitstop = heavyHit ? .075 : .04; addShake(heavyHit ? .35 : .12); }
    if (wk === 'flame') {
      for (let i = 0; i < 7; i++) fx.push({ k: 'fire', x: x1 - h.face * rnd(0, 50), z: h.z + rnd(40, 110), vx: h.face * rnd(40, 160), vz: rnd(-20, 90), r: rnd(6, 13), t: 0, life: rnd(.25, .45) });
      if (hits) en.forEach(e => { if (!e.dead && e.x + e.hw > lo && e.x - e.hw < hi && zov(h.z - 15, h.z + 128, e.z, e.z + e.hz)) { e.burn = 2.6; e.burnD = base * .1; } });
    }
    if (wk === 'hammer' && heavyHit) { ring(x1, 6, 110, '#fff', .3, 6); smoke(x1, 8, 4); addShake(.4); }
    if (wk === 'plasma' && heavyHit) pr.push({ x: h.x + h.face * 50, z: 70, vx: h.face * 700, dir: h.face, dmg: base * .8, life: .8, col: w.col, hits: new Set(), size: .7 });
    if (!hits) sparks(x1, h.z + 60, 3, '#fff');
  }
  function trySkill() {
    const h = hero; if (h.dead || h.st === 'skill' || G.mode !== 'play') return;
    if (h.mp < skc()) { addTx(h.x, GY - h.z - 150, 'ENERGIYA KAM', '#7fb8ff', 0, .8); B.sfx('warn'); return; }
    h.mp -= skc(); h.st = 'skill'; h.t = 0; h.hit = false; h.skillK = W[curW()].skill; h.dur = h.skillK === 'wave' ? .62 : h.skillK === 'spin' ? .85 : .88; h.tick = 0; h.inv = Math.max(h.inv, h.dur); h.vx = 0;
    B.sfx('skill'); ring(h.x, 50, 80, W[curW()].col, .35, 5);
    fx.push({ k: 'web', x: h.x + h.face * 40, z: 70, col: h.hd.col, seed: Math.random() * 90, t: 0, life: .6 }); flashA = Math.max(flashA, .1);
  }
  function usePotion() {
    const h = hero, s = B.S0; if (h.dead || h.potCd > 0 || s.pot <= 0 || h.hp >= h.maxhp) return;
    s.pot--; usedPot++; h.potCd = .8; const add = h.maxhp * .5; h.hp = Math.min(h.maxhp, h.hp + add); B.sfx('potion'); ring(h.x, 40, 90, '#7dffb0', .5, 6);
    addTx(h.x, GY - h.z - 150, '+' + Math.round(add), '#6cff9a', 1);
    for (let i = 0; i < 14; i++) fx.push({ k: 'spark', x: h.x + rnd(-24, 24), z: rnd(0, 100), vx: 0, vz: rnd(80, 220), t: 0, life: .7, col: '#7dffb0' });
  }
  B.usePotion = usePotion;

  // ---------- Qahramon yangilash ----------
  function heroUpdate(dt) {
    const h = hero, k = B.keys, s = B.S0, SPD = SPD0 * HM.spd;
    h.t += dt; h.inv = Math.max(0, h.inv - dt); h.buf -= dt; h.jbuf -= dt; h.flash -= dt; h.cool -= dt; h.potCd -= dt; h.num = 0;
    if (h.wtmp > 0) { h.wtmp -= dt; if (h.wtmp <= 0) { h.wep = s.eq; addTx(h.x, GY - 150, "Qurol almashdi", '#fff', 0, .8); } }
    if (!h.dead) {
      h.mp = Math.min(h.maxmp, h.mp + dt * 3.2 * HM.mpg);
      if (B.press.a) h.buf = .24; if (B.press.j) h.jbuf = .16; if (B.press.s) trySkill(); if (B.press.p) usePotion();
    }
    const dir = (k.r ? 1 : 0) - (k.l ? 1 : 0), ground = h.z <= 0 && h.vz <= 0;
    const mL = B.touch ? 200 : 34, mR = B.touch ? 250 : 34, lock = camLock != null ? [camLock + mL, camLock + B.VW - mR] : [30, L.len - 30];
    if (h.dead) { h.vx *= Math.pow(.02, dt); h.rot += (h.spin || 0) * dt; }
    else switch (h.st) {
      case 'idle': case 'run': {
        const tv = dir * SPD; h.vx += clamp(tv - h.vx, -dt * 2600, dt * 2600);
        if (dir) h.face = dir;
        if (h.jbuf > 0 && ground) { h.vz = JUMPV; h.jbuf = 0; B.sfx('jump'); for (let i = 0; i < 5; i++) fx.push({ k: 'dust', x: h.x + rnd(-14, 14), z: 2, vx: rnd(-60, 60), vz: rnd(20, 70), r: rnd(4, 8), t: 0, life: .4 }); }
        if ((h.buf > 0 || k.a) && h.cool <= 0) startAtk(0, !ground);
        break;
      }
      case 'atk': {
        const u = h.t / h.dur, hz = h.apose === 's3' ? [.5, .72] : [.4, .62];
        h.vx += clamp(dir * SPD * (h.air ? .8 : .25) - h.vx, -dt * 1500, dt * 1500) * (h.air ? 1 : .6);
        if (!h.hit && u >= hz[0]) { h.hit = true; doStrike(); }
        if (u >= .6 && (h.buf > 0 || k.a) && h.ci < 2 && !h.air) { if (dir) h.face = dir; startAtk(h.ci + 1, false); }
        else if (u >= 1) { h.st = 'idle'; h.cool = h.ci === 2 ? .14 : 0; }
        break;
      }
      case 'skill': {
        const u = h.t / h.dur; h.vx *= Math.pow(.01, dt);
        if (h.skillK === 'wave') {
          if (!h.hit && u >= .56) { h.hit = true; const w = W[curW()]; pr.push({ x: h.x + h.face * 50, z: 80, vx: h.face * 780, dir: h.face, dmg: w.dmg * wmul(curW()) * 3, life: .95, col: w.col, hits: new Set(), size: w.wsz || 1, burn: curW() === 'flame' }); addShake(.3); flashA = .15; B.sfx('heavy'); star(h.x + h.face * 70, 70, true, w.col); }
        } else if (h.skillK === 'spin') {
          h.vx += dir * SPD * .5 * dt * 8; h.vx = clamp(h.vx, -SPD * .55, SPD * .55);
          h.tick -= dt; if (h.tick <= 0 && u > .08 && u < .92) {
            h.tick = .14; const w = W[curW()]; B.sfx('swing'); ring(h.x, 60, 150, w.col, .25, 5);
            en.forEach(e => { if (!e.dead && e.inv <= 0 && Math.abs(e.x - h.x) < 170 + e.hw && zov(h.z - 20, h.z + 130, e.z, e.z + e.hz)) hitEnemy(e, w.dmg * wmul(curW()) * 1.05, e.x >= h.x ? 1 : -1, { kb: 260, heavy: false, mp: 1 }); });
            crates.forEach(cr => { if (cr.hp > 0 && Math.abs(cr.x - h.x) < 180) breakCrate(cr); });
          }
        } else if (h.skillK === 'pound') {
          if (!h.hit && u >= .62) {
            h.hit = true; const w = W[curW()]; fx.push({ k: 'web', x: h.x + h.face * 80, z: 30, col: h.hd.col, seed: Math.random() * 90, t: 0, life: .55 }); ring(h.x + h.face * 80, 6, 260, '#fff', .45, 9); ring(h.x + h.face * 80, 6, 160, w.col, .35, 6); smoke(h.x + h.face * 80, 8, 8, true); addShake(.75); hitstop = .08; B.sfx('boom'); B.buzz(50);
            en.forEach(e => { if (!e.dead && Math.abs(e.x - h.x) < 260 + e.hw && e.z < 90) hitEnemy(e, w.dmg * wmul(curW()) * 3, e.x >= h.x ? 1 : -1, { kb: 320, down: !e.boss, heavy: true, mp: 1 }); });
            crates.forEach(cr => { if (cr.hp > 0 && Math.abs(cr.x - h.x) < 280) breakCrate(cr); });
          }
        }
        if (u >= 1) { h.st = 'idle'; h.cool = .1; }
        break;
      }
      case 'hurt': h.vx *= Math.pow(.02, dt); if (h.t > .26) h.st = 'idle'; break;
    }
    // fizika
    h.x += h.vx * dt; h.x = clamp(h.x, lock[0], lock[1]);
    if (h.z > 0 || h.vz > 0) { h.vz -= GRAV * dt; h.z += h.vz * dt; if (h.z <= 0) { h.z = 0; if (h.vz < -300) { for (let i = 0; i < 4; i++) fx.push({ k: 'dust', x: h.x + rnd(-14, 14), z: 2, vx: rnd(-80, 80), vz: rnd(20, 60), r: rnd(4, 8), t: 0, life: .35 }); } h.vz = 0; if (h.dead) h.vx *= .3; } }
    // poza
    const sp = Math.abs(h.vx);
    if (h.dead) { h.pk = 'down'; h.pu = 0; } else if (h.st === 'hurt') h.pk = 'hurt';
    else if (h.st === 'atk') { h.pk = h.apose; h.pu = clamp(h.t / h.dur, 0, 1); }
    else if (h.st === 'skill') { h.pk = h.skillK === 'wave' ? 'wave' : h.skillK === 'spin' ? 'spin' : 'pound'; h.pu = clamp(h.t / h.dur, 0, 1); }
    else if (h.z > 0 || h.vz > 0) h.pk = 'air';
    else if (sp > 40) { h.pk = 'run'; h.ph += dt * sp / 15; } else h.pk = 'idle';
    // oqish izi
    if ((h.st === 'atk' && h.pu > .28 && h.pu < .78) || (h.st === 'skill' && h.skillK === 'spin')) {
      const P = B.poseOf(h), S = B.skel(h, P), wl = (W[h.wep].len) * h.sc; const px = S.handF[0], py = S.handF[1];
      trail.push({ x1: px + S.wd[0] * wl * .35, y1: py + S.wd[1] * wl * .35, x2: px + S.wd[0] * wl, y2: py + S.wd[1] * wl, a: 1, col: W[h.wep].col, brk: !h.sw }); h.sw = 1;
    } else h.sw = 0;
  }

  // ---------- Dushman yaratish ----------
  function spawnEnemy(type, side) {
    const T = ET[type], m = lvM(), dm = diffM();
    const left = cam - 70, right = cam + B.VW + 70;
    const x = side == null ? (Math.random() < .5 ? left : right) : (side < 0 ? left : right);
    const hp = T.hp * m.h * dm.h * (T.boss && endless ? 1 + .1 * Math.floor(ewave / 5) : 1);
    const e = { type, x, z: 0, vx: 0, vz: 0, face: x < hero.x ? 1 : -1, sc: T.sc, col: T.col, hp, maxhp: hp, dmg: T.dmg * m.d, spd: T.spd * rnd(.92, 1.1), st: 'walk', t: 0, cd: rnd(.5, 1.4), ph: rnd(0, 6), pk: 'idle', pu: 0, hw: T.hw, hz: T.hz, wep: T.wep, inv: 0, flash: 0, num: rnd(0, 6), hit: false, boss: !!T.boss, dead: false, acc: 0, name: T.name };
    if (type === 'heli') { e.z = 120; e.x = hero.x + (Math.random() < .5 ? -1 : 1) * (B.VW * .7); e.mode = 'enter'; e.mt = 0; e.col = '#3c4a3a'; e.dmg = 7 * m.d; }
    if (type === 'mech') e.dmg = 15 * m.d;
    if (type === 'shield') { e.shdMax = 115 * m.h * dm.h; e.shd = e.shdMax; }
    if (type === 'samurai') e.dmg = 17 * m.d;
    if (T.boss) { bossRef = e; banner = { t: 0, a: 'BOSS', b: T.name, life: 2.2, red: true }; B.sfx('roar'); addShake(.5); }
    en.push(e); return e;
  }

  // ---------- Dushman AI ----------
  const tokenMax = () => (diffM().d > 1.2 ? 3 : 2);
  function startWind(e, T) { e.st = 'wind'; e.t = 0; e.hit = false; e.vx = 0; e.wdur = T.wind; e.sdur = T.strike; e.rdur = T.rec; e.apose = T.pose || 't'; e.atk = 'melee'; atkers++; }
  function enemyMelee(e, T) {
    const reach = T.reach || 64, x0 = e.x - e.face * 10, x1 = e.x + e.face * reach, lo = Math.min(x0, x1), hi = Math.max(x0, x1);
    if (hero.x + 18 > lo && hero.x - 18 < hi && zov(e.z, e.z + e.hz, hero.z, hero.z + 120)) hurtHero(e.dmg, e.face, { kb: 240 });
    if (e.type === 'brute') { shockRing(e.x + e.face * 90, 105, e.dmg * .7, 260); }
  }
  function aiWalk(e, dt, T) {
    const h = hero, dx = h.x - e.x, ad = Math.abs(dx), dir = dx >= 0 ? 1 : -1, tk = tokenMax();
    e.face = dir;
    switch (e.type) {
      case 'grunt': case 'brute': case 'shield': {
        const want = (T.reach || 64) * .78;
        if (ad > want) e.vx = dir * e.spd; else { e.vx = Math.sin(time * 2 + e.num) * 16 - dir * (ad < want * .5 ? 40 : 0); if (e.cd <= 0 && atkers < tk && Math.abs(h.z - e.z) < 70 && !h.dead) startWind(e, T); }
        break;
      }
      case 'runner': {
        if (ad > 250) e.vx = dir * e.spd; else if (e.cd <= 0 && atkers < tk + 1 && !h.dead) { e.st = 'wind'; e.t = 0; e.vx = 0; e.wdur = .34; e.sdur = 0; e.rdur = .5; e.apose = 't'; e.atk = 'leap'; e.hit = false; atkers++; } else e.vx = dir * e.spd * .55 * (ad < 150 ? -1 : 1);
        break;
      }
      case 'archer': {
        const edge = e.x < cam + 75 || e.x > cam + B.VW - 75;
        if (edge && ad < 340) e.chg = 1.5;                               // burchakka tiqilgan — qochmay, yaqinlashadi
        if (e.chg > 0) { e.chg -= dt; e.vx = ad > 115 ? dir * e.spd * .85 : 0; }
        else if (ad < 210) e.vx = -dir * e.spd * 1.25; else if (ad > 480) e.vx = dir * e.spd; else e.vx = Math.sin(time * 1.5 + e.num) * 24;
        if (e.cd <= 0 && ad > 200 && ad < 560 && !h.dead) { e.st = 'wind'; e.t = 0; e.vx = 0; e.wdur = .55; e.sdur = 0; e.rdur = .45; e.atk = 'shoot'; e.hit = false; }
        break;
      }
      case 'ninja': {
        if (ad > 270) e.vx = dir * e.spd;
        else if (e.cd <= 0 && atkers < tk + 1 && !h.dead) { e.st = 'vanish'; e.t = 0; e.vx = 0; e.inv = .36; B.sfx('warn'); smoke(e.x, 30, 4); star(e.x, 70, false, '#7de8ff'); }
        else e.vx = dir * e.spd * (ad > 160 ? .55 : -.4);
        break;
      }
      case 'bomber': {
        if (ad > 82) e.vx = dir * e.spd; else { e.st = 'fuse'; e.t = 0; e.vx = 0; B.sfx('warn'); }
        break;
      }
    }
  }
  function enemyUpdate(e, dt) {
    const T = ET[e.type], h = hero;
    e.t += dt; e.flash -= dt; e.cd -= dt; e.inv = Math.max(0, e.inv - dt);
    if (e.burn > 0 && !e.dead) {
      e.burn -= dt; e.bt = (e.bt || 0) - dt;
      if (Math.random() < .55) fx.push({ k: 'fire', x: e.x + rnd(-12, 12), z: e.z + rnd(20, e.hz * .9), vx: rnd(-20, 20), vz: rnd(40, 110), r: rnd(5, 10), t: 0, life: .3 });
      if (e.bt <= 0) { e.bt = .45; const bd = e.burnD || 4; e.hp -= bd; e.flash = .05; addTx(e.x, GY - e.z - e.hz - 10, Math.round(bd), '#ff8a3a', 0, .5); if (e.hp <= 0) { killEnemy(e, -e.face, {}); return; } }
    }
    if (e.sf > 0) e.sf -= dt;
    if (e.appear) { if (e.st === 'wind') e.alpha = clamp(e.t / .18, 0, 1); else if (e.st === 'strike' || e.st === 'rec') e.alpha = 1; else { e.appear = false; e.alpha = 1; } }
    if (e.type === 'ogre') return ogreAI(e, dt, T);
    if (e.type === 'samurai') return samuraiAI(e, dt, T);
    if (e.type === 'mech') return mechAI(e, dt, T);
    if (e.type === 'heli') return heliAI(e, dt, T);
    switch (e.st) {
      case 'walk': aiWalk(e, dt, T); break;
      case 'wind': {
        e.vx *= Math.pow(.01, dt); if (e.atk !== 'leap' && e.type !== 'archer') e.face = h.x >= e.x ? 1 : -1;
        if (e.t >= e.wdur) {
          if (e.atk === 'melee') { e.st = 'strike'; e.t = 0; enemyMelee(e, T); }
          else if (e.atk === 'leap') { e.st = 'leap'; e.t = 0; e.vz = 430; e.vx = e.face * 500; e.hit = false; }
          else if (e.atk === 'shoot') { e.st = 'rec'; e.t = 0; e.wdur = 0; e.sdur = 0; ep.push({ k: 'knife', x: e.x + e.face * 30, z: 62, vx: e.face * 470, vz: 0, r: 10, dmg: e.dmg, life: 1.8 }); B.sfx('bolt'); }
        }
        break;
      }
      case 'vanish': {
        e.vx = 0; e.alpha = clamp(1 - e.t / .2, 0, 1);
        if (e.t >= .34) {
          const side = Math.random() < .6 ? -h.face : h.face; let nx = clamp(h.x + side * 105, cam + 60, cam + B.VW - 60); if (Math.abs(nx - h.x) < 70) nx = clamp(h.x - side * 105, cam + 60, cam + B.VW - 60);
          e.x = nx; e.z = 0; e.vz = 0; e.face = h.x >= nx ? 1 : -1; smoke(e.x, 24, 5); star(e.x, 70, false, '#7de8ff'); B.sfx('swing');
          e.st = 'wind'; e.t = 0; e.wdur = .34; e.sdur = .14; e.rdur = .6; e.apose = 's1'; e.atk = 'melee'; e.hit = false; e.appear = true; e.alpha = 0; atkers++;
        }
        break;
      }
      case 'strike': if (e.t >= (e.sdur || .15)) { e.st = 'rec'; e.t = 0; } break;
      case 'leap': if (!e.hit && Math.abs(h.x - e.x) < 46 && zov(e.z, e.z + e.hz, h.z, h.z + 120)) { e.hit = true; hurtHero(e.dmg, e.face, { kb: 260 }); } break;
      case 'rec': e.vx *= Math.pow(.02, dt); if (e.t >= (e.rdur || .5)) { e.st = 'walk'; e.t = 0; e.cd = rnd(.8, 1.8) / (diffM().d > 1.2 ? 1.3 : 1); } break;
      case 'fuse': e.vx = 0; if (e.t > .62) { boom(e.x, e.z, 120, e.dmg, 1); e.hp = 0; e.dead = true; e.gone = true; kills++; coinsAt(e.x, 30, rndi(2, 4), coinVal()); } break;
      case 'hurt': e.vx *= Math.pow(.015, dt); if (e.t > (e.hdur || .28)) { e.st = 'walk'; e.cd = Math.max(e.cd, .35); } break;
      case 'down': e.vx *= Math.pow(.2, dt); if (e.z <= 0 && e.vz <= 0) { e.lie = (e.lie || 0) + dt; if (e.lie > .6) { e.st = 'walk'; e.cd = .5; e.inv = .3; } } break;
      case 'dead': e.rot += (e.spin || 0) * dt; break;
    }
    // fizika
    e.x += e.vx * dt;
    if (e.z > 0 || e.vz > 0) {
      e.vz -= GRAV * dt; e.z += e.vz * dt;
      if (e.z <= 0) { e.z = 0; if (e.st === 'leap') { e.st = 'rec'; e.t = 0; e.rdur = .55; e.vx = 0; e.cd = rnd(1, 1.8); } else if (e.st === 'dead') { e.vz = 0; e.vx *= .3; e.gone = true; } else e.vz = 0; }
    } else if (e.st === 'dead') { e.vx *= .5; e.gone = true; }
    if (e.st === 'dead' && e.t > 1.2) e.gone = true;
    const sp = Math.abs(e.vx);
    switch (e.st) {
      case 'wind': e.pk = e.atk === 'shoot' ? 'arch' : e.apose; e.pu = e.atk === 'shoot' ? 0 : clamp(e.t / e.wdur, 0, 1) * .3; break;
      case 'strike': e.pk = e.apose; e.pu = .3 + clamp(e.t / (e.sdur || .15), 0, 1) * .3; break;
      case 'rec': e.pk = e.atk === 'shoot' ? 'arch' : e.apose || 'idle'; e.pu = e.atk === 'shoot' ? 0 : .6 + clamp(e.t / (e.rdur || .5), 0, 1) * .4; if (e.atk === 'leap' || !e.apose) { e.pk = 'idle'; } break;
      case 'leap': e.pk = 'dive'; break;
      case 'fuse': e.pk = 'panic'; break;
      case 'hurt': e.pk = 'hurt'; break;
      case 'down': case 'dead': e.pk = 'down'; break;
      default: if (sp > 25) { e.pk = 'run'; e.ph += dt * sp / 15; } else e.pk = 'idle';
    }
    if (e.st === 'rec' && e.pk === 'arch' && e.t > .3) e.pk = 'idle';
  }

  // ---- Katta dev ----
  function ogreAI(e, dt, T) {
    const h = hero, dx = h.x - e.x, ad = Math.abs(dx), dir = dx >= 0 ? 1 : -1;
    const enr = e.hp < e.maxhp * .5;
    if (enr && !e.enraged) { e.enraged = true; e.st = 'roar'; e.t = 0; e.vx = 0; B.sfx('roar'); addShake(.7); ring(e.x, 60, 260, '#ff5a5a', .6, 10); banner = { t: 0, a: 'G\'AZABDA!', b: '', life: 1.4, red: true }; spawnEnemy('grunt', -1); spawnEnemy('grunt', 1); e.col = '#3aa86a'; }
    switch (e.st) {
      case 'walk': e.face = dir; e.vx = ad > 150 ? dir * e.spd * (enr ? 1.25 : 1) : 0;
        if (e.cd <= 0 && !h.dead) { if (ad < 190) { e.st = 'wind'; e.t = 0; e.vx = 0; e.atk = 'slam'; e.wdur = enr ? .65 : .85; e.apose = 's2'; e.hit = false; } else if (ad > 260 && Math.random() < .6) { e.st = 'wind'; e.t = 0; e.vx = 0; e.atk = 'charge'; e.wdur = .6; e.apose = 's1'; } else e.cd = .3; }
        break;
      case 'wind': e.vx = 0; if (e.t >= e.wdur) { if (e.atk === 'slam') { e.st = 'strike'; e.t = 0; shockRing(e.x + e.face * 120, 165, e.dmg, 330); const x = e.x + e.face * 120; if (Math.abs(h.x - x) < 70 && h.z < 140) hurtHero(e.dmg * .5, e.face, { kb: 260 }); } else { e.st = 'charge'; e.t = 0; e.vx = e.face * 440; e.hit = false; B.sfx('roar'); } } break;
      case 'strike': if (e.t > .3) { e.st = 'rec'; e.t = 0; e.rdur = enr ? .6 : .95; } break;
      case 'charge': { e.vx = e.face * 440; if (!e.hit && Math.abs(h.x - e.x) < 62 && h.z < 150) { e.hit = true; hurtHero(e.dmg * 1.1, e.face, { kb: 380, up: 280 }); } if (Math.random() < .5) fx.push({ k: 'dust', x: e.x - e.face * 30, z: 4, vx: -e.face * 60, vz: 40, r: 8, t: 0, life: .4 }); if (e.t > .85 || e.x < cam - 40 || e.x > cam + B.VW + 40) { e.st = 'rec'; e.t = 0; e.rdur = enr ? .7 : 1.0; e.vx = 0; } break; }
      case 'rec': e.vx = 0; if (e.t > e.rdur) { e.st = 'walk'; e.cd = enr ? .6 : 1.2; } break;
      case 'roar': e.vx = 0; if (e.t > 1.1) { e.st = 'walk'; e.cd = .6; } break;
      case 'dead': e.rot = 0; e.vx *= Math.pow(.05, dt); if (e.t > 1.4) e.gone = true; break;
    }
    e.x += e.vx * dt; e.z = Math.max(0, e.z + e.vz * dt);
    if (e.st === 'dead') { e.pk = 'down'; e.rot = -1.5 * e.face * Math.min(1, e.t * 3); }
    else if (e.st === 'wind') { e.pk = e.apose; e.pu = clamp(e.t / e.wdur, 0, 1) * .34; }
    else if (e.st === 'strike') { e.pk = 's2'; e.pu = .5 + clamp(e.t / .3, 0, 1) * .18; }
    else if (e.st === 'charge') { e.pk = 'dive'; }
    else if (e.st === 'roar') { e.pk = 'panic'; }
    else if (e.st === 'rec') { e.pk = 's2'; e.pu = .7 + clamp(e.t / e.rdur, 0, 1) * .3; }
    else if (Math.abs(e.vx) > 20) { e.pk = 'run'; e.ph += dt * Math.abs(e.vx) / 18; } else e.pk = 'idle';
  }

  // ---- Qora samuray ----
  function samuraiAI(e, dt, T) {
    const h = hero, dx = h.x - e.x, ad = Math.abs(dx), dir = dx >= 0 ? 1 : -1, enr = e.hp < e.maxhp * .5;
    if (enr && !e.enraged) {
      e.enraged = true; e.st = 'roar'; e.t = 0; e.vx = 0; B.sfx('roar'); addShake(.6); ring(e.x, 60, 240, '#ff5a5a', .6, 10);
      banner = { t: 0, a: 'G\'AZAB!', b: '', life: 1.4, red: true }; spawnEnemy('ninja', -1); spawnEnemy('ninja', 1); e.col = '#5a0f1a';
    }
    switch (e.st) {
      case 'walk':
        e.face = dir; e.vx = ad > 125 ? dir * e.spd * (enr ? 1.3 : 1) : 0;
        if (e.cd <= 0 && !h.dead) {
          if (ad < 195) { e.st = 'combo'; e.cn = 0; e.t = 0; e.vx = 0; e.hit = false; }
          else if (ad > 230 && Math.random() < .65) { e.st = 'iai'; e.t = 0; e.vx = 0; e.face = dir; B.sfx('warn'); }
          else e.cd = .3;
        }
        break;
      case 'combo':
        e.vx *= Math.pow(.02, dt);
        if (!e.hit && e.t >= .2) {
          e.hit = true; e.vx = e.face * 250; B.sfx('swing'); star(e.x + e.face * 90, 90, false, '#ffd0d0');
          const mid = e.x + e.face * 70; if (Math.abs(h.x - mid) < 95 && h.z < 140) hurtHero(e.dmg, e.face, { kb: 260 });
        }
        if (e.t >= .46) { e.cn++; if (e.cn >= (enr ? 4 : 3)) { e.st = 'rec'; e.t = 0; e.rdur = enr ? .75 : 1.0; } else { e.t = 0; e.hit = false; e.face = dir; } }
        break;
      case 'iai':
        e.vx = 0; e.face = dir;
        if (e.t >= (enr ? .55 : .8)) { e.st = 'dash'; e.t = 0; e.vx = e.face * 980; e.hit = false; B.sfx('swing'); }
        break;
      case 'dash':
        e.vx = e.face * 980;
        if (Math.random() < .8) fx.push({ k: 'dust', x: e.x - e.face * 30, z: 4, vx: -e.face * 80, vz: 40, r: 9, t: 0, life: .4 });
        if (!e.hit && Math.abs(h.x - e.x) < 70 && h.z < 140) { e.hit = true; hurtHero(e.dmg * 1.4, e.face, { kb: 380, up: 260 }); star(h.x, h.z + 80, true, '#ffd0d0'); }
        if (e.t > .42 || e.x < cam + 78 || e.x > cam + B.VW - 78) { e.st = 'rec'; e.t = 0; e.rdur = enr ? .85 : 1.15; e.vx = 0; ring(e.x, 30, 90, '#ffd0d0', .3, 5); }
        break;
      case 'rec': e.vx = 0; if (e.t > e.rdur) { e.st = 'walk'; e.cd = enr ? .5 : 1.0; } break;
      case 'roar': e.vx = 0; if (e.t > 1.0) { e.st = 'walk'; e.cd = .6; } break;
      case 'dead': e.vx *= Math.pow(.05, dt); if (e.t > 1.3) e.gone = true; break;
    }
    e.x += e.vx * dt; e.z = Math.max(0, e.z + e.vz * dt);
    if (e.st === 'dead') { e.pk = 'down'; e.rot = -1.5 * e.face * Math.min(1, e.t * 3); }
    else if (e.st === 'combo') { e.pk = ['s1', 's2', 's3'][e.cn % 3]; e.pu = clamp(e.t / .46, 0, 1); }
    else if (e.st === 'iai') { e.pk = 't'; e.pu = clamp(e.t / .8, 0, 1) * .3; }
    else if (e.st === 'dash') { e.pk = 't'; e.pu = .56; }
    else if (e.st === 'rec') { e.pk = 's1'; e.pu = .7 + clamp(e.t / (e.rdur || 1), 0, 1) * .3; }
    else if (e.st === 'roar') e.pk = 'panic';
    else if (Math.abs(e.vx) > 20) { e.pk = 'run'; e.ph += dt * Math.abs(e.vx) / 18; } else e.pk = 'idle';
  }

  // ---- Temir robot ----
  function mechAI(e, dt, T) {
    const h = hero, dx = h.x - e.x, ad = Math.abs(dx), dir = dx >= 0 ? 1 : -1, ph2 = e.hp < e.maxhp * .5;
    e.armUp = e.armUp || 0; e.recoil = Math.max(0, (e.recoil || 0) - dt * 5); e.glow = 0;
    switch (e.st) {
      case 'walk': e.face = dir; e.vx = (ad > 300 || !e.entered) ? dir * e.spd * (ph2 ? 1.3 : 1) : 0; e.ph += dt * Math.abs(e.vx) / 9; e.armUp *= .9;
        if (e.cd <= 0 && !h.dead) { const r = Math.random(); if (ad < 210) { e.st = 'wind'; e.atk = 'stomp'; e.wdur = .75; } else if (ph2 && r < .4) { e.st = 'wind'; e.atk = 'missile'; e.wdur = .7; } else { e.st = 'wind'; e.atk = 'cannon'; e.wdur = .85; e.shots = ph2 ? 3 : 2; e.sh = 0; } e.t = 0; e.vx = 0; B.sfx('warn'); }
        break;
      case 'wind': e.vx = 0; e.face = dir; if (e.atk === 'stomp') e.armUp = -.5 * Math.min(1, e.t / e.wdur); else e.glow = Math.min(1, e.t / e.wdur) * (e.atk === 'cannon' ? .9 : .4); e.armUp = e.atk === 'stomp' ? e.armUp : -.15;
        if (e.t >= e.wdur) {
          if (e.atk === 'stomp') { e.st = 'rec'; e.t = 0; e.rdur = .7; const x = e.x; ring(x, 6, 120, '#fff', .4, 8); addShake(.6); B.sfx('heavy'); ep.push({ k: 'shock', x: x + 40, z: 0, vx: 430, vz: 0, r: 26, dmg: e.dmg * 1.1, life: 1.6 }); ep.push({ k: 'shock', x: x - 40, z: 0, vx: -430, vz: 0, r: 26, dmg: e.dmg * 1.1, life: 1.6 }); e.armUp = 0; }
          else if (e.atk === 'missile') { e.st = 'rec'; e.t = 0; e.rdur = 1.2; for (let i = 0; i < 3; i++) later(i * .3, () => { const x = hero.x + rnd(-190, 190); ep.push({ k: 'missile', x, z: 560, vx: 0, vz: -950, r: 14, dmg: e.dmg * .9, life: 3, warn: .9 + i * .1, t0: 0 }); }); B.sfx('shot'); }
          else { e.st = 'fire'; e.t = 0; e.sh = 0; }
        }
        break;
      case 'fire': e.vx = 0; e.glow = .7; if (e.t >= e.sh * .32) { e.sh++; e.recoil = 1; B.sfx('shot'); ep.push({ k: 'cannon', x: e.x + e.face * 130, z: 76, vx: e.face * 570, vz: 0, r: 17, dmg: e.dmg, life: 2 }); sparks(e.x + e.face * 134, 76, 6, '#ffd166'); addShake(.2); }
        if (e.sh >= e.shots) { e.st = 'rec'; e.t = 0; e.rdur = .8; } break;
      case 'rec': e.vx = 0; if (e.t > e.rdur) { e.st = 'walk'; e.cd = ph2 ? .6 : 1.1; } break;
      case 'stagger': e.vx = 0; e.armUp = Math.sin(e.t * 30) * .15; if (Math.random() < .3) sparks(e.x, 100 + rnd(0, 80), 2, '#9ecbff'); if (e.t > .8) { e.st = 'walk'; e.cd = .5; } break;
      case 'dead': e.vx = 0; e.dyn = (e.dyn || 0) + dt; if (e.dyn > .14) { e.dyn = 0; boom(e.x + rnd(-50, 50), rnd(20, 170), 60, 0, 0); smoke(e.x, 100, 3, true); } if (e.t > 1.5) { boom(e.x, 90, 170, 0, 0); e.gone = true; e.boom = true; } break;
    }
    e.x += e.vx * dt;
    e.pk = 'mech';
  }

  // ---- Jang vertolyoti ----
  function heliAI(e, dt, T) {
    const h = hero; e.mt += dt; e.muzzle = false; e.tilt = clamp(e.vx / 300, -1, 1);
    if (!e.side) e.side = Math.sign(e.x - h.x) || 1;
    const ph2 = e.hp < e.maxhp * .5;
    const place = d => { const bd = band(), lo = bd[0] + 30, hi = bd[1] - 30; let tx = h.x + e.side * d; if (tx < lo || tx > hi) { e.side = -e.side; tx = h.x + e.side * d; } return clamp(tx, lo, hi); };
    const goto = (tx, tz, sp) => { e.vx = clamp((tx - e.x) * 2.2, -sp, sp); e.vz = clamp((tz - e.z) * 3, -260, 260); };
    const next = () => { const r = Math.random(); e.mode = r < .34 ? 'bomb' : r < .62 ? 'strafe' : 'swoop'; e.mt = 0; e.dir = Math.random() < .5 ? -1 : 1; e.drop = 0; e.sh = 0; e.init = true; if (e.mode === 'swoop') B.sfx('warn'); };
    switch (e.mode) {
      case 'enter': goto(place(260), 115, 420); if (e.mt > 1.6) { e.mode = 'hover'; e.mt = 0; } break;
      case 'hover': goto(place(230), 110 + Math.sin(time * 2) * 10, 260); e.face = h.x >= e.x ? 1 : -1; if (e.mt > (ph2 ? 1.1 : 1.8)) next(); break;
      case 'bomb': { const tx = e.dir > 0 ? cam + B.VW + 100 : cam - 100, sx = e.dir > 0 ? cam - 100 : cam + B.VW + 100;
        if (e.init) { e.x = sx; e.init = false; } e.face = e.dir; goto(tx, 210, 560); e.vx = e.dir * (ph2 ? 520 : 440); e.vz = clamp((210 - e.z) * 3, -200, 200);
        e.drop -= dt; if (e.drop <= 0 && e.x > cam - 40 && e.x < cam + B.VW + 40) { e.drop = ph2 ? .26 : .36; ep.push({ k: 'bomb', x: e.x, z: e.z, vx: e.vx * .7, vz: -40, r: 14, dmg: e.dmg * 3.2, life: 4, g: 1300 }); B.sfx('bolt'); }
        if ((e.dir > 0 && e.x > cam + B.VW + 90) || (e.dir < 0 && e.x < cam - 90)) { e.mode = 'enter'; e.mt = 0; } break; }
      case 'strafe': { const sx = e.dir > 0 ? cam - 60 : cam + B.VW + 60, tx = e.dir > 0 ? cam + B.VW + 80 : cam - 80;
        if (e.init) { e.x = sx; e.init = false; } e.face = e.dir; e.vx = e.dir * 330; e.vz = clamp((150 - e.z) * 3, -200, 200); e.drop -= dt;
        if (e.drop <= 0 && e.x > cam - 20 && e.x < cam + B.VW + 20) { e.drop = ph2 ? .09 : .13; e.muzzle = true; const ax = h.x + rnd(-70, 70), bx0 = e.x + e.face * 80, bz0 = e.z + 40, ddx = ax - bx0, ddz = 30 - bz0, dl = Math.hypot(ddx, ddz) || 1; ep.push({ k: 'bullet', x: bx0, z: bz0, vx: ddx / dl * 720, vz: ddz / dl * 720, r: 7, dmg: e.dmg, life: 1.4 }); B.sfx('bolt'); }
        if ((e.dir > 0 && e.x > cam + B.VW + 70) || (e.dir < 0 && e.x < cam - 70)) { e.mode = 'enter'; e.mt = 0; } break; }
      case 'swoop': e.face = h.x >= e.x ? 1 : -1; const sx0 = clamp(h.x - e.face * 280, cam + 110, cam + B.VW - 110); if (e.mt < 1.2) { goto(sx0, 44, 380); } else if (e.mt < 4.6) { goto(sx0 + Math.sin(e.mt * 2) * 40, 52, 120); e.drop -= dt; if (e.drop <= 0 && e.mt > 1.6) { e.drop = ph2 ? .1 : .15; e.muzzle = true; ep.push({ k: 'bullet', x: e.x + e.face * 84, z: e.z + 38, vx: e.face * 760, vz: rnd(-30, 30), r: 7, dmg: e.dmg, life: 1.2 }); B.sfx('bolt'); } } else { e.mode = 'enter'; e.mt = 0; } break;
      case 'dead': e.vz -= 900 * dt; e.tilt = 1.2 + e.t * 2; e.vx *= .99; if (Math.random() < .5) smoke(e.x, e.z + 30, 1, true); if (e.z <= 0) { e.z = 0; boom(e.x, 20, 180, 0, 0); e.gone = true; } break;
    }
    e.x += e.vx * dt; e.z += e.vz * dt; if (e.mode !== 'dead' && e.st !== 'dead') e.z = clamp(e.z, 30, 260);
    if (e.st === 'dead') { e.mode = 'dead'; e.hz = 60; }
    e.pk = 'heli';
  }

  // ---------- Kichik rejalashtiruvchi ----------
  let sch = [];
  function later(t, fn) { sch.push({ t, fn }); }

  // ---------- Jang to'lqinlari ----------
  function startEnc(def) {
    enc = { def, wi: 0, q: [], sp: 0, gap: .55, left: 0 };
    camLock = clamp(hero.x - B.VW * .5, cam, L.len - B.VW); goT = 0;
    if (def.boss) { /* boss intro will show on spawn */ } else banner = { t: 0, a: 'DUSHMAN!', b: '', life: 1, small: true };
    nextWave();
  }
  function nextWave() {
    const w = enc.def.w[enc.wi]; enc.q = w.slice(); enc.sp = .2; enc.wave = enc.wi + 1;
    if (enc.def.w.length > 1 && enc.wi > 0) banner = { t: 0, a: enc.wi + 1 + '-TO\'LQIN', b: '', life: 1.2, small: true };
  }
  function startEndlessWave() {
    ewave++; const n = ewave, pool = ['grunt', 'grunt', 'runner']; if (n >= 2) pool.push('archer'); if (n >= 3) pool.push('bomber'); if (n >= 4) pool.push('brute', 'runner'); if (n >= 6) pool.push('shield'); if (n >= 7) pool.push('bomber', 'brute'); if (n >= 8) pool.push('ninja', 'ninja', 'shield');
    const cnt = Math.min(11, 3 + Math.floor(n * 1.15)); const list = []; for (let i = 0; i < cnt; i++) list.push(B.pick(pool));
    if (n % 5 === 0) { list.length = Math.min(list.length, 4); list.unshift(['ogre', 'mech', 'heli', 'samurai'][(n / 5 - 1) % 4]); }
    enc = { def: { w: [list] }, wi: 0, q: list, sp: .6, gap: Math.max(.35, .8 - n * .03), left: 0, endless: true };
    banner = { t: 0, a: n + '-TO\'LQIN', b: n % 5 === 0 ? 'BOSS keldi!' : '', life: 1.6 };
    if (n > 1 && n % 3 === 0) { item('gem', hero.x + rnd(-80, 80), 80); }
  }
  function encUpdate(dt) {
    if (endless) {
      if (!enc) return;
      if (enc.q.length) { enc.sp -= dt; if (enc.sp <= 0) { const t = enc.q.shift(); spawnEnemy(t); enc.sp = enc.gap; } }
      else if (en.length === 0) { enc.rest = (enc.rest || 0) + dt; if (enc.rest > 1.6) { h2heal(.15); startEndlessWave(); } }
      return;
    }
    if (!enc) {
      if (encIdx < L.encs.length) { if (hero.x >= L.encs[encIdx].x && !hero.dead) startEnc(L.encs[encIdx++]); }
      return;
    }
    if (enc.q.length) { enc.sp -= dt; if (enc.sp <= 0) { spawnEnemy(enc.q.shift()); enc.sp = enc.gap; } return; }
    if (en.length === 0) {
      enc.rest = (enc.rest || 0) + dt;
      if (enc.rest > (enc.def.boss ? 1.4 : .5)) {
        enc.rest = 0; enc.wi++;
        if (enc.wi < enc.def.w.length) { nextWave(); h2heal(.1); }
        else {
          const last = encIdx >= L.encs.length; enc = null; camLock = null; h2heal(.12);
          if (last) { winLevel(); } else { goT = 4; banner = { t: 0, a: 'YAXSHI!', b: '', life: 1, small: true }; }
        }
      }
    }
  }
  function h2heal(p) { if (hero.dead) return; const a = Math.round(hero.maxhp * p); hero.hp = Math.min(hero.maxhp, hero.hp + a); addTx(hero.x, GY - 160, '+' + a, '#6cff9a', 0); }

  // ---------- G'alaba ----------
  function winLevel() {
    if (G.mode !== 'play') return; G.mode = 'won'; endT = 0; slow = .4; slowT = 1.2; B.sfx('win');
    const s = B.S0, st = 1 + (time < L.par ? 1 : 0) + (hero.hp >= hero.maxhp * .5 ? 1 : 0);
    const bonus = 60 + 40 * li, gem = 1 + st; s.coins += bonus; s.gems += gem; earnedC += bonus; earnedG += gem;
    if (!s.stars[li] || s.stars[li] < st) s.stars[li] = st; s.unl = Math.max(s.unl, Math.min(LV.length, li + 2)); B.persist();
    G.result = { win: true, li, stars: st, coins: earnedC, gems: earnedG, time, kills, maxCombo, score, bonus, par: L.par };
  }

  // ---------- Asosiy yangilash ----------
  function update(dtR) {
    if (hitstop > 0) { hitstop -= dtR; return; }
    if (slowT > 0) { slowT -= dtR; if (slowT <= 0) slow = 1; }
    const dt = dtR * slow;
    if (G.mode === 'play') time += dt;
    // rejalashtirilgan ishlar
    for (let i = sch.length - 1; i >= 0; i--) { sch[i].t -= dt; if (sch[i].t <= 0) { const f = sch[i].fn; sch.splice(i, 1); f(); } }
    heroUpdate(dt);
    atkers = 0; en.forEach(e => { if (e.st === 'wind' || e.st === 'strike') atkers++; });
    en.forEach(e => enemyUpdate(e, dt));
    en.forEach(e => { if (e.boss && e.type !== 'heli' && !e.dead) { const bd = band(), lo = bd[0], hi = bd[1]; if (e.x > lo && e.x < hi) e.entered = true; if (e.entered) e.x = clamp(e.x, lo, hi); } });
    // dushmanlarni itarish
    for (let i = 0; i < en.length; i++) {
      const a = en[i]; if (a.dead || a.boss || a.z > 20) continue;
      for (let j = i + 1; j < en.length; j++) { const b = en[j]; if (b.dead || b.boss || b.z > 20) continue; const d = b.x - a.x, m = 34; if (Math.abs(d) < m) { const p = (m - Math.abs(d)) * .5 * (d >= 0 ? 1 : -1); a.x -= p; b.x += p; } }
      if (!hero.dead && Math.abs(a.x - hero.x) < 22 && hero.z < 30) a.x += (a.x >= hero.x ? 1 : -1) * 70 * dt;
    }
    for (let i = en.length - 1; i >= 0; i--) { const e = en[i]; if (e.gone) { if (e.dead && e.type !== 'bomber' && e.type !== 'mech' && e.type !== 'heli' && e.type !== 'ogre') burst(e); if (e.dead && e.type === 'ogre') { burst(e); boom(e.x, 40, 120, 0, 0); } if (e === bossRef) bossRef = null; en.splice(i, 1); } }
    updProj(dt); updItems(dt); updFx(dt); updCrates(dt);
    encUpdate(dt);
    // kamera
    const lockT = camLock != null ? camLock : clamp(hero.x - B.VW * .45 + hero.face * 50, 0, Math.max(0, L.len - B.VW));
    cam += (lockT - cam) * (1 - Math.exp(-dt * (camLock != null ? 5 : 7)));
    cam = clamp(cam, 0, Math.max(0, L.len - B.VW));
    shake = Math.max(0, shake - dtR * 1.8); flashA = Math.max(0, flashA - dtR * 1.8);
    comboT -= dt; if (comboT <= 0) combo = 0;
    if (goT > 0) goT -= dt; if (banner) { banner.t += dtR; if (banner.t > banner.life) banner = null; }
    hintT += dt;
    for (let i = trail.length - 1; i >= 0; i--) { trail[i].a -= dt * 5.5; if (trail[i].a <= 0) trail.splice(i, 1); }
    // tugash
    if (G.mode === 'dying') { endT += dtR; if (endT > 1.7 && !G.ended) { G.ended = true; endT = 0; B.persist(); finishLose(); } }
    if (G.mode === 'won') { endT += dtR; if (endT > 1.9 && !G.ended) { G.ended = true; B.onWin && B.onWin(G.result); } }
  }
  function finishLose() {
    const best = B.S0.best; let rec = false;
    if (endless) { if (ewave > (best.endless || 0)) { best.endless = ewave; rec = true; } B.persist(); }
    G.result = { win: false, li, endless, wave: ewave, coins: earnedC, gems: earnedG, time, kills, maxCombo, score, rec, canRevive: B.S0.gems >= 3 };
    B.onLose && B.onLose(G.result);
  }

  // ---------- Proyektillar ----------
  function updProj(dt) {
    for (let i = pr.length - 1; i >= 0; i--) {
      const p = pr[i]; p.x += p.vx * dt; p.life -= dt;
      const hh = 105 * (p.size || 1);
      en.forEach(e => { if (!e.dead && !p.hits.has(e) && Math.abs(e.x - p.x) < e.hw + 34 * (p.size || 1) && zov(p.z - hh, p.z + hh, e.z, e.z + e.hz)) { p.hits.add(e); hitEnemy(e, p.dmg, p.dir, { kb: 240, heavy: true, down: !e.boss, mp: 1 }); if (p.burn && !e.dead) { e.burn = 3; e.burnD = p.dmg * .08; } } });
      crates.forEach(cr => { if (cr.hp > 0 && Math.abs(cr.x - p.x) < 40) breakCrate(cr); });
      if (Math.random() < .6) fx.push({ k: 'spark', x: p.x - p.dir * 20, z: p.z + rnd(-70, 70), vx: -p.dir * 80, vz: rnd(-40, 40), t: 0, life: .25, col: p.col });
      if (p.life <= 0) pr.splice(i, 1);
    }
    for (let i = ep.length - 1; i >= 0; i--) {
      const p = ep[i]; p.life -= dt; p.t0 = (p.t0 || 0) + dt;
      if (p.k === 'missile') { if (p.t0 < p.warn) { continue; } p.z += p.vz * dt; if (p.z <= 0) { boom(p.x, 0, 90, p.dmg, 1); ep.splice(i, 1); } else if (p.life <= 0) ep.splice(i, 1); continue; }
      if (p.g) p.vz -= p.g * dt;
      p.x += p.vx * dt; p.z += p.vz * dt;
      if (p.k === 'bomb') { if (p.z <= 0) { boom(p.x, 0, 100, p.dmg, 1); ep.splice(i, 1); continue; } }
      else if (p.k === 'shock') { if (Math.random() < .6) fx.push({ k: 'dust', x: p.x, z: 4, vx: 0, vz: rnd(20, 80), r: rnd(6, 12), t: 0, life: .4 }); if (Math.abs(hero.x - p.x) < p.r + 20 && hero.z < 46) { if (hurtHero(p.dmg, p.vx > 0 ? 1 : -1, { kb: 300, up: 240 })) { ep.splice(i, 1); continue; } } }
      else if (p.k === 'cannon' || p.k === 'knife' || p.k === 'bullet') {
        if (p.z < 0) { sparks(p.x, 0, 4); ep.splice(i, 1); continue; }
        if (Math.abs(hero.x - p.x) < p.r + 18 && p.z + p.r > hero.z && p.z - p.r < hero.z + 120 && !hero.dead) { if (hurtHero(p.dmg, p.vx > 0 ? 1 : -1, { kb: p.k === 'cannon' ? 320 : 180, stun: p.k !== 'bullet' || Math.random() < .3 })) { sparks(p.x, p.z, 6, '#ffb703'); if (p.k === 'cannon') boom(p.x, p.z, 50, 0, 0); ep.splice(i, 1); continue; } }
        if (p.k === 'cannon' && Math.random() < .7) fx.push({ k: 'fire', x: p.x - Math.sign(p.vx) * 14, z: p.z, vx: 0, vz: rnd(-20, 20), r: rnd(6, 12), t: 0, life: .22 });
      }
      if (p.life <= 0 || p.x < cam - 200 || p.x > cam + B.VW + 200) ep.splice(i, 1);
    }
  }
  function updCrates(dt) { crates.forEach(cr => { if (cr.sh > 0) cr.sh -= dt; }); }

  // ---------- Buyumlar ----------
  function updItems(dt) {
    const h = hero, s = B.S0;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i]; it.t += dt; it.life -= dt;
      if (it.z > 0 || it.vz > 0) { it.vz -= 1700 * dt; it.z += it.vz * dt; it.x += it.vx * dt; if (it.z <= 0) { it.z = 0; it.vz = Math.abs(it.vz) > 200 ? -it.vz * .38 : 0; it.vx *= .5; } }
      const dx = h.x - it.x, ad = Math.abs(dx);
      if ((it.k === 'coin' || it.k === 'gem') && it.t > .45 && ad < 190 && !h.dead) { it.x += Math.sign(dx) * Math.min(ad, (200 + (190 - ad) * 4) * dt); it.z = Math.max(0, it.z + (30 - it.z) * dt * 4); it.vz = 0; }
      if (ad < 40 && it.z < 90 && h.z < 100 && !h.dead && it.t > .25) {
        let ok = true;
        switch (it.k) {
          case 'coin': { const v = Math.max(1, Math.round(it.v * HM.coin)); s.coins += v; earnedC += v; B.sfx('coin'); break; }
          case 'gem': s.gems++; earnedG++; B.sfx('gem'); addTx(h.x, GY - 170, '+1 OLMOS', '#7fe3ff', 1); break;
          case 'hp': if (h.hp >= h.maxhp) ok = false; else { const a = Math.round(h.maxhp * .3); h.hp = Math.min(h.maxhp, h.hp + a); addTx(h.x, GY - 160, '+' + a, '#6cff9a', 0); B.sfx('pick'); } break;
          case 'mp': h.mp = Math.min(h.maxmp, h.mp + 45); addTx(h.x, GY - 160, '+ENERGIYA', '#7fb8ff', 0); B.sfx('pick'); break;
          case 'pot': if (s.pot >= 9) ok = false; else { s.pot++; addTx(h.x, GY - 160, '+ DORI', '#e08bff', 0); B.sfx('pick'); } break;
          case 'wep': h.wep = it.wk; h.wtmp = 20; addTx(h.x, GY - 170, W[it.wk].n.toUpperCase() + '!', '#ffd23f', 1, 1.1); B.sfx('pick'); ring(h.x, 60, 110, W[it.wk].col, .45, 6); break;
        }
        if (ok) { items.splice(i, 1); continue; }
      }
      if (it.life <= 0) items.splice(i, 1);
    }
  }

  // ---------- Zarralar ----------
  function updFx(dt) {
    for (let i = fx.length - 1; i >= 0; i--) {
      const p = fx[i]; p.t += dt;
      switch (p.k) {
        case 'blood': p.vz -= 1500 * dt; p.x += p.vx * dt; p.z += p.vz * dt; if (p.z <= 0) { if (B.S0.set.blood && Math.random() < .5 && stains.length < 90) stains.push({ x: p.x, y: GY + rnd(4, 58), r: p.r * rnd(1.2, 2.4), a: .75 }); fx.splice(i, 1); continue; } break;
        case 'spark': p.vz -= 900 * dt; p.x += p.vx * dt; p.z += p.vz * dt; break;
        case 'smoke': p.x += p.vx * dt; p.z += p.vz * dt; p.vz *= .97; break;
        case 'fire': p.x += p.vx * dt; p.z += p.vz * dt; p.vx *= .93; p.vz *= .93; break;
        case 'dust': p.x += p.vx * dt; p.z += p.vz * dt; p.vz *= .92; break;
        case 'seg': p.vy += 1500 * dt; p.x1 += p.vx * dt; p.x2 += p.vx * dt; p.y1 += p.vy * dt; p.y2 += p.vy * dt; p.rot += p.vr * dt; if (p.y1 > GY + 6 && p.y2 > GY + 6) { p.vy *= -.25; p.vx *= .5; p.y1 -= 4; p.y2 -= 4; p.vr *= .5; } break;
        case 'head': p.vy += 1500 * dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.y > GY - p.r * .5) { p.y = GY - p.r * .5; p.vy *= -.3; p.vx *= .6; } break;
      }
      if (p.t >= p.life) fx.splice(i, 1);
    }
    for (let i = tx.length - 1; i >= 0; i--) { tx[i].t += dt; if (tx[i].t >= tx[i].life) tx.splice(i, 1); }
    for (let i = stains.length - 1; i >= 0; i--) { stains[i].a -= dt * .01; if (stains[i].a <= 0) stains.splice(i, 1); }
  }

  // ======================= CHIZISH =======================
  function drawEnt(e, t) {
    const P = e.type === 'hero' || e.pk !== 'mech' && e.pk !== 'heli' ? B.poseOf(e) : null;
    const o = { flash: e.flash > 0 };
    if (e.type === 'hero' && e.inv > 0 && !hero.dead && e.st !== 'skill' && Math.floor(t * 20) % 2) o.alpha = .45;
    if (e.alpha != null && e.alpha < 1) o.alpha = Math.max(0, e.alpha);
    if (e.type === 'samurai' && e.st === 'iai') {
      const a = .14 + .16 * Math.abs(Math.sin(t * 22)), x0 = e.face > 0 ? e.x : e.x - 760;
      c.save(); c.fillStyle = 'rgba(255,40,40,' + a + ')'; c.fillRect(x0, GY - 140, 760, 146); c.restore();
      B.comic(c, '!', e.x, GY - 270 - Math.sin(t * 20) * 4, 34, '#ff4d4d', '#2a0000');
    }
    e.t0 = e.t0 || 0;
    if (e.pk === 'mech') { B.drawMech(c, e, t, e.flash > 0); return; }
    if (e.pk === 'heli') { B.drawHeli(c, e, t, e.flash > 0); return; }
    if (e.type === 'hero' && !e.dead && e.hd) B.aura(c, e.hd, e.x, GY - e.z - 56 * e.sc, t, e.sc / 1.3, e.st === 'skill' ? 1.25 : .8);
    const was = e.t; e.t = t; // ko'rinish soati
    B.drawFig(c, e, P, o); e.t = was;
  }
  function drawTrail() {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i]; if (b.brk) continue;
      c.globalAlpha = Math.max(0, b.a) * .75; c.fillStyle = b.col;
      c.beginPath(); c.moveTo(a.x1, a.y1); c.lineTo(a.x2, a.y2); c.lineTo(b.x2, b.y2); c.lineTo(b.x1, b.y1); c.closePath(); c.fill();
      c.globalAlpha = Math.max(0, b.a) * .5; c.strokeStyle = hero && hero.hd ? hero.hd.col : b.col; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(a.x2, a.y2); c.lineTo(b.x2, b.y2); c.stroke();
      c.globalAlpha = Math.max(0, b.a) * .95; c.strokeStyle = '#fff'; c.lineWidth = 3.4; c.beginPath(); c.moveTo(a.x2, a.y2); c.lineTo(b.x2, b.y2); c.stroke();
    }
    c.restore();
  }
  function drawProj(t) {
    pr.forEach(p => {
      c.save(); c.translate(p.x, GY - p.z); c.scale(p.dir * (p.size || 1), p.size || 1);
      c.globalCompositeOperation = 'lighter';
      c.beginPath(); c.arc(-30, 0, 100, -1.0, 1.0); c.arc(-62, 0, 92, 1.0, -1.0, true); c.closePath();
      c.fillStyle = p.col; c.globalAlpha = .75; c.fill();
      c.beginPath(); c.arc(-30, 0, 100, -.8, .8); c.arc(-48, 0, 94, .8, -.8, true); c.closePath(); c.fillStyle = '#fff'; c.globalAlpha = .95; c.fill();
      c.restore();
    });
    ep.forEach(p => {
      c.save(); c.translate(p.x, GY - p.z);
      if (p.k === 'knife') { c.rotate(p.vx < 0 ? Math.PI : 0); c.scale(1.2, 1.2); B.weaponDraw(c, 'knife', 28); }
      else if (p.k === 'cannon') { const g = c.createRadialGradient(0, 0, 2, 0, 0, 22); g.addColorStop(0, '#fff'); g.addColorStop(.4, '#ffd166'); g.addColorStop(1, 'rgba(255,90,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 22, 0, TAU); c.fill(); }
      else if (p.k === 'bullet') { c.rotate(Math.atan2(-p.vz, p.vx)); c.fillStyle = '#ffec99'; c.fillRect(-12, -2, 24, 4); c.fillStyle = '#fff'; c.fillRect(-4, -1, 10, 2); }
      else if (p.k === 'bomb') { c.rotate(t * 3); c.fillStyle = '#15151c'; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.fill(); c.fillStyle = '#d62839'; c.fillRect(-13, -3, 26, 6); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-4, -5, 4, 0, TAU); c.fill(); }
      else if (p.k === 'shock') { c.fillStyle = 'rgba(255,240,200,.85)'; const d = Math.sign(p.vx); c.beginPath(); c.moveTo(-d * 40, 0); c.lineTo(d * 6, -46); c.lineTo(d * 26, 0); c.closePath(); c.fill(); c.strokeStyle = '#7a5a30'; c.lineWidth = 2.5; c.stroke(); }
      else if (p.k === 'missile') {
        if (p.t0 < p.warn) { c.restore(); c.save(); c.translate(p.x, GY + 6); const a = .4 + .4 * Math.sin(t * 24); c.strokeStyle = 'rgba(255,60,60,' + a + ')'; c.lineWidth = 4; c.beginPath(); c.ellipse(0, 0, 70, 12, 0, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,60,60,' + a * .35 + ')'; c.fill(); c.restore(); return; }
        c.rotate(Math.PI / 2); c.fillStyle = '#dfe6ee'; c.beginPath(); c.moveTo(24, 0); c.lineTo(-14, -8); c.lineTo(-14, 8); c.closePath(); c.fill(); c.strokeStyle = '#111'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#e63946'; c.fillRect(-14, -8, 8, 16); c.fillStyle = '#ffb703'; c.beginPath(); c.moveTo(-14, -5); c.lineTo(-34 - Math.random() * 10, 0); c.lineTo(-14, 5); c.fill();
      }
      c.restore();
    });
  }
  function drawFx(t) {
    fx.forEach(p => {
      const a = 1 - p.t / p.life;
      switch (p.k) {
        case 'blood': c.fillStyle = p.col; c.beginPath(); c.arc(p.x, GY - p.z, p.r, 0, TAU); c.fill(); break;
        case 'spark': c.strokeStyle = p.col; c.lineWidth = 2.4; c.globalAlpha = a; c.beginPath(); c.moveTo(p.x, GY - p.z); c.lineTo(p.x - p.vx * .035, GY - p.z + p.vz * .035); c.stroke(); c.globalAlpha = 1; break;
        case 'smoke': c.globalAlpha = a * .45; c.fillStyle = '#3b3b45'; c.beginPath(); c.arc(p.x, GY - p.z, p.r * (1 + p.t * 1.4), 0, TAU); c.fill(); c.globalAlpha = 1; break;
        case 'fire': c.globalAlpha = a; c.fillStyle = a > .5 ? '#fff3b0' : a > .25 ? '#ffb703' : '#e85d04'; c.beginPath(); c.arc(p.x, GY - p.z, p.r * (.5 + a), 0, TAU); c.fill(); c.globalAlpha = 1; break;
        case 'dust': c.globalAlpha = a * .5; c.fillStyle = '#d8cdb8'; c.beginPath(); c.arc(p.x, GY - p.z, p.r * (1 + p.t * 2), 0, TAU); c.fill(); c.globalAlpha = 1; break;
        case 'ring': { const r = p.r * Math.min(1, p.t / p.life * 1.4 + .1); c.globalAlpha = a; c.strokeStyle = p.col; c.lineWidth = p.w * a + 1; c.beginPath(); c.ellipse(p.x, GY - p.z, r, r * (p.z > 20 ? 1 : .32), 0, 0, TAU); c.stroke(); c.globalAlpha = 1; break; }
        case 'star': { const r = p.r * (.6 + (1 - a) * .7); c.save(); c.translate(p.x, GY - p.z); c.rotate(p.rot); c.globalAlpha = Math.min(1, a * 1.6); c.fillStyle = p.col; c.strokeStyle = '#ff9f1c'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 16; i++) { const rr = i % 2 ? r * .42 : r; const an = i / 16 * TAU; c.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } c.closePath(); c.fill(); c.stroke(); c.restore(); c.globalAlpha = 1; break; }
        case 'web': B.drawWeb(c, p.x, GY - p.z, p.t / p.life, p.col, p.seed); break;
        case 'seg': c.globalAlpha = Math.min(1, a * 2); c.lineCap = 'round'; { const mx = (p.x1 + p.x2) / 2, my = (p.y1 + p.y2) / 2; c.save(); c.translate(mx, my); c.rotate(p.rot); c.strokeStyle = p.rim || 'rgba(8,8,16,.9)'; c.lineWidth = p.w + 3; c.beginPath(); c.moveTo(p.x1 - mx, p.y1 - my); c.lineTo(p.x2 - mx, p.y2 - my); c.stroke(); c.strokeStyle = p.col; c.lineWidth = p.w; c.stroke(); c.restore(); } c.globalAlpha = 1; break;
        case 'head': c.globalAlpha = Math.min(1, a * 2); c.fillStyle = p.col; c.strokeStyle = p.rim || 'rgba(8,8,16,.9)'; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); c.stroke(); c.globalAlpha = 1; break;
      }
    });
  }
  function drawTx() {
    tx.forEach(p => {
      const a = 1 - p.t / p.life, k = p.t / p.life;
      if (p.k === 'd') { B.comic(c, String(p.s), p.x, p.y - p.t * 60, (p.big ? 30 : 22) * (1 + Math.max(0, .5 - p.t * 4)), p.col, '#1a0f00'); }
      else { const sc = 1 + Math.max(0, .4 - p.t * 3); c.globalAlpha = Math.min(1, a * 2); B.comic(c, p.s, p.x, p.y - p.t * 40, 40 * sc, p.col, '#b3001b', p.rot); c.globalAlpha = 1; }
    });
  }
  function drawCrate(cr) {
    if (cr.hp <= 0) return; const x = cr.x + (cr.sh > 0 ? rnd(-2, 2) : 0);
    B.shadow(c, x, 0, 30, .3);
    c.save(); c.translate(x, GY);
    if (cr.k === 'crate') {
      c.fillStyle = '#c58b4e'; c.fillRect(-28, -56, 56, 56); c.strokeStyle = '#4a2c12'; c.lineWidth = 3.5; c.strokeRect(-28, -56, 56, 56);
      c.fillStyle = '#a06b36'; c.fillRect(-28, -56, 56, 9); c.fillRect(-28, -9, 56, 9); c.strokeStyle = '#6b4423'; c.lineWidth = 6; c.beginPath(); c.moveTo(-24, -52); c.lineTo(24, -4); c.moveTo(24, -52); c.lineTo(-24, -4); c.stroke();
      c.fillStyle = '#d0d6dc'; [[-28, -56], [20, -56], [-28, -12], [20, -12]].forEach(p => c.fillRect(p[0], p[1], 8, 8));
    } else {
      c.fillStyle = lgB(); rrect(-24, -60, 48, 60, 8); c.fill(); c.strokeStyle = '#3b0d0d'; c.lineWidth = 3.4; c.stroke();
      c.fillStyle = '#ffd23f'; c.fillRect(-24, -40, 48, 12); c.fillStyle = '#111'; for (let i = -24; i < 24; i += 16) { c.beginPath(); c.moveTo(i, -40); c.lineTo(i + 8, -40); c.lineTo(i + 16, -28); c.lineTo(i + 8, -28); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-18, -54, 6, 46);
    }
    c.restore();
  }
  const lgB = () => { const g = c.createLinearGradient(-24, 0, 24, 0); g.addColorStop(0, '#e35d5d'); g.addColorStop(.4, '#c0392b'); g.addColorStop(1, '#7a1f1a'); return g; };
  const rrect = (x, y, w, h, r) => B.rr(c, x, y, w, h, r);
  function drawItem(it, t) {
    c.save(); c.translate(it.x, GY - it.z - 10 - (it.z > 0 ? 0 : Math.sin(t * 4 + it.x) * 3));
    switch (it.k) {
      case 'coin': c.scale(Math.max(.15, Math.abs(Math.cos(t * 6 + it.x))), 1); B.icoCoin(c, 0, 0, 11); break;
      case 'gem': B.icoGem(c, 0, 0, 14); c.globalAlpha = .6 + .4 * Math.sin(t * 8); c.fillStyle = '#fff'; c.fillRect(-1, -22, 2, 8); c.fillRect(8, -16, 7, 2); break;
      case 'hp': B.circ(c, 0, 0, 17, 'rgba(255,255,255,.9)'); B.icoHeart(c, 0, 1, 11); break;
      case 'mp': B.circ(c, 0, 0, 17, 'rgba(255,255,255,.9)'); B.icoBolt(c, 0, 0, 12); break;
      case 'pot': B.circ(c, 0, 0, 18, 'rgba(255,255,255,.9)'); flask(c, 0, 0, .9, '#c06bff'); break;
      case 'wep': { const w = W[it.wk]; const g = c.createRadialGradient(0, 0, 4, 0, 0, 40); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.5, w.col); g.addColorStop(1, 'rgba(255,255,255,0)'); c.globalAlpha = .55 + .25 * Math.sin(t * 5); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 40, 0, TAU); c.fill(); c.globalAlpha = 1; c.translate(0, -8); c.rotate(-.8 + Math.sin(t * 3) * .12); c.scale(.62, .62); c.translate(-w.len / 2, 0); B.weaponDraw(c, it.wk, w.len, t); break; }
    }
    c.restore();
  }
  function flask(cx2, x, y, s, col) {
    cx2.save(); cx2.translate(x, y); cx2.scale(s, s);
    cx2.fillStyle = col; cx2.strokeStyle = '#2a0f3d'; cx2.lineWidth = 2.2; cx2.beginPath(); cx2.moveTo(-4, -12); cx2.lineTo(4, -12); cx2.lineTo(4, -5); cx2.lineTo(11, 8); cx2.quadraticCurveTo(12, 13, 6, 13); cx2.lineTo(-6, 13); cx2.quadraticCurveTo(-12, 13, -11, 8); cx2.lineTo(-4, -5); cx2.closePath(); cx2.fill(); cx2.stroke();
    cx2.fillStyle = '#e9d2a0'; cx2.fillRect(-5, -16, 10, 5); cx2.strokeRect(-5, -16, 10, 5); cx2.fillStyle = 'rgba(255,255,255,.6)'; cx2.fillRect(-7, 3, 4, 7);
    cx2.restore();
  }

  function drawHUD(t) {
    const VW = B.VW, h = hero, sl = B.safeL || 0, sr = B.safeR || 0;
    c.save();
    // avatar
    const ax = 14 + sl, ay = 12;
    B.rr(c, ax, ay, 66, 66, 16); c.fillStyle = B.lg(c, 0, ay, 0, ay + 66, ['#3a3f66', '#1a1d38']); c.fill(); c.lineWidth = 4; c.strokeStyle = '#ffc93c'; c.stroke();
    c.save(); B.rr(c, ax, ay, 66, 66, 16); c.clip(); { const H = h.hd || B.heroDef(); const gg = c.createRadialGradient(ax + 33, ay + 36, 2, ax + 33, ay + 36, 40); gg.addColorStop(0, B.rgba(H.col, .55)); gg.addColorStop(1, B.rgba(H.col, 0)); c.fillStyle = gg; c.fillRect(ax, ay, 66, 66);
      B.circ(c, ax + 33, ay + 36, 21, B.rgba(H.col, .35)); B.circ(c, ax + 33, ay + 36, 18.5, H.col); B.circ(c, ax + 28, ay + 31, 8, B.rgba(H.lite, .5));
      c.strokeStyle = '#0a0a14'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(ax + 16, ay + 35); c.lineTo(ax + 52, ay + 35); c.stroke();
      if (H.band !== false) { c.strokeStyle = H.acc; c.lineWidth = 4; c.beginPath(); c.moveTo(ax + 15, ay + 30); c.lineTo(ax + 51, ay + 30); c.stroke(); c.beginPath(); c.moveTo(ax + 15, ay + 30); c.quadraticCurveTo(ax + 2, ay + 38, ax - 3, ay + 52); c.stroke(); } else { c.strokeStyle = '#fff2a0'; c.lineWidth = 3; c.beginPath(); c.ellipse(ax + 33, ay + 14, 12, 4, 0, 0, TAU); c.stroke(); }
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ax + 41, ay + 35, 6, 2.6, 0, 0, TAU); c.fill(); } c.restore();
    // jon
    const bx = ax + 78, hw = 224, pct = clamp(h.hp / h.maxhp, 0, 1);
    bar(bx, 16, hw, 24, pct, ['#ff9aa8', '#ff3b5c', '#b3001b'], '#2a0710');
    B.icoHeart(c, bx + 4, 28, 11);
    c.font = '900 15px Impact, "Arial Black", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = '#000'; c.strokeText(Math.ceil(h.hp) + ' / ' + h.maxhp, bx + hw / 2 + 8, 29); c.fillStyle = '#fff'; c.fillText(Math.ceil(h.hp) + ' / ' + h.maxhp, bx + hw / 2 + 8, 29);
    // energiya
    const mpp = clamp(h.mp / h.maxmp, 0, 1), full = h.mp >= skc();
    bar(bx, 46, 176, 18, mpp, full ? ['#a8e9ff', '#2fa8ff', '#0b4fb3'] : ['#8fa6c9', '#4f6a99', '#2b3d63'], '#071229');
    B.icoBolt(c, bx + 4, 55, 9);
    c.font = '900 12px Impact, "Arial Black", sans-serif'; c.strokeText(Math.floor(h.mp), bx + 100, 56); c.fillText(Math.floor(h.mp), bx + 100, 56);
    // vaqtincha qurol
    if (h.wtmp > 0) { const w = W[h.wep]; B.rr(c, bx, 70, 176, 22, 8); c.fillStyle = 'rgba(0,0,0,.55)'; c.fill(); c.fillStyle = w.col; B.rr(c, bx + 3, 73, 170 * clamp(h.wtmp / 20, 0, 1), 16, 6); c.fill(); c.font = '900 12px Impact, sans-serif'; c.strokeText(w.n.toUpperCase() + ' ' + Math.ceil(h.wtmp) + 's', bx + 88, 82); c.fillText(w.n.toUpperCase() + ' ' + Math.ceil(h.wtmp) + 's', bx + 88, 82); }
    // markaz: level + vaqt
    const cx0 = VW / 2;
    B.rr(c, cx0 - 92, 8, 184, 54, 16); c.fillStyle = B.lg(c, 0, 8, 0, 62, ['rgba(40,44,80,.92)', 'rgba(15,16,34,.92)']); c.fill(); c.lineWidth = 3; c.strokeStyle = '#ffc93c'; c.stroke();
    B.comic(c, endless ? ewave + '-TO\'LQIN' : 'LEVEL ' + (li + 1), cx0, 27, 24, '#ffd23f', '#1a0f00');
    c.font = '900 19px Impact, sans-serif'; c.lineWidth = 4; c.strokeStyle = '#000'; c.strokeText(B.mmss(time), cx0, 51); c.fillStyle = '#fff'; c.fillText(B.mmss(time), cx0, 51);
    // combo
    if (combo >= 3) { const k = clamp(comboT / 2.6, 0, 1); c.globalAlpha = Math.min(1, k * 3); B.comic(c, combo + ' KOMBO!', cx0, 92, 26 + Math.min(14, combo), combo >= 10 ? '#ff6b35' : '#ffd23f', '#1a0f00', -.04); c.globalAlpha = 1; }
    // tanga + olmos
    const rx = VW - 92 - sr;
    pill(rx - 134, 10, 128, 'coin', B.fmt(B.S0.coins));
    pill(rx - 134, 46, 128, 'gem', B.fmt(B.S0.gems));
    // pauza tugmasi
    const px = VW - 44 - sr, py = 40; G.pauseBtn = { x: px, y: py, r: 30 };
    B.circ(c, px, py + 2, 27, 'rgba(0,0,0,.35)'); c.beginPath(); c.arc(px, py, 26, 0, TAU); c.fillStyle = B.lg(c, 0, py - 26, 0, py + 26, ['#7ff3e4', '#13b9a8', '#0a766b']); c.fill(); c.lineWidth = 4; c.strokeStyle = '#05302b'; c.stroke();
    c.fillStyle = '#fff'; B.rr(c, px - 9, py - 11, 6, 22, 2); c.fill(); B.rr(c, px + 3, py - 11, 6, 22, 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.ellipse(px - 4, py - 16, 14, 7, -.2, 0, TAU); c.fill();
    // boss
    if (bossRef && !bossRef.dead) {
      const bw = 380, bx2 = cx0 - bw / 2, p2 = clamp(bossRef.hp / bossRef.maxhp, 0, 1);
      bar(bx2, 72, bw, 20, p2, ['#ffb08a', '#ff5a1f', '#a02000'], '#2a0d05');
      B.comic(c, bossRef.name, cx0, 118, 20, '#fff', '#7a0016');
    }
    // GO strelka
    if (goT > 0 && Math.floor(t * 3) % 2 === 0) { const gx = VW - 120 - sr + Math.sin(t * 8) * 8; B.comic(c, 'YURING', gx, 250, 30, '#ffd23f', '#1a0f00'); c.fillStyle = '#ffd23f'; c.strokeStyle = '#1a0f00'; c.lineWidth = 5; c.beginPath(); c.moveTo(gx - 30, 280); c.lineTo(gx + 6, 280); c.lineTo(gx + 6, 266); c.lineTo(gx + 40, 296); c.lineTo(gx + 6, 326); c.lineTo(gx + 6, 312); c.lineTo(gx - 30, 312); c.closePath(); c.stroke(); c.fill(); }
    // maslahat
    if (!endless && li === 0 && time < 14) {
      const msg = time < 5 ? (B.touch ? '◀ ▶ tugmalar bilan yuring' : 'A D yoki ← → — yuring') : time < 10 ? (B.touch ? 'Qizil tugma — hujum. 3 marta ketma-ket = kombo!' : 'J — hujum (3 marta ketma-ket = kombo), W — sakrash') : (B.touch ? 'Yashil — maxsus zarba, binafsha — dori' : 'L — maxsus zarba, U — dori');
      c.globalAlpha = clamp(Math.min(time, 14 - time) * 2, 0, 1); B.rr(c, cx0 - 230, 470, 460, 34, 12); c.fillStyle = 'rgba(0,0,0,.6)'; c.fill(); c.font = '700 17px system-ui, sans-serif'; c.fillStyle = '#fff'; c.fillText(msg, cx0, 488); c.globalAlpha = 1;
    }
    c.restore();
    function bar(x, y, w, hh, p, cols, bg) {
      B.rr(c, x, y, w, hh, hh / 2); c.fillStyle = bg; c.fill();
      if (p > 0) { c.save(); B.rr(c, x + 2, y + 2, w - 4, hh - 4, (hh - 4) / 2); c.clip(); c.fillStyle = B.lg(c, 0, y, 0, y + hh, [cols[0], cols[1], cols[2]]); c.fillRect(x + 2, y + 2, (w - 4) * p, hh - 4); c.fillStyle = 'rgba(255,255,255,.32)'; c.fillRect(x + 2, y + 2, (w - 4) * p, (hh - 4) * .42); c.restore(); }
      B.rr(c, x, y, w, hh, hh / 2); c.lineWidth = 3; c.strokeStyle = '#000'; c.stroke();
    }
    function pill(x, y, w, kind, txt) {
      B.rr(c, x, y, w, 32, 16); c.fillStyle = 'rgba(12,14,30,.78)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = kind === 'coin' ? '#ffc93c' : '#4cc9ff'; c.stroke();
      if (kind === 'coin') B.icoCoin(c, x + 17, y + 16, 12); else B.icoGem(c, x + 17, y + 16, 12);
      c.font = '900 19px Impact, "Arial Black", sans-serif'; c.textAlign = 'right'; c.textBaseline = 'middle'; c.lineWidth = 4; c.strokeStyle = '#000'; c.strokeText(txt, x + w - 12, y + 17); c.fillStyle = '#fff'; c.fillText(txt, x + w - 12, y + 17); c.textAlign = 'center';
    }
  }
  function drawBanner() {
    if (!banner) return; const b = banner, VW = B.VW, k = b.t / b.life;
    const inn = Math.min(1, b.t / .22), out = k > .8 ? 1 - (k - .8) / .2 : 1, x = VW / 2 + (1 - B.ease(inn)) * -400, y = b.small ? 150 : 200;
    c.save(); c.globalAlpha = Math.max(0, out);
    if (!b.small) { c.fillStyle = b.red ? 'rgba(120,0,20,.55)' : 'rgba(0,0,0,.42)'; c.fillRect(0, y - 64, VW, 128); }
    B.comic(c, b.a, x, y - (b.b ? 14 : 0), b.small ? 46 : 84, b.red ? '#ff5a4a' : '#ffd23f', '#1a0f00', -.05);
    if (b.b) B.comic(c, b.b, x + 8, y + 50, b.small ? 24 : 34, '#fff', '#1a0f00', -.03);
    c.restore();
  }

  B.render = (t) => {
    const cv = B.cv; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, cv.width, cv.height);
    c.setTransform(B.S, 0, 0, B.S, B.ox, B.oy); c.save(); c.beginPath(); c.rect(0, 0, B.VW, 540); c.clip();
    if (G.mode === 'menu' || !hero) { renderMenuScene(t); c.restore(); return; }
    if (shake > 0) c.translate(rnd(-1, 1) * shake * 12, rnd(-1, 1) * shake * 10);
    const tt = time, ct = cam;
    B.drawBG(c, L.bg, ct, t, L);
    c.save(); c.translate(-Math.round(ct), 0);
    stains.forEach(s => { c.globalAlpha = Math.min(1, s.a); c.fillStyle = '#7a0b14'; c.beginPath(); c.ellipse(s.x, s.y, s.r * 1.6, s.r * .5, 0, 0, TAU); c.fill(); }); c.globalAlpha = 1;
    crates.forEach(drawCrate);
    items.forEach(it => { if (it.x > ct - 40 && it.x < ct + B.VW + 40) drawItem(it, t); });
    en.forEach(e => { if (e.pk !== 'heli') B.shadow(c, e.x, e.z, e.hw * 1.5); else B.shadow(c, e.x, e.z * .9, 70, .25); });
    B.shadow(c, hero.x, hero.z, 34);
    en.slice().sort((a, b) => (b.boss ? 1 : 0) - (a.boss ? 1 : 0)).forEach(e => { if (e.x > ct - 260 && e.x < ct + B.VW + 260) drawEnt(e, t); });
    drawEnt(hero, t);
    drawTrail(); drawProj(t); drawFx(t); drawTx();
    c.restore();
    B.vignette(c);
    if (flashA > 0) { c.globalAlpha = Math.min(.7, flashA); c.fillStyle = '#fff'; c.fillRect(0, 0, B.VW, 540); c.globalAlpha = 1; }
    if (hero.hp < hero.maxhp * .25 && !hero.dead) { const a = .12 + .08 * Math.sin(t * 6); const g = c.createRadialGradient(B.VW / 2, 270, 260, B.VW / 2, 270, B.VW * .6); g.addColorStop(0, 'rgba(255,0,0,0)'); g.addColorStop(1, 'rgba(255,0,0,' + (a * 3) + ')'); c.fillStyle = g; c.fillRect(0, 0, B.VW, 540); }
    c.restore();
    c.save(); c.setTransform(B.S, 0, 0, B.S, B.ox, B.oy); c.beginPath(); c.rect(0, 0, B.VW, 540); c.clip();
    drawHUD(t); drawBanner(); c.restore();
    updPadBadges();
  };

  // ---------- Menyu fon sahnasi: tanlangan qahramon poydevorda, aura va zarralar ----------
  function renderMenuScene(t) {
    const H = B.heroDef(), VW = B.VW;
    B.backdrop(c, H, VW, 540, t);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 28; i++) { const ph = (t * (.04 + (i % 5) * .018) + i * .137) % 1, px = (i * 97.3) % VW, py = 560 - ph * 600; c.globalAlpha = Math.sin(ph * Math.PI) * .75; c.fillStyle = H.lite; c.beginPath(); c.arc(px + Math.sin(t * .8 + i) * 16, py, 1 + (i % 4) * .8, 0, TAU); c.fill(); }
    c.restore();
    if (B.menuHero !== false) B.heroStage(c, H, Math.max(230, (VW - 352) / 2 + 6), 468, 2.5, t, { wep: B.S0.eq, atk: true, maxw: 200 });
    B.vignette(c);
  }
  B.menuScene = () => { };

  // ---------- Sensorli tugma yozuvlari ----------
  let lastBadge = '';
  function updPadBadges() {
    const sk = document.getElementById('bSk'), po = document.getElementById('bPo'); if (!sk) return;
    const n = Math.floor(hero.mp / skc()), key = n + '/' + B.S0.pot;
    if (key !== lastBadge) { lastBadge = key; sk.textContent = 'x' + n; po.textContent = 'x' + B.S0.pot; document.getElementById('kSk').classList.toggle('dis', n < 1); document.getElementById('kPo').classList.toggle('dis', B.S0.pot < 1 || hero.hp >= hero.maxhp); }
  }

  // ---------- Pauza / chiqish ----------
  B.pause = () => { if (G.mode !== 'play') return false; G.paused = true; B.clearInput(); B.persist(); return true; };
  B.resume = () => { G.paused = false; B.clearInput(); };
  B.quitLevel = () => { G.mode = 'menu'; G.paused = false; G.ended = false; hero = null; B.persist(); B.menuScene(); };
  B.isPlaying = () => G.mode === 'play' || G.mode === 'dying' || G.mode === 'won';
  B.heroPos = () => hero && { x: hero.x, hp: hero.hp };

  // ---------- Asosiy sikl ----------
  let last = 0, ema = 16, slowCnt = 0;
  function loop(ts) {
    requestAnimationFrame(loop);
    const dtR = Math.min(.05, (ts - last) / 1000 || .016); last = ts;
    ema = ema * .95 + dtR * 1000 * .05;
    if (B.dprCap > 1 && ema > 26) { if (++slowCnt > 90) { B.dprCap = 1; B.resize(); slowCnt = 0; } } else slowCnt = Math.max(0, slowCnt - 1);
    if (document.hidden) return;
    const playing = (G.mode === 'play' || G.mode === 'dying' || G.mode === 'won') && hero;
    if (playing && !G.paused) { update(dtR); B.press = {}; }
    if (playing && G.paused) B.press = {};
    B.render(ts / 1000);
  }
  B.start = () => { B.resize(); B.initPad(); requestAnimationFrame(loop); };
  // canvas: pauza tugmasini bosish
  B.cv.addEventListener('pointerdown', e => {
    if (!hero || G.mode !== 'play' || G.paused || !G.pauseBtn) return;
    const p = B.logical(e.clientX, e.clientY), b = G.pauseBtn; if (Math.hypot(p[0] - b.x, p[1] - b.y) < b.r + 8) { B.onPauseKey && B.onPauseKey(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.mode === 'play' && !G.paused) B.onPauseKey && B.onPauseKey(); B.persist(); });
  B.test = { get hero() { return hero; }, get en() { return en; }, get cam() { return cam; }, set time(v) { time = v; }, spawn: (t, s) => spawnEnemy(t, s), hurtHero, G, boom, get enc() { return enc; }, get items() { return items; }, get crates() { return crates; }, get pr() { return pr; }, get ep() { return ep; }, get L() { return L; }, get ewave() { return ewave; }, update, get fx() { return fx; }, win: () => winLevel() };
})();
