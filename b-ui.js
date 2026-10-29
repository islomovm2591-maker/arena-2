'use strict';
// ===== Stickman Jang 2 — menyular: bosh menyu, qahramonlar, bosqichlar, do'kon, pauza, natija, sozlamalar, offline =====
(function () {
  const ov = document.getElementById('ov'), W = B.W, LV = B.LV;
  const S = () => B.S0;
  let INST = null, from = 'main', shopTab = 'w', offTimer = 0, fsDone = false, confirmReset = 0, scr = '', waitSince = 0, kicked = 0, hsTok = 0;
  const N = B.net, esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const ICO = {
    coin: '<svg class="ic" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ffc400" stroke="#7a4d00" stroke-width="2.4"/><circle cx="12" cy="12" r="6.4" fill="none" stroke="#b07a00" stroke-width="1.6"/><text x="12" y="16.4" text-anchor="middle" font-size="11" font-weight="900" fill="#8a5a00" font-family="Impact,Arial Black,sans-serif">$</text></svg>',
    gem: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 2 L22 9 L18 22 H6 L2 9 Z" fill="#3bb8ff" stroke="#06315e" stroke-width="2" stroke-linejoin="round"/><path d="M2 9 H22 M8 9 L10 22 M16 9 L14 22" stroke="#d6f5ff" stroke-width="1.4" fill="none"/></svg>'
  };
  const pills = () => '<span class="pill">' + ICO.coin + B.fmt(S().coins) + '</span><span class="pill g">' + ICO.gem + B.fmt(S().gems) + '</span>';

  function toast(t) {
    let el = document.getElementById('toast'); if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 1700);
  }
  function setOv(html, cls) { scr = ''; B.menuHero = cls === 'dim'; ov.className = cls || ''; ov.innerHTML = html; ov.hidden = false; document.body.classList.remove('playing'); clearTimeout(offTimer); }
  function hideOv() { ov.hidden = true; document.body.classList.toggle('playing', B.isPlaying()); }
  B.hideOv = hideOv;

  // ---------- Offline holati ----------
  async function offlineState() {
    if (location.protocol === 'file:') return { s: 'file' };
    if (!('serviceWorker' in navigator) || !window.caches) return { s: 'none' };
    try {
      const reg = await navigator.serviceWorker.getRegistration(); if (!reg) return { s: 'wait' };
      const r = await caches.match(new URL('__status', location.href).href); if (!r) return { s: 'wait', reg };
      const j = await r.json(); return j.ok ? { s: 'ok' } : { s: 'partial', bad: j.bad };
    } catch (e) { return { s: 'wait' }; }
  }
  const OFFT = { ok: ['ok', '✔ Internetsiz ishlaydi'], wait: ['wait', '⏳ Offline tayyorlanmoqda… (internet yoqiq tursin)'], none: ['bad', '✖ Brauzer offline qo\'llamaydi'], file: ['wait', 'ℹ Fayl rejimi'], partial: ['bad', '⚠ Offline to\'liq emas — yangilang'] };
  async function updOff() {
    const el = document.getElementById('off'); if (!el) return;
    const st = await offlineState(), o = OFFT[st.s]; el.className = 'badge ' + o[0]; el.textContent = o[1];
    if (st.s === 'ok') waitSince = 0;
    if (st.s === 'wait' || st.s === 'partial') {
      waitSince = waitSince || Date.now();
      // 12 soniyadan beri tayyor bo'lmasa — xizmat ishchisiga fayllarni qayta yuklashni buyuramiz (10 soniyada bir martadan ko'p emas)
      if (Date.now() - waitSince > 12000 && Date.now() - kicked > 10000 && st.reg && st.reg.active) { kicked = Date.now(); try { st.reg.active.postMessage({ type: 'precache' }); } catch (e) { } }
      offTimer = setTimeout(updOff, 2000);
    }
  }

  // ---------- Bosh menyu (katta, qahramon vitrinasi bilan) ----------
  const tile = (a, ic, t, cls) => '<button class="bt tile ' + cls + '" data-a="' + a + '"><i>' + ic + '</i>' + t + '</button>';
  function showMain() {
    from = 'main'; B.menuScene(); S();
    const H = B.heroDef(), on = N.enabled(), d = N.daily;
    const who = on && N.acc ? '<div class="who">👤 <b>' + esc(N.acc.name) + '</b> ' + (N.cloudState() === 'ok' ? '☁' : N.cloudState() === 'net' ? '📴' : '') + '</div>' : '';
    const tiles = tile('shop', '🛒', 'Do\'kon', 'green') + tile('heroes', '🦸', 'Qahramonlar', 'purple') +
      (on ? tile('top', '🏆', 'Reyting', 'blue') + tile('prof', '👤', N.acc ? 'Profil' : 'Taxallus', 'gray') : tile('set', '⚙', 'Sozlamalar', 'gray') + tile('fs', '⛶', 'To\'liq ekran', 'gray'));
    const mini = (d && d.can_claim ? '<button class="bt sm daily" data-a="daily">🎁 Kunlik bonus</button>' : '') + (on ? '<button class="bt sm gray" data-a="set">⚙</button><button class="bt sm gray" data-a="fs">⛶</button>' : '') + (INST ? '<button class="bt sm purple" data-a="install">📲 O\'rnatish</button>' : '');
    setOv('<div class="top"><span class="badge wait" id="off" data-a="offhelp" style="cursor:pointer">…</span><div class="row" style="gap:6px">' + pills() + '</div></div>' +
      '<div class="mm" style="--hc:' + H.col + '"><div class="mm-l"><div class="logo"><b>Stickman</b><i>Jang <u>2</u></i></div>' +
      '<div><div class="hrib"><button class="ar" data-a="hprev" aria-label="Oldingi">◀</button><div class="hn" data-a="heroes"><em>' + H.n + '</em><small>' + H.t + '</small></div><button class="ar" data-a="hnext" aria-label="Keyingi">▶</button></div>' +
      (S().best.endless ? '<div class="who">🏅 Cheksiz rekord: <b>' + S().best.endless + '-to\'lqin</b></div>' : '') + who + '</div></div>' +
      '<div class="mm-r"><button class="bt big red" data-a="play">▶ O\'yin</button><button class="bt xl blue" data-a="endless">♾ Cheksiz jang</button>' +
      '<div class="tiles">' + tiles + '</div>' + (mini ? '<div class="row mini">' + mini + '</div>' : '') + '</div></div>', 'dim');
    scr = 'main'; updOff();
  }

  // ---------- Qahramonlar (uzun panellar, element fonlari) ----------
  const perkRow = H => '<div class="pk">' + H.perk + '</div>';
  function heroBtn(k) {
    const s = S(), H = B.HEROES[k], own = !!s.heroOwn[k], on = s.hero === k;
    if (own) return on ? '<button class="bt sm green off">✓ Tanlangan</button>' : '<button class="bt sm blue" data-a="hsel" data-v="' + k + '">Tanlash</button>';
    return '<button class="bt sm ' + (H.gem ? 'purple' : '') + '" data-a="hbuy" data-v="' + k + '">' + (H.gem ? H.gem + ' ' + ICO.gem : B.fmt(H.price) + ' ' + ICO.coin) + '</button>';
  }
  function showHeroes() {
    const s = S(), keep = (document.querySelector('.hscroll') || {}).scrollLeft;
    const cards = B.HORDER.map(k => {
      const H = B.HEROES[k], own = !!s.heroOwn[k], on = s.hero === k;
      return '<div class="hp' + (on ? ' sel' : '') + (own ? '' : ' lock') + '" style="--hc:' + H.col + '"><div class="cv"><canvas data-h="' + k + '" width="264" height="378"></canvas>' + (own ? '' : '<div class="lk">🔒</div>') +
        '<div class="rb"><em>' + H.n + '</em></div></div><div class="ht">' + H.t + '</div>' + perkRow(H) + heroBtn(k) + '</div>';
    }).join('');
    setOv('<div class="top"><button class="bt sm gray" data-a="main">⬅ Orqaga</button><div class="row" style="gap:6px">' + pills() + '</div></div>' +
      '<div class="screen hs"><div class="hscroll">' + cards + '</div><div class="banner"><span>Qahramonni tanla</span></div></div>', 'dim2');
    scr = 'heroes'; const sc = document.querySelector('.hscroll');
    if (sc) sc.addEventListener('wheel', e => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { sc.scrollLeft += e.deltaY; e.preventDefault(); } }, { passive: false });
    if (sc) { if (keep != null) sc.scrollLeft = keep; else { const sel = sc.querySelector('.hp.sel'); if (sel) sc.scrollLeft = Math.max(0, sel.offsetLeft - sc.clientWidth / 2 + sel.clientWidth / 2); } }
    const tok = ++hsTok, cvs = Array.from(ov.querySelectorAll('canvas[data-h]')); let last = 0;
    const loop = ts => {
      if (tok !== hsTok || scr !== 'heroes') return; requestAnimationFrame(loop);
      if (ts - last < 33) return; last = ts; const t = ts / 1000, vw = innerWidth;
      cvs.forEach(cv => {
        const r = cv.getBoundingClientRect(); if (r.right < -20 || r.left > vw + 20) return;
        const k = cv.dataset.h, H = B.HEROES[k], c = cv.getContext('2d'); c.setTransform(cv.width / 176, 0, 0, cv.height / 252, 0, 0);
        B.heroPanel(c, H, 176, 252, t, { wep: S().eq, sel: S().hero === k, locked: !S().heroOwn[k] });
      });
    };
    requestAnimationFrame(loop);
  }
  function buyHero(k) {
    const s = S(), H = B.HEROES[k];
    if (H.gem) { if (s.gems < H.gem) { toast('Olmos yetmaydi 💎'); B.sfx('warn'); return; } s.gems -= H.gem; } else { if (s.coins < H.price) { toast('Tanga yetmaydi'); B.sfx('warn'); return; } s.coins -= H.price; }
    s.heroOwn[k] = 1; s.hero = k; B.persist(); B.sfx('buy'); toast(H.n + ' sizniki!'); showHeroes();
  }
  function cycleHero(d) {
    const s = S(), own = B.HORDER.filter(k => s.heroOwn[k]); if (own.length < 2) { toast('Boshqa qahramon yo\'q — «Qahramonlar»da oching'); return; }
    s.hero = own[(own.indexOf(s.hero) + d + own.length) % own.length]; B.persist(); B.sfx('pick'); showMain();
  }

  // ---------- Onlayn: xato matnlari, reyting, profil ----------
  const ERR = { name_bad: 'Taxallus 2–16 belgi bo\'lsin (harf, raqam, bo\'sh joy, . _ -)', name_taken: 'Bu taxallus band, boshqasini tanlang', rate: 'Juda ko\'p urinish. Birozdan keyin qayta urining', net: 'Internet yo\'q yoki server javob bermayapti', off: 'Server ulanmagan', code_bad: 'Kod noto\'g\'ri yoki eskirgan', auth: 'Hisob eskirgan — «Chiqish» va qayta kiring', server: 'Serverda xato. Keyinroq urinib ko\'ring' };
  const errT = r => ERR[r && r.err] || 'Xato: ' + ((r && r.err) || '?');
  const cloudT = () => ({ ok: '☁ Bulutga saqlangan', busy: '⏳ Saqlanyapti…', dirty: '⏳ Saqlash navbatda', net: '📴 Internet yo\'q — ulanganda saqlanadi', auth: '⚠ Hisob eskirgan', noacc: '', off: '' }[N.cloudState()] || '');

  async function showTop() {
    from = 'main';
    const frame = body => '<div class="top"><button class="bt sm gray" data-a="main">⬅ Orqaga</button><div class="row" style="gap:6px">' + pills() + '</div></div><div class="screen" style="justify-content:flex-start;padding-top:calc(var(--u)*40)"><div class="banner"><span>Reyting · Cheksiz jang</span></div>' + body + '</div>';
    setOv(frame('<div class="hint">Yuklanyapti…</div>'), 'dim2'); scr = 'top';
    const r = await N.top(); if (scr !== 'top') return;
    if (!r.ok) { setOv(frame('<div class="hint" style="color:#ffb0b0">' + errT(r) + '</div><button class="bt sm blue" data-a="top">↻ Qayta urinish</button>'), 'dim2'); scr = 'top'; return; }
    const myId = N.acc && N.acc.id;
    let rows = r.top.map(x => '<div class="lbr' + (x.id === myId ? ' me' : '') + (x.rank <= 3 ? ' t' + x.rank : '') + '"><b>' + (x.rank <= 3 ? ['🥇', '🥈', '🥉'][x.rank - 1] : x.rank) + '</b><span>' + esc(x.name) + '</span><i>' + x.wave + '-to\'lqin</i><u>' + B.fmt(x.score) + '</u></div>').join('');
    if (!rows) rows = '<div class="hint" style="padding:calc(var(--u)*30)">Hali hech kim yo\'q. Birinchi bo\'ling! 🏁</div>';
    const me = r.me ? '<div class="hint">Sizning o\'rningiz: <b style="color:#ffd23f">#' + r.me.rank + '</b> · ' + r.me.wave + '-to\'lqin · ' + B.fmt(r.me.score) + ' ball</div>' : (N.acc ? '<div class="hint">Siz hali reytingda yo\'qsiz — Cheksiz jangda o\'ynang.</div>' : '<button class="bt sm blue" data-a="prof">👤 Taxallus tanlab qo\'shilish</button>');
    setOv(frame('<div class="panel lb">' + rows + '</div>' + me), 'dim2'); scr = 'top';
  }

  function showProfile(msg, kind) {
    from = 'main'; const acc = N.acc;
    const m = msg ? '<div class="hint" id="pmsg" style="color:' + (kind === 'ok' ? '#9dffc4' : '#ffb0b0') + '">' + msg + '</div>' : '<div class="hint" id="pmsg"></div>';
    let inner;
    if (!N.enabled()) inner = '<div class="hint">Onlayn server ulanmagan. <b>b-config.js</b> faylida PythonAnywhere manzilini yozing.</div>';
    else if (!acc) inner = '<div class="hint">Taxallus tanlang — reytingda ko\'rinasiz, tanga va qurollaringiz esa bulutda saqlanadi.</div>' +
      '<div class="row"><input id="nick" class="inp" maxlength="16" placeholder="Taxallus" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="bt sm green" data-a="reg">Yaratish</button></div>' + m +
      '<div class="hint" style="margin-top:calc(var(--u)*8)">Boshqa telefonda o\'ynaganmisiz? O\'sha yerdagi 6 belgili kodni kiriting:</div>' +
      '<div class="row"><input id="code" class="inp" maxlength="8" placeholder="KOD" autocomplete="off" autocapitalize="characters" spellcheck="false" style="text-transform:uppercase;letter-spacing:.2em"><button class="bt sm blue" data-a="usecode">Kirish</button></div>';
    else inner = '<div style="font:900 calc(var(--u)*34)/1 var(--f);font-style:italic;color:#ffd23f">' + esc(acc.name) + '</div><div class="hint" style="margin:0">' + cloudT() + '</div>' + m +
      '<div class="row"><input id="nick" class="inp" maxlength="16" placeholder="Yangi taxallus" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="bt sm gray" data-a="ren">O\'zgartirish</button></div>' +
      '<div class="row"><button class="bt sm blue" data-a="newcode">📲 Boshqa telefonga o\'tkazish kodi</button><button class="bt sm green" data-a="syncnow">☁ Hozir saqlash</button></div>' +
      '<div id="codebox"></div><div class="row"><button class="bt sm red" data-a="logout">Chiqish</button></div>';
    setOv('<div class="top"><button class="bt sm gray" data-a="' + (from === 'pause' ? 'pausebk' : 'main') + '">⬅ Orqaga</button><div class="row" style="gap:6px">' + pills() + '</div></div>' +
      '<div class="screen"><div class="banner"><span>Profil</span></div><div class="panel" style="display:flex;flex-direction:column;gap:calc(var(--u)*8);align-items:center;max-width:calc(var(--u)*560)">' + inner + '</div></div>', 'dim2');
    scr = 'prof';
  }
  const setMsg = (t, ok) => { const el = document.getElementById('pmsg'); if (el) { el.textContent = t; el.style.color = ok ? '#9dffc4' : '#ffb0b0'; } };

  // ---------- Bosqichlar ----------
  function showLevels() {
    from = 'levels'; const s = S();
    let cards = ''; LV.forEach((l, i) => {
      const lock = i >= s.unl, st = s.stars[i] || 0;
      cards += '<button class="lv bg-' + l.bg + (l.alarm ? ' alarm' : '') + (lock ? ' lock' : '') + '" data-a="lv" data-v="' + i + '"><div class="n">' + (i + 1) + '</div><div><div class="t">' + l.n + '</div><div class="s">' + [0, 1, 2].map(k => k < st ? '★' : '<u>★</u>').join('') + '</div></div></button>';
    });
    setOv('<div class="top"><button class="bt sm gray" data-a="main">⬅ Orqaga</button><div class="row" style="gap:6px">' + pills() + '</div></div>' +
      '<div class="screen"><div class="banner"><span>Bosqich tanlang</span></div>' +
      '<div class="chips">' + ['Oson', 'Oddiy', 'Qiyin'].map((n, i) => '<button class="bt sm ' + (s.diff === i ? 'green on' : 'gray') + '" data-a="diff" data-v="' + i + '">' + n + '</button>').join('') + '</div>' +
      '<div class="lvgrid">' + cards + '</div></div>', 'dim2');
  }

  // ---------- Do'kon ----------
  const UPG = { hp: { n: 'Maksimal jon', d: 'Har daraja +25 jon', max: 10, cost: l => 100 + 90 * l, val: l => 100 + 25 * l, col: '#ff3b5c' }, mp: { n: 'Maksimal energiya', d: 'Har daraja +10 energiya', max: 10, cost: l => 80 + 70 * l, val: l => 60 + 10 * l, col: '#2fa8ff' } };
  const wUp = k => Math.round(Math.max(80, (W[k].price || 500) * .16) * (S().wl[k] || 1));
  const wMul = k => 1 + .2 * ((S().wl[k] || 1) - 1);
  const bar = (p, col) => '<em><i style="width:' + Math.round(Math.max(.06, Math.min(1, p)) * 100) + '%' + (col ? ';background:' + col : '') + '"></i></em>';
  function showShop(tab) {
    if (tab) shopTab = tab; const s = S(); let cards = '';
    if (shopTab === 'w') {
      B.WORDER.forEach(k => {
        const w = W[k], own = !!s.own[k], eq = s.eq === k, lvl = s.wl[k] || 1, max = lvl >= 8;
        const price = w.gem ? w.gem + ' ' + ICO.gem : B.fmt(w.price) + ' ' + ICO.coin;
        cards += '<div class="card' + (eq ? ' eq' : '') + '">' + (own ? '<div class="lvl">LVL ' + lvl + '</div>' : '') + '<canvas data-w="' + k + '" width="240" height="132"></canvas><h4>' + w.n + '</h4><p>' + w.d + '</p>' +
          '<div class="st"><div><span>Zarba</span>' + bar(w.dmg * (own ? wMul(k) : 1) / 110) + '</div><div><span>Tezlik</span>' + bar((.72 - w.dur) / .5) + '</div><div><span>Masofa</span>' + bar(w.reach / 160) + '</div></div>' +
          (!own ? '<button class="bt sm ' + (w.gem ? 'purple' : '') + '" data-a="buy" data-v="' + k + '">' + price + '</button>' :
            (eq ? '<button class="bt sm green off">✓ Tanlangan</button>' : '<button class="bt sm blue" data-a="eq" data-v="' + k + '">Tanlash</button>') +
            (max ? '<button class="bt sm gray off">MAX</button>' : '<button class="bt sm" data-a="wup" data-v="' + k + '">⬆ ' + B.fmt(wUp(k)) + ' ' + ICO.coin + '</button>')) + '</div>';
      });
    } else {
      ['hp', 'mp'].forEach(k => {
        const u = UPG[k], lv = s[k + 'L'], max = lv >= u.max;
        cards += '<div class="card"><div class="lvl">LVL ' + lv + '/' + u.max + '</div><div style="font-size:calc(var(--u)*64);margin-top:calc(var(--u)*14)">' + (k === 'hp' ? '❤️' : '⚡') + '</div><h4>' + u.n + '</h4><p>' + u.d + '<br><b style="color:#fff">Hozir: ' + u.val(lv) + '</b></p>' +
          '<div class="st"><div><span>Daraja</span>' + bar(lv / u.max, u.col) + '</div></div>' + (max ? '<button class="bt sm gray off">MAX</button>' : '<button class="bt sm" data-a="up" data-v="' + k + '">⬆ ' + B.fmt(u.cost(lv)) + ' ' + ICO.coin + '</button>') + '</div>';
      });
      cards += '<div class="card"><div class="lvl">' + s.pot + '/9</div><div style="font-size:calc(var(--u)*64);margin-top:calc(var(--u)*14)">🧪</div><h4>Shifobaxsh dori</h4><p>Jonning 50% ini tiklaydi (o\'yinda binafsha tugma)</p><div class="st"></div><button class="bt sm purple' + (s.pot >= 9 ? ' off' : '') + '" data-a="pot">+1 · 70 ' + ICO.coin + '</button></div>';
      cards += '<div class="card"><div style="font-size:calc(var(--u)*64);margin-top:calc(var(--u)*14)">💎</div><h4>Olmoslar</h4><p>Boss, quti va bosqich yutug\'idan olinadi. Plazma qilich va tirilish uchun kerak.</p><div class="st"></div><button class="bt sm gray off">' + s.gems + ' ta bor</button></div>';
    }
    const keep = (document.querySelector('.shelf') || {}).scrollLeft || 0;
    setOv('<div class="top"><button class="bt sm gray" data-a="' + (from === 'pause' ? 'pausebk' : 'main') + '">⬅ Orqaga</button><div class="row" style="gap:6px">' + pills() + '</div></div>' +
      '<div class="screen" style="justify-content:flex-start;padding-top:calc(var(--u)*34)"><div class="row"><div class="banner"><span>Qurollarni kuchaytiring!</span></div></div>' +
      '<div class="chips"><button class="bt sm ' + (shopTab === 'w' ? 'blue on' : 'gray') + '" data-a="tab" data-v="w">⚔ Qurollar</button><button class="bt sm ' + (shopTab === 'k' ? 'blue on' : 'gray') + '" data-a="tab" data-v="k">💪 Kuch va buyumlar</button></div>' +
      '<div class="shopbox"><div class="shelf">' + cards + '</div></div></div>', 'dim2');
    const sh = document.querySelector('.shelf'); if (sh) sh.scrollLeft = keep;
    ov.querySelectorAll('canvas[data-w]').forEach(cv => icon(cv, cv.dataset.w));
  }
  function icon(cv, k) {
    const c = cv.getContext('2d'), w = W[k]; c.clearRect(0, 0, 240, 132);
    const lv = S().own[k] ? (S().wl[k] || 1) : 0, gc = lv >= 6 ? '#ffd23f' : lv >= 3 ? '#4fc3ff' : null;      // daraja oshgan sari nur kuchayadi: 3+ ko'k, 6+ oltin
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(120, 118, 74, 11, 0, 0, 6.3); c.fill();
    if (gc) { const g = c.createRadialGradient(120, 66, 4, 120, 66, 84); g.addColorStop(0, B.rgba(gc, .55)); g.addColorStop(1, B.rgba(gc, 0)); c.fillStyle = g; c.fillRect(0, 0, 240, 132); c.strokeStyle = B.rgba(gc, .8); c.lineWidth = 2.5; c.beginPath(); c.ellipse(120, 118, 70, 10, 0, 0, 6.3); c.stroke(); }
    const draw = (rot, dx, sc, dy) => { c.save(); c.translate(120 + dx, 70 + (dy || 0)); c.rotate(rot); c.scale(sc, sc); c.translate(-w.len / 2, 0); B.weaponDraw(c, k, w.len, 0); c.restore(); };
    const sc = Math.min(1.7, 190 / (w.len + 30));
    if (k === 'dual') { draw(-.9, -16, sc * 1.3); draw(-.4, 20, sc * 1.3); } else if (k === 'scythe') draw(-.5, -4, sc * .82, 26); else draw(-.55, 0, sc);
  }
  function buyWeapon(k) {
    const s = S(), w = W[k];
    if (w.gem) { if (s.gems < w.gem) { toast('Olmos yetmaydi 💎'); B.sfx('warn'); return; } s.gems -= w.gem; } else { if (s.coins < w.price) { toast('Tanga yetmaydi'); B.sfx('warn'); return; } s.coins -= w.price; }
    s.own[k] = 1; s.wl[k] = 1; s.eq = k; B.persist(); B.sfx('buy'); toast(w.n + ' sotib olindi!'); showShop();
  }

  // ---------- Pauza ----------
  function showPause() {
    from = 'pause';
    setOv('<div class="screen"><div class="panel" style="display:flex;flex-direction:column;gap:calc(var(--u)*10);align-items:center;min-width:calc(var(--u)*300)"><div class="banner"><span>Pauza</span></div>' +
      '<button class="bt green" data-a="resume">▶ Davom etish</button><button class="bt blue" data-a="retry">↻ Qayta boshlash</button><div class="row"><button class="bt sm gray" data-a="shop">🛒 Do\'kon</button><button class="bt sm gray" data-a="set">⚙ Sozlamalar</button></div><button class="bt sm red" data-a="quit">🏠 Chiqish</button></div></div>', 'dim2');
  }
  B.onPauseKey = () => {
    if (!B.isPlaying()) return;
    if (B.G.mode !== 'play') return;
    if (B.G.paused) { if (from === 'pause') { B.resume(); hideOv(); } return; }
    if (B.pause()) showPause();
  };

  // ---------- Natija ----------
  B.onWin = r => {
    from = 'result'; const last = r.li >= LV.length - 1;
    setOv('<div class="screen"><div class="banner" style="background:linear-gradient(90deg,#7dff9a,#1fb85a)"><span>G\'alaba!</span></div><div class="stars">' + [0, 1, 2].map(k => k < r.stars ? '<b>★</b>' : '★').join('') + '</div>' +
      '<div class="panel"><div class="stats"><span>Tanga</span><b>+' + B.fmt(r.coins) + '</b><span>Olmos</span><b>+' + r.gems + '</b><span>Vaqt</span><b>' + B.mmss(r.time) + ' <small style="color:#aab2e0">(★ ' + B.mmss(r.par) + ')</small></b><span>Eng yaxshi kombo</span><b>' + r.maxCombo + '</b><span>Dushmanlar</span><b>' + r.kills + '</b></div></div>' +
      (last ? '<div class="hint" style="color:#ffd23f">🏆 Barcha bosqichlar tugadi! Endi Cheksiz jangda rekord qo\'ying.</div>' : '') +
      '<div class="row">' + (!last ? '<button class="bt green" data-a="next">Keyingi ▶</button>' : '<button class="bt blue" data-a="endless">♾ Cheksiz</button>') + '<button class="bt" data-a="shop">🛒 Do\'kon</button><button class="bt sm gray" data-a="retry">↻</button><button class="bt sm gray" data-a="quit">🏠</button></div></div>', 'dim2');
  };
  B.onLose = r => {
    from = 'result'; setOv('<div class="screen"><div class="banner" style="background:linear-gradient(90deg,#ff7a7a,#c1121f)"><span>' + (r.endless ? 'Tugadi' : 'Yutqazdingiz') + '</span></div>' +
      '<div class="panel"><div class="stats">' + (r.endless ? '<span>To\'lqin</span><b>' + r.wave + (r.rec ? ' 🏅 REKORD!' : '') + '</b>' : '') + '<span>Tanga</span><b>+' + B.fmt(r.coins) + '</b><span>Olmos</span><b>+' + r.gems + '</b><span>Vaqt</span><b>' + B.mmss(r.time) + '</b><span>Kombo</span><b>' + r.maxCombo + '</b><span>Dushmanlar</span><b>' + r.kills + '</b></div></div>' +
      '<div class="row">' + (r.canRevive ? '<button class="bt purple" data-a="revive">💎 Tirilish (3)</button>' : '') + '<button class="bt red" data-a="retry">↻ Qayta urinish</button><button class="bt" data-a="shop">🛒 Do\'kon</button><button class="bt sm gray" data-a="quit">🏠</button></div>' +
      (r.endless && N.enabled() ? '<div class="hint" id="rk">' + (N.acc ? '🏆 Reytingga yuborilmoqda…' : '🏆 Reytingga qo\'shilish uchun <b style="color:#ffd23f">Taxallus</b> tanlang') + '</div>' : (r.canRevive ? '' : '<div class="hint">Maslahat: do\'konda qurolni kuchaytiring va jon darajasini oshiring.</div>')) + '</div>', 'dim2');
    if (r.endless && N.enabled()) N.submit(r).then(x => {
      const el = document.getElementById('rk'); if (!el) return;
      if (x && x.ok) el.innerHTML = '🏆 Reytingda: <b style="color:#ffd23f">#' + x.rank + '</b>' + (x.improved ? ' · yangi shaxsiy rekord!' : '') + ' <button class="bt sm purple" data-a="top" style="margin-left:.6em">Reyting</button>';
      else if (!N.acc) el.innerHTML = '🏆 Reytingga qo\'shilish uchun <button class="bt sm blue" data-a="prof">👤 Taxallus tanlash</button>';
      else el.textContent = x && x.err === 'cooldown' ? '🏆 Natija birozdan keyin yuboriladi' : x && x.err === 'net' ? '📴 Internet yo\'q — natija keyin yuboriladi' : '';
    });
  };

  // ---------- Sozlamalar ----------
  function showSettings(fr) {
    if (fr) from = fr; const s = S();
    const tog = (k, n) => '<div class="tog"><span>' + n + '</span><button class="bt sm ' + (s.set[k] ? 'green' : 'gray') + '" data-a="tog" data-v="' + k + '" style="min-width:calc(var(--u)*90)">' + (s.set[k] ? 'Yoqilgan' : 'O\'chiq') + '</button></div>';
    setOv('<div class="top"><button class="bt sm gray" data-a="' + (from === 'pause' ? 'pausebk' : 'main') + '">⬅ Orqaga</button><div class="row" style="gap:6px">' + pills() + '</div></div>' +
      '<div class="screen"><div class="banner"><span>Sozlamalar</span></div><div class="panel" style="display:flex;flex-direction:column;gap:calc(var(--u)*8);align-items:center">' +
      tog('snd', '🔊 Ovoz') + tog('vib', '📳 Tebranish') + tog('blood', '🩸 Qon') +
      '<div class="tog"><span>🎚 Qiyinlik</span><div class="chips">' + ['Oson', 'Oddiy', 'Qiyin'].map((n, i) => '<button class="bt sm ' + (s.diff === i ? 'green' : 'gray') + '" data-a="diff2" data-v="' + i + '">' + n + '</button>').join('') + '</div></div></div>' +
      '<div class="row"><button class="bt sm blue" data-a="offhelp">📶 Offline yordam</button><button class="bt sm gray" data-a="help">❓ Boshqaruv</button><button class="bt sm gray" data-a="fs">⛶ To\'liq ekran</button><button class="bt sm red" data-a="reset">' + (confirmReset ? 'Rostdan o\'chirilsinmi?' : '🗑 Progressni o\'chirish') + '</button></div></div>', 'dim2');
  }
  function showHelp(kind) {
    const off = kind === 'off';
    setOv('<div class="top"><button class="bt sm gray" data-a="set">⬅ Orqaga</button></div><div class="screen"><div class="banner"><span>' + (off ? 'Internetsiz o\'ynash' : 'Boshqaruv') + '</span></div><div class="panel"><div class="help">' + (off ?
      '<b>1.</b> Saytni Chrome\'da <b>oddiy oynada</b> oching (<b>Inkognito EMAS</b> — u yopilganda hamma narsa o\'chib ketadi!).<br><b>2.</b> Internet yoqiq holda bosh menyuda <b>«✔ Internetsiz ishlaydi»</b> yozuvi chiqquncha 5–20 soniya kuting.<br><b>3.</b> Chrome menyusi ⋮ → <b>«Установить приложение» / «Ilovani o\'rnatish»</b> (yoki «Bosh ekranga qo\'shish»). iPhone: Safari → Ulashish → «Ekranga qo\'shish».<br><b>Manzil:</b> o\'yin manzili oxirida <b>/</b> belgisi bilan bo\'lsin (masalan <b>.../jang2/</b>) — belgisiz manzil offline ochilmaydi.<br><b>4.</b> Endi samolyot rejimini yoqib, <b>bosh ekrandagi ikonkadan</b> oching — o\'yin internetsiz ochiladi.<br><b>Yangilanish:</b> GitHub\'ga yangi fayllar yuklangach, saytni bir marta internet bilan oching, ikkinchi ochilishda yangi versiya ishlaydi (chap pastda <b>2.0</b> yozuvi bo\'ladi).' :
      '<b>Telefonda:</b> chap pastda ◀ ▶ yurish. O\'ng pastda: <b>qizil</b> — hujum (3 marta ketma-ket bossangiz kombo, ushlab tursangiz davom etadi), <b>ko\'k</b> — sakrash, <b>yashil</b> — maxsus zarba (energiya sarflaydi, «x3» — nechta zarbaga yetadi), <b>binafsha</b> — dori.<br><b>Kompyuterda:</b> A D yoki ← → yurish · W / Space / K sakrash · J / Z hujum · L / X maxsus · U / C dori · P / Esc pauza · F to\'liq ekran · M ovoz.<br><b>Maslahat:</b> yerdagi qutilarni sindiring — ichidan tanga, dori, vaqtinchalik qurol chiqadi. Zarbalar ketma-ket bo\'lsa energiya to\'ladi. Bosslar: robot, vertolyot (sakrab uring!), katta dev va Qora samuray (qizil chiziq ko\'ringanda — yonga chiqing!). <b>Qalqonchi</b>ni oldidan urish foyda bermaydi: 3-zarbali kombo yoki maxsus zarba bilan qalqonini sindiring, yoki orqasidan uring. <b>Ninja</b> g\'oyib bo\'lib orqangizdan chiqadi.') + '</div></div></div>', 'dim2');
  }

  // ---------- O'yinni boshlash ----------
  let lastStart = { li: 0, endless: false };
  function startGame(li, endless) {
    lastStart = { li, endless: !!endless };
    if (B.touch && !fsDone && !document.fullscreenElement) { fsDone = true; try { B.toggleFS(); } catch (e) { } }
    B.startLevel(li, endless); hideOv();
  }

  // ---------- Bosish boshqaruvi ----------
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-a]'); if (!b) return; B.audioInit(); const a = b.dataset.a, v = b.dataset.v, s = S();
    B.sfx('click');
    switch (a) {
      case 'play': showLevels(); break;
      case 'main': if (B.isPlaying()) B.quitLevel(); B.menuScene(); showMain(); break;
      case 'lv': startGame(+v, false); break;
      case 'diff': s.diff = +v; B.persist(); showLevels(); break;
      case 'diff2': s.diff = +v; B.persist(); showSettings(); break;
      case 'endless': startGame(0, true); break;
      case 'shop': if (B.G.mode === 'menu' || from === 'levels') from = 'main'; showShop(); break;
      case 'tab': showShop(v); break;
      case 'buy': buyWeapon(v); break;
      case 'eq': s.eq = v; B.persist(); B.sfx('pick'); showShop(); break;
      case 'wup': { const c = wUp(v); if (s.coins < c) { toast('Tanga yetmaydi'); B.sfx('warn'); break; } s.coins -= c; s.wl[v] = (s.wl[v] || 1) + 1; B.persist(); B.sfx('buy'); showShop(); break; }
      case 'up': { const u = UPG[v], lv = s[v + 'L'], c = u.cost(lv); if (s.coins < c) { toast('Tanga yetmaydi'); B.sfx('warn'); break; } s.coins -= c; s[v + 'L']++; B.persist(); B.sfx('buy'); showShop(); break; }
      case 'pot': if (s.pot >= 9) break; if (s.coins < 70) { toast('Tanga yetmaydi'); B.sfx('warn'); break; } s.coins -= 70; s.pot++; B.persist(); B.sfx('buy'); showShop(); break;
      case 'heroes': showHeroes(); break;
      case 'hsel': s.hero = v; B.persist(); B.sfx('pick'); showHeroes(); break;
      case 'hbuy': buyHero(v); break;
      case 'hprev': cycleHero(-1); break;
      case 'hnext': cycleHero(1); break;
      case 'set': showSettings(B.G.mode === 'menu' ? 'main' : 'pause'); break;
      case 'tog': s.set[v] = s.set[v] ? 0 : 1; B.persist(); if (v === 'vib' && s.set.vib) B.buzz(40); showSettings(); break;
      case 'help': showHelp(); break;
      case 'offhelp': showHelp('off'); break;
      case 'fs': B.toggleFS(); break;
      case 'install': if (INST) { INST.prompt(); INST.userChoice.then(() => { INST = null; showMain(); }); } break;
      case 'reset': if (!confirmReset) { confirmReset = 1; showSettings(); setTimeout(() => { confirmReset = 0; }, 4000); } else { confirmReset = 0; B.S0 = B.defSave(); B.persist(); toast('Progress o\'chirildi'); showSettings(); } break;
      case 'resume': B.resume(); hideOv(); break;
      case 'pausebk': showPause(); break;
      case 'retry': startGame(lastStart.li, lastStart.endless); break;
      case 'next': startGame(Math.min(LV.length - 1, lastStart.li + 1), false); break;
      case 'revive': if (s.gems >= 3) { s.gems -= 3; B.persist(); B.revive(); hideOv(); B.sfx('potion'); } break;
      case 'quit': B.quitLevel(); showMain(); break;
      case 'top': showTop(); break;
      case 'prof': showProfile(); break;
      case 'daily': claimDaily(); break;
      case 'reg': doReg(b); break;
      case 'usecode': doUseCode(b); break;
      case 'ren': doRename(b); break;
      case 'newcode': doNewCode(b); break;
      case 'syncnow': doSyncNow(b); break;
      case 'logout': N.logout(); toast('Hisobdan chiqildi'); showProfile(); break;
    }
  });
  const val = id => ((document.getElementById(id) || {}).value || '').trim();
  const busyBtn = (b, f) => { b.classList.add('off'); return f().finally(() => b.classList.remove('off')); };
  function doReg(b) { const n = val('nick'); if (n.length < 2) { setMsg(ERR.name_bad); return; } setMsg('…', true); busyBtn(b, async () => { const r = await N.register(n); if (r.ok) { toast('Xush kelibsiz, ' + r.name + '!'); N.checkDaily(); showProfile('Tayyor! Natijalaringiz endi reytingga tushadi.', 'ok'); } else setMsg(errT(r)); }); }
  function doUseCode(b) { const c = val('code'); if (c.length < 6) { setMsg(ERR.code_bad); return; } setMsg('…', true); busyBtn(b, async () => { const r = await N.useCode(c); if (r.ok) { toast('Kirildi: ' + r.name); N.checkDaily(); showProfile('Ma\'lumotlaringiz yuklandi ✔', 'ok'); } else setMsg(errT(r)); }); }
  function doRename(b) { const n = val('nick'); if (n.length < 2) { setMsg(ERR.name_bad); return; } busyBtn(b, async () => { const r = await N.rename(n); if (r.ok) showProfile('Taxallus o\'zgardi ✔', 'ok'); else setMsg(errT(r)); }); }
  function doNewCode(b) { busyBtn(b, async () => { const r = await N.newCode(); const box = document.getElementById('codebox'); if (!box) return; if (r.ok) box.innerHTML = '<div class="codebig">' + r.code + '</div><div class="hint" style="margin:0">Boshqa telefonda: O\'yin → Taxallus → «KOD» maydoniga yozing. ' + Math.round(r.ttl / 60) + ' daqiqa amal qiladi.</div>'; else setMsg(errT(r)); }); }
  function doSyncNow(b) { setMsg('…', true); busyBtn(b, async () => { const r = await N.sync(true); showProfile(r && r.ok ? 'Saqlandi ✔' : errT(r), r && r.ok ? 'ok' : ''); }); }
  async function claimDaily() {
    const r = await N.claimDaily();
    if (r.ok && r.claimed) { B.sfx('buy'); toast('🎁 +' + r.reward.coins + ' tanga' + (r.reward.gems ? ' +' + r.reward.gems + ' olmos' : '') + ' · ' + r.streak + '-kun'); }
    else toast(r.ok ? 'Bugungi bonus olingan' : errT(r));
    if (scr === 'main') showMain();
  }
  // do'kondan chiqqanda pauzaga qaytish uchun
  
  // ---------- O'rnatish / yangilash ----------
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); INST = e; if (B.G.mode === 'menu' && document.getElementById('off')) showMain(); });
  addEventListener('appinstalled', () => { INST = null; });
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    const had = !!navigator.serviceWorker.controller;
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had && !B.isPlaying() && !window.__rl) { window.__rl = 1; location.reload(); } });
  }

  // ---------- Xavfsiz maydon, aylantirish, boshlash ----------
  const probe = document.createElement('div'); probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px)'; document.body.appendChild(probe);
  const baseResize = B.resize;
  B.resize = () => {
    baseResize(); const cs = getComputedStyle(probe), u = innerHeight / 540; B.safeL = (parseFloat(cs.paddingLeft) || 0) / u; B.safeR = (parseFloat(cs.paddingRight) || 0) / u;
    if (document.body.classList.contains('portrait') && B.isPlaying() && B.G.mode === 'play' && !B.G.paused) B.onPauseKey();
  };
  removeEventListener('resize', baseResize); addEventListener('resize', B.resize);
  if (window.matchMedia && matchMedia('(pointer:coarse)').matches) { B.touch = true; document.body.classList.add('touch'); }
  N.onChange = () => { if (scr === 'main') showMain(); toast('☁ Bulutdagi ma\'lumot yuklandi'); };
  N.onDaily = () => { if (scr === 'main') showMain(); };
  B.start(); showMain(); N.boot();
  window.addEventListener('pagehide', () => B.persist());
})();
