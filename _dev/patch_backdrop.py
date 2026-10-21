"""Truck clean-ups + richer skyline, far suburbs and mid-ground row."""
P = r'C:\Users\Cleo\Desktop\swift-junk-removal\index.html'
s = open(P, encoding='utf-8').read()

def sub(old, new, count=1):
    global s
    assert old in s, old[:60]
    s = s.replace(old, new, count)

# ---- truck clean-ups -------------------------------------------------------
sub('''        <path d="M78 -44 A67 67 0 0 1 204 -44" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.1" transform="translate(0 -8) translate(0 8)"/>
        <path d="M538 -46 A67 67 0 0 1 664 -46" fill="none" stroke="#ffd2a0" stroke-opacity=".55" stroke-width="1.2"/>
''', '')
sub('<stop offset="0" stop-color="#04060c"/><stop offset=".6" stop-color="#0d0f1c"/><stop offset="1" stop-color="#3a2b3e"/>',
    '<stop offset="0" stop-color="#04060c"/><stop offset=".55" stop-color="#0a0c18"/><stop offset="1" stop-color="#0a0c18" stop-opacity="0"/>')
sub('      <path d="M92 -8 H620" stroke="#ffa868" stroke-opacity=".22" stroke-width="1.5"/>\n', '')
# front bumper: painted navy with a chrome strip instead of a white block
sub('<path d="M696 -96 L722 -94 Q727 -80 725 -68 L712 -58 L694 -60 Z" fill="url(#chrome)"/>',
    '<path d="M696 -96 L722 -94 Q727 -80 725 -68 L712 -58 L694 -60 Z" fill="#101a36"/><path d="M697 -95 L722 -93 Q724.5 -88 725 -83 L697 -85 Z" fill="url(#chrome)"/><path d="M698 -72 L724 -71" stroke="#e8803f" stroke-width="1.6"/>')

# ---- backdrop gradients ----------------------------------------------------
sub('''      <linearGradient id="foot" x1="0" y1="0" x2="0" y2="1">''',
'''      <linearGradient id="skyBldFar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7b6698"/><stop offset="1" stop-color="#d08f88"/>
      </linearGradient>
      <linearGradient id="skyBldWarm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6b4a78"/><stop offset="1" stop-color="#c47c70"/>
      </linearGradient>
      <linearGradient id="lightBeam" gradientUnits="userSpaceOnUse" x1="0" y1="584" x2="0" y2="140">
        <stop offset="0" stop-color="#fff3d0" stop-opacity=".55"/><stop offset="1" stop-color="#fff3d0" stop-opacity="0"/>
      </linearGradient>
      <pattern id="tileFar" width="6" height="4" patternUnits="userSpaceOnUse">
        <path d="M0 4 Q1.5 0 3 4 Q4.5 0 6 4" fill="none" stroke="#000" stroke-opacity=".5" stroke-width=".8"/>
      </pattern>
      <linearGradient id="foot" x1="0" y1="0" x2="0" y2="1">''')

