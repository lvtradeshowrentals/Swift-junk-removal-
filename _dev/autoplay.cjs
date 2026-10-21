const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = require ? req('puppeteer-core') : null;
const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 900));
  const st = () => p.evaluate(() => ({ mode: window.SW.ride.mode(), y: Math.round(pageYOffset), p: +window.SW.ride.state().p.toFixed(2), total: +window.SW.ride.state().total.toFixed(2) }));
  console.log('idle  ', JSON.stringify(await st()));
  await new Promise((r) => setTimeout(r, 1500));
  console.log('idle after 1.5s (must not auto-start)', JSON.stringify(await st()));
  const OUT = path.join(__dirname, 'shots', 'auto'); require('fs').mkdirSync(OUT, { recursive: true });
  const T0 = Date.now();
  if (size === 'desktop') { await p.mouse.move(700, 500); await p.mouse.wheel({ deltaY: 400 }); }
  else { const c = await p.touchscreen; await p.touchscreen.touchStart(200, 600); for (let i = 1; i <= 6; i++) { await p.touchscreen.touchMove(200, 600 - i * 25); } await p.touchscreen.touchEnd(); }
  let k = 0, last = '';
  while (Date.now() - T0 < 9000) {
    await new Promise((r) => setTimeout(r, 450));
    const s = await st();
    if (size === 'desktop') await p.mouse.wheel({ deltaY: 300 });   /* keep scrolling hard while it plays: must stay locked */
    console.log(((Date.now() - T0) / 1000).toFixed(1) + 's', JSON.stringify(s));
    await p.screenshot({ path: path.join(OUT, size + '-' + (k++) + '.png') });
    if (s.mode === 'done') break;
  }
  await new Promise((r) => setTimeout(r, 500));
  await p.mouse.wheel({ deltaY: 900 }); await new Promise((r) => setTimeout(r, 800));
  console.log('after unlock + wheel', JSON.stringify(await st()));
  await b.close();
})();
