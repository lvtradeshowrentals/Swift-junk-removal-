// Dev-only: scrubs the splash to fixed moments so the frames are deterministic.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'shots', 'splash');
fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?splash&hold';
const phone = process.argv[2] === 'phone';
const size = phone
  ? { width: 390, height: 800, deviceScaleFactor: 1, isMobile: true, hasTouch: true }
  : { width: 1512, height: 950, deviceScaleFactor: 1 };
const times = (process.argv[3] || '300,800,1300,1800,2150,2500,2900,3350').split(',').map(Number);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport(size);
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  page.on('console', (m) => { const t = m.text(); if (/error|warn/i.test(t)) console.log('CON', t.slice(0, 200)); });
  await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  for (const t of times) {
    await page.evaluate((ms) => window.__splashSeek(ms), t);
    await new Promise((r) => setTimeout(r, 150));
    const f = path.join(OUT, (phone ? 'phone' : 'desktop') + '-' + String(t).padStart(4, '0') + '.png');
    await page.screenshot({ path: f });
    console.log('shot', f);
  }
  await browser.close();
})();
