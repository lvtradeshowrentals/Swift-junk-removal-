const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2] || 1512), height: +(process.argv[3] || 950) });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const r = await p.evaluate(() => {
    const pl = window.SW.ride.state().plan;
    const pieces = pl.info.map((x, i) => ({ i, ct: x.ct, ids: x.ids.join('+'), grasp: +x.tGrasp.toFixed(1), release: +x.tRelease.toFixed(1), land: +x.tLand.toFixed(1) }));
    const idle = [0, 1, 2].map((c) => { let t = 0, tot = 0; pl.segs[c].forEach((s) => { const d = s.t1 - s.t0; tot += d; const m = s.ev(.5); if (!m.o.amp && !m.carry && m.pair < 0 && !m.o.carry && !m.o.b && s.t0 < pl.T_load) t += d; }); return { crew: c, idleBeforeLoadEnd: +t.toFixed(1), total: +tot.toFixed(1) }; });
    return { T_load: +pl.T_load.toFixed(1), pieces, idle };
  });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
