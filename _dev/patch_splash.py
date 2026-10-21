"""Splash intro: white lock-up, then the truck drives in behind a chevron-shaped wipe and parks on the hero frame."""
P = r'C:\Users\Cleo\Desktop\swift-junk-removal\index.html'
s = open(P, encoding='utf-8').read()

def sub(a, b, once=True):
    global s
    assert a in s, a[:70]
    s = s.replace(a, b, 1)

# ---------------------------------------------------------------- early class (decides before first paint)
sub('<body>\n', '''<body>
<script>
/* Plays once per visit. ?nosplash skips it, ?splash replays it. Reduced-motion visitors never see it. */
(function () {
  var play = true;
  try {
    if (location.search.indexOf('nosplash') > -1) play = false;
    else if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) play = false;
    else if (sessionStorage.getItem('swiftIntro') && location.search.indexOf('splash') < 0) play = false;
  } catch (e) {}
  if (play) document.documentElement.classList.add('splash-on');
})();
</script>
''')

# ---------------------------------------------------------------- CSS
CSS = r'''
  /* ---------- splash intro ---------- */
  .splash, .splash-skip, .wipe { display: none; }
  .splash-on:not(.splash-over) { overflow: hidden; }
  .splash-on:not(.splash-over) .splash { display: grid; place-items: center; position: fixed; inset: 0; z-index: 100; background: #fff; }
  .splash-on:not(.splash-over) .wipe { display: block; position: fixed; inset: 0; width: 100%; height: 100%; z-index: 101; pointer-events: none; filter: drop-shadow(0 0 14px rgba(232,128,63,.55)); }
  .splash-on:not(.splash-over) .splash-skip {
    display: inline-flex; position: fixed; z-index: 102; right: max(var(--gutter), env(safe-area-inset-right, 0px)); bottom: calc(22px + env(safe-area-inset-bottom, 0px));
    align-items: center; min-height: 44px; padding: 0 20px; border-radius: 999px; cursor: pointer;
    font: 600 14px/1 var(--body); color: var(--navy-900); background: rgba(255,255,255,.9);
    border: 1.5px solid rgba(15,26,51,.25); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  }
  .splash-skip:hover { border-color: var(--copper-500); }

  .sp-lock { display: flex; align-items: center; gap: clamp(14px, 2.6vw, 36px); padding-inline: 20px; }
  .sp-mark { width: clamp(72px, 13vw, 176px); height: auto; display: block; overflow: visible; }
  .sp-rule { width: 2px; align-self: stretch; margin-block: 6%; background: linear-gradient(#e8803f, rgba(232,128,63,.25)); transform-origin: center; }
  .sp-text { display: flex; flex-direction: column; gap: clamp(8px, 1.3vw, 18px); }
  .sp-word { display: flex; font: 700 clamp(46px, 9.6vw, 124px)/.9 var(--body); letter-spacing: .06em; color: var(--navy-900); }
  .sp-word span { display: inline-block; }
  .sp-sub { font: 600 clamp(10.5px, 1.6vw, 21px)/1 var(--body); letter-spacing: .46em; color: var(--copper-700); white-space: nowrap; }

  .sp-mark path, .sp-word span, .sp-sub, .sp-rule { opacity: 0; }
  .splash.play .sp-mark path { animation: chevIn .55s cubic-bezier(.2,.8,.2,1) both; }
  .splash.play .sp-mark .c2 { animation-delay: .12s; }
  .splash.play .sp-mark .c3 { animation-delay: .24s; }
  .splash.play .sp-rule { animation: ruleIn .5s cubic-bezier(.2,.8,.2,1) .6s both; }
  .splash.play .sp-word span { animation: letterIn .55s cubic-bezier(.2,.9,.2,1) both; animation-delay: calc(.62s + var(--i) * .07s); }
  .splash.play .sp-sub { animation: subIn .9s cubic-bezier(.2,.8,.2,1) 1.02s both; }
  @keyframes chevIn { from { opacity: 0; transform: translateX(-38px); } to { opacity: 1; transform: none; } }
  @keyframes ruleIn { from { opacity: 0; transform: scaleY(0); } to { opacity: 1; transform: none; } }
  @keyframes letterIn { from { opacity: 0; transform: translateX(-22px); filter: blur(7px); } to { opacity: 1; transform: none; filter: none; } }
  @keyframes subIn { from { opacity: 0; letter-spacing: .9em; } to { opacity: 1; letter-spacing: .46em; } }

  /* the hero holds back until the truck has driven in, then arrives in one beat */
  .hero-copy > * { transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1); }
  .hero-copy > :nth-child(2) { transition-delay: .08s; }
  .hero-copy > :nth-child(3) { transition-delay: .16s; }
  .nav, .cue { transition: opacity .7s ease; }
  .splash-on:not(.hero-in) .hero-copy > * { opacity: 0; transform: translateY(18px); }
  .splash-on:not(.hero-in) .nav, .splash-on:not(.hero-in) .cue { opacity: 0; }
'''
sub('  /* ---------- responsive ---------- */', CSS + '\n  /* ---------- responsive ---------- */')

