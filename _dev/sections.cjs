// Dev-only: screenshots the static sections below the ride.  node sections.cjs <desktop|phone>
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SIZES = {
  desktop: { width: 1512, height: 950, deviceScaleFactor: 1 },
  phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const size = process.argv[2] || 'desktop';
const OUT = path.join(__dirname, 'shots', 'sections');
fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash';
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
  await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await wait(500);
  const ids = process.argv[3] ? process.argv[3].split(',') : ['quote', 'services', 'how', 'areas', 'faq'];
  for (const id of ids) {
    await page.evaluate((i) => {
      const el = document.getElementById(i);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 64, behavior: 'instant' });
    }, id);
    await wait(1800);
    const f = path.join(OUT, size + '-' + id + '.png');
    await page.screenshot({ path: f });
    console.log('shot', path.basename(f));
  }
  /* overflow check */
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  console.log('horizontal overflow:', ov.sw > ov.cw ? 'YES ' + JSON.stringify(ov) : 'none');
  await browser.close();
})();
