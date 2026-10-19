// Automated playthrough: plays a full in-game year through the real UI with random choices
// and fails on any page error. Needs Playwright with Chromium.
//   NODE_PATH=$(npm root -g) node tests/playthrough.js [days] [screenshot-dir]
const path = require('path');
const { chromium } = require('playwright');

const DAYS = +(process.argv[2] || 60);
const SHOTS = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null;
const SMART = process.argv.includes('smart');

(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 1100, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const shot = async name => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

  // Helpers that run inside the page.
  await page.addScriptTag({ content: `
    window.T = {
      buttons() { return [...document.querySelectorAll('#box button.opt:not(:disabled), #box button.sw')]; },
      open() { return FLD_DEBUG.modalOpen; },
      click(re) { const b = T.buttons().find(x => re.test(x.textContent)); if (b) { b.click(); return true; } return false; },
      // Click through whatever is open, choosing randomly but avoiding exits until nothing else is left.
      // Smart mode: play like a careful flight surgeon (ask key questions, pick correct answers).
      smart() {
        const C = FLD_DEBUG.CS, F = FLD_DEBUG.FS, box = document.getElementById('box').textContent;
        if (C && /Sick call/.test(box) && !/Case review/.test(box)) {
          const c = C.cs;
          if (C.phase === 'work') {
            const keyQ = [...c.history.filter(h => h.key).map(h => h.q), ...c.exam.filter(h => h.key).map(h => h.q), ...c.tests.filter(h => h.key).map(h => FLD.TESTS[h.id].name)];
            for (const q of keyQ) { const b = T.buttons().find(x => x.classList.contains('small') && x.querySelector('.lbl').textContent === q); if (b) { b.click(); return true; } }
            return T.click(/Make a diagnosis/);
          }
          if (C.phase === 'dx') { const b = T.buttons().find(x => x.querySelector('.lbl') && x.querySelector('.lbl').textContent === c.dx[0]); if (b) { b.click(); return true; } }
          if (C.phase === 'dispo') { const b = T.buttons().find(x => x.querySelector('.lbl') && x.querySelector('.lbl').textContent === FLD.DISPO[c.dispo].label); if (b) { b.click(); return true; } }
        }
        if (F && /Flight Duty Medical Exam/.test(box) && F.batch[F.i]) {
          const f = F.batch[F.i].f;
          if (f && f.key && !F.checks.includes(f.key)) { const b = T.buttons().find(x => x.querySelector('.lbl') && x.querySelector('.lbl').textContent === FLD.FDME_CHECKS[f.key].name); if (b) { b.click(); return true; } }
          const want = f ? f.correct : 'fly';
          return T.click({ fly: /Qualified: up slip/, down: /Short down slip/, waiver: /waiver request/ }[want]);
        }
        const good = T.buttons().find(x => x.querySelector('.lbl') && (/^(Hand Wallace|Ask Ruiz|Talk with Nguyen|Wait for the rotor|Spinal motion|Treat as a concussion|Back-to-back|Enforce crew rest)/.test(x.querySelector('.lbl').textContent)));
        if (good) { good.click(); return true; }
        return false;
      },
      drain(max = 400) {
        const avoid = /Back to the workup|Take a break|^\\d?Leave|Bye|Not yet|Cancel|new game|Start over|Go to sleep|Close/i;
        for (let i = 0; i < max && T.open(); i++) {
          if (window.SMART && T.smart()) continue;
          const all = T.buttons().filter(b => b.classList.contains('opt'));
          if (!all.length) { FLD_DEBUG.closeModal(); break; }
          const good = all.filter(b => !avoid.test(b.textContent));
          const work = good.filter(b => b.classList.contains('small'));
          const go = good.find(b => /Make a diagnosis/.test(b.textContent));
          let pick;
          if (go && (!work.length || Math.random() < .35)) pick = go;
          else if (good.length) pick = good[Math.floor(Math.random() * good.length)];
          else pick = all.find(b => /Leave|Bye|Close|Not yet|Back/.test(b.textContent)) || all[0];
          pick.click();
        }
        return T.open();
      },
      at(min) { FLD_DEBUG.S.min = Math.max(FLD_DEBUG.S.min, min); },
      menu(id) { FLD_DEBUG.MENUS[id](); },
    };` });

  if (SMART) await page.evaluate(() => { window.SMART = true; });
  // Character creation and intro
  await page.fill('#box input', 'Testdoc');
  await page.evaluate(() => { T.click(/^she/); });
  await page.evaluate(() => { T.click(/Report for duty/); });
  for (let i = 0; i < 10; i++) await page.evaluate(() => T.click(/Next|Continue/));
  await shot('01-morning-report');
  await page.evaluate(() => T.click(/Start the day/));
  await page.waitForTimeout(300);
  await shot('02-map');

  let sawCase = false, sawFdme = false, sawFlight = false;
  for (let d = 0; d < DAYS; d++) {
    const info = await page.evaluate(() => ({ day: FLD_DEBUG.S.day, dow: (FLD_DEBUG.S.day - 1) % 7 }));
    await page.evaluate(() => T.drain());
    const weekday = info.dow < 5;
    if (weekday) {
      await page.evaluate(() => { T.at(460); T.menu('clinic'); T.click(/Sick call/); });
      if (!sawCase && await page.evaluate(() => T.open())) { await shot('03-sick-call'); sawCase = true; }
      await page.evaluate(() => T.drain());
      await page.evaluate(() => { T.at(790); T.menu('clinic'); T.click(/FDMEs/); });
      if (!sawFdme && await page.evaluate(() => T.open() && /FDME/.test(document.getElementById('box').textContent))) { await shot('04-fdme'); sawFdme = true; }
      await page.evaluate(() => T.drain());
      await page.evaluate(() => { T.at(800); T.menu('ops'); T.click(/Fly with a crew/); });
      if (!sawFlight && await page.evaluate(() => T.open())) { await shot('05-flight'); sawFlight = true; }
      await page.evaluate(() => T.drain());
      if (info.dow === 4) await page.evaluate(() => { T.at(900); T.menu('hq'); T.click(/Weekly brief/); T.drain(); });
    }
    // Story beats, events and side activities
    await page.evaluate(() => {
      T.at(840);
      for (const id of ['hq', 'gym', 'dfac', 'ops', 'chapel', 'clinic']) { T.menu(id); T.click(/Join:/); T.drain(); }
      T.menu('hq'); T.click(/heat injury|crew rest|investigation board|inspection/); T.drain();
      T.menu('clinic'); T.click(/Sign up slips/); for (let i = 0; i < 10; i++) T.click(/Sign for/); FLD_DEBUG.closeModal();
      T.menu('clinic'); T.click(/Clinic upgrades/); T.click(/\\(\\d+\\)/); FLD_DEBUG.closeModal();
      T.menu('dfac'); T.click(/Coffee to go/); FLD_DEBUG.closeModal();
      for (const id of Object.keys(FLD.CAST)) { FLD_DEBUG.talk(id); T.click(/Give a coffee/); T.drain(); }
    });
    await page.waitForTimeout(40); // let the game loop run (story triggers)
    await page.evaluate(() => T.drain());
    if (d === 10) { await page.evaluate(() => { FLD_DEBUG.closeModal(); document.getElementById('jbtn').click(); T.click; }); await page.evaluate(() => [...document.querySelectorAll('.tab')].find(t => t.textContent === 'Aircrew').click()); await shot('06-journal'); await page.evaluate(() => FLD_DEBUG.closeModal()); }
    await page.evaluate(() => { T.at(1290); T.menu('quarters'); T.click(/Go to sleep/); });
    if (info.day === 56) await shot('07-ending');
    await page.evaluate(() => T.drain());
  }
  await page.waitForTimeout(100);
  const summary = await page.evaluate(() => {
    const S = FLD_DEBUG.S;
    return { day: S.day, grade: S.grade, ended: S.ended, readiness: FLD_DEBUG.readiness(), command: S.command, budget: S.budget,
      upgrades: Object.keys(S.upgrades), total: S.total, flags: S.flags, xp: S.xp, hours: S.hours, friends: S.friends };
  });
  console.log(JSON.stringify(summary, null, 1));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'No page errors.');
  await browser.close();
  if (errors.length || !summary.ended) process.exit(1);
})();