# ---------------------------------------------------------------- markup
HTML = r'''<div class="splash" id="splash" aria-hidden="true">
  <div class="sp-lock">
    <svg class="sp-mark" viewBox="0 0 172 108" focusable="false">
      <path class="c1" d="M0 0H30L64 54L30 108H0L34 54Z" fill="#f6d3bd"/>
      <path class="c2" d="M54 0H84L118 54L84 108H54L88 54Z" fill="#e99a63"/>
      <path class="c3" d="M108 0H138L172 54L138 108H108L142 54Z" fill="#0f1a33"/>
    </svg>
    <span class="sp-rule"></span>
    <div class="sp-text">
      <div class="sp-word"><span style="--i:0">S</span><span style="--i:1">W</span><span style="--i:2">I</span><span style="--i:3">F</span><span style="--i:4">T</span></div>
      <div class="sp-sub">JUNK REMOVAL</div>
    </div>
  </div>
</div>
<svg class="wipe" id="wipe" aria-hidden="true" focusable="false">
  <polyline id="wc2" fill="none" stroke="#7a4630" stroke-width="5" stroke-linejoin="miter" stroke-opacity=".85"/>
  <polyline id="wc1" fill="none" stroke="#c4632d" stroke-width="6" stroke-linejoin="miter"/>
  <polyline id="wc0" fill="none" stroke="#f08a4b" stroke-width="7" stroke-linejoin="miter"/>
</svg>
<button class="splash-skip" id="splashSkip" type="button">Skip intro</button>

'''
sub('<header class="nav">', HTML + '<header class="nav">')

# ride wrapper around shadows + truck so the whole thing can drive in
sub('    <!-- contact shadows -->', '    <g id="ride">\n    <!-- contact shadows -->')
sub('    </g>\n\n    <g id="motes"></g>', '    </g>\n    </g>\n\n    <g id="motes"></g>')

# ---------------------------------------------------------------- wheels: spin group + static highlights
WHEELS = r'''  /* ---------- truck: wheels (black alloys on all-terrain tyres, as in the reference) ---------- */
  (() => {
    const wheel = (cx) => {
      let spokes = '', lugs = '';
      for (let i = 0; i < 5; i++) for (const d of [-10, 10]) {
        spokes += `<path d="M-3.2 -11 L-4.4 -30 Q0 -32 4.4 -30 L3.2 -11 Z" fill="url(#spokeG)" transform="rotate(${i * 72 + d})"/>
          <path d="M-1.4 -13 L-2 -29" stroke="#8d96b0" stroke-opacity=".55" stroke-width=".8" transform="rotate(${i * 72 + d})"/>`;
      }
      for (let i = 0; i < 6; i++) lugs += `<circle cx="${f(9 * Math.cos((i * 60 + 30) * Math.PI / 180))}" cy="${f(9 * Math.sin((i * 60 + 30) * Math.PI / 180))}" r="1.7" fill="#5b627c" stroke="#10131d" stroke-width=".5"/>`;
      return `<g transform="translate(${cx} -55.5)">
        <g class="wheel-spin">
          <circle r="55.5" fill="url(#tireG)"/>
          <circle r="51.5" fill="none" stroke="#262a3a" stroke-width="8" stroke-dasharray="7.2 3.5"/>
          <circle r="55" fill="none" stroke="#07080d" stroke-width="1.6"/>
          <circle r="46" fill="none" stroke="#1d2130" stroke-width="1.6"/>
          <circle r="43" fill="none" stroke="#2e3348" stroke-width="2" stroke-dasharray="1.4 2.6" opacity=".8"/>
          <circle r="34" fill="#0c0e17"/>
          <circle r="33" fill="none" stroke="#7d86a2" stroke-width="1.6" opacity=".7"/>
          <circle r="31" fill="url(#rimG)"/>
          <circle r="23" fill="#0a0c14" opacity=".55"/>
          ${spokes}
          <circle r="13" fill="url(#rimG)" stroke="#0a0c14" stroke-width="1"/>
          ${lugs}
          <circle r="6.2" fill="#0f1a33" stroke="#e8803f" stroke-width="1.4"/>
          <path d="M-3.2 -2.8 L0 0 L-3.2 2.8 M0 -2.8 L3.2 0 L0 2.8" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        </g>
        <path d="M-52 -16 A55 55 0 0 1 12 -54" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2.4"/>
        <path d="M36 -42 A55 55 0 0 1 55 -8" fill="none" stroke="#ffb27a" stroke-opacity=".5" stroke-width="2.6"/>
        <path d="M-30 -9 A31 31 0 0 1 8 -30" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1.2"/>
      </g>`;
    };
    put('wheels', wheel(145) + wheel(614));
  })();

'''
a = s.index('  /* ---------- truck: wheels (black alloys')
b = s.index('  /* ---------- drifting dust motes in the low sun ---------- */')
s = s[:a] + WHEELS + s[b:]

