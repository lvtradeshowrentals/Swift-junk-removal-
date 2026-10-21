const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 700));
  await p.click('.nav-links a[href="#services"]');
  await new Promise((r) => setTimeout(r, 2500));
  console.log(JSON.stringify(await p.evaluate(() => ({ mode: window.SW.ride.mode(), y: Math.round(pageYOffset), servTop: Math.round(document.getElementById('services').getBoundingClientRect().top) }))));
  await b.close();
})();
