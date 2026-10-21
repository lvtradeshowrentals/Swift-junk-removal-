// Dev-only: loads the site over the local preview server (node serve.cjs --no-open must be running).
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');

(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new' });
  const pg = await b.newPage();
  await pg.setViewport({ width: 1512, height: 950 });
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('http://localhost:8765/?splash', { waitUntil: 'load' });
  await new Promise((r) => setTimeout(r, 6500));
  const info = await pg.evaluate(() => ({ cls: document.documentElement.className, truckParts: document.getElementById('truck').children.length }));
  console.log(JSON.stringify(info), errs.length ? errs : 'no errors');
  await b.close();
})();
