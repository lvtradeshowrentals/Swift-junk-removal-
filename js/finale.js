/* ============================================================================
   The finale: the Strip at night, a road, and the truck driving off as you reach
   the bottom of the page. The skyline is the same set of landmarks the ride uses.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$, f = SW.f, clamp = SW.clamp;

  /* The Strip at night, drawn deliberately. Every building keeps its body (recoloured to moonlit navy by the same night filter the ride uses) with
     its own lights on top, and the set is the handful that read at a glance: Mandalay Bay and the Luxor pyramid and its beam in the south, the Eiffel
     Tower, the Cosmopolitan, the STRAT as the tall centre, the High Roller, Wynn and the Sphere. The middle ~40% is the part a phone shows. */
  function sky() {
    const LV = SW.LV, glow = SW.LVhelp.glow, r = SW.mk(61), N = SW.night.svg;
    const BY = 338;
    let s = `<defs>
      <linearGradient id="fnSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060a16"/><stop offset=".5" stop-color="#0c1430"/><stop offset=".82" stop-color="#27285a"/><stop offset="1" stop-color="#63395f"/></linearGradient>
      <linearGradient id="fnRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121630"/><stop offset="1" stop-color="#080b17"/></linearGradient>
      <linearGradient id="fnFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2750"/><stop offset="1" stop-color="#0d1024"/></linearGradient>
      <radialGradient id="fnGlow" cx=".5" cy="1" r=".6"><stop offset="0" stop-color="#ffb070" stop-opacity=".42"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>
    </defs>`;
    s += `<rect width="1600" height="420" fill="url(#fnSky)"/>`;
    for (let i = 0; i < 80; i++) s += `<circle cx="${f(r() * 1600)}" cy="${f(r() * 210)}" r="${f(.5 + r() * 1)}" fill="#fff" opacity="${f(.2 + r() * .5)}"/>`;
    /* the glow of the Strip itself on the haze, then the far ridges */
    s += `<ellipse cx="800" cy="${BY}" rx="760" ry="150" fill="url(#fnGlow)"/>`;
    s += `<path d="M0 ${BY - 8} L120 ${BY - 44} L260 ${BY - 20} L430 ${BY - 62} L600 ${BY - 24} L760 ${BY - 50} L980 ${BY - 20} L1180 ${BY - 58} L1360 ${BY - 24} L1500 ${BY - 46} L1600 ${BY - 26} V${BY + 10} H0Z" fill="#161a3a"/>`;
    /* [builder, x, scale]: spaced so no two outlines touch */
    const set = [[LV.mandalay, 40, .78], [LV.luxor, 300, 1.02], [LV.paris, 520, 1.08], [LV.cosmopolitan, 690, 1.12], [LV.strat, 830, .98], [LV.highRoller, 990, 1.1],
      [LV.wynn, 1140, 1.2], [LV.sphere, 1290, .95], [LV.fontainebleau, 1440, .95]];
    let body = '';
    set.forEach(([fn, x, k]) => { const b = fn(), g = `translate(${f(x)} ${BY}) scale(${k})`; body += `<g transform="${g}">${N(b.s)}${b.n}</g>`; });
    s += body;
    /* the valley floor in front, with its sea of lights, then the road */
    s += `<rect y="${BY}" width="1600" height="90" fill="url(#fnFloor)"/>`;
    for (let i = 0; i < 380; i++) s += `<rect x="${f(r() * 1600)}" y="${f(BY + 1 + r() * 26)}" width="${f(1 + r() * 1.6)}" height="1.4" fill="${['#ffd9a0', '#ffe2a8', '#ffcf8a', '#ff9ad8', '#a9cfff'][Math.floor(r() * 5)]}" opacity="${f(.35 + r() * .55)}"/>`;
    for (let i = 0; i < 30; i++) s += glow(60 + r() * 1480, BY + 4 + r() * 16, 8 + r() * 10, ['W', 'P', 'C', 'W'][Math.floor(r() * 4)], f(.35 + r() * .4));
    s += `<rect y="354" width="1600" height="66" fill="url(#fnRoad)"/><rect y="352" width="1600" height="3" fill="#e8803f" opacity=".5"/>`;
    s += `<path d="M0 392 H1600" stroke="#f6a368" stroke-opacity=".5" stroke-width="3" stroke-dasharray="46 40"/>`;
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
      if (reduce) { set(.6); return; }
      set(0);
      /* nothing is pinned and the page is never held: once the scene is about 38% of the way up the screen the truck drives across on its own clock */
      const DUR = 4200, ease = (t) => t * t * (3 - 2 * t) * .35 + t * .65;   /* mostly steady, with a soft start and finish */
      let raf = 0, t0 = 0, state = 'wait';       /* wait -> run -> done; re-arms when the scene fully leaves the screen */
      const frame = (now) => {
        const t = clamp((now - t0) / DUR, 0, 1);
        set(ease(t));
        if (t < 1) raf = requestAnimationFrame(frame); else { raf = 0; state = 'done'; }
      };
      const check = () => {
        const r = scene.getBoundingClientRect(), vh = window.innerHeight;
        const off = r.bottom < 0 || r.top > vh;
        if (state === 'wait' && r.top <= vh * .62 && r.bottom > 0) { state = 'run'; t0 = performance.now(); raf = requestAnimationFrame(frame); }
        else if (state === 'done' && off) { state = 'wait'; set(0); }
      };
      let queued = false;
      const q = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; check(); }); } };
      window.addEventListener('scroll', q, { passive: true });
      window.addEventListener('resize', q);
      check();
    },
  };
})(window.SW);
