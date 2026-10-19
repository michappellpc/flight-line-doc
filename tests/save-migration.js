// Regression test: a save from an older version (fewer aircrew, missing fields) must load and play.
//   NODE_PATH=$(npm root -g) node tests/save-migration.js
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + path.resolve(__dirname, '..', 'index.html'));
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.fill('#box input', 'Oldsave');
  await page.evaluate(() => [...document.querySelectorAll('#box button.opt')].find(x => /Report/.test(x.textContent)).click());
  await page.evaluate(() => {
    const S = JSON.parse(JSON.stringify(FLD_DEBUG.S));
    const phase1 = ['rivera', 'hale', 'price', 'ruiz', 'dunn', 'mendez', 'nguyen', 'patel', 'sutton', 'ortiz', 'brooks', 'fischer', 'wallace', 'shah'];
    for (const id of Object.keys(S.people)) if (!phase1.includes(id)) delete S.people[id];
    delete S.usedF; delete S.week.flights; S.day = 20; S.queue.push({ pid: 'nobody', caseId: 'gone' });
    localStorage.setItem('fld_save_v1', JSON.stringify(S));
  });
  await page.reload();
  await page.evaluate(() => [...document.querySelectorAll('#box button.opt')].find(x => /Continue/.test(x.textContent)).click());
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.up('ArrowRight');
  await page.evaluate(() => { FLD_DEBUG.MENUS.quarters(); [...document.querySelectorAll('#box button.opt')].find(x => /Go to sleep/.test(x.textContent)).click(); });
  await page.waitForTimeout(300);
  const ok = await page.evaluate(() => Object.keys(FLD_DEBUG.S.people).length === FLD.ROSTER.length && FLD_DEBUG.S.day === 21);
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : ok ? 'Old save migrated and played.' : 'Migration incomplete.');
  await browser.close();
  if (errors.length || !ok) process.exit(1);
})();
