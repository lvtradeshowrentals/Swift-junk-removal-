/* ============================================================================
   The hero: one day, one house. The truck and trailer stay on screen as the camera;
   scroll is the clock. A crew of three clears a whole move-out pile, piece by piece,
   into the trailer (heavy things first, flat things on top), a net and two straps go
   over the load, the gate shuts, the crew climbs in and the rig drives off into the
   night toward the Strip. The sky runs dawn to dark underneath all of it.

   Every art layer is its own element moved with transform only, and each has a night
   twin that is cross-faded in. Everything that moves is a pure function of one number
   (the smoothed scroll position), so the whole scene scrubs forwards and backwards.
   ========================================================================== */
(function (SW) {
  'use strict';
  const { $, clamp, lerp, smooth, easeInOut, easeOut, f } = SW;
  const G = SW.G, TS = G.TRUCK_S, SVGNS = 'http://www.w3.org/2000/svg';
  const R = SW.ride = {};
  const html = document.documentElement;
  const HERO = SW.HERO, TR = SW.trailer, PI = Math.PI;
  const PXCM = 1.29, ITEM_K = 1 / PXCM;
  const RIG = { x: -720, y: -340, w: 1540, h: 360 };   /* trailer rear to the truck's nose, in truck units */
  const FM = .62;                                       /* mid-row parallax */
  const NOM = { mtn: .03, sky: .10, foot: .16, sub: .24, cloud: .06 };
  const BG_LAYERS = [['lyCloudsA', 'cloud'], ['lyCloudsB', 'cloud'], ['lyMtn', 'mtn'], ['lySky', 'sky'], ['lyStrip', 'strip'], ['lyFoot', 'foot'], ['lySub', 'sub']];
  const PAN_PAR = { cloud: .01, mtn: .02, sky: .04, strip: .05, foot: .08, sub: .12 };
  /* how long each part of the scroll is, in screens */
  /* the hero plays by itself on a clock: these are real seconds (load and secure take the length of the crew's plan) */
  const LEAD = .75, DRIVE = .9, TAIL = .25;
  let PARTS = [];

  let stage, track, reduce = false;
  let L = null, parts = {}, total = 0, keys = [], plan = null;
  let els = {}, segEls = [], segElsN = [], crews = [], flyEls = [], pairUse = null, slotEls = [], pileEls = [], pileElsN = [];
  let ps = 0, camPrev = 0, camVel = 0, running = false, travelBase = 0, splashOff = 0;
  let trackTop = 0, trackH = 0, cache = {}, nightW = 0, lastT = 0, worldSegs = [], nightBuilt = 0, nightJob = 0;

  const put = (id, h) => { const e = $(id); if (e) e.innerHTML = h; return e; };
  const setIf = (el, key, val, fn) => { if (cache[key] !== val) { cache[key] = val; fn(el, val); } };
  const css = (el, k, v) => { if (el) el.style[k] = v; };
  const vis2 = (e, key, v) => setIf(e, key, v, (el, val) => { if (el) el.setAttribute('visibility', val); });

  /* ======================= layout ======================= */
  function computeLayout() {
    const W = stage.clientWidth, H = stage.clientHeight, wide = W >= 900;
    /* Everything is laid out at the "close" scale (the crew work at it) and the camera pulls back from there for the
       wide shots, so the art is always rasterised at full size and only ever scaled down. */
    /* the pile and the whole rig are about 1,800 truck units wide, so on a phone the close frame (pile + back of the trailer)
       sets the scale and the wide frame is a pulled-back shot that still shows the pile at the left edge */
    const ts = wide ? Math.min(.56 * W / 722, .00135 * H) : .94 * W / 680;
    const S0 = ts / TS;
    const B = Math.max(W / 1600, H / 900), landscape = W / H > .8;
    const truckLeft = wide ? .5 * W : .5 * W;
    const nose = truckLeft + 722 * ts;
    const rampTip = truckLeft + TR.G.RAMP_X * ts;
    const pileCx = rampTip - 15 * S0;
    const pileLeft = pileCx - 300 * S0, pileLeftC = pileCx - 410 * S0;
    const cam0 = HERO.pileX - pileCx / S0;
    const camFinal = HERO.finaleX - (truckLeft + 361 * ts) / S0;
    /* wide frame: on a desktop the whole rig; on a phone a tight shot of the pickup with just the front of the trailer, so the truck stays big */
    const zW = wide ? clamp(.96 * W / (nose - pileLeft), .4, 1) : .8;
    const txW = .978 * W - zW * nose;
    /* a phone's working shot takes in the pile, the whole trailer and the back of the cab; the camera zooms out to it once and holds */
    const spanL = pileCx - 225 * S0, spanR = truckLeft + 40 * ts;
    const zC = wide ? 1 : clamp(.96 * W / (spanR - spanL), .62, zW);
    const txC = wide ? (.30 * W - rampTip) : (.02 * W - zC * spanL);
    const txMin = .975 * W - (truckLeft + TR.G.BOX_R * ts);   /* furthest the follow-cam may pan toward the cab */
    const D = (camFinal - cam0) * S0;
    L = {
      W, H, S0, ts, wide, cam0, truckLeft, B, landscape, X_MIN: HERO.X_MIN, camNow: cam0, camFinal, pileCx,
      zW, zC, txW, txC, txMin, k: zW, noseScreen: txW + zW * nose, truckLeftNow: truckLeft,
      groundPx: H - 42 * S0, bgShift: landscape ? -44 * B : Math.round((W < 600 ? .2 : .07) * H), lift: 0,   /* portrait: sink the backdrop so only the tall landmarks clear the rooftops */
    };
    L.heroLeft = truckLeft; L.rideLeft = truckLeft;
    L.G = { strip: 0, mtn: NOM.mtn * D / B, sky: NOM.sky * D / B, foot: NOM.foot * D / B, sub: NOM.sub * D / B, cloud: NOM.cloud * D / B };
    SW.layout = L;
    return L;
  }

  /* ======================= timeline ======================= */
  function buildTimeline() {
    /* the crew starts moving at t = 0, under the headline fade and the camera move: 'load' is what is left of the work after the lead */
    PARTS = [['hold', LEAD], ['load', Math.max(.2, plan.T_load - LEAD)], ['secure', plan.T_secure], ['drive', DRIVE], ['finale', TAIL]];
    parts = {}; total = PARTS.reduce((s, p) => s + p[1], 0);
    let acc = 0; PARTS.forEach(([n, len]) => { parts[n] = { n, len, p0: acc / total, p1: (acc + len) / total }; acc += len; });
    const mid = (n, k) => parts[n].p0 + (parts[n].p1 - parts[n].p0) * k;
    /* the original early-morning sunrise at rest, full daylight within the first beats of the work, warm afternoon as the rig leaves. No night. */
    keys = [[0, 0], [parts.hold.p1, .05], [mid('load', .12), .18], [mid('load', .38), .31], [parts.load.p1, .38], [mid('secure', .6), .42], [mid('drive', .5), .47], [mid('finale', .35), .50], [1, .50]];
  }
  const partOf = (p) => { for (const [n] of PARTS) if (p <= parts[n].p1 + 1e-9) return n; return 'finale'; };
  const jOf = (n, p) => clamp((p - parts[n].p0) / (parts[n].p1 - parts[n].p0), 0, 1);
  function camAt(p) {
    const d = parts.drive;
    if (p <= d.p0) return L.cam0;
    if (p >= d.p1) return L.camFinal;
    return lerp(L.cam0, L.camFinal, easeInOut((p - d.p0) / (d.p1 - d.p0)));
  }
  /* time of day as ONE smooth curve over the whole run: a cubic Hermite through (0, dawn), (.4, full daylight) and (1, warm afternoon), at rest at both ends and
     always moving in between. (Easing each keyframe to a stop made the sun lurch, then stall.) */
  const PH = [[0, 0, 0], [.55, .385, .36], [1, .5, 0]];
  function phaseAt(p) {
    p = clamp(p, 0, 1);
    const k = p < PH[1][0] ? 0 : 1, a = PH[k], b = PH[k + 1], h = b[0] - a[0], t = (p - a[0]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * a[1] + (t3 - 2 * t2 + t) * h * a[2] + (-2 * t3 + 3 * t2) * b[1] + (t3 - t2) * h * b[2];
  }
  /* the camera: 0 = wide, 1 = close. It pushes in as the crew steps out and pulls back as the rig prepares to leave. */
  /* smootherstep: zero velocity AND zero acceleration at both ends, so a camera move starts and stops without a visible kick */
  const sm5 = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * t * (t * (6 * t - 15) + 10); };
  function closeAt(p) {
    const lo = parts.load, se = parts.secure, dr = parts.drive;
    /* the push-in/pan finishes just as the crew starts lifting; the pull-back is one slow move across the end of the securing and the drive-off */
    return sm5(.0, parts.hold.p1 + (lo.p1 - lo.p0) * .1, p) * (1 - sm5(se.p0 + (se.p1 - se.p0) * .45, dr.p0 + (dr.p1 - dr.p0) * .55, p));
  }
  function frameAt(p) {
    const m = closeAt(p);
    return { m, z: lerp(L.zW, L.zC, m), tx: lerp(L.txW, L.txC, m) };
  }
  /* virtual seconds on the crew's clock: 0 when the load begins, T_load when the last piece is in, then the securing */
  function tvAt(p) {
    const lo = parts.load, se = parts.secure;
    if (p <= lo.p1) return p * total;                       /* parts are real seconds from t = 0, so this is just the clock */
    return plan.T_load + (p - se.p0) * total;
  }

  /* ======================= building the scene ======================= */
  const twin = (day) => { const n = day.cloneNode(false); n.removeAttribute('id'); n.id = day.id + 'N'; n.classList.add('nt'); day.after(n); return n; };
  function layerSvg(id, xa, xb, inner, innerN) {
    const e = $(id), n = $(id + 'N') || twin(e);
    [e, n].forEach((x) => { x.setAttribute('viewBox', `${xa} 0 ${xb - xa} 900`); x.setAttribute('preserveAspectRatio', 'none'); x._xa = xa; x._xb = xb; });
    e.innerHTML = inner; n.innerHTML = innerN;
    return e;
  }
  function buildBackdrop() {
    const m = SW.bg.mountains(L), sky = SW.bg.skyline(L), sk = sky.down, st = sky.strip, fo = SW.bg.foothills(L), su = SW.bg.suburbs(L);
    $('spriteDefs').insertAdjacentHTML('beforeend', su.grads);
    SW.night.register(su.grads);
    $('spriteDefs').insertAdjacentHTML('beforeend', SW.night.defs(su.grads));
    const N = SW.night.svg;
    layerSvg('lyMtn', m.xa, m.xb, m.svg, N(m.svg));
    const haze = `<rect x="${sk.xa}" y="540" width="${sk.xb - sk.xa}" height="110" fill="url(#haze)" opacity=".5"/>`;
    layerSvg('lySky', sk.xa, sk.xb, sk.svg + haze, N(sk.svg + haze) + sk.neon);
    layerSvg('lyStrip', st.xa, st.xb, st.svg, N(st.svg) + st.neon);
    layerSvg('lyFoot', fo.xa, fo.xb, fo.svg, N(fo.svg));
    layerSvg('lySub', su.xa, su.xb, su.svg, N(su.svg) + su.lightsSvg);
    const c1 = SW.bg.clouds(L, false), c2 = SW.bg.clouds(L, true);
    layerSvg('lyCloudsA', c1.xa, c1.xb, c1.svg, N(c1.svg));
    layerSvg('lyCloudsB', c2.xa, c2.xb, c2.svg, N(c2.svg));
    put('starsG', SW.bg.stars());
  }

  /* the near world's night twins are only needed late, so they are built in idle time */
  function mkSeg(s, inner) {
    const e = document.createElementNS(SVGNS, 'svg');
    e.setAttribute('class', 'seg'); e.setAttribute('viewBox', `${s.x0} 0 ${s.w} 520`); e.setAttribute('preserveAspectRatio', 'none');
    e.setAttribute('aria-hidden', 'true'); e.setAttribute('focusable', 'false');
    e.innerHTML = inner; e._x0 = s.x0; e._w = s.w; return e;
  }
  function mapNightIds() {
    HERO.pile.forEach((_, i) => { const e = $(`pile-${i}N`); if (e) pileElsN[i] = e; });
  }
  function buildNightSegs(limit) {
    const wn = $('worldN'), N = SW.night.svg;
    for (let n = 0; nightBuilt < worldSegs.length && n < limit; n++, nightBuilt++) {
      const s = worldSegs[nightBuilt], b = mkSeg(s, N(s.svg) + s.lights);
      wn.appendChild(b); segElsN[nightBuilt] = b; b.style.display = segEls[nightBuilt].style.display;
      if (L) { b.style.left = ((b._x0 - L.X_MIN) * L.S0) + 'px'; b.style.width = (b._w * L.S0) + 'px'; b.style.height = (520 * L.S0) + 'px'; }
      mapNightIds();
    }
    if (nightBuilt < worldSegs.length) scheduleNight(); else { nightJob = 0; cache.nightPile = 0; }
  }
  function scheduleNight() {
    if (nightJob) return;
    const run = () => { nightJob = 0; buildNightSegs(1); };
    nightJob = 1;
    if (window.requestIdleCallback) requestIdleCallback(run, { timeout: 1500 }); else setTimeout(run, 120);
  }
  function buildWorld() {
    worldSegs = SW.world.buildHero();
    const w = $('world'), wn = $('worldN');
    w.innerHTML = ''; wn.innerHTML = '';
    segEls = []; segElsN = []; nightBuilt = 0; nightJob = 0;
    worldSegs.forEach((s) => { const a = mkSeg(s, s.svg); w.appendChild(a); segEls.push(a); });
    const N = SW.night.svg;
    const mid = SW.world.midRow(3200), ml = $('lyMid'), mln = $('lyMidN') || twin(ml);
    [ml, mln].forEach((e) => { e.setAttribute('viewBox', `0 0 ${mid.len} 520`); e.setAttribute('preserveAspectRatio', 'none'); e._len = mid.len; });
    ml.innerHTML = mid.svg; mln.innerHTML = N(mid.svg) + mid.lights;
    pileEls = HERO.pile.map((_, i) => $(`pile-${i}`)); pileElsN = HERO.pile.map(() => null);
  }

  /* the rig: trailer (back, load, flying piece, front, net) and then the pickup, all in one svg so they move as one */
  function buildRig() {
    const rig = $('truck');
    rig.setAttribute('viewBox', `${RIG.x} ${RIG.y} ${RIG.w} ${RIG.h}`);
    const loadUse = TR.LOAD.map((it, i) => `<use id="tl-${i}" href="#it-${it.t}" transform="${TR.tf(it)}" visibility="hidden"/>`).join('');
    const flyUse = [0, 1, 2].map((c) => `<use id="tf-${c}" href="#it-box" visibility="hidden"/>`).join('');
    rig.innerHTML = `<g id="trBack">${TR.back()}</g><g id="trLoad">${loadUse}</g><g id="trFly">${flyUse}</g><g id="trFront">${TR.front()}</g><g id="trNetG">${TR.netMarkup()}</g>` + SW.truck.markup();
    const tl = $('truckLights');
    tl.setAttribute('viewBox', `${RIG.x} ${RIG.y} ${RIG.w} ${RIG.h}`);
    const b = TR.G.BOX_L, d = TR.G.DECK;
    tl.innerHTML = SW.truck.lights() + `<ellipse cx="${b - 4}" cy="${d - 22}" rx="22" ry="30" fill="url(#tailG)" opacity=".6"/><ellipse cx="${b - 30}" cy="-2" rx="90" ry="9" fill="#ff5a48" opacity=".16" filter="url(#fblur8)"/>`;
    els.tWheels = Array.from(rig.querySelectorAll('#wheels .wheel-spin'));
    els.rWheels = Array.from(rig.querySelectorAll('.tr-w .wheel-spin'));
    els.speed = $('speedlines'); els.ramp = $('trRamp'); els.netRect = $('trNetRect'); els.straps = $('trStraps');
    slotEls = TR.LOAD.map((_, i) => $(`tl-${i}`));
    flyEls = [0, 1, 2].map((c) => $(`tf-${c}`));
  }
  function buildActors() {
    const a = $('actors'); a.innerHTML = ''; crews = [];
    SW.CREW_LOOK.forEach((look) => { const cr = SW.crew.create(look); cr.g.setAttribute('opacity', '0'); a.appendChild(cr.g); crews.push(cr); });
    pairUse = document.createElementNS(SVGNS, 'use'); pairUse.setAttribute('visibility', 'hidden'); a.appendChild(pairUse);
  }

  /* ======================= sizing (px) ======================= */
  function applyLayout() {
    const { W, H, S0, ts, B } = L;
    ['fgstack', 'fgstackL'].forEach((id) => { $(id).style.width = W + 'px'; $(id).style.height = H + 'px'; $(id).style.transformOrigin = '0 100%'; });
    $('bgstack').style.transformOrigin = '50% 100%';
    segEls.forEach((e, i) => {
      [e, segElsN[i]].forEach((el) => { if (el) { el.style.left = ((el._x0 - L.X_MIN) * S0) + 'px'; el.style.width = (el._w * S0) + 'px'; el.style.height = (520 * S0) + 'px'; } });
    });
    ['lyMid', 'lyMidN'].forEach((id) => { const e = $(id); e.style.width = (e._len * S0) + 'px'; e.style.height = (520 * S0) + 'px'; e.style.left = '0px'; });
    ['truck', 'truckLights'].forEach((id) => {
      const t = $(id);
      t.style.width = (RIG.w * ts) + 'px'; t.style.height = (RIG.h * ts) + 'px';
      t.style.left = (L.truckLeft + RIG.x * ts) + 'px';
      t.style.bottom = (42 * S0 - 20 * ts) + 'px';      /* the svg's bottom edge sits 20 local units under the road */
    });
    $('actors').style.width = W + 'px'; $('actors').style.height = H + 'px';
    const gf = $('groundFill'); if (gf) gf.style.height = L.lift ? (L.lift + 48) + 'px' : '0px';
    BG_LAYERS.forEach(([id]) => [$(id), $(id + 'N')].forEach((e) => {
      e.style.width = ((e._xb - e._xa) * B) + 'px'; e.style.height = (900 * B) + 'px'; e.style.left = (W / 2 + (e._xa - 800) * B) + 'px';
    }));
    ['lySun', 'lyStars'].forEach((id) => { const e = $(id); e.style.width = (1600 * B) + 'px'; e.style.height = (900 * B) + 'px'; e.style.left = (W / 2 - 800 * B) + 'px'; });
    /* skies: gradient stops pinned to the horizon so the sunrise lines up with the mountains */
    const horizon = H - (900 - 640) * B + L.bgShift;
    SW.SKY_ORDER.forEach((name) => {
      const stops = SW.SKY[name].map(([o, c]) => `${c} ${f(horizon - (1 - o) * 640 * B)}px`).join(',');
      $('sky-' + name).style.background = `linear-gradient(to bottom, ${stops}, ${SW.SKY[name][SW.SKY[name].length - 1][1]} 100%)`;
    });
    trackTop = track.offsetTop; trackH = track.offsetHeight;
  }
  function setTrackHeight() {
    track.style.height = '';
    trackTop = track.offsetTop; trackH = track.offsetHeight;
  }

  /* ======================= sun, moon, time of day ======================= */
  function lerpColor(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = (sh) => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, t));
    return `rgb(${c(16)},${c(8)},${c(0)})`;
  }
  function sunState(ph) {
    const up = clamp(ph / .86, 0, 1);
    return { x: lerp(960, 640, up), y: up < .5 ? lerp(548, 150, Math.sin(Math.PI / 2 * up / .5)) : lerp(150, 612, Math.pow((up - .5) / .5, 1.6)), vis: 1 - smooth(.8, .88, ph) };
  }
  function updateSky(ph) {
    let i = 0; const at = SW.SKY_AT;
    while (i < at.length - 2 && ph > at[i + 1]) i++;
    const t = clamp((ph - at[i]) / (at[i + 1] - at[i]), 0, 1);
    SW.SKY_ORDER.forEach((name, j) => { const o = j <= i ? 1 : j === i + 1 ? smooth(0, 1, t) : 0; setIf($('sky-' + name), 'sk' + name, o.toFixed(3), (e, v) => { e.style.opacity = v; }); });
    const s = sunState(ph), sun = $('sunG');
    const hot = clamp(1 - smooth(.08, .26, ph) + smooth(.40, .62, ph), 0, 1);
    const disc = lerpColor('#fffaf0', '#ffb070', hot), glowC = lerpColor('#ffffff', '#ff9a5a', hot);
    setIf(sun, 'sun', `${f(s.x)}|${f(s.y)}|${s.vis.toFixed(2)}|${hot.toFixed(2)}`, () => {
      const d = $('sunDisc'), gl = $('sunGlow');
      d.setAttribute('cx', f(s.x)); d.setAttribute('cy', f(s.y)); d.setAttribute('fill', disc); d.setAttribute('r', f(lerp(38, 50, hot)));
      gl.setAttribute('cx', f(s.x)); gl.setAttribute('cy', f(s.y)); gl.setAttribute('r', f(lerp(380, 620, hot)));
      const st = $('sunGlowG').querySelectorAll('stop'); st[0].setAttribute('stop-color', glowC); st[1].setAttribute('stop-color', lerpColor('#ffffff', '#ff7a3a', hot));
      sun.setAttribute('opacity', s.vis.toFixed(2));
    });
    setIf($('moonG'), 'moon', smooth(.86, .96, ph).toFixed(2), (e, v) => e.setAttribute('opacity', v));
    setIf($('lyStars'), 'stars', smooth(.72, .92, ph).toFixed(2), (e, v) => { e.style.opacity = v; });
    const dayC = smooth(.10, .26, ph) * (1 - smooth(.46, .62, ph));
    const a = 1 - dayC * .95, b = dayC;
    nightW = smooth(.66, .93, ph);
    const nightOn = nightW > .002, dayOff = nightW > .998;
    BG_LAYERS.forEach(([id]) => {
      const op = id === 'lyCloudsA' ? a : id === 'lyCloudsB' ? b : 1;
      const d = $(id), n = $(id + 'N');
      setIf(d, 'op' + id, op.toFixed(3) + (dayOff ? 'h' : 'v'), (e) => { e.style.opacity = op; e.style.visibility = dayOff || op < .003 ? 'hidden' : 'visible'; });
      setIf(n, 'opn' + id, (op * nightW).toFixed(3), (e) => { e.style.opacity = op * nightW; e.style.visibility = nightOn && op > .003 ? 'visible' : 'hidden'; });
    });
    setIf($('worldN'), 'wN', nightW.toFixed(3), (e, v) => { e.style.opacity = v; e.style.visibility = nightOn ? 'visible' : 'hidden'; $('lyMidN').style.opacity = v; $('lyMidN').style.visibility = nightOn ? 'visible' : 'hidden'; $('world').style.visibility = dayOff ? 'hidden' : 'visible'; $('lyMid').style.visibility = dayOff ? 'hidden' : 'visible'; });
    ['day', 'gold', 'dusk'].forEach((k) => { const o = SW.trap(SW.GRADES[k], ph); setIf($('grade-' + k), 'g' + k, o.toFixed(3), (e, v) => { e.style.opacity = v; }); });
    /* the rig and the crew sit between layers, so they are graded with a colour matrix instead. It scales each channel
       (a straight line from daylight to moonlight), so skin and paint never pass through a wrong hue on the way. */
    const dusk = SW.trap(SW.GRADES.dusk, ph), gold = SW.trap(SW.GRADES.gold, ph);
    const rr = (1 - .60 * nightW) * (1 - .10 * dusk) * (1 + .03 * gold);
    const gg = (1 - .50 * nightW) * (1 - .24 * dusk) * (1 - .03 * gold);
    const bb = (1 - .26 * nightW) * (1 - .10 * dusk) * (1 - .16 * gold);
    const key = [rr, gg, bb].map((v) => v.toFixed(3)).join(' ');
    setIf($('truck'), 'flt', key, (e, v) => {
      const dark = nightW > .01 || dusk > .01 || gold > .01;
      const m = $('rigGradeM');
      if (m) m.setAttribute('values', `${rr.toFixed(3)} 0 0 0 0  0 ${gg.toFixed(3)} 0 0 0  0 0 ${bb.toFixed(3)} 0 0  0 0 0 1 0`);
      const fl = dark ? 'url(#rigGrade)' : 'none';
      e.style.filter = fl; crews.forEach((c) => { c.g.style.filter = fl; });
    });
    const beam = .1 + .5 * (1 - smooth(0, .14, ph)) + .22 * Math.exp(-Math.pow((ph - .6) / .1, 2)) + .9 * smooth(.62, .92, ph);
    setIf($('truckLights'), 'tl', clamp(beam, 0, 1).toFixed(3), (e, v) => { e.style.opacity = v; });
  }

  /* ======================= the crew =======================
     planCrew() lays the whole job out as a schedule on a virtual clock (seconds). Each piece of the pile has the
     people it needs: a couch, fridge or mattress is a two-person lift (one at each end, facing each other, the
     one in front walking backwards), an armchair or a box is one person. A pair is always free at the same moment,
     the third person works in parallel, and pieces still land in strict load order. After the last piece: net,
     straps, gate, then everyone climbs in. crewAt() evaluates one person at one time, so the scene scrubs freely. */
  const carryY = (it) => it.gy;
  const itemTf = (type, g, sc, rot) => `translate(${f(g[0])} ${f(g[1])}) rotate(${rot || 0}) scale(${f(ITEM_K * (sc || 1))}) translate(0 ${f(SW.ITEM_DIM[type].h / 2)})`;
  const depthAngle = (dy, dx) => clamp(Math.atan2(dy * 1.6, Math.abs(dx) || 1), -.5, .5);
  const HOIST_Y = 138, LAND = .86, RELEASE = .52, GRIP = 27, HOIST_F_SOLO = 36;

  function planCrew() {
    const { S0, ts, H } = L, gp = L.groundPx;
    const rigX = (lx) => L.truckLeft + lx * ts;
    const nearY = (k) => gp + (10 + 3 * k) * ts;
    const nearS = (k) => ts * SW.depth(478 + 10 + 3 * k);
    const WALK = 270, CARRY = 255, JOG = 470, JOGK = 1.7, DEP = .1, T_PICK = .55, T_HOIST = .92, CLEAR = .45;
    const cmd = (a, b) => Math.hypot(b.x - a.x, (b.y - a.y) * 2) / (PXCM * (a.s + b.s) / 2);
    const segs = [[], [], []];
    /* they arrive from the left edge, already beside the pile: no time spent walking across the lawn */
    const doorY = H - (520 - 392) * S0, doorS = SW.depth(392) * ts, pileX0 = (HERO.pileX - L.cam0) * S0;
    /* each one starts at least a body-width and a half from the next, in the order of where they are heading (left end of the couch,
       right end, the armchair), so nobody has to cross anybody to get to their piece */
    const START_X = [-260, 100, -28];
    /* depth: how far in front of an object's centre line (toward the camera) someone stands to clear it, in screen px for a gap in cm */
    const laneGap = (cm, s) => cm * PXCM * s / 2;
    const couch0 = HERO.pile[0], sC = SW.depth(couch0.y) * ts, cyC = H - (520 - couch0.y) * S0;
    const FRONT_Y = cyC + laneGap(61, sC);          /* the near-side lane: clear of the couch's depth and a body's width */
    const at = [0, 1, 2].map((c) => ({ x: pileX0 + START_X[c] * S0, y: c === 2 ? FRONT_Y : doorY + c * 1.5 * ts, s: c === 2 ? sC : doorS }));
    const clock = [.06, .06, 0];
    const hoistEnd = [];
    const info = [], entered = [false, false, false];
    const landOf = [];

    /* generic segments for one person */
    /* how much gait a walking segment shows: it eases in and out over the first and last fifth, and a very short hop barely steps at all,
       so the hips never jump from standing to full stride and back inside a few frames */
    const gaitEnv = (u, dur) => { const e = clamp(.16 / dur, .3, .5); return smooth(0, e, u) * (1 - smooth(1 - e, 1, u)) * clamp((dur - .1) / .35, 0, 1); };
    const walk = (c, P0, P1, dur, o) => {
      o = o || {};
      const left = P1.x < P0.x, th0 = (o.th || 0) + c * 1.3, back = !!o.back, fade = !entered[c], sk = o.stride || 1.55; entered[c] = true;
      const seg = { t0: clock[c], t1: clock[c] + dur, ev(u) {
        const e = o.even ? lerp(u, u * u * (3 - 2 * u), .45) : u * u * (3 - 2 * u), x = lerp(P0.x, P1.x, e), y = lerp(P0.y, P1.y, e), s = lerp(P0.s, P1.s, u);
        const w = { x, y, s }, d = depthAngle(P1.y - P0.y, P1.x - P0.x);
        const yaw = o.yaw != null ? o.yaw : (left ? PI - d : d);
        const st = { x, y, s, vis: o.vis ? o.vis(u) : fade ? clamp(u * 7, 0, 1) : 1, carry: o.carry || '', pair: o.pair != null ? o.pair : -1, rot: o.rot || 0, sc: o.sc || 1,
          o: { yaw, theta: (back ? -1 : 1) * SW.crew.phase(cmd(P0, w), sk) + th0, amp: gaitEnv(u, dur), effort: o.effort || 0, stride: sk } };
        if (o.carry || o.pair != null && o.pair >= 0) Object.assign(st.o, { carry: true, gy: o.gy, gf: GRIP, gl: 15, gm: 1, lean: o.pair >= 0 ? 0 : -8 });
        return st;
      } };
      segs[c].push(seg); clock[c] += dur; return seg;
    };
    const idle = (c, P, dur, yaw, fn) => {
      const shown = entered[c];       /* a wait before someone's first walk is out of sight: they have not arrived yet */
      const seg = { t0: clock[c], t1: clock[c] + dur, ev(u) { return { x: P.x, y: P.y, s: P.s, vis: shown ? 1 : 0, carry: '', pair: -1, rot: 0, sc: 1, o: Object.assign({ yaw, theta: 0, amp: 0 }, fn ? fn(u) : {}) }; } };
      segs[c].push(seg); clock[c] += dur; return seg;
    };

    /* the armchair goes in first (one person, and the shorter carry), then the couch pair comes in behind them */
    [1, 0].forEach((i) => {
      const it = HERO.pile[i];
      const ids = it.crew, K = ids.length, ct = it.ct || it.t, dim = SW.ITEM_DIM[ct], sc = it.sc;
      const rotC = it.carryRot || 0, lenU = (rotC ? dim.h : dim.w) * sc, thickU = (rotC ? dim.w : dim.h) * sc;
      const slot = TR.LOAD[i], slotC = TR.center(slot);
      const sP = SW.depth(it.y) * ts;
      const cx0 = (HERO.pileX + it.dx - L.cam0) * S0, cy0 = H - (520 - it.y) * S0;
      const gy = it.gy;
      const lowG = clamp(((it.up || 0) + dim.h * sc / 2) * ITEM_K, 16, 96), bMax = clamp((70 - lowG) / 46, 0, 1);
      /* where each person stands at each stage (a pair: role 0 is the rear of the carry and faces the trailer, role 1 leads, walking backwards) */
      const grasp = ids.map((c, k) => {
        if (K === 1) return { x: cx0 + GRIP * PXCM * sP, y: cy0 + laneGap(53, sP), s: sP };   /* one person stands in front of the piece, not inside it */
        const off = lenU * sP / 2 + GRIP * PXCM * sP;
        return { x: cx0 + (k ? off : -off), y: cy0 + (4 + 3 * k) * ts, s: sP };
      });
      const hoist = ids.map((c, k) => {
        const s = nearS(c), xc = rigX(slotC.x);
        if (K === 1) return { x: xc - HOIST_F_SOLO * PXCM * s, y: nearY(c), s };
        const off = lenU * s / 2 + GRIP * PXCM * s;
        return { x: xc + (k ? off : -off), y: nearY(k ? ids[1] : ids[0]), s };
      });
      /* timing: everyone involved starts together */
      const t0 = Math.max.apply(null, ids.map((c) => clock[c]));
      ids.forEach((c) => { if (t0 - clock[c] > .05) idle(c, at[c], t0 - clock[c], PI - .12); });
      const dOut = Math.max.apply(null, ids.map((c, k) => cmd(at[c], grasp[k]) / WALK));
      const dCar = Math.max.apply(null, ids.map((c, k) => cmd(grasp[k], hoist[k]) / CARRY));
      const landRaw = t0 + dOut + T_PICK + dCar + LAND * T_HOIST;
      /* the couch's lifters stand where the armchair's hoist spot is, so they only arrive once that person has finished and stepped clear */
      const needH = Math.max.apply(null, [0].concat((it.clear || []).map((d) => hoistEnd[d] + CLEAR + LAND * T_HOIST)));
      const need = Math.max(needH, Math.max.apply(null, [0].concat((it.after || []).map((d) => landOf[d] + DEP))));
      const wait = Math.max(0, need - landRaw);
      if (wait > .05) ids.forEach((c) => idle(c, at[c], wait, PI - .12));
      const tStart = t0 + wait;
      const dir = ids.map((c, k) => (K === 1 ? PI : (k ? PI : 0)));     /* facing while carrying: role 0 faces right, role 1 faces left, solo faces the trailer */
      let tPick = 0, tHoist = 0;
      ids.forEach((c, k) => {
        /* a pair arrives from just outside its end of the couch: the lead man from the right, the other from the left (never from across the furniture) */
        if (K === 2 && !entered[c]) at[c] = { x: grasp[k].x + (k ? 34 : -120) * S0, y: doorY + k * 1.5 * ts, s: doorS };
        const P0 = at[c], G = grasp[k], Hs = hoist[k];
        const yawOut = PI - depthAngle(G.y - P0.y, G.x - P0.x);
        /* approach */
        walk(c, P0, G, dOut);
        /* pick: squat, grasp at 40%, rise (a pair turns to face each other as they arrive) */
        tPick = clock[c];
        const face0 = K === 2 && k === 0 ? 0 : yawOut, faceEnd = K === 1 ? PI - depthAngle(G.y - P0.y, G.x - P0.x) : dir[k];
        const yawBack = K === 1 ? depthAngle(P0.y - G.y, P0.x - G.x) : dir[k];
        const pick = { t0: clock[c], t1: clock[c] + T_PICK, ev(u) {
          const st = { x: G.x, y: G.y, s: G.s, vis: 1, carry: '', pair: -1, rot: 0, sc, o: null };
          const turn = K === 2 && k === 0 ? smooth(0, .32, u) : 1;
          const yawNow = K === 2 ? (k === 0 ? lerp(yawOut, 0, easeInOut(turn)) : PI) : yawOut;
          if (u < .40) { const w = u / .40; st.o = { yaw: yawNow, theta: 0, amp: 0, b: bMax * smooth(0, 1, w), gy: lowG, gabs: 1, gf: GRIP, gl: 15, gm: smooth(.15, .85, w), headPitch: 6, effort: .3 * w }; }
          else {
            const r = (u - .40) / .60;
            const yawK = K === 1 ? lerp(yawOut, yawBack, easeInOut(clamp((r - .05) / .9, 0, 1))) : yawNow;
            if (K === 1) st.carry = ct; else st.pair = i;
            st.rot = rotC * smooth(0, 1, r);
            st.o = { yaw: yawK, theta: 0, amp: 0, b: bMax * (1 - smooth(0, .85, r)), gy: lerp(lowG, gy, smooth(0, 1, r)), gabs: 1 - smooth(0, 1, r), gf: GRIP, gl: 15, gm: 1, lean: K === 1 ? -8 * smooth(.3, 1, r) : 0, headLead: K === 1 ? -.18 * Math.sin(PI * r) : 0, carry: true, effort: K === 2 ? .6 : .25 };
          }
          return st;
        } };
        segs[c].push(pick); clock[c] += T_PICK;
        /* carry to the trailer */
        walk(c, G, Hs, dCar, { carry: K === 1 ? ct : '', pair: K === 2 ? i : -1, gy, rot: rotC, sc, th: 1.1, back: K === 2 && k === 1, yaw: K === 2 ? dir[k] : undefined, effort: K === 2 ? .55 : .2 });
        /* hoist: raise it over the rail, let go, it falls into its slot */
        tHoist = clock[c];
        const hoistSeg = { t0: clock[c], t1: clock[c] + T_HOIST, hoist: true, ev(u) {
          const l = smooth(0, .46, u), rel = smooth(RELEASE, RELEASE + .2, u), turn = K === 1 ? easeInOut(clamp((u - .74) / .26, 0, 1)) : 0;
          const held = u < RELEASE;
          const yaw = K === 1 ? lerp(.05, PI - .1, turn) : dir[k];
          const o = { yaw, theta: 0, amp: 0, carry: true, gy: lerp(gy, HOIST_Y, l), gf: K === 1 ? lerp(GRIP, HOIST_F_SOLO, l) : GRIP, gl: 15, gm: held ? 1 : 1 - rel, lean: K === 1 ? lerp(-8, -3, l) * (1 - smooth(.5, 1, u)) : 0, headPitch: 10 * l * (1 - smooth(.5, .8, u)), effort: K === 2 ? .9 * (1 - smooth(.55, .85, u)) : .5 * (1 - smooth(.55, .85, u)) };
          return { x: Hs.x, y: Hs.y, s: Hs.s, vis: 1, carry: held && K === 1 ? ct : '', pair: held && K === 2 ? i : -1, rot: rotC, sc, o, u };
        } };
        segs[c].push(hoistSeg); clock[c] += T_HOIST;
        at[c] = Hs;
        if (k === 0) info[i] = { c: ids[0], ids, K, tPick0: tPick, slideY: K === 1 ? (laneGap(53, sP) - 3 * ts) / S0 : 0, tGrasp: tPick + .40 * T_PICK, tLand: tHoist + LAND * T_HOIST, tRelease: tHoist + RELEASE * T_HOIST, ct, hoist: hoistSeg, slot, slotC, sc, rotC, up: it.up || 0, gyH: HOIST_Y };
      });
      landOf[i] = tHoist + LAND * T_HOIST; hoistEnd[i] = tHoist + T_HOIST;
    });
    const T_load = Math.max(clock[0], clock[1], clock[2]) + .1;

    /* closing up: one person swings the gate shut, the others head straight for the cab, then everyone climbs in */
    let T_secure = 1, S = T_load;
    const RAMP0 = S + .05, RAMP1 = S + .3;
    const rearA = { x: rigX(TR.G.BOX_L - 62), y: nearY(0), s: nearS(0) };
    const door = (c) => ({ x: rigX(305 + c * 66), y: nearY(c), s: nearS(c) });
    const goTo = (c, P, tArrive, o) => {
      const d = cmd(at[c], P) / JOG, start = Math.max(clock[c], tArrive - d);
      if (start > clock[c] + .05) idle(c, at[c], start - clock[c], PI - .1);
      walk(c, at[c], P, d, Object.assign({ stride: JOGK, even: true }, o)); at[c] = P;
    };
    const push = (u) => ({ carry: true, gy: lerp(60, 96, smooth(.2, .8, u)), gf: 30, gl: 16, gm: 1, lean: 4 * Math.sin(PI * u), effort: .5 });
    goTo(0, rearA, RAMP0 - .1); idle(0, rearA, .22, .1, push);
    /* everyone jogs back to the cab at a real jogging stride; the closing part is as long as the last person needs */
    [0, 1, 2].forEach((c) => {
      const P = door(c), d = cmd(at[c], P) / JOG;
      walk(c, at[c], P, d, { vis: (u) => 1 - smooth(.78, 1, u), stride: JOGK, even: true });
      at[c] = P;
    });
    T_secure = Math.max(clock[0], clock[1], clock[2]) - S + .05;

    plan = { segs, info, T_load, T_secure, RAMP0, RAMP1, landed: info.map((x) => x.tLand), cursor: [0, 0, 0] };
  }

  function crewAt(c, tv) {
    const list = plan.segs[c];
    if (!list.length || tv < list[0].t0 - .01 || tv > list[list.length - 1].t1 + .01) return null;
    let k = plan.cursor[c];
    if (k >= list.length || list[k].t0 > tv) k = 0;
    while (k < list.length - 1 && list[k].t1 <= tv) k++;
    plan.cursor[c] = k;
    const s = list[k], u = clamp((tv - s.t0) / Math.max(.001, s.t1 - s.t0), 0, 1);
    const st = s.ev(u); st.seg = s; return st;
  }

  /* ======================= load, net, gate, suspension ======================= */
  function trailerPose(it) {
    const d = SW.ITEM_DIM[it.t];
    return it.lie ? { x: it.x + d.h / 2 * it.s, y: it.y - d.w / 2 * it.s, r: -90, s: it.s } : { x: it.x, y: it.y, r: it.r, s: it.s };
  }
  function updateRig(p, tv, dt) {
    const info = plan.info, n = info.length;
    let landed = 0;
    info.forEach((x, i) => {
      const done = tv >= x.tLand;
      if (done) landed++;
      /* a single person stands in front of the piece, not inside it, and as they reach for it the piece is drawn in toward their hands */
      if (x.slideY) { const sl = (smooth(x.tPick0 + .05, x.tGrasp, tv) * x.slideY).toFixed(2); setIf(pileEls[i], 'ps' + i, sl, (el, v) => { if (el) el.setAttribute('transform', `translate(0 ${v})`); }); }
      vis2(pileEls[i], 'pl' + i, tv >= x.tGrasp ? 'hidden' : 'visible');
      vis2(pileElsN[i], 'pn' + i, tv >= x.tGrasp ? 'hidden' : 'visible');
      vis2(slotEls[i], 'sl' + i, done ? 'visible' : 'hidden');
    });
    TR.LOAD.forEach((it, i) => { if (it.pre) vis2(slotEls[i], 'sl' + i, 'visible'); });
    const clutter = (1 - .9 * smooth(0, 1, landed / n)).toFixed(2);
    setIf(null, 'gc', clutter, (e, v) => { ['garageClutterA', 'garageClutterB', 'garageClutterAN', 'garageClutterBN'].forEach((id) => { const g = $(id); if (g) g.setAttribute('opacity', v); }); });
    /* the gate */
    const ramp = 135 * smooth(plan.RAMP0, plan.RAMP1, tv);
    setIf(els.ramp, 'ramp', ramp.toFixed(1), (e, v) => e.setAttribute('transform', `rotate(${v} ${TR.G.BOX_L} ${TR.G.DECK + 6})`));
    /* the suspension: it settles with the weight and rings a little each time a heavy piece lands */
    let sag = 3.2 * clamp(landed / n, 0, 1) * L.ts / .8;
    info.forEach((x) => { const a = tv - x.tLand; if (a > 0 && a < 1.2) sag += 1.1 * (a / .16) * Math.exp(1 - a / .16) * L.ts / .8; });
    return sag;
  }

  /* ======================= per-frame render ======================= */
  function render(p, dt) {
    const { S0, ts, B } = L;
    const tv = tvAt(p), cam = camAt(p), ph = phaseAt(p), fr = frameAt(p);
    L.camNow = cam;
    const prog = clamp((cam - L.cam0) / (L.camFinal - L.cam0), 0, 1);
    L.truckLeftNow = L.truckLeft + splashOff;
    const zoom = fr.z, pan = fr.tx - L.txW;
    setIf($('fgstack'), 'fg', `${f(fr.tx)}|${zoom.toFixed(4)}`, () => { const t = `translate3d(${f(fr.tx)}px,${f(-L.lift)}px,0) scale(${zoom.toFixed(4)})`; $('fgstack').style.transform = t; $('fgstackL').style.transform = t; });
    setIf($('bgstack'), 'bg', `${f(pan)}|${zoom.toFixed(4)}`, () => { $('bgstack').style.transform = `translate3d(${f(pan * .08)}px,${f(L.bgShift)}px,0) scale(${(1 + (zoom - 1) * .35).toFixed(4)})`; });
    const wx = `translate3d(${f((L.X_MIN - cam) * S0)}px,0,0)`;
    css($('world'), 'transform', wx); css($('worldN'), 'transform', wx);
    const midX = `translate3d(${f(-(L.cam0 * S0 + (cam - L.cam0) * FM * S0))}px,0,0)`;
    css($('lyMid'), 'transform', midX); css($('lyMidN'), 'transform', midX);
    const drift = p * 60;
    BG_LAYERS.forEach(([id, key]) => {
      const t = `translate3d(${f(-prog * L.G[key] * B * (id === 'lyCloudsB' ? 1.3 : 1) - (key === 'cloud' ? drift * (id === 'lyCloudsB' ? 1.6 : 1) : 0) + pan * PAN_PAR[key] * .3)}px,0,0)`;
      css($(id), 'transform', t); css($(id + 'N'), 'transform', t);
    });

    /* the rig: pitch under braking, wheel rotation from the distance travelled, settling under the load */
    const speed = dt > 0 ? (cam - camPrev) * S0 / dt : 0;
    camVel += (speed - camVel) * clamp(dt * 9, 0, 1);
    camPrev = cam;
    const pitch = Math.abs(camVel) > 20 ? clamp(-camVel / 2800, -1.0, 1.0) : 0;
    const bump = Math.min(1.2, Math.abs(camVel) / 900) * Math.sin(cam * S0 * .09);
    const sag = updateRig(p, tv, dt);
    const tr = `translate3d(${f(splashOff)}px,${f(bump + sag)}px,0) rotate(${f(pitch)}deg)`;
    ['truck', 'truckLights'].forEach((id) => { $(id).style.transform = tr; });
    const travel = (cam - L.cam0) * S0 + travelBase - splashOff;
    const degT = (travel / (55.5 * ts)) * 57.2958, degR = (travel / (33.3 * ts)) * 57.2958;
    setIf(els.tWheels[0], 'spin', f(degT % 360) + '', () => { els.tWheels.forEach((g) => g.setAttribute('transform', `rotate(${f(degT % 360)})`)); els.rWheels.forEach((g) => g.setAttribute('transform', `rotate(${f(degR % 360)})`)); });
    setIf(els.speed, 'speed', Math.min(.7, Math.max(0, (Math.abs(camVel) - 500) / 2400)).toFixed(2), (el, v) => el.setAttribute('opacity', v));

    updateSky(ph);
    updateCrew(tv);
    updateUI(p);
    cullSegments(cam);
  }

  function updateCrew(tv) {
    const { ts } = L, gp = L.groundPx;
    flyEls.forEach((u) => u.setAttribute('visibility', 'hidden'));
    pairUse.setAttribute('visibility', 'hidden');
    const S = crews.map((cr, c) => {
      const st = tv < -.5 ? null : crewAt(c, tv);
      if (!st) { cr.g.setAttribute('opacity', '0'); cr.rig.setItem(''); return null; }
      const pc = PXCM * st.s * cr.h;
      cr.g.setAttribute('transform', `translate(${f(st.x)} ${f(st.y)}) scale(${f(pc)})`);
      cr.g.setAttribute('opacity', st.vis.toFixed(2));
      st.o.breath = Math.sin(tv * 2.3 + c * 1.9);
      const r = SW.crew.apply(cr, st.o);
      if (st.carry && r.grip) cr.rig.setItem(st.carry, itemTf(st.carry, r.grip, st.sc, st.rot)); else cr.rig.setItem('');
      return { st, r, pc };
    });
    /* a two-person piece is drawn once, between its two carriers, centred on the midpoint of their hands */
    const pairs = {};
    S.forEach((e) => { if (e && e.st.pair >= 0 && e.r.grip) (pairs[e.st.pair] = pairs[e.st.pair] || []).push(e); });
    Object.keys(pairs).forEach((k) => {
      const a = pairs[k]; if (a.length < 2) return;
      const inf = plan.info[k];
      const cx = (a[0].st.x + a[0].r.grip[0] * a[0].pc + a[1].st.x + a[1].r.grip[0] * a[1].pc) / 2, cy = (a[0].st.y + a[0].r.grip[1] * a[0].pc + a[1].st.y + a[1].r.grip[1] * a[1].pc) / 2;
      const sPx = (a[0].st.s + a[1].st.s) / 2;
      pairUse.setAttribute('href', '#it-' + inf.ct); pairUse.setAttribute('visibility', 'visible');
      pairUse.setAttribute('transform', `translate(${f(cx)} ${f(cy)}) rotate(${f(a[0].st.rot)}) scale(${f(sPx * inf.sc)}) translate(0 ${f(SW.ITEM_DIM[inf.ct].h / 2)})`);
      pairUse.style.filter = $('truck').style.filter;
    });
    /* the piece that has just been let go falls from the hands into its slot, behind the trailer's near side panel */
    plan.info.forEach((x, i) => {
      if (tv < x.tRelease || tv >= x.tLand) return;
      const es = x.ids.map((c) => S[c]); if (es.some((e) => !e)) return;
      const q = clamp((tv - x.tRelease) / (x.tLand - x.tRelease), 0, 1);
      let cx = 0, cy = 0;
      es.forEach((e) => {
        const o = Object.assign({}, e.st.o, { gm: 1, gy: x.gyH, carry: true });
        if (x.K === 1) { o.gf = 36; o.yaw = .05; }
        const g = SW.crew.solve(o).grip; cx += e.st.x + g[0] * e.pc; cy += e.st.y + g[1] * e.pc;
      });
      cx /= es.length; cy /= es.length;
      const dimh = SW.ITEM_DIM[x.ct].h, s0 = (es[0].st.s / ts) * x.sc, P = x.slotC, r1 = x.slot.lie ? -90 : x.slot.r;
      const x0 = (cx - L.truckLeft) / ts, y0 = (cy - gp) / ts, qx = easeOut(q), qy = q * q;
      const fe = flyEls[i % flyEls.length];
      fe.setAttribute('href', '#it-' + x.ct);
      fe.setAttribute('transform', `translate(${f(lerp(x0, P.x, qx))} ${f(lerp(y0, P.y, qy))}) rotate(${f(lerp(x.rotC, r1, qx))}) scale(${f(lerp(s0, x.slot.s, qx))}) translate(0 ${f(dimh / 2)})`);
      fe.setAttribute('visibility', 'visible');
    });
  }

  function cullSegments(cam) {
    const { S0, W } = L;
    segEls.forEach((e, i) => {
      const x0 = (e._x0 - cam) * S0, x1 = x0 + e._w * S0, on = x1 > -W * .35 && x0 < W * 1.5;
      setIf(e, 'seg' + i, on ? 1 : 0, (el, val) => { el.style.display = val ? '' : 'none'; if (segElsN[i]) segElsN[i].style.display = val ? '' : 'none'; });
    });
  }

  /* ======================= hero copy, finale card ======================= */
  let cards = [];
  function updateUI(p) {
    const hold = parts.hold, fin = parts.finale;
    /* the headline and buttons stay put for the whole run; there is no second card */
    const heroO = 1;
    setIf($('heroCopy'), 'hero', heroO.toFixed(3), (e, v) => { e.style.setProperty('--hero', v); e.style.transform = `translate3d(0,${f(-(1 - v) * 26)}px,0)`; e.style.pointerEvents = v < .1 ? 'none' : ''; });
    setIf(stage, 'riding', p > .004 ? 1 : 0, (e, v) => e.classList.toggle('riding', !!v));
    setIf(stage, 'ended', p > .985 ? 1 : 0, (e, v) => e.classList.toggle('ended', !!v));
    setIf($('vig'), 'vig', heroO.toFixed(3), (e, v) => { e.style.opacity = v; });
    const on = p > fin.p0 + (fin.p1 - fin.p0) * .1 ? 1 : 0;
    setIf(stage, 'card', on, (e, v) => cards.forEach((c) => { c.classList.toggle('on', !!v); c.setAttribute('aria-hidden', v ? 'false' : 'true'); c.inert = !v; }));
  }

  /* ======================= playback =======================
     idle    the hero rests on its headline (page scrolling is how you start it)
     playing the scene runs on a clock; scrolling is held until it ends
     done    the end frame; the page scrolls normally                                */
  let mode = 'idle', t0 = 0, arm = () => {}, disarm = () => {};
  const playMs = () => total * 1000;
  function tick(now) {
    const dt = Math.min(.05, Math.max(0, (now - lastT) / 1000) || .016); lastT = now;
    if (mode === 'playing') {
      ps = clamp((now - t0) / playMs(), 0, 1);
      render(ps, dt);
      if (ps >= 1) { finish(); } else { requestAnimationFrame(tick); return; }
    }
    render(ps, dt);
    if (Math.abs(camVel) > 3) { requestAnimationFrame(tick); } else { running = false; camVel = 0; }
  }
  function kick() { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(tick); } }
  function setMode(m) { mode = m; html.setAttribute('data-hero', m); }
  function start() {
    if (mode !== 'idle' || reduce) return;
    if (SW.splash && SW.splash.active) return;
    setMode('playing'); t0 = performance.now(); setCue();
    kick();
  }
  function finish() {
    if (mode === 'done') return;
    ps = 1; setMode('done'); disarm(); render(1, 0); setCue();
  }
  function replay() { ps = 0; setMode('idle'); render(0, 0); start(); }
  function setCue() {
    const c = $('cueText'); if (!c) return;
    c.textContent = 'Keep scrolling';
  }
  R.go = function () { finish(); };
  R.setSplashOffset = (off) => { splashOff = off; if (!running && L) render(ps, 0); };

  /* the show starts by itself as soon as the page is ready (after the intro splash, if there is one); the page is never held:
     scrolling at any moment simply carries the visitor past the scene, which keeps playing on its own clock */
  function wireIntent() {
    arm = () => {}; disarm = () => {};
    const skip = $('skip');
    skip.addEventListener('click', (e) => { if (mode === 'playing') { e.preventDefault(); finish(); } });
    const rp = $('replay'); if (rp) rp.addEventListener('click', replay);
  }

  /* ======================= boot ======================= */
  function setup(first) {
    computeLayout();
    if (first) {
      const defs = SW.defs() + SW.truck.defs() + SW.trailer.defs() + '<linearGradient id="midHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb67c" stop-opacity="0"/><stop offset="1" stop-color="#ff9d68" stop-opacity=".22"/></linearGradient>';
      SW.night.register(defs);
      $('spriteDefs').innerHTML = defs + SW.night.defs(defs) + SW.itemDefs() + SW.itemDefsNight() + '<filter id="rigGrade" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feColorMatrix id="rigGradeM" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>';
      buildWorld(); buildRig(); buildActors();
    }
    planCrew(); buildTimeline();
    buildBackdrop();
    applyLayout(); setTrackHeight();
  }
  R.init = function () {
    stage = $('stage'); track = $('ride');
    reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    html.classList.add(reduce ? 'ride-off' : 'ride-on');
    const wn = document.createElement('div'); wn.className = 'world nt'; wn.id = 'worldN'; $('world').after(wn);
    setup(true);
    cards = Array.from(document.querySelectorAll('.ticket'));
    cards.forEach((c) => { c.inert = true; c.setAttribute('aria-hidden', 'true'); });
    /* the nav is clear over the hero and turns solid once the page scrolls away from it */
    const nav = document.querySelector('.nav');
    const navCheck = () => { nav.classList.toggle('solid', (window.pageYOffset || 0) > stage.clientHeight * .7); };
    window.addEventListener('scroll', navCheck, { passive: true }); window.addEventListener('resize', navCheck); navCheck();
    camPrev = camAt(0);
    /* arriving partway down the page (a reload, an anchor link) shows the finished scene and never locks the page */
    const deep = (window.pageYOffset || 0) > stage.clientHeight * .5;
    if (reduce) { setMode('idle'); ps = 0; render(0, 0); return; }
    ps = deep ? 1 : 0; setMode(deep ? 'done' : 'idle'); render(ps, 0); setCue();
    wireIntent();
    if (!(SW.splash && SW.splash.active) && mode === 'idle') start();   /* with no intro splash the scene begins at once; the splash starts it when it ends */
    /* once the hero has scrolled well away, stop painting it: its layers are the biggest thing on the page and phones reclaim the memory */
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { stage.style.visibility = e.isIntersecting ? '' : 'hidden'; }), { rootMargin: '30% 0px 30% 0px' }).observe(stage);
    let rt = 0, lw = innerWidth, lh = innerHeight;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        /* only a real change of shape (a rotation, a resized window) rebuilds the scene; a browser bar sliding in or out just re-fits it */
        if (Math.abs(innerWidth - lw) < 2 && Math.abs(innerHeight - lh) < .3 * lh) { applyLayout(); setTrackHeight(); render(ps, 0); return; }
        lw = innerWidth; lh = innerHeight; cache = {};
        const t = mode === 'playing' ? (performance.now() - t0) : 0;
        setup(false);
        if (mode === 'playing') t0 = performance.now() - ps * playMs();
        render(ps, 0); void t;
        if (SW.splash && SW.splash.relayout) SW.splash.relayout();
      }, 180);
    });
    kick();
  };
  R.state = () => ({ p: ps, cam: L && L.camNow, parts, total, L, plan });
  R.setP = (p) => { setMode('manual'); ps = p; render(p, 0); };   /* dev: pose the scene at a fixed point */
  R.mode = () => mode;
  R.start = start;
})(window.SW);
