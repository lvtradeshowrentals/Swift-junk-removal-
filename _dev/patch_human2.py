import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(ROOT, 'js', 'human.js')
s = open(p, encoding='utf8').read()

def rep(a, b, cnt=1):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b, cnt)

# ---------- looks: three different people ----------
a = s.index("  SW.CREW_LOOK = [")
b = s.index("  ];", a) + 4
s = s[:a] + """  /* three people, not three copies: height (h), build (w chest width, d chest depth, belly, limb thickness), hair and face.
     Same uniform: navy polo with a copper-striped sleeve, charcoal work pants, boots, tan work gloves, navy cap. */
  SW.CREW_LOOK = [
    { skin: '#c88f67', hair: '#2a1a12', shirt: '#1a2b62', pants: '#3a4054', boot: '#5a4030', glove: '#caa35e', cap: '#14224e', brim: '#e8803f', stubble: .12, build: { h: 1.03, w: 1.0, d: 1.0, belly: 0, limb: 1.0, head: 1.0 }, shades: 0 },
    { skin: '#8f5d3f', hair: '#120c0a', shirt: '#1a2b62', pants: '#343a4c', boot: '#3e2e20', glove: '#caa35e', cap: '#14224e', brim: '#e8803f', stubble: .62, beard: 1, build: { h: .98, w: 1.1, d: 1.14, belly: 1.8, limb: 1.1, head: 1.04 }, shades: 0 },
    { skin: '#dcae88', hair: '#6a4a2c', shirt: '#1a2b62', pants: '#3a4054', boot: '#4a3524', glove: '#caa35e', cap: '#14224e', brim: '#e8803f', stubble: .2, build: { h: .955, w: 1.04, d: 1.02, belly: 0, limb: 1.06, head: 1.0 }, shades: 1 },
  ];""" + s[b:]

# ---------- per-look build ----------
rep("  SW.human.create = function (look) {\n    const g = document.createElementNS(NS, 'g');",
    "  SW.human.create = function (look) {\n    const bd = Object.assign({ w: 1, d: 1, belly: 0, limb: 1, head: 1, h: 1 }, look.build || {});\n    const g = document.createElementNS(NS, 'g');")

# ---------- extra parts: collar flaps, placket, buttons, pouch, cuff stripes, cargo pocket, knee patch, glove fingers ----------
rep("      o.rimThigh = rimOf(e); o.rimShin = rimOf(e);",
    "      o.rimThigh = rimOf(e); o.rimShin = rimOf(e);\n      o.kneePatch = mk(e, '#070a18', { 'fill-opacity': '.0' });")
rep("o.shin = shaded(e, look.pants); o.cuffShade = mk(e, '#070a18', { 'fill-opacity': '.32' });\n      o.thigh = shaded(e, look.pants); o.pocket = mk(e, '#070a18', { 'fill-opacity': '.07' });",
    "o.shin = shaded(e, look.pants); o.cuffShade = mk(e, '#070a18', { 'fill-opacity': '.32' });\n      o.thigh = shaded(e, look.pants); o.pocket = mk(e, '#070a18', { 'fill-opacity': '.16' }); o.pocketFlap = mk(e, 'none', { stroke: '#050816', 'stroke-width': '.4', 'stroke-opacity': '.5', 'stroke-linecap': 'round' }); o.seam = mk(e, 'none', { stroke: '#0a0e1c', 'stroke-width': '.34', 'stroke-opacity': '.34', 'stroke-linecap': 'round' });")
rep("o.sleeve = shaded(e, look.shirt); o.hem = mk(e, '#070a18', { 'fill-opacity': '.28' });",
    "o.sleeve = shaded(e, look.shirt); o.hem = mk(e, '#070a18', { 'fill-opacity': '.28' }); o.hemStripe = mk(e, '#e8803f', { 'fill-opacity': '.95' });")
rep("o.knuckle = mk(e, 'none', { stroke: '#6e5020', 'stroke-width': '.3', 'stroke-opacity': '.5', 'stroke-linecap': 'round' });",
    "o.knuckle = mk(e, 'none', { stroke: '#6e5020', 'stroke-width': '.3', 'stroke-opacity': '.5', 'stroke-linecap': 'round' }); o.fingers = mk(e, 'none', { stroke: '#6e5020', 'stroke-width': '.34', 'stroke-opacity': '.55', 'stroke-linecap': 'round' }); o.gripPad = mk(e, '#8a6a2c', { 'fill-opacity': '.28' });")

# torso extras (after collar)
rep("const logo = mk(gMid, '#e8803f'), logo2 = mk(gMid, '#f6d3bd'), collar = mk(gMid, '#0b1438', { 'fill-opacity': '.55' });",
    "const logo = mk(gMid, '#e8803f'), logo2 = mk(gMid, '#f6d3bd'), collar = mk(gMid, '#0b1438', { 'fill-opacity': '.55' });\n    const hemStitch = mk(gMid, 'none', { stroke: '#050816', 'stroke-width': '.3', 'stroke-opacity': '.35' });\n    const pouch = mk(gMid, '#15121c'), pouchHi = mk(gMid, '#6b6478', { 'fill-opacity': '.5' }), clip = mk(gMid, 'none', { stroke: '#b9b2a2', 'stroke-width': '.5', 'stroke-opacity': '.9' });\n    const flapA = mk(gMid, mixc(look.shirt, '#ffffff', .13)), flapB = mk(gMid, mixc(look.shirt, '#ffffff', .13)), flapEdge = mk(gMid, 'none', { stroke: '#050a22', 'stroke-width': '.34', 'stroke-opacity': '.5' });\n    const placket = mk(gMid, 'none', { stroke: '#050a22', 'stroke-width': '.5', 'stroke-opacity': '.45' }), btn = [mk(gMid, '#d8d2c4'), mk(gMid, '#d8d2c4')];")

# head group so the whole head can be scaled about the neck
rep("    /* head */\n    const hairBack = shaded(gMid, look.hair);", "    /* head: its own group, scaled about the neck so a larger head stays attached */\n    const gHead = G(gMid);\n    const hairBack = shaded(gHead, look.hair);")
a = s.index("const hairBack = shaded(gHead, look.hair);")
b = s.index("const itemUse = document.createElementNS")
blk = s[a:b].replace("(gMid,", "(gHead,")
blk = blk.replace("const earFar = mk(gMid", "const earFar = mk(gHead")
s = s[:a] + blk + s[b:]
# extra head parts: sideburn, shades
rep("const capBrim = shaded(gHead, look.brim), capLogo = mk(gHead, '#f6d3bd');",
    "const capBrim = shaded(gHead, look.brim), capLogo = mk(gHead, '#f6d3bd'), capBand = mk(gHead, '#050a22', { 'fill-opacity': '.35' }), burn = mk(gHead, look.hair), shades = mk(gHead, '#0c0f19'), shadeGlint = mk(gHead, '#aab3ca', { 'fill-opacity': '.6' }), nape = shaded(gHead, look.hair);")

open(p, 'w', encoding='utf8').write(s)
print('part 1 ok')
