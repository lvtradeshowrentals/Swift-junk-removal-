const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const top = await p.evaluate(() => document.getElementById('finScene').getBoundingClientRect().top + pageYOffset);
  const vh = S[size].height;
  const P = () => p.evaluate(() => +getComputedStyle(document.getElementById('finScene')).getPropertyValue('--p'));
  /* scroll to just BEFORE the trigger: must not have started */
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - vh * .70);
  await new Promise((r) => setTimeout(r, 600)); console.log('before trigger (scene at 70% down):', await P());
  /* then cross the trigger */
  await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top - vh * .60);
  const log = [], T = Date.now(); let n = 0;
  while (Date.now() - T < 5200) { await new Promise((r) => setTimeout(r, 500)); log.push(+(Date.now() - T) / 1000 + ':' + (await P()).toFixed(2)); if (n++ % 3 === 1) await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'fin2-' + size + '-' + (n >> 2) + '.png') }); }
  console.log('after trigger', log.join(' '));
  const h = await p.evaluate(() => ({ docH: document.documentElement.scrollHeight, finTrackH: document.getElementById('finTrack').offsetHeight, sceneH: document.getElementById('finScene').offsetHeight }));
  console.log('layout', JSON.stringify(h));
  await b.close();
})();
