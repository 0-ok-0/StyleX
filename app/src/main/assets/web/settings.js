/* Стрелиция · приложение настроек (SettingsActivity). Мост: window.Android = SetBridge, события: window.SXN(name, payload) */
(() => {
'use strict';
const A = window.Android || null, NAT = !!A;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nj = (f, d, ...a) => { try { const r = A && typeof A[f] === 'function' ? A[f](...a) : null; return r ? JSON.parse(r) : d; } catch (e) { return d; } };
const call = (f, ...a) => { try { return A && typeof A[f] === 'function' ? A[f](...a) : undefined; } catch (e) { return undefined; } };

/* ───────── предпочтения: тот же ключ, что читает лаунчер ───────── */
const PKEY = 'strelizia-prefs-1', CKEY = 'strelizia-cmd-1';
const DEFP = () => ({ shade: 'strel', fx: 'bal', down: 'shade', side: 'r', mode: 'cat', city: '', setup: false, isl: { on: false, shape: 'auto', style: 'neon', mus: true, chg: true, ntf: true },
  set: { sparks: true, scan: true, tilt: true, widget: true, sound: true, haptic: true, swipe: true, dtap: true, vault: true, anim: true, fast: false, bootUnlock: true, banners: true } });
const ENUM = { shade: ['strel', 'one'], fx: ['max', 'bal', 'eco'], down: ['shade', 'search'], side: ['l', 'r'], mode: ['cat', 'az'] };
function loadPrefs() {
  let p = null; try { p = JSON.parse(localStorage.getItem(PKEY) || 'null'); } catch (e) {}
  if (!p || typeof p !== 'object') { try { const s = JSON.parse(localStorage.getItem('strelizia-launcher-1') || 'null'); if (s && typeof s === 'object') p = s; } catch (e) {} }
  const d = DEFP(); if (!p || typeof p !== 'object') return d;
  if (p.shade === 'hyper') p = Object.assign({}, p, { shade: 'strel' });
  const o = { set: Object.assign(d.set, p.set && typeof p.set === 'object' ? p.set : {}) };
  for (const k in ENUM) o[k] = ENUM[k].includes(p[k]) ? p[k] : d[k];
  o.city = typeof p.city === 'string' ? p.city : ''; o.setup = !!p.setup;
  const iv = p.isl && typeof p.isl === 'object' ? p.isl : {}; o.isl = { on: typeof iv.on === 'boolean' ? iv.on : d.isl.on, shape: ['auto', 'pill', 'drop', 'notch'].includes(iv.shape) ? iv.shape : d.isl.shape, style: ['neon', 'black'].includes(iv.style) ? iv.style : d.isl.style, mus: iv.mus !== false, chg: iv.chg !== false, ntf: iv.ntf !== false };
  return o;
}
let PR = loadPrefs();
function save() {
  const s = JSON.stringify(PR);
  try { localStorage.setItem(PKEY, s); } catch (e) {}
  call('settingsChanged', s); call('island', JSON.stringify(PR.isl));
}
const cmd = k => { try { localStorage.setItem(CKEY, JSON.stringify({ k, at: Date.now() })); } catch (e) {} };
let ST = {};
function loadStatus() { ST = nj('status', {}) || {}; }

/* ───────── оформление: как в системе ───────── */
function theme() {
  let dark = false;
  if (NAT && typeof A.night === 'function') dark = !!call('night');
  else try { dark = matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}
  document.documentElement.classList.toggle('dark', dark);
}

/* ───────── значки ───────── */
const SV = (p, w = 1.8) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC = {
  isl: SV('<rect x="5" y="2.5" width="14" height="19" rx="3"/><rect x="8.5" y="4.5" width="7" height="3" rx="1.5" fill="currentColor"/>'),
  back: SV('<path d="M15 5 8 12l7 7"/>', 2), chev: SV('<path d="m9 6 6 6-6 6"/>', 2.2), search: SV('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>', 2), x: SV('<path d="M6 6l12 12M18 6 6 18"/>', 2.2), ck: SV('<path d="m5 12.5 4.2 4.2L19 7"/>', 2.6),
  desk: SV('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m4 16 4.5-4.5L13 16l2.5-2.5L20 18"/><circle cx="15" cy="8" r="1.6"/>'),
  shade: SV('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M4 11h16"/><path d="M8 7h3M13 7h3"/>'),
  rail: SV('<rect x="4" y="3" width="16" height="18" rx="3"/><rect x="14.5" y="7" width="3" height="10" rx="1.2"/>'),
  grid: SV('<rect x="4.5" y="4.5" width="6" height="6" rx="1.6"/><rect x="13.5" y="4.5" width="6" height="6" rx="1.6"/><rect x="4.5" y="13.5" width="6" height="6" rx="1.6"/><rect x="13.5" y="13.5" width="6" height="6" rx="1.6"/>'),
  fx: SV('<path d="M12 3.5c.7 4.4 2.6 6.4 7 7.2-4.4.8-6.3 2.8-7 7.3-.7-4.5-2.6-6.5-7-7.3 4.4-.8 6.3-2.8 7-7.2Z"/><path d="M18.5 16.5v4M16.5 18.5h4"/>'),
  hand: SV('<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6.5 6.5 0 0 1-6.5 6.5h-.3a6 6 0 0 1-4.8-2.4L4.6 15a1.5 1.5 0 0 1 2.3-1.9L9 15"/>'),
  snd: SV('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4Z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>'),
  bell: SV('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
  wx: SV('<path d="M7.5 18.5h9a4 4 0 0 0 .4-8A5.5 5.5 0 0 0 6.4 9.6 4.5 4.5 0 0 0 7.5 18.5Z"/>'),
  lock: SV('<rect x="5" y="10.5" width="14" height="10" rx="2.4"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>'),
  shield: SV('<path d="M12 3.5 19 6v5.5c0 4.4-3 7.8-7 9-4-1.2-7-4.6-7-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>'),
  info: SV('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.2"/>'),
  home: SV('<path d="M4 11 12 4l8 7v9h-5.5v-6h-5v6H4Z"/>'), bat: SV('<rect x="3.5" y="7.5" width="15" height="9" rx="2.2"/><path d="M21 10.5v3"/><path d="M6.5 10.5v3M9.5 10.5v3"/>'),
  cal: SV('<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>'), loc: SV('<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>'),
  sun: SV('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'),
  moon: SV('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/>'), rocket: SV('<path d="M12 15c-1.5-1.5-2.5-3.6-2.5-6A9 9 0 0 1 12 3a9 9 0 0 1 2.5 6c0 2.4-1 4.5-2.5 6Z"/><path d="M9.6 12.5 6.5 15l1 3.5 2.5-2M14.4 12.5l3.1 2.5-1 3.5-2.5-2M12 15v5"/>'),
  acc: SV('<circle cx="12" cy="5" r="1.8"/><path d="M5 8.5c2.3.8 4.6 1.2 7 1.2s4.7-.4 7-1.2M12 9.7v4.3M9 21l3-7 3 7"/>'), wp: SV('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m4 16 4.5-4.5L13 16l2.5-2.5L20 18"/>'),
  aod: SV('<rect x="6" y="2.5" width="12" height="19" rx="2.6"/><path d="M10 9h4M9.5 12h5"/>'), key: SV('<circle cx="8" cy="15" r="3.5"/><path d="m10.5 12.5 8-8M16 7l2 2M14 9l1.5 1.5"/>'),
  play: SV('<path d="M8 5.5v13l10.5-6.5Z"/>'), reset: SV('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3L4.5 9"/><path d="M4.5 4.5V9H9"/>'), tg: SV('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M9 21v-3h6v3"/>')
};
const HORNS = '<svg class="horns" viewBox="0 0 64 30" fill="rgba(255,43,58,.18)" stroke="#ff2b3a" stroke-width="1.6" stroke-linejoin="round"><path d="M23 28C21 17 15.5 8.5 5.5 2.5c3.6 9 6.6 17 8.6 25.5Z"/><path d="M41 28c2-11 7.5-19.5 17.5-25.5-3.6 9-6.6 17-8.6 25.5Z"/></svg>';
const C = { red: '#ff5a5f', blue: '#3482ff', orange: '#ff9f0a', teal: '#30b0c7', purple: '#af52de', green: '#34c759', pink: '#ff2d55', alert: '#ff3b30', sky: '#0a84ff', gray: '#8e8e93', graph: '#636366', indigo: '#5856d6', yellow: '#ffcc00' };

/* ───────── строительные блоки ───────── */
const icon = (svg, c) => `<span class="ic" style="--c:${c}">${svg}</span>`;
const grp = (t, rows, cls = '') => `<div class="grp">${t ? `<h3>${t}</h3>` : ''}<div class="card ${cls}">${rows}</div></div>`;
const navRow = (id, ic, c, t, s) => `<button class="row" data-go="${id}" data-k="${id}">${icon(ic, c)}<span class="tx"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span><span class="val" data-val="${id}"></span><i class="chev">${IC.chev}</i></button>`;
const tgRow = (k, t, s, ic, c) => `<button class="row${ic ? '' : ' noic'}" data-tg="${k}" data-k="${k}">${ic ? (ic.startsWith('gi') ? `<span class="${ic}" style="--c:${c}"></span>` : icon(ic, c)) : ''}<span class="tx"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span><i class="sw"></i></button>`;
const rdRow = (k, v, t, s) => `<button class="row rd noic" data-pr="${k}" data-v="${v}" data-k="${k}-${v}"><span class="tx"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span><i class="ck">${IC.ck}</i></button>`;
const actRow = (act, ic, c, t, s, st) => `<button class="row" data-act="${act}" data-k="${act}">${ic ? icon(ic, c) : ''}<span class="tx"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span>${st ? `<span class="chip" data-st="${st}"></span>` : `<i class="chev">${IC.chev}</i>`}</button>`;
const seg = (k, opts) => `<div class="seg" data-seg="${k}" style="--n:${opts.length}"><i></i>${opts.map(([v, t]) => `<button data-pr="${k}" data-v="${v}">${t}</button>`).join('')}</div>`;
const opt = (k, v, inner, t, s) => `<button class="opt" data-pr="${k}" data-v="${v}" data-k="${k}-${v}">${inner}<b>${t}</b>${s ? `<small>${s}</small>` : ''}<i class="ck">${IC.ck}</i></button>`;
const note = t => `<p class="note">${t}</p>`;
/* мини-телефон: класс меняет paint(), поэтому превью всегда показывает текущие настройки */
const phone = (kind, extra = '') => `<div class="ph" data-ph="${kind}"><div class="hud"><b>20</b><b>02</b><small>STRELIZIA · 起動</small></div>
 <i class="spk">${'<i></i>'.repeat(10)}</i><i class="scan"></i><i class="mp"></i><div class="rail"><i></i><i></i><i></i><i></i><i></i></div>
 <i class="sh sh-n"><i class="t"></i><i class="n1"></i><i class="n2"></i><i class="n3"></i><i class="x"></i></i>
 <i class="sh sh-c"><i class="t"></i><i class="a"></i><i class="b"></i><i class="m"></i><i class="s1"></i><i class="s2"></i><i class="r"></i></i>
 <i class="sh sh-o"><i class="t"></i><i class="q1"></i><i class="q2"></i><i class="q3"></i><i class="q4"></i><i class="l1"></i><i class="l2"></i></i>
 <i class="dr"><i class="h cat" style="top:9%"></i>${[0, 1, 2, 3].map(i => `<i class="g cat" style="left:${8 + i * 22}%;top:15%"></i><i class="g cat" style="left:${8 + i * 22}%;top:25%"></i>`).join('')}<i class="h cat" style="top:36%"></i>${[0, 1, 2, 3].map(i => `<i class="g cat" style="left:${8 + i * 22}%;top:42%"></i>`).join('')}
  ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => (i % 3 === 0 ? `<i class="lt azl" style="top:${9 + i * 7.5}%"></i>` : '') + `<i class="w azl" style="left:20%;top:${9 + i * 7.5}%"></i>`).join('')}</i>
 <i class="bn"></i><i class="bt"><i></i><i></i><i></i><i></i></i><i class="fg"></i>${extra}</div>`;
const PHC = {
  hero: () => 'ph' + (PR.side === 'l' ? ' l' : '') + (PR.set.sparks && PR.fx !== 'eco' ? ' spk' : '') + (PR.set.scan && PR.fx !== 'eco' ? ' scan' : '') + (PR.fx === 'bal' ? ' bal' : '') + (PR.set.widget ? '' : ' nowid'),
  desk: () => PHC.hero() + (PR.set.tilt && PR.fx !== 'eco' ? ' tilt' : ''),
  shade: () => 'ph demo ' + PR.shade + (PR.side === 'l' ? ' l' : '') + (PR.shade === 'strel' ? ' strel' : ''),
  shv: v => v === 'one' ? 'ph one' : 'ph cc' + (v === 'strel' ? ' strel' : ''),
  rail: () => 'ph' + (PR.side === 'l' ? ' l' : '') + ' nowid',
  list: () => 'ph drw' + (PR.mode === 'az' ? ' az' : ''),
  notif: () => 'ph' + (PR.set.banners ? ' bn' : '') + (PR.side === 'l' ? ' l' : ''),
  boot: () => 'ph' + (PR.set.bootUnlock && PR.set.anim ? ' boot' : '') + (PR.side === 'l' ? ' l' : '')
};

/* ───────── подписи и статусы ───────── */
const SHN = { strel: 'Стрелиция', one: 'Классика' }, FXN = { max: 'Максимум', bal: 'Баланс', eco: 'Эко' };
const PERM = [['def', 'Рабочий стол по умолчанию', 'кнопка «Домой» открывает Стрелицию', IC.home, C.blue, 'makeDefault'],
  ['notif', 'Доступ к уведомлениям', 'шторка, счётчики, мини-плеер, плашки', IC.bell, C.alert, 'openNotifAccess'],
  ['acc', 'Служба «Стрелиция: блокировка»', 'двойной тап гасит экран, скриншот из шторки', IC.acc, C.indigo, 'openAccessibility'],
  ['cal', 'Календарь', 'события на сегодня в App Vault', IC.cal, C.orange, 'askCalendar'],
  ['loc', 'Геолокация', 'погода без ввода города', IC.loc, C.green, 'askLocation'],
  ['write', 'Изменение системных настроек', 'яркость и автоповорот из шторки', IC.sun, C.yellow, 'askWrite'],
  ['dnd', 'Доступ к «Не беспокоить»', 'плитка в пункте управления', IC.moon, C.purple, 'openDndAccess'],
  ['batt', 'Батарея без ограничений', 'HyperOS не выгружает лаунчер', IC.bat, C.teal, 'openBattery'],
  ['auto', 'Автозапуск', 'службы живут после перезагрузки', IC.rocket, C.graph, 'openAutostart']];
let CUT = null;
const THEMES = [['01', 'Тема 01', '#ff7a59'], ['02', 'Тема 02', '#5ac8fa'], ['03', 'Тема 03', '#ffd60a'], ['04', 'Тема 04', '#30d158'], ['05', 'Тема 05', '#bf5af2'], ['06', 'Тема 06', '#ff375f'], ['07', 'Тема 07', '#64d2ff'], ['08', 'Тема 08', '#ff9f0a'], ['09', 'Стрелиция', '#ff2b3a'], ['10', 'Тема 10', '#8e8eff']];
const ISLK = { hole: 'точка', drop: 'капля', notch: 'чёлка', none: 'нет выреза' };
const islShape = () => PR.isl.shape !== 'auto' ? PR.isl.shape : ({ drop: 'drop', notch: 'notch' }[CUT && CUT.kind] || 'pill');
const ISLN = { auto: 'Авто', pill: 'Пилюля', drop: 'Капля', notch: 'Чёлка' };
const islTg = (k, t, s, ic, c) => `<button class="row${ic ? '' : ' noic'}" data-it="${k}" data-k="isl-${k}">${ic ? icon(ic, c) : ''}<span class="tx"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span><i class="sw"></i></button>`;
const islRd = (k, v, t, s) => `<button class="row rd noic" data-ip="${k}" data-v="${v}" data-k="${k}-${v}"><span class="tx"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</span><i class="ck">${IC.ck}</i></button>`;
const islPv = () => `<div class="ipv" data-ipv><i class="ipv-sb"><b>13:33</b><span>76</span></i><i class="ipv-cut"></i><span class="ipv-i"><i class="ipv-ic">${IC.snd}</i><b>Kiss of Death</b><i class="ipv-eq"><i></i><i></i><i></i><i></i></i></span></div>`;
const permN = () => { const ks = PERM.filter(p => p[0] !== 'auto').map(p => p[0]); return [ks.filter(k => ST[k]).length, ks.length]; };
const VAL = {
  desk: () => [PR.set.sparks && 'искры', PR.set.scan && 'сканер', PR.set.tilt && 'параллакс'].filter(Boolean).join(', ') || 'без эффектов',
  shade: () => SHN[PR.shade], rail: () => PR.side === 'l' ? 'слева' : 'справа', list: () => PR.mode === 'az' ? 'А–Я' : 'категории',
  fx: () => FXN[PR.fx] + (PR.set.anim ? '' : ', без анимаций'),
  gest: () => { const n = ['swipe', 'vault', 'dtap'].filter(k => PR.set[k]).length; return n + ' из 3'; },
  sound: () => PR.set.sound && PR.set.haptic ? 'всё вкл' : PR.set.sound ? 'звуки' : PR.set.haptic ? 'вибрация' : 'тишина',
  notif: () => PR.set.banners ? 'плашки вкл' : 'плашки выкл', isl: () => PR.isl.on ? ISLN[islShape()].toLowerCase() : 'выкл', wx: () => PR.city || 'геолокация', lock: () => 'системный',
  perm: () => { const [a, b] = permN(); return NAT ? a + ' из ' + b : 'демо'; }, about: () => ST.ver ? 'версия ' + ST.ver : ''
};

/* ───────── страницы ───────── */
const PAGES = {
  root: { t: 'Стрелиция' }, desk: { t: 'Рабочий стол' }, shade: { t: 'Шторка' }, themes: { t: 'Темы' }, isl: { t: 'Островок' }, rail: { t: 'Панель приложений' }, list: { t: 'Список приложений' }, fx: { t: 'Анимации и эффекты' },
  gest: { t: 'Жесты' }, sound: { t: 'Звук и вибрация' }, notif: { t: 'Уведомления' }, wx: { t: 'Погода' }, lock: { t: 'Экран блокировки' }, perm: { t: 'Разрешения' }, about: { t: 'О лаунчере' }
};
function hero() {
  const on = !!ST.def;
  return `<div class="hero" data-hero>${phone('hero')}<div class="hero-r"><b><i class="dot${on ? ' on' : ''}"></i>${on ? 'Лаунчер включён' : 'Лаунчер не запущен'}</b>
   <span>${on ? 'Кнопка «Домой» открывает Стрелицию. Здесь все её настройки' : NAT ? 'Сейчас «Домой» ведёт на системный рабочий стол' : 'Демо в браузере: настройки сохраняются, кнопки показывают, что сделает телефон'}</span>
   ${on ? `<button class="hero-sw" data-act="def-off"><span>Включён</span><i class="sw on"></i></button><button class="btn2" data-act="home" style="margin-top:8px">Открыть рабочий стол</button>`
        : `<button class="btn" data-act="launch">Запустить лаунчер</button><button class="btn2" data-act="try">Попробовать</button>`}</div></div>`;
}
const R = {
  root: () => `<label class="srch">${IC.search}<input type="search" placeholder="Поиск настроек" autocomplete="off" spellcheck="false" enterkeyhint="search"><button class="x" data-act="sclr" aria-label="Очистить">${IC.x}</button></label>
   <div class="res" hidden></div><div class="main">${hero()}
   ${grp('Оформление', navRow('themes', IC.desk, C.purple, 'Темы', '09 Стрелиция') + navRow('desk', IC.desk, C.red, 'Рабочий стол', 'обои, искры, сканер, виджеты') + navRow('shade', IC.shade, C.blue, 'Шторка и пункт управления', 'вид, плитки, жест вниз') + navRow('isl', IC.isl, C.red, 'Островок', 'музыка, зарядка, уведомления у камеры') + navRow('rail', IC.rail, C.orange, 'Панель приложений', 'сторона, порядок') + navRow('list', IC.grid, C.teal, 'Список приложений', 'категории или алфавит'))}
   ${grp('Поведение', navRow('fx', IC.fx, C.purple, 'Анимации и эффекты', 'качество, загрузка, запуск') + navRow('gest', IC.hand, C.green, 'Жесты', 'свайпы и двойной тап') + navRow('sound', IC.snd, C.pink, 'Звук и вибрация', 'сигналы HUD и отклик') + navRow('notif', IC.bell, C.alert, 'Уведомления', 'плашки и доступ'))}
   ${grp('Данные и система', navRow('wx', IC.wx, C.sky, 'Погода', 'город или геолокация') + navRow('lock', IC.lock, C.graph, 'Экран блокировки', 'PIN, пароль, ключ, отпечаток, лицо') + navRow('perm', IC.shield, C.indigo, 'Разрешения', 'что лаунчеру можно') + navRow('about', IC.info, C.gray, 'О лаунчере', 'версия, сброс, первая настройка'))}</div>`,
  desk: () => `<div class="pvc">${phone('desk')}</div>${note('Превью меняется вместе с переключателями. Сами обои лаунчер не трогает: эффекты рисуются поверх.')}
   ${grp('Живые обои', tgRow('sparks', 'Искры', 'летят от пламени на обоях') + tgRow('scan', 'Сканер HUD', 'красная линия раз в 13 секунд') + tgRow('tilt', 'Параллакс', 'HUD плывёт при наклоне телефона') + tgRow('widget', 'Виджеты на столе', 'часы, HUD, синхронизация пилотов'), 'noic')}
   ${grp('Обои в системе', actRow('wp-both', IC.wp, C.red, 'Поставить обои 09', 'на рабочий стол и экран блокировки') + actRow('wp-lock', IC.lock, C.graph, 'Только на экран блокировки', 'системный экран блокировки HyperOS'))}`,
  shade: () => `<div class="pvc col">${phone('shade')}<span class="pvc-t" data-shd></span></div>
   <div class="opts">${['strel', 'one'].map(v => opt('shade', v, `<div class="${PHC.shv(v)}" style="--w:70px">${phone('shv-' + v).replace(/^<div class="ph" data-ph="shv-\w+">/, '').replace(/<\/div>$/, '')}</div>`, SHN[v], { strel: 'две панели', one: 'одна панель' }[v])).join('')}</div>
   ${grp('Пункт управления', actRow('tiles-edit', IC.grid, C.blue, 'Плитки', 'набор и порядок кнопок'))}
   ${grp('Свайп вниз по рабочему столу', rdRow('down', 'shade', 'Открывает шторку', 'слева уведомления, справа пункт управления') + rdRow('down', 'search', 'Открывает поиск приложений', 'шторка останется у верхнего края'))}
   ${note('Внутри лаунчера везде открывается выбранная шторка. Системную шторку от самого верха экрана открывает только сама система.')}`,
  themes: () => `<div class="thg">${THEMES.map(([id, n, c]) => `<button class="thc${id === '09' ? ' on' : ' soon'}" data-th="${id}" style="--c:${c}"><i><b>${id}</b></i><span>${n}</span><small>${id === '09' ? 'выбрана' : 'скоро'}</small></button>`).join('')}</div>${note('Пока готова только 09. Остальные темы появятся здесь же, отдельное приложение не понадобится.')}`,
  isl: () => `<div class="pvc col">${islPv()}</div>
   ${grp('', islTg('on', 'Островок', 'живая плашка у камеры поверх всех приложений', IC.isl, C.red))}
   ${grp('Форма', islRd('shape', 'auto', 'Авто', CUT ? 'по вырезу камеры: ' + (ISLK[CUT.kind] || 'точка') : 'по вырезу камеры') + islRd('shape', 'pill', 'Пилюля', 'вокруг камеры-точки') + islRd('shape', 'drop', 'Капля', 'для выреза-капельки') + islRd('shape', 'notch', 'Чёлка', 'для широкого выреза'))}
   ${grp('Стиль', islRd('style', 'neon', 'Неон 09', 'красная обводка и свечение') + islRd('style', 'black', 'Чёрный', 'сливается с камерой'))}
   ${grp('Что показывать', islTg('mus', 'Музыка', 'что играет, эквалайзер') + islTg('chg', 'Зарядка', 'процент при подключении') + islTg('ntf', 'Уведомления', 'иконка и заголовок на пару секунд'))}
   ${grp('', actRow('openAccessibility', IC.acc, C.indigo, 'Служба «Стрелиция: блокировка»', 'рисует островок поверх приложений', 'acc'))}
   ${note('Если в телефоне есть свой островок, выключи этот, чтобы не было двух. Системный островок сторонние приложения не меняют и не выключают.')}`,
  rail: () => `<div class="pvc">${phone('rail')}</div>
   <div class="grp"><div class="card"><div class="segrow" data-k="side"><b>Сторона экрана</b>${seg('side', [['l', 'Слева'], ['r', 'Справа']])}</div></div></div>
   ${grp('Приложения на панели', actRow('rail-edit', IC.rail, C.orange, 'Изменить порядок', 'откроется рабочий стол в режиме правки') + actRow('rail-add', IC.grid, C.teal, 'Добавить приложения', 'до 6 на панели') + actRow('rail-reset', IC.reset, C.gray, 'Сбросить панель', 'вернуть приложения по умолчанию'))}
   ${note('То же самое можно на рабочем столе: удержи иконку на панели.')}`,
  list: () => `<div class="pvc">${phone('list')}</div>${grp('Вид списка', rdRow('mode', 'cat', 'По категориям', 'связь, медиа, работа, игры, сервисы') + rdRow('mode', 'az', 'По алфавиту', 'буквы А–Я и быстрый ползунок сбоку'))}
   ${note('Категорию любого приложения можно сменить: удержи его в списке и выбери «Переложить в категорию».')}`,
  fx: () => `<div class="opts">${['max', 'bal', 'eco'].map(v => opt('fx', v, `<div class="fxp ${v}">${'<i></i>'.repeat(10)}</div>`, FXN[v], { max: '60 к/с, размытие', bal: '30 к/с', eco: 'без искр' }[v])).join('')}</div><p class="note" data-fxd></p>
   ${grp('Анимации', tgRow('anim', 'Анимации интерфейса', 'выключи, если хочется мгновенно') + tgRow('fast', 'Быстрый запуск', 'кольцо синхронизации вдвое короче') + tgRow('bootUnlock', 'Загрузка после разблокировки', 'STRELIZIA SYSTEM 起動 на 1 секунду'), 'noic')}
   <div class="pvc"><div class="rings"><div data-ring="0"><div class="ring"><svg viewBox="0 0 86 86"><circle class="r0" cx="43" cy="43" r="36"/><circle class="r1" cx="43" cy="43" r="36"/></svg><b>0,65 с</b></div>обычный</div><div data-ring="1"><div class="ring fast"><svg viewBox="0 0 86 86"><circle class="r0" cx="43" cy="43" r="36"/><circle class="r1" cx="43" cy="43" r="36"/></svg><b>0,3 с</b></div>быстрый</div></div></div>`,
  gest: () => `${grp('На рабочем столе', tgRow('swipe', 'Свайп вверх', 'открывает все приложения', 'gi up', C.green) + tgRow('vault', 'Свайп вправо', 'открывает App Vault: погода, календарь, музыка', 'gi rt', C.orange) + tgRow('dtap', 'Двойной тап', 'гасит экран, нужна служба блокировки', 'gi dt', C.indigo) + navRow('shade', IC.shade, C.blue, 'Свайп вниз', 'шторка или поиск'))}
   ${note('Удержание пустого места на обоях открывает быстрые настройки, удержание иконки: ярлыки приложения.')}`,
  sound: () => `${grp('', tgRow('sound', 'Звуки HUD', 'тихие сигналы синтезатором, без файлов', IC.snd, C.pink) + tgRow('haptic', 'Вибрация', 'лёгкий отклик на касания', IC.hand, C.purple) + actRow('beep', IC.play, C.blue, 'Послушать', 'сигнал запуска'))}
   ${note('Звуки молчат, когда телефон на беззвучном или в режиме вибрации.')}`,
  notif: () => `<div class="pvc">${phone('notif')}</div>${grp('', tgRow('banners', 'Плашки уведомлений', 'сверху, пока открыт рабочий стол', IC.bell, C.alert) + actRow('openNotifAccess', IC.shield, C.indigo, 'Доступ к уведомлениям', 'без него шторка и счётчики пустые', 'notif') + actRow('openDndAccess', IC.moon, C.purple, 'Доступ к «Не беспокоить»', 'чтобы плитка переключала режим', 'dnd'))}`,
  wx: () => `${grp('Город', `<div class="fld"><input class="city" type="text" placeholder="например, Казань" autocomplete="off" spellcheck="false" enterkeyhint="done" value="${esc(PR.city)}"></div>`)}
   ${note('Пусто: погода по геолокации. Данные берутся у Open-Meteo, без ключей и аккаунтов.')}${grp('', actRow('askLocation', IC.loc, C.green, 'Геолокация', 'приблизительная, только для погоды', 'loc'))}`,
  lock: () => `<div class="pvc col">${phone('boot')}<span class="pvc-t">Так выглядит переход после разблокировки, если включена загрузка</span></div>
   ${grp('Разблокировка', `<div class="row noic" style="cursor:default"><span class="tx"><b>Все способы телефона</b><small>Экран блокировки системный: PIN-код, пароль, графический ключ, отпечаток и лицо работают как обычно. Лаунчер их не подменяет и защиту не ослабляет</small></span></div>` + actRow('openSecurity', IC.key, C.graph, 'Пароль и безопасность', 'настроить способы в HyperOS'))}
   ${grp('После разблокировки', tgRow('bootUnlock', 'Загрузка Стрелиции', 'вместо мелькания рабочего стола', IC.fx, C.red) + tgRow('dtap', 'Двойной тап гасит экран', 'нужна служба блокировки', IC.lock, C.indigo) + actRow('openAccessibility', IC.acc, C.indigo, 'Служба блокировки', 'спецвозможности, «Стрелиция: блокировка»', 'acc'))}
   ${grp('Экран блокировки и AOD', actRow('wp-lock', IC.wp, C.red, 'Обои 09 на экран блокировки', 'ставит их в системные обои') + actRow('openDream', IC.aod, C.graph, 'Заставка AOD при зарядке', 'неоновые часы Стрелиции'))}`,
  perm: () => `${note(NAT ? 'Ничего не обязательно, но без доступа часть функций спрячется. Нажми на строку, чтобы открыть нужный экран Android.' : 'Это браузерное демо: статусы появятся на телефоне.')}${grp('', PERM.map(([k, t, s, ic, c, act]) => actRow('perm-' + k, ic, c, t, s, k)).join(''))}`,
  about: () => `<div class="pvc col">${HORNS}<b style="font-size:20px">Стрелиция</b><span class="pvc-t">Лаунчер в стиле DARLING in the FRANXX для POCO · тема 09<br>${esc(ST.model || 'POCO')} · Android ${esc(ST.android || '14')} · версия ${esc(ST.ver || '1.1')}</span></div>
   ${grp('', actRow('rewizard', IC.rocket, C.blue, 'Пройти первую настройку заново', 'приветствие, разрешения, вид') + actRow('openAppSettings', IC.info, C.gray, 'Сведения о приложении', 'хранилище, разрешения Android') + actRow('reset', IC.reset, C.alert, 'Сбросить настройки', 'вид, эффекты, жесты по умолчанию'))}
   ${note('Фанатский лаунчер для личного использования. DARLING in the FRANXX © TRIGGER, A-1 Pictures, CloverWorks.')}`
};
const FXD = { max: 'Искры 60 кадров в секунду в полном разрешении и размытие под плашками. Красивее всего, телефон тратит больше батареи.', bal: 'Искры 30 кадров в секунду, без размытия над искрами. На глаз почти то же самое, а нагрузка заметно ниже.', eco: 'Искры, сканер и параллакс выключены, анимации интерфейса остаются. Меньше всего тратит батарею.' };
const SHD = { strel: 'Слева уведомления, справа пункт управления, в неоне Стрелиции', one: 'Одна панель, как раньше: плитки, яркость и уведомления вместе' };

/* поиск: всё, что можно найти, с указанием страницы */
const INDEX = [['Искры', 'desk', 'sparks'], ['Сканер HUD', 'desk', 'scan'], ['Параллакс', 'desk', 'tilt'], ['Виджеты на столе', 'desk', 'widget'], ['Обои', 'desk', 'wp-both'],
  ['Пункт управления', 'shade', 'shade-strel'], ['Шторка Стрелиция', 'shade', 'shade-strel'], ['Классическая шторка', 'shade', 'shade-one'], ['Свайп вниз', 'shade', 'down-shade'], ['Уведомления в шторке', 'shade', 'shade-strel'], ['Плитки', 'shade', 'tiles-edit'],
  ['Островок', 'isl', 'isl-on'], ['Динамический островок', 'isl', 'isl-on'], ['Капля', 'isl', 'shape-drop'], ['Чёлка', 'isl', 'shape-notch'], ['Вырез камеры', 'isl', 'shape-auto'],
  ['Сторона панели', 'rail', 'side'], ['Порядок приложений', 'rail', 'rail-edit'], ['Добавить на панель', 'rail', 'rail-add'], ['Сбросить панель', 'rail', 'rail-reset'],
  ['Категории', 'list', 'mode-cat'], ['По алфавиту', 'list', 'mode-az'], ['Эффекты', 'fx', 'fx-bal'], ['Производительность', 'fx', 'fx-bal'], ['Экономия батареи', 'fx', 'fx-eco'], ['Анимации', 'fx', 'anim'], ['Быстрый запуск', 'fx', 'fast'], ['Загрузка после разблокировки', 'fx', 'bootUnlock'],
  ['Свайп вверх', 'gest', 'swipe'], ['App Vault', 'gest', 'vault'], ['Двойной тап', 'gest', 'dtap'], ['Звуки', 'sound', 'sound'], ['Вибрация', 'sound', 'haptic'],
  ['Плашки уведомлений', 'notif', 'banners'], ['Доступ к уведомлениям', 'notif', 'openNotifAccess'], ['Не беспокоить', 'notif', 'openDndAccess'], ['Город погоды', 'wx', 'city'], ['Геолокация', 'wx', 'askLocation'],
  ['Пароль', 'lock', 'openSecurity'], ['PIN-код', 'lock', 'openSecurity'], ['Отпечаток', 'lock', 'openSecurity'], ['Графический ключ', 'lock', 'openSecurity'], ['Экран блокировки', 'lock', 'openSecurity'], ['Заставка AOD', 'lock', 'openDream'],
  ['Рабочий стол по умолчанию', 'perm', 'perm-def'], ['Календарь', 'perm', 'perm-cal'], ['Яркость', 'perm', 'perm-write'], ['Автоповорот', 'perm', 'perm-write'], ['Батарея', 'perm', 'perm-batt'], ['Автозапуск', 'perm', 'perm-auto'],
  ['Сброс настроек', 'about', 'reset'], ['Первая настройка', 'about', 'rewizard'], ['Версия', 'about', 'rewizard']];

/* ───────── навигация ───────── */
const app = document.getElementById('app'), stack = [];
function mkPage(id) {
  const P = PAGES[id], el = document.createElement('section'); el.className = 'pg'; el.dataset.pg = id;
  el.innerHTML = `<div class="bar">${id === 'root' ? '' : `<button class="bk" data-act="back" aria-label="Назад">${IC.back}</button>`}<h2 class="tt">${P.t}</h2></div><div class="pg-sc"><div class="wrap"><div class="big"><h1>${P.t}</h1>${id === 'root' ? '<p>настройки лаунчера · тема 09</p>' : ''}</div>${R[id]()}</div></div>`;
  const sc = $('.pg-sc', el), bar = $('.bar', el); sc.addEventListener('scroll', () => bar.classList.toggle('sh', sc.scrollTop > 40), { passive: true });
  return el;
}
function go(id, hl) {
  if (!PAGES[id]) return; const prev = stack[stack.length - 1];
  const el = mkPage(id); app.appendChild(el); stack.push({ id, el });
  if (prev) { prev.el.classList.add('back'); el.classList.add('in'); }
  paint(); if (hl) setTimeout(() => flash(el, hl), 380);
}
function pop() {
  if (stack.length <= 1) return false;
  const cur = stack.pop(); cur.el.classList.remove('in'); cur.el.classList.add('out'); setTimeout(() => cur.el.remove(), 400);
  const prev = stack[stack.length - 1]; prev.el.classList.remove('back'); paint(); return true;
}
function flash(el, k) { const r = $(`[data-k="${k}"]`, el); if (!r) return; r.scrollIntoView({ block: 'center', behavior: 'smooth' }); r.classList.remove('hl'); void r.offsetWidth; r.classList.add('hl'); }
function rerender(id) { const s = stack.find(x => x.id === id); if (!s) return; const sc = $('.pg-sc', s.el), top = sc.scrollTop, q = $('.srch input', s.el), qv = q ? q.value : ''; const n = mkPage(id); n.className = s.el.className.replace(/\bin\b/, ''); s.el.replaceWith(n); s.el = n; $('.pg-sc', n).scrollTop = top; if (qv) { const i = $('.srch input', n); i.value = qv; search(qv); } paint(); }

/* ───────── отрисовка состояния ───────── */
function paint() {
  $$('[data-tg]').forEach(r => { const s = $('.sw', r); if (s) s.classList.toggle('on', !!PR.set[r.dataset.tg]); });
  $$('[data-pr][data-v]').forEach(r => r.classList.toggle('on', PR[r.dataset.pr] === r.dataset.v));
  $$('[data-it]').forEach(r => { const s = $('.sw', r); if (s) s.classList.toggle('on', !!PR.isl[r.dataset.it]); });
  $$('[data-ip][data-v]').forEach(r => r.classList.toggle('on', PR.isl[r.dataset.ip] === r.dataset.v));
  $$('[data-ipv]').forEach(e => { e.className = 'ipv ' + islShape() + ' ' + PR.isl.style + (PR.isl.on ? ' on' : ''); });
  $$('.seg[data-seg]').forEach(s => { const bs = $$('button', s), i = bs.findIndex(b => b.dataset.v === PR[s.dataset.seg]); s.style.setProperty('--k', Math.max(0, i)); });
  $$('[data-val]').forEach(e => { const f = VAL[e.dataset.val]; e.textContent = f ? f() : ''; });
  $$('[data-ph]').forEach(e => { const k = e.dataset.ph; if (k.startsWith('shv-')) return; const f = PHC[k]; if (f) e.className = f(); });
  $$('[data-st]').forEach(e => { const k = e.dataset.st; if (k === 'auto') { e.textContent = 'Открыть'; e.className = 'chip na'; return; } const on = !!ST[k]; e.textContent = !NAT ? 'Демо' : on ? 'Включено' : 'Включить'; e.className = 'chip' + (!NAT ? ' na' : on ? ' ok' : ''); });
  $$('[data-fxd]').forEach(e => { e.textContent = FXD[PR.fx]; }); $$('[data-shd]').forEach(e => { e.textContent = SHD[PR.shade]; });
  $$('[data-ring]').forEach(e => e.classList.toggle('on', (e.dataset.ring === '1') === !!PR.set.fast));
  $$('[data-tg=dtap] small').forEach(e => { e.textContent = NAT && !ST.acc ? 'нужна служба блокировки: включи в «Разрешениях»' : 'гасит экран, отпечаток и пароль работают как обычно'; });
}

/* ───────── звук для «Послушать» ───────── */
let AC = null;
function beep() { try { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); const a = AC, t = a.currentTime; [[220, 1320, .7, 'sawtooth', .02], [440, 880, .45, 'sine', .04]].forEach(([f0, f1, d, ty, g], i) => { const o = a.createOscillator(), gn = a.createGain(), t0 = t + i * .08; o.type = ty; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + d); gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(g, t0 + .02); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d); o.connect(gn).connect(a.destination); o.start(t0); o.stop(t0 + d + .05); }); } catch (e) {} }

