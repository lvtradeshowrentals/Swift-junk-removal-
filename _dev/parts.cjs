const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2]||1512), height: +(process.argv[3]||950), isMobile: false });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  console.log(JSON.stringify(await p.evaluate(() => { const s = window.SW.ride.state(); const pl = s.plan; return { total: s.total, parts: Object.values(s.parts).map((x) => [x.n, +x.len.toFixed(2)]), T_load: pl.T_load, T_secure: pl.T_secure, lands: pl.info.map((x) => [x.ct, +x.tGrasp.toFixed(2), +x.tLand.toFixed(2)]) }; })));
  await b.close();
})();
