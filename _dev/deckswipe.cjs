const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'phone';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).slice(0, 150)));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  await p.evaluate(() => { const d = document.getElementById('deck'); window.scrollTo({ top: d.getBoundingClientRect().top + pageYOffset - 90, behavior: 'instant' }); });
  await new Promise((r) => setTimeout(r, 1400));
  const st = () => p.evaluate(() => ({ on: Array.from(document.querySelectorAll('.dk-card')).findIndex((c) => c.classList.contains('on')), pageY: Math.round(pageYOffset), sl: Math.round(document.getElementById('dkTrack').scrollLeft) }));
  console.log('start', JSON.stringify(await st()));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'dk-' + size + '-0.png') });
  /* mid swipe: half a card */
  await p.evaluate(() => { const t = document.getElementById('dkTrack'); t.style.scrollSnapType = 'none'; t.scrollLeft = t.querySelector('.dk-card').offsetWidth * .5; });
  await new Promise((r) => setTimeout(r, 400));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'dk-' + size + '-1.png') });
  await p.evaluate(() => { const t = document.getElementById('dkTrack'); t.style.scrollSnapType = ''; });
  for (const i of [1, 2, 4]) { await p.click('#dkNext'); await new Promise((r) => setTimeout(r, 900)); }
  console.log('after next x3', JSON.stringify(await st()));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'dk-' + size + '-2.png') });
  await p.evaluate(() => document.querySelectorAll('#dkDots button')[4].click()); await new Promise((r) => setTimeout(r, 900));
  console.log('dot 5', JSON.stringify(await st()));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'dk-' + size + '-3.png') });
  await b.close();
})();
