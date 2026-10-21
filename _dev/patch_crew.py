import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rp = os.path.join(ROOT, 'js', 'ride.js')
s = open(rp, encoding='utf8').read()

# 1. actors
a = s.index("    SW.CREW_PAL.forEach((pal, c) => {")
b = s.index("    flyEls = [0, 1].map")
s = s[:a] + """    SW.CREW_LOOK.forEach((look) => {
      const cr = SW.crew.create(look);
      cr.g.setAttribute('opacity', '0'); a.appendChild(cr.g); crews.push(cr);
    });
""" + s[b:]

# 2. choreography block
a = s.index("  /* ======================= crew choreography")
b = s.index("  /* ======================= per-frame render")
old = s[a:b]
upd_start = old.index("  const vis2 =")
upd_mid = old.index("    const pt = partAt(p), si = pt.type === 'dwell' ? pt.i : -1;")
keep = old[upd_start:upd_mid]

new_head = """  /* ======================= crew choreography =======================
     The body mechanics live in crew.js; this only decides, from the scroll position, where each
     person is, which way they face, how fast they walk and what their hands are doing.        */
  const CYC = .27;
  const cStart = (c) => .10 + c * CYC / 2;
  const itemCount = (c, n) => Math.ceil((n - c) / 2);
  const landTime = (s, m) => cStart(m % 2) + (Math.floor(m / 2) + 1) * CYC;
  const pickTime = (s, m) => cStart(m % 2) + Math.floor(m / 2) * CYC + .42 * CYC;

  const PXCM = 1.29, ITEM_K = 1 / PXCM, PI = Math.PI;
  const ITEM_ROT = { mattress: -24, lumber: -14, bike: -10 };
  const carryY = (type) => (type === 'lumber' ? 118 : type === 'mattress' ? 104 : type === 'bike' ? 92 : 100);
  const lowY = (type) => clamp(SW.ITEM_DIM[type].h * ITEM_K * .5, 16, 44);
  const itemTf = (type, g) => `translate(${f(g[0])} ${f(g[1])}) rotate(${ITEM_ROT[type] || 0}) scale(${f(ITEM_K)}) translate(0 ${f(SW.ITEM_DIM[type].h / 2)})`;
  const depthAngle = (dy, dx) => clamp(Math.atan2(dy * 1.6, Math.abs(dx) || 1), -.5, .5);   /* toward the viewer when positive */
  const HOIST_Y = 130, HOIST_F = 36;

"""

