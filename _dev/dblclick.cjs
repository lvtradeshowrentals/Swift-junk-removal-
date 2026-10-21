// Dev-only: opens index.html straight from disk (like a double-click, no query string) in a chosen browser and reports what rendered.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');

const which = process.argv[2] || 'edge';
const exe = which === 'edge'
  ? 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  : 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/');

(async () => {
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1512, height: 950 });
  const errs = [];
  page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message));
  page.on('console', (m) => { if (/error|fail/i.test(m.text())) errs.push('CONSOLE ' + m.text().slice(0, 200)); });
  page.on('requestfailed', (r) => errs.push('REQFAIL ' + r.url().slice(-70)));
  await page.goto(PAGE, { waitUntil: 'load', timeout: 60000 });
  await new Promise((r) => setTimeout(r, 6000));
  const info = await page.evaluate(() => ({
    sw: typeof window.SW, ride: !!(window.SW && window.SW.ride), cls: document.documentElement.className,
    truckKids: document.getElementById('truck').children.length, world: document.getElementById('world').children.length,
    ua: navigator.userAgent.slice(0, 90),
  }));
  console.log(which, JSON.stringify(info));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await page.screenshot({ path: path.join(__dirname, 'shots', 'dblclick-' + which + '.png') });
  await browser.close();
})();
