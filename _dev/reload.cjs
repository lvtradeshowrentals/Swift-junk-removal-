const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  let navs = 0, loads = 0; p.on('framenavigated', () => navs++); p.on('load', () => loads++);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  await p.evaluate(() => {
    window.__c = { resize: 0, road: 0, rebuild: 0, jumps: 0, last: pageYOffset, maxJump: 0 };
    window.addEventListener('resize', () => window.__c.resize++);
    const road = document.getElementById('routeRoad'); if (road) new MutationObserver((m) => { window.__c.road += m.some((x) => x.type === 'childList') ? 1 : 0; }).observe(road, { childList: true });
    window.addEventListener('scroll', () => { const d = Math.abs(pageYOffset - window.__c.last); if (d > 400) { window.__c.jumps++; window.__c.maxJump = Math.max(window.__c.maxJump, d); } window.__c.last = pageYOffset; }, { passive: true });
  });
  const y0 = await p.evaluate(() => document.getElementById('services').getBoundingClientRect().top + pageYOffset - 100);
  const y1 = await p.evaluate(() => document.getElementById('proof').getBoundingClientRect().top + pageYOffset);
  await p.evaluate((y) => window.scrollTo(0, y), y0); await new Promise((r) => setTimeout(r, 400));
  for (let y = y0; y < y1; y += 60) { await p.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 25)); }
  for (let y = y1; y > y0; y -= 90) { await p.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 25)); }
  console.log(size, 'navigations', navs, 'loads', loads, JSON.stringify(await p.evaluate(() => window.__c)));
  await b.close();
})();