/* ───────── тост и диалог ───────── */
let tT = 0;
function toast(m) { let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); } t.textContent = m; t.classList.add('on'); clearTimeout(tT); tT = setTimeout(() => t.classList.remove('on'), 2300); }
let DLG = null;
function dialog(t, p, btns) {
  closeDlg(); const d = document.createElement('div'); d.className = 'dlg';
  d.innerHTML = `<div class="dlg-b"><h4>${esc(t)}</h4><p>${esc(p)}</p><div class="dlg-r">${btns.map(([l, cls], i) => `<button class="${cls || ''}" data-i="${i}">${esc(l)}</button>`).join('')}</div></div>`;
  d.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) { const f = btns[+b.dataset.i][2]; closeDlg(); if (f) f(); } else if (e.target === d) closeDlg(); });
  document.body.appendChild(d); DLG = d; requestAnimationFrame(() => d.classList.add('on'));
}
function closeDlg() { if (!DLG) return false; const d = DLG; DLG = null; d.classList.remove('on'); setTimeout(() => d.remove(), 260); return true; }

/* ───────── действия ───────── */
let wantHome = false, wantT = 0;
const toLauncher = () => { if (!NAT) { location.href = 'index.html'; return; } if (ST.def) call('goHome'); else call('openLauncher'); };
function launch() {
  PR.setup = true; save();
  if (!NAT) { toast('На телефоне Android спросит, сделать ли Стрелицию рабочим столом'); return; }
  if (ST.def) { call('goHome'); return; }
  wantHome = true; clearTimeout(wantT); wantT = setTimeout(() => { wantHome = false; }, 120000); call('makeDefault');
}
function onAct(k, el) {
  if (k === 'back') { back(); return; }
  if (k === 'sclr') { const i = $('.srch input'); if (i) { i.value = ''; search(''); i.focus(); } return; }
  if (k === 'launch') { launch(); return; }
  if (k === 'homeSettings') { if (NAT) call('homeSettings'); else toast('На телефоне откроется выбор рабочего стола'); return; }
  if (k === 'try') { PR.setup = true; save(); toLauncher(); if (NAT && !ST.def) toast('Это пробный запуск: «Домой» пока ведёт на системный стол'); return; }
  if (k === 'home') { toLauncher(); return; }
  if (k === 'def-off') { dialog('Выключить Стрелицию?', 'Android откроет выбор рабочего стола. Выбери системный, и кнопка «Домой» поведёт туда. Настройки сохранятся.', [['Отмена'], ['Открыть выбор', 'pri', () => { if (NAT) call('homeSettings'); else toast('На телефоне откроется выбор рабочего стола'); }]]); return; }
  if (k === 'wp-both' || k === 'wp-lock') { if (NAT) { call('setWallpaper', k === 'wp-lock' ? 'lock' : 'both'); toast('Ставлю обои 09…'); } else toast('На телефоне обои 09 встанут в систему'); return; }
  if (k === 'rail-edit' || k === 'rail-add') { cmd(k === 'rail-edit' ? 'edit' : 'add'); toLauncher(); return; }
  if (k === 'tiles-edit') { cmd('tiles'); toLauncher(); return; }
  if (k === 'rail-reset') { dialog('Сбросить панель?', 'На панели снова будут приложения по умолчанию: чаты, камера, музыка, галерея, браузер.', [['Отмена'], ['Сбросить', 'red', () => { cmd('reset'); toast('Панель сбросится, когда откроешь рабочий стол'); }]]); return; }
  if (k === 'beep') { beep(); call('vibe', 18); return; }
  if (k === 'rewizard') { wizard(0); return; }
  if (k === 'reset') { dialog('Сбросить настройки?', 'Вид, эффекты, жесты и звуки вернутся как после установки. Панель, заметка и разрешения останутся.', [['Отмена'], ['Сбросить', 'red', () => { const s = PR.setup; PR = DEFP(); PR.setup = s; save(); rerenderAll(); toast('Настройки сброшены'); }]]); return; }
  if (k.startsWith('perm-')) { const p = PERM.find(x => 'perm-' + x[0] === k); if (!p) return; if (!NAT) { toast('На телефоне откроется: ' + p[1].toLowerCase()); return; } if ((p[0] === 'cal' || p[0] === 'loc') && ST[p[0]]) { call('openAppSettings'); return; } if (p[0] === 'def') { if (ST.def) call('homeSettings'); else launch(); return; } call(p[5]); return; }
  if (/^(open|ask)\w+$/.test(k)) { if (!NAT) { toast('На телефоне откроется системный экран'); return; } call(k); return; }
}
function back() { if (closeDlg()) return true; if (WZ) { if (WZ.step > 0) { wizard(WZ.step - 1, true); return true; } return false; } return pop(); }

