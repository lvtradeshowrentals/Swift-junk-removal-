// Dev-only: scrolls the whole ride in steps and reports frame pacing (software rendering, so absolute numbers are pessimistic).
//   node perf.cjs <desktop|phone>
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');

const SIZES = {
  desktop: { width: 1512, height: 950, deviceScaleFactor: 1 },
  phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const size = process.argv[2] || 'desktop';
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash';

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
  await new Promise((r) => setTimeout(r, 800));
  const res = await page.evaluate(() => new Promise((resolve) => {
    const st = window.SW.ride.state();
    const end = document.getElementById('ride').offsetTop + document.getElementById('ride').offsetHeight - window.innerHeight;
    const step = end / 260; let y = 0, last = performance.now(); const d = [];
    document.documentElement.style.scrollBehavior = 'auto';
    function tick(now) {
      d.push(now - last); last = now; y += step; window.scrollTo(0, y);
      if (y < end) requestAnimationFrame(tick); else resolve({ d, end, nodes: document.getElementsByTagName('*').length });
    }
    requestAnimationFrame(tick);
  }));
  const d = res.d.slice(2).sort((a, b) => a - b);
  const avg = d.reduce((s, v) => s + v, 0) / d.length;
  console.log(size, 'frames', d.length, 'avg ms', avg.toFixed(1), 'p50', d[Math.floor(d.length * .5)].toFixed(1), 'p95', d[Math.floor(d.length * .95)].toFixed(1), 'max', d[d.length - 1].toFixed(1), 'DOM nodes', res.nodes);
  await browser.close();
})();
