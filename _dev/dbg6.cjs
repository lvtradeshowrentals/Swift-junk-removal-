const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const top = await p.evaluate(() => document.getElementById('finTrack').getBoundingClientRect().top + pageYOffset);
  for (const off of [-300, -100, 0, 100, 300, 600, 900]) {
    await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top + off - 218);
    await new Promise((r) => setTimeout(r, 300));
    console.log(off, JSON.stringify(await p.evaluate(() => { const s = document.getElementById('finScene').getBoundingClientRect(), t = document.getElementById('finTrack').getBoundingClientRect(); return { sceneTop: Math.round(s.top), trackTop: Math.round(t.top), trackBottom: Math.round(t.bottom), h: Math.round(s.height) }; })));
  }
  await b.close();
})();
