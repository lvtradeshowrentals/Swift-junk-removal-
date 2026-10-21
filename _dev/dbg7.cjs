const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  console.log(JSON.stringify(await p.evaluate(() => { const r = (id) => { const e = document.getElementById(id), c = getComputedStyle(e), b = e.getBoundingClientRect(); return { x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height), left: c.left, width: c.width, ar: c.aspectRatio, minH: c.minHeight }; }; return { scene: r('finScene'), sky: r('finSky'), truck: r('finTruck'), vw: innerWidth }; })));
  await b.close();
})();
