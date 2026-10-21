const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  console.log(JSON.stringify(await p.evaluate(() => { const out = []; let e = document.getElementById('finScene'); const sc = getComputedStyle(e); out.push(['scene', sc.position, sc.top]); while ((e = e.parentElement)) { const c = getComputedStyle(e); out.push([e.tagName + (e.id ? '#' + e.id : '') + '.' + (e.className || '').toString().slice(0, 24), c.overflowX + '/' + c.overflowY, c.display, c.contain, c.position]); } return out; })));
  await b.close();
})();
