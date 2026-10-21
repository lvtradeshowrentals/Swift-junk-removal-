const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 500));
  const times = JSON.parse(process.argv[2] || '[1.2,2.2,3.0,3.9,4.5,5.6]');
  let n = 0;
  for (const t of times) {
    await p.evaluate((t) => { const el = document.getElementById('crewSvg'); el.scrollIntoView({ block: 'center' }); window.SW.how.frame(t); }, t);
    await new Promise((r) => setTimeout(r, n === 0 ? 1600 : 300));
    const bb = await p.evaluate(() => { const r = document.getElementById('crewSvg').getBoundingClientRect(); return { x: r.x + pageXOffset, y: r.y + pageYOffset, width: r.width, height: r.height }; });
    await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'how3-' + (n++) + '.png'), clip: bb });
  }
  await b.close();
})();
