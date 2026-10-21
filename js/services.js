/* ============================================================================
   Services showroom: five illustrated jobs in a pinned stage. Scrolling opens the
   categories one after another (the one above collapses as the next opens) and
   scrolling back up reverses it. Clicking a category scrolls to its position.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$;
  const KEYS = ['garage', 'furniture', 'construction', 'commercial', 'estate'];

  SW.services = {
    init() {
      const stage = $('svcStage');
      if (!stage || !SW.scenes) return;
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      $('spriteDefs').insertAdjacentHTML('beforeend', SW.scenes.defs());

      const scenesEl = $('svcScenes'), pinsEl = $('svcPins'), tag = $('svcTag'), list = $('svcList');
      const rows = Array.from(list.querySelectorAll('.svc'));
      const tabs = rows.map((r) => r.querySelector('.svc-tab'));
      const titles = tabs.map((t) => t.querySelector('span').textContent);
      const scenes = KEYS.map((k) => {
        const d = document.createElement('div');
        d.className = 'scene';
        d.innerHTML = '<svg viewBox="0 0 800 680" preserveAspectRatio="xMidYMid slice" focusable="false" aria-hidden="true">' + SW.scenes.build[k]() + '</svg>';
        scenesEl.appendChild(d);
        return d;
      });

      let cur = 0, started = false, pending = null, rz = 0;
      const track = $('svcTrack'), N = KEYS.length, STEP = .5;       /* each category gets half a screen of scroll */
      let pinned = !reduce && window.matchMedia && !matchMedia('(max-height: 440px)').matches;

      function setPins(i, delay) {
        pinsEl.innerHTML = SW.scenes.pins[KEYS[i]].map((p, n) =>
          `<div class="pin" style="--px:${(p[1] / 8).toFixed(2)};--py:${(p[2] / 6.8).toFixed(2)};--stem:${p[3]};--pd:${(delay + n * .09).toFixed(2)}s"><i></i><span class="pin-stem"></span><span class="pin-label" style="--tx:${p[4] === 'l' ? '-14px' : p[4] === 'r' ? 'calc(-100% + 14px)' : '-50%'}">${p[0]}</span></div>`).join('');
        spread();
      }
      /* labels must never sit on top of each other or run off the picture: raise a label's stem until its box is clear of every one placed before it, and nudge it back inside the frame */
      function spread() {
        const run = () => {
          const fr = stage.getBoundingClientRect(), H = fr.height || 1, k = 680 / H, placed = [];
          Array.from(pinsEl.querySelectorAll('.pin')).forEach((pin) => {
            const lab = pin.querySelector('.pin-label');
            let stem = +pin.style.getPropertyValue('--stem') || 40, sx = 0;
            for (let t = 0; t < 8; t++) {
              pin.style.setProperty('--stem', stem); lab.style.setProperty('--sx', sx + 'px');
              const r = lab.getBoundingClientRect();
              if (r.left < fr.left + 8) { sx += fr.left + 8 - r.left; continue; }
              if (r.right > fr.right - 8) { sx -= r.right - (fr.right - 8); continue; }
              const hit = placed.find((q) => r.left < q.right + 5 && r.right > q.left - 5 && r.top < q.bottom + 4 && r.bottom > q.top - 4);
              if (!hit) break;
              stem += (r.bottom - hit.top + 6) * k;
            }
            placed.push(lab.getBoundingClientRect());
          });
        };
        requestAnimationFrame(() => requestAnimationFrame(run));
      }
      function rowState(i) {
        rows.forEach((r, j) => { r.classList.toggle('on', j === i); tabs[j].setAttribute('aria-expanded', j === i ? 'true' : 'false'); });
        tag.textContent = titles[i];
      }
      /* settle whatever wipe is in flight so a fast scroll never leaves two scenes half-shown */
      function settle() {
        if (!pending) return;
        const p = pending; pending = null;
        scenes.forEach((s, j) => { s.classList.toggle('on', j === p); s.classList.remove('in'); });
        stage.classList.remove('wiping');
      }
      function show(i, instant) {
        if (i === cur && started) return;
        settle();
        cur = i;
        rowState(i);
        const next = scenes[i];
        if (!started || instant || reduce) {
          started = true;
          scenes.forEach((s, j) => { s.classList.toggle('on', j === i); s.classList.remove('in', 'pop'); });
          next.style.setProperty('--wd', '.15s'); void next.offsetWidth; next.classList.add('pop');
          setPins(i, .5); return;
        }
        next.classList.remove('pop'); next.style.setProperty('--wd', '.5s');
        next.classList.add('in');
        pending = i;
        pinsEl.innerHTML = '';
        stage.classList.remove('wiping'); void stage.offsetWidth; stage.classList.add('wiping');
        const done = (e) => {
          if (e && e.animationName !== 'svcWipe') return;
          stage.removeEventListener('animationend', done);
          if (pending !== i) return;
          pending = null;
          scenes.forEach((s, j) => { s.classList.toggle('on', j === i); if (j !== i) s.classList.remove('pop'); s.classList.remove('in'); });
          stage.classList.remove('wiping');
        };
        stage.addEventListener('animationend', done);
        next.classList.add('pop');
        setPins(i, 1.05);
      }

      /* scroll drives it: the pinned showroom opens category 1, then 2 (closing 1), and so on; scrolling up reverses it */
      function layout() {
        if (!pinned) { track.style.height = ''; track.classList.remove('is-pinned'); return; }
        track.classList.add('is-pinned');
        track.style.height = `calc(100svh + ${(N - 1) * STEP * 100}svh)`;
      }
      function onScroll() {
        if (!pinned || !started) return;
        const r = track.getBoundingClientRect(), span = (N - 1) * STEP * innerHeight, p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
        const i = Math.min(N - 1, Math.round(p * (N - 1) + 1e-6));
        if (i !== cur) show(i);
      }
      let q = false;
      const queue = () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; onScroll(); }); } };

      tabs.forEach((t, i) => {
        t.addEventListener('click', () => {
          if (pinned) {
            /* jump to the scroll position that opens this category */
            const r = track.getBoundingClientRect(), span = (N - 1) * STEP * innerHeight;
            const y = window.pageYOffset + r.top + (i / (N - 1)) * span + 2 - (i === 0 ? 0 : 0);
            window.scrollTo({ top: i === 0 ? Math.max(0, window.pageYOffset + r.top) : y, behavior: 'smooth' });
          } else {
            if (i !== cur) show(i);
            const r = stage.getBoundingClientRect();
            if (innerWidth <= 900 && (r.top < 70 || r.bottom > innerHeight)) window.scrollTo({ top: window.pageYOffset + r.top - 84, behavior: 'smooth' });
          }
        });
        t.addEventListener('keydown', (e) => {
          const d = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
          if (d) { e.preventDefault(); tabs[(i + d + tabs.length) % tabs.length].focus(); }
        });
      });
      layout();
      window.addEventListener('resize', () => { layout(); queue(); if (pinsEl.firstChild) { clearTimeout(rz); rz = setTimeout(() => setPins(cur, 0), 150); } });
      window.addEventListener('scroll', queue, { passive: true });

      /* nothing plays until the showroom is on screen, so the first pile drops in front of the visitor */
      rowState(0);
      scenes[0].classList.add('on');
      if (!('IntersectionObserver' in window) || reduce) { started = true; scenes[0].classList.add('pop'); setPins(0, 0); return; }
      new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting && !started) { show(0, true); onScroll(); } });
      }, { threshold: .2 }).observe(stage);
    },
  };
})(window.SW);
