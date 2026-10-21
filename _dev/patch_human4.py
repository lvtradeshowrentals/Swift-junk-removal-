import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(ROOT, 'js', 'human.js')
s = open(p, encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b, cnt)

# layering: hair at the nape sits above the skull and below the ears and cap; sideburn above the ear, below the cap
rep("const itemUse = document.createElementNS(NS, 'use');",
    "gHead.insertBefore(nape, earNear); gHead.insertBefore(burn, capDome);\n    const itemUse = document.createElementNS(NS, 'use');")

a = s.index("        stubble.setAttribute('d', look.stubble")
b = s.index("        return { tb, pb, hb, shoulder: sh, leg, arm: arm_, pelvis: Pp, headC };")
new = """        const beard = look.beard ? 1 : 0;
        stubble.setAttribute('d', look.stubble ? pathOf(ellipsoid(comb(headC, hb.F, beard ? 3.4 : 3.3, hb.U, beard ? -6.9 : -6.4), mul(hb.F, beard ? 7.5 : 6.9), mul(hb.L, beard ? 6.05 : 5.45), mul(hb.U, beard ? 5.4 : 4.4), 18)) : '');
        cheek.setAttribute('d', pathOf(ellipsoid(comb(headC, hb.F, 6.2, hb.U, -2.6), mul(hb.F, 2.8), mul(hb.L, 5.4), mul(hb.U, 2.4), 12)));
        const hairE = ellipsoid(comb(headC, hb.F, -5.2, hb.U, -2.4), mul(hb.F, 5.4), mul(hb.L, 6.6), mul(hb.U, 6.6), 18);
        hairBack.setAttribute('d', pathOf(hairE)); blobShade(hairBack, hairE);
        /* the hair that shows under the cap: nape and behind the ear (a short taper) */
        const napeE = ellipsoid(comb(headC, hb.F, -4.6, hb.U, -1.2), mul(hb.F, 6.4), mul(hb.L, 8.1), mul(hb.U, 7.2), 22);
        nape.setAttribute('d', pathOf(napeE)); blobShade(nape, napeE);
        const earAt = (sgn) => comb(headC, hb.L, sgn * 7.7, hb.F, -.3, hb.U, -1.4);
        const ear = (sgn) => ellipsoid(earAt(sgn), mul(hb.F, 2.5), mul(hb.L, 1), mul(hb.U, 3.6), 12);
        const nearSgn = hb.L[2] > 0 ? 1 : -1;
        earFar.setAttribute('d', pathOf(ear(-nearSgn))); earFarIn.setAttribute('d', pathOf(ellipsoid(earAt(-nearSgn), mul(hb.F, 1.3), mul(hb.L, 1), mul(hb.U, 2.1), 10)));
        earNear.setAttribute('d', pathOf(ear(nearSgn))); earNearIn.setAttribute('d', pathOf(ellipsoid(comb(earAt(nearSgn), hb.L, nearSgn * .5, hb.F, -.3), mul(hb.F, 1.3), mul(hb.L, .5), mul(hb.U, 2.2), 10)));
        burn.setAttribute('d', pathOf(ellipsoid(comb(earAt(nearSgn), hb.F, 3, hb.U, .8, hb.L, nearSgn * -.4), mul(hb.F, 1.3), mul(hb.L, 1), mul(hb.U, 3.4), 10)));
        /* nose: a bridge, a rounded tip and two wings, not a spike */
        const np = [comb(headC, hb.F, 9.4, hb.U, 2.2), comb(headC, hb.F, 11.2, hb.U, -1.4), comb(headC, hb.F, 9.8, hb.U, -3, hb.L, 2), comb(headC, hb.F, 9.8, hb.U, -3, hb.L, -2), comb(headC, hb.F, 10.6, hb.U, -2.6)].map(P2);
        nose.setAttribute('d', pathOf(hull(np))); noseShade.setAttribute('d', pathOf(hull([np[0], np[1], np[2]]))); noseHi.setAttribute('d', pathOf(hull([np[0], P2(comb(headC, hb.F, 10.4, hb.U, .2)), np[1]])));
        const eff = clamp01(inp.effort || 0);
        [1, -1].forEach((sg, k) => {
          const E = comb(headC, hb.F, 8.6, hb.U, 1.5, hb.L, sg * 3.4), nv = nrm(comb([0, 0, 0], hb.F, 1, hb.L, sg * .6)), vis = nv[2];
          if (vis > .08) {
            const rx = 2.15 * Math.min(1, vis * 1.3), ry = 1.3 - eff * .3;
            eyeW[k].setAttribute('d', pathOf(ellipsoid(E, [rx, 0, 0], [0, ry, 0], [0, 0, 0], 10)));
            iris[k].setAttribute('d', pathOf(ellipsoid(comb(E, hb.F, .3), [rx * .62, 0, 0], [0, ry * .94, 0], [0, 0, 0], 10)));
            socket[k].setAttribute('d', pathOf(ellipsoid(comb(E, hb.U, .5), [rx * 1.9, 0, 0], [0, ry * 2.1, 0], [0, 0, 0], 10)));
            const lift = 2.7 - eff * .8, b0 = P2(comb(E, hb.L, sg * -2.3, hb.U, lift - eff * .5)), b1 = P2(comb(E, hb.L, sg * 2.8, hb.U, lift + .5 - eff * 1.1));
            brow[k].setAttribute('d', 'M' + f1(b0[0]) + ' ' + f1(b0[1]) + 'L' + f1(b1[0]) + ' ' + f1(b1[1]));
          } else { eyeW[k].setAttribute('d', ''); iris[k].setAttribute('d', ''); brow[k].setAttribute('d', ''); socket[k].setAttribute('d', ''); }
        });
        const mw = 2.6 + eff * .7, m0 = P2(comb(headC, hb.F, 8.4, hb.U, -5, hb.L, -mw)), m1 = P2(comb(headC, hb.F, 8.6, hb.U, -5, hb.L, mw));
        mouth.setAttribute('d', 'M' + f1(m0[0]) + ' ' + f1(m0[1]) + 'Q' + f1((m0[0] + m1[0]) / 2) + ' ' + f1((m0[1] + m1[1]) / 2 + .45 - eff * .7) + ' ' + f1(m1[0]) + ' ' + f1(m1[1]));
        lip.setAttribute('d', pathOf(ellipsoid(comb(headC, hb.F, 8.8, hb.U, -5.7), mul(hb.F, 1.1), mul(hb.L, 2.5 - eff * .3), mul(hb.U, .95), 10)));

        /* ----- cap: wraps the whole head (high at the brow, lower over the ears and nape), crown, button, seams, curved brim ----- */
        const c0 = comb(headC, hb.U, 5, hb.F, -.3), dp = [];
        for (let a = 0; a < 360; a += 20) { const r = a * R, drop = 2.6 + 2.6 * Math.cos(r); dp.push(comb(headC, hb.F, Math.cos(r) * 11.2, hb.L, Math.sin(r) * 9.1, hb.U, drop - .6)); }
        [[.86, 5.2], [.62, 8], [.3, 10.4]].forEach(([sc, hh]) => { for (let a = 0; a < 360; a += 40) { const r = a * R; dp.push(comb(c0, hb.F, Math.cos(r) * 11.4 * sc, hb.L, Math.sin(r) * 9.2 * sc, hb.U, hh - 4.4)); } });
        const domeH = hull(dp.map(P2)); capDome.setAttribute('d', pathOf(domeH)); blobShade(capDome, domeH);
        capBtn.setAttribute('d', pathOf(circle(P2(comb(c0, hb.U, 6.3)), 1.1, 8)));
        const seam = [P2(comb(c0, hb.F, 7.2, hb.U, 1.4)), P2(comb(c0, hb.F, 1.4, hb.U, 6.4)), P2(comb(c0, hb.F, -6.4, hb.U, 2.2))];
        capSeam.setAttribute('d', 'M' + seam.map((q) => f1(q[0]) + ' ' + f1(q[1])).join('L'));
        const bandA = P2(comb(headC, hb.F, 10.9, hb.U, 3.6)), bandB = P2(comb(headC, hb.F, -10, hb.U, -.2));
        capBand.setAttribute('d', 'M' + f1(bandA[0]) + ' ' + f1(bandA[1]) + 'L' + f1(bandB[0]) + ' ' + f1(bandB[1]));
        const bp2 = [];
        for (let a = -66; a <= 66; a += 22) { const r = a * R; bp2.push(comb(c0, hb.F, Math.cos(r) * 10.6, hb.L, Math.sin(r) * 8.6, hb.U, -.7)); bp2.push(comb(c0, hb.F, Math.cos(r) * 19.4, hb.L, Math.sin(r) * 11.4, hb.U, -3.3 - Math.abs(Math.sin(r)) * 1.2)); }
        const brimH = hull(bp2.map(P2)); capBrim.setAttribute('d', pathOf(brimH)); blobShade(capBrim, brimH);
        capLogo.setAttribute('d', '');
        if (hb.F[2] > .3) { const cp = P2(comb(c0, hb.F, 11.2, hb.U, 3.6)), w = 2.4 * hb.F[2], h = 2.3; capLogo.setAttribute('d', 'M' + f1(cp[0] - w) + ' ' + f1(cp[1] - h) + 'L' + f1(cp[0]) + ' ' + f1(cp[1] - h) + 'L' + f1(cp[0] + w) + ' ' + f1(cp[1]) + 'L' + f1(cp[0]) + ' ' + f1(cp[1] + h) + 'L' + f1(cp[0] - w) + ' ' + f1(cp[1] + h) + 'L' + f1(cp[0]) + ' ' + f1(cp[1]) + 'Z'); }
        /* sunglasses pushed up on the cap */
        shades.setAttribute('d', ''); shadeGlint.setAttribute('d', '');
        if (look.shades) {
          const lens = (sg) => ellipsoid(comb(c0, hb.F, 8.3, hb.U, 3.2, hb.L, sg * 3.6), mul(hb.F, 1.3), mul(hb.L, 3.1), mul(hb.U, 2.1), 10);
          const sp = lens(1).concat(lens(-1));
          shades.setAttribute('d', pathOf(hull(sp)));
          shadeGlint.setAttribute('d', pathOf(ellipsoid(comb(c0, hb.F, 8.9, hb.U, 3.8, hb.L, 2.2), mul(hb.F, .3), mul(hb.L, 1), mul(hb.U, .5), 8)));
        }

"""
s = s[:a] + new + s[b:]
rep("  const circle = (c, r, n) =>", "  const clamp01 = (v) => Math.max(0, Math.min(1, v));\n  const circle = (c, r, n) =>")
open(p, 'w', encoding='utf8').write(s)
print('part 3 ok')
