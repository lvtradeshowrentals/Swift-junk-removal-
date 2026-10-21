const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 800));
  console.log(JSON.stringify(await p.evaluate(() => { const r = (id) => { const e = document.querySelector(id); const c = getComputedStyle(e), b = e.getBoundingClientRect(); return { cols: c.gridTemplateColumns, disp: c.display, pos: c.position, w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x), order: c.order, js: c.justifySelf }; }; return { show: r('#showroom'), list: r('#svcList'), stage: r('#svcStage') }; }), null, 1));
  await b.close();
})();
