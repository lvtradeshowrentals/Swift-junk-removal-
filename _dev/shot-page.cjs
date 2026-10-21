// Dev-only: screenshot any local page.   node shot-page.cjs <file relative to _dev> <out name> [width] [height] [scale]
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const file = process.argv[2] || 'human-test.html';
const name = process.argv[3] || 'page';
const W = +(process.argv[4] || 1500), H = +(process.argv[5] || 640), DPR = +(process.argv[6] || 1);
const OUT = path.join(__dirname, 'shots', 'human');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR });
  page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
  page.on('console', (m) => { if (/error|warn/i.test(m.text())) console.log('CON:', m.text().slice(0, 200)); });
  const [fp, qs] = file.split('?');
  await page.goto('file:///' + path.join(__dirname, fp).split(path.sep).join('/') + (qs ? '?' + qs : ''), { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 800));
  const f = path.join(OUT, name + '.png');
  await page.screenshot({ path: f });
  console.log('shot', f);
  await browser.close();
})();
