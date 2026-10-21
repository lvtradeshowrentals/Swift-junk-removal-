/* ============================================================================
   What we remove: a deck of five tall job cards. It scrolls sideways on its own
   track (native swipe and snap, never the page), and as cards slide through the
   centre they lean, scale and light up, the scene inside each moves at its own
   depth, and a card's pile drops into place the first time it comes into focus.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$, clamp = SW.clamp;

  SW.services = {
    init() {
      const track = $('dkTrack');
      if (!track || !SW.scenes) return;
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      $('spriteDefs').insertAdjacentHTML('beforeend', SW.scenes.defs());
      const cards = Array.from(track.querySelectorAll('.dk-card'));
      const dots = Array.from($('dkDots').querySelectorAll('button'));
      /* a real photo (img/<job>.jpg, or embedded by the build) replaces the illustrated scene when there is one */
      const sceneOf = (key) => '<div class="scene on"><svg viewBox="0 0 800 680" preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true">' + SW.scenes.build[key]() + '</svg></div>';
      const arts = cards.map((c) => {
        const art = c.querySelector('.dk-art'), key = c.getAttribute('data-key'), alt = (c.querySelector('h3') || {}).textContent || '';
        const embedded = window.SW_PHOTOS && window.SW_PHOTOS[key];
        const img = new Image();
        img.alt = alt; img.decoding = 'async'; img.draggable = false;
        img.onload = () => { art.classList.add('photo'); };
        img.onerror = () => { art.innerHTML = sceneOf(key); arts[cards.indexOf(c)] = art.firstChild; };
        art.innerHTML = '<div class="scene on"></div>'; art.firstChild.appendChild(img);
        img.src = embedded || 'img/' + key + '.jpg';
        return art.firstChild;
      });

      let cur = -1, raf = 0, drag = null;
      /* each card's resting scroll position. On phones every card can reach the centre; on a wide
         screen the deck ends flush with the content edge, so the stops are spread evenly over the
         scroll range and the last card is in focus when the deck is scrolled to its end */
      const stops = () => {
        const pl = cards[0].offsetLeft, nat = cards.map((c) => c.offsetLeft - pl), max = track.scrollWidth - track.clientWidth;
        const k = nat[nat.length - 1] > max + 2 ? max / nat[nat.length - 1] : 1;
        return nat.map((v) => v * k);
      };
      /* where the deck is, as a card index with a fraction */
      const pos = () => {
        const s = stops(), x = track.scrollLeft;
        if (x <= s[0]) return 0;
        for (let i = 1; i < s.length; i++) if (x <= s[i]) return i - 1 + (x - s[i - 1]) / Math.max(1, s[i] - s[i - 1]);
        return s.length - 1;
      };
      function measure() {
        const f = pos(), best = clamp(Math.round(f), 0, cards.length - 1);
        cards.forEach((card, i) => {
          const dd = clamp(i - f, -2, 2);
          card.style.setProperty('--d', dd.toFixed(3));
          card.style.setProperty('--ad', Math.abs(dd).toFixed(3));
        });
        if (best !== cur) {
          cur = best;
          cards.forEach((card, i) => { card.classList.toggle('on', i === cur); card.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
          dots.forEach((b, i) => { b.classList.toggle('on', i === cur); b.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
          /* the pile drops in the first time a card comes into focus */
          if (!arts[cur].classList.contains('pop')) { arts[cur].style.setProperty('--wd', '.12s'); arts[cur].classList.add('pop'); }
          $('dkPrev').disabled = cur === 0; $('dkNext').disabled = cur === cards.length - 1;
        }
      }
      const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; measure(); }); };
      track.addEventListener('scroll', queue, { passive: true });
      window.addEventListener('resize', queue);

      const go = (i) => {
        i = clamp(i, 0, cards.length - 1);
        track.scrollTo({ left: stops()[i], behavior: reduce ? 'auto' : 'smooth' });
      };
      /* wide screens have no CSS snap: once a trackpad swipe settles, ease to the nearest card */
      let settle = 0;
      track.addEventListener('scroll', () => {
        clearTimeout(settle);
        if (drag || getComputedStyle(track).scrollSnapType.indexOf('mandatory') > -1) return;
        settle = setTimeout(() => { const f = pos(); if (Math.abs(f - Math.round(f)) > .02) go(Math.round(f)); }, 160);
      }, { passive: true });
      $('dkPrev').addEventListener('click', () => go(cur - 1));
      $('dkNext').addEventListener('click', () => go(cur + 1));
      dots.forEach((b, i) => b.addEventListener('click', () => go(i)));
      cards.forEach((c, i) => c.addEventListener('click', (e) => { if (i !== cur && !e.target.closest('a')) { e.preventDefault(); go(i); } }));
      track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });

      /* a mouse can drag the deck too (touch and trackpads already swipe natively) */
      track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a,button')) return; drag = { x: e.clientX, l: track.scrollLeft, moved: false }; track.classList.add('grabbing'); });
      window.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; track.scrollLeft = drag.l - dx; });
      window.addEventListener('pointerup', () => {
        if (!drag) return; track.classList.remove('grabbing');
        const moved = drag.moved; drag = null;
        if (moved) go(Math.round(pos()));
      });

      /* start on the first card, centred */
      requestAnimationFrame(() => { track.scrollLeft = 0; measure(); });
      if ('IntersectionObserver' in window && !reduce) {
        const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); arts[0].classList.remove('pop'); void arts[0].offsetWidth; arts[0].classList.add('pop'); } }), { threshold: .35 });
        io.observe(track);
      }
    },
  };
})(window.SW);
