// Dev-only screenshot helper. Uses puppeteer-core from the sibling world2 project.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT = process.argv[2] || path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash';

const SIZES = {
  desktop: { width: 1512, height: 950, deviceScaleFactor: 1 },
  laptop:  { width: 1280, height: 720, deviceScaleFactor: 1 },
  tablet:  { width: 820, height: 1100, deviceScaleFactor: 1 },
  truck:   { width: 1512, height: 950, deviceScaleFactor: 2 },
  phone:   { width: 390, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

(async () => {
  const which = (process.argv[3] || 'desktop,phone').split(',');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars'],
  });
  for (const name of which) {
    const page = await browser.newPage();
    await page.setViewport(SIZES[name]);
    page.on('pageerror', (e) => console.log(name, 'PAGEERROR:', e.message));
    page.on('console', (m) => { const t = m.text(); if (/error|warn/i.test(t)) console.log(name, 'CON:', t.slice(0, 200)); });
    await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await new Promise(r => setTimeout(r, 900));
    const file = path.join(OUT, `${name}.png`);
    await page.screenshot(name === 'truck' ? { path: file, clip: { x: 90, y: 540, width: 1060, height: 400 } } : { path: file });
    console.log('shot', file);
    await page.close();
  }
  await browser.close();
})();