# ---- skyline ---------------------------------------------------------------
SKY = r'''  /* ---------- the skyline: two depth layers, landmarks, lit floors, sun-side rim light ---------- */
  (() => {
    const SUN = 960, r = mk(12);

    const floors = (x, y, w, h, op) => {
      let o = '';
      const rows = Math.floor((h - 6) / 5.4), cols = Math.max(1, Math.floor((w - 3) / 3.8));
      for (let j = 0; j < rows; j++) {
        const band = r() < .1;
        for (let i = 0; i < cols; i++) {
          const on = band ? r() < .85 : r() < .2;
          const cx = f(x + 2 + i * 3.8), cy = f(y + 6 + j * 5.4);
          if (on) o += `<rect x="${cx}" y="${cy}" width="2" height="2.6" fill="#ffd590" opacity="${f(op * (.5 + r() * .5))}"/>`;
          else if (r() < .35) o += `<rect x="${cx}" y="${cy}" width="2" height="2.6" fill="#b9c4ee" opacity="${f(op * .1)}"/>`;
        }
      }
      return o;
    };

    const tower = (x, w, h, crown = 'flat', far = false, warm = false) => {
      const y = 640 - h;
      let d;
      if (crown === 'step') d = `M${x} 640 V${y + 10} H${x + w * .2} V${y + 4} H${x + w * .34} V${y} H${x + w * .66} V${y + 4} H${x + w * .8} V${y + 10} H${x + w} V640 Z`;
      else if (crown === 'slant') d = `M${x} 640 V${y + 9} L${x + w} ${y} V640 Z`;
      else d = `M${x} 640 V${y} H${x + w} V640 Z`;
      let o = `<path d="${d}" fill="${warm ? 'url(#skyBldWarm)' : far ? 'url(#skyBldFar)' : 'url(#skyBld)'}"/>`;
      o += floors(x, y, w, h, far ? .42 : 1);
      const litRight = (x + w / 2) < SUN;
      o += `<path d="M${litRight ? x + w : x} ${y + (crown === 'step' ? 10 : crown === 'slant' ? (litRight ? 0 : 9) : 0)} V640" stroke="#ffb27a" stroke-opacity="${far ? .28 : .65}" stroke-width="1"/>`;
      if (crown === 'flat') o += `<path d="M${x} ${y} H${x + w}" stroke="#ffc690" stroke-opacity="${far ? .22 : .5}" stroke-width=".9"/>`;
      if (!far && h > 88) {
        const cx = x + w / 2;
        o += `<rect x="${f(cx - .5)}" y="${y - 12}" width="1" height="12" fill="#4c3f78"/><circle class="beacon" cx="${f(cx)}" cy="${y - 12}" r="1.3" fill="#ff5a48"/>`;
      }
      return o;
    };

    /* far layer: hazier and smaller, sits behind everything */
    let o = '';
    [[640, 22, 40], [676, 20, 56], [722, 24, 70], [760, 18, 48], [800, 16, 62], [846, 22, 76], [880, 20, 94], [918, 18, 86],
     [944, 16, 72], [1002, 20, 56], [1020, 16, 46]].forEach(a => { o += tower(a[0], a[1], a[2], 'flat', true); });

    /* pyramid with its beam */
    o += `<path d="M817 584 L819 584 L836 130 L800 130 Z" fill="url(#lightBeam)"/>
      <path d="M782 640 L818 584 L854 640 Z" fill="url(#skyBld)"/>
      <path d="M818 584 L854 640 H832 Z" fill="#5a4486" opacity=".5"/>
      <path d="M818 584 L854 640" stroke="#ffb27a" stroke-opacity=".6" stroke-width="1"/>
      <circle cx="818" cy="583" r="2.2" fill="#fff3d0"/>`;

    /* observation wheel */
    (() => {
      const cx = 625, R = 34, cy = 640 - R - 6;
      let w = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#5a4882" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="${R - 9}" fill="none" stroke="#5a4882" stroke-width=".9"/>`;
      for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; w += `<path d="M${cx} ${cy} L${f(cx + Math.cos(a) * R)} ${f(cy + Math.sin(a) * R)}" stroke="#5a4882" stroke-width=".6"/>`; }
      for (let i = 0; i < 28; i++) { const a = i * Math.PI / 14; w += `<circle cx="${f(cx + Math.cos(a) * R)}" cy="${f(cy + Math.sin(a) * R)}" r="1.4" fill="#ffcf8a" opacity=".85"/>`; }
      w += `<path d="M${cx - 16} 640 L${cx} ${cy} L${cx + 16} 640" fill="none" stroke="#5a4882" stroke-width="2.4"/><rect x="${cx - 22}" y="632" width="44" height="8" fill="#4a3a70"/><circle cx="${cx}" cy="${cy}" r="3" fill="#7c68a8"/>`;
      o += w;
    })();

    /* lattice tower */
    (() => {
      const cx = 772, y0 = 640 - 76;
      o += `<path d="M${cx - 15} 640 L${cx - 10} 640 C${cx - 5} 606 ${cx - 2} 590 ${cx - .8} ${y0 + 10} L${cx - 1.8} ${y0 + 10} C${cx - 3} 584 ${cx - 9} 606 ${cx - 15} 640 Z" fill="#4c3f78"/>
        <path d="M${cx + 15} 640 L${cx + 10} 640 C${cx + 5} 606 ${cx + 2} 590 ${cx + .8} ${y0 + 10} L${cx + 1.8} ${y0 + 10} C${cx + 3} 584 ${cx + 9} 606 ${cx + 15} 640 Z" fill="#4c3f78"/>
        <rect x="${cx - 9}" y="604" width="18" height="2.4" fill="#4c3f78"/><rect x="${cx - 5}" y="588" width="10" height="2" fill="#4c3f78"/><rect x="${cx - 2.6}" y="${y0 + 4}" width="5.2" height="2" fill="#4c3f78"/>
        <path d="M${cx - 9} 640 L${cx + 6} 606 M${cx + 9} 640 L${cx - 6} 606 M${cx - 5} 606 L${cx + 3} 590 M${cx + 5} 606 L${cx - 3} 590" stroke="#7a68a6" stroke-width=".6" opacity=".7"/>
        <rect x="${cx - .5}" y="${y0 - 14}" width="1" height="16" fill="#4c3f78"/><circle class="beacon" cx="${cx}" cy="${y0 - 14}" r="1.3" fill="#ff5a48"/>
        <path d="M${cx + 10} 640 C${cx + 5} 606 ${cx + 2} 590 ${cx + .8} ${y0 + 10}" fill="none" stroke="#ffb27a" stroke-opacity=".55" stroke-width=".8"/>`;
    })();

    /* near layer: the crescent hotel, the gold slab, then the downtown cluster */
    o += tower(668, 16, 66, 'step') + tower(684, 14, 50);
    o += `<path d="M702 640 V550 Q704 538 716 536 Q738 540 738 568 V640 Z" fill="url(#skyBldWarm)"/>` + floors(704, 566, 32, 74, 1) +
         `<path d="M738 568 V640" stroke="#ffb27a" stroke-opacity=".65" stroke-width="1"/><path d="M716 536 Q738 540 738 568" fill="none" stroke="#ffc690" stroke-opacity=".6" stroke-width=".9"/>`;
    o += tower(738, 14, 58) + tower(752, 12, 80, 'slant') + tower(858, 16, 82, 'step') + tower(874, 14, 112) + tower(888, 22, 96, 'step', false, true) +
         tower(910, 16, 70) + tower(926, 18, 124, 'slant') + tower(1006, 16, 60) + tower(1022, 14, 44, 'step') + tower(1036, 18, 36);

    /* spire tower with its pod, the one that cuts across the sun */
    o += `<path d="M985.5 640 L987.8 556 H992.2 L994.5 640 Z" fill="#43376d"/>
      <path d="M972 549 Q990 540 1008 549 L1003 559 H977 Z" fill="#4c3f78"/>
      <path d="M980 541 Q990 531 1000 541 Z" fill="#4c3f78"/>
      <rect x="989.2" y="482" width="1.6" height="52" fill="#4c3f78"/>
      <circle class="beacon" cx="990" cy="481" r="1.8" fill="#ff5a48"/><circle class="beacon" cx="990" cy="481" r="5" fill="#ff4a3a" opacity=".22"/>
      <rect x="976" y="553" width="28" height="1.8" fill="#ffd28a" opacity=".85"/>
      <path d="M994.5 640 L992.2 556" stroke="#ffb27a" stroke-opacity=".55" stroke-width=".8"/>`;

    /* city glow pooled at the base */
    o += `<rect x="600" y="606" width="480" height="36" fill="url(#haze)" opacity=".9"/>`;
    put('skyline', o);
  })();

'''
a = s.index('  /* ---------- the skyline, small and hazy ---------- */')
b = s.index('  /* ---------- far rows of tile-roof homes, to seat the horizon ---------- */')
s = s[:a] + SKY + s[b:]

