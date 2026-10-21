// Dev-only: runs the splash in real time and confirms it finishes by itself.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');

const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?splash';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--hide-scrollbars'],
  });
  const p = await b.newPage();
  await p.setViewport({ width: 1512, height: 950 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto(PAGE, { waitUntil: 'load' });
  const cls = () => p.evaluate(() => document.documentElement.className);
  console.log('t0    ', await cls());
  await wait(2400);
  console.log('t2.4s ', await cls());
  await wait(2600);
  console.log('t5.0s ', await cls());
  console.log('overflow       ', await p.evaluate(() => getComputedStyle(document.documentElement).overflow));
  console.log('splash display ', await p.evaluate(() => getComputedStyle(document.getElementById('splash')).display));
  console.log('ride transform ', await p.evaluate(() => document.getElementById('ride').style.transform || '(none)'));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'rt-final.png') });
  await b.close();
})();
