const { createRequire } = require('module');
const req = createRequire('C:/Users/Cleo/Desktop/world2/');
const puppeteer = req('puppeteer-core'); const path = require('path');
const S = { desktop: { width: 1512, height: 950 }, tablet: { width: 820, height: 1100 }, phone: { width: 390, height: 780, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, small: { width: 360, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true } };
const URL = 'file:///' + path.join(__dirname, '..', process.env.ARTIFACT ? '_dev/artifact-test.html' : 'index.html').split(path.sep).join('/') + '?nosplash';
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] });
  for (const size of Object.keys(S)) {
    const p = await b.newPage(); await p.setViewport(S[size]);
    const errs = []; p.on('pageerror', (e) => errs.push(String(e.message).slice(0, 120))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    await p.goto(URL, { waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 800));
    const r = await p.evaluate(() => {
      const ids = new Set(Array.from(document.querySelectorAll('[id]')).map((e) => e.id));
      const links = Array.from(document.querySelectorAll('a[href]')).map((a) => a.getAttribute('href'));
      const bad = links.filter((h) => h.startsWith('#') && h.length > 1 && !ids.has(h.slice(1)));
      const tel = [...new Set(links.filter((h) => h.startsWith('tel:')))], mail = [...new Set(links.filter((h) => h.startsWith('mailto:')))];
      const txt = document.body.innerText;
      const stray = (txt.match(/placeholder|000-0000|example\.com|lorem|customer name/gi) || []);
      const emptyAlt = Array.from(document.querySelectorAll('img:not([alt])')).length;
      const unlabeled = Array.from(document.querySelectorAll('button,a')).filter((e) => !(e.textContent.trim() || e.getAttribute('aria-label'))).map((e) => e.outerHTML.slice(0, 60));
      return { bad, tel, mail, stray, emptyAlt, unlabeled, ov: document.documentElement.scrollWidth - document.documentElement.clientWidth, title: document.title, h1: document.querySelectorAll('h1').length };
    });
    console.log(size, JSON.stringify(r), errs.length ? 'ERR ' + errs.join(' | ') : 'no errors');
    await p.close();
  }
  /* form: success and failure, network mocked */
  for (const mode of ['ok', 'fail']) {
    const p = await b.newPage(); await p.setViewport(S.desktop);
    await p.setRequestInterception(true);
    let hit = null;
    p.on('request', (rq) => { if (/formsubmit\.co/.test(rq.url())) { hit = { url: rq.url(), method: rq.method() }; if (mode === 'ok') rq.respond({ status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '{"success":"true","message":"ok"}' }); else rq.respond({ status: 500, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: '{"success":"false"}' }); } else rq.continue(); });
    await p.goto(URL, { waitUntil: 'networkidle2' }); await new Promise((r) => setTimeout(r, 600));
    await p.evaluate(async () => { const w = (ms) => new Promise((r) => setTimeout(r, ms)); const set = (id, v) => { const e = document.getElementById(id); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); };
      document.getElementById('quote').scrollIntoView(); await w(500);
      document.querySelector('input[value=garage]').click(); document.getElementById('woNext').click(); await w(700);
      set('f-zip', '89052'); document.getElementById('woNext').click(); await w(700);
      set('f-name', 'Test Person'); set('f-phone', '7025550123'); document.getElementById('woNext').click(); });
    await new Promise((r) => setTimeout(r, 1500));
    console.log('form', mode, JSON.stringify(await p.evaluate(() => ({ sent: document.getElementById('formCard').classList.contains('sent'), failVisible: !document.getElementById('sendFail').hidden, btnDisabled: document.getElementById('woNext').disabled }))), 'request', JSON.stringify(hit));
    await p.close();
  }
  await b.close();
})();
