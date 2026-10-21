const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(size === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { width: 1512, height: 950 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  /* deck CTA on the last card should preselect Yard */
  await p.evaluate(() => { document.querySelector('.dk-card[data-key="yard"] .dk-cta').click(); });
  await new Promise((r) => setTimeout(r, 1800));
  console.log(await p.evaluate(() => ({ checked: Array.from(document.querySelectorAll('input[name=service]:checked')).map((i) => i.value), cap: (document.getElementById('loadCap') || {}).textContent })));
  await p.evaluate(() => document.querySelector('input[name=service][value=garage]').click());
  await new Promise((r) => setTimeout(r, 900));
  const f = await p.$('#quote'); await f.scrollIntoView(); await new Promise((r) => setTimeout(r, 500));
  await p.screenshot({ path: path.join(__dirname, 'shots', 'form-' + size + '.png') });
  await b.close();
})();
