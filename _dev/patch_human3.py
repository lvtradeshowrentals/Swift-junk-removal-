import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(ROOT, 'js', 'human.js')
s = open(p, encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b, cnt)

rep("const headRim = rimOf(gMid), head", "const headRim = rimOf(gHead), head")

# ---- body build: shoulders, torso volume, limb thickness ----
rep("const sh = [comb(shC, tb.L, B.sh, tb.U, -3.4), comb(shC, tb.L, -B.sh, tb.U, -3.4)];",
    "const sh = [comb(shC, tb.L, B.sh * bd.w, tb.U, -3.4), comb(shC, tb.L, -B.sh * bd.w, tb.U, -3.4)];")
rep("const th = capsule(hp, kn, 9.1, 6, .08, .35);", "const bl = bd.limb, th = capsule(hp, kn, 9.5 * bl, 6.3 * bl, .1, .35);")
rep("const shn = capsule(kn, hemP, 5.9, 4.8, .18, .3, true);", "const shn = capsule(kn, hemP, 6.3 * bl, 5.5 * bl, .16, .3, true);")
rep("limbShade(o.thigh, hp, kn, 8); limbShade(o.shin, kn, hemP, 5.5);", "limbShade(o.thigh, hp, kn, 8.5 * bl); limbShade(o.shin, kn, hemP, 6 * bl);")
rep("o.cuffShade.setAttribute('d', pathOf(capsule([hemP[0] - su[0] * 2.4, hemP[1] - su[1] * 2.4], hemP, 4.9, 4.9, 0, 0, true)));",
    "o.cuffShade.setAttribute('d', pathOf(capsule([hemP[0] - su[0] * 2.6, hemP[1] - su[1] * 2.6], hemP, 5.6 * bl, 5.6 * bl, 0, 0, true)));")

# cargo pocket with flap on the thigh, outer seam, knee patch
a = s.index("          const pc = [lin(hp[0], kn[0], .46)")
b = s.index("          o.crease.setAttribute")
new = """          const tn = [-(kn[1] - hp[1]), kn[0] - hp[0]], tl = Math.hypot(tn[0], tn[1]) || 1, tu = [(kn[0] - hp[0]) / tl, (kn[1] - hp[1]) / tl];
          const ofs = (u, v) => [hp[0] + tu[0] * u * tl + tn[0] / tl * v, hp[1] + tu[1] * u * tl + tn[1] / tl * v];
          const side = (i === 0 ? 1 : -1) * 0 + 1;
          /* the pocket sits on the outer face of the thigh, so it shows whichever way the leg is turned */
          const pq = [ofs(.34, 6.2 * bl), ofs(.34, -1.4 * bl), ofs(.62, -1.4 * bl), ofs(.62, 6.2 * bl)];
          o.pocket.setAttribute('d', pathOf(pq)); o.pocketFlap.setAttribute('d', 'M' + f1(pq[0][0]) + ' ' + f1(pq[0][1]) + 'L' + f1(pq[1][0]) + ' ' + f1(pq[1][1]) + 'M' + f1(ofs(.4, 5)[0]) + ' ' + f1(ofs(.4, 5)[1]) + 'L' + f1(ofs(.4, 0)[0]) + ' ' + f1(ofs(.4, 0)[1]));
          o.seam.setAttribute('d', 'M' + f1(ofs(.04, 8.4 * bl)[0]) + ' ' + f1(ofs(.04, 8.4 * bl)[1]) + 'L' + f1(ofs(1, 5.6 * bl)[0]) + ' ' + f1(ofs(1, 5.6 * bl)[1]));
          o.kneePatch.setAttribute('d', pathOf(ellipsoid([kn[0], -kn[1], 0], [tu[0] * 4.6, -tu[1] * 4.6, 0], [tn[0] / tl * 5.2 * bl, -tn[1] / tl * 5.2 * bl, 0], [0, 0, 1], 12).map((q) => [q[0], q[1]]))); o.kneePatch.setAttribute('fill-opacity', '.13');
"""
s = s[:a] + new + s[b:]

# torso volume
rep("const chest = ellipsoid(comb(Pp, tb.U, 31.5), mul(tb.F, 11.6), mul(tb.L, 15.2), mul(tb.U, 15), 26);",
    "const br = 1 + .018 * (inp.breath || 0), bf = bd.belly;\n        const chest = ellipsoid(comb(Pp, tb.U, 31.5), mul(tb.F, 11.9 * bd.d * br), mul(tb.L, 15.6 * bd.w), mul(tb.U, 15), 26);")
rep("const lower = ellipsoid(comb(Pp, tb.U, 15), mul(tb.F, 10.4), mul(tb.L, 13.6), mul(tb.U, 9), 22);",
    "const lower = ellipsoid(comb(Pp, tb.U, 15), mul(tb.F, (10.8 + bf) * bd.d), mul(tb.L, 14.2 * bd.w + bf * .4), mul(tb.U, 9), 22);")
