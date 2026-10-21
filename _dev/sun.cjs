const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new' });
  const p = await b.newPage(); await p.setViewport({ width: +(process.argv[2]||1512), height: +(process.argv[3]||950) });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  const r = await p.evaluate(() => {
    const R = window.SW.ride, st = R.state(), N = Math.round(st.total * 60), y = [], x = [];
    const d = document.getElementById('sunDisc');
    for (let i = 0; i <= N; i++) { R.setP(i / N); y.push(+d.getAttribute('cy')); x.push(+d.getAttribute('cx')); }
    const dv = (a) => a.slice(1).map((v, i) => v - a[i]);
    const vy = dv(y), ay = dv(vy);
    // count velocity "stalls": frames where speed falls below 25% of the running average then recovers (stop-start)
    const sp = vy.map(Math.abs), avg = sp.reduce((a, b) => a + b, 0) / sp.length;
    let stalls = 0, low = false; sp.forEach((s, i) => { if (i > 5 && i < sp.length - 5) { const isLow = s < avg * .35; if (low && !isLow) stalls++; low = isLow; } });
    return { frames: N, yStart: y[0], yEnd: y[y.length - 1], maxSpeed: +Math.max.apply(null, sp).toFixed(2), avgSpeed: +avg.toFixed(2), maxAccel: +Math.max.apply(null, ay.map(Math.abs)).toFixed(3), stalls, speedTrace: sp.filter((_, i) => i % 24 === 0).map((v) => +v.toFixed(2)) };
  });
  console.log(JSON.stringify(r));
  await b.close();
})();
