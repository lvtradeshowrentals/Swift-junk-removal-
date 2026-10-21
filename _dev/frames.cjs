const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const run = async (label, css, id) => {
    const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
    await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
    if (css) await p.addStyleTag({ content: css });
    await new Promise((r) => setTimeout(r, 600));
    const y0 = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + pageYOffset, id);
    const r = await p.evaluate(async (y0) => {
      window.scrollTo(0, y0); await new Promise((r) => setTimeout(r, 400));
      const d = []; let last = performance.now(), y = y0, n = 0;
      await new Promise((res) => { const step = (t) => { d.push(t - last); last = t; y += 14; window.scrollTo(0, y); if (++n < 90) requestAnimationFrame(step); else res(); }; requestAnimationFrame(step); });
      d.shift(); d.sort((a, b) => a - b); const avg = d.reduce((a, b) => a + b, 0) / d.length;
      return { avg: +avg.toFixed(1), p95: +d[Math.floor(d.length * .95)].toFixed(1), max: +d[d.length - 1].toFixed(1) };
    }, y0);
    console.log(label, JSON.stringify(r)); await p.close();
  };
  await run('how: as built       ', '', 'how');
  await run('how: no filter/mask ', '#routeRoad *{filter:none!important;mask:none!important} #routeRoad{filter:none!important}', 'how');
  await run('services: as built  ', '', 'services');
  await b.close();
})();
