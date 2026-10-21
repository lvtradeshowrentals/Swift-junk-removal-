const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await p.evaluate(() => document.getElementById('crewSvg').scrollIntoView({ block: 'center' }));
  await new Promise((r) => setTimeout(r, 800));
  const times = (process.argv[2] || '1.2,2.6,3.9,4.6,5.3,6.9').split(',').map(Number);
  let i = 0;
  for (const t of times) {
    await p.evaluate((t) => SW.how.frame(t), t);
    await new Promise((r) => setTimeout(r, 100));
    const el = await p.$('#crewSvg'); await el.screenshot({ path: path.join(__dirname, 'shots', 'how' + (i++) + '.png') });
  }
  await b.close();
})();
