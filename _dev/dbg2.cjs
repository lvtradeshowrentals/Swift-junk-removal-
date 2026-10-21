const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 780, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  console.log(JSON.stringify(await p.evaluate(() => { const t = document.getElementById('svcTrack'); const s = document.getElementById('services'); const c = getComputedStyle(t); return { th: t.offsetHeight, ts: t.style.height, disp: c.display, sTop: s.getBoundingClientRect().top + pageYOffset, sh: s.offsetHeight, docH: document.documentElement.scrollHeight, tTop: t.getBoundingClientRect().top + pageYOffset }; })));
  await b.close();
})();
