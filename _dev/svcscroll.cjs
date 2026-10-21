const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, laptop: { width: 1280, height: 720 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));
  const info = await p.evaluate(() => { const t = document.getElementById('svcTrack'); return { top: t.getBoundingClientRect().top + pageYOffset, h: t.offsetHeight, vh: innerHeight, pinned: t.classList.contains('is-pinned') }; });
  console.log(JSON.stringify(info));
  const fr = (process.argv[3] || '0,.25,.5,.75,1,.5,0').split(',').map(Number);
  let n = 0;
  for (const f of fr) {
    const y = info.top - 88 + f * (info.h - info.vh) * 0.8 + (f === 0 ? 0 : 0);
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await new Promise((r) => setTimeout(r, 1700));
    const st = await p.evaluate(() => Array.from(document.querySelectorAll('.svc')).map((r) => r.classList.contains('on') ? 1 : 0).join(''));
    console.log('f', f, 'open', st);
    await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'svcs-' + size + '-' + (n++) + '.png') });
  }
  await b.close();
})();
