const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport(S[size]);
  const errs = []; p.on('pageerror', (e) => errs.push(String(e.stack).split('\n').slice(0, 2).join(' | '))); p.on('console', (m) => { if (/error|warn/i.test(m.type())) errs.push(m.text().slice(0, 140)); });
  const cdp = await p.createCDPSession(); await cdp.send('Performance.enable');
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  const m = async () => { const r = await cdp.send('Performance.getMetrics'); const o = {}; r.metrics.forEach((x) => { o[x.name] = x.value; }); return { heapMB: +(o.JSHeapUsedSize / 1048576).toFixed(1), nodes: o.Nodes, listeners: o.JSEventListeners, layoutMs: +(o.LayoutDuration * 1000).toFixed(0), styleMs: +(o.RecalcStyleDuration * 1000).toFixed(0), scriptMs: +(o.ScriptDuration * 1000).toFixed(0) }; };
  const secs = ['services', 'how'];
  console.log('start', JSON.stringify(await m()));
  for (const id of secs) {
    const y0 = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + pageYOffset - 100, id);
    const y1 = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().bottom + pageYOffset, id);
    const t0 = await m(); const T = Date.now();
    for (let rep = 0; rep < 2; rep++) {
      for (let y = y0; y < y1; y += 45) { await p.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 16)); }
      for (let y = y1; y > y0; y -= 45) { await p.evaluate((y) => window.scrollTo(0, y), y); await new Promise((r) => setTimeout(r, 16)); }
    }
    const t1 = await m(); const dt = (Date.now() - T) / 1000;
    console.log(id, 'sec', dt.toFixed(1), 'heap', t0.heapMB, '->', t1.heapMB, 'nodes', t0.nodes, '->', t1.nodes, 'script ms/s', ((t1.scriptMs - t0.scriptMs) / dt).toFixed(0), 'style ms/s', ((t1.styleMs - t0.styleMs) / dt).toFixed(0), 'layout ms/s', ((t1.layoutMs - t0.layoutMs) / dt).toFixed(0));
  }
  console.log('errors', errs.length ? errs : 'none');
  await b.close();
})();