rep("const hemE = ellipsoid(comb(Pp, tb.U, 2.2), mul(tb.F, 11.6), mul(tb.L, 16.6), mul(tb.U, 1.2), 22);",
    "const hemE = ellipsoid(comb(Pp, tb.U, 2.2), mul(tb.F, (12 + bf * 1.1) * bd.d), mul(tb.L, 17.2 * bd.w + bf * .3), mul(tb.U, 1.2), 22);")
rep("hemShade.setAttribute('d', pathOf(ellipsoid(comb(Pp, tb.U, -.4), mul(tb.F, 11.9), mul(tb.L, 16.9), mul(tb.U, 2.6), 22)));",
    "hemShade.setAttribute('d', pathOf(ellipsoid(comb(Pp, tb.U, -.4), mul(tb.F, (12.3 + bf * 1.1) * bd.d), mul(tb.L, 17.5 * bd.w + bf * .3), mul(tb.U, 2.6), 22)));\n        hemStitch.setAttribute('d', pathOf(ellipsoid(comb(Pp, tb.U, 3.6), mul(tb.F, (11.7 + bf * 1.1) * bd.d), mul(tb.L, 16.8 * bd.w + bf * .3), mul(tb.U, .4), 22)));")

# hip pouch + clip below the hem on the viewer-facing hip, collar flaps and placket
rep("        collar.setAttribute('d', pathOf(ellipsoid(comb(shC, tb.U, 1.6, tb.F, 0.8), mul(tb.F, 5.9), mul(tb.L, 7), mul(tb.U, 2.2), 14)));",
    """        collar.setAttribute('d', pathOf(ellipsoid(comb(shC, tb.U, 1.6, tb.F, 0.8), mul(tb.F, 5.9), mul(tb.L, 7), mul(tb.U, 2.2), 14)));
        /* polo collar: two flaps and a placket with buttons, seen from the front; from the side only the collar band shows */
        flapA.setAttribute('d', ''); flapB.setAttribute('d', ''); flapEdge.setAttribute('d', ''); placket.setAttribute('d', ''); btn[0].setAttribute('d', ''); btn[1].setAttribute('d', '');
        if (tb.F[2] > .2) {
          const fl = (sg) => [comb(shC, tb.U, 3.6, tb.F, 4.4, tb.L, sg * 3.4), comb(shC, tb.U, -2.4, tb.F, 6.6, tb.L, sg * 8.2), comb(shC, tb.U, -5.6, tb.F, 7.3, tb.L, sg * 1.2)].map(P2);
          const fA = fl(1), fB = fl(-1);
          flapA.setAttribute('d', pathOf(fA)); flapB.setAttribute('d', pathOf(fB));
          flapEdge.setAttribute('d', 'M' + f1(fA[0][0]) + ' ' + f1(fA[0][1]) + 'L' + f1(fA[1][0]) + ' ' + f1(fA[1][1]) + 'L' + f1(fA[2][0]) + ' ' + f1(fA[2][1]) + 'M' + f1(fB[0][0]) + ' ' + f1(fB[0][1]) + 'L' + f1(fB[1][0]) + ' ' + f1(fB[1][1]) + 'L' + f1(fB[2][0]) + ' ' + f1(fB[2][1]));
          const p0 = P2(comb(shC, tb.U, -5.6, tb.F, 7.4)), p1 = P2(comb(shC, tb.U, -17, tb.F, 8.3));
          placket.setAttribute('d', 'M' + f1(p0[0]) + ' ' + f1(p0[1]) + 'L' + f1(p1[0]) + ' ' + f1(p1[1]));
          [0, 1].forEach((k) => { const q = P2(comb(shC, tb.U, -8.6 - k * 4.4, tb.F, 7.9 + k * .3)); btn[k].setAttribute('d', pathOf(circle(q, .75, 8))); });
        }
        /* utility pouch and key clip on the near hip, hanging just below the shirt hem */
        const hs = pb.L[2] >= 0 ? 1 : -1, ph = comb(Pp, pb.L, hs * 15.2 * bd.w, tb.U, -2.6, pb.F, 1.4);
        const pouchE = ellipsoid(ph, mul(pb.F, 3.1), mul(pb.L, 2.2), mul(tb.U, 5.2), 10);
        pouch.setAttribute('d', pathOf(pouchE)); pouchHi.setAttribute('d', pathOf(ellipsoid(comb(ph, tb.U, 3.4, pb.F, .4), mul(pb.F, 2.4), mul(pb.L, 1.6), mul(tb.U, .8), 8)));
        const ck = [P2(comb(ph, tb.U, 5, pb.F, -3)), P2(comb(ph, tb.U, 2.4, pb.F, -4.6)), P2(comb(ph, tb.U, -.4, pb.F, -3.8))];
        clip.setAttribute('d', 'M' + f1(ck[0][0]) + ' ' + f1(ck[0][1]) + 'Q' + f1(ck[1][0]) + ' ' + f1(ck[1][1]) + ' ' + f1(ck[2][0]) + ' ' + f1(ck[2][1]));""")

