const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const size = process.argv[3] || 'desktop';
  const p = await b.newPage(); await p.setViewport(size === 'phone' ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true } : { width: 1512, height: 950 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const T = await p.evaluate(() => SW.ride.state().total);
  const times = (process.argv[2] || '0.4,1.0,1.6,2.2,2.8,3.4').split(',').map(Number);
  let i = 0;
  for (const t of times) {
    await p.evaluate((t) => { const st = SW.ride.state(); SW.ride.setP(t / st.total); }, t);
    await new Promise((r) => setTimeout(r, 160));
    await p.screenshot({ path: path.join(__dirname, 'shots', 'hl' + (i++) + '.png') });
  }
  console.log('total', T.toFixed(2));
  await b.close();
})();
