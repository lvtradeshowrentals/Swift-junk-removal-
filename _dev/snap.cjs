// Dev-only: screenshot a section at a given size, optionally after running page code.
//   node snap.cjs <desktop|wide|laptop|tablet|phone|small> <selector> <name> [--tall] [--eval "js"] [--wait ms] [--scrollY n] [--theme x]
// --tall resizes the viewport to the element's height so the whole section is in one image.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const SIZES = {
  desktop: { width: 1512, height: 950, deviceScaleFactor: 1 },
  wide: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  laptop: { width: 1280, height: 720, deviceScaleFactor: 1 },
  tablet: { width: 820, height: 1100, deviceScaleFactor: 1 },
  phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  small: { width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const a = process.argv.slice(2);
const size = a[0] || 'desktop', sel = a[1] || '#quote', name = a[2] || 'snap';
const opt = (k) => { const i = a.indexOf('--' + k); return i > -1 ? a[i + 1] : null; };
const tall = a.includes('--tall');
const OUT = path.join(__dirname, 'shots', 'sections');
fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file:///' + path.join(__dirname, process.env.ARTIFACT ? 'artifact-test.html' : '../index.html').split(path.sep).join('/') + '?nosplash';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const page = await browser.newPage();
  if (opt('dpr')) SIZES[size].deviceScaleFactor = +opt('dpr');
  await page.setViewport(SIZES[size]);
  page.on('pageerror', (e) => console.log('PAGEERROR:', String(e.stack).split(String.fromCharCode(10)).slice(0, 4).join(' | ')));
  page.on('console', (m) => { const t = m.text(); if (/error|warn|fail/i.test(t)) console.log('CON:', t.slice(0, 240)); });
  if (a.includes('--reduce')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await wait(400);
  if (tall) {
    const h = await page.evaluate((s) => Math.ceil(document.querySelector(s).getBoundingClientRect().height), sel);
    await page.setViewport(Object.assign({}, SIZES[size], { height: Math.min(h + 80, 4000) }));
    await wait(500);
  }
  /* scroll in two hops so reveal observers fire for everything on the way */
  await page.evaluate((s, t) => { const el = document.querySelector(s); window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - (t ? 40 : 64) - 300), behavior: 'instant' }); }, sel, tall);
  await wait(300);
  await page.evaluate((s, t) => { const el = document.querySelector(s); window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - (t ? 40 : 64), behavior: 'instant' }); }, sel, tall);
  if (opt('scrollY')) await page.evaluate((n) => window.scrollBy(0, +n), opt('scrollY'));
  await wait(+(opt('wait') || 1800));
  if (opt('eval')) { const r = await page.evaluate(opt('eval')); if (r !== undefined) console.log('eval ->', JSON.stringify(r)); await wait(+(opt('wait2') || 900)); }
  const f = path.join(OUT, name + '.png');
  if (opt('clip')) {
    const bb = await page.evaluate((c) => { const r = document.querySelector(c).getBoundingClientRect(); return { x: r.x + window.pageXOffset, y: r.y + window.pageYOffset, width: r.width, height: r.height }; }, opt('clip'));
    const pad = +(opt('pad') || 12);
    await page.screenshot({ path: f, clip: { x: Math.max(0, bb.x - pad), y: Math.max(0, bb.y - pad), width: bb.width + pad * 2, height: bb.height + pad * 2 } });
  } else await page.screenshot({ path: f });
  console.log('shot', f);
  const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (ov.sw > ov.cw) console.log('HORIZONTAL OVERFLOW', JSON.stringify(ov));
  await browser.close();
})();
