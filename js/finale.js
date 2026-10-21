/* ============================================================================
   The finale: the Strip at night, a road, and the truck driving off as you reach
   the bottom of the page. The skyline is the same set of landmarks the ride uses.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$, f = SW.f, clamp = SW.clamp;

  function sky() {
    const LV = SW.LV, glow = SW.LVhelp.glow, r = SW.mk(61);
    const c = 800, K = .84, SX = .9, BY = 334;
    let s = `<defs>
      <linearGradient id="fnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b16"/><stop offset=".45" stop-color="#0d1530"/><stop offset=".78" stop-color="#2b2a55"/><stop offset="1" stop-color="#6a3f5e"/></linearGradient>
      <linearGradient id="fnRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121630"/><stop offset="1" stop-color="#080b17"/></linearGradient>
      <linearGradient id="fnFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b16" stop-opacity="0"/><stop offset="1" stop-color="#05080f"/></linearGradient>
    </defs>`;
    s += `<rect width="1600" height="420" fill="url(#fnSky)"/>`;
    for (let i = 0; i < 70; i++) s += `<circle cx="${f(r() * 1600)}" cy="${f(r() * 230)}" r="${f(.5 + r() * 1)}" fill="#fff" opacity="${f(.2 + r() * .5)}"/>`;
    /* distant ridge */
    s += `<path d="M0 318 L140 286 L260 310 L420 262 L560 306 L700 280 L880 312 L1040 270 L1200 308 L1360 276 L1500 304 L1600 288 V340 H0Z" fill="#171c3c"/>`;
    const add = (fn, x, k) => { const b = fn(), g = `translate(${f(c + x * SX)} ${BY}) scale(${k || K})`; return `<g transform="${g}">${b.n}</g>`; };
    let sk = '';
    [[LV.sphere, -330], [LV.highRoller, -110], [LV.fontainebleau, -538], [LV.resortsWorld, -472], [LV.wynn, -417], [LV.palazzo, -349], [LV.venetian, -316], [LV.treasure, -259], [LV.mirage, -201], [LV.caesars, -139], [LV.flamingo, -72],
      [LV.bellagio, 0], [LV.cosmopolitan, 72], [LV.paris, 173], [LV.cityCenter, 117], [LV.nyny, 278], [LV.mgmGrand, 348], [LV.excalibur, 414], [LV.mandalay, 665, .7], [LV.luxor, 492]].forEach((a) => { sk += add(a[0], a[1], a[2]); });
    s += sk;
    /* valley floor, its lights, and the road */
    s += `<rect y="${BY}" width="1600" height="90" fill="#0a0e1d"/>`;
    for (let i = 0; i < 300; i++) s += `<rect x="${f(r() * 1600)}" y="${f(BY + r() * 22)}" width="${f(1 + r() * 1.6)}" height="1.4" fill="${['#ffd9a0', '#ffe2a8', '#ffcf8a', '#ff9ad8', '#a9cfff'][Math.floor(r() * 5)]}" opacity="${f(.35 + r() * .55)}"/>`;
    for (let i = 0; i < 26; i++) s += glow(c - 640 + r() * 1280, BY + 4 + r() * 16, 8 + r() * 10, ['W', 'P', 'C', 'W'][Math.floor(r() * 4)], f(.4 + r() * .4));
    s += `<rect y="352" width="1600" height="68" fill="url(#fnRoad)"/><rect y="351" width="1600" height="3" fill="#e8803f" opacity=".5"/>`;
    s += `<path d="M0 392 H1600" stroke="#f6a368" stroke-opacity=".5" stroke-width="3" stroke-dasharray="46 40"/>`;
    s += `<rect y="300" width="1600" height="120" fill="url(#fnFade)" opacity="0"/>`;
    return s;
  }

  SW.finale = {
    init() {
      const scene = $('finScene');
      if (!scene) return;
      $('finSky').innerHTML = sky();
      const t = $('finTruck');
      const art = SW.truck.markup().replace('<g id="bedItems"></g>', '').replace(/ id="[^"]*"/g, '');
      t.innerHTML = art + `<g>${SW.truck.lights()}</g>`;
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      const set = (p) => scene.style.setProperty('--p', p.toFixed(4));
      set(0);
      if (reduce) return;
      let queued = false;
      const update = () => {
        queued = false;
        const r = scene.getBoundingClientRect(), vh = window.innerHeight;
        if (r.bottom < -50 || r.top > vh + 50) return;
        const mid = r.top + r.height / 2;
        set(clamp(1 - (mid - vh * .46) / (vh * .5), 0, 1));
      };
      const q = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', q, { passive: true });
      window.addEventListener('resize', q);
      update();
    },
  };
})(window.SW);
