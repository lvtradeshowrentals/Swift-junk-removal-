/* ============================================================================
   A real human figure, posed in 3D and drawn as vector art.

   Proportions follow Drillis & Contini segment ratios for a 178 cm adult:
   thigh 44.5, shin 43.5, ankle 8, trunk 50, shoulders +/-19.5, neck 8, head 22,
   upper arm 31.5, forearm 26.5, hand 18.5 (cm; y up, x right, z toward the viewer).

   Each frame is solved from a few inputs (pelvis, trunk, head, two feet, two arms):
   legs and carrying arms use two-bone IK, free arms use FK. Every body part is then
   projected orthographically from the 3D joints, so the same figure is correct
   side-on, three-quarter, from the front or from behind. Each part is shaded with
   its own gradient across its form, from one fixed light direction.
   ========================================================================== */
(function (SW) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const R = Math.PI / 180;

  /* ---------- vectors ---------- */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const len = (a) => Math.hypot(a[0], a[1], a[2]);
  const nrm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lin = (a, b, t) => a + (b - a) * t;
  /* comb(base, v1, k1, v2, k2, ...) = base + k1*v1 + k2*v2 ... */
  const comb = (p, ...t) => { let o = p.slice(); for (let i = 0; i < t.length; i += 2) o = add(o, mul(t[i], t[i + 1])); return o; };

  const B = { hip: 9.2, thigh: 44.5, shin: 43.5, ankleH: 8, heel: 6.5, toe: 19.5, trunk: 50, sh: 17.6, neck: 7.4, ua: 31.5, fa: 26.5 };
  SW.BODY = B;

  /* frame from heading (yaw) and forward lean (pitch) */
  function basis(yaw, pitch) {
    const F0 = [Math.cos(yaw), 0, Math.sin(yaw)], L = [Math.sin(yaw), 0, -Math.cos(yaw)];
    const c = Math.cos(pitch || 0), s = Math.sin(pitch || 0);
    return { F: add(mul(F0, c), [0, -s, 0]), L, U: add([0, c, 0], mul(F0, s)), F0 };
  }

  /* two-bone IK; returns the middle joint (knee / elbow) and the (possibly clamped) end */
  function ik2(H, A, l1, l2, pole) {
    let d = sub(A, H), dist = len(d);
    const maxd = l1 + l2 - 0.02;
    if (dist > maxd) { A = add(H, mul(d, maxd / dist)); dist = maxd; d = sub(A, H); }
    if (dist < 8) dist = 8;
    const u = mul(d, 1 / (len(d) || 1));
    let p = sub(pole, mul(u, dot(pole, u)));
    const pl = len(p); p = pl < 1e-4 ? [0, 0, 1] : mul(p, 1 / pl);
    const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return { mid: add(add(H, mul(u, a)), mul(p, h)), end: A };
  }

  /* ---------- 2D geometry (screen: x right, y DOWN) ---------- */
  const P2 = (p) => [p[0], -p[1]];
  const f1 = (n) => Math.round(n * 20) / 20;
  const pathOf = (pts) => { let s = 'M'; for (let i = 0; i < pts.length; i++) s += (i ? 'L' : '') + f1(pts[i][0]) + ' ' + f1(pts[i][1]); return s + 'Z'; };
  const area = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const u = p[i], v = p[(i + 1) % p.length]; a += u[0] * v[1] - v[0] * u[1]; } return a / 2; };
  const orient = (p) => (area(p) < 0 ? p.slice().reverse() : p);
  const unionPath = (polys) => polys.map((q) => pathOf(orient(q))).join('');

  function hull(pts) {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    p.forEach((q) => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); });
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    lo.pop(); up.pop(); return lo.concat(up);
  }

  /* silhouette of an ellipsoid (centre + three semi-axis vectors) */
  function ellipsoid(c, a1, a2, a3, n) {
    n = n || 26;
    let A = 0, Bq = 0, C = 0;
    [a1, a2, a3].forEach((a) => { A += a[0] * a[0]; Bq += a[0] * a[1]; C += a[1] * a[1]; });
    const m = (A + C) / 2, d = Math.sqrt(((A - C) / 2) * ((A - C) / 2) + Bq * Bq);
    const rx = Math.sqrt(Math.max(0, m + d)), ry = Math.sqrt(Math.max(0, m - d)), ang = .5 * Math.atan2(2 * Bq, A - C);
    const ca = Math.cos(ang), sa = Math.sin(ang), out = [];
    for (let i = 0; i < n; i++) {
      const t = i / n * Math.PI * 2, x = rx * Math.cos(t), y = ry * Math.sin(t);
      out.push([c[0] + x * ca - y * sa, -(c[1] + x * sa + y * ca)]);
    }
    return out;
  }

  /* capsule between two screen points; radii r0 -> r1; optional muscle bulge; flat ends for clothing hems */
  function capsule(a, b, r0, r1, bulge, at, flatEnd) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, N = 6, left = [], right = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N, r = lin(r0, r1, t) * (1 + (bulge || 0) * Math.exp(-Math.pow((t - (at == null ? .4 : at)) / .28, 2)));
      const cx = a[0] + dx * t, cy = a[1] + dy * t;
      left.push([cx + nx * r, cy + ny * r]); right.push([cx - nx * r, cy - ny * r]);
    }
    const pts = left.slice();
    if (!flatEnd) for (let k = 1; k < 6; k++) { const g = Math.PI / 2 - k * Math.PI / 6; pts.push([b[0] + (nx * Math.cos(g) + ux * Math.sin(g)) * r1, b[1] + (ny * Math.cos(g) + uy * Math.sin(g)) * r1]); }
    for (let i = N; i >= 0; i--) pts.push(right[i]);
    for (let k = 1; k < 6; k++) { const g = k * Math.PI / 6; pts.push([a[0] + (-nx * Math.cos(g) - ux * Math.sin(g)) * r0, a[1] + (-ny * Math.cos(g) - uy * Math.sin(g)) * r0]); }
    return pts;
  }
  /* a flat band across a limb: from t0 to t1 back along its direction, r either side */
  const band = (p, u, r, t0, t1) => { const n = [-u[1], u[0]], a = [p[0] - u[0] * t0, p[1] - u[1] * t0], b = [p[0] - u[0] * t1, p[1] - u[1] * t1]; return [[a[0] + n[0] * r, a[1] + n[1] * r], [a[0] - n[0] * r, a[1] - n[1] * r], [b[0] - n[0] * r, b[1] - n[1] * r], [b[0] + n[0] * r, b[1] + n[1] * r]]; };
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const circle = (c, r, n) => { const o = []; n = n || 14; for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; o.push([c[0] + Math.cos(t) * r, c[1] - Math.sin(t) * r]); } return o; };
  const bbox = (pts) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; pts.forEach((p) => { if (p[0] < a) a = p[0]; if (p[0] > c) c = p[0]; if (p[1] < b) b = p[1]; if (p[1] > d) d = p[1]; }); return [a, b, c, d]; };

  /* ---------- colours ---------- */
  const hex = (h) => { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mixc = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };

  SW.human = { defs() { return ''; } };   /* gradients live inside each figure now */

  /* three people, not three copies: height (h), build (w chest width, d chest depth, belly, limb thickness), hair and face.
     Same uniform: navy polo with a copper-striped sleeve, charcoal work pants, boots, tan work gloves, navy cap. */
  SW.CREW_LOOK = [
    { skin: '#c88f67', hair: '#2a1a12', shirt: '#1a2b62', pants: '#3a4054', boot: '#5a4030', glove: '#caa35e', cap: '#14224e', brim: '#e8803f', stubble: .12, build: { h: 1.03, w: 1.0, d: 1.0, belly: 0, limb: 1.0, head: 1.0 }, shades: 0 },
    { skin: '#8f5d3f', hair: '#120c0a', shirt: '#1a2b62', pants: '#343a4c', boot: '#3e2e20', glove: '#caa35e', cap: '#14224e', brim: '#e8803f', stubble: .62, beard: 1, build: { h: .98, w: 1.1, d: 1.14, belly: 1.8, limb: 1.1, head: 1.04 }, shades: 0 },
    { skin: '#dcae88', hair: '#6a4a2c', shirt: '#1a2b62', pants: '#3a4054', boot: '#4a3524', glove: '#caa35e', cap: '#14224e', brim: '#e8803f', stubble: .2, build: { h: .955, w: 1.04, d: 1.02, belly: 0, limb: 1.06, head: 1.0 }, shades: 1 },
  ];

  /* the light: upper right, as in the scene (sunrise ahead) */
  const LIGHT = [0.6, -0.8];
  let GID = 0;

  /* ============================================================================ */
  SW.human.create = function (look) {
    const bd = Object.assign({ w: 1, d: 1, belly: 0, limb: 1, head: 1, h: 1 }, look.build || {});
    const g = document.createElementNS(NS, 'g');
    const defsEl = document.createElementNS(NS, 'defs'); g.appendChild(defsEl);
    const mk = (parent, fill, extra) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('fill', fill); if (extra) Object.keys(extra).forEach((k) => p.setAttribute(k, extra[k])); parent.appendChild(p); return p; };
    const G = (parent) => { const e = document.createElementNS(NS, 'g'); parent.appendChild(e); return e; };
    /* a part with its own gradient; its direction is set every frame */
    const shaded = (parent, color) => {
      const id = 'hg' + (++GID), lg = document.createElementNS(NS, 'linearGradient');
      lg.setAttribute('id', id); lg.setAttribute('gradientUnits', 'userSpaceOnUse');
      [[0, mixc(color, '#080c28', .5)], [.5, color], [1, mixc(color, '#fff0d4', .26)]].forEach(([o, c]) => { const s = document.createElementNS(NS, 'stop'); s.setAttribute('offset', o); s.setAttribute('stop-color', c); lg.appendChild(s); });
      defsEl.appendChild(lg);
      const p = mk(parent, 'url(#' + id + ')'); p.__lg = lg; return p;
    };
    const setGrad = (p, x1, y1, x2, y2) => { const l = p.__lg; l.setAttribute('x1', f1(x1)); l.setAttribute('y1', f1(y1)); l.setAttribute('x2', f1(x2)); l.setAttribute('y2', f1(y2)); };
    /* limb: gradient runs across the limb, shade side to light side */
    const limbShade = (p, a, b, r) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      let nx = -dy / L, ny = dx / L;
      if (nx * LIGHT[0] + ny * LIGHT[1] < 0) { nx = -nx; ny = -ny; }
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      setGrad(p, mx - nx * r, my - ny * r, mx + nx * r, my + ny * r);
    };
    /* blob: gradient from the lower-left of the box to the upper-right */
    const blobShade = (p, pts) => { const b = bbox(pts), w = b[2] - b[0], h = b[3] - b[1]; setGrad(p, b[0] + w * .06, b[3] - h * .12, b[2] - w * .04, b[1] + h * .1); };
    const rimOf = (parent) => mk(parent, '#ffb27a', { 'fill-opacity': '.34', transform: 'translate(.5 -.15)' });

    const gFar = G(g), gBack = G(g), gMid = G(g), gItem = G(g), gNear = G(g);

    const limb = () => {
      const e = document.createElementNS(NS, 'g'), o = { g: e };
      o.bootRim = rimOf(e); o.boot = shaded(e, look.boot); o.sole = mk(e, '#17121a'); o.lace = mk(e, 'none', { stroke: '#d6c6ac', 'stroke-width': '.36', 'stroke-opacity': '.85', 'stroke-linecap': 'round' });
      o.rimThigh = rimOf(e); o.rimShin = rimOf(e);
      o.kneePatch = mk(e, '#070a18', { 'fill-opacity': '.0' });
      o.shin = shaded(e, look.pants); o.cuffShade = mk(e, '#070a18', { 'fill-opacity': '.32' });
      o.thigh = shaded(e, look.pants); o.pocket = mk(e, '#070a18', { 'fill-opacity': '.16' }); o.pocketFlap = mk(e, 'none', { stroke: '#050816', 'stroke-width': '.4', 'stroke-opacity': '.5', 'stroke-linecap': 'round' }); o.seam = mk(e, 'none', { stroke: '#0a0e1c', 'stroke-width': '.34', 'stroke-opacity': '.34', 'stroke-linecap': 'round' }); o.crease = mk(e, 'none', { stroke: '#070a18', 'stroke-width': '.32', 'stroke-opacity': '.32', 'stroke-linecap': 'round' });
      return o;
    };
    const arm = () => {
      const e = document.createElementNS(NS, 'g'), o = { g: e };
      o.rimUA = rimOf(e); o.rimFA = rimOf(e); o.rimSl = rimOf(e);
      o.ua = shaded(e, look.skin); o.fa = shaded(e, look.skin); o.fold = mk(e, 'none', { stroke: '#2a1210', 'stroke-width': '.32', 'stroke-opacity': '.28', 'stroke-linecap': 'round' });
      o.sleeve = shaded(e, look.shirt); o.hem = mk(e, '#070a18', { 'fill-opacity': '.28' }); o.hemStripe = mk(e, '#e8803f', { 'fill-opacity': '.95' });
      o.gloveCuff = shaded(e, '#16224f'); o.glove = shaded(e, look.glove); o.thumb = shaded(e, look.glove); o.knuckle = mk(e, 'none', { stroke: '#6e5020', 'stroke-width': '.3', 'stroke-opacity': '.5', 'stroke-linecap': 'round' }); o.fingers = mk(e, 'none', { stroke: '#6e5020', 'stroke-width': '.34', 'stroke-opacity': '.55', 'stroke-linecap': 'round' }); o.gripPad = mk(e, '#8a6a2c', { 'fill-opacity': '.28' });
      return o;
    };
    const legs = [limb(), limb()], arms = [arm(), arm()];

    /* torso */
    const tRim = rimOf(gMid), tPants = shaded(gMid, look.pants), belt = mk(gMid, '#17121c'), buckle = mk(gMid, '#bda878');
    const gLegN = G(gMid), hemShade = mk(gMid, '#050816', { 'fill-opacity': '.3' });
    const tShirtRim = rimOf(gMid), tShirt = shaded(gMid, look.shirt), folds = mk(gMid, 'none', { stroke: '#050816', 'stroke-width': '.36', 'stroke-opacity': '.3', 'stroke-linecap': 'round' });
    const logo = mk(gMid, '#e8803f'), logo2 = mk(gMid, '#f6d3bd'), collar = mk(gMid, '#0b1438', { 'fill-opacity': '.55' });
    const hemStitch = mk(gMid, 'none', { stroke: '#050816', 'stroke-width': '.3', 'stroke-opacity': '.35' });
    const pouch = mk(gMid, '#15121c'), pouchHi = mk(gMid, '#6b6478', { 'fill-opacity': '.5' }), clip = mk(gMid, 'none', { stroke: '#b9b2a2', 'stroke-width': '.5', 'stroke-opacity': '.9' });
    const flapA = mk(gMid, mixc(look.shirt, '#ffffff', .13)), flapB = mk(gMid, mixc(look.shirt, '#ffffff', .13)), flapEdge = mk(gMid, 'none', { stroke: '#050a22', 'stroke-width': '.34', 'stroke-opacity': '.5' });
    const placket = mk(gMid, 'none', { stroke: '#050a22', 'stroke-width': '.5', 'stroke-opacity': '.45' }), btn = [mk(gMid, '#d8d2c4'), mk(gMid, '#d8d2c4')];
    const neckRim = rimOf(gMid), neck = shaded(gMid, look.skin), neckShade = mk(gMid, '#1a0c10', { 'fill-opacity': '.22' });
    /* head: its own group, scaled about the neck so a larger head stays attached */
    const gHead = G(gMid);
    const hairBack = shaded(gHead, look.hair);
    const earFar = mk(gHead, look.skin), earFarIn = mk(gHead, '#1a0c10', { 'fill-opacity': '.3' });
    const headRim = rimOf(gHead), head = shaded(gHead, look.skin), stubble = mk(gHead, look.hair, { 'fill-opacity': String(look.stubble || 0) });
    const cheek = mk(gHead, '#e8a090', { 'fill-opacity': '.16' }), socket = [mk(gHead, '#2a1210', { 'fill-opacity': '.2' }), mk(gHead, '#2a1210', { 'fill-opacity': '.2' })];
    const nose = mk(gHead, look.skin), noseShade = mk(gHead, '#1a0c10', { 'fill-opacity': '.24' }), noseHi = mk(gHead, '#fff0d8', { 'fill-opacity': '.22' });
    const earNear = mk(gHead, look.skin), earNearIn = mk(gHead, '#1a0c10', { 'fill-opacity': '.32' });
    const eyeW = [mk(gHead, '#f6efe6'), mk(gHead, '#f6efe6')], iris = [mk(gHead, '#26160f'), mk(gHead, '#26160f')];
    const brow = [mk(gHead, 'none', { stroke: look.hair, 'stroke-width': '.8', 'stroke-linecap': 'round' }), mk(gHead, 'none', { stroke: look.hair, 'stroke-width': '.8', 'stroke-linecap': 'round' })];
    const mouth = mk(gHead, 'none', { stroke: '#5a2a26', 'stroke-width': '.6', 'stroke-linecap': 'round' }), lip = mk(gHead, '#a85a50', { 'fill-opacity': '.6' });
    const capDome = shaded(gHead, look.cap), capSeam = mk(gHead, 'none', { stroke: '#050a22', 'stroke-width': '.32', 'stroke-opacity': '.7' }), capBtn = mk(gHead, '#e8803f');
    const capBrim = shaded(gHead, look.brim), capLogo = mk(gHead, '#f6d3bd'), capBand = mk(gHead, '#050a22', { 'fill-opacity': '.35' }), burn = mk(gHead, look.hair), shades = mk(gHead, '#0c0f19'), shadeGlint = mk(gHead, '#aab3ca', { 'fill-opacity': '.6' }), nape = shaded(gHead, look.hair);

    gHead.insertBefore(nape, earNear); gHead.insertBefore(burn, capDome);
    const itemUse = document.createElementNS(NS, 'use'); itemUse.setAttribute('visibility', 'hidden'); gItem.appendChild(itemUse);
    let itemOrder = 'front', side0 = null;

    const headG = gHead;
    const rig = {
      g, legs, arms, item: itemUse,
      draw(inp) {
        const pb = basis(inp.pelvisYaw, 0), tb = basis(inp.trunkYaw, inp.trunkPitch), hb = basis(inp.headYaw, inp.headPitch + inp.trunkPitch * .3);
        const Pp = inp.pelvis;
        const hip = [add(Pp, mul(pb.L, B.hip)), add(Pp, mul(pb.L, -B.hip))];
        const shC = add(Pp, mul(tb.U, B.trunk));
        const sh = [comb(shC, tb.L, B.sh * bd.w, tb.U, -3.4), comb(shC, tb.L, -B.sh * bd.w, tb.U, -3.4)];
        const neckB = comb(shC, tb.U, 2.5), nb = basis(inp.trunkYaw, inp.trunkPitch * .55 + (inp.neckPitch || 0));
        const headB = comb(neckB, nb.U, B.neck);
        const headC = comb(headB, hb.U, 9.4, hb.F, 0.5);

        /* ----- legs: IK to the ankle targets ----- */
        const leg = [0, 1].map((i) => {
          const f = inp.feet[i], fb = basis(f.yaw, 0);
          const pole = comb([0, 0, 0], pb.F, 1, pb.L, (i === 0 ? 1 : -1) * 0.2);
          const r = ik2(hip[i], f.a, B.thigh, B.shin, pole);
          const cp = Math.cos(f.pitch), sp = Math.sin(f.pitch);
          const pt = (fw, up, lat) => { const ff = fw * cp - up * sp, uu = fw * sp + up * cp; return comb(r.end, fb.F0, ff, [0, 1, 0], uu, fb.L, lat); };
          return { hip: hip[i], knee: r.mid, ank: r.end, pt };
        });

        /* ----- arms ----- */
        const arm_ = [0, 1].map((i) => {
          const a = inp.arms[i], sgn = i === 0 ? 1 : -1;
          const fl = (a.flex || 0) * R, ab = (a.abd || 0) * R, ef = ((a.flex || 0) + (a.elbow || 0)) * R;
          const d1 = nrm(comb([0, 0, 0], tb.U, -Math.cos(fl), tb.F, Math.sin(fl), tb.L, sgn * Math.sin(ab)));
          let el = comb(sh[i], d1, B.ua);
          const d2 = nrm(comb([0, 0, 0], tb.U, -Math.cos(ef), tb.F, Math.sin(ef), tb.L, sgn * Math.sin(ab) * .8));
          let wr = comb(el, d2, B.fa), hd = comb(wr, d2, 9);
          if (a.target) {
            const pole = comb([0, 0, 0], tb.U, -1, tb.L, sgn * 1.1, tb.F, -.2);
            const r = ik2(sh[i], a.target, B.ua, B.fa + 9, pole);
            const el2 = r.mid, dir = nrm(sub(r.end, el2)), wr2 = comb(el2, dir, B.fa), hd2 = comb(wr2, a.handDir ? nrm(a.handDir) : dir, 9);
            const m = a.mix == null ? 1 : a.mix;
            el = add(mul(el, 1 - m), mul(el2, m)); wr = add(mul(wr, 1 - m), mul(wr2, m)); hd = add(mul(hd, 1 - m), mul(hd2, m));
          }
          return { sh: sh[i], el, wr, hd };
        });

        /* ----- depth order: which side faces the viewer ----- */
        const nearL = pb.L[2] > 0, key = nearL ? 'L' : 'R';
        if (side0 !== key) {
          side0 = key;
          const ni = nearL ? 0 : 1, fi = 1 - ni;
          gFar.appendChild(legs[fi].g); gFar.appendChild(arms[fi].g); gLegN.appendChild(legs[ni].g); gNear.appendChild(arms[ni].g);
        }
        const order = tb.F[2] < -.2 ? 'back' : 'front';
        if (order !== itemOrder) { itemOrder = order; (order === 'back' ? gBack : gItem).appendChild(itemUse); }

        /* ----- legs ----- */
        leg.forEach((L, i) => {
          const o = legs[i], hp = P2(L.hip), kn = P2(L.knee), an = P2(L.ank);
          const bl = bd.limb, th = capsule(hp, kn, 9.5 * bl, 6.3 * bl, .1, .35);
          /* the trouser leg ends in a straight hem just above the boot */
          const hemP = [lin(kn[0], an[0], .9), lin(kn[1], an[1], .9)];
          const shn = capsule(kn, hemP, 6.3 * bl, 5.5 * bl, .16, .3, true);
          o.thigh.setAttribute('d', pathOf(th)); o.rimThigh.setAttribute('d', pathOf(th)); o.shin.setAttribute('d', pathOf(shn)); o.rimShin.setAttribute('d', pathOf(shn));
          limbShade(o.thigh, hp, kn, 8.5 * bl); limbShade(o.shin, kn, hemP, 6 * bl);
          const sd = [an[0] - kn[0], an[1] - kn[1]], sl = Math.hypot(sd[0], sd[1]) || 1, sn = [-sd[1] / sl, sd[0] / sl], su = [sd[0] / sl, sd[1] / sl];
          o.cuffShade.setAttribute('d', pathOf(capsule([hemP[0] - su[0] * 2.6, hemP[1] - su[1] * 2.6], hemP, 5.6 * bl, 5.6 * bl, 0, 0, true)));
          const tn = [-(kn[1] - hp[1]), kn[0] - hp[0]], tl = Math.hypot(tn[0], tn[1]) || 1, tu = [(kn[0] - hp[0]) / tl, (kn[1] - hp[1]) / tl];
          const ofs = (u, v) => [hp[0] + tu[0] * u * tl + tn[0] / tl * v, hp[1] + tu[1] * u * tl + tn[1] / tl * v];
          const side = (i === 0 ? 1 : -1) * 0 + 1;
          /* the pocket sits on the outer face of the thigh, so it shows whichever way the leg is turned */
          const pq = [ofs(.34, 6.2 * bl), ofs(.34, -1.4 * bl), ofs(.62, -1.4 * bl), ofs(.62, 6.2 * bl)];
          o.pocket.setAttribute('d', pathOf(pq)); o.pocketFlap.setAttribute('d', 'M' + f1(pq[0][0]) + ' ' + f1(pq[0][1]) + 'L' + f1(pq[1][0]) + ' ' + f1(pq[1][1]) + 'M' + f1(ofs(.4, 5)[0]) + ' ' + f1(ofs(.4, 5)[1]) + 'L' + f1(ofs(.4, 0)[0]) + ' ' + f1(ofs(.4, 0)[1]));
          o.seam.setAttribute('d', 'M' + f1(ofs(.04, 8.4 * bl)[0]) + ' ' + f1(ofs(.04, 8.4 * bl)[1]) + 'L' + f1(ofs(1, 5.6 * bl)[0]) + ' ' + f1(ofs(1, 5.6 * bl)[1]));
          o.kneePatch.setAttribute('d', pathOf(ellipsoid([kn[0], -kn[1], 0], [tu[0] * 4.6, -tu[1] * 4.6, 0], [tn[0] / tl * 5.2 * bl, -tn[1] / tl * 5.2 * bl, 0], [0, 0, 1], 12).map((q) => [q[0], q[1]]))); o.kneePatch.setAttribute('fill-opacity', '.13');
          o.crease.setAttribute('d', 'M' + f1(kn[0] - sn[0] * 4.2) + ' ' + f1(kn[1] - sn[1] * 4.2) + 'Q' + f1(kn[0] - su[0] * 1.5) + ' ' + f1(kn[1] - su[1] * 1.5) + ' ' + f1(kn[0] + sn[0] * 4.2) + ' ' + f1(kn[1] + sn[1] * 4.2));
          /* boot: hull of the foot's own 3D outline */
          const bp = [], sp = [];
          [-5.3, 5.3].forEach((lat) => {
            bp.push(L.pt(-B.heel, -B.ankleH, lat), L.pt(B.toe - 1.5, -B.ankleH, lat * .75), L.pt(B.toe, -4.6, lat * .65), L.pt(B.toe - 2, -1.2, lat * .7), L.pt(12, 1.4, lat * .85), L.pt(6.4, 4.2, lat), L.pt(4, 11.5, lat), L.pt(-4.4, 11.5, lat), L.pt(-B.heel - .3, 3, lat));
            sp.push(L.pt(-B.heel, -B.ankleH, lat), L.pt(B.toe - 1.5, -B.ankleH, lat * .75), L.pt(B.toe - .6, -B.ankleH + 2.4, lat * .75), L.pt(-B.heel, -B.ankleH + 2.8, lat));
          });
          const bh = hull(bp.map(P2)), sh_ = hull(sp.map(P2));
          o.boot.setAttribute('d', pathOf(bh)); o.bootRim.setAttribute('d', pathOf(bh)); o.sole.setAttribute('d', pathOf(sh_));
          blobShade(o.boot, bh);
          const lat = i === 0 ? 4.5 : -4.5;
          const l1 = P2(L.pt(2.2, 8.4, lat)), l2 = P2(L.pt(9.8, 2.4, lat)), l3 = P2(L.pt(4.6, 10.4, lat)), l4 = P2(L.pt(11.4, 1, lat * .9)), l5 = P2(L.pt(3.4, 6.5, lat));
          o.lace.setAttribute('d', 'M' + f1(l1[0]) + ' ' + f1(l1[1]) + 'L' + f1(l2[0]) + ' ' + f1(l2[1]) + 'M' + f1(l3[0]) + ' ' + f1(l3[1]) + 'L' + f1(l4[0]) + ' ' + f1(l4[1]) + 'M' + f1(l5[0]) + ' ' + f1(l5[1]) + 'L' + f1(l5[0] + 5.4) + ' ' + f1(l5[1] + 1.2));
        });

        /* ----- torso: chest + waist as one silhouette, sloped trapezius ----- */
        const br = 1 + .018 * (inp.breath || 0), bf = bd.belly;
        const chest = ellipsoid(comb(Pp, tb.U, 31.5), mul(tb.F, 11.9 * bd.d * br), mul(tb.L, 15.6 * bd.w), mul(tb.U, 15), 26);
        const lower = ellipsoid(comb(Pp, tb.U, 15), mul(tb.F, (10.8 + bf) * bd.d), mul(tb.L, 14.2 * bd.w + bf * .4), mul(tb.U, 9), 22);
        const hemE = ellipsoid(comb(Pp, tb.U, 2.2), mul(tb.F, (12 + bf * 1.1) * bd.d), mul(tb.L, 17.2 * bd.w + bf * .3), mul(tb.U, 1.2), 22);
        hemShade.setAttribute('d', pathOf(ellipsoid(comb(Pp, tb.U, -.4), mul(tb.F, (12.3 + bf * 1.1) * bd.d), mul(tb.L, 17.5 * bd.w + bf * .3), mul(tb.U, 2.6), 22)));
        hemStitch.setAttribute('d', pathOf(ellipsoid(comb(Pp, tb.U, 3.6), mul(tb.F, (11.7 + bf * 1.1) * bd.d), mul(tb.L, 16.8 * bd.w + bf * .3), mul(tb.U, .4), 22)));
        const dl = [comb(sh[0], tb.U, -.4), comb(sh[1], tb.U, -.4)].map((q) => circle(P2(q), 5, 14));
        const trap = hull([].concat(circle(P2(comb(neckB, tb.U, 1)), 6.4, 12), dl[0], dl[1]));
        const shirtU = [hull([].concat(chest, lower, hemE)), trap];
        const pelvisE = ellipsoid(Pp, mul(tb.F, 10.6), mul(pb.L, 16.4), mul(tb.U, 9.5), 22);
        const pantsU = [pelvisE, circle(P2(hip[0]), 8.6, 12), circle(P2(hip[1]), 8.6, 12)];
        tShirt.setAttribute('d', unionPath(shirtU)); tShirtRim.setAttribute('d', unionPath(shirtU));
        tPants.setAttribute('d', unionPath(pantsU)); tRim.setAttribute('d', unionPath(pantsU));
        blobShade(tShirt, [].concat(chest, lower, hemE)); blobShade(tPants, pelvisE);
        const beltE = ellipsoid(comb(Pp, tb.U, 6.2), mul(tb.F, 10.8), mul(tb.L, 15.8), mul(tb.U, 1.7), 18);
        belt.setAttribute('d', pathOf(beltE));
        buckle.setAttribute('d', tb.F[2] > .25 ? pathOf(circle(P2(comb(Pp, tb.U, 6.2, tb.F, 10.6)), 1.5, 8)) : '');
        const fa = P2(comb(Pp, tb.U, 36, tb.L, 12)), fb = P2(comb(Pp, tb.U, 10, tb.L, 9.5)), fc = P2(comb(Pp, tb.U, 36, tb.L, -12)), fd = P2(comb(Pp, tb.U, 10, tb.L, -9.5));
        folds.setAttribute('d', 'M' + f1(fa[0]) + ' ' + f1(fa[1]) + 'Q' + f1((fa[0] + fb[0]) / 2 + 1.2) + ' ' + f1((fa[1] + fb[1]) / 2) + ' ' + f1(fb[0]) + ' ' + f1(fb[1]) + 'M' + f1(fc[0]) + ' ' + f1(fc[1]) + 'Q' + f1((fc[0] + fd[0]) / 2 - 1.2) + ' ' + f1((fc[1] + fd[1]) / 2) + ' ' + f1(fd[0]) + ' ' + f1(fd[1]));
        const fz = tb.F[2];
        logo.setAttribute('d', ''); logo2.setAttribute('d', '');
        if (Math.abs(fz) > .25) {
          const front = fz > 0, ctr = comb(Pp, tb.U, front ? 39 : 37, tb.L, front ? 8.8 : 0, tb.F, front ? 11 : -11);
          const w = (front ? 5 : 7.6) * Math.abs(fz), h = front ? 3.8 : 5.4, c2 = P2(ctr);
          const chev = (dx) => { const x = c2[0] + dx * w; return 'M' + f1(x - w * .55) + ' ' + f1(c2[1] - h) + 'L' + f1(x) + ' ' + f1(c2[1] - h) + 'L' + f1(x + w * .5) + ' ' + f1(c2[1]) + 'L' + f1(x) + ' ' + f1(c2[1] + h) + 'L' + f1(x - w * .55) + ' ' + f1(c2[1] + h) + 'L' + f1(x - w * .05) + ' ' + f1(c2[1]) + 'Z'; };
          logo.setAttribute('d', chev(-.4)); logo2.setAttribute('d', chev(.5));
        }
        collar.setAttribute('d', pathOf(ellipsoid(comb(shC, tb.U, 1.6, tb.F, 0.8), mul(tb.F, 5.9), mul(tb.L, 7), mul(tb.U, 2.2), 14)));
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
        clip.setAttribute('d', 'M' + f1(ck[0][0]) + ' ' + f1(ck[0][1]) + 'Q' + f1(ck[1][0]) + ' ' + f1(ck[1][1]) + ' ' + f1(ck[2][0]) + ' ' + f1(ck[2][1]));

        /* ----- sleeves, arms, gloves ----- */
        arm_.forEach((A, i) => {
          const o = arms[i], s = P2(A.sh), e = P2(A.el), w = P2(A.wr), h = P2(A.hd);
          const al = bd.limb, ua = capsule(s, e, 5.3 * al, 4.4 * al, .14, .35), fa_ = capsule(e, w, 4.4 * al, 3.3 * al, .2, .3);
          o.ua.setAttribute('d', pathOf(ua)); o.rimUA.setAttribute('d', pathOf(ua)); o.fa.setAttribute('d', pathOf(fa_)); o.rimFA.setAttribute('d', pathOf(fa_));
          limbShade(o.ua, s, e, 5.2); limbShade(o.fa, e, w, 4);
          const se = [lin(s[0], e[0], .56), lin(s[1], e[1], .56)];
          const sl = capsule(s, se, 6.5 * al, 5.9 * al, .06, .3, true);
          o.sleeve.setAttribute('d', pathOf(sl)); o.rimSl.setAttribute('d', pathOf(sl)); limbShade(o.sleeve, s, se, 6);
          const du = [e[0] - s[0], e[1] - s[1]], dl_ = Math.hypot(du[0], du[1]) || 1, uu = [du[0] / dl_, du[1] / dl_], nn = [-uu[1], uu[0]];
          o.hem.setAttribute('d', pathOf(band(se, uu, 5.9 * al, 0, 2.1)));
          o.hemStripe.setAttribute('d', pathOf(band(se, uu, 5.95 * al, 3.1, 4.5)));
          o.fold.setAttribute('d', 'M' + f1(e[0] - nn[0] * 3.4) + ' ' + f1(e[1] - nn[1] * 3.4) + 'Q' + f1(e[0] + uu[0] * 1.6) + ' ' + f1(e[1] + uu[1] * 1.6) + ' ' + f1(e[0] + nn[0] * 3.4) + ' ' + f1(e[1] + nn[1] * 3.4));
          /* glove: cuffed, with a separate thumb */
          const hd = [h[0] - w[0], h[1] - w[1]], hl = Math.hypot(hd[0], hd[1]) || 1, hu = [hd[0] / hl, hd[1] / hl], hn = [-hu[1], hu[0]];
          const at = (u, v) => [w[0] + hu[0] * u + hn[0] * v, w[1] + hu[1] * u + hn[1] * v];
          const gp = [at(1.6, -3.9), at(1.6, 3.9), at(6, 4.7), at(12, 4.2), at(16.6, 3), at(18, 0), at(16.6, -3), at(12, -4.2), at(6, -4.7)];
          o.glove.setAttribute('d', pathOf(hull(gp))); limbShade(o.glove, at(0, -4), at(0, 4), 4);
          o.gloveCuff.setAttribute('d', pathOf(hull([at(-2, -4.3), at(-2, 4.3), at(2.6, 4.3), at(2.6, -4.3)]))); limbShade(o.gloveCuff, at(0, -4.4), at(0, 4.4), 4.7);
          const side = (A.thumbSide || 1) * (i === 0 ? 1 : -1);
          o.thumb.setAttribute('d', pathOf(hull([at(3.4, 3.7 * side), at(4.8, 5.4 * side), at(11, 5.6 * side), at(12.8, 4.3 * side), at(9, 3.6 * side)]))); limbShade(o.thumb, at(0, -4.4), at(0, 4.4), 4.7);
          o.knuckle.setAttribute('d', 'M' + f1(at(9, -3)[0]) + ' ' + f1(at(9, -3)[1]) + 'L' + f1(at(9, 3)[0]) + ' ' + f1(at(9, 3)[1]));
          let fg = ''; [-2.2, 0, 2.2].forEach((v) => { const a0 = at(10.4, v), a1 = at(16.6, v * .8); fg += 'M' + f1(a0[0]) + ' ' + f1(a0[1]) + 'L' + f1(a1[0]) + ' ' + f1(a1[1]); });
          o.fingers.setAttribute('d', fg); o.gripPad.setAttribute('d', pathOf(hull([at(3, -3), at(3, 3), at(8, 3.6), at(8, -3.6)])));
        });

        headG.setAttribute('transform', 'translate(' + f1(P2(headB)[0]) + ' ' + f1(P2(headB)[1]) + ') scale(' + (1.07 * bd.head).toFixed(3) + ') translate(' + f1(-P2(headB)[0]) + ' ' + f1(-P2(headB)[1]) + ')');
        /* ----- neck and head ----- */
        const nk = capsule(P2(comb(neckB, tb.U, -2)), P2(headB), 5.9, 5.2, 0);
        neck.setAttribute('d', pathOf(nk)); neckRim.setAttribute('d', pathOf(nk)); limbShade(neck, P2(neckB), P2(headB), 5);
        neckShade.setAttribute('d', pathOf(capsule(P2(comb(neckB, tb.U, -2)), P2(comb(headB, hb.U, -3)), 5, 4.6, 0)));
        const crown = ellipsoid(headC, mul(hb.F, 10.2), mul(hb.L, 8.1), mul(hb.U, 11.6), 30);
        const jawE = ellipsoid(comb(headC, hb.F, 2.9, hb.U, -5.8), mul(hb.F, 7.4), mul(hb.L, 5.9), mul(hb.U, 6.3), 22);
        const headH = hull([].concat(crown, jawE));
        head.setAttribute('d', pathOf(headH)); headRim.setAttribute('d', pathOf(headH)); blobShade(head, headH);
        const beard = look.beard ? 1 : 0;
        stubble.setAttribute('d', look.stubble ? pathOf(ellipsoid(comb(headC, hb.F, beard ? 3.4 : 3.3, hb.U, beard ? -6.9 : -6.4), mul(hb.F, beard ? 7.5 : 6.9), mul(hb.L, beard ? 6.05 : 5.45), mul(hb.U, beard ? 5.4 : 4.4), 18)) : '');
        cheek.setAttribute('d', pathOf(ellipsoid(comb(headC, hb.F, 6.2, hb.U, -2.6), mul(hb.F, 2.8), mul(hb.L, 5.4), mul(hb.U, 2.4), 12)));
        const hairE = ellipsoid(comb(headC, hb.F, -5.2, hb.U, -2.4), mul(hb.F, 5.4), mul(hb.L, 6.6), mul(hb.U, 6.6), 18);
        hairBack.setAttribute('d', pathOf(hairE)); blobShade(hairBack, hairE);
        /* the hair that shows under the cap: nape and behind the ear (a short taper) */
        const napeE = ellipsoid(comb(headC, hb.F, -5.6, hb.U, -.4), mul(hb.F, 5.2), mul(hb.L, 7.8), mul(hb.U, 5.6), 22);
        nape.setAttribute('d', pathOf(napeE)); blobShade(nape, napeE);
        const earAt = (sgn) => comb(headC, hb.L, sgn * 7.7, hb.F, -.3, hb.U, -1.4);
        const ear = (sgn) => ellipsoid(earAt(sgn), mul(hb.F, 2.5), mul(hb.L, 1), mul(hb.U, 3.6), 12);
        const nearSgn = hb.L[2] > 0 ? 1 : -1;
        earFar.setAttribute('d', pathOf(ear(-nearSgn))); earFarIn.setAttribute('d', pathOf(ellipsoid(earAt(-nearSgn), mul(hb.F, 1.3), mul(hb.L, 1), mul(hb.U, 2.1), 10)));
        earNear.setAttribute('d', pathOf(ear(nearSgn))); earNearIn.setAttribute('d', pathOf(ellipsoid(comb(earAt(nearSgn), hb.L, nearSgn * .5, hb.F, -.3), mul(hb.F, 1.3), mul(hb.L, .5), mul(hb.U, 2.2), 10)));
        burn.setAttribute('d', pathOf(ellipsoid(comb(earAt(nearSgn), hb.F, 2.9, hb.U, 1.2, hb.L, nearSgn * -.4), mul(hb.F, .9), mul(hb.L, .8), mul(hb.U, 2.4), 10)));
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
        for (let a = -66; a <= 66; a += 22) { const r = a * R; bp2.push(comb(c0, hb.F, Math.cos(r) * 10.6, hb.L, Math.sin(r) * 8.6, hb.U, -.7)); bp2.push(comb(c0, hb.F, Math.cos(r) * 18.2, hb.L, Math.sin(r) * 11, hb.U, -1.5 - Math.abs(Math.sin(r)) * 1)); }
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

        return { tb, pb, hb, shoulder: sh, leg, arm: arm_, pelvis: Pp, headC };
      },
      setItem(type, tf) {
        if (!type) { itemUse.setAttribute('visibility', 'hidden'); itemUse.__t = ''; return; }
        if (itemUse.__t !== type) { itemUse.setAttribute('href', '#it-' + type); itemUse.__t = type; }
        itemUse.setAttribute('visibility', 'visible'); itemUse.setAttribute('transform', tf);
      },
    };
    return rig;
  };

  SW.human.basis = basis; SW.human.ik2 = ik2;
  SW.human.v = { add, sub, mul, dot, len, nrm, comb, lin };
})(window.SW = window.SW || {});
