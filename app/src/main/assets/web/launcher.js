(() => {
'use strict';
const D = window.__LX; if (!D) return;
document.documentElement.classList.add('js');
const SHOT = location.hash === '#shot';
const N = window.Android || null, NAT = !!N;
const nj = (f, d, ...a) => { try { const r = N && N[f] ? N[f](...a) : null; return r ? JSON.parse(r) : d; } catch (e) { return d; } };
const ncall = (f, ...a) => { try { return N && N[f] ? N[f](...a) : undefined; } catch (e) { return undefined; } };
const ICO = 'https://appassets.androidplatform.net/icons/';
let RESUMED = true, RING = 'normal', ST = {}, PB = {}, PH = 800;
if (NAT) document.documentElement.classList.add('native');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const TH = D.theme;
let APP = {}, SORTED = [], PKG = {};
const CAT = {}; D.cats.forEach(([c, n, jp]) => CAT[c] = { c, n, jp });
const coll = new Intl.Collator('ru');
function loadApps() {
  const list = NAT ? nj('apps', []) : D.apps.map(a => [a[0], a[1], a[2], '', '', 0]);
  APP = {}; PKG = {};
  list.forEach(([id, n, c, ic, pkg, v]) => { if (!id) return; APP[id] = { id, n: n || id, c: CAT[c] ? c : 'srv', ic: ic || '', pkg: pkg || '', v: v || 0 }; if (pkg && !PKG[pkg]) PKG[pkg] = id; });
  SORTED = Object.keys(APP).sort((a, b) => coll.compare(APP[a].n, APP[b].n));
}
loadApps();
const MAXF = 6, KEY = NAT ? 'strelizia-launcher-1' : 'poco-franxx-09-v3', PKEY = NAT ? 'strelizia-prefs-1' : 'poco-franxx-09-prefs';
/* предпочтения: их меняют и лаунчер (быстрые настройки), и приложение «Стрелиция». Состояние (панель, заметка, яркость) живёт отдельно */
const DEFP = () => ({ shade: 'strel', fx: 'bal', down: 'shade', side: 'r', mode: 'cat', city: '', setup: false, isl: { on: false, shape: 'auto', style: 'neon', mus: true, chg: true, ntf: true },
  set: { sparks: true, scan: true, tilt: true, widget: true, sound: true, haptic: true, swipe: true, dtap: true, vault: true, anim: true, fast: false, bootUnlock: true, banners: true } });
const ENUM = { shade: ['strel', 'one'], fx: ['max', 'bal', 'eco'], down: ['shade', 'search'], side: ['l', 'r'], mode: ['cat', 'az'] };
const ISL_SH = ['auto', 'pill', 'drop', 'notch'], ISL_ST = ['neon', 'black'], CKEY = 'strelizia-cmd-1';
const islOf = v => { const d = DEFP().isl, o = v && typeof v === 'object' ? v : {}; return { on: typeof o.on === 'boolean' ? o.on : d.on, shape: ISL_SH.includes(o.shape) ? o.shape : d.shape, style: ISL_ST.includes(o.style) ? o.style : d.style, mus: o.mus !== false, chg: o.chg !== false, ntf: o.ntf !== false }; };
const PREF = Object.keys(DEFP());
const DEF = () => Object.assign({ fav: NAT ? nj('defaults', []).filter(id => APP[id]).slice(0, MAXF) : ['chats', 'camera', 'music', 'gallery', 'browser'], where: {}, hello: false, accAsked: false, wAsked: false, brt: 1, vol: .6, note: 'Не забыть: мёд для 02.\nВ 13:30 ангар, Хиро ждёт.',
  qs: { wifi: true, bt: false, torch: false, dnd: false, air: false, eco: false, rot: true, data: true }, tiles: null }, DEFP());
let S = DEF(), lastP = '';
function prefsOf() { const o = {}; PREF.forEach(k => { o[k] = S[k]; }); return o; }
function putPrefs(p) {
  const d = DEFP(); if (!p || typeof p !== 'object') p = {};
  if (p.shade === 'hyper') p = Object.assign({}, p, { shade: 'strel' });
  S.set = Object.assign(d.set, p.set && typeof p.set === 'object' ? p.set : {});
  for (const k in ENUM) S[k] = ENUM[k].includes(p[k]) ? p[k] : d[k];
  S.city = typeof p.city === 'string' ? p.city.slice(0, 60) : ''; S.setup = !!p.setup; S.isl = islOf(p.isl);
}
try {
  const s = JSON.parse(localStorage.getItem(KEY) || 'null'), p = JSON.parse(localStorage.getItem(PKEY) || 'null');
  if (s && typeof s === 'object') { const d = DEF(); S = Object.assign(d, s, { qs: Object.assign(d.qs, s.qs || {}), where: s.where && typeof s.where === 'object' ? s.where : {}, fav: Array.isArray(s.fav) ? s.fav : d.fav }); }
  putPrefs(p && typeof p === 'object' ? p : s); lastP = p ? JSON.stringify(prefsOf()) : '';
} catch (e) {}
const save = () => { try { const o = {}; for (const k in S) if (!PREF.includes(k)) o[k] = S[k]; localStorage.setItem(KEY, JSON.stringify(o)); const p = JSON.stringify(prefsOf()); if (p !== lastP) { lastP = p; localStorage.setItem(PKEY, p); } } catch (e) {} };
function sanitize() { S.fav = (S.fav || []).filter(id => APP[id]); if (!S.fav.length) S.fav = DEF().fav; }
sanitize();
const catOf = id => (S.where[id] && CAT[S.where[id]]) ? S.where[id] : (APP[id] ? APP[id].c : 'srv');
const buzz = (ms = 12) => { if (!S.set.haptic) return; if (NAT) { ncall('vibe', Math.round(ms)); return; } if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };
const vpat = p => { if (!S.set.haptic) return; if (NAT) { ncall('vibePattern', JSON.stringify(p)); return; } if (navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const mmss = t => Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0');
const ICON = id => { const a = APP[id]; if (a && NAT) { if (a.ic && D.mini[a.ic]) return D.mini[a.ic]; if (a.pkg) return `<img class="mi ni" src="${ICO}${encodeURIComponent(id)}.png?v=${a.v}" alt="" decoding="async" draggable="false">`; } return D.mini[id] || D.mini.settings; };
if (!D.mini.strelizia) D.mini.strelizia = '<svg class="mi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.6 16.9C7.9 12.8 5.8 9.6 2.1 7.3c1.35 3.4 2.5 6.4 3.2 9.6Z"/><path d="M15.4 16.9c.7-4.1 2.8-7.3 6.5-9.6-1.35 3.4-2.5 6.4-3.2 9.6Z"/><path d="M10.4 20h3.2"/></svg>';
const SVG = (p, w = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const I = { ck: SVG('<path d="m5 12.5 4.2 4.2L19 7"/>'), plus: SVG('<path d="M12 5v14M5 12h14"/>'), minus: SVG('<path d="M5 12h14"/>'), x: SVG('<path d="M6 6l12 12M18 6 6 18"/>'),
  open: SVG('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'), move: SVG('<path d="M3 7.3a1.8 1.8 0 0 1 1.8-1.8h4.3l2 2.3h8.1A1.8 1.8 0 0 1 21 9.6v8.1a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 17.7Z"/><path d="m11 13.5 2 2 2-2M13 15.5V10"/>'),
  go: SVG('<path d="m9 6 6 6-6 6"/>'), back: SVG('<path d="m15 6-6 6 6 6"/>'),
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5Z"/></svg>', pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5.5" width="3.8" height="13"/><rect x="13.7" y="5.5" width="3.8" height="13"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 6v12L9 12Z"/><rect x="6" y="6" width="2.2" height="12"/></svg>', next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.5 6v12L15 12Z"/><rect x="15.8" y="6" width="2.2" height="12"/></svg>',
  wifi: SVG('<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.4a9.5 9.5 0 0 1 13 0M8.6 15.7a5 5 0 0 1 6.8 0"/><circle cx="12" cy="19" r="1" fill="currentColor"/>'), bt: SVG('<path d="m7 7.5 10 9-5 4.5v-18l5 4.5-10 9"/>'),
  torch: SVG('<path d="M8 3h8v4l-2 3v10a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V10L8 7Z"/><path d="M12 13v2"/>'), moon: SVG('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>'),
  air: SVG('<path d="M10.5 3.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V9l7.5 4.5V16l-7.5-2.3V18l2.2 1.7V22L12 21l-3.7 1v-2.3l2.2-1.7v-4.3L3 16v-2.5L10.5 9Z"/>'),
  eco: SVG('<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19c3-4 6-6 9-7.5"/>'), sun: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>'),
  fp: SVG('<path d="M6.6 5.3A8.2 8.2 0 0 1 18.9 7.6"/><path d="M4.4 9.6A8.3 8.3 0 0 0 4 12.2c0 1.6.3 3.1.9 4.5"/><path d="M8 9.2a4.7 4.7 0 0 1 8.7 2.4c0 2.4-.3 4.6-1.1 6.7"/><path d="M7.3 12.4c0 2.9-.6 5.3-1.8 7.2"/><path d="M12 11.6c0 3.6-.6 6.6-2.1 9.1"/><path d="M19.9 11.2c.1.5.1 1 .1 1.5 0 2.6-.3 5-1.1 7.2"/>', 1.3),
  info: SVG('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.2"/>'), trash: SVG('<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>'), down: SVG('<path d="m6 9 6 6 6-6"/>'),
  link: SVG('<path d="M4 12h5M15 12h5"/><circle cx="12" cy="12" r="3"/>'), heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.7 3.8 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.9 1.3-1.8 2.9-2.9 4.9-2.9 3.3 0 5.5 3.2 4.3 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z"/></svg>',
  horns: '<svg viewBox="0 0 64 30" fill="rgba(255,43,58,.18)" stroke="#ff2b3a" stroke-width="1.6" stroke-linejoin="round"><path d="M23 28C21 17 15.5 8.5 5.5 2.5c3.6 9 6.6 17 8.6 25.5Z"/><path d="M41 28c2-11 7.5-19.5 17.5-25.5-3.6 9-6.6 17-8.6 25.5Z"/></svg>' };
const plural = (n, a, b, c) => { const m = n % 100, k = n % 10; return m > 10 && m < 20 ? c : k === 1 ? a : k > 1 && k < 5 ? b : c; };

/* ───────── sounds (synthesised, no files) ───────── */
let AC = null;
const ac = () => { if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { AC = new C(); } catch (e) { return null; } } if (AC.state === 'suspended') AC.resume().catch(() => {}); return AC; };
function tone(f0, f1, dur, type = 'sine', g = .05, delay = 0) {
  const a = AC; if (!a || a.state !== 'running') return; const t = a.currentTime + delay, o = a.createOscillator(), gn = a.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(g, t + .012); gn.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(gn).connect(a.destination); o.start(t); o.stop(t + dur + .03);
}
const SND = {
  tap: () => tone(1900, 1900, .03, 'square', .01), open: () => tone(420, 900, .16, 'triangle', .035), close: () => tone(760, 360, .14, 'triangle', .03),
  launch: () => { tone(220, 1320, .7, 'sawtooth', .014); tone(440, 880, .45, 'sine', .028, .08); }, ok: () => { tone(988, 988, .12, 'sine', .045); tone(1319, 1319, .22, 'sine', .045, .1); },
  notify: () => { tone(1175, 1175, .09, 'sine', .05); tone(1568, 1568, .16, 'sine', .05, .11); }, darling: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, .2, 'sine', .04, i * .085)),
  alert: () => { for (let i = 0; i < 3; i++) { tone(620, 990, .34, 'sawtooth', .022, i * .44); tone(990, 620, .1, 'sawtooth', .016, i * .44 + .34); } },
  lock: () => tone(660, 200, .24, 'triangle', .04), unlock: () => { tone(330, 990, .3, 'triangle', .035); tone(1320, 1320, .14, 'sine', .04, .27); },
  sync: () => tone(300, 1250, 1.4, 'sine', .022), sig: () => [523, 784, 1047].forEach((f, i) => tone(f, f * 1.01, .4, 'triangle', .03, i * .12)) };
const snd = k => { if (S.set.sound && SND[k] && RING === 'normal' && RESUMED) try { SND[k](); } catch (e) {} };

/* ───────── time ───────── */
const WD = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
const WDS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const MON = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const cap = s => s[0].toUpperCase() + s.slice(1);
function tok(k, d) {
  switch (k) {
    case 'wd': return WD[d.getDay()]; case 'Wd': return cap(WD[d.getDay()]); case 'WD': return WD[d.getDay()].toUpperCase();
    case 'wds': return WDS[d.getDay()]; case 'WDS': return WDS[d.getDay()].toUpperCase();
    case 'd': return String(d.getDate()); case 'mon': return MON[d.getMonth()]; case 'MON': return MON[d.getMonth()].toUpperCase();
  }
  return k;
}
const fmt = (f, d) => f.replace(/[A-Za-z]+/g, k => tok(k, d));
const PHASE = h => h >= 5 && h < 11 ? ['起動', 'BOOT'] : h >= 11 && h < 17 ? ['出撃', 'SORTIE'] : h >= 17 && h < 23 ? ['接続', 'LINK'] : ['比翼の鳥', 'PAIR'];
let lastMin = -1;
function hud(jp, en) { $$('[data-hud=jp]').forEach(e => e.textContent = jp); $$('[data-hud=en]').forEach(e => e.textContent = en); }
function tick(force) {
  const d = new Date(), m = d.getHours() * 60 + d.getMinutes();
  if (!force && m === lastMin) return;
  const changed = lastMin !== -1 && m !== lastMin; lastMin = m;
  const H = String(d.getHours()).padStart(2, '0'), M = String(d.getMinutes()).padStart(2, '0');
  $$('[data-k]').forEach(el => { const k = el.dataset.k, v = k === 'h' ? H : k === 'm' ? M : H + ':' + M; if (el.textContent !== v) el.textContent = v; });
  $$('[data-d]').forEach(el => { const v = fmt(el.dataset.d, d); if (el.textContent !== v) el.textContent = v; });
  if (!(P && (P.classList.contains('love') || P.classList.contains('alert-on')))) hud(...PHASE(d.getHours()));
  if (P) { paintCal(d); paintPair(d); }
  if (changed && P) { restart(P, 'tickf', 700); if (has('locked')) drift(); }
}
const restart = (el, c, ms) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); clearTimeout(el['_' + c]); el['_' + c] = setTimeout(() => el.classList.remove(c), ms); };

/* ───────── battery & device ───────── */
let bat = { level: .82, charging: false };
function paintBat() {
  const pc = Math.round(bat.level * 100);
  $$('[data-bat]').forEach(e => e.textContent = pc); $$('[data-batp]').forEach(e => e.textContent = pc + '%');
  $$('.sb .bf').forEach(r => r.setAttribute('width', (16.8 * clamp(bat.level, .05, 1)).toFixed(1)));
  if (P) { P.classList.toggle('chg', bat.charging); $$('[data-chg]', P).forEach(e => e.textContent = bat.charging ? ' · заряжается' : ''); }
}
if (!NAT && !SHOT && navigator.getBattery) navigator.getBattery().then(b => { const u = () => { bat = { level: b.level, charging: b.charging }; paintBat(); }; u(); b.addEventListener('levelchange', u); b.addEventListener('chargingchange', u); }).catch(() => {});
const DEV = SHOT ? { cores: 8, mem: '8 ГБ', net: '4G' } : { cores: navigator.hardwareConcurrency || 8, mem: navigator.deviceMemory ? (navigator.deviceMemory >= 8 ? '8+ ГБ' : navigator.deviceMemory + ' ГБ') : '8 ГБ',
  net: navigator.connection && navigator.connection.effectiveType ? navigator.connection.effectiveType.toUpperCase() : (navigator.onLine ? 'ONLINE' : 'OFFLINE') };

/* ───────── music (visual player, OST names) ───────── */
const TR = [['Kiss of Death', 'Mika Nakashima × HYDE', 219], ['Torikago', 'XX:me', 254], ['Manatsu no Setsuna', 'XX:me', 262], ['Hitorigoto', 'XX:me', 266], ['Beautiful World', 'XX:me', 250], ['Escape', 'XX:me', 248], ['Darling', 'XX:me', 279]];
let mus = { on: false, play: false, i: 0, t: 0 };
let MD = { on: false }, mdAt = 0, mdHide = '';
function loadMedia() { if (!NAT) return; MD = nj('media', { on: false }) || { on: false }; mdAt = performance.now(); if (mdHide && MD.t !== mdHide) mdHide = ''; paintMus(); }
function paintMus() {
  if (!P) return; let n, a, d, t;
  if (NAT) {
    const live = !!(MD.on && MD.t && MD.t !== mdHide); mus.on = live; mus.play = !!(live && MD.play);
    n = MD.on ? MD.t : (MD.perm ? 'Музыка не играет' : 'Нужен доступ к уведомлениям');
    a = MD.on ? (MD.a || MD.app || '') : (MD.perm ? 'включи трек в любом плеере' : 'настройки лаунчера, раздел Android');
    d = (MD.d || 0) / 1000; t = ((MD.pos || 0) + (MD.play ? performance.now() - mdAt : 0)) / 1000; if (d > 0) t = Math.min(t, d);
    $$('[data-mapp]', P).forEach(e => e.textContent = MD.on ? (MD.app || 'плеер') : 'плеер');
  } else { [n, a, d] = TR[mus.i]; t = mus.t; }
  P.classList.toggle('mp-on', mus.on); P.classList.toggle('mp-play', mus.play);
  $$('[data-mt]', P).forEach(e => e.textContent = n); $$('[data-ma]', P).forEach(e => e.textContent = a);
  $$('[data-mpb]', P).forEach(e => e.style.transform = `scaleX(${d > 0 ? clamp(t / d, 0, 1).toFixed(4) : 0})`); $$('[data-mtm]', P).forEach(e => e.textContent = d > 0 ? mmss(t) + ' / ' + mmss(d) : '');
  $$('[data-act=mp-play]', P).forEach(b => b.innerHTML = mus.play ? I.pause : I.play);
}
setInterval(() => { if (NAT) { if (mus.play && RESUMED && P) paintMus(); return; } if (!mus.play) return; mus.t++; if (mus.t >= TR[mus.i][2]) { mus.i = (mus.i + 1) % TR.length; mus.t = 0; } paintMus(); }, 1000);
function musAct(k) {
  if (NAT) { const c = { 'mp-play': 'toggle', 'mp-next': 'next', 'mp-prev': 'prev' }[k]; if (c) { ncall('mediaCmd', c); buzz(8); snd('tap'); setTimeout(loadMedia, 350); setTimeout(loadMedia, 1300); } if (k === 'mp-x') { mdHide = MD.t || ''; paintMus(); } return; }
  if (k === 'mp-play') { mus.on = true; mus.play = !mus.play; buzz(8); snd('tap'); }
  if (k === 'mp-next') { mus.on = true; mus.i = (mus.i + 1) % TR.length; mus.t = 0; snd('tap'); }
  if (k === 'mp-prev') { mus.on = true; if (mus.t > 3) mus.t = 0; else { mus.i = (mus.i + TR.length - 1) % TR.length; mus.t = 0; } snd('tap'); }
  if (k === 'mp-x') { mus.on = false; mus.play = false; }
  paintMus();
}

