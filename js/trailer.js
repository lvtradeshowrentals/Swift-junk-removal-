/* ============================================================================
   The trailer. A 16-foot open junk trailer hitched behind the pickup, so a whole
   household leaves in one neat, secured load instead of a heap over the tailgate.
   Local units are the truck's: x grows toward the truck's nose, the truck's tailgate
   is x = 0, y = 0 is the road, negative is up. The trailer sits at negative x.
   The art is split so crew and cargo can sit between the halves: BACK is everything
   behind the load, FRONT is everything in front of it (the near side panel, wheels,
   fenders), and the NET goes over the top once the last piece is in. The load plan is
   data: every piece has a slot, packed heavy-first, flat things on top, nothing past
   the walls, and the finished load sits well under the headache rack and the cab roof.
   ========================================================================== */
(function (SW) {
  'use strict';
  const { f } = SW;
  const T = SW.trailer = {};

  /* geometry */
  const DECK = -72, SIDE_TOP = -124, BOX_L = -622, BOX_R = -102, WALL_TOP = -236, RAMP_LEN = 58;
  T.G = { DECK, SIDE_TOP, BOX_L, BOX_R, WALL_TOP, RAMP_LEN, RAMP_X: BOX_L - 42, HITCH: [-12, -54], AXLES: [-436, -342], WHEEL_K: .6 };
  T.VB = { x: -720, y: -340, w: 740, h: 360 };

  /* ---- the load plan -------------------------------------------------------
     The pile, in the order it goes in. {t, x, y, s, r, lie}: x,y are the piece's bottom-centre in
     trailer units, s its scale (the same scale as in the pile and in the crew's hands), r a small
     tilt in degrees, lie = laid on its side. Floor row first, the flat things on top of the heavy
     things, boxes at the front against the rack, and a level top for the net. */
  const DK = DECK - 4;
  const dim = (t) => SW.ITEM_DIM[t];
  T.LOAD = [];
  /* the lowest the piece's top can be: its base minus its own height (lying pieces use their width) */
  const put = (t, x, y, sc, r, lie) => { const it = { t, x, y, s: sc, r: r || 0, lie: !!lie }; T.LOAD.push(it); return y - (lie ? dim(t).w : dim(t).h) * sc; };
  /* floor row, rear to front: couch, armchair, TV. Then the mattress on the couch and a box on the armchair. */
  put('couch', -490, DK, 1.55); put('armchair', -300, DK, 1.3);
  /* the small things are already in at the front: boxes and a TV, stacked against the rack */
  const pre = (t, x, y, sc, r) => { const it = { t, x, y, s: sc, r: r || 0, lie: false, pre: true }; T.LOAD.push(it); return y - dim(t).h * sc; };
  const tvTop = pre('tv', -190, DK, 1.45), bsTop = pre('boxStack', -140, DK, 1.1);
  pre('box', -222, DK, 1.2); pre('box', -190, tvTop, 1.1, -2);

  T.center = (it) => ({ x: it.x, y: it.y - (it.lie ? dim(it.t).w : dim(it.t).h) * it.s / 2 });
  T.tf = (it) => {
    const d = dim(it.t);
    if (it.lie) return `translate(${f(it.x + d.h / 2 * it.s)} ${f(it.y - d.w / 2 * it.s)}) rotate(-90) scale(${it.s})`;
    return `translate(${it.x} ${f(it.y)}) rotate(${it.r}) scale(${it.s})`;
  };
  /* a piece's footprint in trailer units: [x0, x1, top y] */
  T.box = (it) => { const d = dim(it.t), w = (it.lie ? d.h : d.w) * it.s, h = (it.lie ? d.w : d.h) * it.s; return [it.x - w / 2, it.x + w / 2, it.y - h]; };

  /* ---- defs ---- */
  T.defs = function () {
    return `
      <linearGradient id="trSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6fc"/><stop offset=".55" stop-color="#dde3f1"/><stop offset="1" stop-color="#b9c1d8"/></linearGradient>
      <pattern id="trMesh" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 H9 M0 0 V9" stroke="#0d1120" stroke-width="1.5" opacity=".85"/></pattern>
      <linearGradient id="trDeck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4257"/><stop offset="1" stop-color="#171b29"/></linearGradient>`;
  };

  const wheel = (cx) => `<g class="tr-w" transform="translate(${cx} 0) scale(${T.G.WHEEL_K})">${SW.truck.wheel(0)}</g>`;

  /* ---- art behind the load ---- */
  T.back = function () {
    const [hx, hy] = T.G.HITCH;
    let s = '';
    /* shadow under the whole rig */
    s += `<ellipse cx="-360" cy="2" rx="340" ry="9" fill="#05060f" opacity=".6" filter="url(#fblur8)"/><ellipse cx="-360" cy="1" rx="300" ry="3.4" fill="#02030a" opacity=".5" filter="url(#fblur3)"/>`;
    /* tongue: an A-frame of two rails, a coupler, a safety chain and a jack */
    s += `<path d="M${BOX_R + 2} -76 L${hx - 8} ${hy - 6} L${hx - 8} ${hy + 4} L${BOX_R + 2} -62 Z" fill="#10131d"/><path d="M${BOX_R + 2} -76 L${hx - 8} ${hy - 6}" stroke="#5b627c" stroke-width="1.2"/>`;
    s += `<rect x="${hx - 22}" y="${hy - 14}" width="22" height="22" rx="4" fill="#161a28"/><rect x="${hx - 22}" y="${hy - 14}" width="22" height="3" rx="1.5" fill="#6b7390"/><circle cx="${hx - 9}" cy="${hy + 8}" r="6.5" fill="#0c0f19" stroke="#8d96b0" stroke-width="1.4"/><rect x="${hx - 12}" y="${hy - 24}" width="8" height="12" rx="2" fill="#e8803f"/>`;
    s += `<path d="M${BOX_R - 22} -70 q-26 30 -48 20 q-18 -4 -22 -16" fill="none" stroke="#aab3ca" stroke-width="2" stroke-dasharray="3 2.4" opacity=".8"/>`;
    s += `<rect x="${BOX_R - 46}" y="-60" width="6" height="26" fill="#10131d"/><rect x="${BOX_R - 52}" y="-36" width="18" height="6" rx="2" fill="#0c0f19"/>`;
    /* floor of the bed */
    s += `<rect x="${BOX_L}" y="${DECK}" width="${BOX_R - BOX_L}" height="8" fill="url(#trDeck)"/>`;
    /* headache rack: the tall front wall that keeps a load off the cab */
    s += `<rect x="${BOX_R - 6}" y="${WALL_TOP}" width="8" height="${DECK - WALL_TOP}" fill="#10131d"/><rect x="${BOX_R - 6}" y="${WALL_TOP}" width="8" height="${DECK - WALL_TOP}" fill="url(#trMesh)" opacity=".7"/>`;
    s += `<rect x="${BOX_R - 12}" y="${WALL_TOP - 4}" width="20" height="7" rx="3" fill="#10131d"/><rect x="${BOX_R - 12}" y="${WALL_TOP - 4}" width="20" height="2" rx="1" fill="#6b7390" opacity=".7"/>`;
    /* rear gate: a drop-down flap that doubles as a ramp. Drawn lowered; the engine swings it shut about its hinge. */
    const L = T.G.RAMP_LEN, hinge = [BOX_L, DECK + 6];
    s += `<g id="trRamp"><path d="M${hinge[0]} ${hinge[1] - 4} L${hinge[0] - L * .72} ${hinge[1] - 4 + L * .72} L${hinge[0] - L * .72 + 4} ${hinge[1] + L * .72 + 1} L${hinge[0] + 3} ${hinge[1] + 4} Z" fill="#232a40"/><path d="${[0, 1, 2, 3].map((i) => `M${f(hinge[0] - 10 - i * 9)} ${f(hinge[1] + 4 + i * 9)} l5 -5`).join(' ')}" stroke="#8d96b0" stroke-width="1.3" opacity=".6"/></g>`;
    return s;
  };

  /* ---- art in front of the load ---- */
  T.front = function () {
    const [a1, a2] = T.G.AXLES, w = BOX_R - BOX_L;
    const T_ = `font-family="Instrument Sans, Segoe UI, sans-serif"`;
    let s = '';
    /* chassis rail */
    s += `<rect x="${BOX_L - 4}" y="${DECK + 6}" width="${w + 8}" height="9" rx="2" fill="#10131d"/><rect x="${BOX_L - 4}" y="${DECK + 6}" width="${w + 8}" height="1.6" fill="#6b7390" opacity=".6"/>`;
    /* wheels, then the fender that wraps both */
    s += wheel(a1) + wheel(a2);
    const fx0 = a1 - 48, fx1 = a2 + 48, fy = DECK - 2;
    s += `<path d="M${fx0} ${fy + 20} Q${fx0 + 6} ${fy - 12} ${fx0 + 34} ${fy - 14} H${fx1 - 34} Q${fx1 - 6} ${fy - 12} ${fx1} ${fy + 20} L${fx1 - 7} ${fy + 20} Q${fx1 - 11} ${fy - 4} ${fx1 - 36} ${fy - 6} H${fx0 + 36} Q${fx0 + 11} ${fy - 4} ${fx0 + 7} ${fy + 20} Z" fill="#161a28"/>`;
    s += `<path d="M${fx0 + 36} ${fy - 14} H${fx1 - 34}" stroke="#8d96b0" stroke-width="1.4" opacity=".7"/>`;
    /* near side panel with the livery */
    const top = SIDE_TOP, h = DECK - top;
    s += `<rect x="${BOX_L}" y="${top}" width="${w}" height="${h + 6}" fill="url(#trSide)"/>`;
    s += `<rect x="${BOX_L}" y="${top}" width="${w}" height="${h + 6}" fill="url(#paintWarm)" opacity=".5"/>`;
    s += `<rect x="${BOX_L}" y="${top}" width="${w}" height="9" fill="#10131d"/><rect x="${BOX_L}" y="${top}" width="${w}" height="1.8" fill="#8d96b0" opacity=".8"/>`;
    s += `<rect x="${BOX_L}" y="${DECK - 12}" width="${w}" height="18" fill="url(#navyBand)"/><rect x="${BOX_L}" y="${DECK - 14}" width="${w}" height="2.2" fill="#e8803f"/>`;
    s += `<path d="M${a1 - 70} ${DECK + 6} V${top + 9} M${a2 + 70} ${DECK + 6} V${top + 9}" stroke="#aab3ca" stroke-opacity=".5" stroke-width="1.3"/>`;
    for (let i = 1; i < 5; i++) { const x = BOX_L + i * w / 5; s += `<path d="M${f(x)} ${top + 10} V${DECK - 14}" stroke="#aab3ca" stroke-opacity=".4" stroke-width="1.2"/>`; }
    /* livery: the same mark and wordmark as the truck, bigger, with the phone number at the other end */
    s += `<use href="#mark-light" x="${BOX_L + 36}" y="${top + 16}" width="44" height="27.5"/><rect x="${BOX_L + 88}" y="${top + 16}" width="1.6" height="26" fill="#0f1a33" opacity=".3"/>`;
    s += `<text x="${BOX_L + 98}" y="${top + 34}" ${T_} font-weight="700" font-size="23" letter-spacing="2" fill="#0f1a33">SWIFT</text>`;
    s += `<text x="${BOX_L + 99}" y="${top + 43}" ${T_} font-weight="600" font-size="6.4" letter-spacing="2.9" fill="#c4632d">JUNK REMOVAL</text>`;
    s += `<text x="${BOX_R - 30}" y="${top + 30}" text-anchor="end" ${T_} font-weight="700" font-size="13" fill="#0f1a33">(702) 000-0000</text><text x="${BOX_R - 30}" y="${top + 41}" text-anchor="end" ${T_} font-weight="500" font-size="7.4" letter-spacing=".4" fill="#33405f">Las Vegas &amp; Henderson  ·  Free quotes</text>`;
    /* corner posts and the rear lights */
    s += `<rect x="${BOX_L - 5}" y="${top - 3}" width="9" height="${h + 14}" rx="2" fill="#10131d"/><rect x="${BOX_R - 3}" y="${top - 3}" width="9" height="${h + 14}" rx="2" fill="#10131d"/>`;
    s += `<rect x="${BOX_L - 4}" y="${DECK - 34}" width="7" height="22" rx="2" fill="#5c0f0c"/><rect x="${BOX_L - 3}" y="${DECK - 33}" width="5" height="20" rx="1.5" fill="#cf2a21"/><rect x="${BOX_L - 3}" y="${DECK - 33}" width="2" height="20" fill="#ff6e5c" opacity=".8"/>`;
    s += `<rect x="${BOX_L + 22}" y="${DECK - 3}" width="26" height="5" rx="1" fill="#f5e7d0" opacity=".9"/><rect x="${BOX_L + 24}" y="${DECK - 2}" width="22" height="2.6" fill="#10131d" opacity=".6"/>`;
    return s;
  };

  /* ---- the finished load as a silhouette, for the net ---- */
  T.loadTop = function (x) {
    let y = DECK;
    T.LOAD.forEach((it) => { const bx = T.box(it); if (x >= bx[0] && x <= bx[1]) y = Math.min(y, bx[2]); });
    return y;
  };
  const NET = { top: null };
  T.net = function () {
    if (NET.top) return NET.top;
    const pts = [];
    for (let x = BOX_L + 8; x <= BOX_R - 8; x += 4) pts.push([x, Math.min(T.loadTop(x), DECK - 30) - 3]);
    /* smooth the top so the net drapes over the load instead of tracing every piece */
    const sm = pts.map((p, i) => { let s = 0, n = 0; for (let k = -10; k <= 10; k++) { const q = pts[i + k]; if (q) { s += q[1]; n++; } } return [p[0], s / n]; });
    const top = sm.map((p, i) => `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`).join(' ');
    NET.top = { pts: sm, top, d: top + ` L${BOX_R - 8} ${SIDE_TOP + 4} L${BOX_L + 8} ${SIDE_TOP + 4} Z` };
    return NET.top;
  };
  T.netTopAt = (x) => { const p = T.net().pts; let best = p[0]; p.forEach((q) => { if (Math.abs(q[0] - x) < Math.abs(best[0] - x)) best = q; }); return best[1]; };

  /* the cargo net and its two ratchet straps. The net is revealed by growing #trNetRect from the rear. */
  T.netMarkup = function () {
    const n = T.net(), sx = [BOX_L + 150, BOX_L + 390];
    let s = `<clipPath id="trNetClip"><rect id="trNetRect" x="${BOX_L - 14}" y="-330" width="0" height="330"/></clipPath><clipPath id="trNetShape"><path d="${n.d}"/></clipPath>`;
    s += `<g clip-path="url(#trNetClip)"><g clip-path="url(#trNetShape)"><path d="${n.d}" fill="#0d1120" opacity=".14"/><path d="${n.d}" fill="url(#trMesh)" opacity=".8"/></g>`;
    s += `<path d="${n.top}" fill="none" stroke="#0d1120" stroke-width="3.2" stroke-linejoin="round"/>`;
    [BOX_L + 8, BOX_R - 8].forEach((x) => { s += `<circle cx="${x}" cy="${SIDE_TOP + 2}" r="4" fill="#e8803f" stroke="#10131d" stroke-width="1.4"/>`; });
    s += `</g><g id="trStraps" opacity="0">`;
    sx.forEach((x) => {
      const y0 = T.netTopAt(x) - 3;
      s += `<rect x="${x - 3.6}" y="${f(y0)}" width="7.2" height="${f(SIDE_TOP - y0 + 4)}" fill="#e8803f"/><rect x="${x - 3.6}" y="${f(y0)}" width="2" height="${f(SIDE_TOP - y0 + 4)}" fill="#ffd0a8" opacity=".7"/>`;
      s += `<rect x="${x - 8}" y="${SIDE_TOP - 16}" width="16" height="15" rx="3" fill="#10131d"/><rect x="${x - 8}" y="${SIDE_TOP - 16}" width="16" height="2.4" rx="1" fill="#8d96b0" opacity=".8"/><rect x="${x - 4}" y="${SIDE_TOP - 10}" width="8" height="3" rx="1.2" fill="#e8803f"/>`;
    });
    return s + '</g>';
  };
})(window.SW);
