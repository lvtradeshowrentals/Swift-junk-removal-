const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, laptop: { width: 1280, height: 720 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, small: { width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  for (const size of ['desktop', 'laptop', 'phone', 'small']) {
    const p = await b.newPage(); await p.setViewport(S[size]);
    await p.goto('file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash', { waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 500));
    const info = await p.evaluate(() => { const t = document.getElementById('svcTrack'); return { top: t.getBoundingClientRect().top + pageYOffset, h: t.offsetHeight, vh: innerHeight, pinned: t.classList.contains('is-pinned') }; });
    const res = [];
    for (let i = 0; i < 5; i++) {
      const y = info.pinned ? info.top - 88 + (i / 4) * (info.h - info.vh) * 0.8 + (i ? 4 : 0) : info.top;
      await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await new Promise((r) => setTimeout(r, 2600));
      const r = await p.evaluate(() => {
        const fr = document.getElementById('svcStage').getBoundingClientRect();
        const L = Array.from(document.querySelectorAll('#svcPins .pin-label')).map((e) => ({ t: e.textContent, r: e.getBoundingClientRect() }));
        const bad = [];
        L.forEach((a, i) => { if (a.r.left < fr.left || a.r.right > fr.right || a.r.top < fr.top) bad.push('clip:' + a.t); L.slice(i + 1).forEach((c) => { if (a.r.left < c.r.right && a.r.right > c.r.left && a.r.top < c.r.bottom && a.r.bottom > c.r.top) bad.push(a.t + '/' + c.t); }); });
        return { n: L.length, bad };
      });
      res.push(r.n + (r.bad.length ? ' BAD ' + r.bad.join(',') : ' ok'));
      if (size === 'phone' && i === 3) await p.screenshot({ path: path.join(__dirname, 'shots', 'sections', 'pins-phone.png') });
    }
    console.log(size, res.join(' | '));
    await p.close();
  }
  await b.close();
})();
