const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2]||1512), height: +(process.argv[3]||950) });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  console.log(JSON.stringify(await p.evaluate(() => {
    const R = window.SW.ride, st = R.state(), pl = st.plan, N = Math.round(st.total * 60), out = [];
    const center = (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.width, r.height]; };
    const vis = (e) => e && e.getAttribute('visibility') !== 'hidden' && getComputedStyle(e).visibility !== 'hidden';
    pl.info.forEach((inf, i) => {
      let prev = null; const jumps = [];
      for (let f = 0; f <= N; f++) {
        R.setP(f / N);
        const cand = [];
        const pile = document.getElementById('pile-' + i); if (pile && vis(pile)) cand.push(['pile', center(pile.firstElementChild || pile)]);
        const pair = document.querySelector('#actors > use'); if (pair && vis(pair) && pair.getAttribute('href') === '#it-' + inf.ct) cand.push(['pair', center(pair)]);
        document.querySelectorAll('#actors > g use').forEach((u) => { if (vis(u) && u.getAttribute('href') === '#it-' + inf.ct) cand.push(['hand', center(u)]); });
        document.querySelectorAll('#trFly use').forEach((u) => { if (vis(u) && u.getAttribute('href') === '#it-' + inf.ct) cand.push(['fly', center(u)]); });
        const slot = document.getElementById('tl-' + i); if (slot && vis(slot)) cand.push(['slot', center(slot)]);
        const cur = cand.length ? cand[0] : null;
        if (prev && cur) { const dx = cur[1][0] - prev[1][0], dy = cur[1][1] - prev[1][1], d = Math.hypot(dx, dy); if (d > 9) jumps.push({ t: +(f / 60 * 1).toFixed(2), from: prev[0], to: cur[0], dx: Math.round(dx), dy: Math.round(dy), n: cand.length }); }
        if (!cur && prev) jumps.push({ t: +(f / 60).toFixed(2), gap: prev[0] + '->none' });
        prev = cur || prev;
      }
      out.push({ item: inf.ct, jumps: jumps.slice(0, 12) });
    });
    return out;
  }), null, 1));
  await b.close();
})();
