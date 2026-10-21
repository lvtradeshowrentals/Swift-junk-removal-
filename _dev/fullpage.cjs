// Dev-only: full-page flow screenshots in vertical slices. node fullpage.cjs <desktop|phone>
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path'); const fs = require('fs');
const SIZES = { desktop: { width: 1512, height: 950, deviceScaleFactor: 1 }, phone: { width: 390, height: 780, deviceScaleFactor: 1, isMobile: true, hasTouch: true } };
const size = process.argv[2] || 'desktop';
const OUT = path.join(__dirname, 'shots', 'flow'); fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(SIZES[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  await p.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 }); await wait(600);
  const q = await p.evaluate(() => document.getElementById('quote').getBoundingClientRect().top + pageYOffset);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  let n = 0;
  for (let y = q - 120; y < H; y += SIZES[size].height - 60) {
    await p.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), y); await wait(1300);
    await p.screenshot({ path: path.join(OUT, size + '-' + String(n++).padStart(2, '0') + '.png') });
  }
  console.log('slices', n, 'height', H);
  await b.close();
})();
