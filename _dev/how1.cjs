const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path'); const fs = require('fs');
const S = { desktop: { width: 1512, height: 950, deviceScaleFactor: 2 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop', step = process.argv[3] || '1';
  const times = JSON.parse(process.argv[4] || '[0.05,0.5,0.9,1.4,2.2,2.8,3.4]');
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 2).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));
  const sel = '.v' + step;
  await p.evaluate((sel) => { document.querySelector(sel).scrollIntoView({ block: 'center', behavior: 'instant' }); }, sel);
  await new Promise((r) => setTimeout(r, 900));
  /* freeze every animation inside the vignette, then step them to fixed times */
  const shots = [];
  for (const t of times) {
    await p.evaluate((sel, t) => { const root = document.querySelector(sel).closest('.step'); root.classList.remove('on'); void root.offsetWidth; root.classList.add('on'); document.querySelector(sel).getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = t * 1000; }); }, sel, t);
    await new Promise((r) => setTimeout(r, 160));
    const bb = await p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x + pageXOffset, y: r.y + pageYOffset, width: r.width, height: r.height }; }, sel);
    const f = path.join(__dirname, 'shots', 'sections', `how${step}-${size}-${shots.length}.png`);
    await p.screenshot({ path: f, clip: bb }); shots.push(f);
  }
  console.log(shots.length, 'shots');
  await b.close();
})();
