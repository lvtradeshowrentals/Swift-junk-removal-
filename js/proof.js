/* ============================================================================
   Proof: a before/after slider. The art is a placeholder: one garage drawn twice,
   packed and then cleared with the Swift truck waiting outside. Real photos can
   replace either layer's <svg> without touching the slider.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$, f = SW.f, clamp = SW.clamp;
  const W = 1000, H = 560;

  function garage(after) {
    const r = SW.mk(14);
    let s = `<defs>
      <linearGradient id="pfWall${after ? 'A' : 'B'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3446"/><stop offset="1" stop-color="#5a5063"/></linearGradient>
      <linearGradient id="pfFloor${after ? 'A' : 'B'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c2b6"/><stop offset="1" stop-color="#a59e93"/></linearGradient>
      <radialGradient id="pfBulb${after ? 'A' : 'B'}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff2c6" stop-opacity=".9"/><stop offset="1" stop-color="#ffd48a" stop-opacity="0"/></radialGradient>
    </defs>`;
    s += `<rect width="${W}" height="${H}" fill="url(#pfWall${after ? 'A' : 'B'})"/>`;
    /* the opening: daylight, hills, driveway, a palm */
    s += `<rect x="270" y="96" width="460" height="282" fill="url(#svSky)"/>`;
    s += `<path d="M270 300 L330 262 L392 290 L470 238 L548 286 L620 258 L690 292 L730 276 V330 H270Z" fill="url(#svFar)"/>`;
    s += `<path d="M270 326 Q400 296 520 322 T730 312 V380 H270Z" fill="url(#svNear)"/>`;
    s += `<rect x="270" y="338" width="460" height="42" fill="#e6dfd2"/><path d="M270 338 H730" stroke="#c9c1b0" stroke-width="2"/>`;
    s += `<path d="M676 340 Q690 280 684 226 L690 226 Q702 284 688 340Z" fill="#9b7a62"/>`;
    for (let i = 0; i < 8; i++) { const a = (-170 + i * 22) * Math.PI / 180; s += `<path d="M688 226 Q${f(688 + Math.cos(a) * 24)} ${f(226 + Math.sin(a) * 24 - 8)} ${f(688 + Math.cos(a) * 48)} ${f(226 + Math.sin(a) * 48 + 10)}" stroke="${i % 2 ? '#4d8f62' : '#3b7a52'}" stroke-width="6" stroke-linecap="round" fill="none"/>`; }
    if (after) s += `<g transform="translate(404 340) scale(.36)">${SW.truck.markup().replace('<g id="bedItems"></g>', '').replace(/ id="[^"]*"/g, '')}</g>`;
    /* frame, header and the rolled-up door */
    s += `<rect x="256" y="84" width="488" height="14" fill="#2a2433"/><rect x="262" y="96" width="14" height="284" fill="#2a2433"/><rect x="724" y="96" width="14" height="284" fill="#2a2433"/>`;
    s += `<rect x="256" y="48" width="488" height="38" fill="#e9e3d6"/><path d="M256 62 H744 M256 74 H744" stroke="#cfc7b6" stroke-width="2"/>`;
    /* floor with perspective and the light that falls through the door */
    s += `<rect y="378" width="${W}" height="${H - 378}" fill="url(#pfFloor${after ? 'A' : 'B'})"/>`;
    for (let x = -600; x <= 1600; x += 130) s += `<path d="M${500 + (x - 500) * .16} 378 L${x} ${H}" stroke="#8f887d" stroke-opacity=".35" stroke-width="2"/>`;
    s += `<path d="M262 378 H738 L880 ${H} H120Z" fill="#fff" opacity="${after ? .3 : .17}"/>`;
    /* shelving on both side walls */
    const shelf = (x0, filled) => {
      let o = `<rect x="${x0}" y="118" width="8" height="262" fill="#6e5a46"/><rect x="${x0 + 196}" y="118" width="8" height="262" fill="#6e5a46"/>`;
      [196, 274, 352].forEach((y, i) => {
        o += `<rect x="${x0}" y="${y}" width="204" height="9" fill="#c79a62"/><rect x="${x0}" y="${y + 9}" width="204" height="4" fill="#1b1424" opacity=".35"/>`;
        const n = filled ? 3 : (i === 1 ? 1 : 0);
        for (let k = 0; k < n; k++) o += `<g transform="translate(${x0 + 40 + k * 62 + (r() * 8) | 0} ${y}) scale(${(.62 + r() * .18).toFixed(2)})"><use href="#it-box"/></g>`;
        if (filled && i === 0) o += `<g transform="translate(${x0 + 168} ${y}) scale(.7)"><use href="#it-bucket"/></g>`;
      });
      return o;
    };
    s += shelf(26, !after) + shelf(770, !after);
    /* work light */
    s += `<path d="M500 0 V34" stroke="#1b1424" stroke-width="3"/><circle cx="500" cy="40" r="60" fill="url(#pfBulb${after ? 'A' : 'B'})"/><circle cx="500" cy="40" r="9" fill="#fff6d2"/>`;
    /* the floor: packed, or swept */
    if (!after) {
      const items = [['fridge', 96, 470, 1.25, 0], ['couch', 196, 548, 1.5, 0], ['mattress', 200, 440, 1.55, -4], ['boxStack', 322, 516, 1.3, 0], ['bags', 392, 548, 1.5, 0], ['tv', 470, 554, 1.4, 0],
        ['bucket', 560, 540, 1.3, 0], ['bike', 668, 546, 1.4, 0], ['boxStack', 790, 504, 1.2, 0], ['armchair', 880, 552, 1.5, 0], ['lumber', 840, 470, 1.2, -3], ['lamp', 960, 520, 1.35, 0], ['box', 748, 540, 1.3, 0]];
      items.sort((a, b) => a[2] - b[2]);
      items.forEach((it) => { s += `<ellipse cx="${it[1]}" cy="${it[2] + 2}" rx="${f(SW.ITEM_DIM[it[0]].w * it[3] * .42)}" ry="7" fill="#1b1424" opacity=".28"/>`; });
      items.forEach((it) => { s += `<g transform="translate(${it[1]} ${it[2]}) rotate(${it[4]}) scale(${it[3]})"><use href="#it-${it[0]}"/></g>`; });
    } else {
      /* broom sweeps and a few glints */
      for (let i = 0; i < 6; i++) s += `<path d="M${180 + i * 120} ${430 + (i % 2) * 40} q50 -10 100 0" stroke="#fff" stroke-opacity=".22" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      [[330, 470], [610, 500], [450, 530], [720, 450], [220, 520]].forEach(([x, y], i) => { s += `<path d="M${x} ${y - 11} Q${x} ${y} ${x + 11} ${y} Q${x} ${y} ${x} ${y + 11} Q${x} ${y} ${x - 11} ${y} Q${x} ${y} ${x} ${y - 11}Z" fill="#fff" opacity=".85"/>`; });
    }
    return s;
  }

  SW.proof = {
    init() {
      const ba = $('ba');
      if (!ba) return;
      $('baBefore').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${garage(false)}</svg>`;
      $('baAfter').innerHTML = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${garage(true)}</svg>`;
      const grip = $('baGrip'), reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      let p = 50, touched = false, drag = false;
      const set = (v) => {
        p = clamp(v, 0, 100);
        ba.style.setProperty('--p', p.toFixed(2));
        grip.setAttribute('aria-valuenow', Math.round(p));
        ba.classList.toggle('lo', p < 14); ba.classList.toggle('hi', p > 86);
      };
      const fromEvent = (e) => { const r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); };
      ba.addEventListener('pointerdown', (e) => { drag = true; touched = true; ba.classList.add('touched'); ba.setPointerCapture(e.pointerId); fromEvent(e); });
      ba.addEventListener('pointermove', (e) => { if (drag) fromEvent(e); });
      ['pointerup', 'pointercancel'].forEach((ev) => ba.addEventListener(ev, () => { drag = false; }));
      grip.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowLeft' ? -5 : e.key === 'ArrowRight' ? 5 : 0;
        if (d) { e.preventDefault(); touched = true; ba.classList.add('touched'); set(p + d); }
        else if (e.key === 'Home') { e.preventDefault(); set(0); } else if (e.key === 'End') { e.preventDefault(); set(100); }
      });
      set(50);
      /* one slow sweep when it first scrolls into view, so the control explains itself */
      if (reduce || !('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        const t0 = performance.now(), D = 3200, keys = [[0, 50], [.3, 82], [.7, 22], [1, 50]];
        const step = (now) => {
          if (touched) return;
          const t = clamp((now - t0 - 500) / D, 0, 1);
          let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
          const a = keys[i], b = keys[i + 1], u = clamp((t - a[0]) / (b[0] - a[0]), 0, 1), e = u * u * (3 - 2 * u);
          set(a[1] + (b[1] - a[1]) * e);
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }, { threshold: .5 });
      io.observe(ba);
    },
  };
})(window.SW);
