const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const parts = ['#actors > g', '#trLoad use', '#trRamp', '#trNetRect'];
  const sig = (v) => p.evaluate(async (x, parts) => { window.SW.ride.setP(x); await new Promise((r) => setTimeout(r, 300)); return parts.map((s) => Array.from(document.querySelectorAll(s)).map((e) => ['transform', 'visibility', 'opacity', 'width'].map((a) => e.getAttribute(a)).join('|')).join(';')); }, v, parts);
  for (const v of [0.2, 0.31, 0.4]) {
    const A = await sig(v); await sig(0.9); await sig(0.05); const B = await sig(v);
    console.log(v, A.map((a, i) => (a === B[i] ? 'same' : 'DIFF[' + parts[i] + ']')).join(' '));
    if (A.some((a, i) => a !== B[i])) { const i = A.findIndex((a, k) => a !== B[k]); const x = A[i].split(';'), y = B[i].split(';'); x.forEach((q, k) => { if (q !== y[k]) console.log('  ', k, q, '<>', y[k]); }); }
  }
  await b.close();
})();