new_loop = """    const pt = partAt(p), si = pt.type === 'dwell' ? pt.i : -1;
    crews.forEach((cr) => cr.g.setAttribute('opacity', '0'));
    flyEls.forEach((u) => u.setAttribute('visibility', 'hidden'));
    if (si < 0) { crews.forEach((cr) => cr.rig.setItem('')); return; }
    const job = SW.JOBS[si], n = job.items.length, j = jOf(si, p);
    const pileY = L.H - (520 - job.y) * S0, sP = SW.depth(job.y) * ts;
    for (let c = 0; c < 2; c++) {
      const cr = crews[c], cnt = itemCount(c, n), start = cStart(c), end = start + cnt * CYC;
      const hx = tl + (-26 - c * 40) * ts, hy = L.groundPx - c * 1.1 * ts, hs = ts * (1 - c * .05);
      if (j < start - .07 || j >= end + .08) { cr.rig.setItem(''); continue; }
      let x = hx, y = hy, s = hs, vis = 1, carryT = '', o, flight = null;
      const walkCm = (x0, y0, s0, s1) => Math.hypot(x - x0, (y - y0) * 2) / (PXCM * (s0 + s1) / 2);
      if (j < start) {
        const e = (j - (start - .07)) / .07, x0 = hx + 70 * ts, y0 = hy - 5 * ts, s0 = hs * .86;
        x = lerp(x0, hx, easeOut(e)); y = lerp(y0, hy, easeOut(e)); s = lerp(s0, hs, e); vis = e;
        o = { yaw: PI - .1, theta: SW.crew.phase(walkCm(x0, y0, s0, hs)) + .7, amp: clamp(1.4 * Math.pow(1 - e, .7), 0, 1) };
      } else if (j >= end) {
        const e = (j - end) / .08, x1 = hx + 70 * ts, y1 = hy - 5 * ts, s1 = hs * .86, t = easeInOut(e);
        x = lerp(hx, x1, t); y = lerp(hy, y1, e); s = lerp(hs, s1, e); vis = 1 - e;
        o = { yaw: .28 - .3 * e, theta: SW.crew.phase(walkCm(hx, hy, hs, s1)) + .7, amp: clamp(Math.pow(Math.sin(PI * clamp(e, 0, 1)) * 1.6, .8), 0, 1) };
      } else {
        const kk = Math.min(cnt - 1, Math.floor((j - start) / CYC)), u = ((j - start) - kk * CYC) / CYC, m = c + kk * 2;
        const type = job.items[m][0];
        const itemX = (SW.STOPS[si].anchor + job.items[m][1] - L.camNow) * S0;
        const xEnd = itemX + 27 * PXCM * sP, last = kk === cnt - 1;
        const dOut = depthAngle(pileY - hy, xEnd - hx);          /* heading while walking out (facing left) */
        const yawOut = PI - dOut, yawBack = depthAngle(hy - pileY, hx - xEnd), yawHome = .3;
        const lowG = lowY(type), highG = carryY(type);
        if (u < .36) {
          const w = u / .36, t = easeInOut(w);
          x = lerp(hx, xEnd, t); y = lerp(hy, pileY, t); s = lerp(hs, sP, t);
          o = { yaw: yawOut, theta: SW.crew.phase(walkCm(hx, hy, hs, sP)) + .3, amp: Math.pow(Math.sin(PI * w), .55) };
        } else if (u < .42) {
          const w = (u - .36) / .06;
          x = xEnd; y = pileY; s = sP;
          o = { yaw: yawOut, theta: 0, amp: 0, b: smooth(0, 1, w), gy: lowG, gf: 27, gl: 15, gm: smooth(.15, .8, w), headPitch: 6 };
        } else if (u < .52) {
          const r = (u - .42) / .10;
          x = xEnd; y = pileY; s = sP; carryT = type;
          o = { yaw: lerp(yawOut, yawBack, easeInOut(clamp((r - .1) / .8, 0, 1))), theta: 0, amp: 0, b: 1 - smooth(0, .85, r), gy: lerp(lowG, highG, smooth(0, 1, r)), gf: 27, gl: 15, gm: 1, lean: -8 * smooth(.3, 1, r), headLead: -.18 * Math.sin(PI * r) };
        } else if (u < .86) {
          const w = (u - .52) / .34, t = easeInOut(w);
          x = lerp(xEnd, hx, t); y = lerp(pileY, hy, t); s = lerp(sP, hs, t); carryT = type;
          o = { yaw: yawBack, theta: SW.crew.phase(walkCm(xEnd, pileY, sP, hs)) + 1.1, amp: Math.pow(Math.sin(PI * w), .55), carry: true, gy: highG, gf: 27, gl: 15, gm: 1, lean: -8 };
        } else {
          const h = (u - .86) / .14, l = smooth(0, .34, h);
          x = hx; y = hy; s = hs;
          const turn = last ? 0 : easeInOut(clamp((h - .7) / .3, 0, 1));
          const hold = h < .34;
          o = { yaw: lerp(yawHome, PI - .1, turn), theta: 0, amp: 0, carry: true, gy: lerp(highG, HOIST_Y, l), gf: lerp(27, HOIST_F, l), gl: 15, gm: hold ? 1 : 1 - smooth(.34, .7, h), lean: lerp(-8, -3, l) * (1 - smooth(.5, 1, h)), headPitch: 12 * l * (1 - smooth(.34, .6, h)) };
          if (hold) carryT = type;
          else {
            const slot = slots[si][m], q2 = easeInOut(clamp((h - .34) / .66, 0, 1)), rel = SW.crew.solve(Object.assign({}, o, { gy: HOIST_Y, gf: HOIST_F, gm: 1, yaw: yawHome })).grip, pc = PXCM * s;
            const hand = { x: x + rel[0] * pc, y: y + rel[1] * pc };
            const target = { x: tl + slot.x * ts, y: L.groundPx + slot.y * ts };
            const mx = (hand.x + target.x) / 2, my = Math.min(hand.y, target.y) - 70 * ts;
            flight = { type, slot, q2, bx: (1 - q2) * (1 - q2) * hand.x + 2 * (1 - q2) * q2 * mx + q2 * q2 * target.x, by: (1 - q2) * (1 - q2) * hand.y + 2 * (1 - q2) * q2 * my + q2 * q2 * target.y, sc: lerp(s, ts * slot.sc, q2) };
          }
        }
      }
      cr.g.setAttribute('transform', `translate(${f(x)} ${f(y)}) scale(${f(PXCM * s)})`);
      cr.g.setAttribute('opacity', vis.toFixed(2));
      const r = SW.crew.apply(cr, o);
      if (carryT && r.grip) cr.rig.setItem(carryT, itemTf(carryT, r.grip)); else cr.rig.setItem('');
      if (flight) {
        const fe = flyEls[c];
        fe.setAttribute('href', `#it-${flight.type}`); fe.setAttribute('visibility', flight.q2 < .985 ? 'visible' : 'hidden');
        fe.setAttribute('transform', `translate(${f(flight.bx)} ${f(flight.by)}) rotate(${f(flight.slot.rot * flight.q2 - 14 * (1 - flight.q2))}) scale(${f(flight.sc)})`);
        fe.style.filter = $('truck').style.filter;
      }
    }
  }

"""
s = s[:a] + new_head + keep + new_loop + s[b:]
open(rp, 'w', encoding='utf8').write(s)

hp = os.path.join(ROOT, 'index.html')
h = open(hp, encoding='utf8').read()
if 'js/crew.js' not in h:
    h = h.replace('<script src="js/truck.js"></script>', '<script src="js/truck.js"></script>\n<script src="js/human.js"></script>\n<script src="js/crew.js"></script>')
open(hp, 'w', encoding='utf8').write(h)
bp = os.path.join(ROOT, '_dev', 'build_artifact.py')
b = open(bp, encoding='utf8').read()
if "'crew'" not in b:
    b = b.replace("'truck', 'splash'", "'truck', 'human', 'crew', 'splash'")
open(bp, 'w', encoding='utf8').write(b)
print('patched')
