const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 4).join(' | ')));
  p.on('console', (m) => { const t = m.text(); if (/error|warn|fail/i.test(t)) console.log('CON', t.slice(0, 200)); });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  const r = await p.evaluate(() => {
    const g = (id) => document.getElementById(id);
    const cs = (id) => { const e = g(id); if (!e) return null; const c = getComputedStyle(e); return { op: c.opacity, vis: c.visibility, disp: c.display, tr: c.transform.slice(0, 60), w: e.clientWidth, h: e.clientHeight }; };
    return { sky: cs('sky-dawn'), world: cs('world'), truck: cs('truck'), fg: cs('fgstack'), bg: cs('bgstack'), mtn: cs('lyMtn'), segs: document.querySelectorAll('#world .seg').length, y: pageYOffset, rideH: g('ride').offsetHeight, cls: document.documentElement.className };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
