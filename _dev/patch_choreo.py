import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf8').read()
def wr(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf8').write(s)

# ---------------- hero-world: the new pile ----------------
s = rd('js/hero-world.js')
a = s.index("    houseX: 0, pileX: 372")
b = s.index("    ],", a) + len("    ],")
s = s[:a] + """    houseX: 0, pileX: 372, finaleX: 2430, K: .88,
    /* Six pieces, drawn big enough to need handling like the real thing. crew = who lifts it (0, 1, 2); sc = size
       relative to the art's native size; gy = hand height in cm while carrying; carryRot = how it is turned in the hands.
       Same order as the trailer's load plan (trailer.js): floor row, then the flat things on top. */
    pile: [
      { t: 'couch', dx: -128, y: 410, sc: 1.32, crew: [0, 1], gy: 80 },
      { t: 'armchair', dx: 22, y: 406, sc: 1.08, crew: [2], gy: 100 },
      { t: 'fridge', dx: 222, y: 404, sc: 1.3, crew: [0, 1], gy: 92, carryRot: -90 },
      { t: 'box', dx: 104, y: 425, sc: 1.15, crew: [2], gy: 100 },
      { t: 'mattressUp', ct: 'mattress', dx: -268, y: 402, tilt: -6, sc: 1.45, crew: [1, 2], gy: 104 },
      { t: 'box', dx: 152, y: 427, sc: 1.15, crew: [0], gy: 100 },
    ],""" + s[b:]
s = s.replace("const sc = H.K * SW.depth(p.y), x = H.pileX + p.dx, y = p.y;", "const sc = H.K * SW.depth(p.y) * p.sc, x = H.pileX + p.dx, y = p.y;")
wr('js/hero-world.js', s)

# ---------------- trailer: load plan for the six pieces ----------------
s = rd('js/trailer.js')
a = s.index("  const S = 1, DK = DECK - 4;")
b = s.index("  T.tf = (it) =>")
s = s[:a] + """  const DK = DECK - 4;
  const dim = (t) => SW.ITEM_DIM[t];
  T.LOAD = [];
  /* the lowest the piece's top can be: its base minus its own height (lying pieces use their width) */
  const put = (t, x, y, sc, r, lie) => { const it = { t, x, y, s: sc, r: r || 0, lie: !!lie }; T.LOAD.push(it); return y - (lie ? dim(t).w : dim(t).h) * sc; };
  /* floor row, rear to front: couch, armchair, fridge on its side. Then the mattress on the couch, a box on the armchair, a box on the fridge. */
  const couchTop = put('couch', -511, DK, 1.32), armTop = put('armchair', -352, DK, 1.08), fridgeTop = put('fridge', -211, DK, 1.3, 0, true);
  put('box', -211, fridgeTop, 1.15);
  const mattTop = put('mattress', -511, couchTop, 1.45, -2);
  put('box', -352, armTop, 1.15);
  void mattTop;
  /* the final load keeps the same order as the pile in hero-world.js: couch, armchair, fridge, box, mattress, box */

""" + s[b:]
s = s.replace("""  T.tf = (it) => {
    const d = dim(it.t);""", """  T.center = (it) => ({ x: it.x, y: it.y - (it.lie ? dim(it.t).w : dim(it.t).h) * it.s / 2 });
  T.tf = (it) => {
    const d = dim(it.t);""")
wr('js/trailer.js', s)

# ---------------- crew.js: height per person ----------------
s = rd('js/crew.js')
s = s.replace("    return { g, rig, shadow: sh, carryType: '' };", "    return { g, rig, shadow: sh, carryType: '', h: (look.build && look.build.h) || 1 };")
s = s.replace("inp: undefined", "inp: undefined")
wr('js/crew.js', s)

# ---------------- ride.js ----------------
s = rd('js/ride.js')
a = s.index("  /* ======================= the crew =======================")
b = s.index("  /* ======================= load, net, gate, suspension")
s = s[:a] + rd('_dev/crew_plan.js.txt') + s[b:]
a = s.index("  function updateCrew(tv) {")
b = s.index("  function cullSegments(cam) {")
s = s[:a] + rd('_dev/crew_update.js.txt') + s[b:]
def rep(x, y):
    global s
    assert x in s, x[:90]
    s = s.replace(x, y, 1)
rep("const PARTS = [['hold', .26], ['load', 1.15], ['secure', .30], ['drive', .36], ['finale', .30]];", "const PARTS = [['hold', .26], ['load', .95], ['secure', .30], ['drive', .36], ['finale', .30]];")
rep("let els = {}, segEls = [], segElsN = [], crews = [], flyEls = [], slotEls = []", "let els = {}, segEls = [], segElsN = [], crews = [], flyEls = [], pairUse = null, slotEls = []")
rep("    SW.CREW_LOOK.forEach((look) => { const cr = SW.crew.create(look); cr.g.setAttribute('opacity', '0'); a.appendChild(cr.g); crews.push(cr); });",
    "    SW.CREW_LOOK.forEach((look) => { const cr = SW.crew.create(look); cr.g.setAttribute('opacity', '0'); a.appendChild(cr.g); crews.push(cr); });\n    pairUse = document.createElementNS(SVGNS, 'use'); pairUse.setAttribute('visibility', 'hidden'); a.appendChild(pairUse);")
rep("const pileCx = rampTip - 150 * S0;\n    const pileLeft = pileCx - 210 * S0;", "const pileCx = rampTip - 70 * S0;\n    const pileLeft = pileCx - 300 * S0;")
rep("const txC = wide ? (.345 * W - rampTip) : (.03 * W - pileLeft);", "const txC = wide ? (.30 * W - rampTip) : (.03 * W - pileLeft);")
rep("const ts = wide ? Math.min(.56 * W / 722, .00135 * H) : .94 * W / 610;", "const ts = wide ? Math.min(.56 * W / 722, .00135 * H) : .94 * W / 680;")
# old helpers no longer present: ITEM_ROT etc. are replaced with the plan block. trailerPose kept but unused.
wr('js/ride.js', s)
print('ok')
