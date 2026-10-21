const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport(size === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 1, isMobile: true } : { width: 1512, height: 950 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const T = await p.evaluate(() => SW.ride.state().total);
  const fr = [.5, .58, .64, .7, .78, .88];
  let i = 0;
  for (const f of fr) { await p.evaluate((f) => SW.ride.setP(f), f); await new Promise((r) => setTimeout(r, 150)); await p.screenshot({ path: path.join(__dirname, 'shots', 'end' + (i++) + '.png') }); }
  console.log('total', T);
  await b.close();
})();
