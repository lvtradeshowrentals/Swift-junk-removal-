const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
const S = { small: { width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, desktop: { width: 1512, height: 950 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop'; const fr = JSON.parse(process.argv[3] || '[0,.25,.5,.75,1]');
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const info = await p.evaluate(() => { const t = document.getElementById('finTrack'), sc = document.getElementById('finScene'); return { top: t.getBoundingClientRect().top + pageYOffset, h: t.offsetHeight, sh: sc.offsetHeight, vh: innerHeight, stick: parseFloat(getComputedStyle(sc).top) }; });
  console.log(JSON.stringify(info));
  let n = 0;
  for (const f of fr) {
    const y = info.top - info.stick - .22 * info.vh + f * (info.h - info.sh + .22 * info.vh);
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await new Promise((r) => setTimeout(r, 700));
    const pv = await p.evaluate(() => +getComputedStyle(document.getElementById('finScene')).getPropertyValue('--p'));
    console.log('f', f, 'p', pv);
    await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'fin-' + size + '-' + (n++) + '.png') });
  }
  await b.close();
})();
