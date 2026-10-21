// Dev-only: real wheel scrolling, a mid-ride window resize, and reduced-motion mode.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, 'shots', 'interact');
fs.mkdirSync(OUT, { recursive: true });
const PAGE = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + '?nosplash';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const exe = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: exe, headless: 'new', args: ['--hide-scrollbars'] });

  /* 1. wheel scrolling: eased, settles, and reports sensible state */
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1512, height: 950 });
    page.on('pageerror', (e) => console.log('PAGEERROR:', e.message));
    await page.goto(PAGE, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await wait(500);
    await page.mouse.move(700, 500);
    for (let i = 0; i < 30; i++) { await page.mouse.wheel({ deltaY: 120 }); await wait(30); }
    await wait(1500);
    const st = await page.evaluate(() => { const s = window.SW.ride.state(); return { p: +s.p.toFixed(3), y: window.pageYOffset }; });
    console.log('after 30 wheel ticks -> p', st.p, 'scrollY', st.y);
    await page.screenshot({ path: path.join(OUT, 'wheel.png') });

    /* 2. resize mid-ride to a phone width: layers rebuild and the ride keeps its place */
    await page.setViewport({ width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await wait(1800);
    const st2 = await page.evaluate(() => { const s = window.SW.ride.state(); return { p: +s.p.toFixed(3), W: s.L.W, k: s.L.k }; });
    console.log('after resize -> p', st2.p, 'W', st2.W, 'k', st2.k);
    await page.screenshot({ path: path.join(OUT, 'resized-phone.png') });
    await page.close();
  }

  /* 3. reduced motion: still hero, no scroll track, no splash */
  {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.setViewport({ width: 1512, height: 950 });
    page.on('pageerror', (e) => console.log('RM PAGEERROR:', e.message));
    await page.goto(PAGE.replace('?nosplash', ''), { waitUntil: 'networkidle2', timeout: 60000 });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await wait(600);
    const info = await page.evaluate(() => ({ cls: document.documentElement.className, trackH: document.getElementById('ride').offsetHeight, vh: innerHeight, splash: getComputedStyle(document.getElementById('splash')).display }));
    console.log('reduced motion:', JSON.stringify(info));
    await page.screenshot({ path: path.join(OUT, 'reduced.png') });
    await page.close();
  }
  await browser.close();
})();
