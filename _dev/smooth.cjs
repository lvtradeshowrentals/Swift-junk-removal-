const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const size = process.argv[2] || 'desktop';
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport(S[size]);
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const r = await p.evaluate(() => {
    const R = window.SW.ride, st = R.state(), total = st.total, fps = 60, N = Math.round(total * fps);
    const fg = document.getElementById('fgstack'), rig = document.getElementById('truck');
    const parse = (t) => { const m = /translate3d\(([-\d.]+)px, ?([-\d.]+)px, ?0px\) scale\(([-\d.]+)\)/.exec(t) || []; return [+m[1] || 0, +m[3] || 1]; };
    const rows = [];
    for (let i = 0; i <= N; i++) { R.setP(i / N); const [tx, z] = parse(fg.style.transform); const rm = /translate3d\(([-\d.]+)px, ?([-\d.]+)px/.exec(rig.style.transform) || []; const cr = Array.from(document.querySelectorAll('#actors > g')).map((g) => { const m = /translate\(([-\d.]+) ([-\d.]+)\)/.exec(g.getAttribute('transform')) || []; return [+m[1], +m[2], +g.getAttribute('opacity')]; }); rows.push({ t: i / fps, tx, z, ry: +rm[2] || 0, cr }); }
    const d = (a) => a.slice(1).map((v, i) => v - a[i]);
    const camX = rows.map((r) => r.tx * 1), zoom = rows.map((r) => r.z * 1000);
    const vel = d(camX), acc = d(vel), zv = d(zoom), za = d(zv);
    const jerkMax = (a) => Math.max.apply(null, a.map(Math.abs));
    const ry = rows.map((r) => r.ry), rv = d(ry), ra = d(rv);
    /* crew peak speed in px/frame and the implied leg cadence */
    const peaks = [0, 1, 2].map((c) => { let mx = 0; for (let i = 1; i < rows.length; i++) { const a = rows[i].cr[c], b = rows[i - 1].cr[c]; if (!a || !b || a[2] < .5 || b[2] < .5) continue; const dx = Math.abs(a[0] - b[0]); if (dx > mx) mx = dx; } return +(mx * fps).toFixed(0); });
    return { total: +total.toFixed(2), camPanPeakPxPerFrame: +jerkMax(vel).toFixed(2), camPanAccelPeak: +jerkMax(acc).toFixed(3), zoomPeakPer1000: +jerkMax(zv).toFixed(2), zoomAccelPeak: +jerkMax(za).toFixed(3), truckBouncePeakPx: +Math.max.apply(null, ry.map(Math.abs)).toFixed(2), truckBounceAccelPeak: +jerkMax(ra).toFixed(3), crewPeakPxPerSec: peaks, pxPerCm: +(1.29 * st.L.ts).toFixed(2) };
  });
  console.log(size, JSON.stringify(r));
  await b.close();
})();
