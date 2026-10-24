// Loads the page, checks the hero starts on its own, then scrolls with a real wheel while it plays.
const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core');
const path = require('path');
const splash = process.argv[2] === 'splash';
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage(); await p.setViewport({ width: 1280, height: 800 });
  p.on('pageerror', (e) => console.log('PAGEERROR', String(e.stack).split('\n').slice(0, 3).join(' | ')));
  const url = 'file:///' + path.join(__dirname, '..', 'index.html').split(path.sep).join('/') + (splash ? '?splash' : '?nosplash');
  await p.goto(url, { waitUntil: 'load' });
  const st = () => p.evaluate(() => ({ mode: document.documentElement.getAttribute('data-hero'), y: Math.round(scrollY), splash: !!(window.SW && SW.splash && SW.splash.active) }));
  await new Promise((r) => setTimeout(r, 700)); console.log('t=0.7s', JSON.stringify(await st()));
  for (let i=0;i<4;i++){ await new Promise((r) => setTimeout(r, 1500)); console.log('idle', JSON.stringify(await st()), await p.evaluate(()=>Math.round(SW.ride.state().total*10)/10)); }
  await p.mouse.move(640, 400); await p.mouse.wheel({ deltaY: 400 });
  await new Promise((r) => setTimeout(r, 900)); console.log('after wheel', JSON.stringify(await st()));
  await p.mouse.wheel({ deltaY: 600 });
  await new Promise((r) => setTimeout(r, 900)); console.log('after 2nd wheel', JSON.stringify(await st()));
  await b.close();
})();
