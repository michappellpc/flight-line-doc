// Flight Line Doc: game engine and systems.
// Fictional game for fun and learning. Not medical advice.
(() => {
'use strict';

const D = window.FLD, ART = window.FLD_ART;
const T = 16, END_DAY = 56, SAVE_KEY = 'fld_save_v1';
const SEASONS = ['spring', 'summer', 'fall', 'winter'], SEASON_NAME = ['Spring', 'Summer', 'Fall', 'Winter'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ORDER = { fly: 0, down: 1, waiver: 2, evac: 3 };
const SKILL_NAME = { clin: 'Clinical', aero: 'Aeromedical', lead: 'Leadership' };
const SKILL_UNLOCK = {
  clin: { 2: '+1 history question per patient', 4: '+1 exam step per patient' },
  aero: { 2: '+1 check per FDME', 4: 'FDMEs take less time' },
  lead: { 2: '+10 budget at each weekly brief', 4: 'trust grows faster with everyone' },
};
const XP_LEVELS = [0, 12, 30, 55, 90, 140];
const $ = id => document.getElementById(id);
const cv = $('c'), ctx = cv.getContext('2d');
const sfx = n => { if (window.FLD_AUDIO) FLD_AUDIO.play(n); };

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let random = Math.random;
const rnd = a => a[Math.floor(random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strHash = s => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
const clock = m => { const h = Math.floor(m / 60) % 24, mm = Math.floor(m % 60); return String(h).padStart(2, '0') + String(mm).padStart(2, '0'); };
function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const k in attrs) { if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
  kids.forEach(k => { if (k == null) return; e.appendChild(typeof k === 'string' ? document.createTextNode(k) : k); });
  return e;
}

const CASE = Object.fromEntries(D.CASES.map(c => [c.id, c]));
const PEOPLE = Object.fromEntries(D.ROSTER.map(p => [p.id, p]));

// ---------- world ----------
const world = {
  buildings: [
    { id: 'clinic',   x: 1,  y: 1, w: 6, h: 3, body: '#e8e1d0', roof: '#9c3b2e', label: 'CLINIC' },
    { id: 'hq',       x: 8,  y: 1, w: 3, h: 3, body: '#cfc6a8', roof: '#5b5a3a', label: 'BDE HQ' },
    { id: 'chapel',   x: 12, y: 1, w: 3, h: 3, body: '#ece6da', roof: '#6b4d84', label: 'CHAPEL', steeple: true },
    { id: 'quarters', x: 16, y: 1, w: 4, h: 3, body: '#bcc7d6', roof: '#475b78', label: 'QUARTERS' },
    { id: 'dfac',     x: 1,  y: 7, w: 4, h: 3, body: '#e3c9a0', roof: '#8c5a2b', label: 'DFAC' },
    { id: 'gym',      x: 6,  y: 7, w: 4, h: 3, body: '#c9d6c0', roof: '#4d6b44', label: 'GYM' },
    { id: 'ops',      x: 12, y: 7, w: 5, h: 3, body: '#b9bcc2', roof: '#555a63', label: 'FLIGHT OPS' },
  ],
  stations: [
    { id: 'clinic',   name: 'Aviation Medicine Clinic', x: 3,  y: 4 },
    { id: 'hq',       name: 'Brigade HQ',               x: 9,  y: 4 },
    { id: 'chapel',   name: 'Chapel',                   x: 13, y: 4 },
    { id: 'quarters', name: 'Your quarters',            x: 17, y: 4 },
    { id: 'dfac',     name: 'DFAC',                     x: 2,  y: 10 },
    { id: 'gym',      name: 'Gym',                      x: 7,  y: 10 },
    { id: 'ops',      name: 'Flight Ops',               x: 14, y: 10 },
  ],
  trees: [[0, 1], [0, 3], [7, 2], [15, 2], [5, 8], [10, 8], [11, 8], [17, 8], [19, 8]],
  helis: [{ type: 'uh60', x: 2, y: 13 }, { type: 'ah64', x: 8, y: 13 }, { type: 'hh60', x: 14, y: 13 }],
  decor: [{ type: 'flag', x: 11, y: 3 }, { type: 'sock', x: 18, y: 10 }],
};
const STATION_BY_ID = Object.fromEntries(world.stations.map(s => [s.id, s]));
// Interiors, in tiles. Furniture is solid (except rugs). Stations are the things you can use.
const ROOMS = {
  clinic: {
    floor: 'lino', wall: '#e8e1d0', door: [9, 2],
    decor: [{ type: 'window', x: 1 }, { type: 'window', x: 3 }, { type: 'board', x: 7, w: 2 }, { type: 'eyechart', x: 9 }, { type: 'cross', x: 13 }, { type: 'clock', x: 15 }, { type: 'cert', x: 16 }, { type: 'poster', x: 17, color: '#3b9a5a' }],
    furniture: [
      { type: 'examtable', x: 2, y: 4, w: 2 }, { type: 'curtain', x: 5, y: 3, h: 3 }, { type: 'desk', x: 7, y: 4, w: 2 }, { type: 'vision', x: 9, y: 4 },
      { type: 'booth', x: 11, y: 3, w: 2, h: 2 }, { type: 'curtain', x: 14, y: 3, h: 3 }, { type: 'room2', x: 15, y: 4, w: 2 },
      { type: 'labbench', x: 1, y: 9, w: 3 }, { type: 'counter', x: 6, y: 9, w: 6 }, { type: 'coffee', x: 13, y: 9 }, { type: 'desk', x: 15, y: 9, w: 2 }, { type: 'shelf', x: 17, y: 9, w: 2 },
      { type: 'plant', x: 1, y: 12 }, { type: 'chairs', x: 2, y: 12, w: 3 }, { type: 'chairs', x: 14, y: 12, w: 3 }, { type: 'plant', x: 18, y: 12 },
    ],
    stations: [
      { id: 'front', name: 'Front desk', x: 6, y: 9, w: 6 },
      { id: 'exam', name: 'Exam room: sick call', x: 2, y: 4, w: 2 },
      { id: 'fdme', name: 'FDME station', x: 7, y: 4, w: 2 },
      { id: 'board', name: 'Clinic upgrade plans', x: 7, y: 2, w: 2 },
      { id: 'office', name: 'Your desk: study', x: 15, y: 9, w: 2 },
      { id: 'coffee', name: 'Coffee', x: 13, y: 9 },
      { id: 'booth', name: 'Hearing booth', x: 11, y: 3, w: 2, h: 2 },
      { id: 'vision', name: 'Vision tester', x: 9, y: 4 },
      { id: 'lab', name: 'Lab bench', x: 1, y: 9, w: 3 },
    ],
  },
  hq: {
    floor: 'tile', wall: '#cfc6a8', door: [9, 2],
    decor: [{ type: 'window', x: 2 }, { type: 'board', x: 4, w: 2 }, { type: 'flagwall', x: 8, w: 3 }, { type: 'clock', x: 12 }, { type: 'window', x: 15 }, { type: 'poster', x: 17, color: '#c23b3b' }],
    furniture: [
      { type: 'plant', x: 1, y: 4 }, { type: 'flagstand', x: 6, y: 4 }, { type: 'bigdesk', x: 8, y: 5, w: 3 }, { type: 'flagstand', x: 12, y: 4, unit: true },
      { type: 'filing', x: 17, y: 4 }, { type: 'filing', x: 18, y: 4 }, { type: 'maptable', x: 2, y: 9, w: 3, h: 2 }, { type: 'chairs', x: 14, y: 11, w: 3 }, { type: 'plant', x: 18, y: 12 },
    ],
    stations: [
      { id: 'park', name: `COL Park's desk`, x: 8, y: 5, w: 3 },
      { id: 'bulletin', name: 'Bulletin board', x: 4, y: 2, w: 2 },
      { id: 'maptable', name: 'Map table', x: 2, y: 9, w: 3, h: 2 },
    ],
  },
  chapel: {
    floor: 'wood', wall: '#ece6da', door: [9, 2],
    decor: [{ type: 'stained', x: 2 }, { type: 'stained', x: 5 }, { type: 'stained', x: 9 }, { type: 'stained', x: 10 }, { type: 'stained', x: 14 }, { type: 'stained', x: 17 }],
    furniture: [
      { type: 'plant', x: 1, y: 4 }, { type: 'altar', x: 8, y: 4, w: 4 }, { type: 'plant', x: 18, y: 4 },
      { type: 'pew', x: 2, y: 7, w: 5 }, { type: 'pew', x: 13, y: 7, w: 5 }, { type: 'pew', x: 2, y: 9, w: 5 }, { type: 'pew', x: 13, y: 9, w: 5 }, { type: 'pew', x: 2, y: 11, w: 5 }, { type: 'pew', x: 13, y: 11, w: 5 },
    ],
    stations: [{ id: 'altar', name: 'Altar: a quiet moment', x: 8, y: 4, w: 4 }],
  },
  quarters: {
    floor: 'wood', wall: '#bcc7d6', door: [9, 2],
    decor: [{ type: 'window', x: 5 }, { type: 'poster', x: 8, color: '#5d6b44' }, { type: 'keepsakes', x: 11, w: 4 }, { type: 'window', x: 16 }],
    furniture: [
      { type: 'rug', x: 7, y: 8, w: 5, h: 3 }, { type: 'bed', x: 2, y: 4, w: 2, h: 3 }, { type: 'desk', x: 7, y: 4, w: 2 }, { type: 'wardrobe', x: 16, y: 4, w: 2 }, { type: 'plant', x: 18, y: 12 }, { type: 'plant', x: 1, y: 12 },
    ],
    stations: [
      { id: 'bed', name: 'Your bed: sleep', x: 2, y: 4, w: 2, h: 3 },
      { id: 'qdesk', name: 'Your desk: journal', x: 7, y: 4, w: 2 },
      { id: 'keepsakes', name: 'Shelf of keepsakes', x: 11, y: 2, w: 4 },
      { id: 'wardrobe', name: 'Wardrobe', x: 16, y: 4, w: 2 },
    ],
  },
};
const MAPS = { outside: { solids: [], stations: world.stations } };
{
  const s = MAPS.outside.solids;
  world.buildings.forEach(b => s.push({ x: b.x * T, y: b.y * T, w: b.w * T, h: b.h * T }));
  world.stations.forEach(st => s.push({ x: st.x * T, y: st.y * T, w: T, h: T }));
  world.trees.forEach(t => s.push({ x: t[0] * T + 4, y: t[1] * T + 8, w: 8, h: 8 }));
  world.helis.forEach(h => s.push({ x: h.x * T, y: h.y * T + 4, w: 32, h: 10 }));
  world.decor.forEach(d => s.push({ x: d.x * T + 5, y: d.y * T + 10, w: 5, h: 6 }));
}
for (const id in ROOMS) {
  const r = ROOMS[id], [dx, dw] = r.door;
  const sol = [{ x: 0, y: 0, w: 320, h: 48 }, { x: 0, y: 0, w: 16, h: 240 }, { x: 304, y: 0, w: 16, h: 240 }, { x: 0, y: 224, w: dx * T, h: 16 }, { x: (dx + dw) * T, y: 224, w: 320, h: 16 }];
  r.furniture.forEach(f => { if (f.type !== 'rug') sol.push({ x: f.x * T, y: f.y * T + 2, w: (f.w || 1) * T, h: (f.h || 1) * T - 2 }); });
  MAPS[id] = { solids: sol, stations: r.stations, exit: { x: dx * T, y: 230, w: dw * T, h: 10 } };
}
// NPC zones: walkable rectangles (x, y, w, h in pixels) on a map
const ZONES = {
  clinic: { map: 'clinic', r: [100, 114, 84, 22] }, hqdesk: { map: 'hq', r: [116, 52, 60, 22] }, hq: { map: 'hq', r: [80, 100, 160, 90] },
  chapel: { map: 'chapel', r: [114, 82, 84, 22] }, quarters: { map: 'outside', r: [250, 84, 62, 20] },
  dfac: { map: 'outside', r: [10, 178, 60, 8] }, gym: { map: 'outside', r: [90, 178, 60, 8] }, flight: { map: 'outside', r: [180, 178, 120, 8] },
};
const ZONE_OF_STATION = { hq: 'hq', chapel: 'chapel', dfac: 'dfac', gym: 'gym', ops: 'flight' };

// ---------- looks ----------
const SKINS = ['#f2c9a0', '#e0ac85', '#c68863', '#8d5a3b', '#5c3a24'];
const HAIRS = ['#2b1b10', '#4a2f1a', '#8a6a3a', '#c9a15a', '#1c1c1c', '#9a3b1a', '#bdbdbd'];
const FLIGHTSUIT = { body: '#5d6b44', legs: '#4f5c3a' };
const OCP = { body: '#8f8a68', legs: '#857f5e', camo: '#6f6a4c' };
const CROSS = [[5, 8, '#d63a3a'], [4, 9, '#d63a3a'], [5, 9, '#d63a3a'], [6, 9, '#d63a3a'], [5, 10, '#d63a3a'], [4, 8, '#fff'], [6, 8, '#fff'], [4, 10, '#fff'], [6, 10, '#fff']];
const lookCache = {};
function lookFor(id) {
  if (id === 'me') return Object.assign({}, FLIGHTSUIT, { skin: S.look.skin, hair: S.look.hair, acc: CROSS });
  if (lookCache[id]) return lookCache[id];
  const r = PEOPLE[id], c = D.CAST[id], base = (c && c.look) || (r && r.look) || {};
  const h = strHash(id);
  const look = Object.assign({}, base.uniform === 'ocp' ? OCP : FLIGHTSUIT, {
    skin: base.skin || SKINS[h % SKINS.length], hair: base.hair || HAIRS[(h >> 3) % HAIRS.length], acc: [],
  });
  if (id === 'park') look.acc = [[3, 8, '#2a2a2a'], [8, 8, '#2a2a2a']];
  if (id === 'bell') look.acc = [[5, 8, '#2a2a2a'], [4, 9, '#2a2a2a'], [5, 9, '#2a2a2a'], [6, 9, '#2a2a2a'], [5, 10, '#2a2a2a']];
  if (id === 'okafor' || (r && r.role === 'medic')) look.acc = [[2, 9, '#d63a3a'], [2, 10, '#ffffff']];
  return (lookCache[id] = look);
}

// ---------- state ----------
let S = null;
function blankWeek() { return { seen: 0, dx: 0, dispo: 0, incidents: 0, over: 0, fdme: 0, flights: 0 }; }
function newState(o) {
  const people = {};
  D.ROSTER.forEach(p => { people[p.id] = { trust: D.TRAITS[p.trait].trust, down: null, fdmeDue: 0, fdmeDone: 0 }; });
  shuffle(D.ROSTER.map(p => p.id)).forEach((id, i) => { people[id].fdmeDue = 3 + Math.round(i * 46 / D.ROSTER.length); });
  return {
    v: 1, name: o.name, pron: o.pron, look: { skin: o.skin, hair: o.hair }, map: 'outside', coffeeDay: 0,
    day: 1, min: 360, energy: 100, maxE: 100, wallet: 40, budget: 40, items: { coffee: 0, donut: 0 },
    pos: { x: 150, y: 92 }, people, friends: {}, talked: {}, gifted: {}, scenes: {},
    xp: { clin: 0, aero: 0, lead: 0 }, upgrades: {}, flags: {}, queue: [], pending: [], scheduled: [],
    sickClosed: 0, fdmeDay: 0, flewDay: 0, quietDay: 0, events: {}, briefWeek: -1, used: {}, usedF: {}, flightIdx: 0,
    gym: 0, command: 50, hours: 0, week: blankWeek(), total: blankWeek(), readyHist: [], ended: false, grade: null,
  };
}
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() { try { const j = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return j && j.v === 1 ? migrate(j) : null; } catch (e) { return null; } }
// Bring saves from older versions up to date: new fields get defaults, new aircrew join the roster.
function migrate(old) {
  const fresh = newState({ name: old.name || 'Doc', pron: old.pron || 'they', skin: (old.look || {}).skin || SKINS[1], hair: (old.look || {}).hair || HAIRS[1] });
  const s = Object.assign({}, fresh, old);
  ['items', 'xp', 'week', 'total'].forEach(k => { s[k] = Object.assign({}, fresh[k], old[k]); });
  s.people = Object.assign({}, old.people);
  D.ROSTER.forEach(p => {
    const f = fresh.people[p.id];
    if (!s.people[p.id]) { s.people[p.id] = f; if (s.day > f.fdmeDue) f.fdmeDue = s.day + 3 + Math.floor(random() * 10); }
    else s.people[p.id] = Object.assign({}, f, s.people[p.id]);
  });
  s.queue = (s.queue || []).filter(q => PEOPLE[q.pid] && CASE[q.caseId]);
  s.pending = (s.pending || []).filter(q => PEOPLE[q.pid] && CASE[q.caseId]);
  s.scheduled = (s.scheduled || []).filter(q => PEOPLE[q.pid]);
  return s;
}

// ---------- derived ----------
const yday = () => ((S.day - 1) % END_DAY) + 1;        // day within the year (loops after the ending)
const season = () => Math.floor((yday() - 1) / 14);
const seasonKey = () => SEASONS[season()];
const dow = () => (S.day - 1) % 7;
const weekday = () => dow() < 5;
const week = () => Math.floor((S.day - 1) / 7);
const postgame = () => S.day > END_DAY;
const dateStr = () => `${SEASON_NAME[season()]} ${((yday() - 1) % 14) + 1}, ${DOW[dow()]}` + (postgame() ? ' (Year 2)' : '');
const hearts = id => Math.min(8, Math.floor((S.friends[id] || 0) / 100));
const pname = id => { const p = PEOPLE[id]; return p ? `${p.rank} ${p.name.split(' ').slice(-1)[0]}` : D.CAST[id].title; };
const fullName = id => { const p = PEOPLE[id]; return `${p.rank} ${p.name}`; };
const me = () => `CPT ${S.name}`;
const PRON = { they: ['they', 'them', 'their'], she: ['she', 'her', 'her'], he: ['he', 'him', 'his'] };
function level(k) { let l = 1; XP_LEVELS.forEach((t, i) => { if (S.xp[k] >= t) l = i + 1; }); return l; }
function overdue(id) { const s = S.people[id]; return !s.fdmeDone && S.day > s.fdmeDue + 7; }
function availableToFly(id) { return !S.people[id].down && !overdue(id); }
function readiness() { return Math.round(D.ROSTER.filter(p => availableToFly(p.id)).length / D.ROSTER.length * 100); }
function trustAvg(unit) {
  const list = D.ROSTER.filter(p => !unit || p.unit === unit);
  return Math.round(list.reduce((a, p) => a + S.people[p.id].trust, 0) / list.length);
}
const trustWord = t => t < 25 ? 'wary' : t < 40 ? 'guarded' : t < 60 ? 'neutral' : t < 80 ? 'open' : 'trusting';
const sickOpen = () => weekday() && S.min >= 450 && S.min < 720;
const fdmeOpen = () => weekday() && S.min >= 780 && S.min < 1020;
const flightOpen = () => weekday() && S.min >= 780 && S.min < 1200;
const fdmeDueList = () => D.ROSTER.map(p => p.id).filter(id => !S.people[id].fdmeDone && S.day >= S.people[id].fdmeDue - 3 && !S.people[id].down);
const upReadyList = () => D.ROSTER.map(p => p.id).filter(id => S.people[id].down && S.day >= S.people[id].down.until);
const has = u => !!S.upgrades[u];
const flightCost = () => hearts('rivera') >= 4 ? 8 : 15;

// ---------- effects ----------
function adjTrust(id, n) {
  const s = S.people[id]; if (!s) return;
  if (n > 0) {
    if (level('lead') >= 4) n += 1;
    const u = PEOPLE[id].unit;
    if (u === 'attack' && hearts('nguyen') >= 4) n += 2;
    if (u === 'dustoff' && hearts('brooks') >= 4) n += 2;
  }
  s.trust = clamp(s.trust + n, 0, 100);
}
function adjCommand(n) { S.command = clamp(S.command + n, 0, 100); }
function addFriend(id, n) { S.friends[id] = clamp((S.friends[id] || 0) + n, 0, 800); }
function gainXp(k, n) {
  const before = level(k); S.xp[k] += n; const after = level(k);
  if (after > before) sfx('levelup');
  if (after > before) toast(`${SKILL_NAME[k]} skill up! Level ${after}` + (SKILL_UNLOCK[k][after] ? `: ${SKILL_UNLOCK[k][after]}.` : '.'), 5000);
}
function spend(energy, mins) { S.energy = Math.max(0, S.energy - energy); S.min += mins; }
// Game time is compressed (a year is 56 days), so real-world down-slip lengths are scaled to a quarter.
function setDown(id, days, reason) { S.people[id].down = { until: S.day + Math.max(1, Math.round(days / 4)), reason }; }

// ---------- UI: toast, modal ----------
let toastTimer = 0;
function toast(msg, ms = 3500) { const t = $('toast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.style.display = 'none', ms); }
let modalOpen = false, modalOpts = {};
function show(title, render, opts = {}) {
  modalOpen = true; modalOpts = opts;
  const box = $('box'); box.innerHTML = '';
  const head = el('div', { class: 'mhead' });
  if (opts.look) head.appendChild(ART.portrait(opts.look));
  const ht = el('div', { class: 'mtitle' }, el('h2', {}, title));
  if (opts.sub) ht.appendChild(el('div', { class: 'sub' }, opts.sub));
  head.appendChild(ht); box.appendChild(head);
  const body = el('div', { class: 'mbody' }); box.appendChild(body);
  render(body);
  let i = 1;
  box.querySelectorAll('button.opt').forEach(b => { if (b.disabled || i > 9) return; b.dataset.key = i; b.querySelector('.k').textContent = i; i++; });
  $('modal').style.display = 'flex'; document.body.classList.add('modal-open');
  if (!opts.keepScroll) box.scrollTop = 0;
  const first = box.querySelector('button.opt:not(:disabled)'); if (first && !opts.noFocus) first.focus({ preventScroll: true });
}
function closeModal() { modalOpen = false; $('modal').style.display = 'none'; document.body.classList.remove('modal-open'); }
function opt(parent, label, fn, o = {}) {
  const b = el('button', { class: 'opt' + (o.cls ? ' ' + o.cls : '') }, el('span', { class: 'k' }), el('span', { class: 'lbl' }, label));
  if (o.note) b.appendChild(el('span', { class: 'note' }, o.note));
  if (o.disabled) b.disabled = true; else b.onclick = () => { sfx('click'); fn(); };
  parent.appendChild(b); return b;
}
function para(parent, html, cls) { const p = el('p', { class: cls || '' }); p.innerHTML = html; parent.appendChild(p); return p; }
function info(title, html, then, opts) { show(title, b => { para(b, html); opt(b, 'OK', () => { closeModal(); if (then) then(); }); }, opts); }
// Show a list of story pages one at a time. Each page: { text, who? }
function pages(title, list, done, i = 0) {
  if (i >= list.length) { closeModal(); if (done) done(); return; }
  const pg = list[i];
  show(pg.who ? D.CAST[pg.who].title : title, b => {
    para(b, esc(pg.text).replace(/\n/g, '<br>'));
    opt(b, i < list.length - 1 ? 'Next' : 'Continue', () => pages(title, list, done, i + 1));
  }, { look: pg.who ? lookFor(pg.who) : null });
}
// Short multiple-choice scene. steps: [{ text, options: [{ label, good, result }] }]
function quiz(title, steps, done, i = 0, score = 0, log = '') {
  if (i >= steps.length) { done(score, log); return; }
  const st = steps[i];
  show(title, b => {
    if (log) para(b, log, 'log');
    para(b, esc(st.text));
    shuffle(st.options).forEach(o => opt(b, o.label, () => quiz(title, steps, done, i + 1, score + (o.good ? 1 : 0), log + (o.good ? '✔ ' : '✘ ') + esc(o.result) + '<br>')));
  });
}

// ---------- sick call ----------
function maxTier() { return postgame() ? 3 : S.day <= 7 ? 1 : S.day <= 21 ? 2 : 3; }
function pickCase(p, exclude) {
  const list = D.CASES.filter(c => c.tier <= maxTier() && !exclude.includes(c.id) &&
    (c.seasons === 'all' || c.seasons.includes(seasonKey())) && c.roles.includes(p.role) && (!c.minAge || p.age >= c.minAge));
  if (!list.length) return null;
  const w = list.map(c => {
    let x = 1 / (1 + (S.used[c.id] || 0) * 1.5);
    if (c.tier === 3) x *= .6;
    if ((c.id === 'heat-exh' || c.id === 'heat-stroke') && S.flags.heatBrief) x *= .4;
    return x;
  });
  let r = random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
  return list[list.length - 1];
}
function buildQueue() {
  const q = S.queue.slice(0, 6);
  const inQ = id => q.some(x => x.pid === id);
  S.pending = S.pending.filter(pe => {
    if (pe.day > S.day) return true;
    if (!inQ(pe.pid) && !S.people[pe.pid].down) q.unshift({ pid: pe.pid, caseId: pe.caseId, open: true });
    return false;
  });
  const target = Math.min(6, 3 + (season() >= 1 ? 1 : 0) + (postgame() ? 1 : 0));
  let guard = 0;
  while (q.length < target && guard++ < 30) {
    const cands = D.ROSTER.filter(p => !S.people[p.id].down && !inQ(p.id));
    if (!cands.length) break;
    const p = rnd(cands), c = pickCase(p, q.map(x => x.caseId));
    if (c) q.push({ pid: p.id, caseId: c.id });
  }
  S.queue = q;
}
function closeSickCall(silent) {
  if (!weekday() || S.sickClosed === S.day) return;
  S.sickClosed = S.day;
  if (S.queue.length) {
    S.queue.forEach(x => { adjTrust(x.pid, -3); x.carry = true; });
    if (!silent) toast(`Sick call closed. ${S.queue.length} patient${S.queue.length > 1 ? 's' : ''} will come back tomorrow, a little annoyed.`, 5000);
  }
}

let CS = null; // current case state
function startSickCall() {
  if (S.energy < 6) { toast('Too tired to see patients. Eat at the DFAC first.'); return; }
  nextPatient();
}
function nextPatient() {
  if (!S.queue.length) { closeModal(); toast('Sick call is clear. Nice work.'); return; }
  if (!sickOpen()) { closeModal(); closeSickCall(); return; }
  if (S.energy < 6) { closeModal(); toast('You are running on empty. Grab a meal and come back.'); return; }
  const item = S.queue[0], cs = CASE[item.caseId], p = PEOPLE[item.pid];
  CS = {
    item, cs, p, asked: [], examined: [], tested: [], phase: 'work',
    dxOrder: shuffle(cs.dx), dx: null, dispo: null,
    low: !item.open && S.people[p.id].trust < 40,
    opener: rnd(D.TRAITS[p.trait].open),
  };
  spend(6, 10);
  renderCase();
}
function histLimit() { return 2 + (level('clin') >= 2 ? 1 : 0) + (has('room2') ? 1 : 0) + (hearts('okafor') >= 8 ? 1 : 0); }
function examLimit() { return 2 + (level('clin') >= 4 ? 1 : 0) + (has('room2') ? 1 : 0); }
function answerOf(h) { return CS.low && h.low ? h.low : h.a; }
function renderCase() {
  const { cs, p } = CS, st = S.people[p.id];
  show(fullName(p.id), b => {
    para(b, `${esc(p.job)}, ${esc(D.UNITS[p.unit].short)} · age ${p.age} · trust: <b>${trustWord(st.trust)}</b>` + (CS.item.carry ? ' · waited since yesterday' : ''), 'tag');
    if (CS.item.open) para(b, `“You told me to come in, Doc. So here I am.”`);
    else para(b, `“${esc(CS.opener)}”`);
    para(b, `“${esc(cs.complaint)}”`);
    para(b, `<b>Vitals:</b> ${esc(cs.vitals)}`, 'vitals');
    if (has('okafor')) {
      const k = cs.history.find(h => h.key);
      if (k) para(b, `<b>SSG Okafor's triage note:</b> ${esc(k.q)} ${esc(k.a)}`, 'note-box');
    }
    if (CS.phase === 'work') renderWork(b);
    else if (CS.phase === 'dx') renderDx(b);
    else if (CS.phase === 'dispo') renderDispo(b);
  }, { look: lookFor(p.id), sub: 'Sick call', keepScroll: CS.phase === 'work' && CS.asked.length + CS.examined.length + CS.tested.length > 0 });
}
function renderWork(b) {
  const { cs } = CS;
  const hl = histLimit(), el_ = examLimit();
  const sec = (title) => { const d = el('div', { class: 'sec' }, el('h3', {}, title)); b.appendChild(d); return d; };
  const h = sec(`History · ${CS.asked.length}/${hl} questions · 5 min each`);
  cs.history.forEach((q, i) => {
    if (CS.asked.includes(i)) {
      const guarded = CS.low && q.low;
      para(h, `<b>${esc(q.q)}</b><br>“${esc(answerOf(q))}”` + (guarded ? ' <i>(seems guarded)</i>' : ''), 'qa');
    }
  });
  cs.history.forEach((q, i) => { if (!CS.asked.includes(i)) opt(h, q.q, () => { CS.asked.push(i); S.min += 5; renderCase(); }, { disabled: CS.asked.length >= hl, cls: 'small' }); });
  const e = sec(`Exam · ${CS.examined.length}/${el_} · 5 min each`);
  cs.exam.forEach((q, i) => { if (CS.examined.includes(i)) para(e, `<b>${esc(q.q)}:</b> ${esc(q.a)}`, 'qa'); });
  cs.exam.forEach((q, i) => { if (!CS.examined.includes(i)) opt(e, q.q, () => { CS.examined.push(i); S.min += 5; renderCase(); }, { disabled: CS.examined.length >= el_, cls: 'small' }); });
  if (cs.tests.length) {
    const t = sec(`Tests · budget ${S.budget}`);
    cs.tests.forEach((q, i) => {
      const def = D.TESTS[q.id];
      if (CS.tested.includes(i)) { para(t, `<b>${esc(def.name)}:</b> ${esc(q.a)}`, 'qa'); return; }
      const missing = def.needs && !has(def.needs);
      opt(t, def.name, () => { S.budget -= def.cost; S.min += def.time; CS.tested.push(i); renderCase(); },
        { disabled: missing || S.budget < def.cost, cls: 'small', note: missing ? `needs ${D.NEEDS_NAME[def.needs]}` : `${def.cost} budget · ${def.time} min` });
    });
  }
  const go = el('div', { class: 'sec' }); b.appendChild(go);
  opt(go, 'Make a diagnosis', () => { CS.phase = 'dx'; renderCase(); }, { cls: 'hi' });
}
function renderDx(b) {
  const d = el('div', { class: 'sec' }, el('h3', {}, 'What is the diagnosis?')); b.appendChild(d);
  CS.dxOrder.forEach(x => opt(d, x, () => { CS.dx = x; CS.phase = 'dispo'; renderCase(); }));
  opt(d, 'Back to the workup', () => { CS.phase = 'work'; renderCase(); }, { cls: 'small' });
}
function renderDispo(b) {
  const d = el('div', { class: 'sec' }, el('h3', {}, 'Aeromedical disposition')); b.appendChild(d);
  para(d, `Diagnosis: <b>${esc(CS.dx)}</b>`, 'tag');
  ['fly', 'down', 'waiver', 'evac'].forEach(k => opt(d, D.DISPO[k].label, () => { CS.dispo = k; resolveCase(); }));
}
function resolveCase() {
  const { cs, p, item } = CS, id = p.id;
  S.queue.shift();
  S.used[cs.id] = (S.used[cs.id] || 0) + 1;
  const dxOk = CS.dx === cs.dx[0];
  const okDispo = CS.dispo === cs.dispo || (cs.ok || []).includes(CS.dispo);
  const diff = ORDER[CS.dispo] - ORDER[cs.dispo];
  const kind = okDispo ? 'right' : diff < 0 ? 'unsafe' : 'over';
  const keys = [...cs.history.map((h, i) => h.key && CS.asked.includes(i) && !(CS.low && h.low)), ...cs.exam.map((h, i) => h.key && CS.examined.includes(i)), ...cs.tests.map((h, i) => h.key && CS.tested.includes(i))].filter(Boolean).length;
  const keyTotal = [...cs.history, ...cs.exam, ...cs.tests].filter(h => h.key).length;
  const thorough = keyTotal > 0 && keys >= Math.min(keyTotal, 3);
  const before = S.people[id].trust;
  const lines = [];

  S.week.seen++; if (dxOk) S.week.dx++; if (okDispo) S.week.dispo++;
  adjTrust(id, dxOk ? 5 : -3);
  gainXp('clin', dxOk ? 4 + (thorough ? 2 : 0) : 1);
  gainXp('aero', okDispo ? 4 : 1);
  lines.push(dxOk ? `<b>✔ Diagnosis correct.</b>` : `<b>✘ Diagnosis missed.</b> It was: ${esc(cs.dx[0])}.`);
  if (kind === 'right') {
    adjTrust(id, 4);
    lines.push(`<b>✔ Disposition correct:</b> ${D.DISPO[CS.dispo].short}.`);
    if (cs.dispo === 'evac') { adjCommand(3); lines.push(`Fast thinking. COL Park will hear about this one.`); }
  } else if (kind === 'over') {
    adjTrust(id, -6); adjCommand(-1); S.week.over++;
    lines.push(`<b>✘ Overcautious.</b> You chose ${D.DISPO[CS.dispo].short}; the right call was ${D.DISPO[cs.dispo].short}. ${esc(pname(id))} is not happy about it, and the unit loses a crew member.`);
  } else {
    lines.push(`<b>✘ Not safe.</b> You chose ${D.DISPO[CS.dispo].short}; the right call was ${D.DISPO[cs.dispo].short}.`);
    const worse = cs.dispo === 'evac';
    S.scheduled.push({ day: S.day + (worse ? 1 : CS.dispo === 'fly' ? 1 + Math.floor(random() * 2) : 3), type: worse ? 'worse' : 'incident', pid: id, caseId: cs.id });
  }
  if (thorough && dxOk) lines.push(`Thorough workup: bonus Clinical XP.`);
  sfx(dxOk && kind === 'right' ? 'good' : 'bad');
  if (CS.dispo === 'down') setDown(id, okDispo ? cs.days : 2, cs.title);
  else if (CS.dispo === 'waiver') setDown(id, Math.max(cs.days || 0, 10), cs.title + ' (workup)');
  else if (CS.dispo === 'evac') setDown(id, Math.max(cs.days || 0, 10), cs.title + ' (hospital)');
  const dt = S.people[id].trust - before;
  lines.push(`Trust with ${esc(pname(id))}: ${dt >= 0 ? '+' : ''}${dt}.`);

  show('Case review', b => {
    lines.forEach(l => para(b, l));
    para(b, `<b>Plan:</b> ${esc(cs.tx)}`);
    para(b, `<b>Teaching point:</b> ${esc(cs.teach)}`, 'teach');
    para(b, `Source to check: ${esc(cs.source)}`, 'tag');
    const left = S.queue.length;
    if (left && sickOpen()) {
      opt(b, `Next patient (${left} waiting)`, nextPatient, { cls: 'hi' });
      opt(b, 'Take a break', closeModal);
    } else {
      opt(b, left ? 'Done (sick call is closing)' : 'Done: sick call is clear', () => { closeModal(); if (left) closeSickCall(); });
    }
  }, { look: lookFor(id), sub: fullName(id) });
}

// ---------- FDMEs ----------
let FS = null;
function fdmeChecks() { return 2 + (level('aero') >= 2 ? 1 : 0); }
function startFdmes() {
  const due = fdmeDueList().slice(0, 3);
  if (!due.length) return;
  S.fdmeDay = S.day;
  const batch = due.map(pid => {
    let f = null;
    if (random() < .5) {
      const fresh = D.FDME.filter(x => !S.usedF[x.id]);
      const pool = fresh.length ? fresh : D.FDME;
      f = rnd(pool); S.usedF[f.id] = (S.usedF[f.id] || 0) + 1;
    }
    return { pid, f };
  });
  FS = { batch, i: 0, checks: [] };
  renderFdme();
}
function renderFdme() {
  const { pid, f } = FS.batch[FS.i], p = PEOPLE[pid];
  show(fullName(pid), b => {
    para(b, `Annual FDME ${FS.i + 1} of ${FS.batch.length} · ${esc(p.job)}, ${esc(D.UNITS[p.unit].short)} · age ${p.age}`, 'tag');
    para(b, `<b>Questionnaire:</b> ${esc(f ? f.q : D.FDME_NORMAL.q)}`);
    para(b, `<b>Basic exam:</b> height, weight and screening exam unremarkable.`);
    const s = el('div', { class: 'sec' }, el('h3', {}, `Checks · ${FS.checks.length}/${fdmeChecks()} · 5 min each`)); b.appendChild(s);
    FS.checks.forEach(k => para(s, `<b>${esc(D.FDME_CHECKS[k].name)}:</b> ${esc((f && f.checks[k]) || D.FDME_NORMAL.checks[k])}`, 'qa'));
    Object.keys(D.FDME_CHECKS).forEach(k => {
      if (FS.checks.includes(k)) return;
      const def = D.FDME_CHECKS[k], missing = def.needs && !has(def.needs);
      opt(s, def.name, () => { FS.checks.push(k); S.min += 5; renderFdme(); },
        { disabled: missing || FS.checks.length >= fdmeChecks(), cls: 'small', note: missing ? `needs ${D.NEEDS_NAME[def.needs]}` : '' });
    });
    const d = el('div', { class: 'sec' }, el('h3', {}, 'Decision')); b.appendChild(d);
    opt(d, 'Qualified: up slip, no restrictions', () => resolveFdme('fly'));
    opt(d, 'Short down slip: fix it and recheck', () => resolveFdme('down'));
    opt(d, 'Down slip + workup / waiver request', () => resolveFdme('waiver'));
  }, { look: lookFor(pid), sub: 'Flight Duty Medical Exam', keepScroll: FS.checks.length > 0 });
}
function resolveFdme(choice) {
  const { pid, f } = FS.batch[FS.i];
  const correct = f ? f.correct : 'fly';
  const ok = choice === correct || (f && (f.ok || []).includes(choice));
  const detected = !f || !f.key || FS.checks.includes(f.key);
  const lacking = f && f.needs && !has(f.needs);
  S.people[pid].fdmeDone = S.day; S.week.fdme++;
  spend(5, level('aero') >= 4 ? 10 : 20);
  const lines = [];
  if (ok) {
    adjTrust(pid, 3); gainXp('aero', 3);
    lines.push(f ? `<b>✔ Good catch:</b> ${esc(f.title)}.` : `<b>✔ Routine FDME.</b> Qualified, no issues.`);
  } else if (ORDER[choice] > ORDER[correct]) {
    adjTrust(pid, -6); adjCommand(-1); gainXp('aero', 1); S.week.over++;
    lines.push(`<b>✘ Overcautious.</b> ${f ? 'This finding did not need that.' : 'There was nothing wrong.'} ${esc(pname(pid))} is grounded for nothing.`);
  } else if (!detected) {
    gainXp('aero', 1);
    lines.push(`<b>✘ Something was missed:</b> ${esc(f.title)}. ` + (lacking ? `You couldn't test for it without ${D.NEEDS_NAME[f.needs]}.` : `The right check would have found it.`));
    S.scheduled.push({ day: S.day + 3, type: 'missed', pid, text: f.title, lacking: !!lacking });
  } else {
    gainXp('aero', 1);
    lines.push(`<b>✘ Not safe.</b> You found ${esc(f.title.toLowerCase())} but cleared them anyway.`);
    S.scheduled.push({ day: S.day + 2, type: 'missed', pid, text: f.title, unsafe: true });
  }
  sfx(ok ? 'good' : 'bad');
  if (choice === 'down') setDown(pid, 3, 'FDME follow-up');
  if (choice === 'waiver') setDown(pid, 14, 'FDME workup/waiver');
  show('FDME review', b => {
    lines.forEach(l => para(b, l));
    para(b, `<b>Teaching point:</b> ${esc(f ? f.teach : D.FDME_NORMAL.teach)}`, 'teach');
    if (f) para(b, `Source to check: ${esc(f.source)}`, 'tag');
    FS.i++; FS.checks = [];
    if (FS.i < FS.batch.length) opt(b, `Next FDME (${FS.batch.length - FS.i} left)`, renderFdme, { cls: 'hi' });
    else opt(b, 'Done with FDMEs', closeModal);
  }, { look: lookFor(pid), sub: fullName(pid) });
}

// ---------- up slips ----------
function upSlips() {
  const list = upReadyList();
  show('Up slips', b => {
    para(b, list.length ? 'These aircrew have recovered and are ready to return to flying duty.' : 'No up slips waiting.');
    list.forEach(id => opt(b, `Sign for ${pname(id)}`, () => { S.people[id].down = null; adjTrust(id, 3); gainXp('aero', 1); S.min += 5; toast(`${pname(id)} is back on flying status.`); upSlips(); }, { note: S.people[id].down.reason }));
    opt(b, 'Back', clinicMenu);
  }, { closable: true });
}

// ---------- flights ----------
function startFlight() {
  let f = D.FLIGHTS[S.flightIdx];
  if (f && f.crew.every(id => !S.people[id].down)) S.flightIdx++;
  else {
    const unit = ['assault', 'attack', 'dustoff'][S.day % 3];
    const crew = shuffle(D.ROSTER.filter(p => p.unit === unit && !S.people[p.id].down)).slice(0, 2).map(p => p.id);
    if (!crew.length) { toast('No crews are flying today.'); return; }
    f = { unit, crew, title: `Training flight with ${D.UNITS[unit].short}`, lines: D.GENERIC_FLIGHT_LINES[unit].map(t => ['narr', t]).concat([[crew[0], rnd([`Thanks for flying with us, Doc. Most docs never leave the clinic.`, `Good to have you up here, Doc.`, `Now you know why our backs hurt.`])]]), teach: 'Flying with crews is part of the job: you see the stresses they work under and they see you as part of the team.' };
  }
  S.flewDay = S.day;
  spend(flightCost(), 180);
  S.hours += 2; S.week.flights++;
  D.ROSTER.filter(p => p.unit === f.unit).forEach(p => adjTrust(p.id, 3));
  f.crew.forEach(id => { adjTrust(id, 4); if (D.CAST[id]) addFriend(id, 25); });
  gainXp('lead', 2);
  show(f.title, b => {
    const script = el('div', { class: 'script' }); b.appendChild(script);
    f.lines.forEach(([who, text]) => {
      const row = el('div', { class: 'line' });
      if (who !== 'narr') row.appendChild(ART.portrait(lookFor(who)));
      row.appendChild(el('p', { html: (who !== 'narr' ? `<b>${esc(pname(who))}:</b> ` : '') + esc(text) }));
      script.appendChild(row);
    });
    if (f.choice) {
      para(b, `<b>${esc(f.choice.prompt)}</b>`);
      f.choice.options.forEach(o => opt(b, o.label, () => {
        if (o.trust) for (const k in o.trust) adjTrust(k, o.trust[k]);
        if (o.friend) for (const k in o.friend) addFriend(k, o.friend[k]);
        if (o.flag) S.flags[o.flag] = true;
        if (o.schedule) S.pending.push({ day: S.day + 1, pid: o.schedule.pid, caseId: o.schedule.caseId });
        info('After the flight', `${esc(o.result)}<br><br><b>Teaching point:</b> ${esc(f.teach)}<br><br>+2 flight hours. The crews noticed you showed up.`);
      }));
    } else {
      para(b, `<b>Teaching point:</b> ${esc(f.teach)}`, 'teach');
      opt(b, 'Land and debrief (+2 flight hours)', closeModal);
    }
  });
}

// ---------- weekly brief, story ----------
function weeklyBrief(auto) {
  const w = S.week, r = readiness();
  const perf = w.seen ? (w.dx + w.dispo) / (2 * w.seen) : 0.7;
  let budget = 20 + Math.round(r / 5) + (perf >= .75 ? 10 : 0) + (level('lead') >= 2 ? 10 : 0) + (hearts('park') >= 4 ? 10 : 0) - w.incidents * 8 + (w.flights ? 5 : 0);
  if (auto) budget = Math.round(budget / 2);
  budget = Math.max(10, budget);
  S.budget += budget;
  const dc = auto ? -5 : 2 + (perf >= .75 ? 2 : perf < .5 ? -2 : 0) - w.incidents * 2 + (w.flights ? 1 : 0);
  adjCommand(dc);
  S.readyHist.push(r);
  for (const k in w) S.total[k] += w[k];
  S.briefWeek = week();
  const remark = w.incidents ? `"We had ${w.incidents} safety event${w.incidents > 1 ? 's' : ''} tied to medical calls this week. I need you sharper, Doc."` :
    r >= 85 && perf >= .7 ? `"Readiness is up and nobody got hurt. That's the job. Good week, Doc."` :
    r < 70 ? `"I'm short on crews, Doc. Make sure every down slip is earning its keep."` :
    `"Steady week. Keep it up."`;
  S.week = blankWeek();
  const html = `<b>Patients seen:</b> ${w.seen} · diagnosis ${w.dx}/${w.seen} · disposition ${w.dispo}/${w.seen}<br>` +
    `<b>FDMEs:</b> ${w.fdme} · <b>Flights:</b> ${w.flights} · <b>Overcautious calls:</b> ${w.over}<br>` +
    `<b>Readiness:</b> ${r}% · <b>Trust:</b> Assault ${trustAvg('assault')}, Attack ${trustAvg('attack')}, Dustoff ${trustAvg('dustoff')}<br><br>` +
    `COL Park: ${esc(remark)}<br><br>Clinic budget +${budget}.`;
  if (auto) return html;
  spend(5, 60); gainXp('lead', 5);
  info('Weekly brief', html, null, { look: lookFor('park'), sub: 'Brigade HQ' });
  return html;
}
function runIncident() {
  S.flags.incident = true; sfx('alarm');
  pages('Hard landing', [{ text: D.STORY.incidentAlert }], () => quiz('Hard landing', D.STORY.incident, (score, log) => {
    setDown('nguyen', 21, 'Hard landing: back injury'); setDown('patel', 10, 'Hard landing: concussion');
    adjCommand(score * 2 - 1); gainXp('lead', 6); gainXp('clin', score * 2);
    S.min = Math.max(S.min, 1020); S.energy = Math.max(0, S.energy - 20);
    info('After the hard landing', `${log}<br>${esc(D.STORY.incidentEnd)}` + (S.flags.crewRestRaised ? `<br><br>The crew had flown the late cycle anyway; the schedule change you pushed for started next week.` : ''));
  }));
}
function runBoard() {
  quiz('Safety investigation board', D.STORY.board, (score, log) => {
    S.flags.board = true; gainXp('lead', 8); spend(10, 120);
    let extra = '';
    if (S.flags.crewRestRaised) { adjCommand(10); extra = `<br><br>COL Park, afterward: "You told me about the sleep problem before this happened. I should have moved faster. That won't happen again."`; }
    else if (S.flags.nguyenTalk) { adjCommand(4); extra = `<br><br>You mention that you'd talked with Nguyen about fatigue at the gunnery range. The board notes it.`; }
    else extra = `<br><br>Looking back, there were signs in the schedule. Next time, you'll speak up earlier.`;
    adjCommand(score * 2);
    info('Board complete', log + extra);
  });
}
function runInspection(done) {
  S.ended = true;
  for (const k in S.week) S.total[k] += S.week[k];
  S.week = blankWeek();
  const hist = S.readyHist.concat([readiness()]);
  const avgReady = Math.round(hist.reduce((a, b) => a + b, 0) / hist.length);
  const trust = trustAvg(), ups = Object.keys(S.upgrades).length;
  const acc = S.total.seen ? (S.total.dx + S.total.dispo) / (2 * S.total.seen) : 0;
  const score = avgReady * .3 + trust * .25 + S.command * .25 + ups / 6 * 10 + acc * 10 - S.total.incidents * 3;
  const grade = score >= 70 ? 'Outstanding' : score >= 57 ? 'Excellent' : score >= 45 ? 'Satisfactory' : 'Room to grow';
  S.grade = grade;
  const [sub, obj] = PRON[S.pron] || PRON.they;
  const speech = grade === 'Outstanding' ? `"A year ago this clinic was a coffee pot and a broken booth. Now my crews actually go see the doc. ${me()} did that, and I'm proud of ${obj}."` :
    grade === 'Excellent' ? `"${me()} kept this brigade flying, and flying safely. The crews trust ${obj}. So do I."` :
    grade === 'Satisfactory' ? `"It was a hard year. ${me()} stuck with it, and the brigade is better for it."` :
    `"Not every year goes to plan. ${me()} learned a lot, and so did we. Next year will be better."`;
  const epi = Object.keys(D.EPILOGUES).map(id => `<b>${esc(D.CAST[id].title)}:</b> ${esc(hearts(id) >= 4 ? D.EPILOGUES[id].good : D.EPILOGUES[id].ok)}`).join('<br><br>');
  pages('Inspection', [
    { text: `The inspection team walks through the clinic, the records and the flight line. COL Park reads the results at the year-end ceremony.` },
    { who: 'park', text: `COL Park: ${speech}` },
  ], () => show(`Year-end: ${grade}`, b => {
    para(b, `<b>Average readiness:</b> ${avgReady}% · <b>Aircrew trust:</b> ${trust} · <b>Command confidence:</b> ${S.command}<br><b>Clinic upgrades:</b> ${ups}/6 · <b>Patients seen:</b> ${S.total.seen} · <b>Accuracy:</b> ${Math.round(acc * 100)}% · <b>Safety events:</b> ${S.total.incidents}`);
    para(b, epi);
    para(b, `Thanks for playing Flight Line Doc. You can keep playing into Year 2 with the full case mix.`, 'tag');
    opt(b, 'Keep playing (Year 2)', () => { closeModal(); save(); if (done) done(); });
  }));
  save();
}

// ---------- new day ----------
function fireScheduled(notes) {
  S.scheduled = S.scheduled.filter(e => {
    if (e.day > S.day) return true;
    const name = pname(e.pid);
    if (e.type === 'incident') {
      const cs = CASE[e.caseId];
      notes.push(`<b>Safety report:</b> ` + esc((cs.incident || '{name} had a problem in flight that should have kept them on the ground. The crew landed safely.').replace(/\{name\}/g, name)));
      setDown(e.pid, cs.days || 3, cs.title); adjCommand(-8); adjTrust(e.pid, -5); S.week.incidents++;
    } else if (e.type === 'worse') {
      const cs = CASE[e.caseId];
      notes.push(`<b>Bad news:</b> ` + esc((cs.incident || '{name} got worse overnight and went to the ER.').replace(/\{name\}/g, name)));
      setDown(e.pid, Math.max(cs.days || 10, 10), cs.title + ' (hospital)'); adjCommand(-6); adjTrust(e.pid, -8); S.week.incidents++;
    } else if (e.type === 'missed') {
      if (e.lacking) { notes.push(`The hospital flagged ${esc(e.text.toLowerCase())} in ${esc(name)} at a follow-up visit, something your clinic couldn't test for yet. COL Park: "Get that equipment fixed, Doc."`); adjCommand(-1); }
      else { notes.push(`<b>Follow-up:</b> ${esc(e.text)} in ${esc(name)} came to light at the hospital, and it should have been caught at the FDME.`); adjCommand(-3); adjTrust(e.pid, -3); if (e.unsafe) S.week.incidents++; }
      setDown(e.pid, 7, e.text);
    }
    return false;
  });
}
function newDay(rested) {
  closeSickCall(true);
  const notes = [];
  if (dow() === 4 && S.briefWeek !== week()) notes.push(`You missed the weekly brief. COL Park was not pleased.<br>` + weeklyBrief(true));
  if (S.day === END_DAY && !S.ended) { runInspection(() => newDay(rested)); return; }
  S.day++; S.min = 360; wakeUp();
  S.energy = rested ? S.maxE : Math.round(S.maxE * .6);
  if (!rested) notes.push(`You fell asleep at your desk and woke up stiff. Get to bed before 0200.`);
  let boost = (has('espresso') ? 15 : 0) + (hearts('okafor') >= 4 ? 10 : 0);
  if (boost) { S.energy = Math.min(S.maxE + 25, S.energy + boost); notes.push(`Fresh coffee at the clinic: +${boost} energy.`); }
  S.talked = {}; S.gifted = {};
  if (dow() === 0) { S.wallet += 40; notes.push(`Payday: +$40.`); }
  fireScheduled(notes);
  const ups = upReadyList().length;
  if (ups) notes.push(`${ups} aircrew ready for an up slip at the clinic.`);
  if (S.day === END_DAY + 1) D.ROSTER.forEach((p, i) => { S.people[p.id].fdmeDone = 0; S.people[p.id].fdmeDue = S.day + 3 + Math.round(i * 46 / D.ROSTER.length); });
  if (!postgame()) {
    if (S.day === 15) { S.flags.heatAsk = true; notes.push(`<b>Summer.</b> ` + esc(D.STORY.heatAsk)); }
    if (S.day === 29) notes.push(`<b>Fall.</b> ` + esc(D.STORY.fatigueNote) + ` You could raise it with COL Park at Brigade HQ.`);
    if (S.day === 43) notes.push(`<b>Winter.</b> ` + esc(D.STORY.winterNote));
    if (S.day === END_DAY) notes.push(`<b>${esc(D.STORY.inspectionNote)}</b>`);
    if (S.day === 39 && S.flags.incident) notes.push(`The safety investigation board wants to interview you at Brigade HQ.`);
  }
  const ev = eventToday();
  if (ev) notes.push(`<b>Today:</b> ${esc(ev.title)} at the ${esc(STATION_BY_ID[ev.loc].name)}, ${clock(ev.from)}–${clock(ev.to)}.`);
  if (weekday()) { buildQueue(); notes.push(`Sick call 0730–1200: ${S.queue.length} patients waiting.`); }
  const due = fdmeDueList().length;
  if (weekday() && due) notes.push(`FDMEs due: ${due}${D.ROSTER.some(p => overdue(p.id)) ? ' (some are overdue and grounded until done!)' : ''}.`);
  save();
  show(dateStr(), b => { notes.forEach(n => para(b, n)); opt(b, 'Start the day', closeModal); }, { sub: `Readiness ${readiness()}% · Budget ${S.budget} · $${S.wallet}` });
}

// ---------- events ----------
function eventToday() { return D.EVENTS.find(e => e.day === yday()); }
function eventHere(loc) {
  const e = eventToday();
  return e && e.loc === loc && S.min >= e.from && S.min < e.to && !S.events[e.id + S.day] ? e : null;
}
function joinEvent(e) {
  S.events[e.id + S.day] = true;
  D.ROSTER.forEach(p => adjTrust(p.id, 2));
  Object.keys(D.CAST).forEach(id => addFriend(id, 20));
  gainXp('lead', 3); S.min += 120; S.energy = Math.min(S.maxE + 25, S.energy + 10);
  info(e.title, `${esc(e.text)}<br><br>Everyone's trust and friendship went up a little.`);
}
function eventOpt(b, loc) { const e = eventHere(loc); if (e) opt(b, `Join: ${e.title}`, () => joinEvent(e), { cls: 'hi' }); }

// ---------- station menus ----------
function sickNote() { return !weekday() ? 'weekdays only' : S.min < 450 ? 'opens 0730' : S.min >= 720 ? 'closed for today' : !S.queue.length ? 'nobody waiting' : ''; }
function fdmeNote() { return !weekday() ? 'weekdays only' : S.min < 780 ? 'afternoons, from 1300' : S.min >= 1020 ? 'done for today (until 1700)' : S.fdmeDay === S.day ? 'already did a batch today' : !fdmeDueList().length ? 'none due' : ''; }
function coffeeAction() {
  if (S.coffeeDay === S.day) { toast('One cup is plenty.'); return; }
  S.coffeeDay = S.day; const g = has('espresso') ? 10 : 3;
  S.energy = Math.min(S.maxE + 25, S.energy + g);
  toast(has('espresso') ? `A proper espresso. +${g} energy.` : `The old pot. It tastes like regret. +${g} energy.`);
}
function clinicMenu() {
  show('Aviation Medicine Clinic', b => {
    const n = S.queue.length, due = fdmeDueList(), ups = upReadyList();
    para(b, `Readiness ${readiness()}% · clinic budget ${S.budget} · ${Object.keys(S.upgrades).length}/6 upgrades`, 'tag');
    const sn = sickNote();
    opt(b, `Sick call (${n} waiting)`, startSickCall, { disabled: !!sn, note: sn, cls: sn ? '' : 'hi' });
    const fNote = fdmeNote();
    opt(b, `FDMEs (${due.length} due)`, startFdmes, { disabled: !!fNote, note: fNote, cls: fNote ? '' : 'hi' });
    opt(b, `Sign up slips (${ups.length} ready)`, upSlips, { disabled: !ups.length });
    opt(b, 'Study in the office (60 min)', studyMenu, { disabled: S.min >= 1320, note: S.min >= 1320 ? 'too late' : '' });
    opt(b, 'Clinic upgrades', upgradesMenu);
    opt(b, 'Leave', closeModal);
  }, { closable: true });
}
function studyMenu() {
  show('Study', b => {
    para(b, 'An hour with the books. Costs 10 energy.');
    [['clin', 'Read clinical journals'], ['aero', 'Study the Aeromedical Policy Letters'], ['lead', 'Read about leading teams']].forEach(([k, label]) =>
      opt(b, `${label} (${SKILL_NAME[k]} level ${level(k)})`, () => { spend(10, 60); gainXp(k, 6); closeModal(); toast(`You studied. +6 ${SKILL_NAME[k]} XP.`); }, { disabled: S.energy < 10 }));
    opt(b, 'Back', clinicMenu);
  }, { closable: true });
}
function upgradesMenu() {
  show('Clinic upgrades', b => {
    para(b, `Clinic budget: <b>${S.budget}</b>. COL Park grants more at each Friday brief, based on readiness.`, 'tag');
    D.UPGRADES.forEach(u => {
      if (has(u.id)) { para(b, `✔ <b>${esc(u.name)}</b>: ${esc(u.desc)}`, 'qa'); return; }
      opt(b, `${u.name} (${u.cost})`, () => { sfx('cash'); S.budget -= u.cost; S.upgrades[u.id] = S.day; gainXp('lead', 3); toast(`Installed: ${u.name}.`); upgradesMenu(); }, { disabled: S.budget < u.cost, note: u.desc });
    });
    opt(b, 'Back', clinicMenu);
  }, { closable: true });
}
function hqMenu() {
  show('Brigade HQ', b => {
    const fri = dow() === 4;
    if (fri && S.briefWeek !== week()) {
      const open = S.min >= 840 && S.min < 1080;
      opt(b, 'Weekly brief with COL Park', () => weeklyBrief(false), { disabled: !open, note: open ? '' : '1400–1800', cls: open ? 'hi' : '' });
    }
    const workHours = S.min >= 480 && S.min < 1020;
    if (!postgame()) {
      if (S.flags.heatAsk && !S.flags.heatBrief && S.day <= 17)
        opt(b, 'Give the heat injury prevention brief', () => { S.flags.heatBrief = true; adjCommand(5); gainXp('lead', 8); spend(8, 60); pages('Heat brief', D.STORY.heatBrief); }, { disabled: !workHours, note: workHours ? '' : '0800–1700', cls: 'hi' });
      if (S.day >= 29 && S.day < 37 && !S.flags.crewRestRaised)
        opt(b, 'Raise the crew rest problem with COL Park', () => { S.flags.crewRestRaised = true; adjCommand(2); gainXp('lead', 5); S.min += 30; pages('Crew rest', D.STORY.crewRest); }, { disabled: !workHours, note: workHours ? '' : '0800–1700' });
      if (S.flags.incident && !S.flags.board && S.day >= 39)
        opt(b, 'Safety investigation board interview', runBoard, { disabled: !(S.min >= 540 && S.min < 1020), note: '0900–1700', cls: 'hi' });
      if (S.day === END_DAY && !S.ended)
        opt(b, 'Year-end readiness inspection', () => { closeModal(); runInspection(); }, { disabled: !(S.min >= 540 && S.min < 1020), note: '0900–1700', cls: 'hi' });
    }
    eventOpt(b, 'hq');
    opt(b, 'Read the bulletin board', bulletin);
    opt(b, 'Leave', closeModal);
  }, { closable: true });
}
function bulletin() {
  const lines = [];
  for (let d = S.day; d < S.day + 7; d++) {
    const e = D.EVENTS.find(x => x.day === ((d - 1) % END_DAY) + 1);
    if (e) lines.push(`${esc(e.title)}: ${DOW[(d - 1) % 7]} at the ${esc(STATION_BY_ID[e.loc].name)}, ${clock(e.from)}–${clock(e.to)}`);
  }
  info('Bulletin board', `<b>Every weekday:</b> sick call 0730–1200 · FDMEs 1300–1700 · flights 1300–2000<br><b>Fridays:</b> weekly brief 1400–1800<br><br>` +
    (lines.length ? `<b>This week:</b><br>${lines.join('<br>')}` : 'No events posted this week.'), hqMenu);
}
function chapelMenu() {
  show('Chapel', b => {
    para(b, 'Quiet, cool, and smells faintly of old hymnals and coffee.');
    const gain = hearts('bell') >= 4 ? 30 : 15;
    opt(b, `Sit for a quiet moment (+${gain} energy, 20 min)`, () => { S.quietDay = S.day; S.energy = Math.min(S.maxE + 25, S.energy + gain); S.min += 20; closeModal(); toast('You feel steadier.'); }, { disabled: S.quietDay === S.day, note: S.quietDay === S.day ? 'once a day' : '' });
    eventOpt(b, 'chapel');
    opt(b, 'Leave', closeModal);
  }, { closable: true });
}
function quartersMenu() {
  show('Your quarters', b => {
    para(b, S.min < 1080 ? `It's early. Sleeping now ends the day.` : 'Lights out? Sleeping saves the game.');
    opt(b, 'Go to sleep', () => { closeModal(); sfx('sleep'); newDay(S.min < 1440); });
    opt(b, 'Not yet', closeModal);
  }, { closable: true });
}
function dfacMenu() {
  show('DFAC', b => {
    para(b, `Wallet: $${S.wallet} · coffee: ${S.items.coffee} · donuts: ${S.items.donut}`, 'tag');
    opt(b, 'Hot meal ($5): +40 energy, 30 min', () => { sfx('cash'); S.wallet -= 5; S.energy = Math.min(S.maxE, S.energy + 40); S.min += 30; closeModal(); toast('That hit the spot.'); }, { disabled: S.wallet < 5 || S.energy >= S.maxE, note: S.energy >= S.maxE ? 'not hungry' : '' });
    opt(b, 'Coffee to go ($3): a small gift', () => { sfx('cash'); S.wallet -= 3; S.items.coffee++; dfacMenu(); }, { disabled: S.wallet < 3 });
    opt(b, 'Box of donuts ($8): a big gift', () => { sfx('cash'); S.wallet -= 8; S.items.donut++; dfacMenu(); }, { disabled: S.wallet < 8 });
    eventOpt(b, 'dfac');
    opt(b, 'Leave', closeModal);
  }, { closable: true });
}
function gymMenu() {
  show('Gym', b => {
    para(b, `PT sessions: ${S.gym}. Every 3 sessions raises your max energy by 5.`, 'tag');
    opt(b, 'Work out (-15 energy, 60 min)', () => { spend(15, 60); S.gym++; if (S.gym % 3 === 0) { S.maxE += 5; toast(`Max energy up to ${S.maxE}!`); } else toast('Good workout.'); closeModal(); }, { disabled: S.energy < 15 });
    eventOpt(b, 'gym');
    opt(b, 'Leave', closeModal);
  }, { closable: true });
}
function opsMenu() {
  show('Flight Ops', b => {
    para(b, `Flight hours this year: ${S.hours}. Flying with crews builds trust with their unit.`, 'tag');
    const note = !weekday() ? 'weekdays only' : S.min < 780 ? 'from 1300' : S.min >= 1200 ? 'last takeoff 2000' : S.flewDay === S.day ? 'already flew today' : S.energy < flightCost() ? 'too tired' : '';
    opt(b, `Fly with a crew (about 3 hours, -${flightCost()} energy)`, () => { closeModal(); startFlight(); }, { disabled: !!note, note, cls: note ? '' : 'hi' });
    eventOpt(b, 'ops');
    opt(b, 'Leave', closeModal);
  }, { closable: true });
}
const MENUS = { clinic: clinicMenu, hq: hqMenu, chapel: chapelMenu, quarters: quartersMenu, dfac: dfacMenu, gym: gymMenu, ops: opsMenu };

// ---------- talking ----------
function heartsHtml(id) { const h = hearts(id); return `<span class="hearts">${'♥'.repeat(h)}<span class="empty">${'♥'.repeat(8 - h)}</span></span>`; }
function talk(id) {
  const c = D.CAST[id], h = hearts(id);
  const sc = (c.scenes || []).find(s => h >= s.hearts && !S.scenes[id + s.hearts]);
  if (sc) {
    S.scenes[id + sc.hearts] = true; sfx('heart');
    if (sc.schedule) S.pending.push({ day: S.day + 1, pid: sc.schedule.pid, caseId: sc.schedule.caseId });
    const fx = sc.effect || {};
    if (fx.maxE) S.maxE += fx.maxE;
    if (fx.command) adjCommand(fx.command);
    if (fx.unitTrust) D.ROSTER.filter(p => p.unit === fx.unitTrust[0]).forEach(p => adjTrust(p.id, fx.unitTrust[1]));
    show(sc.title, b => {
      sc.lines.forEach(l => para(b, esc(l)));
      if (sc.perk) para(b, `<b>New perk:</b> ${esc(sc.perk)}`, 'note-box');
      opt(b, 'Continue', closeModal);
    }, { look: lookFor(id), sub: `${c.title} · ${sc.hearts} hearts` });
    return;
  }
  const first = !S.talked[id];
  if (first) { S.talked[id] = true; addFriend(id, 15); if (PEOPLE[id]) adjTrust(id, 1); }
  const pool = (c.lines[seasonKey()] || []).concat(c.lines.any);
  const line = pool[(S.day + strHash(id)) % pool.length];
  show(c.title, b => {
    para(b, `“${esc(line)}”`);
    para(b, heartsHtml(id) + (first ? ' Friendship grew.' : ' Already chatted today.'), 'tag');
    if (PEOPLE[id]) para(b, `Trust: ${trustWord(S.people[id].trust)}` + (S.people[id].down ? ` · on a down slip (${esc(S.people[id].down.reason)})` : ''), 'tag');
    const gifted = S.gifted[id];
    if (S.items.coffee) opt(b, 'Give a coffee', () => { S.items.coffee--; S.gifted[id] = true; addFriend(id, 25); toast('They appreciate the coffee.'); talk(id); }, { disabled: gifted, note: gifted ? 'one gift a day' : '' });
    if (S.items.donut) opt(b, 'Give donuts', () => { S.items.donut--; S.gifted[id] = true; addFriend(id, 45); if (PEOPLE[id]) adjTrust(id, 2); toast('Donuts! Instant friendship.'); talk(id); }, { disabled: gifted, note: gifted ? 'one gift a day' : '' });
    opt(b, 'Bye', closeModal);
  }, { look: lookFor(id), sub: c.sub, closable: true });
}

// ---------- journal ----------
function journal(tab = 'today') {
  const tabs = [['today', 'Today'], ['crew', 'Aircrew'], ['friends', 'Friends'], ['skills', 'Skills'], ['glossary', 'Glossary'], ['settings', 'Settings']];
  show('Journal', b => {
    const bar = el('div', { class: 'tabs' }); b.appendChild(bar);
    tabs.forEach(([k, label]) => { const t = el('button', { class: 'tab' + (k === tab ? ' on' : '') }, label); t.onclick = () => journal(k); bar.appendChild(t); });
    const c = el('div', { class: 'tabbody' }); b.appendChild(c);
    if (tab === 'today') {
      para(c, `<b>${dateStr()}</b> · ${clock(S.min)}<br>Readiness ${readiness()}% · Command confidence ${S.command} · Budget ${S.budget} · $${S.wallet}`);
      para(c, objectives().map(o => '• ' + esc(o)).join('<br>'));
      para(c, `Day ${Math.min(S.day, END_DAY)} of ${END_DAY}. The year ends with the readiness inspection on the last day of winter.`, 'tag');
    } else if (tab === 'crew') {
      const rows = D.ROSTER.map(p => {
        const s = S.people[p.id];
        const status = s.down ? `<span class="bad">down: ${esc(s.down.reason)}</span>` : overdue(p.id) ? `<span class="bad">FDME overdue</span>` : 'flying';
        return `<tr><td>${esc(p.rank)} ${esc(p.name)}<br><span class="tag">${esc(p.job)}, ${esc(D.UNITS[p.unit].short)}</span></td><td><span class="bar"><i style="width:${s.trust}%"></i></span> ${trustWord(s.trust)}</td><td>${status}</td></tr>`;
      }).join('');
      c.appendChild(el('table', { class: 'roster', html: `<tr><th>Aircrew</th><th>Trust</th><th>Status</th></tr>${rows}` }));
    } else if (tab === 'friends') {
      para(c, Object.keys(D.CAST).map(id => `<b>${esc(D.CAST[id].title)}</b> ${heartsHtml(id)}<br><span class="tag">${esc(D.CAST[id].sub)}</span>`).join('<br><br>'));
      para(c, 'Talk once a day and give coffee or donuts from the DFAC. New scenes unlock at 2, 4, 6 and 8 hearts.', 'tag');
    } else if (tab === 'skills') {
      para(c, Object.keys(SKILL_NAME).map(k => {
        const l = level(k), next = XP_LEVELS[l];
        return `<b>${SKILL_NAME[k]}</b> level ${l} (${S.xp[k]} XP${next ? `, next at ${next}` : ''})<br><span class="tag">${Object.entries(SKILL_UNLOCK[k]).map(([lv, t]) => (l >= lv ? '✔ ' : `Lv ${lv}: `) + t).join(' · ')}</span>`;
      }).join('<br><br>'));
    } else if (tab === 'glossary') {
      para(c, D.GLOSSARY.map(([t, d]) => `<b>${esc(t)}</b>: ${esc(d)}`).join('<br>'));
    } else if (tab === 'settings') {
      const A = window.FLD_AUDIO;
      if (A) {
        para(c, `<b>Sound:</b> ${A.muted ? 'off' : 'on'} · <b>Music:</b> ${A.musicOn ? 'on' : 'off'} · <b>Volume:</b> ${Math.round(A.volume * 10)}/10. Press M to mute anytime.`);
        opt(c, A.muted ? 'Turn sound on' : 'Turn sound off', () => { A.unlock(); A.setMuted(!A.muted); journal('settings'); });
        opt(c, A.musicOn ? 'Turn music off' : 'Turn music on', () => { A.unlock(); A.setMusic(!A.musicOn); journal('settings'); });
        opt(c, 'Volume up', () => { A.setVolume(Math.min(1, A.volume + .1)); journal('settings'); }, { disabled: A.volume >= .99 });
        opt(c, 'Volume down', () => { A.setVolume(Math.max(0, A.volume - .1)); journal('settings'); }, { disabled: A.volume <= .01 });
      }
      para(c, `Your progress saves each time you sleep.`, 'tag');
      opt(c, 'Start a new game', () => show('Start over?', bb => { para(bb, 'This erases your current save.'); opt(bb, 'Yes, start over', () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} charCreate(); }); opt(bb, 'Cancel', () => journal('settings')); }));
    }
    opt(b, 'Close', closeModal);
  }, { closable: true, noFocus: true });
}

// ---------- objectives ----------
function objectives() {
  const out = [], m = S.min;
  if (!postgame()) {
    if (S.day === END_DAY && !S.ended) out.push('Inspection day! Report to Brigade HQ (0900–1700).');
    if (S.flags.incident && !S.flags.board && S.day >= 39) out.push('The safety board wants to interview you at Brigade HQ.');
    if (S.flags.heatAsk && !S.flags.heatBrief && S.day <= 17) out.push('Give the heat injury prevention brief at Brigade HQ.');
    if (S.day >= 29 && S.day < 37 && !S.flags.crewRestRaised) out.push('Consider raising the Attack crews\' fatigue with COL Park at HQ.');
  }
  if (weekday() && m < 720 && S.queue.length && S.sickClosed !== S.day) out.push(m < 450 ? `Sick call opens 0730 at the Clinic (${S.queue.length} waiting).` : `Sick call is open at the Clinic: ${S.queue.length} waiting.`);
  if (dow() === 4 && S.briefWeek !== week() && m < 1080) out.push('Weekly brief with COL Park at Brigade HQ, 1400–1800.');
  if (fdmeDueList().length && weekday() && S.fdmeDay !== S.day && m < 1020) out.push(`FDMEs due at the Clinic, 1300–1700 (${fdmeDueList().length}).`);
  if (weekday() && S.flewDay !== S.day && m < 1200) out.push('Fly with a crew at Flight Ops, 1300–2000.');
  const e = eventToday(); if (e && m < e.to && !S.events[e.id + S.day]) out.push(`${e.title} at the ${STATION_BY_ID[e.loc].name}, ${clock(e.from)}–${clock(e.to)}.`);
  if (upReadyList().length) out.push(`Up slips ready at the Clinic (${upReadyList().length}).`);
  if (S.energy < 25) out.push('Low energy. Eat at the DFAC or rest.');
  if (m >= 1260) out.push('Getting late. Head to your quarters to sleep.');
  if (!out.length) out.push('Free time: chat with people, eat, train, or study at the Clinic.');
  return out;
}

// ---------- input ----------
const keys = {};
const unlockAudio = () => { if (window.FLD_AUDIO) FLD_AUDIO.unlock(); };
addEventListener('pointerdown', unlockAudio);
addEventListener('keydown', e => {
  unlockAudio();
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
  const k = e.key.toLowerCase();
  if (modalOpen) {
    if (/^[1-9]$/.test(k)) { const b = $('box').querySelector(`button.opt[data-key="${k}"]`); if (b) { e.preventDefault(); b.click(); } }
    if (k === 'escape' && modalOpts.closable) closeModal();
    return;
  }
  if (!S) return;
  keys[k] = true;
  if (k === 'e' || k === ' ' || k === 'enter') { e.preventDefault(); interact(); }
  if (k === 'j' || k === 'tab') { e.preventDefault(); journal(); }
  if (k === 'm' && window.FLD_AUDIO) { FLD_AUDIO.setMuted(!FLD_AUDIO.muted); toast(FLD_AUDIO.muted ? 'Sound off (M to turn it back on).' : 'Sound on.'); }
  if (k.startsWith('arrow')) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
document.querySelectorAll('.pb').forEach(b => {
  const k = b.dataset.k;
  const on = e => { e.preventDefault(); if (!S) return; if (k === 'act') { if (!modalOpen) interact(); } else if (k === 'menu') { if (!modalOpen) journal(); } else keys['pad' + k] = true; };
  const off = e => { e.preventDefault(); keys['pad' + k] = false; };
  b.addEventListener('touchstart', on, { passive: false }); b.addEventListener('touchend', off, { passive: false }); b.addEventListener('touchcancel', off);
  b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
});
$('jbtn').onclick = () => { if (S && !modalOpen) journal(); };

// ---------- movement ----------
const P = { w: 9, h: 6, fx: 1, dir: 'down', moving: false, step: 0 };
function blocked(x, y, w, h, m = S.map) {
  if (x < 0 || y < 0 || x + w > 320 || y + h > 240) return true;
  for (const s of MAPS[m].solids) if (x < s.x + s.w && x + w > s.x && y < s.y + s.h && y + h > s.y) return true;
  return false;
}
const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? 'side' : dy < 0 ? 'up' : 'down';
function move(dt) {
  let dx = 0, dy = 0;
  if (keys.a || keys.arrowleft || keys.padleft) dx -= 1;
  if (keys.d || keys.arrowright || keys.padright) dx += 1;
  if (keys.w || keys.arrowup || keys.padup) dy -= 1;
  if (keys.s || keys.arrowdown || keys.paddown) dy += 1;
  if (dx && dy) { dx *= .7071; dy *= .7071; }
  const sp = 62 * dt, nx = S.pos.x + dx * sp, ny = S.pos.y + dy * sp;
  if (!blocked(nx, S.pos.y, P.w, P.h)) S.pos.x = nx;
  if (!blocked(S.pos.x, ny, P.w, P.h)) S.pos.y = ny;
  P.moving = !!(dx || dy);
  if (dx) P.fx = dx;
  if (P.moving) {
    P.dir = dirOf(dx, dy);
    P.step -= dt;
    if (P.step <= 0) { P.step = .3; sfx('step'); if (S.map === 'outside') dust(S.pos.x + 4.5, S.pos.y + 6); }
  }
  if (S.map !== 'outside') {
    const ex = MAPS[S.map].exit;
    if (S.pos.y + P.h > ex.y && S.pos.x + P.w > ex.x && S.pos.x < ex.x + ex.w) leaveBuilding();
  }
}

// ---------- doors ----------
let fading = false;
function transition(fn) {
  if (fading) { fn(); return; }
  fading = true; const f = $('fade'); f.style.opacity = 1;
  setTimeout(() => { fn(); parts.length = 0; f.style.opacity = 0; setTimeout(() => { fading = false; }, 180); }, 180);
}
function enterBuilding(m) {
  sfx('door');
  transition(() => { const [dx, dw] = ROOMS[m].door; S.map = m; S.pos = { x: dx * T + dw * T / 2 - 4, y: 212 }; P.dir = 'up'; });
}
function leaveBuilding() {
  const from = S.map; sfx('door');
  transition(() => { const s = STATION_BY_ID[from]; S.map = 'outside'; S.pos = { x: s.x * T + 3, y: (s.y + 1) * T + 3 }; P.dir = 'down'; });
}
function wakeUp() { S.map = 'quarters'; S.pos = { x: 70, y: 100 }; P.dir = 'down'; parts.length = 0; }

// ---------- NPCs ----------
const npcs = Object.keys(D.CAST).map(id => ({ id, x: 0, y: 0, tx: 0, ty: 0, wait: 0, mv: false, fx: 1, dir: 'down', zone: null, map: null }));
function zoneFor(id) {
  const e = eventToday();
  if (e && S.min >= e.from && S.min < e.to) return ZONE_OF_STATION[e.loc];
  const sched = D.CAST[id].sched; let z = sched[0][1];
  sched.forEach(([m, zone]) => { if (S.min >= m) z = zone; });
  return z;
}
function randomIn(zk) {
  const z = ZONES[zk], [x, y, w, h] = z.r;
  for (let i = 0; i < 20; i++) { const px = x + random() * (w - 9), py = y + random() * (h - 6); if (!blocked(px, py, 9, 6, z.map)) return [px, py]; }
  return [x, y];
}
function updateNpcs(dt) {
  npcs.forEach(n => {
    const zk = zoneFor(n.id);
    if (n.zone !== zk) { n.zone = zk; n.map = ZONES[zk].map; [n.x, n.y] = randomIn(zk); n.tx = n.x; n.ty = n.y; }
    n.wait -= dt;
    const dx = n.tx - n.x, dy = n.ty - n.y, d = Math.hypot(dx, dy);
    if (d < 1 && n.wait <= 0) { [n.tx, n.ty] = randomIn(zk); n.wait = 2 + random() * 4; }
    n.mv = d >= 1;
    if (n.mv) {
      if (Math.abs(dx) > .3) n.fx = dx;
      n.dir = dirOf(dx, dy);
      const sp = 22 * dt, nx = n.x + dx / d * sp, ny = n.y + dy / d * sp;
      const bump = n.map === S.map && Math.abs(nx - S.pos.x) < 8 && Math.abs(ny - S.pos.y) < 5;
      if (!blocked(nx, ny, 9, 6, n.map) && !bump) { n.x = nx; n.y = ny; } else { n.tx = n.x; n.ty = n.y; }
    } else n.dir = 'down';
  });
}

// ---------- interaction ----------
let near = null;
function findNear() {
  const px = S.pos.x + P.w / 2, py = S.pos.y + P.h / 2;
  let best = null, bd = 14;
  MAPS[S.map].stations.forEach(s => {
    const x = s.x * T, y = s.y * T, w = (s.w || 1) * T, h = (s.h || 1) * T;
    const d = Math.hypot(Math.max(x - px, 0, px - x - w), Math.max(y - py, 0, py - y - h));
    if (d < bd) { bd = d; best = { kind: 's', o: s }; }
  });
  npcs.forEach(n => {
    if (n.map !== S.map) return;
    const d = Math.hypot(px - (n.x + 4.5), py - (n.y + 3)) - 6;
    if (d < bd) { bd = d; best = { kind: 'n', o: n }; }
  });
  return best;
}
const DOORS = { clinic: 1, hq: 1, chapel: 1, quarters: 1 };
function flavor(title, text) { return () => info(title, text); }
const ACT = {
  outside: { clinic: () => enterBuilding('clinic'), hq: () => enterBuilding('hq'), chapel: () => enterBuilding('chapel'), quarters: () => enterBuilding('quarters'), dfac: dfacMenu, gym: gymMenu, ops: opsMenu },
  clinic: {
    front: clinicMenu, board: upgradesMenu, office: studyMenu, coffee: coffeeAction,
    exam: () => { const n = sickNote(); if (n) toast(`Sick call: ${n}.`); else startSickCall(); },
    fdme: () => { const n = fdmeNote(); if (n) toast(`FDMEs: ${n}.`); else startFdmes(); },
    booth: () => info('Hearing booth', has('booth') ? 'The booth hums quietly. Audiograms are back in business.' : 'OUT OF ORDER. The door seal is shot. You can fix it from the upgrade plans on the wall.'),
    vision: () => info('Vision tester', has('vision') ? `The new vision tester: crisp, bright, and it doesn't smell like the eighties.` : 'An ancient vision tester. One of the dials is held on with tape.'),
    lab: () => info('Lab bench', has('lab') ? 'Point-of-care analyzers blink happily at you.' : 'An empty bench and a lonely test-tube rack. A point-of-care lab would go here.'),
  },
  hq: { park: hqMenu, bulletin, maptable: flavor('Map table', 'A map of the training areas, covered in pins and coffee rings.') },
  chapel: { altar: chapelMenu },
  quarters: { bed: quartersMenu, qdesk: () => journal(), keepsakes: keepsakesInfo, wardrobe: flavor('Wardrobe', 'Your uniforms. Pressed. Mostly.') },
};
function interact() {
  if (!near || fading) return;
  if (near.kind === 's') ACT[S.map][near.o.id](); else talk(near.o.id);
}
function keepsakesInfo() {
  const items = [['rivera8', `Rivera's old aviator wings`], ['bell8', 'A mug with your name painted on it'], ['brooks6', 'An honorary Dustoff patch'], ['okafor4', `A thank-you note from Okafor`], ['park8', `COL Park's coin`], ['nguyen8', `A photo of Nguyen's first student flight`]].filter(([k]) => S.scenes[k]);
  info('Shelf of keepsakes', items.length ? items.map(([, t]) => '• ' + esc(t)).join('<br>') : 'An empty shelf. It will fill up as the year goes on.');
}

// ---------- weather and particles ----------
function weather() {
  const h = ART.hash(S.day * 13, 7), s = seasonKey();
  if (s === 'winter') return h < .55 ? 'snow' : 'clear';
  return h < (s === 'spring' ? .3 : s === 'summer' ? .15 : .22) ? 'rain' : 'clear';
}
const parts = [];
function dust(x, y) {
  const col = seasonKey() === 'winter' ? '#ffffff' : '#d9c08a';
  for (let i = 0; i < 2; i++) parts.push({ x: x + (random() - .5) * 6, y, vx: (random() - .5) * 10, vy: -5 - random() * 5, life: .4, col, size: 1 });
}
function updateParticles(dt) {
  if (S.map === 'outside') {
    const w = weather();
    if (w === 'rain') for (let i = 0; i < 4; i++) parts.push({ x: random() * 360 - 10, y: -4, vx: -30, vy: 230, life: 1.3, col: 'rgba(170,200,235,.75)', size: 'rain' });
    if (w === 'snow' && random() < .7) parts.push({ x: random() * 330, y: -2, vx: -6 + random() * 4, vy: 16 + random() * 10, life: 16, col: '#ffffff', size: 1, sway: 1 + random() * 6 });
    if (seasonKey() === 'fall' && w !== 'rain' && random() < .06) parts.push({ x: random() * 320, y: -2, vx: 10 + random() * 10, vy: 14, life: 18, col: rnd(['#d9822b', '#c0392b', '#f2b13a']), size: 2, sway: 1 + random() * 6 });
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i]; p.life -= dt;
    p.x += (p.vx + (p.sway ? Math.sin(p.life * 2 + p.sway) * 8 : 0)) * dt; p.y += p.vy * dt;
    if (p.life <= 0 || p.y > 244) parts.splice(i, 1);
  }
  if (parts.length > 700) parts.splice(0, parts.length - 700);
}
function drawParticles() {
  parts.forEach(p => { ctx.fillStyle = p.col; if (p.size === 'rain') ctx.fillRect(p.x | 0, p.y | 0, 1, 4); else ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size); });
}

// ---------- helicopters ----------
const heliState = world.helis.map(() => ({ phase: 'parked', t: 15 + random() * 40, lift: 0, dx: 0, spin: false }));
function updateHelis(dt) {
  const flying = weekday() && S.min >= 480 && S.min < 1080;
  heliState.forEach(st => {
    st.t -= dt;
    if (st.phase === 'parked') { st.spin = false; if (st.t <= 0) { if (flying) { st.phase = 'spool'; st.t = 2.5; } else st.t = 20; } }
    else if (st.phase === 'spool') { st.spin = true; if (st.t <= 0) { st.phase = 'lift'; st.t = 4; } }
    else if (st.phase === 'lift') { const k = 1 - Math.max(0, st.t) / 4; st.lift = k * k * 100; st.dx = k * k * 70; if (st.t <= 0) { st.phase = 'away'; st.t = 25 + random() * 30; } }
    else if (st.phase === 'away') { if (st.t <= 0) { st.phase = 'land'; st.t = 4; } }
    else if (st.phase === 'land') { const k = Math.max(0, st.t) / 4; st.lift = k * k * 100; st.dx = -k * k * 70; if (st.t <= 0) { st.lift = 0; st.dx = 0; st.phase = 'cool'; st.t = 3; } }
    else if (st.phase === 'cool') { if (st.t <= 0) { st.phase = 'parked'; st.t = 40 + random() * 60; } }
  });
}

// ---------- render ----------
const bgCache = {};
function getBG() {
  const k = S.map === 'outside' ? 'outside-' + seasonKey() : S.map + Object.keys(S.upgrades).sort().join() + '|' + Object.keys(S.scenes).sort().join();
  const hit = bgCache[S.map]; if (hit && hit.k === k) return hit.c;
  const c = document.createElement('canvas'); c.width = 320; c.height = 240;
  const g = c.getContext('2d');
  if (S.map === 'outside') ART.buildBG(g, world, seasonKey()); else ART.buildInterior(g, ROOMS[S.map], { upgrades: S.upgrades, scenes: S.scenes });
  bgCache[S.map] = { k, c }; return c;
}
function draw() {
  const tm = performance.now() / 1000, out = S.map === 'outside', season = seasonKey();
  ctx.drawImage(getBG(), 0, 0);
  const ents = [], late = [];
  if (out) {
    world.stations.forEach(s => ART.station(ctx, s, tm, season));
    world.decor.forEach(d => ents.push({ y: d.y * T + 16, f: () => d.type === 'flag' ? ART.flag(ctx, d, tm) : ART.sock(ctx, d) }));
    world.helis.forEach((h, i) => {
      const st = heliState[i]; if (st.phase === 'away') return;
      (st.lift > 8 ? late : ents).push({ y: h.y * T + 15, f: () => ART.heli(ctx, h, tm, st) });
    });
  }
  npcs.forEach(n => {
    if (!n.zone || n.map !== S.map) return;
    const frame = n.mv ? [0, 1, 0, 2][Math.floor(tm * 7) % 4] : 0, cx = Math.round(n.x + 4.5), bot = Math.round(n.y + 6);
    ents.push({ y: bot, f: () => ART.drawChar(ctx, cx, bot, lookFor(n.id), frame, n.fx < 0, false, n.dir) });
  });
  const frame = P.moving ? [0, 1, 0, 2][Math.floor(tm * 8) % 4] : 0, cx = Math.round(S.pos.x + 4.5), bot = Math.round(S.pos.y + 6);
  ents.push({ y: bot, f: () => ART.drawChar(ctx, cx, bot, lookFor('me'), frame, P.fx < 0, false, P.dir) });
  ents.sort((a, b) => a.y - b.y).forEach(e => e.f());
  late.forEach(e => e.f());
  if (out) drawParticles();
  const blink = Math.floor(tm * 3) % 2 ? '#ffd966' : '#fff3b0';
  if (!out) { const ex = MAPS[S.map].exit; ART.arrow(ctx, ex.x + ex.w / 2, 229 + (Math.floor(tm * 3) % 2), blink); }
  if (near && !modalOpen) {
    if (near.kind === 's') { const s = near.o; ART.corners(ctx, s.x * T, s.y * T, (s.w || 1) * T, (s.h || 1) * T, blink); }
    else ART.arrow(ctx, Math.round(near.o.x + 4.5), Math.round(near.o.y) - 14 + (Math.floor(tm * 3) % 2), blink);
  }
  const t = S.min / 60; let a = 0;
  if (t >= 18 && t < 22) a = (t - 18) / 4 * .5; else if (t >= 22) a = .5;
  if (t < 7) a = (7 - t) * .25;
  if (out && season === 'winter') a += .04;
  if (out && weather() !== 'clear') a += .08;
  if (!out) a *= .45;
  if (a > 0) { ctx.fillStyle = 'rgba(14,18,60,' + a + ')'; ctx.fillRect(0, 0, 320, 240); }
}
let hudTick = 0;
function hud() {
  const pct = Math.min(100, Math.round(S.energy / S.maxE * 100));
  const w = weather(), wIcon = S.map === 'outside' ? (w === 'rain' ? ' · rain' : w === 'snow' ? ' · snow' : '') : '';
  $('hud').innerHTML =
    `<span><b>${dateStr()}</b> ${clock(S.min)}${wIcon}</span>` +
    `<span>EN <span class="bar"><i style="width:${pct}%"></i></span></span>` +
    `<span>READY <b>${readiness()}%</b></span>` +
    `<span>TRUST <b>${trustAvg()}</b></span>` +
    `<span>BUDGET <b>${S.budget}</b></span>` +
    `<span>$<b>${S.wallet}</b></span>`;
  $('obj').innerHTML = objectives().slice(0, 2).map(esc).join('<br>');
}

// ---------- loop ----------
let last = performance.now();
let crashed = false;
function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  try { tick(now, dt); } catch (e) { if (!crashed) { crashed = true; showCrash(e); } }
  requestAnimationFrame(frame);
}
function showCrash(e) {
  console.error(e);
  show('Something went wrong', b => {
    para(b, 'The game hit an error and paused. Your last save is from when you last slept.');
    para(b, esc(e && e.message || e), 'tag');
    opt(b, 'Reload the game', () => location.reload(), { cls: 'hi' });
    opt(b, 'Start a new game (erases the save)', () => { try { localStorage.removeItem(SAVE_KEY); } catch (x) {} location.reload(); });
  });
}
let sceneTick = 0;
function tick(now, dt) {
  if (!S) return;
  if (!modalOpen) {
    if (!fading) move(dt); else P.moving = false;
    updateNpcs(dt); updateHelis(dt);
    S.min += dt * 4;
    if (S.min >= 720) closeSickCall();
    if (!postgame() && !S.flags.incident && ((S.day === 37 && S.min >= 840) || (S.day > 37 && S.day < 43 && S.min >= 600))) runIncident();
    else if (S.min >= 1560) newDay(false);
  }
  updateParticles(dt);
  near = modalOpen || fading ? null : findNear();
  const pr = $('prompt');
  if (near) {
    pr.style.display = 'block';
    pr.textContent = '[E] ' + (near.kind === 'n' ? `Talk to ${D.CAST[near.o.id].title}` : (S.map === 'outside' && DOORS[near.o.id] ? 'Enter: ' : '') + near.o.name);
  } else pr.style.display = 'none';
  draw();
  if (now - hudTick > 150) { hudTick = now; hud(); }
  if (now - sceneTick > 250 && window.FLD_AUDIO) {
    sceneTick = now;
    const spinning = heliState.some(s => s.phase !== 'parked' && s.phase !== 'away');
    const prox = clamp((S.pos.y - 120) / 110, 0, 1);
    FLD_AUDIO.setScene({ area: S.map, night: S.min >= 1200 || S.min < 390, season: seasonKey(), rotor: S.map === 'outside' ? clamp(prox * .5 + (spinning ? .35 : 0), 0, 1) : 0, rain: weather() === 'rain' });
  }
}

// ---------- start ----------
function charCreate() {
  const st = { name: '', pron: 'they', skin: SKINS[1], hair: HAIRS[1] };
  const render = () => show('Report for duty', b => {
    para(b, 'You are the new flight surgeon of the 1st Talon Aviation Brigade.');
    const prev = el('div', { class: 'preview' }); b.appendChild(prev);
    prev.appendChild(ART.portrait(Object.assign({}, FLIGHTSUIT, { skin: st.skin, hair: st.hair, acc: CROSS })));
    const lab = el('label', { class: 'field' }, 'Last name: ');
    const inp = el('input', { type: 'text', maxlength: '14', placeholder: 'Your last name' }); inp.value = st.name;
    inp.oninput = () => { st.name = inp.value; };
    lab.appendChild(inp); b.appendChild(lab);
    const row = (label, list, key, fmt) => {
      const r = el('div', { class: 'swatches' }, el('span', {}, label));
      list.forEach(v => { const s = el('button', { class: 'sw' + (st[key] === v ? ' on' : ''), title: v }); fmt(s, v); s.onclick = () => { st[key] = v; render(); }; r.appendChild(s); });
      b.appendChild(r);
    };
    row('Skin', SKINS, 'skin', (s, v) => s.style.background = v);
    row('Hair', HAIRS, 'hair', (s, v) => s.style.background = v);
    row('Pronouns', ['they', 'she', 'he'], 'pron', (s, v) => { s.textContent = PRON[v].slice(0, 2).join('/'); s.classList.add('txt'); });
    opt(b, 'Report for duty', () => {
      const name = (st.name || '').trim().replace(/[^A-Za-z' -]/g, '').slice(0, 14) || 'Doc';
      S = newState({ name: name.charAt(0).toUpperCase() + name.slice(1), pron: st.pron, skin: st.skin, hair: st.hair });
      save();
      pages('Kestrel Army Airfield', D.STORY.intro, () => newDayIntro());
    }, { cls: 'hi' });
  }, { noFocus: true });
  render();
}
function newDayIntro() {
  S.day = 0; S.min = 1500; newDay(true);
}
function boot() {
  const saved = load();
  if (saved) {
    S = saved;
    show('Flight Line Doc', b => {
      para(b, `Welcome back, ${esc(me())}. ${dateStr()}.`);
      opt(b, 'Continue', closeModal, { cls: 'hi' });
      opt(b, 'New game', () => { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S = null; charCreate(); });
    });
  } else charCreate();
  requestAnimationFrame(frame);
}

// Hooks for automated testing only.
window.FLD_DEBUG = {
  get S() { return S; }, set S(v) { S = v; }, setRandom(fn) { random = fn; },
  newDay, enterBuilding, leaveBuilding, startSickCall, startFdmes, startFlight, weeklyBrief, runIncident, runBoard, runInspection, talk, MENUS, readiness, closeModal,
  heliState, get modalOpen() { return modalOpen; }, get CS() { return CS; }, get FS() { return FS; },
};
boot();
})();