# ---------------------------------------------------------------- timeline
JS = r'''
<script>
/* ==========================================================================
   Splash timeline. The truck drives in behind a chevron-shaped wipe, brakes,
   and parks exactly where the hero frame has it. Wheel angle comes from the
   distance travelled, so it slows with the truck (and will reverse when the
   scroll-driven ride runs backwards).
   ========================================================================== */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('splash-on')) return;
  const $ = (id) => document.getElementById(id);
  const splash = $('splash'), ride = $('ride'), fg = $('fg'), skip = $('splashSkip');
  const lines = [$('wc0'), $('wc1'), $('wc2')];
  const spinners = Array.from(document.querySelectorAll('.wheel-spin'));
  const T_WIPE = 1650, DUR = 1700, OFF = 900, WHEEL_R = 48.84;
  const outCubic = (t) => 1 - Math.pow(1 - t, 3);
  const smooth = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };
  const n = (v) => Math.round(v * 10) / 10;
  let raf = 0, t0 = 0, finished = false;

  const render = (t) => {
    const W = innerWidth, H = innerHeight;
    const rc = fg.getBoundingClientRect(), sc = rc.width / 1100;
    const noseParked = rc.left + (102 + 722 * .88) * sc;
    const tip = Math.min(W * .16, 240);
    const u = Math.min(1, Math.max(0, (t - T_WIPE) / DUR));
    const p = outCubic(u);
    const off = -OFF * (1 - p);
    ride.style.transform = 'translateX(' + n(off) + 'px)';
    const deg = (p * OFF / WHEEL_R * 57.2958) % 360;
    spinners.forEach((g) => g.setAttribute('transform', 'rotate(' + n(deg) + ')'));

    /* the wipe edge rides just ahead of the nose, then runs off to the right as the truck brakes */
    const nose = noseParked + off * sc;
    const tipX = nose + 130 + (W + tip * 2) * Math.pow(smooth(.42, 1, u), 1.4);
    const X = tipX - tip, mid = H / 2;
    splash.style.clipPath = 'polygon(' + n(X) + 'px 0,' + W * 2 + 'px 0,' + W * 2 + 'px ' + H + 'px,' + n(X) + 'px ' + H + 'px,' + n(tipX) + 'px ' + n(mid) + 'px)';
    lines.forEach((ln, k) => { const d = k * 30; ln.setAttribute('points', n(X - d) + ',0 ' + n(tipX - d) + ',' + n(mid) + ' ' + n(X - d) + ',' + H); });
    $('wipe').setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    root.classList.toggle('hero-in', u > .38);
  };

  const finish = () => {
    if (finished) return; finished = true;
    cancelAnimationFrame(raf);
    root.classList.add('hero-in', 'splash-over');
    ride.style.transform = '';
    spinners.forEach((g) => g.removeAttribute('transform'));
    splash.style.clipPath = '';
    try { sessionStorage.setItem('swiftIntro', '1'); } catch (e) {}
  };

  const loop = () => {
    const t = performance.now() - t0;
    render(t);
    if (t >= T_WIPE + DUR + 40) finish(); else raf = requestAnimationFrame(loop);
  };
  const begin = () => { if (finished) return; splash.classList.add('play'); t0 = performance.now(); render(0); raf = requestAnimationFrame(loop); };

  skip.addEventListener('click', finish);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });
  setTimeout(finish, 9000);
  render(0);

  /* test hook: ?splash&hold stops auto-play, then __splashSeek(ms) scrubs to any moment */
  window.__splashSeek = (ms) => {
    cancelAnimationFrame(raf);
    splash.classList.add('play');
    splash.getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = ms; });
    render(ms);
  };
  if (location.search.indexOf('hold') > -1) return;
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1400))]).then(begin);
})();
</script>
'''
sub('\n</body>', JS + '\n</body>')

open(P, 'w', encoding='utf-8').write(s)
print('splash patched', len(s))
