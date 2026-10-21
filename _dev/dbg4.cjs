const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); const V = { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true }; await p.setViewport(V);
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  await p.evaluate(() => { window.__log = []; const st = window.scrollTo.bind(window); window.scrollTo = function () { window.__log.push('scrollTo ' + JSON.stringify([].slice.call(arguments)) + ' mode=' + window.SW.ride.mode() + ' y=' + pageYOffset + ' ' + new Error().stack.split('\n')[2].trim().slice(0, 70)); return st.apply(null, arguments); }; });
  const y0 = await p.evaluate(() => document.getElementById('services').getBoundingClientRect().top + pageYOffset);
  await p.evaluate((y) => window.scrollTo({ top: y + 300, behavior: 'instant' }), y0);
  await new Promise((r) => setTimeout(r, 400));
  console.log('before', await p.evaluate(() => ({ y: pageYOffset, mode: window.SW.ride.mode() })));
  for (const h of [720, 780, 700]) { await p.setViewport(Object.assign({}, V, { height: h })); await new Promise((r) => setTimeout(r, 400)); console.log(h, await p.evaluate(() => ({ y: pageYOffset, mode: window.SW.ride.mode() }))); }
  console.log(JSON.stringify(await p.evaluate(() => window.__log), null, 1));
  await b.close();
})();
