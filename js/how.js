/* ============================================================================
   How it works: a night road that lights up as you scroll, a chevron marker that
   drives down it, and three small animated vignettes that play when the marker
   reaches them. The third is the real crew rig carrying a load to the truck.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$, f = SW.f, clamp = SW.clamp, lerp = SW.lerp;
  const NS = 'http://www.w3.org/2000/svg';
  const PI = Math.PI;

  /* ---------- a pile of junk seen from a phone: used for the viewfinder and the sent photo ---------- */
  /* the photo: a tall stack of junk shot close, in the phone's own portrait shape, so the pile is what fills the frame. Used by the viewfinder and the sent picture. */
  function pileArt() {
    return `<g id="pileArt">
      <rect width="90" height="170" fill="#dfe9f4"/>
      <rect width="90" height="100" fill="url(#svSky)"/>
      <rect y="14" width="90" height="108" fill="#e9d3bb"/><rect y="14" width="90" height="108" fill="url(#svShade)"/>
      <path d="M0 30 H90 M0 50 H90 M0 70 H90 M0 90 H90 M0 110 H90" stroke="#d3b99c" stroke-width="1" opacity=".5"/>
      <rect y="122" width="90" height="48" fill="#d6cdbc"/><path d="M0 122 H90" stroke="#b9ad98" stroke-width="2"/>
      <ellipse cx="45" cy="141" rx="44" ry="5" fill="#1b2440" opacity=".24"/>
      <g transform="translate(45 140) scale(.56)"><use href="#it-couch"/></g>
      <g transform="translate(46 97) rotate(-3) scale(.5)"><use href="#it-mattress"/></g>
      <g transform="translate(27 86) scale(.52)"><use href="#it-boxStack"/></g>
      <g transform="translate(66 86) scale(.54)"><use href="#it-lamp"/></g>
    </g>`;
  }

  /* ---------- the road ---------- */
  const R = { ready: false, len: 0, steps: [], stopLen: [], ys: [], lens: [], pathD: '', W: 0, H: 0 };

  function catmull(pts) {
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return d;
  }

  /* what the road depends on: the route's size and where each step sits. If none of it moved, there is nothing to redraw. */
  function roadSig() {
    const route = $('route'), rb = route.getBoundingClientRect(), wide = window.innerWidth > 1000;
    return [Math.round(rb.width), Math.round(rb.height), wide ? 1 : 0].concat(Array.from(route.querySelectorAll('.step')).map((s) => { const e = wide ? s : s.querySelector('.step-copy h3'), r = e.getBoundingClientRect(); return Math.round(r.top - rb.top + r.height / 2); })).join(',');
  }

  function buildRoad() {
    const route = $('route'), svg = $('routeRoad');
    const rb = route.getBoundingClientRect(), W = rb.width, H = rb.height;
    const wide = window.innerWidth > 1000, cx = wide ? W / 2 : 22, amp = wide ? 40 : 12;
    const steps = Array.from(route.querySelectorAll('.step'));
    const stops = steps.map((s, i) => { const r = (wide ? s : s.querySelector(".step-copy h3")).getBoundingClientRect(); return [cx + (i % 2 ? -amp : amp), r.top - rb.top + r.height / 2]; });
    const pts = [[cx, 0]];
    stops.forEach((p, i) => { pts.push(p); if (i < stops.length - 1) pts.push([cx, (p[1] + stops[i + 1][1]) / 2]); });
    pts.push([cx + (stops.length % 2 ? -amp : amp) * .4, H]);
    const d = catmull(pts);

    svg.setAttribute('viewBox', `0 0 ${f(W)} ${f(H)}`); svg.setAttribute('width', f(W)); svg.setAttribute('height', f(H));
    const w = wide ? 44 : 30;
    svg.innerHTML = `
      <defs>
        <linearGradient id="rdFade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${f(H)}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".05" stop-color="#fff"/><stop offset=".94" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <mask id="rdMask" maskUnits="userSpaceOnUse" x="-200" y="0" width="${f(W + 400)}" height="${f(H)}"><rect x="-200" width="${f(W + 400)}" height="${f(H)}" fill="url(#rdFade)"/></mask>
        <mask id="litMask" maskUnits="userSpaceOnUse" x="-200" y="0" width="${f(W + 400)}" height="${f(H)}"><path id="litLen" d="${d}" fill="none" stroke="#fff" stroke-width="80" stroke-linecap="round"/></mask>
        <radialGradient id="mkGlow"><stop offset="0" stop-color="#ffb070" stop-opacity=".55"/><stop offset="1" stop-color="#e8803f" stop-opacity="0"/></radialGradient>
        <linearGradient id="mkCone" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".55"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></linearGradient>
        <filter id="rdSoft" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>
        <filter id="rdGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g mask="url(#rdMask)">
        <path d="${d}" fill="none" stroke="rgba(238,241,250,.07)" stroke-width="${w + 6}" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="#0c1323" stroke-width="${w}" stroke-linecap="round"/>
        <path d="${d}" fill="none" stroke="rgba(238,241,250,.2)" stroke-width="2.4" stroke-dasharray="10 12"/>
        <g mask="url(#litMask)"><path d="${d}" fill="none" stroke="#f6a368" stroke-width="3.2" stroke-dasharray="10 12" filter="url(#rdGlow)"/></g>
      </g>
      ${stops.map((p, i) => `<g class="stop" data-i="${i}" transform="translate(${f(p[0])} ${f(p[1])}) scale(${wide ? 1 : .72})"><circle class="st-halo" r="40"/><circle class="st-ring" r="25"/><circle class="st-core" r="17"/><text class="st-n" y="6" text-anchor="middle">${i + 1}</text></g>`).join('')}
      <g id="mk" transform="translate(${f(cx)} 0)"><path d="M24 0 L120 -34 L120 34Z" fill="url(#mkCone)" filter="url(#rdSoft)"/><circle r="64" fill="url(#mkGlow)"/><use href="#mark-dark" x="-29" y="-18" width="58" height="36"/></g>`;

    const lit = svg.querySelector('#litLen'), L = lit.getTotalLength();
    R.len = L; R.lit = lit; R.mk = svg.querySelector('#mk'); R.stops = Array.from(svg.querySelectorAll('.stop'));
    lit.setAttribute('stroke-dasharray', `${L} ${L}`); lit.setAttribute('stroke-dashoffset', L);
    R.ys = []; R.lens = []; R.pts = [];
    for (let l = 0; l <= L; l += 3) { const p = lit.getPointAtLength(l); R.ys.push(p.y); R.lens.push(l); R.pts.push(p); }
    R.W = W; R.H = H; R.steps = steps; R.stopY = stops.map((p) => p[1]);
    R.stopLen = R.stopY.map(lenAtY);
    R.sig = roadSig();
    R.ready = true;
  }
  function lenAtY(y) {
    const ys = R.ys; if (y <= ys[0]) return 0; if (y >= ys[ys.length - 1]) return R.len;
    let lo = 0, hi = ys.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (ys[m] <= y) lo = m; else hi = m; }
    return lerp(R.lens[lo], R.lens[hi], (y - ys[lo]) / Math.max(.001, ys[hi] - ys[lo]));
  }

  function placeMarker(len) {
    const p = R.lit.getPointAtLength(len), q = R.lit.getPointAtLength(Math.min(R.len, len + 6)), a = R.lit.getPointAtLength(Math.max(0, len - 6));
    const ang = Math.atan2(q.y - a.y, q.x - a.x) * 180 / PI;
    R.mk.setAttribute('transform', `translate(${f(p.x)} ${f(p.y)}) rotate(${f(ang)})`);
  }
  let lastLen = -1;
  function update(force) {
    if (!R.ready) return;
    const rb = $('route').getBoundingClientRect();
    const y = window.innerHeight * .74 - rb.top;
    const end = R.stopY[R.stopY.length - 1] + 40;
    const len = R.reduce ? R.stopLen[R.stopLen.length - 1] : lenAtY(clamp(y, 0, end));
    if (!force && Math.abs(len - lastLen) < .4) return;
    lastLen = len;
    R.lit.setAttribute('stroke-dashoffset', R.len - len);
    placeMarker(len);
    R.mk.style.opacity = y < 6 ? 0 : 1;
    R.steps.forEach((s, i) => {
      const on = len >= R.stopLen[i] - 8;
      if (on !== s.classList.contains('on')) { s.classList.toggle('on', on); if (R.stops[i]) R.stops[i].classList.toggle('on', on); crewGate(i, on); }
    });
  }

  /* ---------- vignette 3: the crew loop ----------
     One load, handled the way it is on a real job: the couch is a two-person lift (one at each end, the leader
     walking backwards), the armchair is one person's. Same figures and the same carry/hoist mechanics as the hero. */
  const C = { on: false, visible: false, t: 0, last: 0, raf: 0, k: -1 };
  const GY = 272, TS = .5, CS = .58, PXCM = 1.29, ITEM_K = 1 / PXCM;
  const TX = 560 - 722 * TS;      /* truck's tailgate x */
  const CYC = 9.2, GRIP = 27, HOIST_Y = 138, HOIST_F_SOLO = 36, LAND = .60, SC = .8;
  const COUCH = { t: 'couch', slot: [100, -172, .93, 0], gy: 84 };
  const CHAIR = { t: 'armchair', slot: [204, -172, .93, 2], gy: 100 };
  const ease = (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const sm = (a, b, t) => { t = clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const PC = PXCM * CS;

  function buildCrew() {
    const svg = $('crewSvg');
    const truck = SW.truck.markup().replace('<g id="bedItems"></g>', '<g class="bedItems"></g>').replace(/ id="[^"]*"/g, '');
    /* a quiet night street: moon, a dark house with one lit window, kerb and road */
    let bg = `<defs><linearGradient id="cwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1126"/><stop offset=".7" stop-color="#1c2650"/><stop offset="1" stop-color="#2d2f5e"/></linearGradient><linearGradient id="cwGnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f3a"/><stop offset="1" stop-color="#0b0f20"/></linearGradient></defs>`;
    bg += `<rect width="560" height="340" fill="url(#cwSky)"/><circle cx="470" cy="62" r="22" fill="#f3ead0" opacity=".9"/><circle cx="470" cy="62" r="46" fill="#f3ead0" opacity=".08"/>`;
    const r = SW.mk(21);
    for (let i = 0; i < 26; i++) bg += `<circle cx="${f(r() * 560)}" cy="${f(r() * 150)}" r="${f(.5 + r() * .9)}" fill="#fff" opacity="${f(.25 + r() * .5)}"/>`;
    bg += `<path d="M0 214 L40 190 L120 190 L150 168 L210 168 L240 190 L300 190 L300 ${GY - 30} H0Z" fill="#141a35"/><rect x="62" y="206" width="34" height="26" fill="#ffd9a0" opacity=".85"/><rect x="62" y="206" width="34" height="26" fill="none" stroke="#141a35" stroke-width="3"/><path d="M79 206 V232 M62 219 H96" stroke="#141a35" stroke-width="2.4"/>`;
    bg += `<rect y="${GY - 30}" width="560" height="14" fill="#232a4e"/><rect y="${GY - 16}" width="560" height="${340 - GY + 16}" fill="url(#cwGnd)"/><path d="M0 ${GY + 14} H560" stroke="#e8803f" stroke-opacity=".28" stroke-width="2" stroke-dasharray="26 22"/>`;
    svg.innerHTML = bg + `<g transform="translate(${f(TX)} ${GY}) scale(${TS})">${truck}</g><g id="cwFlight"></g>`;
    C.svg = svg;
    const bed = svg.querySelector('.bedItems');
    bed.innerHTML = [COUCH, CHAIR].map((it) => `<use class="bi" href="#it-${it.t}" visibility="hidden" transform="translate(${it.slot[0]} ${it.slot[1]}) rotate(${it.slot[3]}) scale(${it.slot[2]})"/>`).join('');
    C.bedG = bed; C.bed = Array.from(bed.querySelectorAll('.bi'));
    C.cr = [0, 1, 2].map((i) => { const c = SW.crew.create(SW.CREW_LOOK[i]); c.g.setAttribute('opacity', '0'); svg.insertBefore(c.g, $('cwFlight')); return c; });
    const NS_ = 'http://www.w3.org/2000/svg';
    C.pair = document.createElementNS(NS_, 'use'); C.pair.setAttribute('visibility', 'hidden'); svg.insertBefore(C.pair, $('cwFlight'));
    C.fl = [0, 1].map(() => { const u = document.createElementNS(NS_, 'use'); u.setAttribute('visibility', 'hidden'); $('cwFlight').appendChild(u); return u; });
  }

  /* the whole performance is a function of time since the step lit up */
  function crewFrame(t) {
    t = Math.max(0, t);
    const k = Math.floor(t / CYC), u = t - k * CYC;
    const dC = SW.ITEM_DIM.couch, off = dC.w * SC * CS / 2 + GRIP * PC;
    const cxH = TX + COUCH.slot[0] * TS, caH = TX + CHAIR.slot[0] * TS;
    const XP0 = -12, XS0 = -30, XAW = -60;

    /* bed contents and a soft reset between loads */
    const landC = 2.4 + LAND * 1.3, landA = 3.4 + LAND * 1.3;
    C.bed[0].setAttribute('visibility', u >= landC ? 'visible' : 'hidden'); C.bed[1].setAttribute('visibility', u >= landA ? 'visible' : 'hidden');
    C.bedG.setAttribute('opacity', (1 - sm(7.4, 8.6, u)).toFixed(2));

    /* pair: u 0..2.4 carry in, 2.4..3.7 hoist, 3.7..4.1 stand, 4.1..6.2 walk away */
    const pst = (role) => {
      const sgn = role ? 1 : -1, yRole = GY + (role ? 8 : 5);
      let x, vis = 1, o, pair = false, yaw = role ? PI : 0;
      if (u < 2.4) {
        const w = u / 2.4, cx = lerp(XP0, cxH, ease(w)); x = cx + sgn * off; vis = clamp(w * 6, 0, 1);
        const ph = SW.crew.phase(Math.abs(cx - XP0) / PC) * (role ? -1 : 1) + role * 1.9;
        o = { yaw, theta: ph, amp: Math.pow(Math.sin(PI * w), .55) * .9, carry: true, gy: COUCH.gy, gf: GRIP, gl: 15, gm: 1, lean: 0, effort: .55 };
        pair = true;
      } else if (u < 3.7) {
        const h = (u - 2.4) / 1.3, l = sm(0, .30, h), rel = sm(.40, .66, h);
        x = cxH + sgn * off;
        o = { yaw, theta: 0, amp: 0, carry: true, gy: lerp(COUCH.gy, HOIST_Y, l), gf: GRIP, gl: 15, gm: h < .4 ? 1 : 1 - rel, lean: 0, headPitch: 8 * l * (1 - sm(.4, .7, h)), effort: .9 * (1 - sm(.5, .8, h)) };
        pair = h < .4;
      } else if (u < 4.1) {
        x = cxH + sgn * off; o = { yaw, theta: 0, amp: 0 };
      } else if (u < 6.2) {
        const w = (u - 4.1) / 2.1, e = ease(w); x = lerp(cxH + sgn * off, XAW + sgn * 14, e); vis = 1 - sm(.78, 1, w); yaw = PI;
        o = { yaw: PI, theta: SW.crew.phase(Math.abs(x - (cxH + sgn * off)) / PC) + role * 1.4 + 1, amp: Math.pow(Math.sin(PI * w), .55) * .95 };
      } else { x = XAW; vis = 0; o = { yaw: PI, theta: 0, amp: 0 }; }
      return { x, y: yRole, vis, o, pair, role };
    };
    const solo = () => {
      const xs = caH - HOIST_F_SOLO * PC, y = GY + 13;
      let x = xs, vis = 1, o, carry = '';
      if (u < 1.0) { x = XS0; vis = 0; o = { yaw: 0, theta: 0, amp: 0 }; }
      else if (u < 3.4) {
        const w = (u - 1.0) / 2.4; x = lerp(XS0, xs, ease(w)); vis = clamp(w * 6, 0, 1);
        o = { yaw: 0, theta: SW.crew.phase(Math.abs(x - XS0) / PC) + .5, amp: Math.pow(Math.sin(PI * w), .55) * .95, carry: true, gy: CHAIR.gy, gf: GRIP, gl: 15, gm: 1, lean: -8, effort: .25 }; carry = 'armchair';
      } else if (u < 4.7) {
        const h = (u - 3.4) / 1.3, l = sm(0, .30, h), rel = sm(.40, .66, h), turn = ease(clamp((h - .66) / .34, 0, 1));
        o = { yaw: lerp(.05, PI - .1, turn), theta: 0, amp: 0, carry: true, gy: lerp(CHAIR.gy, HOIST_Y, l), gf: lerp(GRIP, HOIST_F_SOLO, l), gl: 15, gm: h < .4 ? 1 : 1 - rel, lean: lerp(-8, -3, l) * (1 - sm(.5, 1, h)), headPitch: 10 * l * (1 - sm(.4, .7, h)), effort: .5 * (1 - sm(.5, .8, h)) };
        carry = h < .4 ? 'armchair' : '';
      } else if (u < 5.0) { o = { yaw: PI - .1, theta: 0, amp: 0 }; }
      else if (u < 7.0) {
        const w = (u - 5.0) / 2.0, e = ease(w); x = lerp(xs, XAW, e); vis = 1 - sm(.75, 1, w);
        o = { yaw: PI, theta: SW.crew.phase(Math.abs(x - xs) / PC) + 2.3, amp: Math.pow(Math.sin(PI * w), .55) * .95 };
      } else { x = XAW; vis = 0; o = { yaw: PI, theta: 0, amp: 0 }; }
      return { x, y, vis, o, carry };
    };

    const P = [pst(0), pst(1), solo()];
    const res = P.map((s, i) => {
      const cr = C.cr[i];
      cr.g.setAttribute('transform', `translate(${f(s.x)} ${f(s.y)}) scale(${f(PC * (cr.h || 1))})`);
      cr.g.setAttribute('opacity', s.vis.toFixed(2));
      s.o.breath = Math.sin(t * 2.3 + i * 1.9);
      const r = SW.crew.apply(cr, s.o);
      if (s.carry && r.grip) cr.rig.setItem(s.carry, `translate(${f(r.grip[0])} ${f(r.grip[1])}) scale(${f(ITEM_K * SC)}) translate(0 ${f(SW.ITEM_DIM[s.carry].h / 2)})`); else cr.rig.setItem('');
      return r;
    });
    /* the couch is drawn once, between the two carriers' hands */
    if (P[0].pair && P[1].pair && res[0].grip && res[1].grip) {
      const cx = (P[0].x + res[0].grip[0] * PC + P[1].x + res[1].grip[0] * PC) / 2, cy = (P[0].y + res[0].grip[1] * PC + P[1].y + res[1].grip[1] * PC) / 2;
      C.pair.setAttribute('href', '#it-couch'); C.pair.setAttribute('visibility', 'visible');
      C.pair.setAttribute('transform', `translate(${f(cx)} ${f(cy)}) scale(${f(CS * SC)}) translate(0 ${f(dC.h / 2)})`);
    } else C.pair.setAttribute('visibility', 'hidden');

    /* released pieces drop from the hands into their slots */
    const fly = (el, item, ct0, ct1, hands, s0) => {
      const q = clamp((u - ct0) / (ct1 - ct0), 0, 1);
      if (!(u >= ct0 && q < 1)) { el.setAttribute('visibility', 'hidden'); return; }
      const dim = SW.ITEM_DIM[item.t], sS = item.slot[2] * TS, qx = ease(q), qy = q * q;
      const tx = TX + item.slot[0] * TS, ty = GY + item.slot[1] * TS - dim.h * sS / 2 - 0;
      el.setAttribute('href', '#it-' + item.t); el.setAttribute('visibility', 'visible');
      el.setAttribute('transform', `translate(${f(lerp(hands[0], tx, qx))} ${f(lerp(hands[1], ty, qy))}) rotate(${f(lerp(0, item.slot[3], qx))}) scale(${f(lerp(s0, sS, qx))}) translate(0 ${f(dim.h / 2)})`);
    };
    {
      const o0 = { yaw: 0, theta: 0, amp: 0, carry: true, gy: HOIST_Y, gf: GRIP, gl: 15, gm: 1 }, o1 = Object.assign({}, o0, { yaw: PI });
      const g0 = SW.crew.solve(o0).grip, g1 = SW.crew.solve(o1).grip;
      const hx = (cxH - off + g0[0] * PC + cxH + off + g1[0] * PC) / 2, hy = (GY + 5 + g0[1] * PC + GY + 8 + g1[1] * PC) / 2;
      fly(C.fl[0], COUCH, 2.4 + .4 * 1.3, landC, [hx, hy], CS * SC);
      const os = { yaw: .05, theta: 0, amp: 0, carry: true, gy: HOIST_Y, gf: HOIST_F_SOLO, gl: 15, gm: 1 }, gs = SW.crew.solve(os).grip;
      fly(C.fl[1], CHAIR, 3.4 + .4 * 1.3, landA, [caH - HOIST_F_SOLO * PC + gs[0] * PC, GY + 13 + gs[1] * PC], CS * SC);
    }
  }

  function crewLoop(now) {
    if (!C.on || !C.visible || C.hold) { C.raf = 0; return; }
    const dt = clamp((now - C.last) / 1000 || .016, 0, .05); C.last = now;
    C.t += dt; crewFrame(C.t);
    C.raf = requestAnimationFrame(crewLoop);
  }
  function crewKick() { if (!C.raf && C.on && C.visible && !R.reduce) { C.last = performance.now(); C.raf = requestAnimationFrame(crewLoop); } }
  function crewGate(i, on) { if (i === 2) { C.on = on; if (on) crewKick(); } }

  SW.how = {
    frame(t) { C.hold = true; crewFrame(t); },     /* dev: pose the loop at a fixed time */
    init() {
      const route = $('route');
      if (!route) return;
      R.reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      $('spriteDefs').insertAdjacentHTML('beforeend', pileArt());
      document.documentElement.classList.add('how-live');
      if (SW.crew && SW.truck) {
        buildCrew();
        crewFrame(R.reduce ? 4.8 : .01);
        if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { C.visible = e.isIntersecting; if (C.visible) crewKick(); }), { threshold: .1 }).observe($('crewSvg'));
      }
      buildRoad(); update(true);
      let queued = false;
      const q = () => { if (!queued) { queued = true; requestAnimationFrame(() => { queued = false; update(); }); } };
      window.addEventListener('scroll', q, { passive: true });
      let rt = 0;
      const rebuild = () => { clearTimeout(rt); rt = setTimeout(() => { if (R.sig === roadSig()) return; buildRoad(); lastLen = -1; update(true); R.steps.forEach((s, i) => { if (R.stops[i]) R.stops[i].classList.toggle('on', s.classList.contains('on')); }); }, 150); };
      window.addEventListener('resize', rebuild);
      if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(route);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
    },
  };
})(window.SW);
