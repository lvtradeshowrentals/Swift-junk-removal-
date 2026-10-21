/* ============================================================================
   Backdrop layers (drawn in 1600x900 "bg units", bottom-anchored):
   sky objects, mountains, the Las Vegas skyline, foothills, far suburbs.
   Each layer is its own <svg> so the ride can slide it at its own speed on
   the compositor. Layout numbers (how far each layer travels) come in as L.G.
   ========================================================================== */
(function (SW) {
  'use strict';
  const { mk, f } = SW;
  const SUN_X = 960;

  /* ---------- ridgelines ---------- */
  function ridge(seed, base, amp, y0, f1, f2, jag, lean, valleys, xa, xb) {
    const r = mk(seed), p1 = r() * 6, p2 = r() * 6, p3 = r() * 6;
    let d = `M${xa} ${y0 + 40}`;
    for (let x = xa; x <= xb; x += 16) {
      let e = Math.max(.25, 1 - lean * (Math.min(x, 1600) / 1600));
      (valleys || []).forEach(([v0, v1, depth]) => {
        const k = Math.max(0, Math.min((x - v0) / 90, (v1 - x) / 90, 1));
        e *= 1 - depth * k * k * (3 - 2 * k);
      });
      const a = Math.pow((Math.sin(x * f1 + p1) + 1) / 2, 1.5);
      const b = Math.pow((Math.sin(x * f2 + p2) + 1) / 2, 1.2);
      const c = (Math.sin(x * f1 * 3.1 + p3) + 1) / 2;
      d += ` L${x} ${f(base - amp * e * (.55 * a + .32 * b + .13 * c) - r() * jag)}`;
    }
    return d + ` L${xb} ${y0 + 40} Z`;
  }

  /* ---------- skyline pieces ---------- */
  function Skyline(seed) {
    const r = mk(seed);
    const emit = { s: '' };
    const floors = (x, y, w, h, op) => {
      let o = '';
      const rows = Math.floor((h - 6) / 5.4), cols = Math.max(1, Math.floor((w - 3) / 3.8));
      for (let j = 0; j < rows; j++) {
        const band = r() < .1;
        for (let i = 0; i < cols; i++) {
          const on = band ? r() < .85 : r() < .2;
          const cx = f(x + 2 + i * 3.8), cy = f(y + 6 + j * 5.4);
          if (on) { const oo = f(op * (.5 + r() * .5)); o += `<rect x="${cx}" y="${cy}" width="2" height="2.6" fill="#ffd590" opacity="${oo}"/>`; if (op >= 1) emit.s += `<rect x="${cx}" y="${cy}" width="2" height="2.6" fill="#ffd9a0" opacity="${f(.55 + r() * .45)}"/>`; }
          else if (r() < .35) o += `<rect x="${cx}" y="${cy}" width="2" height="2.6" fill="#b9c4ee" opacity="${f(op * .1)}"/>`;
        }
      }
      return o;
    };
    const tower = (x, w, h, crown, far, warm) => {
      crown = crown || 'flat';
      const y = 640 - h;
      let d;
      if (crown === 'step') d = `M${x} 640 V${y + 10} H${x + w * .2} V${y + 4} H${x + w * .34} V${y} H${x + w * .66} V${y + 4} H${x + w * .8} V${y + 10} H${x + w} V640 Z`;
      else if (crown === 'slant') d = `M${x} 640 V${y + 9} L${x + w} ${y} V640 Z`;
      else d = `M${x} 640 V${y} H${x + w} V640 Z`;
      let o = `<path d="${d}" fill="${warm ? 'url(#skyBldWarm)' : far ? 'url(#skyBldFar)' : 'url(#skyBld)'}"/>`;
      o += floors(x, y, w, h, far ? .42 : 1);
      const litRight = (x + w / 2) < SUN_X;
      o += `<path d="M${litRight ? x + w : x} ${y + (crown === 'step' ? 10 : crown === 'slant' ? (litRight ? 0 : 9) : 0)} V640" stroke="#ffb27a" stroke-opacity="${far ? .28 : .65}" stroke-width="1"/>`;
      if (crown === 'flat') o += `<path d="M${x} ${y} H${x + w}" stroke="#ffc690" stroke-opacity="${far ? .22 : .5}" stroke-width=".9"/>`;
      if (!far && h > 88) { const cx = x + w / 2; o += `<rect x="${f(cx - .5)}" y="${y - 12}" width="1" height="12" fill="#4c3f78"/><circle class="beacon" cx="${f(cx)}" cy="${y - 12}" r="1.3" fill="#ff5a48"/>`; }
      return o;
    };
    return { tower, r, emit };
  }

  /* ============ the layers ============ */
  SW.bg = {};

  /* mountains (slowest layer) */
  SW.bg.mountains = (L) => {
    const xa = -300, xb = 1950 + L.G.mtn, e = 800 + L.G.mtn;
    const v = [[790, 1130, .62], [e - 340, e + 340, .6]];
    const d = ridge(21, 600, 190, 650, .0042, .011, 5, .55, v, xa, xb);
    return { xa, xb, svg: `<path d="${d}" fill="url(#mFar)"/><path d="${d}" fill="none" stroke="#ffd0a0" stroke-opacity=".28" stroke-width="1.4" transform="translate(0 -.8)"/>` };
  };

  /* The skyline is two layers.
     down:  downtown Las Vegas and the Strat, visible from the first frame.
     strip: the Strip as seen from the west with north on the left, in true order from Fontainebleau
            to Mandalay Bay. It starts off-screen right and slides in so its middle (Bellagio, Paris,
            Cosmopolitan) is centred for the night finale. See landmarks.js for the buildings. */
  SW.STRIP_HALF = 0;
  /* One fixed skyline, not two layers sliding past each other: only the landmarks that read at a glance, spaced so every
     silhouette stands clear of its neighbours. Roughly south to north, left to right, ending on the STRAT. */
  SW.bg.skyline = (L) => {
    const S = Skyline(12), T = S.tower, LV = SW.LV, glow = SW.LVhelp.glow;
    const put = (b, x, k, by, op) => { const g = `translate(${f(x)} ${by}) scale(${k})`; return { s: `<g transform="${g}" opacity="${op || 1}">${b.s}</g>`, n: `<g transform="${g}">${b.n}</g>` }; };
    const BY = 566;
    let o = '', dn = '';
    const wide = L.landscape;
    /* [builder, x, scale] */
    const set = wide
      ? [[LV.mandalay, 20, .75], [LV.luxor, 270, 1.05], [LV.paris, 450, 1.05], [LV.cosmopolitan, 600, 1.05], [LV.strat, 745, .95], [LV.highRoller, 885, 1.05], [LV.wynn, 1030, 1.15], [LV.sphere, 1125, .9, .78]]
      : [[LV.paris, 585, .75], [LV.highRoller, 665, .78], [LV.wynn, 815, .85], [LV.sphere, 872, .62, .78], [LV.strat, 975, .85]];
    /* a low, hazy band of casino blocks and the valley floor ties them to the ground */
    const r = SW.mk(92);
    let base = '';
    for (let x = -300; x < 1950; x += 8 + r() * 14) { const w = 12 + r() * 26, h = 5 + r() * 15; base += `<rect x="${f(x)}" y="${f(BY - h)}" width="${f(w)}" height="${f(h + 8)}" fill="${r() < .5 ? '#6a5686' : '#78629a'}"/>`; }
    o += `<rect x="-300" y="${BY - 2}" width="2250" height="140" fill="#7d6a96"/>` + base;
    set.forEach(([fn, x, k, op]) => { const q = put(fn(), x, k, BY, op); o += q.s; dn += q.n; });
    o += `<rect x="-300" y="${BY - 30}" width="2250" height="70" fill="url(#haze)" opacity=".85"/>`;
    let dg = '';
    for (let i = 0; i < 40; i++) dg += glow(40 + r() * 1400, BY - 6 + r() * 16, 7 + r() * 9, ['W', 'P', 'C', 'W'][Math.floor(r() * 4)], f(.35 + r() * .4));
    const down = { xa: -300, xb: 1950 + L.G.sky, svg: o, neon: S.emit.s + dn + dg };
    return { down, strip: { xa: 0, xb: 100, svg: '', neon: '' } };
  };

  /* mid mountains + foothills */
  SW.bg.foothills = (L) => {
    const xa = -300, xb = 2200 + L.G.foot, e = 800 + L.G.foot;
    const v = [[600, 1080, .88], [e - 420, e + 420, .86]];
    const v2 = [[600, 1080, .8], [e - 420, e + 420, .8]];
    const d1 = ridge(34, 626, 118, 660, .0065, .017, 4, .2, v, xa, xb);
    const d2 = ridge(47, 646, 44, 700, .011, .027, 3, 0, v2, xa, xb);
    return { xa, xb, svg: `<path d="${d1}" fill="url(#mMid)"/><path d="${d1}" fill="none" stroke="#ffbf8a" stroke-opacity=".3" stroke-width="1.2"/><path d="${d2}" fill="url(#foot)"/>` };
  };

  /* the ground and five rows of far suburbs */
  SW.bg.suburbs = (L) => {
    const xa = -300, xb = 2000 + L.G.sub;
    const rows = [
      { y: 636, s: .55, seed: 81, dark: '#6d5688', lit: '#c8767c', wall: '#86698c', ground: '#7a5a86', tree: '#56477a', win: .5 },
      { y: 643, s: .75, seed: 82, dark: '#4b3b72', lit: '#b5666e', wall: '#6d5582', ground: '#5c4676', tree: '#3b2f5e', win: .7 },
      { y: 652, s: 1.0, seed: 83, dark: '#352950', lit: '#a45568', wall: '#58427a', ground: '#47365f', tree: '#2b2248', win: .9, lamps: true },
      { y: 668, s: 1.4, seed: 84, dark: '#271e40', lit: '#8f4a5c', wall: '#473566', ground: '#33284f', tree: '#211a3a', win: 1, tile: true, lamps: true },
      { y: 692, s: 1.9, seed: 85, dark: '#1d1634', lit: '#7c4056', wall: '#3a2b58', ground: '#281f40', tree: '#191330', win: 1, tile: true },
    ];
    let g = '', o = `<rect x="${xa}" y="614" width="${xb - xa}" height="700" fill="url(#gnd)"/>`;
    const lights = [];
    rows.forEach((row, i) => {
      g += `<linearGradient id="sr${i}R" x1="0" x2="1"><stop offset="0" stop-color="${row.dark}"/><stop offset=".55" stop-color="${row.dark}"/><stop offset="1" stop-color="${row.lit}"/></linearGradient>`;
      g += `<linearGradient id="sr${i}L" x1="1" x2="0"><stop offset="0" stop-color="${row.dark}"/><stop offset=".55" stop-color="${row.dark}"/><stop offset="1" stop-color="${row.lit}"/></linearGradient>`;
      const r = mk(row.seed), S = row.s, y = row.y;
      o += `<rect x="${xa}" y="${y - 1}" width="${xb - xa}" height="${f(60 * S)}" fill="${row.ground}"/>`;
      let x = xa - r() * 30, n = 0;
      while (x < xb) {
        const w = (46 + r() * 34) * S, wh = (12 + r() * 3) * S, rh = (10 + r() * 4) * S;
        const side = (x + w / 2) < SUN_X ? 'R' : 'L';
        const rp = `${f(x - 2 * S)},${f(y - wh)} ${f(x + w + 2 * S)},${f(y - wh)} ${f(x + w - 11 * S)},${f(y - wh - rh)} ${f(x + 11 * S)},${f(y - wh - rh)}`;
        o += `<rect x="${f(x)}" y="${f(y - wh)}" width="${f(w)}" height="${f(wh)}" fill="${row.wall}"/>`;
        o += `<polygon points="${rp}" fill="url(#sr${i}${side})"/>`;
        if (row.tile) o += `<polygon points="${rp}" fill="url(#tileFar)" opacity=".55"/>`;
        o += `<path d="M${f(x + 11 * S)} ${f(y - wh - rh)} H${f(x + w - 11 * S)}" stroke="#ffb27a" stroke-opacity=".5" stroke-width="${f(Math.max(.7, .8 * S))}"/>`;
        o += `<rect x="${f(x - 2 * S)}" y="${f(y - wh)}" width="${f(w + 4 * S)}" height="${f(1.3 * S)}" fill="#0c0820" opacity=".5"/>`;
        const gl = r() < .5, gw = w * .3, gh = wh * .74;
        o += `<rect x="${f(gl ? x + w * .08 : x + w * .62)}" y="${f(y - gh)}" width="${f(gw)}" height="${f(gh)}" fill="#150e29" opacity=".78"/><path d="M${f(gl ? x + w * .08 : x + w * .62)} ${f(y - gh * .5)} h${f(gw)}" stroke="#4a3866" stroke-opacity=".55" stroke-width="${f(Math.max(.4, .5 * S))}"/>`;
        const wx = gl ? x + w * .5 : x + w * .12;
        for (let k = 0; k < 2; k++) {
          const lit = r() < row.win * .55;
          o += `<rect x="${f(wx + k * w * .2)}" y="${f(y - wh * .72)}" width="${f(w * .12)}" height="${f(wh * .4)}" fill="${lit ? '#ffc778' : '#a7b4e6'}" opacity="${lit ? f(.7 + r() * .3) : .14}"/>`;
          if (lit && i >= 2) lights.push([wx + k * w * .2 + w * .06, y - wh * .52, 7 * S]);
        }
        x += w;
        const gap = (6 + r() * 16) * S, gx = x + gap / 2, pick = r();
        if (pick < .5) {
          const tr = (6 + r() * 3) * S;
          o += `<rect x="${f(gx - .8 * S)}" y="${f(y - 8 * S)}" width="${f(1.6 * S)}" height="${f(8 * S)}" fill="${row.tree}"/>`;
          [[0, -13, 1], [-4, -10, .8], [4, -10, .8]].forEach((c) => { o += `<circle cx="${f(gx + c[0] * S)}" cy="${f(y + c[1] * S)}" r="${f(tr * c[2])}" fill="${row.tree}"/>`; });
          o += `<circle cx="${f(gx + 2 * S)}" cy="${f(y - 15 * S)}" r="${f(tr * .5)}" fill="#ffb27a" opacity=".16"/>`;
        } else if (pick < .78) {
          const ph = (22 + r() * 8) * S;
          o += `<path d="M${f(gx)} ${y} L${f(gx + .6 * S)} ${f(y - ph)}" stroke="${row.tree}" stroke-width="${f(1.4 * S)}"/>`;
          for (let k = 0; k < 7; k++) { const a = (-160 + k * 22) * Math.PI / 180; o += `<path d="M${f(gx + .6 * S)} ${f(y - ph)} q${f(Math.cos(a) * 7 * S)} ${f(Math.sin(a) * 5 * S - 1)} ${f(Math.cos(a) * 11 * S)} ${f(Math.sin(a) * 4 * S + 4 * S)}" stroke="${row.tree}" stroke-width="${f(1.1 * S)}" fill="none" stroke-linecap="round"/>`; }
        } else if (row.lamps && n++ % 2 === 0) {
          o += `<rect x="${f(gx)}" y="${f(y - 26 * S)}" width="${f(1.2 * S)}" height="${f(26 * S)}" fill="${row.tree}"/><path d="M${f(gx)} ${f(y - 26 * S)} h${f(6 * S)}" stroke="${row.tree}" stroke-width="${f(1.2 * S)}"/><circle cx="${f(gx + 6 * S)}" cy="${f(y - 25 * S)}" r="${f(1.6 * S)}" fill="#ffd590"/>`;
          lights.push([gx + 6 * S, y - 25 * S, 9 * S]);
        } else {
          o += `<rect x="${f(x)}" y="${f(y - 4 * S)}" width="${f(gap)}" height="${f(4 * S)}" fill="${row.wall}"/>`;
        }
        x += gap;
      }
    });
    o += `<rect x="${xa}" y="560" width="${xb - xa}" height="100" fill="url(#haze)" opacity=".8"/>`;
    let lg = '';
    lights.forEach((l) => { lg += `<circle cx="${f(l[0])}" cy="${f(l[1])}" r="${f(l[2])}" fill="url(#glowW)"/>`; });
    return { xa, xb, svg: o, grads: g, lightsSvg: lg };
  };

  /* clouds: copper-lit for dawn and dusk, white by day */
  SW.bg.clouds = (L, day) => {
    const xa = -300, xb = 2100 + L.G.cloud;
    const r = mk(day ? 18 : 5);
    let s = '';
    const n = Math.round((xb - xa) / (day ? 420 : 380));
    for (let i = 0; i < n; i++) {
      const cx = xa + (i + .3 + r() * .5) * (xb - xa) / n, cy = (day ? 150 : 300) + r() * (day ? 260 : 190), w = (day ? 150 : 190) + r() * 120, h = (day ? 14 : 12) + r() * 10;
      if (day) {
        s += `<ellipse cx="${f(cx)}" cy="${f(cy + h * .4)}" rx="${f(w)}" ry="${f(h * .6)}" fill="#a9c2e2" opacity=".5"/><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(w * .9)}" ry="${f(h)}" fill="#fff" opacity=".78"/>`;
        for (let k = 0; k < 3; k++) s += `<ellipse cx="${f(cx + (r() - .5) * w)}" cy="${f(cy - h * .5)}" rx="${f(w * (.2 + r() * .25))}" ry="${f(h * (.6 + r() * .5))}" fill="#fff" opacity=".7"/>`;
      } else {
        s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(w)}" ry="${f(h)}" fill="#6a4f86" opacity=".55"/>`;
        s += `<ellipse cx="${f(cx + w * .06)}" cy="${f(cy + h * .55)}" rx="${f(w * .9)}" ry="${f(h * .55)}" fill="#f29a64" opacity=".78"/>`;
        s += `<ellipse cx="${f(cx + w * .12)}" cy="${f(cy + h * .8)}" rx="${f(w * .62)}" ry="${f(h * .3)}" fill="#ffd59a" opacity=".7"/>`;
        for (let k = 0; k < 3; k++) s += `<ellipse cx="${f(cx + (r() - .5) * w * 1.3)}" cy="${f(cy - h * .2 + r() * h * .3)}" rx="${f(w * (.25 + r() * .3))}" ry="${f(h * (.5 + r() * .4))}" fill="#7b5a8e" opacity=".38"/>`;
      }
    }
    return { xa, xb, svg: `<g filter="url(#blur6)">${s}</g>` };
  };

  SW.bg.stars = () => {
    const r = mk(3); let s = '';
    for (let i = 0; i < 140; i++) {
      const y = Math.pow(r(), 1.5) * 520, x = r() * 1800 - 100;
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.5 + r() * 1.1)}" fill="#fff" opacity="${f(.35 + r() * .6)}"/>`;
    }
    return s;
  };
})(window.SW);
