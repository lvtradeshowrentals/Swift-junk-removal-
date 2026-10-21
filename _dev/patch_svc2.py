import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf8').read()
def wr(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf8').write(s)

# ============ services.js ============
s = rd('js/services.js')
def rep(a, b):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b, 1)

# scroll-driven changes use a quiet crossfade (no chevron sweep, no items dropping again); clicks keep the wipe
rep("      function show(i, instant) {\n        if (i === cur && started) return;\n        settle();\n        cur = i;",
    """      let softT = 0;
      function soft(i) {
        settle(); clearTimeout(softT);
        const prev = cur; cur = i; rowState(i);
        const next = scenes[i];
        next.classList.add('on', 'soft', 'pop', 'fadein');
        pinsEl.innerHTML = ''; setPins(i, .02);
        softT = setTimeout(() => { scenes.forEach((s2, j) => { if (j !== cur) s2.classList.remove('on', 'pop', 'soft', 'fadein'); }); scenes[cur].classList.remove('fadein'); }, 380);
        void prev;
      }
      function show(i, instant, quiet) {
        if (i === cur && started) return;
        if (quiet && started && !reduce) { soft(i); return; }
        settle();
        cur = i;""")
rep("        const i = Math.min(N - 1, Math.round(p * (N - 1) + 1e-6));\n        if (i !== cur) show(i);",
    "        /* a dead band either side of each boundary stops the category flipping back and forth while the page rests on the line */\n        const f = p * (N - 1), i = Math.abs(f - cur) > .62 ? Math.min(N - 1, Math.max(0, Math.round(f))) : cur;\n        if (i !== cur) show(i, false, true);")
# stable track length: fixed pixels, only recomputed when the width changes or the height changes a lot (not for a browser bar sliding)
rep("      function layout() {\n        if (!pinned) { track.style.height = ''; track.classList.remove('is-pinned'); return; }\n        track.classList.add('is-pinned');\n        track.style.height = `calc(100svh + ${(N - 1) * STEP * 100}svh)`;\n      }",
    """      let lockW = 0, lockH = 0;
      function layout(force) {
        if (!pinned) { track.style.height = ''; track.classList.remove('is-pinned'); return; }
        const w = innerWidth, h = innerHeight;
        if (!force && lockW === w && Math.abs(h - lockH) < 160) return;
        lockW = w; lockH = h;
        track.classList.add('is-pinned');
        track.style.height = Math.round(h + (N - 1) * STEP * h) + 'px';
      }""")
rep("        const r = track.getBoundingClientRect(), span = (N - 1) * STEP * innerHeight, p =","        const r = track.getBoundingClientRect(), span = (N - 1) * STEP * lockH, p =")
rep("      layout();\n      window.addEventListener('resize', () => { layout(); queue(); if (pinsEl.firstChild) { clearTimeout(rz); rz = setTimeout(() => setPins(cur, 0), 150); } });",
    "      layout(true);\n      window.addEventListener('resize', () => { layout(); queue(); });")
rep("            const r = track.getBoundingClientRect(), span = (N - 1) * STEP * innerHeight;","            const r = track.getBoundingClientRect(), span = (N - 1) * STEP * lockH;")
wr('js/services.js', s)

# ============ css ============
c = rd('css/sections.css')
c = c.replace(".scene { position: absolute; inset: 0; visibility: hidden; }", ".scene { position: absolute; inset: 0; display: none; }")
c = c.replace(".scene.on { visibility: visible; }", ".scene.on { display: block; }\n.scene.fadein { z-index: 2; animation: sceneFade .34s ease both; }\n@keyframes sceneFade { from { opacity: 0; } to { opacity: 1; } }\n/* a scroll-driven change shows the finished scene: nothing drops in again */\n.scene.soft .it-pop, .scene.soft .it-sh { animation: none !important; opacity: 1 !important; }")
c = c.replace(".scene.in { visibility: visible; z-index: 2;", ".scene.in { display: block; z-index: 2;")
wr('css/sections.css', c)

# ============ ride.js: don't rebuild the hero for a browser bar; stop painting it once it is far off screen ============
s = rd('js/ride.js')
def rep2(a, b):
    global s
    assert a in s, a[:90]
    s = s.replace(a, b, 1)
rep2("        if (Math.abs(innerWidth - lw) < 2 && Math.abs(innerHeight - lh) < 140) { applyLayout(); setTrackHeight(); render(ps, 0); return; }",
     "        /* only a real change of shape (a rotation, a resized window) rebuilds the scene; a browser bar sliding in or out just re-fits it */\n        if (Math.abs(innerWidth - lw) < 2 && Math.abs(innerHeight - lh) < .3 * lh) { applyLayout(); setTrackHeight(); render(ps, 0); return; }")
rep2("    wireIntent();\n    let rt = 0,","    wireIntent();\n    /* once the hero has scrolled well away, stop painting it: its layers are the biggest thing on the page and phones reclaim the memory */\n    if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => { stage.style.visibility = e.isIntersecting ? '' : 'hidden'; }), { rootMargin: '30% 0px 30% 0px' }).observe(stage);\n    let rt = 0,")
wr('js/ride.js', s)
print('ok')
