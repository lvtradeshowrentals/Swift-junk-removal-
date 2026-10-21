/* ============================================================================
   The crew's body mechanics. Everything here is a pure function of a few numbers
   (heading, gait phase, squat depth, grip height), so the ride can scrub the crew
   forwards and backwards with no state.

   Units are centimetres, y up, z toward the viewer; a figure's pelvis stays on the
   vertical axis through the origin and the group is moved across the screen instead.

   Walking: foot trajectories follow the stance/swing split of normal gait (stance
   about 60% of the cycle, heel strike a few degrees toe-up, toe-off about 30 degrees
   toe-down, swing clearance about 10 cm). The pelvis height is solved each frame so
   the stance legs stay just short of straight, which produces the natural double-
   support dip and mid-stance rise. Arms swing against the legs, the pelvis and the
   shoulders counter-rotate. Carrying shortens the step, widens the base and leans
   the trunk back against the load held in front of the body.
   ========================================================================== */
(function (SW) {
  'use strict';
  const R = Math.PI / 180, TAU = Math.PI * 2;
  const V = SW.human.v, basis = SW.human.basis;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const sm = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const fract = (v) => v - Math.floor(v);

  const STRIDE = 113, STEP = 68, LEG = 88 * .975;

  /* lowest point of the boot relative to the ankle, for a given toe-up pitch */
  const groundY = (p) => {
    const cp = Math.cos(p), sp = Math.sin(p);
    return -Math.min(-6.5 * sp - 8 * cp, 19.5 * sp - 4.6 * cp);
  };
  /* heel strike, flat, heel off, toe-off, swing, reach */
  const pitchOf = (c) => {
    if (c < .12) return 14 * (1 - c / .12);
    if (c < .45) return 0;
    if (c < .6) return -34 * sm((c - .45) / .15);
    const s = (c - .6) / .4;
    return s < .45 ? -34 * (1 - sm(s / .45)) : 14 * sm((s - .45) / .55);
  };
  const fwdOf = (c) => (c < .6 ? 1 - 2 * c / .6 : -1 + 2 * sm((c - .6) / .4));
  const liftOf = (c) => (c < .6 ? 0 : Math.pow(Math.sin(Math.PI * (c - .6) / .4), 1.15) * 10.5);

  /* distance walked (cm) -> gait phase (radians) */
  /* gait phase from distance walked; a jog uses a longer stride (k) so the legs reach further instead of just turning faster */
  SW.crew = { phase: (distCm, k) => TAU * distCm / (STRIDE * (k || 1)), STRIDE };

  SW.crew.solve = function (o) {
    const amp = clamp(o.amp || 0, 0, 1), b = clamp(o.b || 0, 0, 1), yaw = o.yaw, th = o.theta || 0;
    const pb = basis(yaw, 0);
    const sk = clamp(o.stride || 1, 1, 1.7);
    const S = STEP * amp * sk, W = lerp(9.4, o.carry ? 11.6 : 9.4, 1) + 6.4 * b;
    const feet = [], fn = [];
    for (let i = 0; i < 2; i++) {
      const c = fract(th / TAU + i * .5), nf = amp > .02 ? fwdOf(c) : 0, p = amp > .02 ? pitchOf(c) * R * Math.min(1, amp * 1.4) : 0;
      const fwd = nf * S / 2 + b * (i ? -4 : 6), lift = amp > .02 ? liftOf(c) * amp : 0;
      fn.push(nf);
      feet.push({ fwd, lat: (i ? -1 : 1) * W, y: groundY(p) + lift, pitch: p, yaw });
    }
    /* pelvis height: the stance legs stay just short of straight. A leg's say in it fades in as the heel strikes and out as the toe lifts, so the
       height glides instead of snapping when the support passes from one foot to the other. */
    let py = 0;
    for (let i = 0; i < 2; i++) {
      const f = feet[i], c = fract(th / TAU + i * .5);
      const need = f.y + Math.sqrt(Math.max(1200, LEG * LEG - f.fwd * f.fwd - Math.pow(Math.abs(f.lat) - 9.2, 2)));
      const w = amp > .02 ? (c < .6 ? 1 - sm((c - .5) / .12) : sm((c - .9) / .1)) : 1;
      py = Math.max(py, lerp(70, need, w));
    }
    py = clamp(py || 93, 84 - (sk - 1) * 26, 95);    /* a long stride is a lower, driving posture */
    py = lerp(py, 56, b);
    const sway = amp * 1.7 * Math.sin(th);
    const Pp = V.comb([0, py, 0], pb.F, -15 * b, pb.L, sway);
    feet.forEach((f, i) => { f.a = V.comb([0, f.y, 0], pb.F, f.fwd, pb.L, f.lat); });

    const lean = (o.lean || 0) + 3 * amp + 50 * b;
    const twist = 5 * R * fn[0] * amp;
    const inp = {
      pelvis: Pp, pelvisYaw: yaw + 4 * R * fn[0] * amp, trunkYaw: yaw - twist, trunkPitch: lean * R,
      headYaw: yaw + (o.headLead || 0), headPitch: (o.headPitch || 0) * R - 22 * R * b, neckPitch: 0,
      feet: feet.map((f) => ({ a: f.a, pitch: f.pitch, yaw: f.yaw })), arms: [],
    };
    /* arms: free swing, or IK onto the grip when carrying / picking / lifting */
    const Aarm = 26 * amp;
    let grip = null;
    for (let i = 0; i < 2; i++) {
      const fl = -Aarm * fn[i] * (i ? 1 : 1) - 3;
      const a = { flex: fl, elbow: 14 + 20 * Math.max(0, fl / Math.max(8, Aarm)) + 10 * (o.elbowBend || 0), abd: 5 + 3 * (1 - amp) };
      if (o.gy != null) {
        const gy = o.gy + (Pp[1] - 93) * .7 * (1 - (o.gabs || 0));
        a.target = V.comb([0, gy, 0], pb.F, o.gf, pb.L, (i ? -1 : 1) * (o.gl || 15));
        a.handDir = V.comb([0, 0, 0], pb.F, 1, [0, 1, 0], o.gy > 120 ? .8 : 0);
        a.mix = o.gm == null ? 1 : o.gm;
      }
      inp.arms.push(a);
    }
    if (o.gy != null) { const gy = o.gy + (Pp[1] - 93) * .7 * (1 - (o.gabs || 0)), gp = V.comb([0, gy, 0], pb.F, o.gf); grip = [gp[0], -gp[1]]; }
    return { inp, grip, spread: 1 + Math.abs(feet[0].fwd - feet[1].fwd) / 110 };
  };

  /* an actor: group (shadow + rig) in a figure-local, y-down centimetre space */
  SW.crew.create = function (look) {
    const NS = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(NS, 'g');
    const sh = document.createElementNS(NS, 'ellipse');
    sh.setAttribute('cx', '0'); sh.setAttribute('cy', '.6'); sh.setAttribute('rx', '30'); sh.setAttribute('ry', '4.4'); sh.setAttribute('fill', '#05060f'); sh.setAttribute('opacity', '.4');
    g.appendChild(sh);
    const rig = SW.human.create(look);
    g.appendChild(rig.g);
    return { g, rig, shadow: sh, carryType: '', h: (look.build && look.build.h) || 1 };
  };
  SW.crew.apply = function (cr, o) {
    const r = SW.crew.solve(o);
    cr.rig.draw(r.inp);
    cr.shadow.setAttribute('transform', 'scale(' + r.spread.toFixed(3) + ' 1)');
    return r;
  };
})(window.SW = window.SW || {});