# larger chest logo
rep("const w = (front ? 4.2 : 6.6) * Math.abs(fz), h = front ? 3.2 : 4.8, c2 = P2(ctr);", "const w = (front ? 5 : 7.6) * Math.abs(fz), h = front ? 3.8 : 5.4, c2 = P2(ctr);")

# arms: thicker, sleeve stripe, bigger gloves with fingers
rep("const ua = capsule(s, e, 4.9, 4.0, .12, .35), fa_ = capsule(e, w, 4.0, 3.0, .18, .3);", "const al = bd.limb, ua = capsule(s, e, 5.3 * al, 4.4 * al, .14, .35), fa_ = capsule(e, w, 4.4 * al, 3.3 * al, .2, .3);")
rep("const sl = capsule(s, se, 5.9, 5.3, .06, .3, true);", "const sl = capsule(s, se, 6.5 * al, 5.9 * al, .06, .3, true);")
rep("o.hem.setAttribute('d', pathOf(capsule([se[0] - uu[0] * 1.6, se[1] - uu[1] * 1.6], se, 5.2, 5.2, 0, 0, true)));",
    "o.hem.setAttribute('d', pathOf(capsule([se[0] - uu[0] * 2.2, se[1] - uu[1] * 2.2], se, 5.8 * al, 5.8 * al, 0, 0, true)));\n          o.hemStripe.setAttribute('d', pathOf(capsule([se[0] - uu[0] * 4.1, se[1] - uu[1] * 4.1], [se[0] - uu[0] * 3.1, se[1] - uu[1] * 3.1], 6.1 * al, 6.1 * al, 0, 0, true)));")
rep("const gp = [at(1.6, -3.4), at(1.6, 3.4), at(6, 4), at(11.5, 3.5), at(15.4, 2.2), at(16.2, 0), at(15.4, -2.2), at(11.5, -3.5), at(6, -4)];",
    "const gp = [at(1.6, -3.9), at(1.6, 3.9), at(6, 4.7), at(12, 4.2), at(16.6, 3), at(18, 0), at(16.6, -3), at(12, -4.2), at(6, -4.7)];")
rep("o.gloveCuff.setAttribute('d', pathOf(hull([at(-1.8, -3.9), at(-1.8, 3.9), at(2.4, 3.9), at(2.4, -3.9)]))); limbShade(o.gloveCuff, at(0, -4), at(0, 4), 4.3);",
    "o.gloveCuff.setAttribute('d', pathOf(hull([at(-2, -4.3), at(-2, 4.3), at(2.6, 4.3), at(2.6, -4.3)]))); limbShade(o.gloveCuff, at(0, -4.4), at(0, 4.4), 4.7);")
rep("o.thumb.setAttribute('d', pathOf(hull([at(3.4, 3.3 * side), at(4.6, 4.8 * side), at(9.6, 5 * side), at(11.2, 3.9 * side), at(8, 3.2 * side)]))); limbShade(o.thumb, at(0, -4), at(0, 4), 4.3);",
    "o.thumb.setAttribute('d', pathOf(hull([at(3.4, 3.7 * side), at(4.8, 5.4 * side), at(11, 5.6 * side), at(12.8, 4.3 * side), at(9, 3.6 * side)]))); limbShade(o.thumb, at(0, -4.4), at(0, 4.4), 4.7);")
rep("o.knuckle.setAttribute('d', 'M' + f1(at(8.4, -2.4)[0]) + ' ' + f1(at(8.4, -2.4)[1]) + 'L' + f1(at(8.4, 2.4)[0]) + ' ' + f1(at(8.4, 2.4)[1]));",
    """o.knuckle.setAttribute('d', 'M' + f1(at(9, -3)[0]) + ' ' + f1(at(9, -3)[1]) + 'L' + f1(at(9, 3)[0]) + ' ' + f1(at(9, 3)[1]));
          let fg = ''; [-2.2, 0, 2.2].forEach((v) => { const a0 = at(10.4, v), a1 = at(16.6, v * .8); fg += 'M' + f1(a0[0]) + ' ' + f1(a0[1]) + 'L' + f1(a1[0]) + ' ' + f1(a1[1]); });
          o.fingers.setAttribute('d', fg); o.gripPad.setAttribute('d', pathOf(hull([at(3, -3), at(3, 3), at(8, 3.6), at(8, -3.6)])));""")

# head group scale about the neck top, bigger cap, hair, face
rep("        /* ----- neck and head ----- */", "        headG.setAttribute('transform', 'translate(' + f1(P2(headB)[0]) + ' ' + f1(P2(headB)[1]) + ') scale(' + (1.07 * bd.head).toFixed(3) + ') translate(' + f1(-P2(headB)[0]) + ' ' + f1(-P2(headB)[1]) + ')');\n        /* ----- neck and head ----- */")
rep("    const rig = {\n      g, legs, arms, item: itemUse,", "    const headG = gHead;\n    const rig = {\n      g, legs, arms, item: itemUse,")
open(p, 'w', encoding='utf8').write(s)
print('part 2 ok')
