/* choreography collision check for the How it works loop */
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const out = await p.evaluate(() => {
    const PC = 1.29 * .58, WB = 24, DB = 17, rows = [], ev = [];
    const svg = document.getElementById('crewSvg');
    const kids = () => Array.from(svg.children).filter((e) => e.tagName === 'g' && e.getAttribute('transform') && /scale\(/.test(e.getAttribute('transform')) && e.getAttribute('opacity') !== null && !e.id && !e.classList.length).slice(0, 3);
    const CYC = 9.6;
    let maxT = 10;
    for (let t = 0; t <= maxT; t += 1 / 30) {
      SW.how.frame(t);
      const P = [];
      kids().forEach((g, i) => { const m = /translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+)\)/.exec(g.getAttribute('transform')); const o = +g.getAttribute('opacity'); if (m && o > .3) P.push({ c: i, x: +m[1], y: +m[2], s: +m[3] }); });
      const pair = svg.querySelector('use[href="#it-couch"][visibility="visible"]:not(.bi)');
      let pb = null; if (pair) { const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(pair.getAttribute('transform')); pb = { x: +m[1], y: +m[2] }; }
      rows.push({ t: +t.toFixed(2), P: P.map((q) => ({ c: q.c, x: Math.round(q.x), y: Math.round(q.y) })), couch: pb && { x: Math.round(pb.x), y: Math.round(pb.y) } });
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const dxcm = Math.abs(P[i].x - P[j].x) / PC, dycm = Math.abs(P[i].y - P[j].y) * 2 / PC;
        if (dxcm < 2 * WB && dycm < 2 * DB) ev.push({ t: +t.toFixed(2), kind: 'person-person', a: P[i].c, b: P[j].c, dx: Math.round(dxcm), dy: Math.round(dycm) });
      }
      if (pb) { const carriers = [0, 1]; const c0 = P.find((q) => q.c === 0), c1 = P.find((q) => q.c === 1); if (c0 && c1) { const x0 = Math.min(c0.x, c1.x), x1 = Math.max(c0.x, c1.x); P.filter((q) => q.c === 2).forEach((q) => { const dy = Math.abs(q.y - (c0.y + c1.y) / 2) * 2 / PC; if (q.x > x0 - WB * PC && q.x < x1 + WB * PC && dy < DB + 24) ev.push({ t: +t.toFixed(2), kind: 'person-through-couch', who: 2, dy: Math.round(dy) }); }); } }
    }
    return { rows, ev };
  });
  require('fs').writeFileSync(path.join(__dirname, 'collide-how.json'), JSON.stringify(out));
  const groups = {};
  out.ev.forEach((e) => { const k = e.kind + ':' + (e.a != null ? e.a + '-' + e.b : e.who); (groups[k] = groups[k] || []).push(e); });
  Object.entries(groups).forEach(([k, v]) => console.log(k, 't', v[0].t, '..', v[v.length - 1].t, 'n', v.length, 'min', Math.min(...v.map((e) => e.dx || 0)), Math.min(...v.map((e) => e.dy))));
  if (!out.ev.length) console.log('no overlaps');
  await b.close();
})();
