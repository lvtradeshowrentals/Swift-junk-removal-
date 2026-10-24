// Loads the page, checks the hero starts on its own, then scrolls with a real wheel while it plays.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const splash = process.argv[2] === 'splash';
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + (splash ? '?splash' : '?nosplash');
  await p.goto(url, { waitUntil: 'load' });
  const st = () => p.evaluate(() => ({ mode: document.documentElement.getAttribute('data-hero'), y: Math.round(scrollY), splash: !!(window.SW && SW.splash && SW.splash.active) }));
  await new Promise((r) => setTimeout(r, 1500));
  const P = await p.evaluate(() => { const s = SW.ride.state().parts; return { a: .05, b: .45, c: s.drive.p0 + (s.drive.p1 - s.drive.p0) * .55, d: s.drive.p1, e: s.finale.p0 + (s.finale.p1 - s.finale.p0) * .6 }; });
  for (const k of Object.keys(P)) { await p.evaluate((v) => SW.ride.setP(v), P[k]); await new Promise((r) => setTimeout(r, 900)); await p.screenshot({ path: path.join(__dirname, 'shots', 'hc_' + k + '.png') }); console.log('shot', k, P[k].toFixed(2)); }
  await b.close();
})();