/* ───────── stage ───────── */
const stage = $('#stage'); let P = null, scale = 1, fx = null;
const has = c => P && P.classList.contains(c);
function fit() {
  if (!P) return; const r = stage.getBoundingClientRect();
  if (NAT && r.width > 0) {
    const h = Math.round(clamp(360 * r.height / r.width, 640, 980)); scale = r.width / 360;
    if (h !== PH || !P.style.height) { PH = h; P.style.height = h + 'px'; P.style.setProperty('--ph', h + 'px'); placeSig(); }
  } else scale = Math.min(r.width / 360, r.height / 800) || 1;
  P.style.transform = `translate(-50%,-50%) scale(${scale})`; if (fx) fx.resize(); if (NAT) requestAnimationFrame(exclusion);
}
function placeSig() { const g = P && $('.home .sig', P); if (!g) return; const k = Math.max(360 / 1080, PH / 2400), ox = (360 - 1080 * k) / 2, oy = (PH - 2400 * k) / 2; g.style.left = (ox + 870 * k - 32).toFixed(1) + 'px'; g.style.top = (oy + 1170 * k - 37).toFixed(1) + 'px'; }
function exclusion() {
  if (!NAT || !P) return; const R = [];
  if (has('o-ns') || has('o-cc')) { const pr = P.getBoundingClientRect(), t = Math.round(pr.top + pr.height * .32); R.push([pr.left, t, pr.left + 36, t + 200], [pr.right - 36, t, pr.right, t + 200]); }
  else { const rl = $('.home .rail', P); if (!rl) return; const r = rl.getBoundingClientRect(); R.push([r.left - 8, r.top, r.right + 8, r.bottom]); }
  ncall('exclude', JSON.stringify(R));
}
window.addEventListener('resize', () => { const a = document.activeElement; if (!(a && /INPUT|TEXTAREA/.test(a.tagName) && P && P.contains(a))) fit(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape') back(); });

const SC = { chats: [['Написать Хиро', 'ДИАЛОГ С ХИРО'], ['Новая группа', 'ОТРЯД 13']], camera: [['Селфи', 'ФРОНТАЛЬНАЯ КАМЕРА'], ['Видео', 'ЗАПИСЬ 4K']],
  music: [['Продолжить', 'play'], ['Случайный трек', 'shuffle']], gallery: [['Последнее фото', 'ПОСЛЕДНЕЕ ФОТО'], ['Альбомы', 'АЛЬБОМЫ']], browser: [['Новая вкладка', 'НОВАЯ ВКЛАДКА'], ['Инкогнито', 'РЕЖИМ ИНКОГНИТО']],
  phone: [['Позвонить Хиро', 'ВЫЗОВ: ХИРО']], mail: [['Новое письмо', 'НОВОЕ ПИСЬМО']], maps: [['Домой · Плантация 13', 'МАРШРУТ: ПЛАНТАЦИЯ 13']], anime: [['Продолжить серию', 'СЕРИЯ 15 · 比翼の鳥']],
  notes: [['Новая заметка', 'НОВАЯ ЗАМЕТКА']], calendar: [['Сегодня', 'СОБЫТИЯ НА СЕГОДНЯ']], clock: [['Будильник 06:30', 'БУДИЛЬНИК']], video: [['Продолжить', 'ПРОДОЛЖИТЬ ПРОСМОТР']] };
const NOTE0 = [{ id: 'mail1', app: 'mail', t: 'ПОЧТА · ПАПА', s: 'Отчёт о синхронизации отряда 13', tm: '20:41' }, { id: 'cal1', app: 'calendar', t: 'КАЛЕНДАРЬ', s: 'Завтра 09:00 · тренировка пилотов', tm: '19:00' }];
let notes = NOTE0.slice(), badges = { mail: 1, calendar: 1 };

const stRow = (act, a, b, st) => `<div class="row" data-act="${act}"><span>${a}<small>${b}</small></span><b class="st" data-stv="${st}">›</b></div>`;
const NSET = (tog, lnk) => `<div class="sec"><h4>Android</h4>${stRow('n-def', 'Лаунчер по умолчанию', 'кнопка «Домой» ведёт сюда', 'def')}${stRow('n-notif', 'Доступ к уведомлениям', 'счётчики, шторка, мини-плеер', 'notif')}${stRow('n-acc', 'Блокировка двойным тапом', 'служба в спецвозможностях', 'acc')}${stRow('n-cal', 'Календарь', 'события на сегодня в App Vault', 'cal')}${stRow('n-loc', 'Геолокация для погоды', 'или впиши город ниже', 'loc')}
 <div class="row city"><span>Город для погоды<small>Open-Meteo, без ключей</small></span><input class="cityi" type="text" placeholder="Казань" value="${esc(S.city || '')}" autocomplete="off" spellcheck="false" enterkeyhint="done"></div>
 ${stRow('n-write', 'Системная яркость', 'чтобы ползунок в шторке работал', 'write')}${stRow('n-batt', 'Батарея без ограничений', 'чтобы HyperOS не выгружал лаунчер', 'batt')}${lnk('n-auto', 'Автозапуск', 'HyperOS: держит службы живыми')}${lnk('n-wp', 'Обои 09 на экран блокировки', 'и в системные обои')}${lnk('n-dream', 'Заставка AOD', 'неоновые часы при зарядке')}</div>
 <div class="sec"><h4>Запуск</h4>${tog('fast', 'Быстрый запуск', 'кольцо синхронизации вдвое короче')}${tog('bootUnlock', 'Загрузка после разблокировки', 'STRELIZIA SYSTEM 起動')}${tog('banners', 'Плашки уведомлений', 'сверху, пока открыт рабочий стол')}</div>
 <div class="sec"><h4>Демо</h4>${lnk('notify', 'Тестовое сообщение', 'плашка от Хиро')}${lnk('alert', 'Тревога клаксозавров', 'красный HUD и сирена')}${lnk('darling', 'Сказать «ダーリン»', 'то же, что тап по часам')}</div>`;
const HELLO = () => `<section class="sht s-hello"><i class="grip"></i><div class="sht-hd"><b>Стрелиция</b><em>первый запуск</em></div><div class="sht-sc"><p class="hello-p">Пара шагов, и лаунчер заработает в полную силу. Всё это потом есть в настройках: удержи пустое место на обоях.</p>
 ${stRow('n-def', '1. Сделать рабочим столом', 'чтобы «Домой» открывал Стрелицию', 'def')}${stRow('n-notif', '2. Доступ к уведомлениям', 'счётчики, шторка, мини-плеер', 'notif')}${stRow('n-acc', '3. Блокировка двойным тапом', 'служба в спецвозможностях', 'acc')}${stRow('n-cal', '4. Календарь', 'события на сегодня', 'cal')}${stRow('n-loc', '5. Погода', 'геолокация или город в настройках', 'loc')}</div><button class="btn" data-act="hello-done">Готово</button></section>`;
/* ───────── шторки в духе HyperOS: слева уведомления, справа пункт управления ───────── */
const HSI = {
  grid: SVG('<rect x="4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.8"/>'),
  data: SVG('<path d="M7.5 19.5V5.5M4 9l3.5-3.5L11 9M16.5 4.5v14M13 15l3.5 3.5L20 15"/>'),
  vol: SVG('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  rot: SVG('<path d="M5 11.5a7 7 0 0 1 12-4.9L19 8.5"/><path d="M19 4.5v4h-4"/><path d="M19 12.5a7 7 0 0 1-12 4.9L5 15.5"/><path d="M5 19.5v-4h4"/>'),
  lk: SVG('<rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>'),
  shot: SVG('<path d="M4 8.5v-3A1.5 1.5 0 0 1 5.5 4h3M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3"/>'),
  spark: SVG('<path d="M12 3.5c.7 4.4 2.6 6.4 7 7.2-4.4.8-6.3 2.8-7 7.3-.7-4.5-2.6-6.5-7-7.3 4.4-.8 6.3-2.8 7-7.2Z"/><path d="M18.5 16.5v4M16.5 18.5h4"/>'),
  scan: SVG('<path d="M3.5 12h17"/><path d="M5 7.5V5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5v2M5 16.5v2A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-2"/>'),
  tilt: SVG('<rect x="7.5" y="3.5" width="9" height="17" rx="2" transform="rotate(14 12 12)"/><path d="M3 9.5a9 9 0 0 0 0 5M21 9.5a9 9 0 0 1 0 5"/>'),
  note: SVG('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  vib: SVG('<rect x="8" y="4" width="8" height="16" rx="1.8"/><path d="M4.5 8.5v7M2 10.5v3M19.5 8.5v7M22 10.5v3"/>'),
  pwr: SVG('<path d="M12 3.5v8"/><path d="M7 6.5a7.5 7.5 0 1 0 10 0"/>'),
  nset: SVG('<path d="M14.6 8.7A4.9 4.9 0 0 0 5 9.6v3.6L3.4 16.4h8.4"/><path d="M7.6 19.2a2.2 2.2 0 0 0 3.8 0"/><circle cx="17.4" cy="16.2" r="2"/><path d="M17.4 12.4v1.5M17.4 18.5V20M14.1 14.3l1.3.75M19.4 17.35l1.3.75M14.1 18.1l1.3-.75M19.4 15.05l1.3-.75"/>'),
  edit: SVG('<path d="M14.5 5.5l4 4L8.5 19.5h-4v-4L14.5 5.5Z"/><path d="M12.5 7.5l4 4"/>'),
  bell: SVG('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15L6 16.5Z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'),
  abr: SVG('<circle cx="12" cy="12" r="4.6"/><path d="M12 3v1.6M12 19.4V21M3 12h1.6M19.4 12H21M5.6 5.6l1.2 1.2M17.2 17.2l1.2 1.2M5.6 18.4l1.2-1.2M17.2 6.8l1.2-1.2"/><path d="M10.3 14.2 12 9.8l1.7 4.4M10.9 12.8h2.2"/>'),
  loc: SVG('<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>'),
  hot: SVG('<circle cx="12" cy="12.5" r="1.6"/><path d="M8.6 15.9a4.8 4.8 0 0 1 0-6.8M15.4 9.1a4.8 4.8 0 0 1 0 6.8M5.8 18.7a8.8 8.8 0 0 1 0-12.4M18.2 6.3a8.8 8.8 0 0 1 0 12.4"/>'),
  nfc: SVG('<rect x="4.5" y="4.5" width="15" height="15" rx="2.5"/><path d="M9 15.5v-7l6 7v-7"/>'),
  cast: SVG('<path d="M3.5 8V6.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14"/><path d="M3.5 12a7.5 7.5 0 0 1 7.5 7.5M3.5 15.5a4 4 0 0 1 4 4"/>'),
  dark: SVG('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17Z" fill="currentColor"/>'),
  eye: SVG('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>'),
  bat: SVG('<rect x="6.5" y="4.5" width="11" height="16" rx="2"/><path d="M10 3h4M12 9.5v6M9 12.5h6"/>'),
  dsv: SVG('<path d="M12 3.5a8.5 8.5 0 1 1-8.1 6"/><path d="M12 8.5v7M8.5 12h7"/>'),
  vpn: SVG('<path d="M12 3.5l7 3v5c0 4.4-3 7.9-7 9-4-1.1-7-4.6-7-9v-5l7-3Z"/><path d="M9.5 12l1.8 1.8 3.4-3.6"/>'),
  alarm: SVG('<circle cx="12" cy="13" r="7"/><path d="M12 9.5V13l2.5 1.8M4.5 5.5l3-2.5M19.5 5.5l-3-2.5"/>'),
  timer: SVG('<circle cx="12" cy="13.5" r="7"/><path d="M12 13.5V10M10 3h4M18.2 7.3l1.3-1.3"/>'),
  calc: SVG('<rect x="5.5" y="3.5" width="13" height="17" rx="2"/><path d="M8.5 7.5h7M8.5 11.5h1M11.5 11.5h1M14.5 11.5h1M8.5 14.5h1M11.5 14.5h1M14.5 14.5h1M8.5 17.5h1M11.5 17.5h4"/>'),
  cam: SVG('<path d="M4.5 8.5h3L9 6h6l1.5 2.5h3A1.5 1.5 0 0 1 21 10v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-8a1.5 1.5 0 0 1 1.5-1.5Z"/><circle cx="12" cy="13.5" r="3.5"/>'),
  qr: SVG('<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/><path d="M8 12h8"/>'),
  rec: SVG('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6" fill="currentColor"/>'),
  wallet: SVG('<rect x="3.5" y="6" width="17" height="12.5" rx="2"/><path d="M3.5 10h17M7 15h3"/>'),
  inv: SVG('<path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0c0-4.3 6-10.5 6-10.5Z"/><path d="M12 20V3.5"/>')
};
const HS = () => `<div class="hs"><i class="hs-bg"><i class="hs-wp wp09"></i></i>
<section class="hs-p hs-n"><header class="hs-hd"><span class="hs-tm"><b data-k="hm">20:02</b><small data-d="Wd, d mon"></small></span><button class="hs-b" data-act="hs-nset" aria-label="Настройки уведомлений">${HSI.nset}</button></header>
 <div class="hs-nl"></div><button class="hs-x" data-act="nclear" aria-label="Очистить всё">${I.x}</button><i class="hs-ht">← пункт управления · уведомление вправо, чтобы убрать</i></section>
<section class="hs-p hs-c"><header class="hs-hd"><span class="hs-tm"><b data-k="hm">20:02</b><small><span data-d="Wd, d mon"></span> · <span data-batp>82%</span><span data-chg></span></small></span><button class="hs-b" data-act="tiles" aria-label="Изменить плитки">${HSI.edit}</button><button class="hs-b" data-act="hs-sset" aria-label="Настройки телефона">${D.mini.settings}</button></header>
 <div class="hs-big"><button class="hb" data-act="hs-net">${HSI.data}<span><b>Мобильная сеть</b><small data-hsv="net">…</small></span></button><button class="hb" data-q="wifi">${I.wifi}<span><b>Wi-Fi</b><small data-hsv="wifi">…</small></span></button></div>
 <div class="hs-mid"><div class="hs-mu"><div class="hs-mt" data-act="hs-mus"><i class="hs-ma">${ICON('music')}</i><span><b data-mt></b><small data-ma></small></span></div><div class="hs-mc"><button data-act="mp-prev" aria-label="Назад">${I.prev}</button><button data-act="mp-play" aria-label="Играть">${I.play}</button><button data-act="mp-next" aria-label="Дальше">${I.next}</button></div></div>
  <div class="vs" data-vs="brt" aria-label="Яркость"><i class="vs-f"></i><i class="vs-i">${I.sun}</i></div><div class="vs" data-vs="vol" aria-label="Громкость"><i class="vs-f"></i><i class="vs-i">${HSI.vol}</i></div></div>
 <div class="hs-tg"></div>
 <i class="hs-ht">свайп вправо · уведомления</i></section></div>`;
const SHV = [['strel', 'Стрелиция', 'две панели'], ['one', 'Классика', 'одна панель']];
const FXV = [['max', 'Максимум', '60 к/с'], ['bal', 'Баланс', '30 к/с'], ['eco', 'Эко', 'без искр']];
const SHN = { strel: '', one: '' }, FXN = { max: '', bal: '', eco: '' };
const QT = [['sparks', 'Искры', HSI.spark], ['scan', 'Сканер', HSI.scan], ['tilt', 'Параллакс', HSI.tilt], ['sound', 'Звуки', HSI.note], ['haptic', 'Вибрация', HSI.vib], ['bootUnlock', 'Загрузка', HSI.pwr]];
const shMini = v => `<i class="shm shm-${v} wp09"><i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i><i class="e"></i></i>`;
const QUICK = () => `<section class="sht s-quick"><i class="grip"></i><div class="sht-hd"><b>Настройки</b></div><div class="sht-sc">
 <h4 class="qk-h">Шторка</h4><div class="qk-sh">${SHV.map(([v, n, d]) => `<button class="qk-c" data-shv="${v}">${shMini(v)}<b>${n}</b><small>${d}</small></button>`).join('')}</div>
 <h4 class="qk-h">Режим</h4><div class="qk-fx">${FXV.map(([v, n, d]) => `<button class="qk-f" data-fxv="${v}"><i class="fxm fxm-${v}"><i></i><i></i><i></i><i></i><i></i><i></i></i><b>${n}</b><small>${d}</small></button>`).join('')}</div>
 <h4 class="qk-h">Эффекты</h4><div class="qk-tg">${QT.map(([k, n, ic]) => `<button class="qt" data-tog="${k}">${ic}<span>${n}<small></small></span></button>`).join('')}</div>
 <h4 class="qk-h">Жесты</h4>
 <div class="row"><span>Свайп вниз</span><div class="seg sm" data-seg="down"><i class="k"></i><button data-down="shade">Шторка</button><button data-down="search">Поиск</button></div></div>
 <div class="row"><span>Панель</span><div class="seg sm" data-seg="side"><i class="k"></i><button data-side="l">Слева</button><button data-side="r">Справа</button></div></div>
 <div class="qk-ln"><button data-act="edit">${I.move}<span>Порядок</span></button><button data-act="add">${I.plus}<span>Добавить</span></button><button data-act="tiles">${HSI.edit}<span>Плитки</span></button><button data-act="lock">${HSI.lk}<span>Блокировка</span></button></div>
 ${NAT ? '' : `<h4 class="qk-h">Демо</h4><div class="qk-ln"><button data-act="notify">${HSI.bell}<span>Сообщение</span></button><button data-act="alert">${HSI.pwr}<span>Тревога</span></button><button data-act="darling">${HSI.note}<span>ダーリン</span></button><button data-act="unfs">${I.x}<span>Свернуть</span></button></div>`}
</div><button class="btn" data-act="allset">Все настройки</button></section>`;
/* плитки пункта управления: всё, что обычно есть в шторке телефона.
   q: переключатели лаунчера, a: действия, t: переключает сам Android, o: открывает нужный экран телефона */
const TILES = {
  bt: ['Bluetooth', I.bt, 'q'], torch: ['Фонарик', I.torch, 'q'], dnd: ['Не беспокоить', I.moon, 'q'], air: ['Полёт', I.air, 'q'], rot: ['Автоповорот', HSI.rot, 'q'], eco: ['Эко-режим', I.eco, 'q'],
  lock: ['Блокировка', HSI.lk, 'a'], shot: ['Скриншот', HSI.shot, 'a'], ring: ['Звук', HSI.bell, 't'], abright: ['Автояркость', HSI.abr, 't'],
  loc: ['Геолокация', HSI.loc, 'o'], hot: ['Точка доступа', HSI.hot, 'o'], nfc: ['NFC', HSI.nfc, 'o'], cast: ['Трансляция', HSI.cast, 'o'], dark: ['Тёмная тема', HSI.dark, 'o'], night: ['Защита зрения', HSI.eye, 'o'],
  saver: ['Экономия энергии', HSI.bat, 'o'], datasaver: ['Экономия трафика', HSI.dsv, 'o'], vpn: ['VPN', HSI.vpn, 'o'], alarm: ['Будильник', HSI.alarm, 'o'], timer: ['Таймер', HSI.timer, 'o'], calc: ['Калькулятор', HSI.calc, 'o'],
  cam: ['Камера', HSI.cam, 'o'], qr: ['Сканер QR', HSI.qr, 'o'], rec: ['Запись экрана', HSI.rec, 'o'], wallet: ['Кошелёк', HSI.wallet, 'o'], invert: ['Инверсия цветов', HSI.inv, 'o']
};
const TDEF = ['bt', 'torch', 'dnd', 'air', 'eco', 'rot', 'lock', 'shot'];
const RINGN = { normal: 'Звук', vibrate: 'Вибрация', silent: 'Без звука' };
const TEDIT = () => `<section class="sht s-tiles"><i class="grip"></i><div class="sht-hd"><b>Плитки</b></div><div class="sht-sc">
 <h4 class="qk-h">Активные</h4><p class="te-n">Удержи плитку и перетащи, чтобы поменять порядок</p><div class="te-g te-on"></div>
 <h4 class="qk-h">В запасе</h4><div class="te-g te-off"></div>
</div><div class="te-bt"><button class="te-rs" data-act="te-reset">Сбросить</button><button class="btn" data-act="te-done">Готово</button></div></section>`;
let VOL = .6, volDrag = false, volT = 0, volLast = 0;
const volSend = () => { const now = Date.now(); if (now - volLast < 70) { clearTimeout(volT); volT = setTimeout(volSend, 75); return; } volLast = now; ncall('setVolume', VOL); };
function hsPaint() {
  if (!P) return; const set = (k, v) => $$('[data-hsv=' + k + ']', P).forEach(e => { if (e.textContent !== v) e.textContent = v; });
  set('wifi', S.qs.wifi && !S.qs.air ? (NAT ? 'вкл' : 'Plantation-13') : 'выкл');
  set('net', S.qs.air ? 'режим полёта' : NAT ? 'настройки сети' : (S.qs.data ? 'Отряд 13 · 5G' : 'выкл'));
  $$('.hb[data-act=hs-net]', P).forEach(b => b.classList.toggle('on', !S.qs.air && (NAT || S.qs.data)));
  $$('.vs', P).forEach(vs => { const v = vs.dataset.vs === 'brt' ? clamp(S.brt, .02, 1) : clamp(VOL, 0, 1), f = $('.vs-f', vs); if (f) f.style.transform = 'scaleY(' + v.toFixed(3) + ')'; vs.classList.toggle('lo', v < .16); });
}
function hsSwitch(to) {
  const from = to === 'cc' ? 'ns' : 'cc'; if (!has('o-' + from)) return; hsReset();
  P.classList.remove('o-' + from, 'hs-l', 'hs-r'); void P.offsetWidth; P.classList.add('o-' + to, to === 'cc' ? 'hs-r' : 'hs-l'); stack[stack.length - 1] = to;
  renderNotes(); hsPaint(); hsStagger(to); buzz(6); snd('tap'); clearTimeout(P._hsw); P._hsw = setTimeout(() => P && P.classList.remove('hs-l', 'hs-r'), 460);
}
// карточки и плитки появляются лесенкой только при открытии тапом или кнопкой.
// Если шторку вытянули пальцем, они уже на экране: повторное появление и было тем самым миганием
let hsNoSt = false;
function hsStagger(n) {
  const hs = $('.hs', P); if (!hs) return;
  $$('.hs-nl > .hs-i', P).forEach((el, i) => el.style.setProperty('--i', String(Math.min(i, 12))));
  hs.classList.remove('st-n', 'st-c'); void hs.offsetWidth; hs.classList.add(n === 'cc' ? 'st-c' : 'st-n');
  clearTimeout(hs._st); hs._st = setTimeout(() => hs.classList.remove('st-n', 'st-c'), 1000);
}
function hsReset() {
  const hs = P && $('.hs', P); if (!hs) return; clearTimeout(hs._sw);
  hs.classList.remove('sw', 'rel', 'to-c', 'to-n', 'nt'); hs.style.removeProperty('--sx');
}
// свайп между шторками: текущая уезжает за пальцем, соседняя въезжает с другого края, как в HyperOS
function hsSw(to, dx) {
  const hs = $('.hs', P); if (!hs) return; const W = P.clientWidth || 393;
  if (!hs.classList.contains('sw')) { hs.classList.remove('st-n', 'st-c', 'rel'); hs.classList.add('sw', to === 'cc' ? 'to-c' : 'to-n'); if (to === 'ns') renderNotes(); else hsPaint(); if (NAT && to === 'cc') { loadQS(); loadMedia(); } }
  const x = to === 'cc' ? clamp(dx, -W, 0) : clamp(dx, 0, W);
  hs.style.setProperty('--sx', x.toFixed(1) + 'px');
}
function hsSwEnd(go) {
  const hs = $('.hs', P); if (!hs || !hs.classList.contains('sw')) return;
  const toC = hs.classList.contains('to-c'), W = P.clientWidth || 393;
  hs.classList.add('rel'); void hs.offsetWidth; hs.style.setProperty('--sx', (go ? (toC ? -W : W) : 0) + 'px');
  if (go) { buzz(6); snd('tap'); }
  clearTimeout(hs._sw); hs._sw = setTimeout(() => {
    if (!hs.classList.contains('sw')) return;
    hs.classList.add('nt');
    const to = toC ? 'cc' : 'ns', from = toC ? 'ns' : 'cc';
    if (go && has('o-' + from)) { P.classList.remove('o-' + from, 'hs-l', 'hs-r'); P.classList.add('o-' + to); if (stack.length && (stack[stack.length - 1] === 'ns' || stack[stack.length - 1] === 'cc')) stack[stack.length - 1] = to; if (to === 'ns') renderNotes(); }
    hs.classList.remove('sw', 'rel', 'to-c', 'to-n'); hs.style.removeProperty('--sx');
    void hs.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(() => hs.classList.remove('nt')));
  }, 300);
}
// горизонтальное движение пальца по открытой шторке.
// В уведомлениях: вправо по карточке смахивает её, влево где угодно (и по карточкам тоже) открывает пункт управления.
// В пункте управления: вправо возвращает к уведомлениям
function hsMove(st, p, dx, dy) {
  const now = performance.now(), dt = now - st.lt; if (dt > 4) { st.vx = st.vx * .35 + ((p.x - st.lx) / dt) * .65; st.lx = p.x; st.lt = now; }
  if (!st.lock) { if (Math.hypot(dx, dy) < 10) return; st.lock = Math.abs(dx) > Math.abs(dy) * 1.1 ? 'h' : 'v'; }
  if (st.lock !== 'h') return;
  const ns = has('o-ns');
  if (!st.mode) st.mode = ns && st.nli && dx > 0 ? (st.nli.classList.contains('nc') ? 'rub' : 'card') : (ns ? dx < 0 : dx > 0) ? 'sw' : 'no';
  if (st.mode === 'card' || st.mode === 'rub') {
    const el = st.nli, x = st.mode === 'rub' ? dx * .22 : dx < 0 ? dx * .2 : dx;
    el.style.transition = 'none'; el.style.translate = x.toFixed(1) + 'px 0'; el.style.opacity = st.mode === 'rub' ? '' : String(1 - Math.min(.75, Math.max(0, x) / 260)); return;
  }
  if (st.mode === 'sw') hsSw(ns ? 'cc' : 'ns', dx);
}
function hsUp(s0, dx) {
  const v = s0.vx || 0;
  if (s0.mode === 'card' || s0.mode === 'rub') {
    const el = s0.nli;
    if (s0.mode === 'card' && (dx > 96 || (dx > 34 && v > .45))) { dismissNote(el.dataset.id, el, 1); return; }
    el.style.transition = ''; el.style.translate = ''; el.style.opacity = '';
    if (s0.mode === 'rub' && dx > 30) toast('Это уведомление смахнуть нельзя'); return;
  }
  if (s0.mode === 'sw') hsSwEnd(Math.abs(dx) > 80 || (Math.abs(dx) > 26 && Math.abs(v) > .4 && Math.sign(v) === Math.sign(dx)));
}
function hsDrag(side, k) {
  const hs = $('.hs', P); if (!hs) return;
  if (!hs.classList.contains('drag')) { setExp(false); hideNtf(); renderNotes(); hsPaint(); if (NAT) { loadQS(); loadNotifs(); } hs.classList.add('drag', side === 'ns' ? 'dn' : 'dc'); if (fx) fx.wake(); }
  hs.style.setProperty('--k', k.toFixed(3));
}
function hsDragEnd(side, open) {
  const hs = $('.hs', P); if (!hs) return;
  if (open) { hsNoSt = true; try { openOv(side); } finally { hsNoSt = false; } } else snd('close');
  hs.classList.remove('drag', 'dn', 'dc'); hs.style.removeProperty('--k');
}
function paintQuick() {
  if (!P) return;
  $$('[data-shv]', P).forEach(b => b.classList.toggle('on', b.dataset.shv === S.shade));
  $$('[data-fxv]', P).forEach(b => b.classList.toggle('on', b.dataset.fxv === S.fx));
  $$('[data-shn]', P).forEach(e => { e.textContent = SHN[S.shade]; }); $$('[data-fxn]', P).forEach(e => { e.textContent = FXN[S.fx]; });
  syncTogs();
}
const SET_IC = () => { const s = roleId('settings'); return s ? ICON(s) : D.mini.settings; };
function openSettingsApp(page, el) {
  const from = stack.length ? null : el || null;
  const go = () => {
    const o = { name: 'Стрелиция', icon: D.mini.strelizia, lbl: 'STRELIZIA × НАСТРОЙКИ', sub: 'ВСЕ НАСТРОЙКИ ЛАУНЧЕРА' };
    if (NAT) {
      if (N && typeof N.openSettings === 'function') { launch('strelizia', from, Object.assign(o, { run: () => ncall('openSettings', page || '') })); return; }
      toast('Приложение настроек появится после обновления APK'); return;
    }
    launch('strelizia', from, Object.assign(o, { then: () => { location.href = 'settings.html' + (page ? '#page=' + page : ''); } }));
  };
  if (stack.length) closeAll(() => setTimeout(go, 90)); else go();
}
/* системный экран телефона с той же загрузкой, что и у приложений */
function openSys(k, name) { launch('settings', null, { name, icon: SET_IC(), lbl: 'STRELIZIA × ' + String(name).toUpperCase(), run: () => ncall('panel', k) }); }
function openPlayer(el) { const id = (MD.p && PKG[MD.p]) || roleId('music') || 'music'; launch(id, el, { name: MD.app || (APP[id] ? APP[id].n : 'Музыка'), icon: ICON(id), run: () => ncall('mediaCmd', 'open') }); }
function openNote(nid, el) {
  const n = notes.find(x => String(x.id) === String(nid)), id = n && n.app ? n.app : '';
  launch(id || 'chats', el || null, { name: (n && (n.an || (APP[id] && APP[id].n))) || 'Уведомление', icon: id ? ICON(id) : (D.mini.chats || D.mini.settings), run: () => ncall('openNotif', nid) });
}
/* шторка открывается та, что выбрана: две панели Стрелиции или классическая */
function openShade(side) { const go = () => { if (S.shade === 'one') openOv('shade'); else openOv(side === 'cc' ? 'cc' : 'ns'); }; if (stack.length) closeAll(() => setTimeout(go, 120)); else go(); }

/* ───────── плитки пункта управления ───────── */
let TS = {}, teFrom = null;
const tilesOf = a => { const r = (Array.isArray(a) ? a : TDEF).filter((k, i, s) => TILES[k] && s.indexOf(k) === i); return r.length ? r : TDEF.slice(); };
const tileAt = k => { const t = TILES[k]; return t[2] === 'q' ? `data-q="${k}"` : t[2] === 'a' ? `data-act="hs-${k}"` : `data-act="tile" data-t="${k}"`; };
const ccTile = (k, i) => `<button class="hq" ${tileAt(k)} data-tk="${k}" style="--i:${i}"><i>${TILES[k][1]}</i><span>${TILES[k][0]}</span></button>`;
const qHtml = k => `<button class="q" ${tileAt(k)} data-tk="${k}">${TILES[k][1]}<span>${TILES[k][0]}<small></small></span></button>`;
function renderTiles() {
  if (!P) return; S.tiles = tilesOf(S.tiles);
  const g = $('.hs-tg', P); if (g) g.innerHTML = S.tiles.map(ccTile).join('');
  const q = $('.shade .qs', P); if (q) q.innerHTML = S.tiles.slice(0, 6).map(qHtml).join('');
  applyFlags(); paintTiles();
}
function paintTiles() {
  if (!P) return; const ring = TS.ring || RING || 'normal';
  $$('[data-tk]', P).forEach(b => {
    const k = b.dataset.tk, t = TILES[k]; if (!t || t[2] === 'q' || t[2] === 'a') return;
    const v = k === 'ring' ? ring !== 'normal' : !!TS[k]; b.classList.toggle('on', v);
    const sp = $('span', b); if (k === 'ring' && sp && sp.firstChild && sp.firstChild.nodeType === 3) sp.firstChild.nodeValue = RINGN[ring] || 'Звук';
    const sm = $('small', b); if (sm) sm.textContent = k in TS || k === 'ring' ? (v ? 'вкл' : 'выкл') : '';
  });
}
function loadTiles() { if (!NAT) return; const t = nj('tiles', null); if (t && typeof t === 'object') { TS = Object.assign(TS, t); if (typeof t.ring === 'string') RING = t.ring; } paintTiles(); }
function tileTap(k, el) {
  const t = TILES[k]; if (!t) return; buzz(8); snd('tap');
  if (!NAT) {
    if (t[2] === 't') { if (k === 'ring') TS.ring = { normal: 'vibrate', vibrate: 'silent', silent: 'normal' }[TS.ring || 'normal']; else TS[k] = !TS[k]; paintTiles(); toast(k === 'ring' ? RINGN[TS.ring] : t[0] + (TS[k] ? ' включена' : ' выключена')); return; }
    toast('На телефоне откроется: ' + t[0].toLowerCase()); return;
  }
  if (t[2] === 't') { if (ncall('tile', k) === false) toast(k === 'abright' ? 'Разреши «Изменение настроек» и нажми ещё раз' : 'Разреши доступ к «Не беспокоить» и нажми ещё раз'); setTimeout(loadTiles, 250); return; }
  const go = () => launch('tile-' + k, null, { name: t[0], icon: '<i class="lx-tl">' + t[1] + '</i>', lbl: 'STRELIZIA × ' + t[0].toUpperCase(), run: () => ncall('tile', k) });
  if (stack.length) backThen(go); else go();
}
function openTiles() { teFrom = has('o-cc') ? 'cc' : has('o-shade') ? 'one' : null; const go = () => openOv('tiles'); if (stack.length) closeAll(() => setTimeout(go, 140)); else go(); }
function teDone() { const f = teFrom; teFrom = null; back(); if (f) setTimeout(() => openShade('cc'), 360); }
const teHtml = (k, on) => on
  ? `<div class="hq te" data-te="${k}"><i>${TILES[k][1]}</i><span>${TILES[k][0]}</span><button class="te-b" data-act="te-rm" data-k="${k}" aria-label="Убрать">${I.minus}</button></div>`
  : `<button class="hq te" data-te="${k}" data-act="te-add" data-k="${k}"><i>${TILES[k][1]}</i><span>${TILES[k][0]}</span><b class="te-b">${I.plus}</b></button>`;
function renderTE() {
  if (!P) return; S.tiles = tilesOf(S.tiles); const on = $('.te-on', P), off = $('.te-off', P); if (!on || !off) return;
  on.innerHTML = S.tiles.map(k => teHtml(k, true)).join('');
  const rest = Object.keys(TILES).filter(k => !S.tiles.includes(k));
  off.innerHTML = rest.length ? rest.map(k => teHtml(k, false)).join('') : '<p class="te-e">Все плитки уже в работе</p>';
}
function teAct(k, key) {
  if (k === 'te-add' && TILES[key] && !S.tiles.includes(key)) { S.tiles.push(key); buzz(8); snd('tap'); }
  if (k === 'te-rm' && key) { if (S.tiles.length <= 1) { toast('Оставь хотя бы одну плитку'); return; } S.tiles = S.tiles.filter(x => x !== key); buzz(8); }
  if (k === 'te-reset') { S.tiles = TDEF.slice(); toast('Плитки как после установки'); }
  save(); renderTE(); renderTiles();
}
/* перетаскивание в «Активных»: удержание, потом плитка едет за пальцем, остальные расступаются */
function bindTE() {
  const box = P && $('.te-on', P); if (!box || box._b) return; box._b = 1; let d = null;
  const place = (cx, cy) => {
    const pr = P.getBoundingClientRect(); d.g.style.left = ((cx - pr.left) / scale - d.ox) + 'px'; d.g.style.top = ((cy - pr.top) / scale - d.oy) + 'px';
    const hit = document.elementFromPoint(cx, cy), t = hit && hit.closest ? hit.closest('.te-on .te') : null;
    if (t && t !== d.el) { const ks = [...box.children], a = ks.indexOf(d.el), b = ks.indexOf(t); box.insertBefore(d.el, a < b ? t.nextSibling : t); buzz(4); }
  };
  const start = () => {
    const el = d.el, r = el.getBoundingClientRect(); d.on = true; buzz(12);
    const g = el.cloneNode(true); g.classList.add('te-gh'); g.style.width = (r.width / scale) + 'px'; P.appendChild(g); d.g = g; el.classList.add('ph');
    d.ox = (d.x - r.left) / scale; d.oy = (d.y - r.top) / scale; place(d.x, d.y);
  };
  box.addEventListener('pointerdown', e => {
    const el = e.target.closest('.te'); if (!el || e.target.closest('.te-b')) return; e.stopPropagation();
    d = { el, x: e.clientX, y: e.clientY, on: false, id: e.pointerId }; d.t = setTimeout(() => { if (d && !d.on) { try { box.setPointerCapture(d.id); } catch (_) {} start(); } }, 260);
  });
  box.addEventListener('pointermove', e => { if (!d) return; if (!d.on) { if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) { clearTimeout(d.t); d = null; } return; } e.preventDefault(); place(e.clientX, e.clientY); });
  const up = () => { if (!d) return; clearTimeout(d.t); if (d.on) { d.g.remove(); d.el.classList.remove('ph'); S.tiles = tilesOf([...box.children].map(c => c.dataset.te)); save(); renderTiles(); P.__swallow = Date.now(); } d = null; };
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  box.addEventListener('touchmove', e => { if (d && d.on) e.preventDefault(); }, { passive: false });
}

/* команды из приложения «Стрелиция»: порядок панели, добавление, сброс, плитки */
let cmdAt = 0; try { cmdAt = +(localStorage.getItem('strelizia-cmd-done') || 0); } catch (e) {}
function runCmd() {
  let c = null; try { c = JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) {}
  if (!c || !c.k || !(c.at > cmdAt) || Date.now() - c.at > 120000) return;
  cmdAt = c.at; try { localStorage.setItem('strelizia-cmd-done', String(cmdAt)); } catch (e) {}
  setTimeout(() => { if (c.k === 'edit') closeAll(() => openOv('edit')); else if (c.k === 'add') closeAll(() => openOv('add')); else if (c.k === 'reset') { S.fav = DEF().fav; save(); renderRail(); toast('Панель сброшена'); } else if (c.k === 'tiles') openTiles(); }, 380);
}
/* островок рисует Android поверх всех приложений: передаём ему настройки */
let islLast = '';
function islPush() { if (!NAT) return; const j = JSON.stringify(S.isl || islOf(null)); if (j === islLast) return; islLast = j; ncall('island', j); }

function build() {
  const tog = (k, a, b) => `<div class="row" data-tog="${k}"><span>${a}<small>${b}</small></span><i class="tog${S.set[k] ? ' on' : ''}"></i></div>`;
  const lnk = (act, a, b, cls = '') => `<div class="row${cls}" data-act="${act}"><span>${a}<small>${b}</small></span><b>›</b></div>`;
  const q = (k, ic, a, b) => `<button class="q${S.qs[k] ? ' on' : ''}" data-q="${k}">${ic}<span>${a}<small>${b}</small></span></button>`;
  const mpc = `<button class="mpb" data-act="mp-prev" aria-label="Назад">${I.prev}</button><button class="mpb pl" data-act="mp-play" aria-label="Играть">${I.play}</button><button class="mpb" data-act="mp-next" aria-label="Дальше">${I.next}</button>`;
  stage.innerHTML = `<div class="scr t09 side-${S.side}" id="P">
<div class="wp wp09"></div><canvas class="fxc"></canvas><i class="scan"></i>
<div class="home">${TH.home}<i class="sig" data-act="sig"><i class="sg"></i></i>
 <div class="mp"><button class="mp-i" data-act="mp-open">${ICON('music')}</button><div class="mp-t" data-act="mp-open"><b data-mt></b><span data-ma></span><i class="mp-bar"><i data-mpb></i></i></div>${mpc}<button class="mpb x" data-act="mp-x" aria-label="Закрыть">${I.x}</button></div></div>
<div class="vault"><div class="v-in">
 <header class="v-hd"><b>App Vault</b><span>ПИЛОТ 002 · <span data-d="WDS · d MON"></span></span></header>
 <section class="vc v-pl" style="--i:0"><h5><i>01/</i>Пилоты <span class="jp">比翼の鳥</span></h5>
  <div class="pl-n"><span><b>ZERO TWO</b><small>CODE:002 · PISTIL</small></span><em>×</em><span class="r"><b>HIRO</b><small>CODE:016 · STAMEN</small></span></div>
  <div class="pl-w"><canvas class="plc"></canvas><b data-sync2>98%</b></div>
  <button class="hold" data-hold><i class="hold-r"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17"/><circle class="hr" cx="20" cy="20" r="17"/></svg>${I.heart}</i><span><b class="hold-t">Удержи для синхронизации</b><small class="hold-s">シンクロ率 · ждём обоих пилотов</small></span></button>
  <small class="pl-tm">в паре сегодня <b data-pair>2 ч 14 мин</b></small></section>
 <section class="vc v-wx" style="--i:1"><h5><i>02/</i>Погода <span data-wxn>${NAT ? '' : 'Плантация 13'}</span></h5><div class="wx-n"><b data-wxt>+1°</b><span><span data-wxd>облачно</span><small data-wxs>ветер 4 м/с · ощущается −3°</small></span></div><div class="wx-h"></div><div class="wx-cta"></div></section>
 <section class="vc v-cal" style="--i:2"><h5><i>03/</i>Календарь <span data-d="MON"></span></h5><div class="cal-w"></div><ul class="cal-e"></ul></section>
 <section class="vc v-mu" style="--i:3"><h5><i>04/</i>Музыка <span data-mapp>${NAT ? 'плеер' : 'OST · DARLING in the FRANXX'}</span></h5><div class="vm"><span class="ti">${ICON('music')}</span><span class="vm-t"><b data-mt></b><small data-ma></small></span></div>
  <i class="mp-bar big"><i data-mpb></i></i><div class="vm-c"><small data-mtm>0:00</small><span>${mpc}</span></div></section>
 <section class="vc v-no" style="--i:4"><h5><i>05/</i>Заметка <span>сохраняется сама</span></h5><textarea class="note" rows="3" spellcheck="false">${esc(S.note)}</textarea></section>
 <section class="vc v-sy" style="--i:5"><h5><i>06/</i>Система <span data-model>POCO</span></h5><div class="sy-g">${NAT ? '<span><small>Заряд</small><b data-batp>…</b></span><span><small>Память свободно</small><b data-ram>…</b></span><span><small>Хранилище свободно</small><b data-sto>…</b></span><span><small>Сеть</small><b data-net>…</b></span>' : `<span><small>Заряд</small><b data-batp>82%</b></span><span><small>Ядра</small><b>${DEV.cores}</b></span><span><small>Память</small><b>${DEV.mem}</b></span><span><small>Сеть</small><b>${DEV.net}</b></span>`}</div></section>
 <p class="v-ht">свайп влево: назад</p></div></div>
<div class="ntf" data-act="ntf"><i class="ntf-ic">${ICON('chats')}</i><div class="ntf-b"><b>ХИРО · ЧАТЫ</b><span>Встретимся в ангаре 13? Жду у Стрелиции</span></div><em>сейчас</em></div>
<div class="alert"><i class="al-fr"></i><div class="al-bd"><span>警報 · KLAXOSAUR · 警報 · KLAXOSAUR · 警報 · KLAXOSAUR · 警報 · KLAXOSAUR · 警報 · KLAXOSAUR · </span></div>
 <div class="al-c"><b>警報 · Тревога</b><span>Клаксозавры класса «Конрад» · 3 цели · сектор 13</span><div class="al-b"><button data-act="al-go">На вылет</button><button data-act="al-x">Отбой</button></div></div></div>
<div class="drw"><div class="drw-bg"></div><div class="drw-deco">${TH.deco}</div>
 <div class="drw-in"><header class="drw-hd">
  <div class="drw-tt"><b>Приложения</b><span class="cnt"></span><button class="gear" data-act="set" aria-label="Настройки">${D.mini.settings}</button></div>
  <label class="srch">${D.mini.search}<input type="text" placeholder="Поиск: название или категория" autocomplete="off" spellcheck="false" enterkeyhint="go"><button class="clr" data-act="clr" aria-label="Очистить">×</button></label>
  <div class="seg" data-seg="mode"><i class="k"></i><button data-mode="cat">Категории</button><button data-mode="az">А–Я</button></div>
  <div class="chips">${[['all', 'Все']].concat(D.cats.map(c => [c[0], c[1]])).map(([c, n]) => `<button class="chip${c === 'all' ? ' on' : ''}" data-cat="${c}">${n}</button>`).join('')}</div>
  <div class="sres"></div>
 </header><div class="drw-ls"><div class="egg"></div><div class="grid"></div></div></div>
 <nav class="abc"></nav><div class="bub"></div></div>
<div class="scrim" data-act="back"></div>
<section class="sht s-add"><i class="grip"></i><div class="sht-hd"><b>Панель</b><em></em></div><div class="sht-sc"><div class="sgrid"></div></div><button class="btn" data-act="back">Готово</button></section>
<section class="sht s-app"><i class="grip"></i><div class="sa"></div></section>${NAT ? HELLO() : ''}${QUICK()}${TEDIT()}
<div class="qa"></div>
<button class="edone" data-act="edone">Готово</button>
<div class="lx"><u></u><i class="sl"></i><div class="ring"><svg viewBox="0 0 180 180"><circle class="r0" cx="90" cy="90" r="80"/><circle class="r1" cx="90" cy="90" r="80"/><circle class="r2" cx="90" cy="90" r="88"/></svg></div><s class="lbl"></s><b class="pct">0%</b><em class="sub"></em><div class="lx-ic"></div></div>
<section class="appv"></section>
<div class="shade"><div class="sd-top"><b class="sd-clk" data-k="hm">20:02</b><span><span data-d="Wd, d mon"></span><small><span data-batp>82%</span><span data-chg></span></small></span><button class="gear" data-act="tiles" aria-label="Изменить плитки">${HSI.edit}</button><button class="gear" data-act="set" aria-label="Настройки">${D.mini.settings}</button></div>
 <div class="qs"></div>
 <div class="brt"><i class="brt-ic">${I.sun}</i><div class="brt-tr"><i class="brt-f"></i><i class="brt-k"></i></div></div>
 <div class="nl"><h6><span>Уведомления</span><button data-act="nclear">Очистить</button></h6><div class="nl-ls"></div></div><i class="sd-grip"></i></div>${HS()}
<div class="tst"></div>${NAT ? '' : D.sb + '<i class="gest"></i>'}
<div class="lock"><div class="aod"><i class="a-hr">${I.horns}</i><div class="a-clk"><b data-k="h">20</b><b data-k="m">02</b></div><div class="a-dt"><span data-d="WDS · d MON"></span> · <span data-batp>82%</span><span data-chg></span></div><div class="a-nt"></div></div>
 <div class="fp"><i class="fp-r"><svg viewBox="0 0 70 70"><circle cx="35" cy="35" r="31"/><circle class="fr" cx="35" cy="35" r="31"/></svg></i>${I.fp}</div><p class="a-ht">дважды тапни, свайпни вверх или удержи отпечаток</p></div>
<div class="boot"><div class="bt-in"><p style="--i:0"><b>STRELIZIA SYSTEM</b><i></i><b>起動</b></p><p style="--i:1">PISTIL 002<i></i><b>OK</b></p><p style="--i:2">STAMEN 016<i></i><b>OK</b></p><p style="--i:3">神経接続 · NEURAL LINK<i></i><b>100%</b></p></div><i class="bt-sl"></i></div>
<i class="torch"></i><i class="dim"></i></div>`;
  P = $('#P', stage);
  if (TH.widget) $$(TH.widget, P).forEach(el => el.setAttribute('data-w', ''));
  $$('.sync svg rect', P).forEach((r, j) => r.style.setProperty('--j', j));
  renderTiles(); applyFlags(); segPos(); renderRail(); renderNotes(); paintQuick(); paintWx(); paintMus(); paintBat(); paintBrt(); fit(); tick(true); bind(); bindTE(); islPush();
  if (fx) fx.stop(); fx = sparks($('.fxc', P), $('.plc', P)); fit();
}
const ECO = () => !!(S.qs.eco || S.fx === 'eco');
function applyFlags() {
  const c = P.classList, eco = ECO();
  c.toggle('noanim', !S.set.anim); c.toggle('nowidget', !S.set.widget); c.toggle('noscan', !S.set.scan || eco);
  c.toggle('torch-on', !NAT && S.qs.torch); c.toggle('dnd', S.qs.dnd); c.toggle('air', S.qs.air); c.toggle('eco', eco); c.toggle('wifioff', !S.qs.wifi || S.qs.air);
  c.toggle('fx-max', S.fx === 'max' && !eco); c.toggle('fx-bal', S.fx === 'bal' && !eco); c.toggle('fx-eco', eco);
  c.toggle('sh-hyper', false); c.toggle('sh-strel', S.shade !== 'one');
  $$('[data-q]', P).forEach(b => b.classList.toggle('on', !!S.qs[b.dataset.q]));
  hsPaint(); if (fx) fx.wake();
}
/* всё, что зависит от предпочтений: после смены в быстрых настройках или в приложении «Стрелиция» */
function syncTogs() { $$('[data-tog]', P).forEach(r => { const on = !!S.set[r.dataset.tog], t = $('.tog', r); if (t) t.classList.toggle('on', on); if (r.classList.contains('qt')) { r.classList.toggle('on', on); const s = $('small', r); if (s) s.textContent = on ? 'вкл' : 'выкл'; } }); }
function syncUI(sideCh, modeCh) {
  if (!P) return;
  applyFlags(); syncTogs(); paintQuick();
  if (sideCh) { P.classList.remove('side-l', 'side-r'); P.classList.add('side-' + S.side); renderRail(); }
  segPos(); if (modeCh && has('o-drw')) renderList();
  if (fx) fx.resize();
}
function reloadPrefs(ext) {
  let p = ext && typeof ext === 'object' ? ext : null;
  if (!p) { try { p = JSON.parse(localStorage.getItem(PKEY) || 'null'); } catch (e) { p = null; } }
  if (!p || typeof p !== 'object') return false;
  const before = JSON.stringify(prefsOf()), city0 = S.city, side0 = S.side, mode0 = S.mode, setup0 = S.setup;
  putPrefs(p); const after = JSON.stringify(prefsOf()); lastP = after;
  if (ext) { try { localStorage.setItem(PKEY, after); } catch (e) {} }
  if (S.setup && !setup0 && !S.hello) { S.hello = true; save(); if (has('o-hello')) back(); }
  islPush(); if (before === after) return false;
  syncUI(side0 !== S.side, mode0 !== S.mode);
  if (city0 !== S.city) { const ci = $('.cityi', P); if (ci) ci.value = S.city; loadWx(true); }
  return true;
}
function segPos() {
  const sg = (k, v, on) => $$('[data-seg=' + k + ']', P).forEach(m => { m.style.setProperty('--k', on ? 1 : 0); $$('button', m).forEach(b => b.classList.toggle('on', b.dataset[k] === v)); });
  sg('mode', S.mode, S.mode === 'az'); sg('side', S.side, S.side === 'r'); sg('down', S.down, S.down === 'search');
}
function enter() {
  P.classList.remove('enter'); void P.offsetWidth; P.classList.add('enter');
  $$('.home>*:not(.rail)', P).forEach((el, i) => { el.style.setProperty('--d', 140 + i * 70); el.setAttribute('data-in', ''); });
  setTimeout(() => P && P.classList.remove('enter'), 1700);
}

/* ───────── rail ───────── */
const bcount = id => NAT ? ((APP[id] && PB[APP[id].pkg]) || 0) : (badges[id] || 0);
const bdg = id => { const n = bcount(id); return n ? `<i class="bdg">${n > 9 ? '9+' : n}</i>` : ''; };
function renderRail(o = {}) {
  const rail = $('.home .rail', P), box = $('.apps', rail);
  box.innerHTML = S.fav.filter(id => APP[id]).map(id => `<a class="app" data-app="${esc(id)}">${ICON(id)}${bdg(id)}<i class="x" data-act="rm"></i><span class="lb">${esc(APP[id].n)}</span></a>`).join('');
  const add = $('.add', rail), all = $('.all', rail);
  if (!$('.lb', add)) add.insertAdjacentHTML('beforeend', '<span class="lb">Добавить</span>');
  if (!$('.lb', all)) all.insertAdjacentHTML('beforeend', '<span class="lb">Все приложения</span>');
  if (!$('.rxbg', rail)) rail.insertAdjacentHTML('afterbegin', '<i class="rxbg"></i>');
  $$('.add,.app,.all', rail).forEach((el, i) => el.style.setProperty('--i', i));
  P.style.setProperty('--rx', S.side === 'l' ? '-26px' : '26px');
  if (NAT) requestAnimationFrame(exclusion);
}
const nope = () => { const r = P && $('.home .rail', P); if (r) restart(r, 'nope', 450); };
function setExp(on) { if (!P) return; if (on && !has('exp')) { buzz(8); snd('open'); } P.classList.toggle('exp', on); }

/* ───────── drawer ───────── */
let cat = 'all', q = '';
const hl = name => { if (!q) return esc(name); const i = name.toLowerCase().indexOf(q); return i < 0 ? esc(name) : esc(name.slice(0, i)) + '<mark>' + esc(name.slice(i, i + q.length)) + '</mark>' + esc(name.slice(i + q.length)); };
const tileHtml = (id, i, o = {}) => `<button class="tile${o.sel ? ' sel' : ''}" data-app="${esc(id)}" style="--i:${Math.min(i, 32)}"><span class="ti">${ICON(id)}${o.ck ? '<i class="ck">' + I.ck + '</i>' : bdg(id)}</span><span class="tl">${hl(APP[id].n)}</span></button>`;
const rowHtml = (id, i) => { const on = S.fav.includes(id); return `<button class="arow" data-app="${esc(id)}" style="--i:${Math.min(i, 32)}"><span class="ti">${ICON(id)}${bdg(id)}</span><span class="an">${hl(APP[id].n)}<small>${CAT[catOf(id)].n} · ${CAT[catOf(id)].jp}</small></span><i class="pin${on ? ' on' : ''}" data-act="pin" data-id="${esc(id)}">${on ? I.ck : I.plus}</i></button>`; };
const matches = id => { const c = CAT[catOf(id)]; return APP[id].n.toLowerCase().includes(q) || c.n.toLowerCase().includes(q) || c.jp.includes(q); };
const EGGS = [
  { k: ['002', '02', 'zero two', 'zero', 'зеро', 'зеро ту', 'ноль два', 'зеро ту'], t: 'CODE:002 · ZERO TWO', s: 'Нашёл её код. Стрелиция к вылету готова', b: 'Сказать ダーリン', a: 'darling' },
  { k: ['016', 'хиро', 'hiro'], t: 'CODE:016 · HIRO', s: 'Напарник Zero Two, сейчас на связи', b: 'Написать Хиро', a: 'chat' },
  { k: ['дарлинг', 'darling', 'милый', 'дорогой', 'ダーリン'], t: 'ダーリン', s: 'Она тебя услышала', b: 'Ещё раз', a: 'darling' },
  { k: ['клаксозавр', 'klaxosaur', 'klaxo', 'тревога'], t: '警報 · KLAXOSAUR', s: 'Поднять отряд 13 по тревоге?', b: 'Тревога', a: 'alert' },
  { k: ['стрелиция', 'strelizia', 'франкс', 'franxx', 'fxx'], t: 'FXX-01 · STRELIZIA', s: 'Пилоты 002 и 016, синхронизация 100%', b: 'Разбудить эмблему', a: 'sig' },
  { k: ['мёд', 'мед', 'honey'], t: 'МЁД ДЛЯ 02', s: 'Её любимое. Уже записано в заметке', b: 'Открыть заметку', a: 'note' }];
const eggOf = s => s && EGGS.find(e => e.k.some(k => k === s || (s.length >= 3 && k.startsWith(s))));
function renderList() {
  let h = '', i = 0, n = 0; const L = [];
  const mode = q ? 'search' : S.mode; P.dataset.view = mode;
  const eg = mode === 'search' ? eggOf(q) : null;
  $('.egg', P).innerHTML = eg ? `<div class="egc"><i class="eg-hr">${I.horns}</i><b>${eg.t}</b><span>${eg.s}</span><button data-act="egg" data-a="${eg.a}">${eg.b}</button></div>` : '';
  if (mode === 'search') {
    const ids = SORTED.filter(matches); n = ids.length;
    h = n ? ids.map(id => tileHtml(id, i++)).join('') : (eg ? '' : `<div class="empty"><b>Ничего не нашлось</b>попробуй другое название</div>`);
    $('.sres', P).innerHTML = n ? `Совпадений: ${n} · Enter откроет первое` : (eg ? 'Пасхалка · 秘密' : 'Совпадений: 0');
  } else if (mode === 'az') {
    let last = '';
    for (const id of SORTED) { const l = (APP[id].n.trim()[0] || '#').toUpperCase(); if (l !== last) { last = l; L.push(l); h += `<div class="lt lt-az" data-l="${l}" style="--i:${Math.min(i++, 32)}"><span>${l}</span></div>`; } h += rowHtml(id, i++); n++; }
  } else if (cat === 'all') {
    D.cats.forEach(([c, nm, jp], si) => {
      const ids = SORTED.filter(id => catOf(id) === c); n += ids.length; if (!ids.length) return;
      h += `<div class="lt" data-c="${c}" style="--i:${Math.min(i++, 32)}"><i>0${si + 1}/</i><span>${nm}</span><b class="jp">${jp}</b><em>${ids.length}</em></div>` + ids.map(id => tileHtml(id, i++)).join('');
    });
  } else {
    const ids = SORTED.filter(id => catOf(id) === cat); n = ids.length;
    h = n ? ids.map(id => tileHtml(id, i++)).join('') : `<div class="empty"><b>Пусто</b>переложи сюда приложение через удержание</div>`;
  }
  const grid = $('.grid', P); grid.innerHTML = h; grid.classList.toggle('list', mode === 'az');
  $('.cnt', P).textContent = 'SYS / ' + String(n).padStart(3, '0') + ' ЕД.';
  $('.abc', P).innerHTML = L.map(l => `<b data-l="${l}">${l}</b>`).join('');
}
function renderAdd() { $('.s-add .sgrid', P).innerHTML = SORTED.map((id, i) => tileHtml(id, i, { ck: 1, sel: S.fav.includes(id) })).join(''); addHead(); }
const addHead = () => { const em = $('.s-add .sht-hd em', P); if (em) em.textContent = `на панели ${S.fav.length} из ${MAXF}`; };

/* ───────── app sheet & shortcuts ───────── */
let saId = null;
function sheetApp(id) {
  saId = id; const on = S.fav.includes(id), c = CAT[catOf(id)];
  $('.s-app .sa', P).innerHTML = `<header class="sa-hd"><span class="ti">${ICON(id)}</span><span><b>${esc(APP[id].n)}</b><small>${c.n} · ${c.jp}</small></span></header>
  <button class="sa-act" data-act="sa-open" style="--i:0">${I.open}<span>Открыть</span></button>
  <button class="sa-act" data-act="sa-pin" style="--i:1">${on ? I.minus : I.plus}<span>${on ? 'Убрать с панели' : 'Закрепить на панели'}</span></button>
  <button class="sa-act" data-act="sa-move" style="--i:2">${I.move}<span>Переложить в категорию</span><i class="go">${I.go}</i></button>${NAT ? `<button class="sa-act" data-act="sa-info" style="--i:3">${I.info}<span>О приложении</span></button><button class="sa-act" data-act="sa-del" style="--i:4">${I.trash}<span>Удалить</span></button>` : ''}`;
}
function sheetMove(id) {
  $('.s-app .sa', P).innerHTML = `<header class="sa-hd sm"><button class="sa-x" data-act="sa-back" aria-label="Назад">${I.back}</button><span><b>Куда положить</b><small>«${esc(APP[id].n)}»</small></span></header>` +
    D.cats.map(([c, nm, jp], i) => `<button class="sa-act${catOf(id) === c ? ' cur' : ''}" data-act="sa-to" data-to="${c}" style="--i:${i}"><i class="no">0${i + 1}/</i><span>${nm} <small>${jp}</small></span><em>${SORTED.filter(a => catOf(a) === c).length}</em>${catOf(id) === c ? I.ck : ''}</button>`).join('');
}
let qaId = null, QAL = [];
function openQA(el) {
  const id = el.dataset.app; qaId = id; const qa = $('.qa', P), list = NAT ? nj('shortcuts', [], id).map(x => [x.n, '', x.i]) : (SC[id] || [['Открыть', '']]); QAL = list;
  qa.innerHTML = `<header class="qa-hd"><span class="ti">${ICON(id)}</span><b>${esc(APP[id].n)}</b></header>` + list.map(([a], i) => `<button class="qa-i" data-act="qa-go" data-i="${i}" style="--i:${i}">${I.go}<span>${esc(a)}</span></button>`).join('') +
    `<div class="qa-ft"><button data-act="qa-edit">${I.move}<span>Изменить панель</span></button><button data-act="qa-rm" aria-label="Убрать">${I.minus}</button></div><small class="qa-ht">${NAT && !list.length ? 'ярлыков нет · потяни иконку, чтобы двигать' : 'потяни иконку, чтобы двигать'}</small>`;
  const pr = P.getBoundingClientRect(), r = el.getBoundingClientRect(), cy = (r.top + r.height / 2 - pr.top) / scale;
  qa.style.top = '0px'; const h = qa.offsetHeight, top = clamp(cy - h / 2, 40, 780 - h); qa.style.top = top + 'px'; qa.style.setProperty('--oy', (cy - top) + 'px');
  $$('.home .rail .app', P).forEach(a => a.classList.toggle('held', a === el));
  openOv('qa'); buzz(14); snd('open');
}

/* ───────── navigation ───────── */
let stack = [], ignorePop = 0, pend = null;
function push(n) { stack.push(n); history.pushState({ lx: stack.length }, ''); }
function back() { if (stack.length) history.back(); }
function backThen(f) { if (!stack.length) return f(); pend = f; history.back(); }
window.addEventListener('popstate', e => {
  if (ignorePop) { ignorePop--; } else { const depth = e.state && typeof e.state.lx === 'number' ? e.state.lx : 0; while (stack.length > depth) closeOv(stack.pop()); }
  if (pend) { const f = pend; pend = null; setTimeout(f, 30); }
});
function closeAll(then, keepFs = true) {
  setExp(false);
  const base = keepFs && stack[0] === 'fs' ? 1 : 0, k = stack.length - base;
  if (k <= 0) { if (then) then(); return; }
  for (let i = stack.length - 1; i >= base; i--) closeOv(stack[i]);
  stack.length = base; pend = then || null; ignorePop++; history.go(-k);
}
const OV = ['o-drw', 'o-add', 'o-set', 'o-sa', 'o-app', 'edit', 'o-vault', 'o-shade', 'o-qa', 'o-hello', 'o-quick', 'o-tiles', 'o-ns', 'o-cc'];
const ovOpen = () => OV.some(has);
function openOv(n) {
  setExp(false);
  if (n === 'drw') { if (has('o-drw')) return; renderList(); $('.drw-ls', P).scrollTop = 0; P.classList.add('o-drw'); snd('open'); }
  if (n === 'add') { renderAdd(); P.classList.add('o-add'); }
  if (n === 'set') P.classList.add('o-set');
  if (n === 'sa') P.classList.add('o-sa');
  if (n === 'edit') { P.classList.add('edit'); buzz(); }
  if (n === 'vault') { $('.v-in', P).scrollTop = 0; P.classList.add('o-vault'); snd('open'); buzz(6); }
  if (n === 'shade') { renderNotes(); P.classList.add('o-shade'); snd('open'); }
  if (n === 'qa') P.classList.add('o-qa');
  if (n === 'hello') { refreshStatus(); P.classList.add('o-hello'); }
  if (n === 'set' && NAT) refreshStatus();
  if (n === 'vault' && NAT) { loadSys(); loadCal(); loadMedia(); loadWx(false); }
  if (n === 'shade' && NAT) { loadQS(); loadNotifs(); }
  if (n === 'tiles') { renderTE(); P.classList.add('o-tiles'); snd('open'); }
  if (n === 'quick') { paintQuick(); const sc = $('.s-quick .sht-sc', P); if (sc) sc.scrollTop = 0; P.classList.add('o-quick'); snd('open'); }
  if (n === 'ns' || n === 'cc') { setExp(false); hideNtf(); hsReset(); if (NAT) { loadQS(); loadNotifs(); loadMedia(); } renderNotes(); hsPaint(); P.classList.add('o-' + n); if (!hsNoSt) hsStagger(n); snd('open'); buzz(6); if (NAT) requestAnimationFrame(exclusion); }
  push(n); if (fx) fx.wake();
}
function closeOv(n) {
  if (n === 'drw') { P.classList.remove('o-drw'); const i = $('.srch input', P); i.blur(); if (q) { q = ''; i.value = ''; $('.srch', P).classList.remove('has'); } }
  if (n === 'add') P.classList.remove('o-add');
  if (n === 'set') P.classList.remove('o-set');
  if (n === 'sa') { P.classList.remove('o-sa'); if (has('o-drw')) renderList(); }
  if (n === 'edit') P.classList.remove('edit');
  if (n === 'app') P.classList.remove('o-app');
  if (n === 'vault') { P.classList.remove('o-vault'); const t = $('.note', P); if (t) t.blur(); holdReset(); }
  if (n === 'shade') P.classList.remove('o-shade');
  if (n === 'qa') { P.classList.remove('o-qa'); $$('.home .rail .app.held', P).forEach(a => a.classList.remove('held')); }
  if (n === 'fs') exitFS();
  if (n === 'hello') { P.classList.remove('o-hello'); S.hello = true; save(); }
  if (n === 'quick') P.classList.remove('o-quick');
  if (n === 'tiles') { P.classList.remove('o-tiles'); renderTiles(); }
  if (n === 'ns' || n === 'cc') { P.classList.remove('o-' + n, 'hs-l', 'hs-r'); hsReset(); if (NAT) requestAnimationFrame(exclusion); }
  if (fx) fx.wake();
}

/* ───────── launch with sync ───────── */
let busy = false;
function launch(id, el, o = {}) {
  if (busy || !P) return; busy = true; setExp(false); hideNtf();
  const nm = o.name || (APP[id] ? APP[id].n : String(id)), icon = o.icon || ICON(id);
  const pr = P.getBoundingClientRect(), r = (el || P).getBoundingClientRect();
  const x = el ? (r.left + r.width / 2 - pr.left) / scale : 180, y = el ? (r.top + r.height / 2 - pr.top) / scale : 380, s = el ? r.width / scale : 44;
  const lx = $('.lx', P); lx.style.setProperty('--x', x + 'px'); lx.style.setProperty('--y', y + 'px'); lx.style.setProperty('--s', s + 'px'); lx.style.setProperty('--k0', (s / 44).toFixed(3));
  $('.lx-ic', lx).innerHTML = `<span class="ti">${icon}</span>`; $('.lbl', lx).textContent = o.lbl || 'STRELIZIA × ' + nm.toUpperCase();
  const pct = $('.pct', lx), sub = $('.sub', lx), ring = $('.r1', lx), C = 2 * Math.PI * 80;
  pct.textContent = '0%'; sub.textContent = 'シンクロ率 · SYNC RATE'; ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
  $('.appv', P).innerHTML = `<svg class="av-br" viewBox="0 0 308 640" preserveAspectRatio="none" fill="none" stroke="#ff2b3a" stroke-width="1.4"><path d="M0 22V0h22M286 0h22v22M0 618v22h22M308 618v22h-22"/></svg><div class="av-tag">接続完了 · LINK OK</div><div class="av-ic">${icon}</div><div class="av-n">${nm}</div><div class="av-s">${o.sub || 'СИНХРОНИЗАЦИЯ 100% · ZERO TWO × HIRO'}</div><div class="av-h">нажми или свайпни назад</div>`;
  lx.classList.remove('on', 'ok'); void lx.offsetWidth; lx.classList.add('on'); buzz(10); snd('launch');
  const anim = S.set.anim, t0 = performance.now(), fast = NAT && S.set.fast, RD = fast ? 300 : 650, END = anim ? (fast ? 520 : 1080) : 30;
  const f = now => { const k = clamp((now - t0 - (fast ? 80 : 170)) / RD, 0, 1), e = 1 - Math.pow(1 - k, 3); ring.style.strokeDashoffset = C * (1 - e); pct.textContent = Math.round(e * 100) + '%';
    if (k < 1) requestAnimationFrame(f); else { lx.classList.add('ok'); sub.textContent = '接続完了 · LINK OK'; buzz(18); snd('ok'); } };
  if (anim) requestAnimationFrame(f);
  if (NAT && (o.run || (APP[id] && APP[id].pkg))) {
    clearTimeout(lxT);
    setTimeout(() => { const rr = $('.ring', lx).getBoundingClientRect(); const ok = o.run ? o.run(rr) : o.sc ? ncall('shortcut', id, o.sc) : ncall('launch', id, rr.left, rr.top, rr.width, rr.height); if (ok === false || (ok === undefined && !o.run)) launchFail(); }, END);
    lxT = setTimeout(launchDone, END + 2500);
    return;
  }
  setTimeout(() => { P.classList.add('o-app'); push('app'); if (badges[id]) { badges[id] = 0; renderRail(); notes = notes.filter(n => n.app !== id); renderNotes(); } if (o.then) o.then(); }, anim ? 1080 : 30);
  setTimeout(() => { lx.classList.remove('on', 'ok'); busy = false; }, anim ? 1500 : 60);
}
let lxT = 0;
function launchDone() { clearTimeout(lxT); const lx = P && $('.lx', P); if (lx && lx.classList.contains('on')) { lx.classList.add('bye'); setTimeout(() => lx.classList.remove('on', 'ok', 'bye'), 230); } busy = false; }
function launchFail() { launchDone(); toast('Не получилось открыть'); }
const roleId = k => Object.keys(APP).find(x => APP[x].ic === k);
function launchMusic(el, shuffle) {
  if (NAT) { const m = roleId('music'); if (m) launch(m, el); else launch('music', el, { name: 'Музыка', run: () => ncall('mediaCmd', 'open') }); return; }
  if (shuffle) { mus.i = Math.floor(Math.random() * TR.length); mus.t = 0; }
  launch('music', el, { sub: 'СЕЙЧАС ИГРАЕТ · ' + TR[mus.i][0].toUpperCase(), then: () => { mus.on = true; mus.play = true; paintMus(); } });
}

/* ───────── toast, message, darling, alert, emblem ───────── */
let tt, ntT;
function toast(m) { const t = $('.tst', P); t.innerHTML = m; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 1900); }
let nCount = 0;
let ntfKey = null;
function showBanner(icon, title, text, key) {
  if (!P) return; const n = $('.ntf', P); ntfKey = key;
  $('.ntf-ic', n).innerHTML = icon; $('.ntf-b b', n).textContent = title; $('.ntf-b span', n).textContent = text; $('em', n).textContent = 'сейчас';
  n.classList.remove('on'); void n.offsetWidth; n.classList.add('on'); P.classList.add('ntf-on');
  buzz(30); snd('notify'); restart(P, 'ping', 1300); clearTimeout(ntT); ntT = setTimeout(hideNtf, 5600);
}
function onPosted(p) {
  if (!p || !RESUMED || !S.set.banners || S.qs.dnd || has('o-shade') || has('o-ns') || has('o-cc') || has('locked')) return;
  const id = PKG[p.p]; showBanner(ICON(id || ''), String(p.app || '').toUpperCase() + (p.t ? ' · ' + p.t : ''), p.s || '', p.k);
}
function notify() {
  if (NAT) { showBanner(ICON(roleId('chats') || 'chats'), 'ХИРО · ЧАТЫ', 'Встретимся в ангаре 13? Жду у Стрелиции', 'demo'); return; }
  if (!P) return; nCount++;
  badges.chats = (badges.chats || 0) + 1; notes = notes.filter(n => n.id !== 'hiro'); notes.unshift({ id: 'hiro', app: 'chats', t: 'ХИРО · ЧАТЫ' + (badges.chats > 1 ? ' · ' + badges.chats : ''), s: nCount > 1 ? 'Ты где? Стрелиция уже прогрета' : 'Встретимся в ангаре 13? Жду у Стрелиции', tm: 'сейчас' });
  renderRail(); renderNotes(); if (has('o-drw')) renderList();
  if (S.qs.dnd) { toast('Не беспокоить: сообщение тихо в шторке'); return; }
  const n = $('.ntf', P); $('.ntf-b span', n).textContent = notes[0].s; $('.ntf-b b', n).textContent = 'ХИРО · ЧАТЫ';
  n.classList.remove('on'); void n.offsetWidth; n.classList.add('on'); P.classList.add('ntf-on');
  buzz(30); snd('notify'); restart(P, 'ping', 1300);
  clearTimeout(ntT); ntT = setTimeout(hideNtf, 5600);
}
function hideNtf() { if (!P) return; $('.ntf', P).classList.remove('on'); P.classList.remove('ntf-on'); clearTimeout(ntT); }
let loveT;
function darling() {
  if (!P) return; buzz(20); snd('darling'); restart(P, 'love', 2000);
  hud('ダーリン', 'DARLING');
  const home = $('.home', P); $$('.dl', home).forEach(e => e.remove()); home.insertAdjacentHTML('beforeend', '<i class="dl">ダーリン <span class="sym">♥</span></i>');
  clearTimeout(loveT); loveT = setTimeout(() => { $$('.dl', home).forEach(e => e.remove()); tick(true); }, 2000);
  if (fx) fx.burst();
}
let alT;
function alertOn() {
  if (!P) return; P.classList.add('alert-on'); hud('警報', 'ALERT'); snd('alert'); if (fx) fx.burst();
  vpat([180, 90, 180, 90, 260]);
  clearTimeout(alT); alT = setTimeout(alertOff, 9000);
}
function alertOff() { if (!P) return; P.classList.remove('alert-on'); clearTimeout(alT); tick(true); }
function sig() {
  if (!P) return; restart(P, 'sig-on', 1700); snd('sig'); buzz(16); if (fx) fx.burst(290, 390);
  toast('FXX-01 · STRELIZIA · 起動');
}

/* ───────── shade ───────── */
let NS = { perm: false, list: [] };
const hm = ms => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
function loadNotifs() {
  if (!NAT) return; NS = nj('notifs', { perm: false, list: [] }) || { perm: false, list: [] }; PB = {};
  (NS.list || []).forEach(n => { PB[n.p] = (PB[n.p] || 0) + 1; });
  const now = Date.now(); GONE.forEach((t, k) => { if (now - t > 1800) GONE.delete(k); });
  notes = (NS.list || []).filter(n => !GONE.has(String(n.k))).map(n => ({ id: n.k, app: PKG[n.p] || '', t: String(n.app || '').toUpperCase() + (n.t ? ' · ' + n.t : ''), s: n.s || '', tm: hm(n.tm), an: String(n.app || ''), tt: String(n.t || ''), c: n.c !== false }));
  if (P) { renderRail(); renderNotes(); if (has('o-drw')) renderList(); }
}
const GONE = new Map();   // смахнутые ключи: пока Android не подтвердил удаление, старый список их не вернёт
const nmOf = n => { if (n.an != null) return [n.an, n.tt]; const p = String(n.t).split(' · '); return [cap(p[0].toLowerCase()), p.slice(1).join(' · ')]; };
const hsInner = n => { const [a, t] = nmOf(n); return `<span class="hs-ii">${ICON(n.app)}</span><span class="hs-it"><em><span>${esc(a || 'Уведомление')}</span><i>${n.tm}</i></em>${t ? `<b>${esc(t)}</b>` : ''}<span>${esc(n.s)}</span></span>`; };
const nlInner = n => `<span class="ti">${ICON(n.app)}</span><span class="nl-t"><b>${esc(n.t)}</b><span>${esc(n.s)}</span></span><em>${n.tm}</em>`;
const nSig = n => [n.app, n.an, n.tt, n.t, n.s, n.tm, n.c].join('|');
// Карточки, которые остались, не пересоздаются: раньше весь список перерисовывался, и каждая карточка
// заново проигрывала появление, отсюда мигание. Новые въезжают, убранные уезжают и схлопываются
function keyed(box, inner, cls, emptyCls, emptyHtml, live) {
  if (box.dataset.m !== 'ls') { box.textContent = ''; box.dataset.m = 'ls'; }
  const have = new Map();
  for (const el of [...box.children]) if (el.classList.contains('nl-i') && !el.classList.contains('out')) have.set(el.dataset.id, el);
  const want = new Set(notes.map(n => String(n.id)));
  have.forEach((el, id) => { if (!want.has(id)) { have.delete(id); if (live) cardOut(el, 0); else el.remove(); } });
  let prev = null;
  notes.forEach((n, i) => {
    const id = String(n.id), sg = nSig(n); let el = have.get(id);
    if (!el) {
      el = document.createElement('div'); el.className = cls; el.dataset.act = 'nopen'; el.dataset.id = id; el.dataset.sg = sg; el.innerHTML = inner(n);
      if (live) { el.classList.add('nw'); setTimeout(() => el.classList.remove('nw'), 520); }
    } else if (el.dataset.sg !== sg) { el.dataset.sg = sg; el.innerHTML = inner(n); }
    if (!live) el.style.setProperty('--i', String(Math.min(i, 12)));
    el.classList.toggle('nc', n.c === false);
    let nx = prev ? prev.nextElementSibling : box.firstElementChild;
    while (nx && nx.classList.contains('out')) nx = nx.nextElementSibling;
    if (nx !== el) box.insertBefore(el, nx);
    prev = el;
  });
  const em = box.querySelector('.' + emptyCls);
  if (!notes.length && !box.querySelector('.out')) { if (!em) box.insertAdjacentHTML('beforeend', emptyHtml); }
  else if (em) em.remove();
}
// карточка уезжает (dir 1 вправо, -1 влево, 0 гаснет на месте); delay нужен для каскада «Очистить всё»
function slideOut(el, dir, delay) {
  if (!el || el.classList.contains('out')) return false; el.classList.add('out');
  const go = () => { const W = (el.offsetWidth || 320) + 48; el.style.transition = 'translate .24s cubic-bezier(.3,.6,.35,1), opacity .2s linear, scale .2s ease'; if (dir) el.style.translate = (dir * W) + 'px 0'; else el.style.scale = '.94'; el.style.opacity = '0'; };
  if (delay) setTimeout(go, delay); else go(); return true;
}
// убрать карточки разом: остальные плавно подъезжают на освободившееся место (FLIP, только transform)
function dropCards(box, els) {
  if (!box) return; const rest = [...box.children].filter(c => !els.includes(c)), y0 = rest.map(c => c.getBoundingClientRect().top);
  els.forEach(e => e.remove());
  rest.forEach((c, i) => { const d = (y0[i] - c.getBoundingClientRect().top) / scale; if (Math.abs(d) > .5 && c.animate) c.animate([{ transform: `translateY(${d.toFixed(1)}px)` }, { transform: 'translateY(0)' }], { duration: 300, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
  if (!box.querySelector('.out')) renderNotes();
}
function cardOut(el, dir) { if (!slideOut(el, dir)) return; const box = el.parentNode; setTimeout(() => dropCards(box, [el]), dir ? 210 : 190); }
function renderHS() {
  const box = $('.hs-nl', P); if (!box) return; const x = $('.hs-x', P);
  if (NAT && !NS.perm) { if (box.dataset.m !== 'perm') { box.dataset.m = 'perm'; box.innerHTML = '<div class="hs-perm"><b>Нет доступа к уведомлениям</b><span>Разреши его, и здесь появятся уведомления, а на иконках счётчики</span><button data-act="n-notif">Разрешить</button></div>'; } if (x) x.classList.add('off'); return; }
  const hs = $('.hs', P), live = has('o-ns') || !!(hs && (hs.classList.contains('drag') || hs.classList.contains('sw')));
  keyed(box, hsInner, 'nl-i hs-i', 'hs-e', '<div class="hs-e">' + I.ck + '<span>Нет уведомлений</span></div>', live);
  if (x) x.classList.toggle('off', !notes.some(n => n.c !== false));
}
function renderNotes() {
  if (!P) return; renderHS(); const ls = $('.nl-ls', P), hb = $('.nl h6 button', P);
  if (NAT && !NS.perm) { if (ls.dataset.m !== 'perm') { ls.dataset.m = 'perm'; ls.innerHTML = '<div class="nl-perm"><span>Чтобы здесь были уведомления, а на иконках счётчики, дай лаунчеру доступ к уведомлениям</span><button data-act="n-notif">Дать доступ</button></div>'; } hb.style.visibility = 'hidden'; }
  else { keyed(ls, nlInner, 'nl-i', 'nl-e', '<p class="nl-e">Всё прочитано · 静か</p>', has('o-shade')); hb.style.visibility = notes.length ? '' : 'hidden'; }
  const an = $('.a-nt', P); if (an) an.innerHTML = Object.keys(badges).filter(k => badges[k]).map(k => `<i class="ti">${ICON(k)}</i>`).join('');
}
function dismissNote(id, el, dir) {
  const n = notes.find(x => String(x.id) === String(id)); if (!n) { if (el) cardOut(el, dir || 1); return; }
  if (NAT) { ncall('dismissNotif', n.id); GONE.set(String(n.id), Date.now()); }
  notes = notes.filter(x => x !== n);
  if (el) cardOut(el, dir || 1);
  renderNotes();
}
// «Очистить всё»: карточки каскадом уезжают вправо, потом список схлопывается разом
function clearNotes() {
  const cl = notes.filter(n => n.c !== false); if (!cl.length) return;
  if (NAT) { ncall('clearNotifs'); const t = Date.now(); cl.forEach(n => GONE.set(String(n.id), t)); }
  const box = has('o-shade') ? $('.nl-ls', P) : $('.hs-nl', P), ids = new Set(cl.map(n => String(n.id)));
  const cards = box ? [...box.querySelectorAll('.nl-i:not(.out)')].filter(c => ids.has(c.dataset.id)) : [];
  cards.forEach((c, i) => slideOut(c, 1, Math.min(i, 7) * 42));
  notes = notes.filter(n => n.c === false); snd('close'); buzz(8);
  renderNotes();
  setTimeout(() => dropCards(box, cards), Math.min(cards.length, 8) * 42 + 250);
}
function paintBrt() { if (!P) return; hsPaint(); $('.dim', P).style.opacity = NAT ? '0' : ((1 - S.brt) * .72).toFixed(3); const f = $('.brt-f', P), k = $('.brt-k', P); if (f) { f.style.transform = `scaleX(${S.brt})`; k.style.left = (S.brt * 100) + '%'; } }
function loadQS() {
  if (!NAT || !P) return; const q = nj('qs', null); if (!q) return;
  ['wifi', 'bt', 'torch', 'dnd', 'air'].forEach(k => S.qs[k] = !!q[k]); if (typeof q.brt === 'number' && !brDrag) S.brt = clamp(q.brt, .02, 1); ST.write = !!q.write;
  if (typeof q.rot === 'boolean') S.qs.rot = q.rot; else { const r = ncall('rotation'); if (typeof r === 'boolean') S.qs.rot = r; }
  if (!volDrag) { const v = nj('volume', null); if (v && typeof v.v === 'number') VOL = clamp(v.v, 0, 1); }
  applyFlags(); paintBrt(); loadTiles();
  $$('.q', P).forEach(b => { const k = b.dataset.q, sm = $('small', b); if (!sm || !k || k === 'eco') return; sm.textContent = (S.qs[k] ? 'вкл' : 'выкл') + (k === 'wifi' || k === 'bt' || k === 'air' ? ' · панель' : ''); });
}
let brDrag = false, brT = 0, brLast = 0;
const brSend = () => { const now = Date.now(); if (now - brLast < 70) { clearTimeout(brT); brT = setTimeout(brSend, 75); return; } brLast = now; ncall('setBrightness', S.brt); };
function qsToggle(k) {
  if (NAT && k !== 'eco') {
    buzz(8); snd('tap');
    if (k === 'rot') { const r = ncall('setRotation', !S.qs.rot); if (r === true) { S.qs.rot = !S.qs.rot; applyFlags(); toast(S.qs.rot ? 'Автоповорот включён' : 'Автоповорот выключен'); } else { toast('Для автоповорота разреши «Изменение настроек»'); setTimeout(() => ncall('askWrite'), 1000); } return; }
    if (k === 'torch') { ncall('torch', !S.qs.torch); setTimeout(loadQS, 250); return; }
    if (k === 'dnd') { if (ncall('dnd', !S.qs.dnd) === false) toast('Разреши лаунчеру «Не беспокоить» и нажми ещё раз'); setTimeout(loadQS, 300); return; }
    ncall('panel', k); return;
  }
  S.qs[k] = !S.qs[k]; if (k === 'air' && S.qs.air) S.qs.wifi = false; if (k === 'wifi' && S.qs.wifi) S.qs.air = false; save(); applyFlags(); buzz(8); snd('tap');
  const L = { wifi: ['Wi-Fi включён', 'Wi-Fi выключен'], bt: ['Bluetooth включён', 'Bluetooth выключен'], torch: ['Фонарик включён', 'Фонарик выключен'], dnd: ['Не беспокоить: плашки не появятся', 'Не беспокоить выключено'],
    air: ['Режим полёта', 'Режим полёта выключен'], eco: ['Экономия: искры и сканер на паузе', 'Экономия выключена'], rot: ['Автоповорот включён', 'Автоповорот выключен'], data: ['Мобильные данные включены', 'Мобильные данные выключены'] }[k];
  toast(S.qs[k] ? L[0] : L[1]);
}

/* ───────── vault widgets ───────── */
let WXD = null, EVS = { perm: false, ev: [] }, SYSD = null;
const WXC = { 0: 'ясно', 1: 'почти ясно', 2: 'переменная облачность', 3: 'пасмурно', 45: 'туман', 48: 'туман с изморозью', 51: 'лёгкая морось', 53: 'морось', 55: 'сильная морось', 56: 'ледяная морось', 57: 'ледяная морось', 61: 'небольшой дождь', 63: 'дождь', 65: 'сильный дождь', 66: 'ледяной дождь', 67: 'ледяной дождь', 71: 'небольшой снег', 73: 'снег', 75: 'сильный снег', 77: 'снежная крупа', 80: 'ливень', 81: 'ливень', 82: 'сильный ливень', 85: 'снегопад', 86: 'сильный снегопад', 95: 'гроза', 96: 'гроза с градом', 99: 'гроза с градом' };
const deg = t => (t > 0.5 ? '+' : t < -0.5 ? '−' : '') + Math.abs(Math.round(t)) + '°';
function paintWxN() {
  if (!P) return; const box = $('.wx-h', P), cta = $('.wx-cta', P); if (!box || !cta) return;
  const set = (q, v) => { const e = $(q, P); if (e) e.textContent = v; };
  if (!WXD || WXD.none || WXD.err) {
    set('[data-wxt]', '…'); set('[data-wxd]', WXD && WXD.err ? 'не удалось загрузить' : 'нужен город или геолокация'); set('[data-wxs]', WXD && WXD.err ? 'проверь интернет' : 'Open-Meteo, без ключей'); set('[data-wxn]', S.city || '');
    box.innerHTML = ''; cta.innerHTML = WXD && WXD.err ? '<button data-act="wx-retry">Обновить</button>' : '<button data-act="n-loc">Геолокация</button><button data-act="city">Указать город</button>'; return;
  }
  cta.innerHTML = '';
  $$('[data-wxh]', P).forEach(e => e.textContent = ' · ' + deg(WXD.t)); set('[data-wxt]', deg(WXD.t)); set('[data-wxd]', WXC[WXD.c] || 'погода'); set('[data-wxs]', 'ветер ' + Math.round(WXD.w) + ' м/с · ощущается ' + deg(WXD.f)); set('[data-wxn]', WXD.name || '');
  const H = WXD.h || [], mn = Math.min(...H), mx = Math.max(...H);
  box.innerHTML = H.map((t, i) => `<span><small>${i ? String(WXD.ht[i] || '').slice(11, 13) : 'сейчас'}</small><i style="--h:${((mx > mn ? (t - mn) / (mx - mn) : .5) * 28 + 8).toFixed(0)}px"></i><b>${deg(t)}</b></span>`).join('');
}
async function loadWx(force) {
  if (!NAT) return;
  try { const c = JSON.parse(localStorage.getItem(KEY + '-wx') || 'null'); if (c && !force && Date.now() - c.at < 30 * 60e3 && (c.city || '') === (S.city || '')) { WXD = c; paintWx(); return; } } catch (e) {}
  let lat = null, lon = null, name = '';
  try {
    if (S.city) { const g = await (await fetch('https://geocoding-api.open-meteo.com/v1/search?count=1&language=ru&name=' + encodeURIComponent(S.city))).json(); const r = g.results && g.results[0]; if (r) { lat = r.latitude; lon = r.longitude; name = r.name; } }
    if (lat == null) { const loc = ncall('location') || ''; if (loc) { const [a, b] = loc.split(',').map(Number); if (isFinite(a) && isFinite(b)) { lat = a; lon = b; name = 'по геолокации'; } } }
    if (lat == null) { WXD = { none: true }; paintWx(); return; }
    const j = await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m&forecast_days=2&wind_speed_unit=ms&timezone=auto`)).json();
    const cur = j.current, pre = String(cur.time).slice(0, 13); let i0 = j.hourly.time.findIndex(t => String(t).slice(0, 13) === pre); if (i0 < 0) i0 = 0;
    WXD = { at: Date.now(), city: S.city || '', name, t: cur.temperature_2m, f: cur.apparent_temperature, w: cur.wind_speed_10m, c: cur.weather_code, h: j.hourly.temperature_2m.slice(i0, i0 + 6), ht: j.hourly.time.slice(i0, i0 + 6) };
    localStorage.setItem(KEY + '-wx', JSON.stringify(WXD));
  } catch (e) { WXD = { err: true }; }
  paintWx();
}
function loadCal() { if (!NAT) return; EVS = nj('events', { perm: false, ev: [] }) || { perm: false, ev: [] }; paintCal(new Date()); }
const gb = b => b >= 1e9 ? (b / 1073741824).toFixed(b >= 1e11 ? 0 : 1).replace('.', ',') + ' ГБ' : Math.round(b / 1048576) + ' МБ';
function loadSys() {
  if (!NAT || !P) return; SYSD = nj('sys', null); if (!SYSD) return; bat = { level: (SYSD.bat || 0) / 100, charging: !!SYSD.chg }; paintBat();
  const set = (q, v) => $$(q, P).forEach(e => e.textContent = v);
  set('[data-ram]', SYSD.ramTotal ? gb(SYSD.ramFree) + ' из ' + gb(SYSD.ramTotal) : '…'); set('[data-sto]', SYSD.stTotal ? gb(SYSD.stFree) + ' из ' + gb(SYSD.stTotal) : '…'); set('[data-net]', SYSD.net || '…');
}
function paintWx() {
  if (NAT) { paintWxN(); return; }
  const box = P && $('.wx-h', P); if (!box) return; const h0 = new Date().getHours(), T = [1, 1, 0, -1, -1, -2];
  box.innerHTML = T.map((t, i) => `<span><small>${i ? String((h0 + i) % 24).padStart(2, '0') : 'сейчас'}</small><i style="--h:${(t + 3) * 7 + 6}px"></i><b>${t > 0 ? '+' : t < 0 ? '−' : ''}${Math.abs(t)}°</b></span>`).join('');
}
const EVT = [[9, 0, 'Тренировка пилотов'], [13, 30, 'Ангар 13 · Хиро'], [19, 0, 'Ужин с отрядом 13'], [22, 30, 'Звёзды на крыше']];
function paintCal(d) {
  const w = P && $('.cal-w', P); if (!w) return;
  const dow = (d.getDay() + 6) % 7, mon = new Date(d); mon.setDate(d.getDate() - dow);
  w.innerHTML = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map((n, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return `<span class="${i === dow ? 'on' : ''}"><small>${n}</small><b>${x.getDate()}</b></span>`; }).join('');
  if (NAT) { const ul = $('.cal-e', P);
    if (!EVS.perm) { ul.innerHTML = '<li class="cal-cta"><span>Покажу события на сегодня из календаря</span><button data-act="n-cal">Разрешить календарь</button></li>'; return; }
    ul.innerHTML = EVS.ev.length ? EVS.ev.slice(0, 5).map(e => `<li class="${!e.ad && e.e < Date.now() ? 'past' : ''}" data-act="cal-ev" data-id="${e.id}" data-b="${e.b}"><b>${e.ad ? 'весь день' : hm(e.b)}</b><span>${esc(e.t || 'Без названия')}</span></li>`).join('') : '<li class="past"><b>· · ·</b><span>Сегодня событий нет</span></li>';
    return; }
  const m = d.getHours() * 60 + d.getMinutes();
  $('.cal-e', P).innerHTML = EVT.map(([h, mi, t]) => `<li class="${h * 60 + mi < m ? 'past' : ''}"><b>${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}</b><span>${t}</span></li>`).join('');
}
const T0 = Date.now();
function paintPair(d) {
  const e = P && $('[data-pair]', P); if (!e) return; const m = Math.max(0, d.getHours() * 60 + d.getMinutes() - 7 * 60) || 134;
  e.textContent = Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин';
}
let holdT = null, holdRAF = 0, holdK = 0, holdDone = false;
function holdStart() {
  if (holdDone) return; const b = $('.hold', P), ring = $('.hr', b), C = 2 * Math.PI * 17, t0 = performance.now();
  b.classList.add('on'); ring.style.strokeDasharray = C; snd('sync'); buzz(10);
  const f = now => { holdK = clamp((now - t0) / 1500, 0, 1); ring.style.strokeDashoffset = C * (1 - holdK); $('.hold-s', b).textContent = 'シンクロ率 · ' + Math.round(holdK * 100) + '%';
    if (holdK < 1) holdRAF = requestAnimationFrame(f); else holdWin(); };
  holdRAF = requestAnimationFrame(f);
}
function holdStop() { if (holdDone || !P) return; cancelAnimationFrame(holdRAF); if (holdK > 0 && holdK < 1) holdReset(); }
function holdReset() { if (!P) return; cancelAnimationFrame(holdRAF); holdK = 0; holdDone = false; const b = $('.hold', P); if (!b) return; b.classList.remove('on', 'win'); const r = $('.hr', b); r.style.strokeDashoffset = 2 * Math.PI * 17; $('.hold-t', b).textContent = 'Удержи для синхронизации'; $('.hold-s', b).textContent = 'シンクロ率 · ждём обоих пилотов'; }
function holdWin() {
  holdDone = true; const b = $('.hold', P); b.classList.add('win'); $('.hold-t', b).textContent = '比翼の鳥 · 100%'; $('.hold-s', b).textContent = 'пилоты синхронизированы';
  $$('[data-sync],[data-sync2]', P).forEach(e => e.textContent = '100%'); snd('darling');
  vpat([30, 50, 30, 50, 90]);
  const c = $('.v-pl', P); for (let i = 0; i < 9; i++) c.insertAdjacentHTML('beforeend', `<i class="ht" style="--x:${20 + Math.random() * 280}px;--d:${i * 70}ms;--s:${.6 + Math.random() * .7}">${I.heart}</i>`);
  setTimeout(() => $$('.v-pl .ht', P).forEach(e => e.remove()), 2200);
  setTimeout(() => { if (P && !has('o-vault')) holdReset(); }, 4000);
}

/* ───────── lock screen / AOD ───────── */
function drift() { const a = P && $('.aod', P); if (a) { a.style.setProperty('--ax', (Math.random() * 16 - 8).toFixed(0) + 'px'); a.style.setProperty('--ay', (Math.random() * 20 - 10).toFixed(0) + 'px'); } }
function lockNow() {
  if (NAT) { if (ncall('lock') === true) { snd('lock'); return; }
    if (!S.accAsked) { S.accAsked = true; save(); toast('Включи «Стрелиция: блокировка» в спецвозможностях'); setTimeout(() => ncall('openAccessibility'), 1300); } else toast('Блокировка: включи службу «Стрелиция» в спецвозможностях'); return; }
  if (!P || has('locked')) return; setExp(false); hideNtf(); renderNotes(); drift(); P.classList.add('locked'); bootArm(true); snd('lock'); buzz(12); }
function unlock(fp) {
  if (!P || !has('locked') || has('unlocking')) return; P.classList.add('unlocking'); snd('unlock'); buzz(fp ? 22 : 12);
  setTimeout(() => { P.classList.remove('locked', 'unlocking'); boot(() => enter()); }, fp ? 120 : 220);
}
let ARM = false, armT = 0, unlockAt = 0, bootT1 = 0, bootT2 = 0;
function bootArm(force) {
  if (!P || !S.set.anim || !(force || S.set.bootUnlock)) return;
  const b = $('.boot', P); if (!b) return; clearTimeout(armT); clearTimeout(bootT1); clearTimeout(bootT2);
  b.classList.remove('on'); b.classList.add('arm'); ARM = true; unlockAt = 0; hideNtf(); setExp(false);
}
function bootDisarm() { ARM = false; clearTimeout(armT); const b = P && $('.boot', P); if (b && !b.classList.contains('on')) b.classList.remove('arm'); }
function boot(cb) {
  const b = $('.boot', P); clearTimeout(armT); if (!S.set.anim) { ARM = false; b.classList.remove('arm', 'on'); cb && cb(); return; }
  clearTimeout(bootT1); clearTimeout(bootT2);
  b.classList.remove('on'); void b.offsetWidth; b.classList.add('on');
  if (ARM) { ARM = false; requestAnimationFrame(() => requestAnimationFrame(() => b.classList.remove('arm'))); }
  bootT1 = setTimeout(() => cb && cb(), 780); bootT2 = setTimeout(() => b.classList.remove('on', 'arm'), 1250);
}

/* ───────── sparks (live overlay) + pilot waves ───────── */
function sparks(cv, wv) {
  const ctx = cv.getContext('2d'), wx = wv.getContext('2d'), W = 360; let H = PH; let dpr = 1, ps = [], raf = 0, last = 0, burst = 0, cleared = false, ph = 0;
  const spr = document.createElement('canvas'); spr.width = spr.height = 32;
  { const g = spr.getContext('2d'), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,226,206,1)'); gr.addColorStop(.22, 'rgba(255,96,72,.92)'); gr.addColorStop(1, 'rgba(255,30,44,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }
  const mk = (y, x) => ({ x: x == null ? Math.random() * W : x + (Math.random() - .5) * 40, y: y == null ? H * .62 + Math.random() * H * .45 : y, v: 14 + Math.random() * 34, s: 1.8 + Math.random() * 4.6, a: .35 + Math.random() * .6, ph: Math.random() * 6.28, w: .4 + Math.random() * 1.2 });
  for (let i = 0; i < 46; i++) ps.push(mk(H * .35 + Math.random() * H * .65));
  const FXP = () => S.fx === 'max' ? { dpr: 2.5, gap: 14 } : { dpr: 1.6, gap: 30 };
  const PAUSE = ['o-drw', 'o-app', 'o-vault', 'o-set', 'o-add', 'o-sa', 'o-hello', 'o-quick', 'o-tiles', 'o-shade', 'o-ns', 'o-cc', 'locked'];
  let dead = false;
  function resize() { H = PH; cv.style.height = H + 'px'; dpr = Math.min(FXP().dpr, (window.devicePixelRatio || 1) * scale); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); wv.width = Math.round(220 * dpr); wv.height = Math.round(46 * dpr); cleared = false; }
  function waves(dt) {
    ph += dt * 3.2; const k = holdDone ? 1 : holdK, off = (1 - k) * 2.4, amp = 12 + 4 * Math.sin(ph * .3);
    wx.setTransform(dpr, 0, 0, dpr, 0, 0); wx.clearRect(0, 0, 220, 46);
    [[0, '#ff2b3a', 2], [off, 'rgba(255,255,255,.8)', 1.3]].forEach(([o, c, lw]) => { wx.beginPath(); for (let x = 0; x <= 220; x += 3) { const y = 23 + Math.sin(x * .055 + ph + o) * amp * Math.sin(x / 220 * Math.PI); x ? wx.lineTo(x, y) : wx.moveTo(x, y); } wx.strokeStyle = c; wx.lineWidth = lw; wx.shadowColor = c; wx.shadowBlur = 6; wx.stroke(); });
  }
  function frame(t) {
    raf = 0; if (dead || !P) return;
    const vis = !document.hidden && RESUMED, en = S.set.sparks && S.set.anim && !ECO();
    const vault = vis && P.classList.contains('o-vault'), spk = vis && en && !PAUSE.some(c => P.classList.contains(c)), tl = vis && tiltNeeds();
    if (!en && !cleared) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); cleared = true; }
    if (!spk && !tl && !vault) { last = 0; return; }
    raf = requestAnimationFrame(frame);
    if (last && t - last < (burst > 0 ? 14 : FXP().gap)) return;
    const dt = last ? Math.min(.05, (t - last) / 1000) : .016; last = t;
    if (tl) tiltStep(dt); if (vault) waves(dt); if (!spk) return;
    cleared = false; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
    const sp = burst > 0 ? 2.4 : 1;
    for (const p of ps) {
      p.y -= p.v * dt * sp; p.ph += dt * p.w * 2;
      if (p.y < H * .26) Object.assign(p, mk(H + 8 + Math.random() * 40));
      const life = clamp((p.y - H * .26) / (H * .34), 0, 1);
      ctx.globalAlpha = p.a * life * (.62 + .38 * Math.sin(p.ph * 3));
      ctx.drawImage(spr, p.x + Math.sin(p.ph) * 7 - p.s, p.y - p.s, p.s * 2, p.s * 2);
    }
    burst = Math.max(0, burst - dt); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  const wake = () => { if (!raf && !dead) { last = 0; raf = requestAnimationFrame(frame); } };
  resize(); wake();
  return { resize, wake, stop: () => { dead = true; cancelAnimationFrame(raf); raf = 0; }, burst: (x, y) => { burst = 2.2; wake(); for (let i = 0; i < 26; i++) ps.push(x == null ? mk(H * .8 + Math.random() * 120) : Object.assign(mk(y + Math.random() * 30, x), { v: 30 + Math.random() * 40 })); if (ps.length > 96) ps.splice(0, ps.length - 96); } };
}

/* ───────── parallax (tilt, or mouse on desktop) ───────── */
const tilt = { x: 0, y: 0, tx: 0, ty: 0, base: null, gyro: false, demo: 0 };
window.addEventListener('deviceorientation', e => {
  if (e.beta == null || e.gamma == null) return; tilt.gyro = true;
  if (!tilt.base) tilt.base = { b: e.beta, g: e.gamma };
  tilt.tx = clamp((e.gamma - tilt.base.g) / 22, -1, 1); tilt.ty = clamp((e.beta - tilt.base.b) / 22, -1, 1);
  tilt.base.b += (e.beta - tilt.base.b) * .006; tilt.base.g += (e.gamma - tilt.base.g) * .006;
  if (fx && (Math.abs(tilt.tx - tilt.x) > .004 || Math.abs(tilt.ty - tilt.y) > .004)) fx.wake();
});
stage.addEventListener('pointermove', e => { if (tilt.gyro || e.pointerType !== 'mouse' || !P) return; const r = P.getBoundingClientRect(); tilt.tx = clamp(((e.clientX - r.left) / r.width - .5) * 2, -1, 1); tilt.ty = clamp(((e.clientY - r.top) / r.height - .5) * 2, -1, 1); if (fx) fx.wake(); });
stage.addEventListener('pointerleave', () => { if (!tilt.gyro) { tilt.tx = tilt.ty = 0; if (fx) fx.wake(); } });
function tiltTarget() {
  let tx = tilt.tx, ty = tilt.ty;
  if (tilt.demo) { const k = (performance.now() - tilt.demo) / 1000; if (k > 2.6) tilt.demo = 0; else { tx = Math.sin(k * 4.2) * (1 - k / 2.6); ty = Math.cos(k * 3.1) * .6 * (1 - k / 2.6); } }
  const on = S.set.tilt && S.set.anim && !ECO() && !(P && (P.classList.contains('o-drw') || P.classList.contains('o-app') || P.classList.contains('locked'))); if (!on) tx = ty = 0;
  return [tx, ty];
}
const tiltNeeds = () => { const [tx, ty] = tiltTarget(); return !!tilt.demo || Math.abs(tx - tilt.x) > .002 || Math.abs(ty - tilt.y) > .002; };
/* сдвиг пишем прямо в два слоя: переменная на корне пересчитывала стили всего экрана каждый кадр */
function tiltStep(dt) {
  if (!P) return; const [tx, ty] = tiltTarget(), k = 1 - Math.pow(.91, (dt || .016) * 60);
  const nx = tilt.x + (tx - tilt.x) * k, ny = tilt.y + (ty - tilt.y) * k;
  if (Math.abs(nx - tilt.x) > .0005 || Math.abs(ny - tilt.y) > .0005 || (Math.abs(nx) < .002 && Math.abs(ny) < .002 && (tilt.x || tilt.y))) {
    const z = Math.abs(nx) < .002 && Math.abs(ny) < .002 && !tx && !ty; tilt.x = z ? 0 : nx; tilt.y = z ? 0 : ny;
    const h = $('.home', P), f = $('.fxc', P);
    if (h) h.style.translate = tilt.x || tilt.y ? (tilt.x * -5).toFixed(2) + 'px ' + (tilt.y * -6).toFixed(2) + 'px' : '';
    if (f) f.style.translate = tilt.x || tilt.y ? (tilt.x * -13).toFixed(2) + 'px ' + (tilt.y * -15).toFixed(2) + 'px' : '';
  }
}

/* ───────── favourites ───────── */
function toggleFav(id, quiet) {
  const i = S.fav.indexOf(id);
  if (i >= 0) { if (S.fav.length <= 1) { toast('На панели должно остаться хотя бы одно'); return false; } S.fav.splice(i, 1); save(); renderRail(); if (!quiet) toast(`«${esc(APP[id].n)}» убрано с панели`); }
  else { if (S.fav.length >= MAXF) { toast(`На панели уже ${MAXF}. Убери одно`); nope(); return false; } S.fav.push(id); save(); renderRail({ pop: id }); if (!quiet) toast(`«${esc(APP[id].n)}» на панели`); }
  addHead(); return true;
}

/* ───────── gestures & clicks ───────── */
let lastTap = 0;
function bind() {
  const home = $('.home', P), drw = $('.drw', P), ls = $('.drw-ls', P), abc = $('.abc', P), bub = $('.bub', P), lk = $('.lock', P);
  let st = null, lp = null, drag = null, pull = null;
  const pt = e => { const pr = P.getBoundingClientRect(); return { x: (e.clientX - pr.left) / scale, y: (e.clientY - pr.top) / scale }; };
  P.addEventListener('pointerdown', e => {
    if (S.set.sound) ac();
    if (busy) return;
    const p = pt(e); st = { ...p, tgt: e.target, inDrw: has('o-drw') && drw.contains(e.target), top: ls.scrollTop, lp: false, rail: !!e.target.closest('.home .rail'), ntf: !!e.target.closest('.ntf'), nli: e.target.closest('.nl-i'), t0: performance.now(), hm: !ovOpen() && home.contains(e.target) && !e.target.closest('.rail,.mp'), hsl: e.target.closest('.hs-nl') || e.target.closest('.hs-tg'), hsOn: (has('o-ns') || has('o-cc')) && !has('o-quick'), vx: 0, lx: p.x, lt: performance.now() };
    const app = e.target.closest('.home .rail .app');
    if (has('edit') && app && !e.target.closest('.x')) { startDrag(app, e); return; }
    clearTimeout(lp);
    if (!ovOpen() && home.contains(e.target)) {
      lp = setTimeout(() => {
        if (!st) return; st.lp = true; buzz();
        if (app) { openQA(app); st.qa = app; }
        else if (!e.target.closest('.rail,[data-w],.clk,.hud,.br,.mp,.sig') && !has('exp')) openOv('quick');
      }, 480);
    } else if (has('o-drw') && !has('o-sa') && e.target.closest('.drw .tile,.drw .arow') && !e.target.closest('.pin')) {
      const t = e.target.closest('.tile,.arow');
      lp = setTimeout(() => { if (!st) return; st.lp = true; buzz(); sheetApp(t.dataset.app); openOv('sa'); }, 480);
    }
  });
  P.addEventListener('pointermove', e => {
    if (drag) { moveDrag(e); return; } if (!st) return; const p = pt(e), dx = p.x - st.x, dy = p.y - st.y;
    if (Math.hypot(dx, dy) > 9) clearTimeout(lp);
    if (!pull && st.hm && !st.lp && !has('edit') && !ovOpen() && dy > 14 && dy > Math.abs(dx) * 1.2 && (S.down === 'shade' || st.y < 72)) { clearTimeout(lp); pull = S.shade === 'one' ? 'one' : st.x < 180 ? 'ns' : 'cc'; }
    if (pull && pull !== 'one') { hsDrag(pull, clamp((dy - 14) / 230, 0, 1)); return; }
    if (st.qa && Math.abs(dy) > 14 && has('o-qa')) { const a = st.qa; st.qa = null; P.classList.remove('o-qa'); $$('.home .rail .app.held', P).forEach(x => x.classList.remove('held')); stack[stack.length - 1] = 'edit'; P.classList.add('edit'); buzz(); startDrag(a, e, st); return; }
    if (st.hsOn) { hsMove(st, p, dx, dy); return; }
    if (st.nli && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) { st.nliMove = true; st.nli.style.transition = 'none'; st.nli.style.translate = dx + 'px 0'; st.nli.style.opacity = String(1 - Math.min(.8, Math.abs(dx) / 220)); }
  });
  const end = e => {
    clearTimeout(lp); if (drag) { endDrag(); st = null; return; }
    if (!st) return; const p = pt(e), dx = p.x - st.x, dy = p.y - st.y, s0 = st; st = null;
    if (s0.hsOn && s0.mode) { P.__swallow = Date.now(); hsUp(s0, dx); return; }
    if (s0.nli && s0.nliMove) { const el = s0.nli; P.__swallow = Date.now(); if (Math.abs(dx) > 80) dismissNote(el.dataset.id, el, dx > 0 ? 1 : -1); else { el.style.transition = ''; el.style.translate = ''; el.style.opacity = ''; } return; }
    if (pull) { const p0 = pull; pull = null; P.__swallow = Date.now(); const v = dy / Math.max(1, performance.now() - s0.t0);
      if (p0 === 'one') { if (dy > 60) openOv('shade'); return; }
      hsDragEnd(p0, clamp((dy - 14) / 230, 0, 1) > .3 || (dy > 50 && v > .45)); return; }
    if (s0.lp) { P.__swallow = Date.now(); return; }
    if (s0.ntf && dy < -18) { hideNtf(); P.__swallow = Date.now(); return; }
    const H = Math.abs(dx) > Math.abs(dy) * 1.3;
    if (has('o-shade') && !has('o-set') && dy < -50 && !H) { P.__swallow = Date.now(); back(); return; }
    if ((has('o-ns') || has('o-cc')) && !has('o-quick')) {
      if (!H && dy < -50 && !(s0.hsl && s0.hsl.scrollHeight > s0.hsl.clientHeight + 4)) { P.__swallow = Date.now(); back(); return; }
      if (H && Math.abs(dx) > 70) { P.__swallow = Date.now(); if (dx < 0 && has('o-ns')) hsSwitch('cc'); else if (dx > 0 && has('o-cc')) hsSwitch('ns'); return; }
    }
    if (has('o-vault') && !has('o-set') && !has('o-app') && H && dx < -60) { P.__swallow = Date.now(); back(); return; }
    if (s0.rail && !has('edit') && Math.abs(dx) > 26 && Math.abs(dx) > Math.abs(dy)) { const out = S.side === 'r' ? dx < 0 : dx > 0; setExp(out); P.__swallow = Date.now(); return; }
    if (!ovOpen()) {
      if (H && dx > 60 && S.set.vault) { P.__swallow = Date.now(); openOv('vault'); return; }
      if (!H && dy > 60 && s0.y < 72) { P.__swallow = Date.now(); openOv(S.shade === 'one' ? 'shade' : s0.x < 180 ? 'ns' : 'cc'); return; }
      if (Math.abs(dx) < 90) {
        if (dy < -55 && S.set.swipe) { P.__swallow = Date.now(); openOv('drw'); return; }
        if (dy > 70 && !s0.ntf) { P.__swallow = Date.now(); openOv('drw'); setTimeout(() => $('.srch input', P).focus(), 380); return; }
      }
    }
    if (e.pointerType === 'mouse' && s0.inDrw && dy > 80 && s0.top <= 0 && Math.abs(dx) < 90) { P.__swallow = Date.now(); back(); }
  };
  P.addEventListener('pointerup', end); P.addEventListener('pointercancel', () => { clearTimeout(lp); if (pull) { if (pull !== 'one') hsDragEnd(pull, false); pull = null; } if (drag) endDrag(); if (st && st.mode === 'sw') hsSwEnd(false); if (st && st.nli) { st.nli.style.transition = ''; st.nli.style.translate = ''; st.nli.style.opacity = ''; } st = null; });
  P.addEventListener('contextmenu', e => e.preventDefault());

  P.addEventListener('click', e => {
    if (P.__swallow && Date.now() - P.__swallow < 400) { e.preventDefault(); return; }
    const tgt = e.target; if (tgt.closest('.lock')) return;
    const a = tgt.closest('[data-act]');
    if (has('exp') && !tgt.closest('.home .rail')) { setExp(false); return; }
    if (a) {
      const k = a.dataset.act;
      if (k === 'rm') { const el = a.closest('.app'), id = el.dataset.app; if (S.fav.length <= 1) return toast('На панели должно остаться хотя бы одно'); el.classList.add('bye'); setTimeout(() => { S.fav = S.fav.filter(x => x !== id); save(); renderRail(); }, 240); return; }
      if (k === 'add') { if (has('edit')) return; if (has('o-set') || has('o-quick')) backThen(() => openOv('add')); else openOv('add'); return; }
      if (k === 'all') { if (!has('edit')) openOv('drw'); return; }
      if (k === 'set') { openSettingsApp('', a); return; }
      if (k === 'quick') { if (has('o-quick')) return; if (stack.length) backThen(() => openOv('quick')); else openOv('quick'); return; }
      if (k === 'allset') { openSettingsApp('', a); return; }
      if (k === 'tiles') { openTiles(); return; }
      if (k === 'tile') { tileTap(a.dataset.t, a); return; }
      if (k === 'te-add' || k === 'te-rm' || k === 'te-reset') { teAct(k, a.dataset.k); return; }
      if (k === 'te-done') { teDone(); return; }
      if (k === 'hs-go') { hsSwitch('cc'); return; }
      if (k === 'hs-nset') { if (NAT) { backThen(() => openSys('notif', 'Уведомления')); return; } toast('На телефоне тут откроются настройки уведомлений HyperOS'); return; }
      if (k === 'hs-sset') { if (NAT) { backThen(() => openSys('settings', 'Настройки')); return; } toast('На телефоне тут откроются настройки HyperOS'); return; }
      if (k === 'hs-net') { if (NAT) { backThen(() => ncall('panel', 'net')); return; } if (S.qs.air) { toast('Сначала выключи режим полёта'); return; } qsToggle('data'); return; }
      if (k === 'hs-lock') { closeAll(() => setTimeout(lockNow, 220)); return; }
      if (k === 'hs-shot') { closeAll(() => setTimeout(() => { if (NAT) { if (ncall('screenshot') !== true) toast('Для скриншота включи службу «Стрелиция: блокировка»'); return; } restart(P, 'shot', 700); snd('ok'); toast('Скриншот сохранён'); }, 480)); return; }
      if (k === 'hs-mus') { if (NAT) { backThen(() => { if (MD.on) openPlayer(null); else launchMusic(null); }); return; } backThen(() => launchMusic(null)); return; }
      if (k === 'back' || k === 'edone') { back(); return; }
      if (k === 'clr') { const i = $('.srch input', P); i.value = ''; q = ''; $('.srch', P).classList.remove('has'); renderList(); i.focus(); e.preventDefault(); return; }
      if (k === 'edit') { closeAll(() => openOv('edit')); return; }
      if (k === 'reset') { S.fav = DEF().fav; save(); renderRail(); toast('Панель сброшена'); return; }
      if (k === 'notify') { closeAll(() => setTimeout(notify, 250)); return; }
      if (k === 'darling') { closeAll(() => setTimeout(darling, 250)); return; }
      if (k === 'alert') { closeAll(() => setTimeout(alertOn, 250)); return; }
      if (k === 'lock') { closeAll(() => setTimeout(lockNow, 200)); return; }
      if (k === 'shade') { openShade('ns'); return; }
      if (k === 'unfs') { closeAll(null, false); return; }
      if (k === 'ntf') { hideNtf(); if (NAT) { if (ntfKey && ntfKey !== 'demo') openNote(ntfKey, $('.ntf-ic', P)); else { const c = roleId('chats'); if (c) launch(c, $('.ntf-ic', P)); } return; } launch('chats', $('.ntf-ic', P)); return; }
      if (k.startsWith('n-')) { if (k === 'n-wp') { ncall('setWallpaper', 'both'); toast('Ставлю обои 09…'); return; }
        const m = { 'n-def': 'makeDefault', 'n-notif': 'openNotifAccess', 'n-acc': 'openAccessibility', 'n-cal': 'askCalendar', 'n-loc': 'askLocation', 'n-write': 'askWrite', 'n-batt': 'openBattery', 'n-auto': 'openAutostart', 'n-dream': 'openDream' }[k]; if (m) { if (m === 'askCalendar' || m === 'askLocation' || m === 'makeDefault') ncall(m); else launch('settings', a, { name: 'Настройки', icon: SET_IC(), run: () => ncall(m) }); } return; }
      if (k === 'hello-done') { back(); return; }
      if (k === 'city') { openSettingsApp('wx', a); return; }
      if (k === 'wx-retry') { loadWx(true); return; }
      if (k === 'cal-ev') { const cid = roleId('calendar') || 'calendar', e0 = +a.dataset.id || 0, e1 = +a.dataset.b || Date.now(); launch(cid, a, { name: APP[cid] ? APP[cid].n : 'Календарь', run: NAT ? () => ncall('openEvent', e0, e1) : null }); return; }
      if (k === 'sysshade') { if (ncall('sysShade') !== true) toast('Системная шторка: свайп вниз от статус-бара'); return; }
      if (k === 'sa-info') { const id = saId; backThen(() => { if (NAT) launch('settings', null, { name: 'О приложении', icon: SET_IC(), run: () => ncall('info', id) }); else ncall('info', id); }); return; }
      if (k === 'sa-del') { const id = saId; backThen(() => ncall('uninstall', id)); return; }
      if (k === 'sig') { sig(); return; }
      if (k.startsWith('mp-') && k !== 'mp-open') { musAct(k); return; }
      if (k === 'mp-open') { if (NAT) { if (MD.on) openPlayer($('.home .mp-i', P)); else launchMusic($('.home .mp-i', P)); return; } if (has('o-vault')) backThen(() => launchMusic($('.home .mp-i', P))); else launchMusic($('.home .mp-i', P)); return; }
      if (k === 'al-x') { alertOff(); toast('Отбой тревоги'); return; }
      if (k === 'al-go') { alertOff(); launch('sortie', null, { name: 'Вылет', icon: '<i class="av-hr">' + I.horns + '</i>', lbl: 'STRELIZIA × HIRO', sub: 'FXX-01 · СЕКТОР 13 · СИНХРОНИЗАЦИЯ 100%' }); return; }
      if (k === 'nclear') { clearNotes(); return; }
      if (k === 'nopen') { const nid = a.dataset.id; if (NAT) { backThen(() => openNote(nid, null)); return; } const n = notes.find(x => x.id === nid); if (!n) return; backThen(() => launch(n.app, null)); return; }
      if (k === 'egg') { const ac2 = a.dataset.a; backThen(() => setTimeout(() => { if (ac2 === 'darling') darling(); if (ac2 === 'alert') alertOn(); if (ac2 === 'sig') sig(); if (ac2 === 'chat') { const c = NAT ? roleId('chats') : 'chats'; if (c) launch(c, null, { sub: 'ДИАЛОГ С ХИРО' }); } if (ac2 === 'note') openOv('vault'); }, 120)); return; }
      if (k === 'qa-go') { const id = qaId, sc = NAT ? (QAL[+a.dataset.i] || ['', '', '']) : (SC[id] || [['', '']])[+a.dataset.i], el = $(`.home .rail .app[data-app="${id}"]`, P);
        backThen(() => { if (NAT) { launch(id, el, { sc: sc[2] }); return; } if (id === 'music' && (sc[1] === 'play' || sc[1] === 'shuffle')) launchMusic(el, sc[1] === 'shuffle'); else launch(id, el, sc[1] ? { sub: 'ЯРЛЫК · ' + sc[1] } : {}); }); return; }
      if (k === 'qa-edit') { P.classList.remove('o-qa'); $$('.home .rail .app.held', P).forEach(x => x.classList.remove('held')); stack[stack.length - 1] = 'edit'; P.classList.add('edit'); buzz(); return; }
      if (k === 'qa-rm') { const id = qaId; backThen(() => toggleFav(id)); return; }
      if (k === 'pin') { e.stopPropagation(); const id = a.dataset.id; if (toggleFav(id)) { const on = S.fav.includes(id); a.classList.toggle('on', on); a.innerHTML = on ? I.ck : I.plus; restart(a, 'pulse', 400); } return; }
      if (k === 'sa-open') { const id = saId; backThen(() => { const t = $(`.drw [data-app="${id}"] .ti`, P); if (id === 'music') launchMusic(t); else launch(id, t); }); return; }
      if (k === 'sa-pin') { if (toggleFav(saId)) sheetApp(saId); return; }
      if (k === 'sa-move') { sheetMove(saId); return; }
      if (k === 'sa-back') { sheetApp(saId); return; }
      if (k === 'sa-to') { const c = a.dataset.to; if (c === APP[saId].c) delete S.where[saId]; else S.where[saId] = c; save(); toast(`«${esc(APP[saId].n)}» теперь в «${CAT[c].n}»`); sheetApp(saId); return; }
    }
    const qb = tgt.closest('[data-q]'); if (qb) { qsToggle(qb.dataset.q); hsPaint(); return; }
    const shv = tgt.closest('[data-shv]'); if (shv) { if (S.shade !== shv.dataset.shv) { S.shade = shv.dataset.shv; save(); applyFlags(); paintQuick(); buzz(8); snd('tap'); toast('Шторка: ' + SHV.find(x => x[0] === S.shade)[1]); } return; }
    const fxv = tgt.closest('[data-fxv]'); if (fxv) { if (S.fx !== fxv.dataset.fxv) { S.fx = fxv.dataset.fxv; save(); applyFlags(); paintQuick(); if (fx) fx.resize(); buzz(8); snd('tap'); toast('Эффекты: ' + FXV.find(x => x[0] === S.fx)[1]); } return; }
    const dn = tgt.closest('button[data-down]'); if (dn) { if (S.down !== dn.dataset.down) { S.down = dn.dataset.down; save(); segPos(); toast(S.down === 'shade' ? 'Свайп вниз открывает шторку' : 'Свайп вниз открывает поиск'); } return; }
    const md = tgt.closest('button[data-mode]'); if (md) { S.mode = md.dataset.mode; save(); segPos(); renderList(); ls.scrollTop = 0; return; }
    const sd = tgt.closest('button[data-side]'); if (sd) { if (S.side !== sd.dataset.side) { S.side = sd.dataset.side; save(); P.classList.remove('side-l', 'side-r'); P.classList.add('side-' + S.side); segPos(); renderRail(); if (fx) fx.wake(); toast(S.side === 'l' ? 'Панель слева' : 'Панель справа'); } return; }
    const tg = tgt.closest('[data-tog]'); if (tg) { const k = tg.dataset.tog; S.set[k] = !S.set[k]; save(); syncTogs(); applyFlags(); if (tg.classList.contains('qt')) { buzz(6); snd('tap'); } if (k === 'sound' && S.set.sound) { ac(); setTimeout(() => snd('ok'), 60); } return; }
    const chip = tgt.closest('.chip'); if (chip) { cat = chip.dataset.cat; $$('.chip', P).forEach(c => c.classList.toggle('on', c === chip)); renderList(); ls.scrollTop = 0; chip.scrollIntoView({ inline: 'nearest', block: 'nearest' }); return; }
    const lt = tgt.closest('.lt[data-c]'); if (lt) { const ch = $(`.chip[data-cat="${lt.dataset.c}"]`, P); if (ch) ch.click(); return; }
    if (tgt.closest('.appv')) { back(); return; }
    if (has('edit')) { if (!tgt.closest('.rail')) back(); return; }
    if (has('o-shade') && !tgt.closest('.shade')) { back(); return; }
    if ((has('o-ns') || has('o-cc')) && !has('o-quick') && !tgt.closest('button,.nl-i,.hs-mu,.vs,.hs-perm')) { back(); return; }
    if (tgt.closest('.home .clk,.home .hud,.home .br')) { darling(); return; }
    if (tgt.closest('.home .sync')) { if (S.set.vault) openOv('vault'); else toast('Синхронизация пилотов: Zero Two × Hiro'); return; }
    const ra = tgt.closest('.home .rail .app'); if (ra) { if (ra.dataset.app === 'music') launchMusic(ra); else launch(ra.dataset.app, ra); return; }
    const dt = tgt.closest('.drw .tile,.drw .arow'); if (dt && !has('o-sa')) { if (dt.dataset.app === 'music') launchMusic($('.ti', dt)); else launch(dt.dataset.app, $('.ti', dt)); return; }
    const at = tgt.closest('.s-add .tile'); if (at) { if (toggleFav(at.dataset.app)) at.classList.toggle('sel', S.fav.includes(at.dataset.app)); return; }
    if (S.set.dtap && !ovOpen() && home.contains(tgt) && !tgt.closest('.rail,.mp,[data-w]')) { const now = Date.now(); if (now - lastTap < 340) { lastTap = 0; lockNow(); } else lastTap = now; }
  });
  const inp = $('.srch input', P);
  inp.addEventListener('input', () => { q = inp.value.trim().toLowerCase(); $('.srch', P).classList.toggle('has', !!inp.value); renderList(); ls.scrollTop = 0; });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = $('.drw .tile,.drw .arow', P); if (f) { inp.blur(); f.dataset.app === 'music' ? launchMusic($('.ti', f)) : launch(f.dataset.app, $('.ti', f)); } } });
  const note = $('.note', P); note.addEventListener('input', () => { S.note = note.value; save(); });
  const ci = $('.cityi', P); if (ci) { ci.addEventListener('change', () => { S.city = ci.value.trim(); save(); loadWx(true); toast(S.city ? 'Погода: ' + esc(S.city) : 'Погода по геолокации'); }); ci.addEventListener('keydown', e => { if (e.key === 'Enter') ci.blur(); }); }
  // touch swipe-down closes drawer / sheets
  let ts = null;
  const atEnd = el => el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
  P.addEventListener('touchstart', e => { const t = e.touches[0], sc = e.target.closest('.drw-ls,.sht-sc,.v-in'), hl = e.target.closest('.hs-nl'); ts = { x: t.clientX, y: t.clientY, top: sc ? sc.scrollTop : 0, sc, sht: e.target.closest('.sht'), drw: e.target.closest('.drw'), abc: e.target.closest('.abc'), hl, he: hl ? atEnd(hl) : true }; }, { passive: true });
  P.addEventListener('touchend', e => {
    if (!ts) return; const t = e.changedTouches[0], dy = (t.clientY - ts.y) / scale, dx = (t.clientX - ts.x) / scale, s0 = ts; ts = null;
    if ((has('o-ns') || has('o-cc')) && !has('o-quick') && Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.3 && !(P.__swallow && Date.now() - P.__swallow < 450) && !$('.hs.sw', P)) { P.__swallow = Date.now(); if (dx < 0 && has('o-ns')) hsSwitch('cc'); else if (dx > 0 && has('o-cc')) hsSwitch('ns'); return; }
    // список уведомлений сам скроллится, поэтому свайп вверх по нему закрывает шторку только у нижнего края
    if (s0.hl && (has('o-ns') || has('o-cc')) && !has('o-quick') && dy < -80 && Math.abs(dx) < 90 && s0.he && atEnd(s0.hl) && !(P.__swallow && Date.now() - P.__swallow < 300)) { P.__swallow = Date.now(); back(); return; }
    if (s0.abc || dy < 90 || Math.abs(dx) > 90 || s0.top > 0 || (s0.sc && s0.sc.scrollTop > 0)) return;
    if (s0.sht && (has('o-add') || has('o-set') || has('o-sa') || has('o-tiles'))) { P.__swallow = Date.now(); back(); }
    else if (s0.drw && has('o-drw') && !has('o-add') && !has('o-set') && !has('o-app') && !has('o-sa')) { P.__swallow = Date.now(); back(); }
  }, { passive: true });
  // А–Я scrubber
  const scrub = e => {
    const bs = $$('b', abc); if (!bs.length) return; let best = null, bd = 1e9;
    bs.forEach(b => { const r = b.getBoundingClientRect(), dd = Math.abs(e.clientY - (r.top + r.height / 2)); if (dd < bd) { bd = dd; best = b; } });
    const l = best.dataset.l, h = $(`.lt[data-l="${l}"]`, P); bs.forEach(b => b.classList.toggle('on', b === best));
    if (h) ls.scrollTop = h.offsetTop - 6;
    const pr = P.getBoundingClientRect(), br = best.getBoundingClientRect();
    if (bub.textContent !== l) { buzz(5); snd('tap'); }
    bub.textContent = l; bub.style.top = ((br.top + br.height / 2 - pr.top) / scale - 29) + 'px'; bub.classList.add('on');
  };
  abc.addEventListener('pointerdown', e => { e.stopPropagation(); abc.setPointerCapture(e.pointerId); scrub(e); });
  abc.addEventListener('pointermove', e => { if (abc.hasPointerCapture(e.pointerId)) scrub(e); });
  const se = () => { bub.classList.remove('on'); $$('b', abc).forEach(b => b.classList.remove('on')); };
  abc.addEventListener('pointerup', se); abc.addEventListener('pointercancel', se);
  // brightness slider
  const tr = $('.brt-tr', P);
  const setB = e => { const r = tr.getBoundingClientRect(); S.brt = clamp((e.clientX - r.left) / r.width, NAT ? .02 : .2, 1); paintBrt(); if (NAT) brSend(); };
  tr.addEventListener('pointerdown', e => { e.stopPropagation(); brDrag = true; tr.setPointerCapture(e.pointerId); setB(e); });
  tr.addEventListener('pointermove', e => { if (tr.hasPointerCapture(e.pointerId)) setB(e); });
  tr.addEventListener('pointerup', e => { e.stopPropagation(); brDrag = false; save(); if (NAT && !ST.write && !S.wAsked) { S.wAsked = true; save(); toast('Для системной яркости разреши «Изменение настроек»'); setTimeout(() => ncall('askWrite'), 1100); } }); tr.addEventListener('click', e => e.stopPropagation());
  // вертикальные ползунки пункта управления: тянутся относительно пальца, как в HyperOS
  $$('.vs', P).forEach(vs => {
    const k = vs.dataset.vs; let y0 = 0, v0 = 0;
    const setV = e => { const r = vs.getBoundingClientRect(), v = clamp(v0 + (y0 - e.clientY) / r.height, k === 'brt' ? (NAT ? .02 : .2) : 0, 1);
      if (k === 'brt') { S.brt = v; paintBrt(); if (NAT) brSend(); } else { VOL = v; S.vol = v; hsPaint(); if (NAT) volSend(); } };
    vs.addEventListener('pointerdown', e => { e.stopPropagation(); if (k === 'brt') brDrag = true; else volDrag = true; y0 = e.clientY; v0 = k === 'brt' ? S.brt : VOL; try { vs.setPointerCapture(e.pointerId); } catch (_) {} vs.classList.add('drag'); buzz(5); });
    vs.addEventListener('pointermove', e => { if (vs.hasPointerCapture && vs.hasPointerCapture(e.pointerId)) setV(e); });
    const up = e => { e.stopPropagation(); if (!vs.classList.contains('drag')) return; vs.classList.remove('drag');
      if (k === 'brt') { brDrag = false; save(); if (NAT && !ST.write && !S.wAsked) { S.wAsked = true; save(); toast('Для системной яркости разреши «Изменение настроек»'); setTimeout(() => ncall('askWrite'), 1100); } } else { volDrag = false; save(); } };
    vs.addEventListener('pointerup', up); vs.addEventListener('pointercancel', up); vs.addEventListener('click', e => e.stopPropagation());
  });
  // hold to sync
  const hb = $('.hold', P);
  hb.addEventListener('pointerdown', e => { e.stopPropagation(); try { hb.setPointerCapture(e.pointerId); } catch (_) {} if (S.set.sound) ac(); holdStart(); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => hb.addEventListener(ev, e => { e.stopPropagation(); holdStop(); }));
  hb.addEventListener('contextmenu', e => e.preventDefault());
  // lock screen
  let lst = null, ltp = 0, fpT = null;
  const fpEl = $('.fp', P);
  lk.addEventListener('pointerdown', e => { e.stopPropagation(); if (S.set.sound) ac(); lst = { x: e.clientX, y: e.clientY };
    if (e.target.closest('.fp')) { fpEl.classList.add('on'); clearTimeout(fpT); fpT = setTimeout(() => { fpEl.classList.remove('on'); fpEl.classList.add('ok'); setTimeout(() => fpEl.classList.remove('ok'), 600); unlock(true); }, 560); } });
  const lkEnd = e => { e.stopPropagation(); clearTimeout(fpT); fpEl.classList.remove('on'); if (!lst) return; const dy = (e.clientY - lst.y) / scale; lst = null;
    if (dy < -70) { unlock(); return; } const now = Date.now(); if (now - ltp < 340) { ltp = 0; unlock(); } else ltp = now; };
  lk.addEventListener('pointerup', lkEnd); lk.addEventListener('pointercancel', e => { e.stopPropagation(); clearTimeout(fpT); fpEl.classList.remove('on'); lst = null; });
  lk.addEventListener('click', e => e.stopPropagation());
  // drag reorder in edit mode
  function startDrag(el, e, s0) {
    const sib = $$('.home .rail .app', P);
    drag = { el, y0: s0 ? s0.y * scale + P.getBoundingClientRect().top : e.clientY, sib, from: sib.indexOf(el), to: sib.indexOf(el), centers: sib.map(s => { const r = s.getBoundingClientRect(); return r.top + r.height / 2; }) };
    el.classList.add('drag'); try { P.setPointerCapture(e.pointerId); } catch (_) {} moveDrag(e);
  }
  function moveDrag(e) {
    const dy = e.clientY - drag.y0; drag.el.style.setProperty('--dy', dy / scale + 'px');
    const c = drag.centers[drag.from] + dy; let to = 0; drag.centers.forEach((cc, i) => { if (c > cc) to = i; });
    if (c < drag.centers[0]) to = 0; const nt = clamp(to, 0, drag.sib.length - 1); if (nt !== drag.to) { buzz(5); snd('tap'); } drag.to = nt;
    const step = drag.sib.length > 1 ? (drag.centers[1] - drag.centers[0]) / scale : 0;
    drag.sib.forEach((s, i) => { if (s === drag.el) return; let off = 0;
      if (drag.from < drag.to && i > drag.from && i <= drag.to) off = -step; if (drag.from > drag.to && i < drag.from && i >= drag.to) off = step;
      s.style.translate = `0 ${off}px`; s.style.transition = 'translate .2s'; });
  }
  function endDrag() {
    const [m] = S.fav.splice(drag.from, 1); S.fav.splice(drag.to, 0, m); save();
    drag.el.classList.remove('drag'); drag.sib.forEach(s => { s.style.translate = ''; }); drag = null; renderRail();
  }
}

/* ───────── fullscreen ───────── */
function enterFS() {
  closeAll(() => {
    if (stage.classList.contains('fs')) return;
    if (has('locked')) P.classList.remove('locked');
    stage.classList.add('fs'); document.body.classList.add('lx-open'); push('fs');
    const de = document.documentElement; if (de.requestFullscreen && !document.fullscreenElement) de.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    requestAnimationFrame(() => { fit(); boot(() => enter()); });
  }, false);
}
function exitFS() {
  stage.classList.remove('fs'); document.body.classList.remove('lx-open');
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  requestAnimationFrame(fit);
}

/* ───────── demos on the page ───────── */
const ready = f => () => { if (has('locked')) P.classList.remove('locked', 'unlocking'); alertOff(); closeAll(f); };
const DEMO = {
  lock: ready(() => setTimeout(lockNow, 150)),
  shade: ready(() => setTimeout(() => openShade('ns'), 120)),
  vault: ready(() => setTimeout(() => openOv('vault'), 120)),
  pilots: ready(() => { openOv('vault'); setTimeout(() => { holdReset(); holdStart(); }, 600); }),
  qa: ready(() => setTimeout(() => { const el = $('.home .rail .app[data-app="camera"]', P) || $('.home .rail .app', P); openQA(el); }, 120)),
  player: ready(() => setTimeout(() => { mus.on = true; mus.play = true; paintMus(); toast('Kiss of Death · Mika Nakashima × HYDE'); }, 120)),
  alert: ready(() => setTimeout(alertOn, 150)),
  tilt: ready(() => { if (!S.set.tilt) { S.set.tilt = true; save(); syncTogs(); } tilt.demo = performance.now(); if (fx) fx.wake(); toast(tilt.gyro ? 'Наклони телефон' : 'Так HUD плывёт при наклоне'); }),
  eggs: ready(() => { openOv('drw'); setTimeout(() => { const i = $('.srch input', P); i.value = '002'; i.dispatchEvent(new Event('input')); }, 350); }),
  sig: ready(() => setTimeout(sig, 150)),
  badges: ready(() => setTimeout(() => { notify(); setTimeout(() => { hideNtf(); notify(); }, 1500); }, 150)),
  darling: ready(() => setTimeout(darling, 120)),
  sparks: ready(() => { if (!S.set.sparks || !S.set.scan || S.qs.eco) { S.set.sparks = S.set.scan = true; S.qs.eco = false; save(); applyFlags(); syncTogs(); }
    const sc = $('.scan', P); sc.classList.remove('now'); void sc.offsetWidth; sc.classList.add('now'); fx.burst(); }),
  rail: ready(() => setTimeout(() => setExp(true), 120)),
  drawer: ready(() => { if (S.mode !== 'cat') { S.mode = 'cat'; segPos(); } openOv('drw'); }),
  az: ready(() => { S.mode = 'az'; save(); segPos(); openOv('drw'); }),
  search: ready(() => { openOv('drw'); setTimeout(() => { const i = $('.srch input', P); i.value = 'му'; i.dispatchEvent(new Event('input')); }, 350); }),
  menu: ready(() => { openOv('drw'); setTimeout(() => { sheetApp('music'); openOv('sa'); }, 450); }),
  edit: ready(() => openOv('edit')),
  launch: ready(() => setTimeout(() => { const el = $('.home .rail .app[data-app="camera"]', P) || $('.home .rail .app', P); launch(el.dataset.app, el); }, 120)),
  notify: ready(() => setTimeout(notify, 150)),
  settings: ready(() => openSettingsApp('')),
};
$$('[data-demo]').forEach(b => b.addEventListener('click', () => {
  if (S.set.sound) ac();
  if (!stage.classList.contains('fs') && window.innerWidth < 900) stage.closest('.phw').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => DEMO[b.dataset.demo](), window.innerWidth < 900 ? 320 : 0);
}));
$$('[data-fs]').forEach(b => b.addEventListener('click', () => { if (S.set.sound) ac(); enterFS(); }));

build(); enter(); setInterval(() => tick(false), 3000);
setInterval(() => { if (!P || document.hidden || holdDone || !RESUMED) return; const v = (97 + Math.floor(Math.random() * 4)) + '%'; $$('[data-sync],[data-sync2]', P).forEach(b => b.textContent = v); }, 2600);
if (!SHOT && !NAT) setTimeout(() => { if (!ovOpen() && !has('locked')) notify(); }, 9000);
function refreshStatus() {
  if (!NAT || !P) return; ST = Object.assign(ST, nj('status', {}) || {});
  $$('[data-stv]', P).forEach(e => { const k = e.dataset.stv; if (!(k in ST)) return; e.textContent = ST[k] ? 'да' : 'нет'; e.classList.toggle('on', !!ST[k]); });
  $$('[data-model]', P).forEach(x => x.textContent = ST.model || 'POCO');
}
function reloadApps() { loadApps(); sanitize(); save(); if (!P) return; renderRail(); if (has('o-drw')) renderList(); if (has('o-add')) renderAdd(); loadNotifs(); }
function setInsets(p) {
  if (!P || !p) return; const k = 1 / (scale || 1), kb = p.kb || 0;
  P.style.setProperty('--sat', ((p.t || 0) * k).toFixed(1) + 'px'); P.style.setProperty('--sab', ((p.b || 0) * k).toFixed(1) + 'px'); P.style.setProperty('--kb', (kb * k).toFixed(1) + 'px');
  P.classList.toggle('kb-on', kb > 40);
  if (kb > 40) { const a = document.activeElement; if (a && /INPUT|TEXTAREA/.test(a.tagName)) setTimeout(() => a.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80); }
}
function nativeBack() { if (has('locked')) return; if (stack.length) { back(); return; } if (has('exp')) { setExp(false); return; } if (has('alert-on')) { alertOff(); return; } hideNtf(); }
window.addEventListener('storage', e => { if (e.key === PKEY) reloadPrefs(null); if (e.key === CKEY) runCmd(); });
document.addEventListener('visibilitychange', () => { if (fx) fx.wake(); });
function onNative(name, p) {
  switch (name) {
    case 'back': nativeBack(); break;
    case 'home': case 'homeFrom': launchDone(); if (has('alert-on')) alertOff(); hideNtf(); setExp(false); closeAll(); break;
    case 'resume': RESUMED = true; reloadPrefs(null); runCmd(); launchDone(); RING = ncall('ringer') || 'normal'; tilt.base = null; loadQS(); loadMedia(); loadNotifs(); refreshStatus(); tick(true);
      if (has('o-vault')) { loadSys(); loadCal(); }
      if (ARM) { if (unlockAt && Date.now() - unlockAt < 4000) { unlockAt = 0; boot(() => enter()); } else { clearTimeout(armT); armT = setTimeout(() => { if (ARM && RESUMED) boot(() => enter()); }, 1600); } }
      if (fx) fx.wake(); break;
    case 'pause': RESUMED = false; hideNtf(); setExp(false); if (busy) setTimeout(() => { if (!RESUMED) { clearTimeout(lxT); const lx = P && $('.lx', P); if (lx) lx.classList.remove('on', 'ok', 'bye'); busy = false; } }, 450); if (has('o-qa')) back(); break;
    case 'apps': reloadApps(); break;
    case 'notifs': loadNotifs(); break;
    case 'posted': onPosted(p); break;
    case 'media': loadMedia(); break;
    case 'bat': if (p) { bat = { level: (p.bat || 0) / 100, charging: !!p.chg }; paintBat(); } break;
    case 'qs': loadQS(); break;
    case 'insets': setInsets(p); break;
    case 'screenOff': bootArm(false); if (has('o-qa')) back(); break;
    case 'unlock': if (!ARM) break; if (RESUMED && !document.hidden) boot(() => enter()); else { unlockAt = Date.now(); clearTimeout(armT); armT = setTimeout(() => { if (!RESUMED) bootDisarm(); }, 1500); } break;
    case 'settings': reloadPrefs(p); break;
    case 'perm': refreshStatus(); loadCal(); loadNotifs(); loadMedia(); if (p === 'loc') loadWx(true); break;
    case 'loc': loadWx(true); break;
    case 'toast': toast(esc(String(p))); break;
    case 'fail': launchFail(); break;
  }
}
if (NAT) {
  window.LXN = (name, p) => { try { onNative(name, p); } catch (e) { ncall('log', String((e && e.stack) || e)); } };
  loadNotifs(); loadQS(); loadMedia(); loadCal(); refreshStatus(); loadSys(); loadWx(false); paintWx();
  setInterval(() => { if (RESUMED && !document.hidden && (mus.on || has('o-vault'))) loadMedia(); }, 2500);
  setInterval(() => { if (RESUMED && !document.hidden && has('o-vault')) loadSys(); }, 15000);
  if (!S.hello && !S.setup) setTimeout(() => { if (!ovOpen() && !S.setup) openOv('hello'); }, 1400);
  ncall('ready');
}
window.LX = { demo: k => DEMO[k](), ov: openOv, back, closeAll, launch: id => { const el = $(`.home .rail .app[data-app="${id}"]`, P); id === 'music' ? launchMusic(el) : launch(id, el); }, notify, darling, fs: enterFS, setExp,
  search: s => { const i = $('.srch input', P); i.value = s; i.dispatchEvent(new Event('input')); }, sheet: id => { sheetApp(id); openOv('sa'); }, move: id => sheetMove(id), lock: lockNow, unlock, alert: alertOn, alertOff, sig,
  qa: id => openQA($(`.home .rail .app[data-app="${id}"]`, P)), mus: (on, play) => { mus.on = on; mus.play = play; paintMus(); }, hold: () => { holdReset(); holdStart(); }, qs: qsToggle, brt: v => { S.brt = v; paintBrt(); }, tilt: (x, y) => { tilt.tx = x; tilt.ty = y; }, mt: (i, t) => { mus.i = i; mus.t = t; paintMus(); },
  native: onNative, get P() { return P; }, dismiss: (id, dir) => { const box = !P ? null : has('o-ns') ? $('.hs-nl', P) : has('o-shade') ? $('.nl-ls', P) : null, el = box ? [...box.children].find(c => c.dataset.id === String(id) && !c.classList.contains('out')) : null; dismissNote(id, el || null, dir || 1); }, clearNotes, get S() { return S; }, quick: () => openOv('quick'), ns: () => openOv('ns'), cc: () => openOv('cc'), hsSwitch, prefs: prefsOf, reloadPrefs, get ARM() { return ARM; },
  shade: openShade, tiles: openTiles, tileTap, teAct, settingsApp: openSettingsApp, runCmd, get TILES() { return TILES; }, get TS() { return TS; },
  pull: (side, k) => hsDrag(side, k), pullEnd: (side, open) => hsDragEnd(side, open) };
})();
