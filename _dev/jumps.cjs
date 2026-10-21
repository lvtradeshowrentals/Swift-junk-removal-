const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2]||1512), height: +(process.argv[3]||950), isMobile: false });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  console.log(JSON.stringify(await p.evaluate(() => {
    const R = window.SW.ride, st = R.state(), pl = st.plan, out = [];
    const fps = 60, N = Math.round(st.total * fps);
    let prev = null;
    for (let i = 0; i <= N; i++) { const p = i / N; R.setP(p); const tv = p * st.total; const cur = [0, 1, 2].map((c) => { const g = document.querySelectorAll('#actors > g')[c]; const m = /translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)/.exec(g.getAttribute('transform')) || []; return { x: +m[1], y: +m[2], s: +m[3], o: +g.getAttribute('opacity') }; });
      if (prev) cur.forEach((a, c) => { const b = prev[c]; if (a.o > .05 && b.o > .05 && (Math.abs(a.x - b.x) > 25 || Math.abs(a.y - b.y) > 14)) out.push({ t: +tv.toFixed(2), c, dx: +(a.x - b.x).toFixed(1), dy: +(a.y - b.y).toFixed(1) }); });
      prev = cur; }
    return out.slice(0, 14);
  })));
  await b.close();
})();
