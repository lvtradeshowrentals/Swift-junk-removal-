import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bp = os.path.join(ROOT, 'js', 'bg.js')
s = open(bp, encoding='utf8').read()

# 1. drop the generic wheel / lattice / pyramid / spire helpers
a = s.index("    const wheel = (cx, R) => {")
b = s.index("    return { tower, wheel, lattice, pyramid, spire, r, emit };")
s = s[:a] + "    return { tower, r, emit };" + s[b + len("    return { tower, wheel, lattice, pyramid, spire, r, emit };"):]

# 2. the skyline layers
a = s.index("  /* the skyline is two layers")
b = s.index("  /* mid mountains + foothills */")
new = r"""  /* The skyline is two layers.
     down:  downtown Las Vegas and the Strat, visible from the first frame.
     strip: the Strip as seen from the west with north on the left, in true order from Fontainebleau
            to Mandalay Bay. It starts off-screen right and slides in so its middle (Bellagio, Paris,
            Cosmopolitan) is centred for the night finale. See landmarks.js for the buildings. */
  SW.STRIP_HALF = 770;
  SW.bg.skyline = (L) => {
    const S = Skyline(12), T = S.tower, LV = SW.LV, glow = SW.LVhelp.glow;
    const put = (b, x, k) => { const g = `translate(${f(x)} 640) scale(${k})`; return { s: `<g transform="${g}">${b.s}</g>`, n: `<g transform="${g}">${b.n}</g>` }; };

    /* ---- downtown + the Strat ---- */
    let o = '', dn = '';
    [[640, 22, 40], [676, 20, 56], [722, 24, 70], [760, 18, 48], [1002, 20, 56], [1024, 16, 46], [1044, 18, 38]].forEach((a) => { o += T(a[0], a[1], a[2], 'flat', true); });
    [[812, LV.goldenNugget, .6], [858, LV.circa, .6], [906, LV.plaza, .6], [985, LV.strat, .78]].forEach(([x, fn, k]) => { const p = put(fn(), x, k); o += p.s; dn += p.n; });
    o += `<rect x="600" y="606" width="480" height="36" fill="url(#haze)" opacity=".9"/>`;
    const r = SW.mk(92);
    let dg = '';
    for (let i = 0; i < 14; i++) dg += glow(650 + r() * 400, 560 + r() * 80, 8 + r() * 8, 'W', f(.25 + r() * .3));
    const down = { xa: -300, xb: 1950 + L.G.sky, svg: o, neon: S.emit.s + dn + dg };

    /* ---- the Strip, north to south ---- */
    const c = 800 + L.G.strip - 75, K = .85;
    let q = '', n = '';
    const add = (fn, x, k) => { const p = put(fn(), c + x, k || K); q += p.s; n += p.n; };
    add(LV.sphere, -330);
    add(LV.highRoller, -110);
    add(LV.fontainebleau, -538); add(LV.resortsWorld, -472); add(LV.wynn, -417);
    add(LV.palazzo, -349); add(LV.venetian, -316);
    add(LV.treasure, -259); add(LV.mirage, -201); add(LV.caesars, -139); add(LV.flamingo, -72);
    add(LV.bellagio, 0); add(LV.cosmopolitan, 72); add(LV.paris, 173); add(LV.cityCenter, 117);
    add(LV.nyny, 290); add(LV.mgmGrand, 360); add(LV.excalibur, 430); add(LV.luxor, 515); add(LV.mandalay, 600);
    /* low podiums and casino bases tie the towers to the ground */
    const rs = SW.mk(44);
    let base = '';
    for (let x = -600; x < 760; x += 14 + rs() * 22) { const w = 16 + rs() * 30, h = 5 + rs() * 12; base += `<rect x="${f(c + x)}" y="${f(640 - h)}" width="${f(w)}" height="${f(h + 4)}" fill="#6a5686"/>`; }
    q = base + q;
    for (let i = 0; i < 40; i++) n += glow(c - 610 + rs() * 1370, 618 + rs() * 16, 7 + rs() * 9, ['W', 'P', 'C', 'W'][Math.floor(rs() * 4)], f(.4 + rs() * .4));
    q += `<rect x="${c - 800}" y="612" width="1700" height="30" fill="url(#haze)" opacity=".8"/>`;
    const strip = { xa: c - 860, xb: c + 860, svg: q, neon: n };
    return { down, strip };
  };

"""
s = s[:a] + new + s[b:]
open(bp, 'w', encoding='utf8').write(s)

# 3. layer travel budget + script wiring
rp = os.path.join(ROOT, 'js', 'ride.js')
r = open(rp, encoding='utf8').read()
r = r.replace("strip: W / (2 * B) + 420,", "strip: W / (2 * B) + SW.STRIP_HALF + 60,")
open(rp, 'w', encoding='utf8').write(r)

hp = os.path.join(ROOT, 'index.html')
h = open(hp, encoding='utf8').read()
if 'js/landmarks.js' not in h:
    h = h.replace('<script src="js/bg.js"></script>', '<script src="js/landmarks.js"></script>\n<script src="js/bg.js"></script>')
open(hp, 'w', encoding='utf8').write(h)
bpy = os.path.join(ROOT, '_dev', 'build_artifact.py')
b = open(bpy, encoding='utf8').read()
if "'landmarks'" not in b:
    b = b.replace("'bg', 'world'", "'landmarks', 'bg', 'world'")
open(bpy, 'w', encoding='utf8').write(b)
print('ok')