# ---- far suburbs -----------------------------------------------------------
SUB = r'''  /* ---------- far suburbs: five rows of homes, trees, palms and street lamps ---------- */
  (() => {
    const SUN = 960, defs = $('bg').querySelector('defs');
    const rows = [
      { y: 636, s: .55, seed: 81, dark: '#6d5688', lit: '#c8767c', wall: '#86698c', ground: '#7a5a86', tree: '#56477a', win: .5 },
      { y: 643, s: .75, seed: 82, dark: '#4b3b72', lit: '#b5666e', wall: '#6d5582', ground: '#5c4676', tree: '#3b2f5e', win: .7 },
      { y: 652, s: 1.0, seed: 83, dark: '#352950', lit: '#a45568', wall: '#58427a', ground: '#47365f', tree: '#2b2248', win: .9, lamps: true },
      { y: 668, s: 1.4, seed: 84, dark: '#271e40', lit: '#8f4a5c', wall: '#473566', ground: '#33284f', tree: '#211a3a', win: 1, tile: true, lamps: true },
      { y: 692, s: 1.9, seed: 85, dark: '#1d1634', lit: '#7c4056', wall: '#3a2b58', ground: '#281f40', tree: '#191330', win: 1, tile: true },
    ];
    let g = '';
    rows.forEach((row, i) => {
      g += `<linearGradient id="sr${i}R" x1="0" x2="1"><stop offset="0" stop-color="${row.dark}"/><stop offset=".55" stop-color="${row.dark}"/><stop offset="1" stop-color="${row.lit}"/></linearGradient>`;
      g += `<linearGradient id="sr${i}L" x1="1" x2="0"><stop offset="0" stop-color="${row.dark}"/><stop offset=".55" stop-color="${row.dark}"/><stop offset="1" stop-color="${row.lit}"/></linearGradient>`;
    });
    defs.insertAdjacentHTML('beforeend', g);

    let o = '';
    rows.forEach((row, i) => {
      const r = mk(row.seed), S = row.s, y = row.y;
      o += `<rect x="-60" y="${y - 1}" width="1720" height="${f(60 * S)}" fill="${row.ground}"/>`;
      let x = -50 - r() * 30, n = 0;
      while (x < 1650) {
        const w = (46 + r() * 34) * S, wh = (12 + r() * 3) * S, rh = (10 + r() * 4) * S;
        const side = (x + w / 2) < SUN ? 'R' : 'L';
        const rp = `${f(x - 2 * S)},${f(y - wh)} ${f(x + w + 2 * S)},${f(y - wh)} ${f(x + w - 11 * S)},${f(y - wh - rh)} ${f(x + 11 * S)},${f(y - wh - rh)}`;
        o += `<rect x="${f(x)}" y="${f(y - wh)}" width="${f(w)}" height="${f(wh)}" fill="${row.wall}"/>`;
        o += `<polygon points="${rp}" fill="url(#sr${i}${side})"/>`;
        if (row.tile) o += `<polygon points="${rp}" fill="url(#tileFar)" opacity=".55"/>`;
        o += `<path d="M${f(x + 11 * S)} ${f(y - wh - rh)} H${f(x + w - 11 * S)}" stroke="#ffb27a" stroke-opacity=".5" stroke-width="${f(Math.max(.7, .8 * S))}"/>`;
        o += `<rect x="${f(x - 2 * S)}" y="${f(y - wh)}" width="${f(w + 4 * S)}" height="${f(1.3 * S)}" fill="#0c0820" opacity=".5"/>`;
        const gl = r() < .5, gw = w * .3, gh = wh * .74;
        o += `<rect x="${f(gl ? x + w * .08 : x + w * .62)}" y="${f(y - gh)}" width="${f(gw)}" height="${f(gh)}" fill="#150e29" opacity=".9"/>`;
        const wx = gl ? x + w * .5 : x + w * .12;
        for (let k = 0; k < 2; k++) {
          const lit = r() < row.win * .55;
          o += `<rect x="${f(wx + k * w * .2)}" y="${f(y - wh * .72)}" width="${f(w * .12)}" height="${f(wh * .4)}" fill="${lit ? '#ffc778' : '#a7b4e6'}" opacity="${lit ? f(.7 + r() * .3) : .14}"/>`;
        }
        x += w;
        /* the gap between houses: tree, palm, wall or lamp */
        const gap = (6 + r() * 16) * S, gx = x + gap / 2, pick = r();
        if (pick < .5) {
          const tr = (6 + r() * 3) * S;
          o += `<rect x="${f(gx - .8 * S)}" y="${f(y - 8 * S)}" width="${f(1.6 * S)}" height="${f(8 * S)}" fill="${row.tree}"/>`;
          [[0, -13, 1], [-4, -10, .8], [4, -10, .8]].forEach(c => { o += `<circle cx="${f(gx + c[0] * S)}" cy="${f(y + c[1] * S)}" r="${f(tr * c[2])}" fill="${row.tree}"/>`; });
          o += `<circle cx="${f(gx + 2 * S)}" cy="${f(y - 15 * S)}" r="${f(tr * .5)}" fill="#ffb27a" opacity=".16"/>`;
        } else if (pick < .78) {
          const ph = (22 + r() * 8) * S;
          o += `<path d="M${f(gx)} ${y} L${f(gx + .6 * S)} ${f(y - ph)}" stroke="${row.tree}" stroke-width="${f(1.4 * S)}"/>`;
          for (let k = 0; k < 7; k++) { const a = (-160 + k * 22) * Math.PI / 180; o += `<path d="M${f(gx + .6 * S)} ${f(y - ph)} q${f(Math.cos(a) * 7 * S)} ${f(Math.sin(a) * 5 * S - 1)} ${f(Math.cos(a) * 11 * S)} ${f(Math.sin(a) * 4 * S + 4 * S)}" stroke="${row.tree}" stroke-width="${f(1.1 * S)}" fill="none" stroke-linecap="round"/>`; }
        } else if (row.lamps && n++ % 2 === 0) {
          o += `<rect x="${f(gx)}" y="${f(y - 26 * S)}" width="${f(1.2 * S)}" height="${f(26 * S)}" fill="${row.tree}"/><path d="M${f(gx)} ${f(y - 26 * S)} h${f(6 * S)}" stroke="${row.tree}" stroke-width="${f(1.2 * S)}"/><circle cx="${f(gx + 6 * S)}" cy="${f(y - 25 * S)}" r="${f(1.6 * S)}" fill="#ffd590"/><circle cx="${f(gx + 6 * S)}" cy="${f(y - 25 * S)}" r="${f(6 * S)}" fill="#ffc778" opacity=".3"/>`;
        } else {
          o += `<rect x="${f(x)}" y="${f(y - 4 * S)}" width="${f(gap)}" height="${f(4 * S)}" fill="${row.wall}"/>`;
        }
        x += gap;
      }
    });
    put('far-houses', o);
  })();

'''
a = s.index('  /* ---------- far rows of tile-roof homes, to seat the horizon ---------- */')
b = s.index('  /* ====================== FOREGROUND ====================== */')
s = s[:a] + SUB + s[b:]

