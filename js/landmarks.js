/* ============================================================================
   Las Vegas landmarks, drawn from reference photographs of the valley skyline as seen from the
   west (north is left). Each builder draws one building in metres, base centred on x = 0 with y
   up negative, and returns { s: daytime markup, n: night lights }. Shapes, proportions and
   colours were read off real photos: the Strat's saucer pod, Wynn and Encore's curved bronze
   slabs with gold floor lines, the Venetian and Palazzo's stepped crowns, Caesars' beige towers,
   Bellagio's fan, the Eiffel Tower at Paris, the leaning Veer towers, the New York-New York
   skyscraper set, Excalibur's turrets, the Luxor pyramid and its beam, and Mandalay Bay's
   gold-ribbed slab.
   ========================================================================== */
(function (SW) {
  'use strict';
  const f = SW.f;
  const HZ = [168, 140, 170];                         /* the evening haze every far building is pulled toward */
  const rgb = (h) => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (c, t) => { const a = rgb(c); return hex(a.map((v, i) => v + (HZ[i] - v) * t)); };
  const shade = (c, t) => { const a = rgb(c); return hex(a.map((v) => v * (1 - t))); };
  const lite = (c, t) => { const a = rgb(c); return hex(a.map((v) => v + (255 - v) * t)); };
  const R = SW.mk(2026);

  /* rows of window dashes: one path per building */
  const rowsD = (x, y, w, h, dy) => { let d = ''; for (let yy = y + dy / 2; yy < y + h - dy / 3; yy += dy) d += `M${f(x)} ${f(yy)}H${f(x + w)}`; return d; };
  const win = (x, y, w, h, o) => {
    o = o || {};
    const dy = o.dy || 4.2, dx = o.dx || 3.4, ww = o.ww || 2, wh = o.wh || 2, col = o.col || '#2a2650', op = o.op == null ? .42 : o.op;
    return `<path d="${rowsD(x + 1.2, y + 2, w - 2.4, h - 3, dy)}" fill="none" stroke="${col}" stroke-opacity="${op}" stroke-width="${wh}" stroke-dasharray="${ww} ${f(dx - ww)}"/>`;
  };
  const lit = (x, y, w, h, o) => {
    o = o || {};
    const dy = o.dy || 4.2, dx = o.dx || 3.4, ww = o.ww || 2, wh = o.wh || 2, p = o.p == null ? .3 : o.p, col = o.col || '#ffd9a0';
    let out = '';
    for (let yy = y + 2 + dy / 2; yy < y + h - dy / 3; yy += dy) {
      if (R() < p) out += `<path d="M${f(x + 1.2)} ${f(yy)}H${f(x + w - 1.2)}" stroke="${col}" stroke-opacity="${f(.55 + R() * .4)}" stroke-width="${wh}" stroke-dasharray="${ww} ${f(dx * (1 + Math.floor(R() * 3)) - ww)}" stroke-dashoffset="${f(-R() * dx * 3)}" fill="none"/>`;
    }
    return out;
  };
  const rim = (d) => `<path d="${d}" fill="none" stroke="#ffb27a" stroke-opacity=".55" stroke-width="1"/>`;
  const glow = (x, y, r, k, op) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#glow${k})" opacity="${op}"/>`;
  const beacon = (x, y) => `<circle class="beacon" cx="${f(x)}" cy="${f(y)}" r="1.5" fill="#ff5a48"/>`;
  /* a plain slab with the right-hand face catching the low sun */
  const slab = (x, w, h, c, o) => {
    o = o || {};
    return `<path d="M${x} 0V${-h}H${x + w}V0Z" fill="${c}"/>` +
      `<path d="M${f(x + w * .62)} 0V${-h}H${x + w}V0Z" fill="${lite(c, .12)}" opacity=".5"/>` +
      `<path d="M${x} 0V${-h}H${f(x + w * .22)}V0Z" fill="${shade(c, .3)}" opacity=".4"/>` + rim(`M${x + w} 0V${-h}`) + (o.win === false ? '' : win(x, -h, w, h, o.w));
  };
  const L = {};

  /* ---------- the Strat: fluted shaft, saucer pod, needle ---------- */
  L.strat = () => {
    const c = mix('#b9a592', .2), dk = mix('#7b6a60', .2), ring = mix('#6e6074', .2);
    const s = `<path d="M-9 0L-6 -238H6L9 0Z" fill="${c}"/><path d="M1.5 -238L9 0H3.5L.6 -238Z" fill="${dk}"/>
      <path d="M-2.6 -236V0M2.6 -236V0" stroke="${dk}" stroke-width=".7" opacity=".5"/>
      <path d="M-6.5 -236L-30 -257H30L6.5 -236Z" fill="${dk}"/>
      <rect x="-38" y="-269" width="76" height="12" rx="2.4" fill="${ring}"/>
      <path d="M-38 -269H38L28 -289H-28Z" fill="${c}"/><rect x="-26" y="-289" width="52" height="5" fill="${dk}"/>
      <path d="M-4.4 -289L-1.2 -353H1.2L4.4 -289Z" fill="${dk}"/>` + rim('M9 0L6 -238') + rim('M38 -269L28 -289');
    const n = `<rect x="-38" y="-269" width="76" height="2.2" fill="#ff6ac8" opacity=".95"/><rect x="-26" y="-287" width="52" height="1.6" fill="#ffd28a" opacity=".9"/>
      <rect x="-.7" y="-236" width="1.4" height="236" fill="#ffd9a0" opacity=".5"/>` + beacon(0, -354) + glow(0, -354, 9, 'W', .5) + glow(0, -270, 54, 'P', .5);
    return { s, n };
  };

  /* ---------- north end ---------- */
  L.fontainebleau = () => {
    const c = mix('#223f60', .16);
    const s = `<path d="M-52 0V-166L-46 -182L-38 -197H38L46 -182L52 -166V0Z" fill="${c}"/>
      <path d="M12 0V-197H38L46 -182L52 -166V0Z" fill="${lite(c, .16)}" opacity=".55"/><path d="M-52 0V-166L-46 -182L-38 -197H-30V0Z" fill="${shade(c, .35)}" opacity=".5"/>
      <path d="M-17 0V-190M17 0V-190" stroke="#0c1c34" stroke-opacity=".5" stroke-width="1.2"/>` + win(-52, -197, 104, 197, { dy: 3.3, dx: 3, ww: 1.8, wh: 1.2, col: '#a9d3f2', op: .22 }) + rim('M52 -166V0');
    const n = `<path d="M-38 -197H38" stroke="#6ab4ff" stroke-width="1.6" opacity=".9"/>` + lit(-52, -197, 104, 197, { dy: 3.3, dx: 3, ww: 1.8, wh: 1.2, p: .12, col: '#cfe6ff' }) + glow(0, -190, 54, 'C', .38);
    return { s, n };
  };
  L.resortsWorld = () => {
    const c = mix('#8d4a3d', .16), red = mix('#c0402e', .16);
    const part = (x, w, h) => `<path d="M${x} 0V${-h}H${x + w}V0Z" fill="${c}"/><path d="M${f(x + w * .62)} 0V${-h}H${x + w}V0Z" fill="${lite(c, .12)}" opacity=".5"/>` + win(x, -h, w, h, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.4, col: '#ffcba0', op: .2 }) + (() => { let d = ''; for (let xx = x + 5; xx < x + w; xx += 9) d += `M${xx} 0V${-h}`; return `<path d="${d}" stroke="${red}" stroke-width="2" opacity=".75"/>`; })() + rim(`M${x + w} 0V${-h}`);
    const s = part(-58, 38, 150) + part(-18, 44, 188) + part(30, 36, 140);
    let n = '';
    [[-58, 38, 150], [-18, 44, 188], [30, 36, 140]].forEach(([x, w, h]) => { for (let xx = x + 5; xx < x + w; xx += 9) n += `<path d="M${xx} 0V${-h}" stroke="#ff5a48" stroke-width="1.4" opacity=".55"/>`; n += `<rect x="${x}" y="${-h}" width="${w}" height="1.6" fill="#fff6dc" opacity=".9"/>`; });
    return { s, n: n + lit(-18, -188, 44, 188, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.4, p: .1 }) + glow(0, -120, 70, 'P', .25) };
  };

  /* ---------- Wynn and Encore: curved bronze slabs, gold floor lines ---------- */
  L.wynn = () => {
    const c = mix('#775632', .14), gold = mix('#e2b255', .1);
    const body = (x, w, h0, h1, col) => `<path d="M${x} 0V${-h0}Q${f(x + w * .45)} ${-h0 - 6} ${x + w} ${-h1}V0Z" fill="${col}"/>`;
    const lines = (x, w, h1) => { let d = ''; for (let yy = 4.6; yy < h1 - 6; yy += 4.6) d += `M${x} ${-yy}H${x + w}`; return d; };
    const s = body(-26, 62, 166, 196, mix('#8d6a38', .14)) + `<path d="${lines(-26, 62, 196)}" stroke="${gold}" stroke-opacity=".7" stroke-width=".8"/>` +
      body(-38, 66, 158, 186, c) + `<path d="${lines(-38, 66, 186)}" stroke="${gold}" stroke-opacity=".85" stroke-width=".9"/>` +
      `<path d="M-38 -158Q-8 -164 28 -186V0H8V-170Z" fill="${shade(c, .35)}" opacity=".25"/>` + rim('M28 -186V0');
    let n = '';
    for (let yy = 4.6; yy < 180; yy += 4.6) n += `M-38 ${-yy}H28`;
    n = `<path d="${n}" stroke="#ffd28a" stroke-opacity=".62" stroke-width=".9"/><path d="M-30 -170Q-6 -175 16 -186" fill="none" stroke="#ffe6a8" stroke-width="2" opacity=".95"/>` + lit(-38, -186, 66, 186, { dy: 4.6, dx: 3.6, ww: 2, wh: 1.8, p: .22 }) + glow(-4, -176, 46, 'W', .4);
    return { s, n };
  };

  /* ---------- Palazzo and Venetian: stepped, crowned, sandstone ---------- */
  L.palazzo = () => {
    const c = mix('#cdb084', .16);
    const s = `<path d="M-28 0V-166L-23 -176V-190H23V-176L28 -166V0Z" fill="${c}"/><path d="M8 0V-190H23V-176L28 -166V0Z" fill="${lite(c, .14)}" opacity=".55"/><path d="M-28 0V-166L-23 -176V-190H-16V0Z" fill="${shade(c, .3)}" opacity=".4"/>
      <rect x="-3.6" y="-158" width="7.2" height="104" fill="#3a2f3a" opacity=".78"/><rect x="-24" y="-190" width="48" height="3" fill="${lite(c, .2)}"/>` + win(-28, -190, 56, 190, { dy: 4.2, dx: 3.4, col: '#4a3a40', op: .4 }) + rim('M28 -166V0');
    const n = `<path d="M-23 -190H23" stroke="#ffd28a" stroke-width="2" opacity=".95"/><rect x="-3.6" y="-158" width="7.2" height="104" fill="#ffd9a0" opacity=".5"/>` + lit(-28, -190, 56, 190, { p: .3 }) + glow(0, -184, 40, 'W', .45);
    return { s, n };
  };
  L.venetian = () => {
    const c = mix('#d6b88a', .16);
    let cren = ''; for (let xx = -56; xx < 56; xx += 7) cren += `M${xx} -132v-4h4v4`;
    const s = `<path d="M-60 0V-122H-52V-132H52V-122H60V0Z" fill="${c}"/><path d="M28 0V-132H52V-122H60V0Z" fill="${lite(c, .14)}" opacity=".5"/><path d="M-60 0V-122H-52V-132H-44V0Z" fill="${shade(c, .3)}" opacity=".35"/>
      <path d="${cren}" fill="none" stroke="${c}" stroke-width="1.2"/>` + win(-60, -132, 120, 132, { dy: 4.4, dx: 3.6, col: '#4a3a40', op: .38 }) + rim('M60 -122V0');
    const n = `<path d="M-52 -132H52" stroke="#ffd28a" stroke-width="1.8" opacity=".9"/>` + lit(-60, -132, 120, 132, { p: .3, dx: 3.6, dy: 4.4 }) + glow(0, -126, 66, 'W', .32);
    return { s, n };
  };
  L.sphere = () => {
    const cx = 0, cy = -56, rx = 78, ry = 56;
    const s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#1c1f46"/><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#7d86d8" stroke-width="1.2" opacity=".6"/>
      <path d="M${-rx * .62} ${cy - ry * .6}Q0 ${cy - ry * 1.02} ${rx * .62} ${cy - ry * .6}" fill="none" stroke="#9aa4ff" stroke-width="2" opacity=".35"/><path d="M-26 0L-14 -14H14L26 0Z" fill="#2c2f66"/>`;
    let n = '';
    const cols = ['#ff6ab0', '#6ad0ff', '#ffd166', '#9a7bff'], rr = SW.mk(44);
    for (let i = 0; i < 170; i++) { const a = rr() * Math.PI * 2, d = Math.sqrt(rr()); n += `<circle cx="${f(cx + Math.cos(a) * d * (rx - 3))}" cy="${f(cy + Math.sin(a) * d * (ry - 3))}" r="${f(.9 + rr() * 1.2)}" fill="${cols[Math.floor(rr() * 4)]}" opacity="${f(.5 + rr() * .5)}"/>`; }
    return { s, n: n + glow(0, cy, 118, 'V', .5) + glow(0, cy, 70, 'P', .3) };
  };

  /* ---------- Treasure Island, Mirage ---------- */
  L.treasure = () => {
    const a = mix('#c4936f', .16), b = mix('#d3a583', .16);
    const s = slab(-70, 64, 98, a, { w: { dy: 4.2, dx: 3.4, col: '#5a3a3a', op: .35 } }) + slab(2, 68, 106, b, { w: { dy: 4.2, dx: 3.4, col: '#5a3a3a', op: .35 } }) +
      `<rect x="-70" y="-106" width="140" height="3" fill="${lite(b, .18)}" opacity=".6"/>`;
    const n = lit(-70, -98, 64, 98, { p: .3 }) + lit(2, -106, 68, 106, { p: .3 }) + `<rect x="-60" y="-100" width="46" height="2" fill="#ff9aa8" opacity=".85"/>` + glow(0, -90, 80, 'W', .32);
    return { s, n };
  };
  L.mirage = () => {
    const c = mix('#a8844a', .16);
    const s = `<path d="M-32 0V-90L-12 -104H12L32 -90V0Z" fill="${c}"/><path d="M8 0V-104H12L32 -90V0Z" fill="${lite(c, .16)}" opacity=".6"/><path d="M-32 0V-90L-12 -104H-6V0Z" fill="${shade(c, .35)}" opacity=".35"/>` +
      win(-32, -104, 64, 104, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.4, col: '#2e2410', op: .3 }) + rim('M32 -90V0');
    return { s, n: lit(-32, -104, 64, 104, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.4, p: .3 }) + `<path d="M-12 -104H12" stroke="#ffd28a" stroke-width="1.6"/>` + glow(0, -98, 40, 'W', .3) };
  };

  /* ---------- the High Roller ---------- */
  L.highRoller = () => {
    const cy = -94, Rr = 83, st = mix('#7d7391', .1);
    let s = `<circle cx="0" cy="${cy}" r="${Rr}" fill="none" stroke="${st}" stroke-width="2.4"/><circle cx="0" cy="${cy}" r="${Rr - 9}" fill="none" stroke="${st}" stroke-width=".9"/>`;
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; s += `<path d="M0 ${cy}L${f(Math.cos(a) * Rr)} ${f(cy + Math.sin(a) * Rr)}" stroke="${st}" stroke-width=".5" opacity=".7"/>`; }
    for (let i = 0; i < 28; i++) { const a = i * Math.PI / 14; s += `<circle cx="${f(Math.cos(a) * Rr)}" cy="${f(cy + Math.sin(a) * Rr)}" r="2.1" fill="${mix('#c8bcd8', .1)}"/>`; }
    s += `<path d="M-36 0L0 ${cy}L36 0M-24 0L0 ${cy}L24 0" fill="none" stroke="${st}" stroke-width="2.6"/><rect x="-44" y="-8" width="88" height="8" fill="${shade(st, .2)}"/><circle cx="0" cy="${cy}" r="3.4" fill="${st}"/>`;
    let n = `<circle cx="0" cy="${cy}" r="${Rr}" fill="none" stroke="#a98aff" stroke-width="1.8" opacity=".9"/>`;
    for (let i = 0; i < 28; i++) { const a = i * Math.PI / 14; n += `<circle cx="${f(Math.cos(a) * Rr)}" cy="${f(cy + Math.sin(a) * Rr)}" r="1.9" fill="${i % 2 ? '#ffe2a8' : '#ffffff'}" opacity=".95"/>`; }
    return { s, n: n + glow(0, cy, 100, 'V', .3) };
  };

  /* ---------- Caesars Palace, Flamingo, Bellagio ---------- */
  L.caesars = () => {
    const a = mix('#dfcfae', .16), b = mix('#d6c19a', .16), c = mix('#e5d6b6', .16);
    const s = `<path d="M-62 0V-30H62V0Z" fill="${mix('#cdb890', .16)}"/>` +
      slab(-56, 28, 96, a) + `<path d="M-24 0V-124L-9 -132L6 -124V0Z" fill="${b}"/><path d="M-9 -132L6 -124V0H-9Z" fill="${lite(b, .14)}" opacity=".5"/>` + win(-24, -124, 30, 124, { dy: 4.2, dx: 3.4, col: '#5a4838', op: .36 }) +
      slab(10, 30, 110, c) + slab(40, 22, 84, a) + `<path d="M-30 -131H-2M-4 -132v-5h6v5" stroke="${lite(b, .3)}" stroke-width="1" fill="none"/>` + rim('M6 -124V0');
    const n = lit(-56, -96, 28, 96, { p: .3 }) + lit(-24, -124, 30, 124, { p: .3 }) + lit(10, -110, 30, 110, { p: .3 }) + lit(40, -84, 22, 84, { p: .3 }) + `<path d="M-62 -30H62" stroke="#ffd28a" stroke-width="1.4" opacity=".8"/>` + glow(-8, -126, 40, 'W', .4) + glow(0, -20, 70, 'P', .3);
    return { s, n };
  };
  L.flamingo = () => {
    const c = mix('#e8cdb9', .14), pk = mix('#d27a96', .12);
    const s = slab(-58, 116, 88, c, { w: { dy: 4, dx: 3.2, col: '#7a4a5a', op: .3 } }) + `<rect x="-14" y="-88" width="9" height="88" fill="${pk}" opacity=".85"/><rect x="-58" y="-88" width="116" height="3" fill="${pk}" opacity=".7"/>`;
    const n = lit(-58, -88, 116, 88, { dy: 4, dx: 3.2, p: .3, col: '#ffc0d0' }) + `<rect x="-14" y="-88" width="9" height="88" fill="#ff7ab0" opacity=".85"/><path d="M-58 -88H58" stroke="#ff7ab0" stroke-width="1.6" opacity=".9"/>` + glow(-10, -70, 70, 'P', .5);
    return { s, n };
  };
  L.bellagio = () => {
    const c = mix('#d6bc92', .16);
    const d = 'M-88 0V-100Q-62 -106 -44 -122L-18 -148H18L44 -122Q62 -106 88 -100V0Z';
    const s = `<path d="${d}" fill="${c}"/><path d="M26 0V-148H18L44 -122Q62 -106 88 -100V0Z" fill="${lite(c, .14)}" opacity=".5"/><path d="M-88 0V-100Q-62 -106 -44 -122L-30 -140V0Z" fill="${shade(c, .3)}" opacity=".35"/>
      <path d="M-88 -4H88" stroke="${shade(c, .2)}" stroke-width="3" opacity=".4"/>` + win(-88, -148, 176, 148, { dy: 4.2, dx: 3.4, col: '#5a4630', op: .32 }) + rim('M88 -100V0');
    const n = `<path d="M-18 -148H18L44 -122" fill="none" stroke="#ffd28a" stroke-width="1.6" opacity=".9"/>` + lit(-88, -148, 176, 148, { p: .32 }) + glow(0, -120, 100, 'W', .4);
    return { s, n };
  };
  L.cosmopolitan = () => {
    const c = mix('#667990', .16), c2 = mix('#738398', .16);
    const s = `<path d="M-32 0V-178L-24 -188H-2V0Z" fill="${c}"/><path d="M6 0V-160L14 -170H34V0Z" fill="${c2}"/><path d="M-2 0V-188H4V0Z" fill="${shade(c, .3)}" opacity=".5"/>
      <rect x="-42" y="-26" width="84" height="26" fill="${mix('#8a3c3a', .14)}"/>` + win(-32, -188, 30, 188, { dy: 3.4, dx: 3, ww: 1.8, wh: 1.2, col: '#e4ecf4', op: .2 }) + win(6, -170, 28, 170, { dy: 3.4, dx: 3, ww: 1.8, wh: 1.2, col: '#e4ecf4', op: .2 }) + rim('M34 -160V0');
    const n = lit(-32, -188, 30, 188, { dy: 3.4, dx: 3, ww: 1.8, wh: 1.2, p: .22, col: '#d4e8ff' }) + lit(6, -170, 28, 170, { dy: 3.4, dx: 3, ww: 1.8, wh: 1.2, p: .22, col: '#d4e8ff' }) + `<rect x="-42" y="-26" width="84" height="3" fill="#ff5a48" opacity=".85"/>` + glow(0, -150, 50, 'C', .3);
    return { s, n };
  };

  /* ---------- CityCenter: Aria's curved glass, Vdara's cylinder, the leaning Veer towers ---------- */
  L.cityCenter = () => {
    const g1 = mix('#7e90a2', .14), g2 = mix('#b4bec8', .14), g3 = mix('#c5c0b8', .14);
    const s = `<path d="M-60 0V-150Q-48 -184 -20 -190V0Z" fill="${g1}"/><path d="M-22 0V-160Q-4 -176 14 -168V0Z" fill="${shade(g1, .12)}"/>
      <path d="M-84 0V-170Q-66 -178 -48 -170V0Z" fill="${g2}"/><path d="M-66 0V-176H-60V0Z" fill="${shade(g2, .25)}" opacity=".5"/>
      <path d="M28 0L36 -148H54L46 0Z" fill="${g3}"/><path d="M52 0L44 -148H62L70 0Z" fill="${shade(g3, .1)}"/>
      <path d="M-8 0V-170L2 -190H16V0Z" fill="${mix('#aab4c0', .14)}"/>` +
      win(-60, -190, 40, 190, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, col: '#f0f4fa', op: .2 }) + win(-84, -176, 36, 176, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, col: '#f0f4fa', op: .2 }) + rim('M16 -170V0');
    const n = lit(-60, -190, 40, 190, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, p: .22, col: '#d4e8ff' }) + lit(-84, -176, 36, 176, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, p: .22, col: '#d4e8ff' }) + lit(-8, -190, 24, 190, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, p: .2 }) + glow(-30, -150, 70, 'C', .3);
    return { s, n };
  };

  /* ---------- Paris: the Eiffel Tower and the mansard hotel ---------- */
  L.paris = () => {
    const iron = mix('#4a3f38', .12), cream = mix('#e0c47e', .16), slate = mix('#4d4a58', .14);
    const hotel = `<path d="M10 0V-120H88V0Z" fill="${cream}"/><path d="M10 -120L16 -134H82L88 -120Z" fill="${slate}"/><path d="M60 0V-120H88V0Z" fill="${lite(cream, .12)}" opacity=".5"/>` + win(10, -120, 78, 120, { dy: 4, dx: 3.2, col: '#6a4a28', op: .35 }) + rim('M88 -120V0');
    const tower = `<path d="M-22 0L-9 -46L-5.5 -62L-4.2 -100L-2.5 -140L-1 -164H1L2.5 -140L4.2 -100L5.5 -62L9 -46L22 0H15C13 -12 9 -26 0 -34C-9 -26 -13 -12 -15 0Z" fill="${iron}"/>
      <rect x="-10" y="-47" width="20" height="3.4" fill="${iron}"/><rect x="-6.2" y="-101" width="12.4" height="2.6" fill="${iron}"/><rect x="-3.6" y="-141" width="7.2" height="2.2" fill="${iron}"/>
      <path d="M-9 -46L7 -62M9 -46L-7 -62M-5 -62L4 -100M5 -62L-4 -100M-4 -100L2.4 -140" stroke="${lite(iron, .25)}" stroke-width=".6" opacity=".7" fill="none"/>`;
    const n = `<path d="M-22 0L-9 -46L-5.5 -62L-4.2 -100L-2.5 -140L-1 -164H1L2.5 -140L4.2 -100L5.5 -62L9 -46L22 0" fill="none" stroke="#ffe2a8" stroke-width="1" opacity=".85"/>` + beacon(0, -166) + lit(10, -120, 78, 120, { dy: 4, dx: 3.2, p: .34 }) + `<path d="M10 -120H88" stroke="#ffd28a" stroke-width="1.6" opacity=".9"/>` + glow(0, -70, 60, 'W', .4) + glow(48, -90, 60, 'W', .3);
    return { s: hotel + tower, n };
  };
  L.ballys = () => {
    const c = mix('#7a5a48', .16);
    return { s: slab(-30, 60, 112, c, { w: { dy: 4, dx: 3.2, col: '#2a1c16', op: .36 } }), n: lit(-30, -112, 60, 112, { dy: 4, dx: 3.2, p: .3 }) };
  };
  L.planetHollywood = () => {
    const c = mix('#d2b48a', .16);
    const s = `<path d="M-34 0V-120Q0 -134 34 -120V0Z" fill="${c}"/><path d="M12 0V-130Q22 -128 34 -120V0Z" fill="${lite(c, .14)}" opacity=".5"/>` + win(-34, -130, 68, 130, { dy: 4, dx: 3.2, col: '#5a3f2a', op: .32 }) + rim('M34 -120V0');
    return { s, n: lit(-34, -130, 68, 130, { dy: 4, dx: 3.2, p: .3 }) + glow(0, -90, 50, 'W', .3) };
  };
  L.parkMgm = () => {
    const c = mix('#dbc59c', .16);
    return { s: slab(-42, 34, 108, c, { w: { dy: 4, dx: 3.2, col: '#5a4630', op: .34 } }) + slab(2, 40, 108, mix('#d2bc92', .16), { w: { dy: 4, dx: 3.2, col: '#5a4630', op: .34 } }), n: lit(-42, -108, 34, 108, { dy: 4, dx: 3.2, p: .3 }) + lit(2, -108, 40, 108, { dy: 4, dx: 3.2, p: .3 }) };
  };

  /* ---------- New York-New York: Empire State, Chrysler, brownstone set, Liberty ---------- */
  L.nyny = () => {
    const tan = mix('#c9a27c', .16), org = mix('#d89c6a', .16), gry = mix('#b6b0a6', .16), brn = mix('#a2745c', .16), pch = mix('#d8b49a', .16);
    const s = `<path d="M-50 0V-84H-30V0Z" fill="${brn}"/><path d="M-34 0V-96H-12V0Z" fill="${org}"/>
      <path d="M-12 0V-98L-10 -102V-114L-8 -118V-132H8V-118L10 -114V-102L12 -98V0Z" fill="${tan}"/><path d="M-1 -132L0 -156L1 -132Z" fill="${tan}"/><path d="M0 -132V-98L12 -98V0H0Z" fill="${lite(tan, .16)}" opacity=".5"/>
      <path d="M16 0V-94L20 -102L24 -112L27 -124L30 -150L33 -124L36 -112L40 -102L44 -94V0Z" fill="${gry}"/><path d="M22 -106L30 -120L38 -106M25 -116L30 -130L35 -116" fill="none" stroke="${lite(gry, .55)}" stroke-width=".9"/>
      <path d="M46 0V-78H66V0Z" fill="${pch}"/><path d="M-70 0V-52H-50V0Z" fill="${mix('#8a7e78', .16)}"/>
      <path d="M-2 0V-12L6 -26L10 -12V0Z" fill="${mix('#5b8a7a', .16)}" opacity="0"/>` +
      win(-34, -96, 22, 96, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, col: '#4a2f22', op: .3 }) + win(-12, -98, 24, 98, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, col: '#4a2f22', op: .3 }) + win(46, -78, 20, 78, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, col: '#4a2f22', op: .3 }) + rim('M12 -98V0');
    const n = lit(-34, -96, 22, 96, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, p: .32 }) + lit(-12, -98, 24, 98, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, p: .32 }) + lit(46, -78, 20, 78, { dy: 3.6, dx: 3, ww: 1.8, wh: 1.3, p: .32 }) +
      `<path d="M-8 -118H8M-1 -132L0 -156L1 -132" stroke="#ffd28a" stroke-width="1.4" fill="none" opacity=".95"/><path d="M22 -106L30 -120L38 -106M25 -116L30 -130L35 -116" fill="none" stroke="#ffe2a8" stroke-width="1.4" opacity=".9"/>` + beacon(0, -157) + glow(0, -120, 40, 'P', .4) + glow(30, -110, 34, 'C', .35);
    return { s, n };
  };
  L.mgmGrand = () => {
    const c = mix('#3f8f70', .18);
    const s = slab(-62, 124, 94, c, { w: { dy: 4, dx: 3.2, col: '#0e3328', op: .32 } }) + `<rect x="-62" y="-94" width="124" height="3" fill="${mix('#e2b255', .14)}"/>`;
    return { s, n: lit(-62, -94, 124, 94, { dy: 4, dx: 3.2, p: .3, col: '#c8ffd8' }) + `<path d="M-62 -94H62" stroke="#ffd28a" stroke-width="1.6" opacity=".9"/>` + glow(0, -80, 80, 'C', .3) };
  };
  L.excalibur = () => {
    const w = mix('#e6e0d6', .16), red = mix('#c23a3a', .14), blue = mix('#2e5aa8', .14), gold = mix('#d9a73c', .14);
    const tur = (x, c, h) => `<rect x="${x - 7}" y="${-h}" width="14" height="${h}" fill="${w}"/><path d="M${x - 9} ${-h}L${x} ${-h - 24}L${x + 9} ${-h}Z" fill="${c}"/><rect x="${x - 7}" y="${-h}" width="14" height="3" fill="${c}"/>`;
    const s = slab(-72, 34, 88, w, { w: { dy: 4, dx: 3.2, col: '#5a5668', op: .3 } }) + slab(38, 34, 88, w, { w: { dy: 4, dx: 3.2, col: '#5a5668', op: .3 } }) + `<path d="M-72 0V-52H72V0Z" fill="${mix('#ddd6c8', .16)}"/>` +
      tur(-54, red, 68) + tur(-18, blue, 76) + tur(18, gold, 76) + tur(54, red, 68);
    const n = lit(-72, -88, 34, 88, { dy: 4, dx: 3.2, p: .3 }) + lit(38, -88, 34, 88, { dy: 4, dx: 3.2, p: .3 }) + `<path d="M-63 -92L-54 -116L-45 -92M-27 -100L-18 -124L-9 -100M9 -100L18 -124L27 -100M45 -92L54 -116L63 -92" stroke="#ff9aa8" stroke-width="1.2" fill="none" opacity=".8"/>` + glow(0, -60, 90, 'P', .3);
    return { s, n };
  };

  /* ---------- Luxor: the black pyramid and its beam ---------- */
  L.luxor = () => {
    const c = mix('#16192e', .1);
    const s = `<path d="M-120 0V-64H-96V-78H-70V0Z" fill="${mix('#12152a', .1)}"/><path d="M-102 0L0 -106L102 0Z" fill="${c}"/><path d="M0 -106L102 0H30Z" fill="#4a4f86" opacity=".5"/>` +
      `<path d="M0 -106L102 0" stroke="#ffb27a" stroke-opacity=".5" stroke-width="1"/>` + `<path d="M-1.6 -108L-30 -330H30L1.6 -108Z" fill="#fff3d0" opacity=".06"/>`;
    let n = `<path d="M-1.8 -108L-26 -360H26L1.8 -108Z" fill="#fff3d0" opacity=".22"/><path d="M-1 -108L-9 -380H9L1 -108Z" fill="#fff3d0" opacity=".28"/><circle cx="0" cy="-108" r="3" fill="#fff6dc"/>` + glow(0, -108, 50, 'W', .6);
    n += `<path d="M-102 0L0 -106L102 0" fill="none" stroke="#ffd28a" stroke-width="1" opacity=".35"/>`;
    return { s, n };
  };

  /* ---------- Mandalay Bay and THEhotel: the long gold slab ---------- */
  L.mandalay = () => {
    const c = mix('#bb9356', .16);
    let ribs = ''; for (let xx = -108; xx < 108; xx += 8) ribs += `M${xx} 0V-170`;
    const s = `<path d="M-112 0V-170H112V0Z" fill="${c}"/><path d="M60 0V-170H112V0Z" fill="${lite(c, .16)}" opacity=".5"/><path d="M-112 0V-170H-84V0Z" fill="${shade(c, .3)}" opacity=".35"/>
      <path d="${ribs}" stroke="${shade(c, .35)}" stroke-width="2.2" opacity=".5"/><rect x="-112" y="-176" width="224" height="6" fill="${shade(c, .25)}"/><rect x="-60" y="-181" width="120" height="5" fill="${shade(c, .25)}"/>` +
      `<path d="M-132 0V-92H-112V0Z" fill="${shade(c, .08)}"/>` + `<path d="M120 0V-150H162V0Z" fill="${mix('#3c3f50', .16)}"/><path d="M120 0V-150H132V0Z" fill="${lite(mix('#3c3f50', .16), .14)}" opacity=".5"/>` + rim('M112 -170V0');
    const n = `<path d="M-112 -176H112" stroke="#ffd28a" stroke-width="1.6" opacity=".9"/>` + lit(-112, -170, 224, 170, { dy: 4.2, dx: 3.6, p: .3 }) + lit(120, -150, 42, 150, { dy: 4.2, dx: 3.6, p: .2, col: '#bfd0ff' }) + glow(0, -160, 120, 'W', .38);
    return { s, n };
  };

  /* ---------- downtown ---------- */
  L.circa = () => {
    const c = mix('#9b8078', .2);
    const s = slab(-24, 48, 150, c, { w: { dy: 4, dx: 3.4, col: '#3a2c30', op: .36 } }) + `<rect x="-24" y="-150" width="48" height="8" fill="${mix('#3a3350', .2)}"/>`;
    return { s, n: lit(-24, -150, 48, 150, { dy: 4, dx: 3.4, p: .3 }) + `<rect x="-24" y="-150" width="48" height="8" fill="#ffd28a" opacity=".6"/>` + glow(0, -148, 40, 'W', .4) };
  };
  L.goldenNugget = () => {
    const c = mix('#d8b878', .2);
    return { s: slab(-32, 28, 96, c, { w: { dy: 4, dx: 3.4, col: '#5a4628', op: .3 } }) + slab(2, 30, 118, mix('#e0c488', .2), { w: { dy: 4, dx: 3.4, col: '#5a4628', op: .3 } }), n: lit(-32, -96, 28, 96, { p: .3 }) + lit(2, -118, 30, 118, { p: .3 }) + glow(0, -90, 50, 'W', .4) };
  };
  L.plaza = () => {
    const c = mix('#e4d3b8', .2);
    return { s: slab(-12, 24, 120, c, { w: { dy: 4, dx: 3.4, col: '#5a4a3c', op: .3 } }), n: lit(-12, -120, 24, 120, { p: .3 }) + `<rect x="-12" y="-120" width="24" height="3" fill="#ff5a48" opacity=".9"/>` + glow(0, -116, 30, 'W', .4) };
  };

  SW.LV = L;
  SW.LVhelp = { glow, mix, slab };
})(window.SW = window.SW || {});