/* ───────── поиск ───────── */
function search(q) {
  const pg = stack[0] && stack[0].el, res = pg && $('.res', pg), main = pg && $('.main', pg), s = q.trim().toLowerCase(), lab = pg && $('.srch', pg);
  if (!res) return; if (lab) lab.classList.toggle('has', !!q);
  if (!s) { res.hidden = true; main.hidden = false; return; }
  const hits = INDEX.filter(([t]) => t.toLowerCase().includes(s)).slice(0, 14);
  res.innerHTML = hits.length ? grp('', hits.map(([t, pg2, k]) => { const i = t.toLowerCase().indexOf(s); return `<button class="row noic" data-go="${pg2}" data-hl="${k}"><span class="tx"><b>${esc(t.slice(0, i))}<mark>${esc(t.slice(i, i + s.length))}</mark>${esc(t.slice(i + s.length))}</b><small>${esc(PAGES[pg2].t)}</small></span><i class="chev">${IC.chev}</i></button>`; }).join('')) : '<div class="empty">Ничего не нашлось</div>';
  res.hidden = false; main.hidden = true;
}

/* ───────── мастер первого запуска ───────── */
let WZ = null;
const WZN = 4;
function wizard(step, rev) {
  WZ = { step }; let el = $('.wz'); if (!el) { el = document.createElement('div'); el.className = 'wz'; app.appendChild(el); }
  const body = [
    () => `<div class="wz-hi">${phone('hero')}${HORNS}<h1>Стрелиция</h1><p>Лаунчер в стиле DARLING in the FRANXX для POCO. Настроим за минуту: разрешения, шторка, эффекты.</p></div>`,
    () => `<h1>Разрешения</h1><p class="lead">Ничего не обязательно. Без доступа часть функций спрячется, вернуться можно в любой момент.</p>${grp('', PERM.filter(p => !['def', 'auto', 'dnd'].includes(p[0])).map(([k, t, s, ic, c]) => actRow('perm-' + k, ic, c, t, s, k)).join(''))}`,
    () => `<h1>Вид</h1><p class="lead">Шторка открывается свайпом вниз по рабочему столу.</p><div class="opts">${['strel', 'one'].map(v => opt('shade', v, `<div class="${PHC.shv(v)}" style="--w:70px">${phone('x').replace(/^<div class="ph" data-ph="x">/, '').replace(/<\/div>$/, '')}</div>`, SHN[v], { hyper: 'как в системе', strel: 'неон 09', one: 'одна панель' }[v])).join('')}</div>
      <div class="opts">${['max', 'bal', 'eco'].map(v => opt('fx', v, `<div class="fxp ${v}" style="height:64px">${'<i></i>'.repeat(10)}</div>`, FXN[v], { max: 'красивее всего', bal: 'рекомендуем', eco: 'бережёт батарею' }[v])).join('')}</div>
      <div class="grp"><div class="card"><div class="segrow"><b>Панель приложений</b>${seg('side', [['l', 'Слева'], ['r', 'Справа']])}</div></div></div>`,
    () => `<h1>Готово</h1><p class="lead">${ST.def ? 'Стрелиция уже рабочий стол. Жми и пользуйся.' : 'Осталось сделать Стрелицию рабочим столом: Android спросит один раз.'}</p>
      <div class="grp"><div class="card sum"><div><span>Шторка</span><b>${SHN[PR.shade]}</b></div><div><span>Эффекты</span><b>${FXN[PR.fx]}</b></div><div><span>Панель</span><b>${PR.side === 'l' ? 'слева' : 'справа'}</b></div><div><span>Разрешения</span><b>${NAT ? permN().join(' из ') : 'демо'}</b></div></div></div>
      <p class="note" data-wzh>${wantHome && !ST.def ? 'Android не сменил рабочий стол. Открой выбор и отметь «Стрелиция».' : 'Всё это потом меняется здесь же или удержанием пустого места на рабочем столе.'}</p>`
  ][step]();
  const btns = [
    `<button class="btn" data-wz="next">Начать</button>`,
    `<button class="btn" data-wz="next">Далее</button>`,
    `<button class="btn" data-wz="next">Далее</button>`,
    `<button class="btn" data-wz="go">Запустить лаунчер</button>${wantHome && !ST.def && NAT ? '<button class="btn2" data-act="homeSettings">Открыть выбор рабочего стола</button>' : `<button class="btn2" data-wz="try">Попробовать без замены рабочего стола</button>`}<button class="lnk" data-wz="done">Позже, открыть настройки</button>`
  ][step];
  el.innerHTML = `<div class="wz-top"><div class="wz-dots">${Array.from({ length: WZN }, (_, i) => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>${step < 3 ? '<button class="wz-skip" data-wz="skip">Пропустить</button>' : ''}</div><div class="wz-sc"><div class="wrap wz-in${rev ? ' rev' : ''}">${body}</div></div><div class="wz-b">${btns}</div>`;
  paint();
}
function wizardEnd() { const el = $('.wz'); WZ = null; if (el) { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); } if (!PR.setup) { PR.setup = true; save(); } rerenderAll(); }
function onWz(k) {
  if (k === 'next') { wizard(Math.min(WZN - 1, WZ.step + 1)); return; }
  if (k === 'skip') { wizard(WZN - 1); return; }
  if (k === 'go') { launch(); if (!NAT) { setTimeout(wizardEnd, 900); } return; }
  if (k === 'try') { PR.setup = true; save(); toLauncher(); wizardEnd(); return; }
  if (k === 'done') { wizardEnd(); return; }
}
function rerenderAll() { for (const s of stack) rerender(s.id); }

