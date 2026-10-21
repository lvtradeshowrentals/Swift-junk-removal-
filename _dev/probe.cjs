// Dev-only: loads the page without the splash, jumps the ride to given positions, screenshots each.
//   node probe.cjs <desktop|laptop|tablet|phone> <p1,p2,...> [outDir]
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SIZES = {
  desktop: { width: 1512, height: 950, deviceScaleFactor: 1 },
  wide:    { width: 1920, height: 1080, deviceScaleFactor: 1 },
  laptop:  { width: 1280, height: 720, deviceScaleFactor: 1 },
  tablet:  { width: 820, height: 1100, deviceScaleFactor: 1 },
  small:   { width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  phone:   { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const size = process.argv[2] || 'desktop';
const ps = (process.argv[3] || '0,.2,.5').split(',').map(Number);
const OUT = process.argv[4] || path.join(__dirname, 'shots', 'ride');
fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file:///' + path.join(__dirname, process.env.ARTIFACT ? 'artifact-test.html' : '../index.html').split(path.sep).join('/') + '?nosplash';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport(SIZES[size]);
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
  page.on('console', (m) => { const t = m.text(); if (/error|warn|fail/i.test(t)) console.log('CON:', t.slice(0, 240)); });
  page.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) console.log('REQFAIL:', r.url().slice(-60)); });
  const t0 = Date.now();
  await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  console.log('loaded in', Date.now() - t0, 'ms');
  console.log('SW boot ms', await page.evaluate(() => window.SW.bootMs));
  await wait(600);
  for (const p of ps) {
    await page.evaluate((v) => window.SW.ride.setP(v), p);
    await wait(900);
    const f = path.join(OUT, size + '-' + String(Math.round(p * 1000)).padStart(4, '0') + '.png');
    await page.screenshot({ path: f });
    console.log('shot', path.basename(f));
  }
  const info = await page.evaluate(() => { const s = window.SW.ride.state(); return { total: s.total, parts: Object.values(s.parts).map((p) => [p.n, +p.p0.toFixed(3), +p.p1.toFixed(3)]), T_load: s.plan && +s.plan.T_load.toFixed(1) }; });
  console.log(JSON.stringify(info));
  await browser.close();
})();
