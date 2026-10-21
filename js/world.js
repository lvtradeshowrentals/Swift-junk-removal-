/* ============================================================================
   The near world: one long street, built as 1000-unit segments (fg units, 520 tall,
   bottom-anchored). Houses, walls, palms and yards are procedural and seeded; the
   five job lots are laid out at fixed anchors so the ride can stop on them.
   ========================================================================== */
(function (SW) {
  'use strict';
  const { mk, f } = SW;
  const G = SW.G;

  const X_MIN = -200, X_MAX = 7300, SEG_W = 1000;

  /* ---------- job piles: what is waiting at each stop. dx is from the anchor, y is the ground line ---------- */
  SW.JOBS = [
    { y: 394, items: [['box', -78], ['boxStack', -42], ['mattress', 0, 'lean'], ['bike', 40], ['armchair', 84]] },
    { y: 404, items: [['couch', -92], ['fridge', -30], ['tv', 12], ['mattress', 52, 'lean'], ['box', 96]] },
    { y: 396, items: [['lumber', -84], ['drywall', -28], ['bags', 22], ['bucket', 56], ['cabinet', 92]] },
    { y: 396, items: [['desk', -90], ['chair', -40], ['filing', -6], ['boxStack', 34], ['monitor', 78]] },
    { y: 396, items: [['dresser', -88], ['armchair', -34], ['boxStack', 12], ['lamp', 50], ['frames', 88]] },
  ];

  /* ---------- low-level drawing helpers ---------- */
  function newSeg(x0) { return { x0, w: SEG_W, back: '', front: '', yard: '', street: '', props: '', lights: '' }; }
  const light = (S, x, y, r, kind) => { S.lights += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${kind === 'c' ? 'glowC' : 'glowW'})"/>`; };
  const stucco = (x, y, w, h, fill) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#${fill})"/><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#wallShade)"/><rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="url(#stuccoPat)" opacity=".7"/>`;

  function windowArt(S, x, y, w, h, lit) {
    if (lit) light(S, x + w / 2, y + h / 2, w * 1.25);
    return `<g>
      <rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" rx="2" fill="#f0d6c4"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${lit ? 'url(#winGlow)' : '#2c3c63'}"/>
      ${lit ? '' : `<path d="M${x} ${y + h} L${x + w * .55} ${y} H${x + w * .8} L${x + w * .25} ${y + h} Z" fill="#ffb27a" opacity=".22"/>`}
      <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="#f0d6c4" stroke-width="2"/>
      <rect x="${x - 4}" y="${y + h + 3}" width="${w + 8}" height="3" fill="#b57e6e"/></g>`;
  }
  function roofArt(x0, x1, yEave, rise, inset) {
    const pts = `${x0 - 12},${yEave} ${x1 + 12},${yEave} ${x1 - inset},${yEave - rise} ${x0 + inset},${yEave - rise}`;
    return `<polygon points="${pts}" fill="url(#tile)"/><polygon points="${pts}" fill="url(#roofLight)"/>
      <path d="M${x0 + inset} ${yEave - rise} L${x1 - inset} ${yEave - rise}" stroke="#ffc690" stroke-width="2.2" opacity=".75"/>
      <path d="M${x1 + 12} ${yEave} L${x1 - inset} ${yEave - rise}" stroke="#ffb27a" stroke-width="1.6" opacity=".55"/>
      <rect x="${x0 - 12}" y="${yEave}" width="${x1 - x0 + 24}" height="6" fill="#d4b2a2"/>
      <rect x="${x0 - 12}" y="${yEave + 6}" width="${x1 - x0 + 24}" height="9" fill="#1a1030" opacity=".5"/>`;
  }
  function archDoor(S, x, base, w, h, lamp) {
    const cx = x + w / 2;
    if (lamp) light(S, x - 14, base - h + 28, 20);
    return `<path d="M${x} ${base} V${base - h + w / 2} Q${x} ${base - h} ${cx} ${base - h} Q${x + w} ${base - h} ${x + w} ${base - h + w / 2} V${base} Z" fill="#2a1d3c"/>
      <path d="M${x} ${base} V${base - h + w / 2} Q${x} ${base - h} ${cx} ${base - h} Q${x + w} ${base - h} ${x + w} ${base - h + w / 2} V${base} Z" fill="none" stroke="#e8c9b4" stroke-width="5"/>
      <path d="M${x + 10} ${base} V${base - h + w / 2 + 4} Q${x + 10} ${base - h + 12} ${cx} ${base - h + 12} Q${x + w - 10} ${base - h + 12} ${x + w - 10} ${base - h + w / 2 + 4} V${base} Z" fill="#2e6a66"/>
      <rect x="${cx - 2}" y="${base - h * .38}" width="3" height="3" fill="#ffd9a0"/>
      ${lamp ? `<circle cx="${x - 14}" cy="${base - h + 28}" r="4.2" fill="#ffe2a8"/>` : ''}`;
  }

  /* ---------- palms, agaves, boulders ---------- */
  function palm(x, base, h, lean, seed, sc) {
    sc = sc || 1;
    const r = mk(seed), tx = x + lean, ty = base - h;
    let s = '';
    const w0 = 9 * sc, w1 = 5.5 * sc, cx = x + lean * .15, cy = base - h * .55;
    s += `<path d="M${f(x - w0)} ${base} Q${f(cx - w0 * .8)} ${f(cy)} ${f(tx - w1)} ${f(ty)} L${f(tx + w1)} ${f(ty)} Q${f(cx + w0 * .8)} ${f(cy)} ${f(x + w0)} ${base} Z" fill="#4a3a55"/>`;
    s += `<path d="M${f(x + w0 * .2)} ${base} Q${f(cx + w0 * .5)} ${f(cy)} ${f(tx + w1 * .3)} ${f(ty)} L${f(tx + w1)} ${f(ty)} Q${f(cx + w0 * .8)} ${f(cy)} ${f(x + w0)} ${base} Z" fill="#c78c72" opacity=".55"/>`;
    for (let t = .02; t < .98; t += 10 / h) {
      const px = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * tx, py = base - h * t, ww = w0 + (w1 - w0) * t;
      s += `<path d="M${f(px - ww)} ${f(py)} Q${f(px)} ${f(py + 3.2)} ${f(px + ww)} ${f(py)}" fill="none" stroke="#1d1530" stroke-width="1" opacity=".5"/>`;
    }
    for (let i = 0; i < 9; i++) {
      const a = 100 + i * 17 + r() * 8, L = (18 + r() * 12) * sc, rad = a * Math.PI / 180;
      s += `<path d="M${f(tx)} ${f(ty + 3)} Q${f(tx + Math.cos(rad) * L * .5)} ${f(ty + 3 + L * .2)} ${f(tx + Math.cos(rad) * L * .8)} ${f(ty + L * .8)}" stroke="#6b4a3c" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
    }
    const N = 15, fronds = [];
    for (let i = 0; i < N; i++) fronds.push({ a: -176 + (i / (N - 1)) * 172 + (r() - .5) * 10, L: (58 + r() * 34) * sc });
    [[0, '#10332f', '#1a4a40'], [1, '#1d5646', '#2f7a5a']].forEach(([pass, dark, light_]) => {
      fronds.forEach((fr, i) => {
        if ((i % 2) !== pass) return;
        const rad = fr.a * Math.PI / 180, dx = Math.cos(rad), dy = Math.sin(rad), L = fr.L;
        const c1x = tx + dx * L * .5, c1y = ty + dy * L * .5 - L * .22, ex = tx + dx * L, ey = ty + dy * L + L * .26;
        let leaf = '';
        for (let t = .1; t <= .98; t += .055) {
          const u = 1 - t, px = u * u * tx + 2 * u * t * c1x + t * t * ex, py = u * u * ty + 2 * u * t * c1y + t * t * ey;
          const tgx = 2 * u * (c1x - tx) + 2 * t * (ex - c1x), tgy = 2 * u * (c1y - ty) + 2 * t * (ey - c1y);
          const m = Math.hypot(tgx, tgy) || 1, nx = -tgy / m, ny = tgx / m, ll = (15 - t * 7) * sc;
          const bx = tgx / m * ll * .45, by = tgy / m * ll * .45;
          leaf += `M${f(px)} ${f(py)} l${f(nx * ll + bx)} ${f(ny * ll + by + ll * .3)} M${f(px)} ${f(py)} l${f(-nx * ll + bx)} ${f(-ny * ll + by + ll * .3)} `;
        }
        const warm = dx > .1;
        s += `<path d="M${f(tx)} ${f(ty)} Q${f(c1x)} ${f(c1y)} ${f(ex)} ${f(ey)}" stroke="${dark}" stroke-width="2.2" fill="none"/>`;
        s += `<path d="${leaf}" stroke="${warm ? light_ : dark}" stroke-width="1.5" stroke-linecap="round" fill="none"/>`;
        if (warm) s += `<path d="${leaf}" stroke="#ffb27a" stroke-width=".9" stroke-opacity=".3" stroke-linecap="round" fill="none" transform="translate(.8 -.8)"/>`;
      });
    });
    return s + `<circle cx="${f(tx)}" cy="${f(ty + 2)}" r="${f(6 * sc)}" fill="#3b2d4a"/>`;
  }
  function agave(x, y, sc, seed) {
    const r = mk(seed); let s = '';
    for (let i = 0; i < 13; i++) {
      const a = -90 + (i - 6) * 13.5 + (r() - .5) * 5, L = (22 + r() * 8) * sc, rad = a * Math.PI / 180;
      const tx = x + Math.cos(rad) * L, ty = y + Math.sin(rad) * L, nx = -Math.sin(rad) * 2.6 * sc, ny = Math.cos(rad) * 2.6 * sc;
      const shade = Math.abs(i - 6) / 6;
      s += `<path d="M${f(x - nx)} ${f(y - ny)} Q${f(x + Math.cos(rad) * L * .55 + nx * 1.6)} ${f(y + Math.sin(rad) * L * .55 + ny * 1.6)} ${f(tx)} ${f(ty)} Q${f(x + Math.cos(rad) * L * .55 - nx * 1.6)} ${f(y + Math.sin(rad) * L * .55 - ny * 1.6)} ${f(x + nx)} ${f(y + ny)} Z" fill="${shade > .6 ? '#2c6a5f' : '#3f8a74'}"/>`;
      s += `<path d="M${f(x)} ${f(y)} L${f(tx)} ${f(ty)}" stroke="#a8e0b8" stroke-opacity=".5" stroke-width=".7"/>`;
    }
    return s;
  }
  const boulder = (x, y, w, h) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="url(#boulder)"/><ellipse cx="${f(x + w * .25)}" cy="${f(y - h * .4)}" rx="${f(w * .45)}" ry="${f(h * .3)}" fill="#ffc9a0" opacity=".35"/>`;
  const barrel = (x, y, s) => `<ellipse cx="${x}" cy="${y - 7 * s}" rx="${7 * s}" ry="${8 * s}" fill="#4c8a6a"/><path d="M${x - 5 * s} ${y - 12 * s} V${y} M${x} ${y - 15 * s} V${y} M${x + 5 * s} ${y - 12 * s} V${y}" stroke="#2c5a44" stroke-width="1"/><circle cx="${x}" cy="${y - 16 * s}" r="${2 * s}" fill="#e8803f"/>`;

  /* ---------- houses ---------- */
  function houseA(S, x, w, o) {
    o = o || {};
    const base = G.BASE, top = 214, wallH = base - top - 15;
    let s = roofArt(x, x + w, top, 40, 60) + stucco(x, top + 15, w, wallH, o.wall || 'wallA');
    if (o.garage) {
      const gx = x + 28, gw = 196, gy = 252, gh = 94;
      s += `<rect x="${gx - 8}" y="${gy - 8}" width="${gw + 16}" height="${gh + 10}" fill="#e8c9b4"/>`;
      s += garageInterior(S, gx, gy, gw, gh, o.garage);
      s += windowArt(S, x + 254, 262, 56, 44, true);
      s += archDoor(S, x + w - 120 + 16, base, 48, 102, true);
    } else {
      s += archDoor(S, x + w * .56, base, 48, 102, true);
      s += windowArt(S, x + w * .18, 262, 58, 44, o.lit !== false);
      s += windowArt(S, x + w * .72, 262, 62, 44, false);
    }
    s += `<rect x="${x}" y="${base - 6}" width="${w}" height="6" fill="#8a6478" opacity=".7"/>`;
    S.back += s;
  }

  /* the garage with its door rolled up: warm light, shelving, clutter. clutter group id lets the job fade it out */
  function garageInterior(S, gx, gy, gw, gh, id) {
    const sil = '#2a1c33';
    light(S, gx + gw / 2, gy + gh * .55, 120);
    let g = `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="url(#garageGlow)"/>`;
    g += `<g id="${id}" opacity=".95">
      <rect x="${gx + 4}" y="${gy + 26}" width="46" height="3" fill="${sil}"/><rect x="${gx + 4}" y="${gy + 50}" width="46" height="3" fill="${sil}"/>
      <rect x="${gx + 4}" y="${gy + 26}" width="2.5" height="68" fill="${sil}"/><rect x="${gx + 47}" y="${gy + 26}" width="2.5" height="68" fill="${sil}"/>
      <rect x="${gx + 9}" y="${gy + 13}" width="16" height="13" fill="#5b3a38"/><rect x="${gx + 27}" y="${gy + 16}" width="18" height="10" fill="#6b4640"/>
      <rect x="${gx + 8}" y="${gy + 37}" width="14" height="13" fill="#5b3a38"/><rect x="${gx + 25}" y="${gy + 34}" width="20" height="16" fill="#74504a"/>
      <rect x="${gx + 10}" y="${gy + 58}" width="18" height="14" fill="#6b4640"/><rect x="${gx + 30}" y="${gy + 62}" width="14" height="10" fill="#5b3a38"/>
      <rect x="${gx + 56}" y="${gy + 44}" width="40" height="50" rx="3" fill="${sil}"/><rect x="${gx + 56}" y="${gy + 44}" width="40" height="12" rx="3" fill="#3a2742"/>
      <rect x="${gx + 100}" y="${gy + 26}" width="20" height="68" fill="#4d3a58" transform="rotate(8 ${gx + 110} ${gy + 94})"/>
      <rect x="${gx + 124}" y="${gy + 58}" width="26" height="36" fill="#6b4640"/><rect x="${gx + 130}" y="${gy + 40}" width="22" height="20" fill="#5b3a38"/>
      <circle cx="${gx + 160}" cy="${gy + 78}" r="13" fill="none" stroke="${sil}" stroke-width="3"/><circle cx="${gx + 182}" cy="${gy + 78}" r="13" fill="none" stroke="${sil}" stroke-width="3"/>
    </g>`;
    g += `<rect x="${gx}" y="${gy}" width="${gw}" height="26" fill="#e9d7cd"/>`;
    for (let i = 0; i < 2; i++) g += `<rect x="${gx + 4}" y="${gy + 3 + i * 12}" width="${gw - 8}" height="9" fill="none" stroke="#b79a92" stroke-width="1.2"/>`;
    return g + `<rect x="${gx}" y="${gy + 26}" width="${gw}" height="4" fill="#1a1030" opacity=".4"/>`;
  }

  function houseB(S, x, w) {
    const base = G.BASE, wallH = 150, top = base - wallH, cx = x + w / 2;
    let s = stucco(x, top, w, wallH, 'wallD');
    const pts = `${x - 14},${top} ${x + w + 14},${top} ${x + w - 70},${top - 38} ${x + 70},${top - 38}`;
    s = `<polygon points="${pts}" fill="url(#tile)"/><polygon points="${pts}" fill="url(#roofLight)"/>
      <path d="M${x + 70} ${top - 38} H${x + w - 70}" stroke="#ffc690" stroke-width="2.2" opacity=".75"/>
      <rect x="${x + w * .78}" y="${top - 56}" width="22" height="40" fill="#8a5448"/><rect x="${x + w * .78 - 3}" y="${top - 60}" width="28" height="6" fill="#a8685a"/>` + s +
      `<rect x="${x - 14}" y="${top}" width="${w + 28}" height="6" fill="#d4b2a2"/><rect x="${x - 14}" y="${top + 6}" width="${w + 28}" height="9" fill="#1a1030" opacity=".5"/>`;
    /* upper floor */
    [[.14, true], [.4, false], [.66, true]].forEach(([k, lit]) => { s += windowArt(S, x + w * k, top + 34, 50, 46, lit); });
    s += `<rect x="${cx - 44}" y="${top + 92}" width="88" height="4" fill="#3a2d42"/>`;
    for (let i = 0; i <= 10; i++) s += `<rect x="${cx - 44 + i * 8.7}" y="${top + 80}" width="2" height="14" fill="#3a2d42"/>`;
    /* ground floor */
    s += archDoor(S, cx - 28, base, 56, 104, true);
    s += windowArt(S, x + w * .1, base - 82, 56, 52, true) + windowArt(S, x + w * .72, base - 82, 56, 52, false);
    s += `<rect x="${cx - 44}" y="${base - 112}" width="6" height="112" fill="#e8c9b4"/><rect x="${cx + 38}" y="${base - 112}" width="6" height="112" fill="#e8c9b4"/>`;
    s += `<rect x="${x}" y="${base - 6}" width="${w}" height="6" fill="#8a6478" opacity=".7"/>`;
    S.back += s;
  }

  function houseC(S, x, w) {
    const base = G.BASE, lowH = 104, upH = 64, lowTop = base - lowH;
    const ux = x + w * .3, uw = w * .56;
    let s = stucco(x, lowTop, w, lowH, 'wallC');
    s += `<rect x="${x - 6}" y="${lowTop - 7}" width="${w + 12}" height="8" fill="#e4d2c6"/><rect x="${x - 6}" y="${lowTop + 1}" width="${w + 12}" height="4" fill="#1a1030" opacity=".4"/>`;
    s += stucco(ux, lowTop - upH, uw, upH + 1, 'wallC');
    s += `<rect x="${ux - 6}" y="${lowTop - upH - 7}" width="${uw + 12}" height="8" fill="#e4d2c6"/><rect x="${ux - 6}" y="${lowTop - upH + 1}" width="${uw + 12}" height="4" fill="#1a1030" opacity=".4"/>`;
    s += `<rect x="${ux + uw - 34}" y="${lowTop - upH}" width="22" height="${upH}" fill="#c4632d" opacity=".92"/><rect x="${ux + uw - 34}" y="${lowTop - upH}" width="22" height="${upH}" fill="url(#stuccoPat)" opacity=".5"/>`;
    s += windowArt(S, ux + 18, lowTop - upH + 14, 62, 36, true);
    /* big glazed wall + garage */
    light(S, x + w * .22, lowTop + 46, 110);
    s += `<rect x="${x + 14}" y="${lowTop + 16}" width="${w * .36}" height="72" rx="2" fill="url(#winGlow)"/><rect x="${x + 14}" y="${lowTop + 16}" width="${w * .36}" height="72" fill="none" stroke="#2a2f45" stroke-width="3"/>`;
    for (let i = 1; i < 4; i++) s += `<path d="M${f(x + 14 + i * w * .36 / 4)} ${lowTop + 16} V${lowTop + 88}" stroke="#2a2f45" stroke-width="2"/>`;
    s += `<rect x="${x + w * .5}" y="${lowTop + 22}" width="${w * .26}" height="${lowH - 22}" fill="#2a2f45"/>`;
    for (let i = 1; i < 5; i++) s += `<path d="M${f(x + w * .5)} ${lowTop + 22 + i * 16} h${f(w * .26)}" stroke="#4a5272" stroke-width="1.2"/>`;
    s += `<rect x="${x + w * .82}" y="${lowTop + 10}" width="${w * .14}" height="${lowH - 10}" fill="url(#slats)" opacity=".85"/>`;
    s += `<rect x="${x}" y="${base - 6}" width="${w}" height="6" fill="#6a5a72" opacity=".7"/>`;
    S.back += s;
  }

  /* a house frame: studs, trusses, house wrap, scaffolding. The construction stop. */
  function frameHouse(S, x, w) {
    const base = G.BASE, top = 232;
    let s = `<rect x="${x - 8}" y="${base - 6}" width="${w + 16}" height="8" fill="#8a8394"/>`;
    /* house-wrap panel on the left third */
    s += `<rect x="${x}" y="${top}" width="${w * .3}" height="${base - top - 6}" fill="#dfe3ea"/><rect x="${x}" y="${top}" width="${w * .3}" height="${base - top - 6}" fill="url(#wallShade)"/>`;
    s += `<path d="M${x + 14} ${top + 30} h52 M${x + 14} ${top + 40} h38" stroke="#8d96a8" stroke-width="2" opacity=".6"/>`;
    /* studs */
    for (let sx = x + w * .3; sx <= x + w - 6; sx += 16) s += `<rect x="${f(sx)}" y="${top}" width="5" height="${base - top - 6}" fill="url(#woodG)"/><rect x="${f(sx + 3.6)}" y="${top}" width="1.4" height="${base - top - 6}" fill="#fff" opacity=".25"/>`;
    s += `<rect x="${x}" y="${top - 6}" width="${w}" height="7" fill="url(#woodG)"/><rect x="${x}" y="${base - 12}" width="${w}" height="6" fill="url(#woodG)"/>`;
    /* roof trusses, half sheathed */
    for (let tx = x; tx < x + w - 40; tx += 56) {
      s += `<path d="M${tx} ${top - 6} L${tx + 28} ${top - 50} L${tx + 56} ${top - 6}" fill="none" stroke="#d6ae74" stroke-width="5" stroke-linejoin="round"/><path d="M${tx + 14} ${top - 28} H${tx + 42} M${tx + 28} ${top - 50} V${top - 6}" stroke="#c79b60" stroke-width="3"/>`;
    }
    s += `<polygon points="${x + w * .52},${top - 6} ${x + w + 4},${top - 6} ${x + w - 28},${top - 50} ${x + w * .52 + 28},${top - 50}" fill="#c9a470" opacity=".95"/><path d="M${x + w * .52 + 28} ${top - 50} H${x + w - 28}" stroke="#ffd29a" stroke-width="1.5" opacity=".6"/>`;
    /* openings */
    s += `<rect x="${x + w * .4}" y="${top + 28}" width="50" height="42" fill="none" stroke="#b98c58" stroke-width="3"/><rect x="${x + w * .66}" y="${top + 34}" width="42" height="${base - top - 40}" fill="none" stroke="#b98c58" stroke-width="3"/>`;
    /* scaffolding on the right */
    const sx0 = x + w - 120;
    for (let lvl = 0; lvl < 2; lvl++) {
      const y0 = base - 6 - lvl * 54;
      s += `<rect x="${sx0 - 4}" y="${y0 - 3}" width="136" height="5" fill="#8a7a64"/>`;
      [0, 62, 124].forEach((dx) => { s += `<rect x="${sx0 + dx}" y="${y0 - 54}" width="4" height="54" fill="#aab2c6"/>`; });
      s += `<path d="M${sx0 + 2} ${y0} L${sx0 + 64} ${y0 - 54} M${sx0 + 64} ${y0} L${sx0 + 126} ${y0 - 54}" stroke="#8d96ac" stroke-width="2"/>`;
    }
    s += `<rect x="${sx0 - 4}" y="${base - 6 - 108 - 3}" width="136" height="5" fill="#8a7a64"/>`;
    S.back += s;
    /* chain-link fence along the front, with a gap for the dumpster and pile */
    let fnc = '';
    [[x - 40, x + 150], [x + 330, x + w + 40]].forEach(([a, b]) => {
      fnc += `<rect x="${a}" y="334" width="${b - a}" height="36" fill="url(#chain)" opacity=".8"/><rect x="${a}" y="332" width="${b - a}" height="3" fill="#aab2c6"/>`;
      for (let px = a; px <= b; px += 46) fnc += `<rect x="${px}" y="330" width="4" height="42" fill="#7d869c"/>`;
    });
    S.front += fnc;
  }

  /* strip of shops: one unit is vacant ("for lease") and that is where the pile waits */
  function storefront(S, x, w) {
    const base = G.BASE, top = base - 114;
    let s = stucco(x, top, w, 114, 'wallD');
    s += `<rect x="${x - 6}" y="${top - 9}" width="${w + 12}" height="10" fill="#e9d9cb"/><rect x="${x - 6}" y="${top + 1}" width="${w + 12}" height="4" fill="#1a1030" opacity=".4"/>`;
    const units = [[x + 8, 188, '#16265a', 'OFFICE'], [x + 206, 188, null, 'FOR LEASE'], [x + 404, 188, '#c4632d', 'STUDIO']];
    units.forEach(([ux, uw, awn, label], i) => {
      s += `<rect x="${ux}" y="${top + 36}" width="${uw}" height="72" fill="#1d2338"/>`;
      if (awn) {
        s += `<path d="M${ux - 4} ${top + 34} H${ux + uw + 4} L${ux + uw - 6} ${top + 54} H${ux + 6} Z" fill="${awn}"/><path d="M${ux + 6} ${top + 54} H${ux + uw - 6}" stroke="#fff" stroke-opacity=".2"/>`;
        s += `<text x="${ux + uw / 2}" y="${top + 24}" text-anchor="middle" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="700" font-size="14" letter-spacing="3" fill="#2a2140">${label}</text>`;
        s += `<rect x="${ux + 12}" y="${top + 58}" width="${uw - 24}" height="48" fill="url(#winGlow)" opacity=".92"/><path d="M${ux + uw / 2} ${top + 58} V${top + 106}" stroke="#2a2f45" stroke-width="3"/>`;
        light(S, ux + uw / 2, top + 82, 70);
      } else {
        s += `<rect x="${ux + 12}" y="${top + 42}" width="${uw - 24}" height="64" fill="#e9eaf0"/><path d="M${ux + 12} ${top + 42} L${ux + uw - 12} ${top + 106} M${ux + uw - 12} ${top + 42} L${ux + 12} ${top + 106}" stroke="#c4c8d6" stroke-width="1"/>`;
        s += `<rect x="${ux + 20}" y="${top + 8}" width="${uw - 40}" height="24" rx="2" fill="#c4632d"/><text x="${ux + uw / 2}" y="${top + 25}" text-anchor="middle" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="700" font-size="13" letter-spacing="2.4" fill="#fff">${label}</text>`;
      }
    });
    s += `<rect x="${x}" y="${base - 6}" width="${w}" height="6" fill="#8a6478" opacity=".7"/>`;
    /* a parking-lot light pole */
    s += `<rect x="${x + w + 14}" y="${base - 150}" width="4" height="150" fill="#2a2f40"/><path d="M${x + w + 16} ${base - 150} h-20" stroke="#2a2f40" stroke-width="3"/><circle cx="${x + w - 4}" cy="${base - 148}" r="3.4" fill="#ffd590"/>`;
    light(S, x + w - 4, base - 146, 40);
    S.back += s;
  }

  function dumpster(S, x, y, sc) {
    const w = 168 * sc, h = 56 * sc;
    S.props += `<g transform="translate(${x} ${y}) scale(${sc})">
      <path d="M-84 0 L-92 -48 H84 L92 -48 L84 0 Z" fill="url(#dumpG)"/>
      <path d="M-92 -48 H92" stroke="#3a8a78" stroke-width="3"/>
      ${[-60, -30, 0, 30, 60].map((rx) => `<path d="M${rx} -4 V-44" stroke="#0e2a25" stroke-width="3" opacity=".7"/>`).join('')}
      <rect x="-58" y="-34" width="38" height="10" rx="1" fill="#fff" opacity=".85"/><text x="-39" y="-26" text-anchor="middle" font-family="Instrument Sans, sans-serif" font-weight="700" font-size="7" fill="#173f38">ROLL-OFF</text>
      <rect x="-84" y="0" width="8" height="5" fill="#101520"/><rect x="76" y="0" width="8" height="5" fill="#101520"/>
      <path d="M-92 -48 V-52 H92 V-48" fill="#1c5a4c"/></g>`;
  }
  function bin(S, x, y, sc, col) {
    S.props += `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M-14 0 L-17 -44 H17 L14 0 Z" fill="${col}"/><rect x="-19" y="-50" width="38" height="8" rx="2" fill="${col}" opacity=".9"/><rect x="-19" y="-50" width="38" height="2.4" fill="#fff" opacity=".25"/><circle cx="-10" cy="1" r="3.4" fill="#10131c"/><circle cx="10" cy="1" r="3.4" fill="#10131c"/></g>`;
  }
  function cone(S, x, y, sc) {
    S.props += `<g transform="translate(${x} ${y}) scale(${sc})"><path d="M-9 0 L-4 -34 H4 L9 0 Z" fill="#e8803f"/><path d="M-6.4 -14 H6.4 L5.6 -20 H-5.6 Z" fill="#fff" opacity=".9"/><rect x="-12" y="-2" width="24" height="4" rx="1" fill="#c4632d"/></g>`;
  }
  function soldSign(S, x, y) {
    S.props += `<g transform="translate(${x} ${y})"><rect x="-2" y="-66" width="4" height="66" fill="#3a3f52"/><rect x="-26" y="-64" width="52" height="30" rx="2" fill="#16265a"/><rect x="-26" y="-64" width="52" height="5" fill="#e8803f"/>
      <text x="0" y="-41" text-anchor="middle" font-family="Instrument Sans, Segoe UI, sans-serif" font-weight="800" font-size="17" letter-spacing="2" fill="#fff">SOLD</text></g>`;
  }
  function blockWall(S, x, w, withPalm, seed) {
    let s = `<rect x="${x}" y="296" width="${w}" height="50" fill="#b78e92"/><rect x="${x}" y="296" width="${w}" height="50" fill="url(#wallShade)"/><rect x="${x}" y="296" width="${w}" height="50" fill="url(#stuccoPat)" opacity=".7"/>
      <rect x="${x - 4}" y="290" width="${w + 8}" height="8" fill="#dcb9a8"/><rect x="${x - 4}" y="298" width="${w + 8}" height="4" fill="#1a1030" opacity=".4"/>`;
    for (let px = x + 20; px < x + w - 10; px += 70) s += `<rect x="${px}" y="292" width="12" height="56" fill="#c9a091"/><rect x="${px - 2}" y="286" width="16" height="7" fill="#e6c6b4"/>`;
    s += `<rect x="${x}" y="338" width="${w}" height="8" fill="#3a2a48" opacity=".5"/>`;
    S.back += s;
    if (withPalm) {
      const r = mk(seed);
      const n = w > 380 ? 2 : 1;
      for (let i = 0; i < n; i++) S.back = palm(x + w * (n === 1 ? .5 : (i ? .72 : .28)), 340, 230 + r() * 110, (r() - .5) * 20, seed + i * 7, 1 + r() * .14) + S.back;
    }
  }

  /* ---------- the street itself ---------- */
  function street(S, x0, x1) {
    const a = x0 - 3, w = x1 - x0 + 6;
    let s = `<path d="M${a} ${G.WALK0} H${a + w} V${G.WALK1} H${a} Z" fill="url(#walk)"/>`;
    let d = ''; for (let jx = Math.ceil(x0 / 118) * 118; jx < x1; jx += 118) d += `M${jx} ${G.WALK0} V${G.WALK1} `;
    s += `<path d="${d}" stroke="#52405f" stroke-width="1.2" fill="none" opacity=".7"/>`;
    s += `<rect x="${a}" y="${G.WALK0}" width="${w}" height="3" fill="#c9a9b0" opacity=".5"/><rect x="${a}" y="${G.WALK1}" width="${w}" height="8" fill="#a89bb4"/><rect x="${a}" y="410" width="${w}" height="3" fill="#2a2140"/>`;
    s += `<rect x="${a}" y="412" width="${w}" height="120" fill="url(#road)"/><rect x="${a}" y="412" width="${w}" height="120" fill="url(#asphPat)" opacity=".8"/>`;
    let dash = ''; for (let dx = Math.ceil(x0 / 100) * 100; dx < x1; dx += 100) dash += `M${dx} 506 h50 `;
    s += `<path d="${dash}" stroke="#e6c9a8" stroke-width="2.5" opacity=".42"/><rect x="${a}" y="420" width="${w}" height="3" fill="#06070f" opacity=".5"/>`;
    S.street += s;
  }
  /* gravel yard with desert planting between x0 and x1; skip is a list of [a,b] gaps */
  function yardStrip(S, x0, x1, seed) {
    const r = mk(seed);
    let s = `<rect x="${x0}" y="338" width="${x1 - x0}" height="36" fill="#7e5a6c"/><rect x="${x0}" y="338" width="${x1 - x0}" height="36" fill="url(#wallShade)" opacity=".7"/>`;
    const n = Math.round((x1 - x0) * .5);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), y = 340 + r() * 32, c = ['#a07a80', '#c19a92', '#5e4560', '#d8b098'][Math.floor(r() * 4)];
      s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(.7 + r() * 1.3)}" fill="${c}" opacity="${f(.4 + r() * .5)}"/>`;
    }
    for (let x = x0 + 30; x < x1 - 20; x += 90 + r() * 120) {
      const k = r();
      if (k < .5) s += agave(x, 362 + r() * 6, .8 + r() * .5, Math.floor(r() * 999));
      else if (k < .75) s += boulder(f(x), 359 + r() * 4, f(14 + r() * 14), f(8 + r() * 5));
      else s += barrel(f(x), 366, .9 + r() * .4);
    }
    S.yard += s;
  }

  function mailbox(S, x) { S.props += `<rect x="${x}" y="318" width="3" height="40" fill="#2b2140"/><rect x="${x - 9}" y="306" width="22" height="13" rx="6" fill="#2b2140"/><rect x="${x - 9}" y="306" width="22" height="4" rx="2" fill="#ffc690" opacity=".7"/>`; }

  /* pile art in the world: same symbols the crew carries */
  function pile(S, job, anchor, stopN) {
    job.items.forEach(([t, dx, mode], i) => {
      const y = job.y + (i % 2 ? 3 : 0), sc = .88 * SW.depth(y), x = anchor + dx;
      const lean = mode === 'lean';
      const tf = lean ? `translate(${x} ${y}) rotate(-78) translate(66 0) scale(${f(sc)})` : `translate(${x} ${y}) scale(${f(sc)})`;
      S.props += `<g id="pile-${stopN}-${i}"><use href="#it-${t}" transform="${tf}"/></g>`;
    });
  }

  /* ---------- the plan: what stands where along the street ---------- */
  function buildPlan() {
    const P = [];
    const lots = [
      { t: 'garage', x: 764, w: 456, stop: 1 }, { t: 'furniture', x: 1760, w: 480, stop: 2 }, { t: 'construction', x: 2860, w: 480, stop: 3 },
      { t: 'commercial', x: 3900, w: 600, stop: 4 }, { t: 'estate', x: 5060, w: 480, stop: 5 },
    ];
    let k = 0;
    const fill = (x0, x1, seed) => {
      const r = mk(seed); let x = x0;
      while (x < x1 - 1) {
        const rem = x1 - x;
        if (rem < 560) { P.push({ t: 'wall', x, w: rem, seed: seed + x }); break; }
        const w = 400 + Math.floor(r() * 70), kind = ['houseA', 'houseB', 'houseC'][k++ % 3];
        P.push({ t: kind, x, w, seed: seed + x }); x += w;
        let ww = 180 + Math.floor(r() * 120); if (x1 - x - ww < 140) ww = x1 - x;
        P.push({ t: 'wall', x, w: ww, seed: seed + x }); x += ww;
      }
    };
    P.push({ t: 'houseA', x: -150, w: 480, hero: true });
    P.push({ t: 'wall', x: 330, w: 434, hero: true });
    let cur = 764;
    lots.forEach((lot, i) => {
      P.push(lot); cur = lot.x + lot.w;
      const nx = i < lots.length - 1 ? lots[i + 1].x : 6180;
      fill(cur, nx, 500 + i * 37);
    });
    /* the finale block: a house with its porch light on, then road */
    P.push({ t: 'houseA', x: 6180, w: 460, finale: true });
    P.push({ t: 'wall', x: 6640, w: 300, seed: 77 });
    fill(6940, X_MAX, 640);
    return P;
  }

  /* ---------- assemble the world ---------- */
  SW.world = { X_MIN, X_MAX, SEG_W };
  /* the drawing kit, shared with hero-world.js */
  SW.world.kit = { newSeg, light, stucco, windowArt, roofArt, archDoor, garageInterior, palm, agave, boulder, barrel, houseA, houseB, houseC, blockWall, street, yardStrip, mailbox, bin, cone, soldSign };
  SW.world.build = function () {
    const segs = []; for (let x = X_MIN; x < X_MAX; x += SEG_W) segs.push(newSeg(x));
    const at = (x) => segs[SW.clamp(Math.floor((x - X_MIN) / SEG_W), 0, segs.length - 1)];
    segs.forEach((S) => street(S, S.x0, S.x0 + S.w));
    /* yards go under everything with a driveway or lot, so lay them down in one pass first */
    segs.forEach((S, i) => yardStrip(S, S.x0, S.x0 + S.w, 900 + i * 13));

    buildPlan().forEach((p) => {
      const S = at(p.x + p.w / 2);
      switch (p.t) {
        case 'houseA': houseA(S, p.x, p.w, {}); if (p.finale) { light(S, p.x + 290, 300, 30); S.props += `<rect x="${p.x + 214}" y="360" width="64" height="6" rx="2" fill="#1a1d2a" opacity=".6"/>`; } break;
        case 'houseB': houseB(S, p.x, p.w); break;
        case 'houseC': houseC(S, p.x, p.w); break;
        case 'wall': blockWall(S, p.x, p.w, p.w > 190, p.seed || 11); break;
        case 'garage': {
          const x = p.x;
          houseA(S, x, p.w, { garage: 'garageClutter' });
          S.back = palm(868, 342, 238, 6, 63, 1) + S.back;
          S.front += palm(1056, 344, 280, -14, 65, 1.08);
          S.street += `<path d="M786 346 H994 L1034 404 H748 Z" fill="#b9a0a0"/><path d="M786 346 H994 L1034 404 H748 Z" fill="url(#spill)"/><path d="M830 346 L812 404 M950 346 L972 404" stroke="#8a7480" stroke-width="1" opacity=".6"/><path d="M786 346 H994 L1034 404 H748 Z" fill="#1a1030" opacity=".18"/>`;
          mailbox(S, 715);
          pile(S, SW.JOBS[0], SW.STOPS[0].anchor, 1);
          break;
        }
        case 'furniture': {
          houseB(S, p.x, p.w);
          S.street += `<path d="M${p.x + 30} 346 H${p.x + 150} L${p.x + 180} 404 H${p.x} Z" fill="#b9a0a0"/><path d="M${p.x + 30} 346 H${p.x + 150} L${p.x + 180} 404 H${p.x} Z" fill="#1a1030" opacity=".18"/>`;
          bin(S, p.x + 214, 402, .9, '#2f5d50'); bin(S, p.x + 244, 402, .9, '#2f4f8a');
          S.front += palm(p.x + 440, 344, 260, 8, 120, 1.06);
          mailbox(S, p.x + 300);
          pile(S, SW.JOBS[1], SW.STOPS[1].anchor, 2);
          break;
        }
        case 'construction': {
          frameHouse(S, p.x, p.w);
          cone(S, 3050, 404, .8); cone(S, 3150, 404, .8); cone(S, p.x + 420, 402, .8);
          dumpster(S, 3262, 404, .9);
          pile(S, SW.JOBS[2], SW.STOPS[2].anchor, 3);
          break;
        }
        case 'commercial': {
          storefront(S, p.x, p.w);
          S.front += palm(p.x + 612, 344, 250, -10, 140, 1.04);
          pile(S, SW.JOBS[3], SW.STOPS[3].anchor, 4);
          break;
        }
        case 'estate': {
          houseC(S, p.x, p.w);
          soldSign(S, p.x + 150, 366);
          S.front += palm(p.x + 40, 344, 250, -8, 160, 1.04) + agave(p.x + 330, 364, 1.2, 4);
          pile(S, SW.JOBS[4], SW.STOPS[4].anchor, 5);
          break;
        }
      }
    });
    return segs.map((S) => ({
      x0: S.x0, w: S.w,
      svg: S.back + S.front + S.yard + S.street + S.props,
      lights: S.lights,
    }));
  };

  /* ---------- the row of houses behind the wall (slower parallax layer) ---------- */
  SW.world.midRow = function (len) {
    const base = 294, wh = 34, rh = 19, top = base - wh;
    const r = mk(333);
    let s = '', lights = '';
    const mesquite = (x, y, sc) => `<rect x="${x - 2}" y="${y - 22 * sc}" width="4" height="${22 * sc}" fill="#2a2040"/><circle cx="${x}" cy="${y - 30 * sc}" r="${14 * sc}" fill="#2f3a52"/><circle cx="${x - 11 * sc}" cy="${y - 24 * sc}" r="${10 * sc}" fill="#2a3450"/><circle cx="${x + 11 * sc}" cy="${y - 25 * sc}" r="${11 * sc}" fill="#33405a"/><circle cx="${x + 5 * sc}" cy="${y - 36 * sc}" r="${6 * sc}" fill="#ffb27a" opacity=".16"/>`;
    const house = (x, w, garageLeft, lit) => {
      const roofPts = `${x - 8},${top} ${x + w + 8},${top} ${x + w - 18},${top - rh} ${x + 18},${top - rh}`;
      const gx = garageLeft ? x + 10 : x + w - 52, wx = garageLeft ? x + w - 46 : x + 14;
      if (lit) lights += `<circle cx="${wx + 15}" cy="${top + 21}" r="26" fill="url(#glowW)"/>`;
      return `<rect x="${x}" y="${top}" width="${w}" height="${wh + 6}" fill="url(#wallA)"/><rect x="${x}" y="${top}" width="${w}" height="${wh + 6}" fill="url(#wallShade)"/><rect x="${x}" y="${top}" width="${w}" height="${wh + 6}" fill="url(#stuccoPat)" opacity=".7"/>
        <polygon points="${roofPts}" fill="url(#tile)"/><polygon points="${roofPts}" fill="url(#roofLight)"/>
        <path d="M${x + 18} ${top - rh} H${x + w - 18}" stroke="#ffc690" stroke-width="1.8" opacity=".75"/>
        <rect x="${x - 8}" y="${top}" width="${w + 16}" height="4" fill="#d4b2a2"/><rect x="${x - 8}" y="${top + 4}" width="${w + 16}" height="6" fill="#1a1030" opacity=".45"/>
        <rect x="${gx}" y="${top + 12}" width="42" height="${wh - 8}" fill="#2a1d3c"/><rect x="${gx}" y="${top + 12}" width="42" height="${wh - 8}" fill="none" stroke="#e8c9b4" stroke-width="2"/>
        <path d="M${gx + 3} ${top + 20} H${gx + 39} M${gx + 3} ${top + 28} H${gx + 39}" stroke="#4a3558" stroke-width="1"/>
        <rect x="${wx}" y="${top + 11}" width="30" height="20" rx="1.5" fill="${lit ? 'url(#winGlow)' : '#2c3c63'}" stroke="#f0d6c4" stroke-width="2.4"/>
        <path d="M${wx + 15} ${top + 11} V${top + 31} M${wx} ${top + 21} H${wx + 30}" stroke="#f0d6c4" stroke-width="1.6"/>`;
    };
    let x = 120;
    while (x < len) {
      const w = 96 + Math.floor(r() * 30);
      s += house(x, w, r() < .5, r() < .55);
      x += w + 12;
      if (r() < .8) { s += mesquite(x + 8, base, .9 + r() * .3); x += 34 + r() * 40; } else x += 10 + r() * 18;
    }
    s += `<rect x="0" y="228" width="${len}" height="70" fill="url(#midHaze)"/>`;
    return { svg: s, lights, len };
  };
})(window.SW);
