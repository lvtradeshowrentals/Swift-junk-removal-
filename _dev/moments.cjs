const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path'); const fs = require('fs');
const OUT = path.join(__dirname, 'shots', 'moments'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  const p = await b.newPage(); await p.setViewport({ width: 1512, height: 950, deviceScaleFactor: 2 });
  await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
  await new Promise((r) => setTimeout(r, 600));
  const moments = JSON.parse(process.argv[2]);   // [[name, kind, idx, frac]]
  for (const [name, kind, idx, frac] of moments) {
    await p.evaluate((kind, idx, frac) => {
      const s = window.SW.ride.state(), pl = s.plan, lo = s.parts.load;
      let tv;
      if (kind === 'fly') { const x = pl.info[idx]; tv = x.tRelease + (x.tLand - x.tRelease) * frac; }
      else if (kind === 'hoist') { const x = pl.info[idx]; tv = x.hoist.t0 + (x.hoist.t1 - x.hoist.t0) * frac; }
      else if (kind === 'secure') tv = pl.T_load + frac * pl.T_secure;
      else tv = frac * pl.T_load;
      const pp = tv <= pl.T_load ? lo.p0 + tv / pl.T_load * (lo.p1 - lo.p0) : s.parts.secure.p0 + (tv - pl.T_load) / pl.T_secure * (s.parts.secure.p1 - s.parts.secure.p0);
      window.SW.ride.setP(pp);
    }, kind, idx, frac);
    await new Promise((r) => setTimeout(r, 900));
    const sy = await p.evaluate(() => window.pageYOffset);
    await p.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: 150, y: sy + 480, width: 1100, height: 460 } });
    console.log('shot', name);
  }
  await b.close();
})();