# ---- mid-ground row (between the near homes, above the block wall) --------
MID = r'''  /* ---------- mid-ground: a row of homes and mesquites rising over the block wall ---------- */
  const midRow = () => {
    const base = 294, wh = 34, rh = 19, top = base - wh;
    const mesquite = (x, y, sc) => `
      <rect x="${x - 2}" y="${y - 22 * sc}" width="4" height="${22 * sc}" fill="#2a2040"/>
      <circle cx="${x}" cy="${y - 30 * sc}" r="${14 * sc}" fill="#2f3a52"/>
      <circle cx="${x - 11 * sc}" cy="${y - 24 * sc}" r="${10 * sc}" fill="#2a3450"/>
      <circle cx="${x + 11 * sc}" cy="${y - 25 * sc}" r="${11 * sc}" fill="#33405a"/>
      <circle cx="${x + 5 * sc}" cy="${y - 36 * sc}" r="${6 * sc}" fill="#ffb27a" opacity=".16"/>
      <circle cx="${x + 14 * sc}" cy="${y - 29 * sc}" r="${5 * sc}" fill="#ffb27a" opacity=".14"/>`;
    const house = (x, w, garageLeft, lit) => {
      const roofPts = `${x - 8},${top} ${x + w + 8},${top} ${x + w - 18},${top - rh} ${x + 18},${top - rh}`;
      const gx = garageLeft ? x + 10 : x + w - 52;
      const wx = garageLeft ? x + w - 46 : x + 14;
      return `
        <rect x="${x}" y="${top}" width="${w}" height="${wh + 6}" fill="url(#wallA)"/>
        <rect x="${x}" y="${top}" width="${w}" height="${wh + 6}" fill="url(#wallShade)"/>
        <rect x="${x}" y="${top}" width="${w}" height="${wh + 6}" filter="url(#stucco)" opacity=".5"/>
        <polygon points="${roofPts}" fill="url(#tile)"/><polygon points="${roofPts}" fill="url(#roofLight)"/>
        <path d="M${x + 18} ${top - rh} H${x + w - 18}" stroke="#ffc690" stroke-width="1.8" opacity=".75"/>
        <path d="M${x + w + 8} ${top} L${x + w - 18} ${top - rh}" stroke="#ffb27a" stroke-width="1.3" opacity=".5"/>
        <rect x="${x - 8}" y="${top}" width="${w + 16}" height="4" fill="#d4b2a2"/>
        <rect x="${x - 8}" y="${top + 4}" width="${w + 16}" height="6" fill="#1a1030" opacity=".45"/>
        <rect x="${gx}" y="${top + 12}" width="42" height="${wh - 8}" fill="#2a1d3c"/>
        <rect x="${gx}" y="${top + 12}" width="42" height="${wh - 8}" fill="none" stroke="#e8c9b4" stroke-width="2"/>
        <path d="M${gx + 3} ${top + 20} H${gx + 39} M${gx + 3} ${top + 28} H${gx + 39}" stroke="#4a3558" stroke-width="1"/>
        <rect x="${wx}" y="${top + 11}" width="30" height="20" rx="1.5" fill="${lit ? 'url(#winGlow)' : '#2c3c63'}" stroke="#f0d6c4" stroke-width="2.4"/>
        <path d="M${wx + 15} ${top + 11} V${top + 31} M${wx} ${top + 21} H${wx + 30}" stroke="#f0d6c4" stroke-width="1.6"/>`;
    };
    return `
      <defs><linearGradient id="midHaze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb67c" stop-opacity="0"/><stop offset="1" stop-color="#ff9d68" stop-opacity=".22"/></linearGradient></defs>
      ${house(336, 106, true, false)}
      ${mesquite(452, base, 1)}
      ${house(472, 120, false, true)}
      ${mesquite(602, base, 1.1)}
      ${house(620, 100, true, false)}
      ${mesquite(752, base, .9)}
      <rect x="316" y="228" width="470" height="70" fill="url(#midHaze)"/>`;
  };

'''
a = s.index("  /* the middle of the street is left open on purpose")
s = s[:a] + MID + s[a:]
sub("put('back-layer',\n    palm(596", "put('back-layer',\n    midRow() +\n    palm(596")

open(P, 'w', encoding='utf-8').write(s)
print('patched backdrop OK', len(s))
