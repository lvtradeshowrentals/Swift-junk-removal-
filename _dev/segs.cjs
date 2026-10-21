const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2]||1512), height: +(process.argv[3]||950) });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  console.log(JSON.stringify(await p.evaluate(() => window.SW.ride.state().plan.segs.map((l) => l.map((s) => [+s.t0.toFixed(2), +(s.t1 - s.t0).toFixed(2), s.hoist ? 'H' : ''].join(':')).join(' '))), null, 1));
  await b.close();
})();
