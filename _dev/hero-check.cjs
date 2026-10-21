const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  const errs = [];
  p.on('pageerror', (e) => errs.push(String(e.stack).split('\n').slice(0, 3).join(' | ')));
  p.on('console', (m) => { if (/error/i.test(m.type())) errs.push('console: ' + m.text().slice(0, 160)); });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  /* determinism: state signature at a position must be identical whether reached forwards or after a long detour */
  const sig = () => p.evaluate(() => {
    const g = (s) => Array.from(document.querySelectorAll(s)).map((e) => e.getAttribute('transform') + '|' + e.getAttribute('visibility') + '|' + e.getAttribute('opacity')).join(';');
    return g('#actors > g') + '##' + g('#trLoad use') + '##' + document.getElementById('trRamp').getAttribute('transform') + '##' + document.getElementById('trNetRect').getAttribute('width');
  });
  const at = async (v) => { await p.evaluate((x) => window.SW.ride.setP(x), v); await new Promise((r) => setTimeout(r, 350)); return sig(); };
  const A1 = await at(.31); await at(.9); await at(.05); await at(.58);
  const A2 = await at(.31);
  console.log('scrub determinism (.31 fwd vs after detour):', A1 === A2 ? 'IDENTICAL' : 'DIFFERENT');
  const B1 = await at(.45); await at(.2); const B2 = await at(.45);
  console.log('scrub determinism (.45):', B1 === B2 ? 'IDENTICAL' : 'DIFFERENT');
  /* frame cost while the crew is on screen */
  const cost = await p.evaluate(async () => {
    const ride = window.SW.ride; let t = 0, n = 0;
    for (let i = 0; i < 120; i++) { const x = .12 + i * .0035; const t0 = performance.now(); ride.setP(x); t += performance.now() - t0; n++; }
    return +(t / n).toFixed(2);
  });
  console.log('avg ms per render (crew visible):', cost);
  console.log('errors:', errs.length ? errs : 'none');
  await b.close();
})();
