/* ============================================================================
   Swift Junk Removal: core helpers, shared SVG defs, time-of-day tables.
   Classic script (no modules) so the page also works from file://.
   Everything hangs off window.SW.
   ========================================================================== */
window.SW = window.SW || {};
(function (SW) {
  'use strict';

  SW.$ = (id) => document.getElementById(id);
  SW.f = (n) => Math.round(n * 10) / 10;
  SW.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  SW.lerp = (a, b, t) => a + (b - a) * t;
  SW.smooth = (a, b, t) => { t = SW.clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  SW.easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  SW.easeOut = (t) => 1 - Math.pow(1 - t, 3);
  /* seeded RNG: every load draws exactly the same neighbourhood */
  SW.mk = (seed) => () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  /* ---------- the one place the world's geometry is defined (fg units) ----------
     house base 346, block-wall top 286, sidewalk 372-404, curb 404-412, road from 412,
     truck wheels touch the road at 478, svg is 520 tall and bottom-anchored. */
  SW.G = { H: 520, BASE: 346, WALL: 286, WALK0: 372, WALK1: 404, ROAD: 412, GROUND: 478, TRUCK_S: .88 };
  /* depth scale: things nearer the camera (further down the screen) draw bigger */
  SW.depth = (y) => SW.clamp(.42 + (y - 346) / (478 - 346) * .58, .4, 1.04);

  /* ---------- sky palettes, one per time of day (stops at fractions of the 640-unit sky) ---------- */
  SW.SKY = {
    dawn:  [[0, '#060a16'], [.2, '#0e1733'], [.4, '#26295a'], [.56, '#5d4577'], [.68, '#b85d58'], [.8, '#ef8a57'], [.9, '#f8bb83'], [1, '#fcdba8']],
    day:   [[0, '#2358ad'], [.3, '#3f86d6'], [.6, '#79b6ea'], [.85, '#bfe0f5'], [1, '#eef1e4']],
    gold:  [[0, '#26357a'], [.28, '#4a4f98'], [.5, '#9a6a9c'], [.68, '#e5835a'], [.84, '#ffb870'], [1, '#ffe2a5']],
    dusk:  [[0, '#0a0e2c'], [.25, '#1b1f55'], [.5, '#4a3475'], [.68, '#a4466b'], [.82, '#e0704f'], [.92, '#f59a5a'], [1, '#f9b872']],
    night: [[0, '#03050e'], [.35, '#060c20'], [.65, '#0d1736'], [.85, '#17244a'], [1, '#2a2d58']],
  };
  SW.SKY_ORDER = ['dawn', 'day', 'gold', 'dusk', 'night'];
  /* phase (0..1 over the whole ride) at which each sky is fully shown */
  SW.SKY_AT = [0, .30, .60, .80, 1];

  /* grade overlays: [phase where it starts, peaks, fades out] and the colour laid over the scene */
  SW.GRADES = {
    day:   { a: .10, b: .30, c: .52, d: .66, color: 'rgba(214,232,250,.16)' },
    gold:  { a: .44, b: .62, c: .70, d: .80, color: 'rgba(255,146,64,.20)' },
    dusk:  { a: .66, b: .80, c: .84, d: .92, color: 'rgba(78,44,128,.34)' },
    night: { a: .80, b: .96, c: 1.1, d: 1.2, color: 'rgba(5,10,34,.66)' },
  };
  SW.trap = (g, p) => (p <= g.a ? 0 : p < g.b ? SW.smooth(g.a, g.b, p) : p <= g.c ? 1 : p < g.d ? 1 - SW.smooth(g.c, g.d, p) : 0);

  /* ---------- shared defs (gradients, patterns, filters), injected once into #sprite ---------- */
  SW.defs = function () {
    const r = SW.mk(5);
    let stucco = '', asph = '';
    for (let i = 0; i < 70; i++) stucco += `<circle cx="${SW.f(r() * 64)}" cy="${SW.f(r() * 64)}" r="${SW.f(.5 + r() * .9)}" fill="#1a1030" opacity="${SW.f(.1 + r() * .22)}"/>`;
    for (let i = 0; i < 40; i++) stucco += `<circle cx="${SW.f(r() * 64)}" cy="${SW.f(r() * 64)}" r="${SW.f(.5 + r() * .9)}" fill="#fff" opacity="${SW.f(.08 + r() * .12)}"/>`;
    for (let i = 0; i < 110; i++) asph += `<circle cx="${SW.f(r() * 96)}" cy="${SW.f(r() * 96)}" r="${SW.f(.5 + r() * 1)}" fill="${r() < .5 ? '#b89ab0' : '#05050c'}" opacity="${SW.f(.1 + r() * .22)}"/>`;

    return `
      <pattern id="stuccoPat" width="64" height="64" patternUnits="userSpaceOnUse">${stucco}</pattern>
      <pattern id="asphPat" width="96" height="96" patternUnits="userSpaceOnUse">${asph}</pattern>
      <pattern id="tile" width="14" height="9" patternUnits="userSpaceOnUse">
        <rect width="14" height="9" fill="#a8533a"/>
        <path d="M0 9 Q3.5 2 7 9 Q10.5 2 14 9" fill="none" stroke="#7b3524" stroke-width="1.6"/>
        <path d="M0 4 Q3.5 -2 7 4 Q10.5 -2 14 4" fill="none" stroke="#c4694a" stroke-width="1" opacity=".7"/>
      </pattern>
      <pattern id="tileFar" width="6" height="4" patternUnits="userSpaceOnUse"><path d="M0 4 Q1.5 0 3 4 Q4.5 0 6 4" fill="none" stroke="#000" stroke-opacity=".5" stroke-width=".8"/></pattern>
      <pattern id="slats" width="7" height="10" patternUnits="userSpaceOnUse"><rect width="3.4" height="10" fill="#3a2d42"/><rect x="3.4" width="3.6" height="10" fill="#6a5570"/></pattern>
      <pattern id="chain" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 4.5 L4.5 0 L9 4.5 L4.5 9 Z" fill="none" stroke="#9aa3b8" stroke-width=".9" opacity=".75"/></pattern>

      <linearGradient id="wallA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c7a82"/><stop offset=".6" stop-color="#c79b8a"/><stop offset="1" stop-color="#e8b58f"/></linearGradient>
      <linearGradient id="wallB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8b7188"/><stop offset=".6" stop-color="#b78d8c"/><stop offset="1" stop-color="#dba98f"/></linearGradient>
      <linearGradient id="wallC" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7f8499"/><stop offset=".6" stop-color="#a6a8bb"/><stop offset="1" stop-color="#d4b9b0"/></linearGradient>
      <linearGradient id="wallD" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b9a79a"/><stop offset=".6" stop-color="#d9c6b2"/><stop offset="1" stop-color="#f0d9bd"/></linearGradient>
      <linearGradient id="wallShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1230" stop-opacity=".5"/><stop offset=".25" stop-color="#1a1230" stop-opacity="0"/><stop offset="1" stop-color="#1a1230" stop-opacity=".28"/></linearGradient>
      <linearGradient id="roofLight" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1b1030" stop-opacity=".42"/><stop offset="1" stop-color="#ffb77a" stop-opacity=".2"/></linearGradient>
      <linearGradient id="walk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a8397"/><stop offset="1" stop-color="#6d5b7d"/></linearGradient>
      <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2540"/><stop offset=".45" stop-color="#1a1830"/><stop offset="1" stop-color="#0c0c1c"/></linearGradient>
      <linearGradient id="roadSheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffa868" stop-opacity="0"/><stop offset=".6" stop-color="#ffa868" stop-opacity=".12"/><stop offset="1" stop-color="#ffc48a" stop-opacity=".26"/></linearGradient>
      <radialGradient id="garageGlow" cx=".5" cy=".4" r=".75"><stop offset="0" stop-color="#ffe2a8"/><stop offset=".5" stop-color="#f2a65a"/><stop offset="1" stop-color="#7a4426"/></radialGradient>
      <radialGradient id="winGlow" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#ffe4ae"/><stop offset="1" stop-color="#e58f46"/></radialGradient>
      <linearGradient id="spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc77c" stop-opacity=".55"/><stop offset="1" stop-color="#ffc77c" stop-opacity="0"/></linearGradient>
      <radialGradient id="boulder" cx=".7" cy=".25" r=".9"><stop offset="0" stop-color="#d9a88e"/><stop offset=".5" stop-color="#7f5f76"/><stop offset="1" stop-color="#2f2447"/></radialGradient>
      <radialGradient id="glowW" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd590" stop-opacity=".85"/><stop offset=".35" stop-color="#ffb866" stop-opacity=".35"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient>
      <radialGradient id="glowP" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff8ad8" stop-opacity=".8"/><stop offset=".4" stop-color="#ff5ab8" stop-opacity=".28"/><stop offset="1" stop-color="#ff3aa0" stop-opacity="0"/></radialGradient>
      <radialGradient id="glowV" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#a9a8ff" stop-opacity=".75"/><stop offset=".4" stop-color="#7a7aff" stop-opacity=".25"/><stop offset="1" stop-color="#5a5aff" stop-opacity="0"/></radialGradient>
      <radialGradient id="glowC" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#bfe3ff" stop-opacity=".7"/><stop offset=".4" stop-color="#7cb4ff" stop-opacity=".25"/><stop offset="1" stop-color="#5a8cff" stop-opacity="0"/></radialGradient>
      <linearGradient id="dumpG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d6a5e"/><stop offset="1" stop-color="#173f38"/></linearGradient>
      <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3be86"/><stop offset="1" stop-color="#b98c58"/></linearGradient>

      <linearGradient id="skyBld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#40356a"/><stop offset="1" stop-color="#a0617a"/></linearGradient>
      <linearGradient id="skyBldFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b6698"/><stop offset="1" stop-color="#d08f88"/></linearGradient>
      <linearGradient id="skyBldWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a78"/><stop offset="1" stop-color="#c47c70"/></linearGradient>
      <linearGradient id="lightBeam" gradientUnits="userSpaceOnUse" x1="0" y1="584" x2="0" y2="452"><stop offset="0" stop-color="#fff3d0" stop-opacity=".36"/><stop offset="1" stop-color="#fff3d0" stop-opacity="0"/></linearGradient>
      <linearGradient id="mFar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6f9c"/><stop offset=".55" stop-color="#b57c8c"/><stop offset="1" stop-color="#e89a74"/></linearGradient>
      <linearGradient id="mMid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4880"/><stop offset=".6" stop-color="#8a5c7e"/><stop offset="1" stop-color="#d27d6b"/></linearGradient>
      <linearGradient id="foot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c2f58"/><stop offset="1" stop-color="#8a566a"/></linearGradient>
      <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4d62"/><stop offset=".25" stop-color="#3b2c52"/><stop offset="1" stop-color="#15122c"/></linearGradient>
      <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb67c" stop-opacity="0"/><stop offset=".55" stop-color="#ffb67c" stop-opacity=".42"/><stop offset="1" stop-color="#ff9d68" stop-opacity="0"/></linearGradient>

      <filter id="fblur3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
      <filter id="fblur8" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
      <filter id="fblur16" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>
      <filter id="blur6" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
    `;
  };

  /* ---------- night versions ----------
     Every layer is drawn once in day colours; its night twin is the same markup with every colour
     pulled toward moonlit navy, gradients/patterns/items swapped for darker "N" copies, and the
     layer's own lights appended. Cross-fading the twins keeps far lights hidden behind nearer
     buildings, which a single overlay can't do. */
  SW.night = (function () {
    const NAVY = [14, 22, 58], K = .34;
    const EMIT_IDS = ['winGlow', 'garageGlow', 'glowW', 'glowC', 'glowP', 'glowV', 'spill', 'fridgeSheen', 'midHaze', 'lightBeam'];
    const EMIT_COL = ['#ffd590', '#ffc778', '#ffe4ae', '#ffd9a0', '#ffe2a8', '#e58f46', '#f2a65a', '#ffcf8a', '#ffd28a', '#fff3d0', '#ff5a48', '#ff4a3a', '#ff6a52', '#ffb347', '#ffe9b8', '#fff6dc', '#ffe0b0'];
    const ids = new Set();
    const hex = (h) => { h = h.length === 3 ? h.split('').map((c) => c + c).join('') : h; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
    const col = (m, h) => {
      if (EMIT_COL.indexOf(m.toLowerCase()) >= 0) return m;
      const c = hex(h), o = c.map((v, i) => Math.round(v * K + NAVY[i] * (1 - K)));
      return '#' + o.map((v) => v.toString(16).padStart(2, '0')).join('');
    };
    const recolor = (str) => str.replace(/(?<!url\()#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g, col);
    const api = {
      recolor,
      /* register which gradient/pattern ids exist, so references to them can be pointed at the N copies */
      register(defsStr) {
        const re = /<(linearGradient|radialGradient|pattern)\b[^>]*\bid="([^"]+)"/g; let m;
        while ((m = re.exec(defsStr))) if (EMIT_IDS.indexOf(m[2]) < 0) ids.add(m[2]);
      },
      defs(defsStr) {
        let out = '';
        const re = /<(linearGradient|radialGradient|pattern)\b[^>]*\bid="([^"]+)"[\s\S]*?<\/\1>/g; let m;
        while ((m = re.exec(defsStr))) if (EMIT_IDS.indexOf(m[2]) < 0) out += api.svg(m[0]);
        return out;
      },
      /* markup -> night markup. defs=true keeps ids unique by suffixing them. */
      svg(str) {
        return recolor(str)
          .replace(/url\(#([A-Za-z0-9_-]+)\)/g, (m, id) => (ids.has(id) ? 'url(#' + id + 'N)' : m))
          .replace(/href="#it-([A-Za-z0-9_]+)"/g, 'href="#it-$1N"')
          .replace(/\bid="([^"]+)"/g, 'id="$1N"');
      },
    };
    return api;
  })();

  /* ---------- timing of the whole ride, in screens of scroll ---------- */
  SW.STOPS = [
    { id: 'garage',   n: 1, anchor: 900,  title: 'Garage and home cleanouts' },
    { id: 'furniture', n: 2, anchor: 2000, title: 'Furniture, mattress and appliance removal' },
    { id: 'construction', n: 3, anchor: 3100, title: 'Construction and renovation cleanup' },
    { id: 'commercial', n: 4, anchor: 4200, title: 'Commercial and property cleanouts' },
    { id: 'estate',   n: 5, anchor: 5300, title: 'Estate and move-out cleanouts' },
  ];
  SW.FINALE_X = 6400;
  SW.PILE_GAP = 260;           /* the pile sits this far (fg units) behind the tailgate when the truck stops */
  SW.SEG = { intro: .62, cruise: .5, dwell: .72, last: .62, finale: .8 };
})(window.SW);