/* ───────── события ───────── */
document.addEventListener('click', e => {
  const t = e.target;
  const w = t.closest('[data-wz]'); if (w) { onWz(w.dataset.wz); return; }
  const g = t.closest('[data-go]'); if (g) { const i = $('.srch input'); if (i) i.blur(); go(g.dataset.go, g.dataset.hl); return; }
  const it = t.closest('[data-it]'); if (it) { const k = it.dataset.it; PR.isl[k] = !PR.isl[k]; save(); paint(); call('vibe', 10);
    if (k === 'on' && PR.isl.on && NAT && !ST.acc) dialog('Нужна служба', 'Островок рисует служба «Стрелиция: блокировка». Включи её в спецвозможностях, и островок появится сразу.', [['Позже'], ['Открыть', 'pri', () => call('openAccessibility')]]);
    return; }
  const ip = t.closest('[data-ip][data-v]'); if (ip) { const k = ip.dataset.ip, v = ip.dataset.v; if (PR.isl[k] !== v) { PR.isl[k] = v; save(); paint(); call('vibe', 10); } return; }
  const tg = t.closest('[data-tg]'); if (tg) { const k = tg.dataset.tg; PR.set[k] = !PR.set[k]; save(); paint(); call('vibe', 10);
    if (k === 'sound' && PR.set.sound) beep(); if (k === 'dtap' && PR.set.dtap && NAT && !ST.acc) dialog('Нужна служба блокировки', 'Чтобы двойной тап гасил экран, включи «Стрелиция: блокировка» в спецвозможностях. Экран она не читает.', [['Позже'], ['Включить', 'pri', () => call('openAccessibility')]]);
    return; }
  const pr = t.closest('[data-pr][data-v]'); if (pr) { const k = pr.dataset.pr, v = pr.dataset.v; if (PR[k] !== v) { PR[k] = v; save(); paint(); call('vibe', 10); } return; }
  const a = t.closest('[data-act]'); if (a) { onAct(a.dataset.act, a); return; }
});
document.addEventListener('input', e => { if (e.target.matches('.srch input')) search(e.target.value); });
document.addEventListener('change', e => { if (e.target.matches('input.city')) { PR.city = e.target.value.trim().slice(0, 60); save(); paint(); toast(PR.city ? 'Погода: ' + PR.city : 'Погода по геолокации'); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input.city')) e.target.blur(); if (e.key === 'Escape') back(); });
window.addEventListener('storage', e => { if (e.key === PKEY) { PR = loadPrefs(); paint(); } });
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', theme); } catch (e) {}
function refresh() {
  const was = !!ST.def; loadStatus(); PR = loadPrefs();
  if (wantHome && ST.def) { wantHome = false; if (WZ) wizardEnd(); call('goHome'); }
  if (was !== !!ST.def) { const h = $('[data-hero]'); if (h) { const n = document.createElement('div'); n.innerHTML = hero(); h.replaceWith(n.firstChild); } }
  if (WZ && WZ.step === 3) wizard(3); paint();
}
window.SXN = (name, p) => {
  try {
    if (name === 'back') return back();
    if (name === 'resume' || name === 'perm') { theme(); refresh(); return true; }
    if (name === 'toast') { toast(String(p)); return true; }
    if (name === 'page') { if (PAGES[p] && (!stack.length || stack[stack.length - 1].id !== p)) go(p); return true; }
  } catch (e) { call('log', String((e && e.stack) || e)); }
  return false;
};
window.SX = { get PR() { return PR; }, get ST() { return ST; }, go, back, wizard, get WZ() { return WZ; }, stack };

/* ───────── старт ───────── */
theme(); loadStatus(); CUT = nj('cutout', null); go('root');
const want = (location.hash.match(/page=(\w+)/) || [])[1];
if (!PR.setup) wizard(0); else if (want && PAGES[want] && want !== 'root') go(want);
call('ready');
})();

document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-th]'); if (!b) return; const id = b.dataset.th; if (id === '09') { call('vibe', 10); return; } dialog('Тема ' + id + ' в работе', 'Скоро её можно будет выбрать здесь. Сейчас работает 09 Стрелиция.', [['Понятно']]); });
