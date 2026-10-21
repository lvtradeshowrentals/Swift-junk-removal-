/* ============================================================================
   Splash: the white lock-up builds, then the truck drives in behind a chevron-shaped
   wipe and parks on the hero frame. The hero holds back until the truck is in.
   Plays once per session. ?nosplash skips, ?splash replays, ?splash&hold scrubs.
   ========================================================================== */
(function (SW) {
  'use strict';
  const root = document.documentElement;
  SW.splash = { active: root.classList.contains('splash-on') };
  if (!SW.splash.active) return;

  const $ = SW.$;
  const T_WIPE = 2000, DUR = 1700;   /* the lock-up is fully built at ~1.9 s; the wipe starts right after */
  const outCubic = SW.easeOut, smooth = SW.smooth;
  const n = (v) => Math.round(v * 10) / 10;
  let raf = 0, t0 = 0, finished = false, ready = false;

  function render(t) {
    const L = SW.layout;
    if (!L) return;
    const W = innerWidth, H = innerHeight;
    const splash = $('splash'), truck = $('truck'), lines = [$('wc0'), $('wc1'), $('wc2')];
    const tip = Math.min(W * .16, 240);
    const u = SW.clamp((t - T_WIPE) / DUR, 0, 1), p = outCubic(u);
    /* start far enough left that white covers the screen until the wipe begins, at any width */
    const noseScreen = L.noseScreen;
    const OFF = Math.max(900 * L.ts * .88, noseScreen + 130 + tip + 80) / L.k;
    const off = -OFF * (1 - p);
    SW.splash.truckOffset = off;
    if (SW.ride && SW.ride.setSplashOffset) SW.ride.setSplashOffset(off, p);
    const nose = noseScreen + off * L.k;
    const tipX = nose + 130 + (W + tip * 2) * Math.pow(smooth(.42, 1, u), 1.4);
    const X = tipX - tip, mid = H / 2;
    splash.style.clipPath = 'polygon(' + n(X) + 'px 0,' + W * 2 + 'px 0,' + W * 2 + 'px ' + H + 'px,' + n(X) + 'px ' + H + 'px,' + n(tipX) + 'px ' + n(mid) + 'px)';
    lines.forEach((ln, k) => { const d = k * 30; ln.setAttribute('points', n(X - d) + ',0 ' + n(tipX - d) + ',' + n(mid) + ' ' + n(X - d) + ',' + H); });
    $('wipe').setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    root.classList.toggle('hero-in', u > .38);
    void truck;
  }

  function finish() {
    if (finished) return; finished = true;
    cancelAnimationFrame(raf);
    root.classList.add('hero-in', 'splash-over');
    $('splash').style.clipPath = '';
    SW.splash.truckOffset = 0;
    if (SW.ride && SW.ride.setSplashOffset) SW.ride.setSplashOffset(0, 1);
    try { sessionStorage.setItem('swiftIntro', '1'); } catch (e) {}
    SW.splash.active = false;
  }

  function loop() {
    const t = performance.now() - t0;
    render(t);
    if (t >= T_WIPE + DUR + 40) finish(); else raf = requestAnimationFrame(loop);
  }
  function begin() {
    if (finished || ready) return; ready = true;
    $('splash').classList.add('play'); t0 = performance.now(); render(0); raf = requestAnimationFrame(loop);
  }

  SW.splash.start = function () {
    $('splashSkip').addEventListener('click', finish);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') finish(); });
    setTimeout(finish, 9000);
    render(0);
    window.__splashSeek = (ms) => {
      cancelAnimationFrame(raf);
      $('splash').classList.add('play');
      $('splash').getAnimations({ subtree: true }).forEach((a) => { a.pause(); a.currentTime = ms; });
      render(ms);
    };
    if (location.search.indexOf('hold') > -1) return;
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1400))]).then(begin);
  };
  SW.splash.relayout = () => { if (!finished) render(performance.now() - t0); };
})(window.SW);
