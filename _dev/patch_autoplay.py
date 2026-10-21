import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf8').read()
def wr(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf8').write(s)

s = rd('js/ride.js')
def rep(a, b, cnt=1):
    global s
    assert a in s, a[:100]
    s = s.replace(a, b, cnt)

# ---- timeline: seconds, built after the crew plan so the load and securing parts are exactly as long as the work
rep("  const PARTS = [['hold', .26], ['load', .34], ['secure', .20], ['drive', .30], ['finale', .26]];",
    "  /* the hero plays by itself on a clock: these are real seconds (load and secure take the length of the crew's plan) */\n  const LEAD = .5, DRIVE = 1.25, TAIL = .35;\n  let PARTS = [];")
rep("    parts = {}; total = PARTS.reduce((s, p) => s + p[1], 0);",
    "    PARTS = [['hold', LEAD], ['load', plan.T_load], ['secure', plan.T_secure], ['drive', DRIVE], ['finale', TAIL]];\n    parts = {}; total = PARTS.reduce((s, p) => s + p[1], 0);")
# camera push begins as the headline fades, not after
a = s.index("  function closeAt(p) {")
b = s.index("  /* on a phone the close frame follows")
s = s[:a] + """  function closeAt(p) {
    const lo = parts.load, se = parts.secure, dr = parts.drive;
    return smooth(.02, lo.p0 + (lo.p1 - lo.p0) * .22, p) * (1 - smooth(se.p0 + (se.p1 - se.p0) * .35, dr.p0 + (dr.p1 - dr.p0) * .3, p));
  }
""" + s[b:]

# ---- a quicker crew: brisk, no dawdling
rep("const WALK = 205, CARRY = 165, JOG = 240, DEP = .35, T_PICK = .8, T_HOIST = 1.3;", "const WALK = 330, CARRY = 270, JOG = 380, DEP = .1, T_PICK = .42, T_HOIST = .72;")
rep("    const clock = [0, .45, .9];", "    const clock = [0, .12, .24];")
rep("    const T_secure = 6.4, S = T_load;\n    const NET0 = S + 1.2, NET1 = S + 2.6, STR0 = S + 2.8, RAMP0 = S + 3.0, RAMP1 = S + 3.9;",
    "    const T_secure = 2.1, S = T_load;\n    const NET0 = S + .3, NET1 = S + .95, STR0 = S + 1.0, RAMP0 = S + 1.05, RAMP1 = S + 1.55;")
rep("holdTo(0, NET0, .2); idle(0, rearA, 1.5, .2, throwPose); holdTo(0, RAMP0 - .3, .1); idle(0, rearA, 1.2, .1, push);", "holdTo(0, NET0, .2); idle(0, rearA, .7, .2, throwPose); holdTo(0, RAMP0 - .15, .1); idle(0, rearA, .55, .1, push);")
rep("holdTo(1, NET0, .26); idle(1, rearB, 1.5, .26, throwPose);", "holdTo(1, NET0, .26); idle(1, rearB, .7, .26, throwPose);")
rep("goTo(2, strap1, STR0 - .4); idle(2, strap1, 1.4, -.9, kneel);", "goTo(2, strap1, STR0 - .2); idle(2, strap1, .65, -.9, kneel);")
rep("goTo(1, strap2, STR0 + .9); idle(1, strap2, 1.4, -.9, kneel);", "goTo(1, strap2, STR0 + .35); idle(1, strap2, .6, -.9, kneel);")
rep("walk(c, at[c], P, Math.min(d, Math.max(1.2, room - .1)), { vis: (u) => 1 - smooth(.78, 1, u) });", "walk(c, at[c], P, Math.min(d, Math.max(.5, room - .05)), { vis: (u) => 1 - smooth(.7, 1, u) });")

# ---- UI: the headline holds until the play starts, then fades in the lead
a = s.index("  function updateUI(p) {")
b = s.index("  /* ======================= scroll plumbing")
s = s[:a] + """  function updateUI(p) {
    const hold = parts.hold, fin = parts.finale;
    const heroO = 1 - smooth(0, hold.p1 * .9, p);
    setIf($('heroCopy'), 'hero', heroO.toFixed(3), (e, v) => { e.style.setProperty('--hero', v); e.style.transform = `translate3d(0,${f(-(1 - v) * 26)}px,0)`; e.style.pointerEvents = v < .1 ? 'none' : ''; });
    setIf(stage, 'riding', heroO < .98 ? 1 : 0, (e, v) => e.classList.toggle('riding', !!v));
    setIf(stage, 'ended', p > .985 ? 1 : 0, (e, v) => e.classList.toggle('ended', !!v));
    setIf($('vig'), 'vig', heroO.toFixed(3), (e, v) => { e.style.opacity = v; });
    const on = p > fin.p0 + (fin.p1 - fin.p0) * .1 ? 1 : 0;
    setIf(stage, 'card', on, (e, v) => cards.forEach((c) => { c.classList.toggle('on', !!v); c.setAttribute('aria-hidden', v ? 'false' : 'true'); c.inert = !v; }));
  }

""" + s[b:]

# ---- playback controller replaces the scroll plumbing
a = s.index("  /* ======================= scroll plumbing")
b = s.index("  /* ======================= boot")
s = s[:a] + """  /* ======================= playback =======================
     idle    the hero rests on its headline (page scrolling is how you start it)
     playing the scene runs on a clock; scrolling is held until it ends
     done    the end frame; the page scrolls normally                                */
  let mode = 'idle', t0 = 0, followReset = false;
  const playMs = () => total * 1000;
  function tick(now) {
    const dt = Math.min(.05, Math.max(0, (now - lastT) / 1000) || .016); lastT = now;
    if (mode === 'playing') {
      ps = clamp((now - t0) / playMs(), 0, 1);
      render(ps, dt);
      if (ps >= 1) { finish(); } else { requestAnimationFrame(tick); return; }
    }
    render(ps, dt);
    if (Math.abs(camVel) > 3) { requestAnimationFrame(tick); } else { running = false; camVel = 0; }
  }
  function kick() { if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(tick); } }
  function setMode(m) { mode = m; html.setAttribute('data-hero', m); }
  function start() {
    if (mode !== 'idle' || reduce) return;
    if (SW.splash && SW.splash.active) return;
    setMode('playing'); t0 = performance.now(); setCue();
    if (window.pageYOffset) window.scrollTo(0, 0);
    kick();
  }
  function finish() {
    if (mode === 'done') return;
    ps = 1; setMode('done'); render(1, 0); setCue();
  }
  function replay() { ps = 0; followSmReset(); setMode('idle'); render(0, 0); start(); }
  function followSmReset() { followSm = null; }
  function setCue() {
    const c = $('cueText'); if (!c) return;
    c.textContent = mode === 'done' ? 'Keep scrolling' : 'Scroll to watch';
  }
  R.go = function () { finish(); };
  R.setSplashOffset = (off) => { splashOff = off; if (!running && L) render(ps, 0); };

  /* the first scroll gesture starts the show; while it plays the page is held in place (no scroll-jacking beyond ~6 seconds, and Skip ends it) */
  function wireIntent() {
    const block = (e) => { if (mode === 'playing' && e.cancelable) e.preventDefault(); };
    let ty = null;
    window.addEventListener('wheel', (e) => { if (mode === 'idle' && e.deltaY > 0 && !(SW.splash && SW.splash.active)) { e.preventDefault(); start(); } else block(e); }, { passive: false });
    window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (mode === 'idle' && ty !== null && ty - e.touches[0].clientY > 10 && !(SW.splash && SW.splash.active)) { if (e.cancelable) e.preventDefault(); start(); } else block(e);
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      if (/^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test((e.target && e.target.tagName) || '')) return;
      const down = ['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End'].indexOf(e.key) > -1;
      if (mode === 'idle' && down && !(SW.splash && SW.splash.active)) { e.preventDefault(); start(); }
      else if (mode === 'playing' && (down || e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home')) e.preventDefault();
    });
    /* a scrollbar drag or a jump link can still move the page; hold it at the top while the scene plays */
    window.addEventListener('scroll', () => { if (mode === 'playing' && window.pageYOffset > 0) window.scrollTo(0, 0); if (mode === 'idle' && window.pageYOffset > 24 && window.pageYOffset < stage.clientHeight) start(); }, { passive: true });
    const skip = $('skip');
    skip.addEventListener('click', (e) => { if (mode === 'playing') { e.preventDefault(); finish(); } });
    const rp = $('replay'); if (rp) rp.addEventListener('click', replay);
  }

""" + s[b:]

# ---- setup order: the plan first, then the timeline
rep("    computeLayout(); buildTimeline();\n    if (first) {", "    computeLayout();\n    if (first) {")
rep("    planCrew();\n    buildBackdrop();\n    applyLayout(); setTrackHeight();", "    planCrew(); buildTimeline();\n    buildBackdrop();\n    applyLayout(); setTrackHeight();")

# ---- track is just the stage now
a = s.index("  function setTrackHeight() {")
b = s.index("\n  }\n", a) + 5
s = s[:a] + """  function setTrackHeight() {
    track.style.height = '';
    trackTop = track.offsetTop; trackH = track.offsetHeight;
  }
""" + s[b:]

# ---- init
a = s.index("    /* the nav is clear over the scene")
b = s.index("  R.state = ")
s = s[:a] + """    /* the nav is clear over the hero and turns solid once the page scrolls away from it */
    const nav = document.querySelector('.nav');
    const navCheck = () => { nav.classList.toggle('solid', (window.pageYOffset || 0) > stage.clientHeight * .7); };
    window.addEventListener('scroll', navCheck, { passive: true }); window.addEventListener('resize', navCheck); navCheck();
    camPrev = camAt(0);
    /* arriving partway down the page (a reload, an anchor link) shows the finished scene and never locks the page */
    const deep = (window.pageYOffset || 0) > stage.clientHeight * .5;
    if (reduce) { setMode('idle'); ps = 0; render(0, 0); return; }
    ps = deep ? 1 : 0; setMode(deep ? 'done' : 'idle'); render(ps, 0); setCue();
    wireIntent();
    let rt = 0, lw = innerWidth, lh = innerHeight;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (Math.abs(innerWidth - lw) < 2 && Math.abs(innerHeight - lh) < 140) { applyLayout(); setTrackHeight(); render(ps, 0); return; }
        lw = innerWidth; lh = innerHeight; cache = {}; followSm = null;
        const t = mode === 'playing' ? (performance.now() - t0) : 0;
        setup(false);
        if (mode === 'playing') t0 = performance.now() - ps * playMs();
        render(ps, 0); void t;
        if (SW.splash && SW.splash.relayout) SW.splash.relayout();
      }, 180);
    });
    kick();
  };
""" + s[b:]
rep("  R.setP = (p) => { window.scrollTo({ top: trackTop + p * Math.max(1, trackH - stage.clientHeight), behavior: 'instant' }); ps = p; render(p, 0); };",
    "  R.setP = (p) => { setMode('manual'); ps = p; render(p, 0); };   /* dev: pose the scene at a fixed point */\n  R.mode = () => mode;\n  R.start = start;")
wr('js/ride.js', s)

# ---- HTML/CSS: cue text, replay button, skip label
h = rd('index.html')
def hrep(a, b):
    global h
    assert a in h, a[:80]
    h = h.replace(a, b, 1)
hrep('<div class="cue" id="cue" aria-hidden="true">Scroll to ride along <svg viewBox="0 0 24 24"><use href="#i-down"/></svg></div>',
     '<div class="cue" id="cue" aria-hidden="true"><span id="cueText">Scroll to watch</span> <svg viewBox="0 0 24 24"><use href="#i-down"/></svg></div>\n    <button class="replay" id="replay" type="button" aria-label="Replay the animation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 3-6.2M4 4v5h5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>Replay</button>')
hrep('<a class="skip" id="skip" href="#quote">Skip<span class="hide-sm"> the ride</span> <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-down"/></svg></a>',
     '<a class="skip" id="skip" href="#quote">Skip <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-down"/></svg></a>')
hrep("  .stage.riding .cue { opacity: 0; pointer-events: none; }", "  .stage.riding .cue { opacity: 0; pointer-events: none; }\n  .stage.ended .cue { opacity: 1; }\n  .replay { position: absolute; z-index: 7; left: max(var(--gutter), env(safe-area-inset-left, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); display: none; align-items: center; gap: 8px; min-height: 44px; padding: 0 16px; border-radius: 999px; cursor: pointer; font: 500 14px/1 var(--body); color: #e9edf8; background: rgba(7,11,22,.58); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(238,241,250,.18); }\n  .replay svg { width: 18px; height: 18px; color: var(--copper-500); }\n  .replay:hover { border-color: var(--copper-500); }\n  .stage.ended .replay { display: inline-flex; }\n  html.ride-off .replay { display: none !important; }")
wr('index.html', h)
print('ok')
