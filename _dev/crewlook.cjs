const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const times = [1.9, 2.1, 2.3, 2.5, 2.7, 2.9];
  const info = await p.evaluate(() => { const st = SW.ride.state(); return { total: st.total }; });
  let i = 0;
  for (const t of times) {
    await p.evaluate((t) => { const st = SW.ride.state(); SW.ride.setP(t / st.total); }, t);
    await new Promise((r) => setTimeout(r, 120));
    const box = await p.evaluate(() => { const g = Array.from(document.querySelectorAll('#actors > g')).filter((e) => +e.getAttribute('opacity') > .1).map((e) => e.getBoundingClientRect()); if (!g.length) return null; const x0 = Math.min(...g.map((r) => r.left)), x1 = Math.max(...g.map((r) => r.right)), y0 = Math.min(...g.map((r) => r.top)), y1 = Math.max(...g.map((r) => r.bottom)); return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; });
    if (box) await p.screenshot({ path: path.join(__dirname, 'shots', 'crewlook' + (i++) + '.png'), clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 20), width: Math.min(700, box.w + 60), height: Math.min(420, box.h + 40) } });
  }
  console.log('total', info.total, 'shots', i);
  await b.close();
})();
