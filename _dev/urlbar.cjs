const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); const V = { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true }; await p.setViewport(V);
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  await p.evaluate(() => { window.__seg = document.querySelector('#world .seg'); window.__road = document.getElementById('routeRoad').firstElementChild; window.__rs = 0; window.addEventListener('resize', () => window.__rs++); });
  for (const id of ['services', 'how']) {
    const y0 = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + pageYOffset, id);
    await p.evaluate((y) => window.scrollTo(0, y + 300), y0);
    for (const h of [720, 780, 700, 780, 740, 780, 660, 780]) { await p.setViewport(Object.assign({}, V, { height: h })); await new Promise((r) => setTimeout(r, 330)); }
    const r = await p.evaluate((id) => ({ id, resizes: window.__rs, segReplaced: window.__seg !== document.querySelector('#world .seg'), roadRebuilt: window.__road !== document.getElementById('routeRoad').firstElementChild, scrollY: Math.round(pageYOffset) }), id);
    console.log(JSON.stringify(r), 'y0', Math.round(y0));
  }
  await b.close();
})();
