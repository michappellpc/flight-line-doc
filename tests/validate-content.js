// Checks every data file for schema mistakes. Run: node tests/validate-content.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const files = [...html.matchAll(/<script src="(js\/data\/[^"]+)"/g)].map(m => m[1]);
const ctx = {}; ctx.window = ctx; vm.createContext(ctx);
files.forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }));
const D = ctx.window.FLD;
const errs = [], ids = new Set();
const err = (where, msg) => errs.push(`${where}: ${msg}`);
const DISPOS = ['fly', 'down', 'waiver', 'evac'], ROLES = ['pilot', 'crew', 'medic'], SEASONS = ['spring', 'summer', 'fall', 'winter'];

D.CASES.forEach((c, i) => {
  const w = `case ${c.id || '#' + i}`;
  if (!c.id || ids.has(c.id)) err(w, 'missing or duplicate id'); ids.add(c.id);
  ['title', 'complaint', 'vitals', 'tx', 'teach', 'source'].forEach(k => { if (typeof c[k] !== 'string' || !c[k].trim()) err(w, `missing ${k}`); });
  if (![1, 2, 3].includes(c.tier)) err(w, 'tier must be 1, 2 or 3');
  if (c.seasons !== 'all' && !(Array.isArray(c.seasons) && c.seasons.length && c.seasons.every(s => SEASONS.includes(s)))) err(w, 'bad seasons');
  if (!Array.isArray(c.roles) || !c.roles.length || !c.roles.every(r => ROLES.includes(r))) err(w, 'bad roles');
  if (!Array.isArray(c.history) || c.history.length < 3 || c.history.length > 5) err(w, 'history needs 3-5 items');
  if (!Array.isArray(c.exam) || c.exam.length < 2 || c.exam.length > 4) err(w, 'exam needs 2-4 items');
  [...(c.history || []), ...(c.exam || [])].forEach(h => { if (!h.q || !h.a) err(w, 'history/exam item missing q or a'); });
  (c.exam || []).forEach(h => { if (h.low) err(w, 'exam items cannot have low answers'); });
  if (!Array.isArray(c.tests)) err(w, 'tests must be an array');
  (c.tests || []).forEach(t => { if (!D.TESTS[t.id]) err(w, `unknown test ${t.id}`); if (!t.a) err(w, 'test missing a'); });
  if (!Array.isArray(c.dx) || c.dx.length !== 4 || new Set(c.dx).size !== 4) err(w, 'dx needs 4 distinct options');
  if (!DISPOS.includes(c.dispo)) err(w, 'bad dispo');
  (c.ok || []).forEach(o => { if (!DISPOS.includes(o) || o === c.dispo) err(w, 'bad ok entry'); });
  if (c.dispo !== 'fly' && !(c.days > 0)) err(w, 'needs days > 0 when not fly');
  const keys = [...(c.history || []), ...(c.exam || []), ...(c.tests || [])].filter(h => h.key).length;
  if (keys < 2) err(w, 'needs at least 2 key items');
  if (!('reviewed' in c)) err(w, 'missing reviewed field');
});
const fids = new Set();
D.FDME.forEach((f, i) => {
  const w = `fdme ${f.id || '#' + i}`;
  if (!f.id || fids.has(f.id)) err(w, 'missing or duplicate id'); fids.add(f.id);
  ['title', 'q', 'teach', 'source'].forEach(k => { if (!f[k]) err(w, `missing ${k}`); });
  if (f.key !== null && !D.FDME_CHECKS[f.key]) err(w, 'bad key');
  if (f.key && !f.checks[f.key]) err(w, 'key check has no result');
  Object.keys(f.checks || {}).forEach(k => { if (!D.FDME_CHECKS[k]) err(w, `unknown check ${k}`); });
  if (!['fly', 'down', 'waiver'].includes(f.correct)) err(w, 'bad correct');
  if (f.needs && f.needs !== (D.FDME_CHECKS[f.key] || {}).needs) err(w, 'needs must match the key check');
  if (!('reviewed' in f)) err(w, 'missing reviewed field');
});
const roster = new Set(D.ROSTER.map(p => p.id));
D.FLIGHTS.forEach((f, i) => {
  const w = `flight ${f.id || '#' + i}`;
  if (!D.UNITS[f.unit]) err(w, 'bad unit');
  f.crew.forEach(id => { if (!roster.has(id)) err(w, `crew ${id} not on roster`); else if (D.ROSTER.find(p => p.id === id).unit !== f.unit) err(w, `crew ${id} not in ${f.unit}`); });
  f.lines.forEach(([who]) => { if (who !== 'narr' && !roster.has(who) && !D.CAST[who]) err(w, `unknown speaker ${who}`); });
  (f.choice ? f.choice.options : []).forEach(o => {
    if (o.schedule && (!roster.has(o.schedule.pid) || !ids.has(o.schedule.caseId))) err(w, 'bad schedule');
    Object.keys(o.trust || {}).forEach(id => { if (!roster.has(id)) err(w, `trust target ${id} not on roster`); });
  });
  if (!f.teach) err(w, 'missing teach');
});
Object.entries(D.CAST).forEach(([id, c]) => (c.scenes || []).forEach(s => {
  if (s.schedule && (!roster.has(s.schedule.pid) || !ids.has(s.schedule.caseId))) err(`scene ${id} ${s.hearts}`, 'bad schedule');
}));
// Every role should have cases for every season at tier 1.
for (const role of ROLES) for (const s of SEASONS) {
  if (!D.CASES.some(c => c.tier === 1 && c.roles.includes(role) && (c.seasons === 'all' || c.seasons.includes(s)))) err('coverage', `no tier-1 case for ${role} in ${s}`);
}
const count = k => D.CASES.filter(c => c.dispo === k).length;
console.log(`${D.CASES.length} cases (fly ${count('fly')}, down ${count('down')}, waiver ${count('waiver')}, evac ${count('evac')}) · ${D.FDME.length} FDME findings · ${D.FLIGHTS.length} flights · files: ${files.join(', ')}`);
if (errs.length) { console.log('PROBLEMS:\n' + errs.join('\n')); process.exit(1); }
console.log('Content OK.');
