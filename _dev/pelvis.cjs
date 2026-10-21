const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const res = await p.evaluate(() => {
    const R = SW.ride, st = R.state(), pl = st.plan, out = {};
    const T = Math.max(...pl.segs.map((s) => s.length ? s[s.length - 1].t1 : 0));
    for (let c = 0; c < 3; c++) {
      const rows = []; let prev = null, prev2 = null;
      for (let t = 0; t < T; t += 1 / 60) {
        const list = pl.segs[c]; let k = list.findIndex((s) => t >= s.t0 && t < s.t1); if (k < 0) continue;
        const s = list[k], u = (t - s.t0) / (s.t1 - s.t0), e = s.ev(u); if (!e.o) continue;
        const r = SW.crew.solve(e.o), y = r.inp.pelvis[1];
        let acc = null; if (prev != null && prev2 != null) acc = (y - 2 * prev + prev2) * 3600;
        rows.push({ t: +t.toFixed(3), k, y: +y.toFixed(2), acc: acc == null ? 0 : +acc.toFixed(0), amp: +(e.o.amp || 0).toFixed(2), b: +(e.o.b || 0).toFixed(2) });
        prev2 = prev; prev = y;
      }
      out[c] = rows;
    }
    return out;
  });
  require('fs').writeFileSync(path.join(__dirname, 'pelvis.json'), JSON.stringify(res));
  for (const c of [0, 1, 2]) {
    const rows = res[c]; const ys = rows.map((r) => r.y);
    console.log('crew', c, 'samples', rows.length, 'y range', Math.min(...ys), Math.max(...ys), 'max |acc| cm/s2', Math.max(...rows.map((r) => Math.abs(r.acc))));
    /* biggest accelerations */
    const top = rows.slice().sort((a, b) => Math.abs(b.acc) - Math.abs(a.acc)).slice(0, 6).map((r) => `t${r.t} seg${r.k} y${r.y} acc${r.acc} amp${r.amp} b${r.b}`);
    console.log('  top', top.join(' | '));
  }
  await b.close();
})();
