/* choreography collision check for the hero: node collide.cjs [width height] */
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2] || 1512), height: +(process.argv[3] || 950) });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const out = await p.evaluate(() => {
    const R = SW.ride, st = R.state(), pl = st.plan, L = SW.layout, PXCM = 1.29;
    const T = Math.max(...pl.segs.map((s) => s.length ? s[s.length - 1].t1 : 0));
    const rows = [], ev = [];
    const WB = 24, DB = 17;     /* body: lateral half width and depth half thickness, in cm */
    for (let t = 0; t <= T; t += 1 / 30) {
      const P = [];
      for (let c = 0; c < 3; c++) {
        const list = pl.segs[c]; const k = list.findIndex((s) => t >= s.t0 && t < s.t1); if (k < 0) continue;
        const s = list[k], u = (t - s.t0) / Math.max(.001, s.t1 - s.t0), e = s.ev(u);
        if (!(e.vis > .04)) continue;
        P.push({ c, k, x: e.x, y: e.y, s: e.s, pair: e.pair, carry: e.carry, yaw: e.o && e.o.yaw });
      }
      /* furniture still on the ground: its footprint is a box (length along x, about 35 cm of depth each side) */
      pl.info.forEach((inf, i) => {
        if (t >= inf.tGrasp) return;
        const it = SW.HERO.pile[i], dim = SW.ITEM_DIM[it.ct || it.t], sP = SW.depth(it.y) * L.ts;
        const cx0 = (SW.HERO.pileX + it.dx - L.cam0) * L.S0, cy0 = L.H - (520 - it.y) * L.S0;
        const rotC = it.carryRot || 0, lenU = (rotC ? dim.h : dim.w) * it.sc, halfX = lenU * sP / 2 / (PXCM * sP), halfDcm = (it.t === 'couch' ? 36 : 30);
        P.forEach((q) => {
          const dxcm = Math.abs(q.x - cx0) / (PXCM * q.s), dycm = Math.abs(q.y - cy0) * 2 / (PXCM * q.s);
          if (dxcm < halfX * (sP / q.s) * 1 + WB * .8 && dycm < halfDcm + DB * .8) ev.push({ t: +t.toFixed(2), kind: 'person-in-' + it.t, who: q.c, dx: Math.round(dxcm), dy: Math.round(dycm) });
        });
      });
      rows.push({ t: +t.toFixed(2), P: P.map((q) => ({ c: q.c, x: Math.round(q.x), y: +q.y.toFixed(1), s: +q.s.toFixed(2), tag: q.pair >= 0 ? 'pair' + q.pair : q.carry || '' })) });
      for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
        const a = P[i], b2 = P[j], sc = (a.s + b2.s) / 2;
        const dxcm = Math.abs(a.x - b2.x) / (PXCM * sc), dycm = Math.abs(a.y - b2.y) * 2 / (PXCM * sc);
        if (dxcm < 2 * WB && dycm < 2 * DB) ev.push({ t: +t.toFixed(2), kind: 'person-person', a: a.c, b: b2.c, dx: Math.round(dxcm), dy: Math.round(dycm), ta: a.pair >= 0 ? 'pair' : a.carry, tb: b2.pair >= 0 ? 'pair' : b2.carry });
      }
      /* carried pair items: a third person standing/walking inside the span between the carriers */
      pl.info.forEach((inf, i) => {
        if (inf.K !== 2) return;
        const car = P.filter((q) => inf.ids.includes(q.c) && q.pair === i);
        if (car.length < 2) return;
        const x0 = Math.min(car[0].x, car[1].x), x1 = Math.max(car[0].x, car[1].x), ym = (car[0].y + car[1].y) / 2, sc = (car[0].s + car[1].s) / 2;
        P.filter((q) => !inf.ids.includes(q.c)).forEach((q) => {
          const dycm = Math.abs(q.y - ym) * 2 / (PXCM * sc);
          if (q.x > x0 - WB * PXCM * sc && q.x < x1 + WB * PXCM * sc && dycm < DB + 24) ev.push({ t: +t.toFixed(2), kind: 'person-through-couch', who: q.c, dy: Math.round(dycm) });
        });
      });
    }
    return { rows, ev, T, info: pl.info.map((i) => ({ ct: i.ct, ids: i.ids, tGrasp: +i.tGrasp.toFixed(2), tLand: +i.tLand.toFixed(2) })) };
  });
  require('fs').writeFileSync(path.join(__dirname, 'collide.json'), JSON.stringify(out));
  console.log('T', out.T.toFixed(2), 'items', JSON.stringify(out.info));
  /* merge events into intervals */
  const groups = {};
  out.ev.forEach((e) => { const k = e.kind + ':' + (e.a != null ? e.a + '-' + e.b : e.who); (groups[k] = groups[k] || []).push(e); });
  Object.entries(groups).forEach(([k, v]) => console.log(k, 't', v[0].t, '..', v[v.length - 1].t, 'n', v.length, 'min dx/dy', Math.min(...v.map((e) => e.dx || 0)), Math.min(...v.map((e) => e.dy)), v[0].ta || '', v[0].tb || ''));
  if (!out.ev.length) console.log('no overlaps');
  await b.close();
})();
