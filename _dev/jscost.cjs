// Dev-only: times the JS cost of render() alone (no painting) across the ride.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash';
(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1512, height: 950, deviceScaleFactor: 1 });
  await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  const r = await page.evaluate(() => {
    const out = [];
    const t0 = performance.now();
    for (let i = 0; i < 400; i++) { const t = performance.now(); window.SW.ride.setP(i / 399); out.push(performance.now() - t); }
    out.sort((a, b) => a - b);
    return { total: performance.now() - t0, avg: out.reduce((s, v) => s + v, 0) / out.length, p95: out[Math.floor(out.length * .95)], max: out[out.length - 1] };
  });
  console.log('render JS ms  avg', r.avg.toFixed(2), 'p95', r.p95.toFixed(2), 'max', r.max.toFixed(2));
  await browser.close();
})();
