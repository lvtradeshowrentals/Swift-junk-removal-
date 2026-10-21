/* ============================================================================
   The hero's world: one short street. A big two-story house with a two-car garage
   (the move-out, with a SOLD sign), the pile of belongings waiting at the kerb, a few
   neighbours, and a porch-lit house down the road where the day ends.
   World units are the same 520-tall bottom-anchored units as the rest of the scene.
   ========================================================================== */
(function (SW) {
  'use strict';
  const { mk, f } = SW;
  const G = SW.G, K = SW.world.kit;
  const X_MIN = -1300, X_MAX = 3500, SEG_W = 1000;

  /* The pile, in the order it is loaded. dx is from the anchor, y the ground row (bigger = nearer the camera).
     Nothing is stacked on anything that is loaded before it, so a crew can take them in this order. */
  SW.HERO = {
    X_MIN, X_MAX, SEG_W,
    houseX: 0, pileX: 372, finaleX: 2430, K: .88,
    /* Six pieces, drawn big enough to need handling like the real thing. crew = who lifts it (0, 1, 2); sc = size
       relative to the art's native size; gy = hand height in cm while carrying; carryRot = how it is turned in the hands.
       Same order as the trailer's load plan (trailer.js): floor row, then the flat things on top. */
    pile: [
      { t: 'couch', dx: -70, y: 410, sc: 1.55, crew: [0, 1], gy: 84 },
      { t: 'armchair', dx: 92, y: 406, sc: 1.3, crew: [2], gy: 100 },
    ],
  };

  /* ---------- the hero house ---------- */
  function heroHouse(S, x) {
    const base = G.BASE;
    let s = '';
    const gW = 300, mx = x + 300, mw = 460, ux = mx + 84, uw = mw - 168;
    /* garage wing: two doors rolled up on a lit, cluttered interior */
    s += K.roofArt(x - 14, x + gW + 14, 206, 34, 52);
    s += K.stucco(x, 221, gW, base - 221, 'wallD');
    [[x + 20, 'garageClutterA'], [x + 164, 'garageClutterB']].forEach(([gx, id]) => {
      s += `<rect x="${gx - 8}" y="232" width="136" height="${base - 232 + 2}" fill="#e8c9b4"/>`;
      s += K.garageInterior(S, gx, 240, 120, base - 240, id);
    });
    s += `<rect x="${x}" y="${base - 6}" width="${gW}" height="6" fill="#8a6478" opacity=".7"/>`;
    /* main house: lower roof, upper roof, upper walls, lower walls (each covers the foot of the one before) */
    s += K.roofArt(mx - 8, mx + mw + 10, 200, 28, 38);
    s += K.roofArt(ux - 16, ux + uw + 16, 132, 50, 72);
    s += `<rect x="${ux + uw - 78}" y="82" width="26" height="56" fill="#8a5448"/><rect x="${ux + uw - 82}" y="78" width="34" height="7" fill="#a8685a"/>`;
    s += K.stucco(ux, 147, uw, 214 - 147, 'wallD');
    s += K.stucco(mx, 215, mw, base - 215, 'wallD');
    /* upper floor: three windows, the middle one a glass door onto a balcony */
    s += K.windowArt(S, ux + 22, 168, 54, 54, true) + K.windowArt(S, ux + uw - 76, 168, 54, 54, false);
    s += `<rect x="${ux + uw / 2 - 26}" y="162" width="52" height="60" rx="2" fill="#f0d6c4"/><rect x="${ux + uw / 2 - 22}" y="166" width="44" height="56" fill="url(#winGlow)"/><path d="M${ux + uw / 2} 166 V222" stroke="#f0d6c4" stroke-width="2.4"/>`;
    S.lights += `<circle cx="${f(ux + uw / 2)}" cy="194" r="62" fill="url(#glowW)"/>`;
    s += `<rect x="${ux + uw / 2 - 52}" y="214" width="104" height="6" fill="#d4b2a2"/><rect x="${ux + uw / 2 - 52}" y="220" width="104" height="4" fill="#1a1030" opacity=".4"/>`;
    for (let i = 0; i <= 12; i++) s += `<rect x="${f(ux + uw / 2 - 50 + i * 8.3)}" y="199" width="2" height="16" fill="#3a2d42"/>`;
    s += `<rect x="${ux + uw / 2 - 52}" y="197" width="104" height="3" fill="#3a2d42"/>`;
    /* lower floor: arched entry with pilasters, a window each side */
    const dx = mx + mw / 2 - 38;
    s += `<rect x="${dx - 16}" y="${base - 134}" width="9" height="134" fill="#e8c9b4"/><rect x="${dx + 76 + 7}" y="${base - 134}" width="9" height="134" fill="#e8c9b4"/>`;
    s += K.archDoor(S, dx, base, 76, 122, true);
    s += K.windowArt(S, mx + 40, 258, 74, 62, true) + K.windowArt(S, mx + mw - 114, 258, 74, 62, true);
    s += `<rect x="${mx}" y="${base - 6}" width="${mw}" height="6" fill="#8a6478" opacity=".7"/>`;
    /* wall lights by the garage and the door */
    [[x + 150, 262], [mx + 18, 276]].forEach(([lx, ly]) => { s += `<rect x="${lx - 3}" y="${ly}" width="6" height="12" rx="2" fill="#2a1d3c"/><circle cx="${lx}" cy="${ly + 6}" r="3.4" fill="#ffe2a8"/>`; S.lights += `<circle cx="${lx}" cy="${ly + 6}" r="22" fill="url(#glowW)"/>`; });
    S.back += s;
    /* the driveway, the kerb ramp, and a gravel yard with planting */
    S.street += `<path d="M${x + 14} ${base} H${x + 292} L${x + 342} 404 H${x - 40} Z" fill="#b9a0a0"/><path d="M${x + 14} ${base} H${x + 292} L${x + 342} 404 H${x - 40} Z" fill="url(#spill)"/><path d="M${x + 156} ${base} V404 M${x + 90} ${base} L${x + 56} 404 M${x + 222} ${base} L${x + 256} 404" stroke="#8a7480" stroke-width="1.1" opacity=".6"/><path d="M${x + 14} ${base} H${x + 292} L${x + 342} 404 H${x - 40} Z" fill="#1a1030" opacity=".14"/>`;
    S.street += `<path d="M${mx + 150} ${base} H${mx + 310} L${mx + 330} 372 H${mx + 130} Z" fill="#a48e98" opacity=".9"/>`;
    S.back = K.palm(x - 84, 344, 262, 8, 63, 1.02) + S.back;
    S.front += K.palm(x + 806, 346, 286, -12, 65, 1.06);
    S.front += K.agave(mx + 26, 366, 1.1, 5) + K.agave(mx + mw - 30, 366, 1.0, 9) + K.agave(x + 330, 368, .9, 3);
    S.front += K.boulder(mx + 120, 364, 20, 9) + K.boulder(mx + 360, 365, 24, 10);
  }

  /* a street lamp: pole, arm and a lit head */
  function streetLamp(S, x, y, sc) {
    S.props += `<g transform="translate(${x} ${y}) scale(${sc})"><rect x="-2.2" y="-132" width="4.4" height="132" fill="#2a2f40"/><path d="M0 -130 q22 -2 30 8" stroke="#2a2f40" stroke-width="3.6" fill="none"/><rect x="22" y="-124" width="18" height="6" rx="3" fill="#1d2130"/><circle cx="31" cy="-118" r="3.4" fill="#ffe2a8"/></g>`;
    S.lights += `<circle cx="${f(x + 31 * sc)}" cy="${f(y - 116 * sc)}" r="${f(48 * sc)}" fill="url(#glowW)"/><path d="M${f(x + 31 * sc)} ${f(y - 114 * sc)} l-34 ${f(114 * sc)} h68 Z" fill="url(#spill)" opacity=".5"/>`;
  }

  function drawPile(S) {
    const H = SW.HERO, order = H.pile.map((p, i) => [p, i]).sort((a, b) => a[0].y - b[0].y);
    order.forEach(([p, i]) => {
      const sc = H.K * SW.depth(p.y) * p.sc, x = H.pileX + p.dx, y = p.y;
      const tf = `translate(${x} ${y - (p.up || 0) * sc}) rotate(${p.tilt || 0}) scale(${f(sc)})`;
      S.props += `<g id="pile-${i}"><use href="#it-${p.t}" transform="${tf}"/></g>`;
    });
    /* a few things that stay: bins at the neighbour's drive, a pot by the door */
  }

  SW.world.buildHero = function () {
    const segs = []; for (let x = X_MIN; x < X_MAX; x += SEG_W) segs.push(K.newSeg(x));
    const at = (x) => segs[SW.clamp(Math.floor((x - X_MIN) / SEG_W), 0, segs.length - 1)];
    segs.forEach((S) => K.street(S, S.x0, S.x0 + S.w));
    segs.forEach((S, i) => K.yardStrip(S, S.x0, S.x0 + S.w, 900 + i * 13));
    const plan = [
      ['houseC', -1240, 460], ['wall', -780, 40], ['houseB', -740, 440], ['wall', -300, 200, 1], ['wall', -100, 100], ['hero', 0, 760],
      ['wall', 760, 220, 1], ['houseC', 980, 460], ['wall', 1440, 220, 1], ['houseA', 1660, 440], ['wall', 2100, 100],
      ['finale', 2200, 460], ['wall', 2660, 300, 1], ['houseB', 2960, 440], ['wall', 3400, 100],
    ];
    plan.forEach(([t, x, w, palm]) => {
      const S = at(x + w / 2);
      switch (t) {
        case 'hero': heroHouse(S, x); K.mailbox(S, x + 786); K.soldSign(S, x + 336, 372); drawPile(S); break;
        case 'houseA': K.houseA(S, x, w, {}); break;
        case 'houseB': K.houseB(S, x, w); break;
        case 'houseC': K.houseC(S, x, w); break;
        case 'finale': K.houseA(S, x, w, {}); S.lights += `<circle cx="${x + 290}" cy="300" r="30" fill="url(#glowW)"/>`; S.props += `<rect x="${x + 214}" y="360" width="64" height="6" rx="2" fill="#1a1d2a" opacity=".6"/>`; break;
        case 'wall': K.blockWall(S, x, w, !!palm, 11 + x); break;
      }
    });
    [[-210, 404], [880, 404], [1500, 404], [2120, 404], [2760, 404]].forEach(([x, y]) => streetLamp(at(x), x, y, .92));
    return segs.map((S) => ({ x0: S.x0, w: S.w, svg: S.back + S.front + S.yard + S.street + S.props, lights: S.lights }));
  };
})(window.SW);
