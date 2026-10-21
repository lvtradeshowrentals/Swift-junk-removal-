/* ============================================================================
   Shared page behaviour for everything below the ride: reveal-on-scroll, the nav
   switching between night and day sheets, and the service-area lookup used by
   both the quote form and the areas map.
   ========================================================================== */
(function (SW) {
  'use strict';

  /* ZIP -> which part of the valley it is. Placeholder coverage until the real service area is confirmed. */
  const HENDERSON = ['89002', '89011', '89012', '89014', '89015', '89044', '89052', '89053', '89074'];
  const NORTH_LV = ['89030', '89031', '89032', '89081', '89084', '89085', '89086', '89087'];
  SW.zone = function (raw) {
    const zip = String(raw || '').trim().slice(0, 5);
    if (!/^\d{5}$/.test(zip)) return null;
    if (HENDERSON.indexOf(zip) > -1) return { zip, city: 'Henderson', level: 'ok' };
    if (NORTH_LV.indexOf(zip) > -1) return { zip, city: 'North Las Vegas', level: 'near' };
    const n = +zip;
    if (n >= 89101 && n <= 89199) return { zip, city: 'Las Vegas', level: 'ok' };
    return { zip, city: '', level: 'out' };
  };

  SW.ui = {};
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* elements marked data-reveal (and the printed work order) arm only once JS is running, so with no JS they simply show */
  function initReveal() {
    if (!('IntersectionObserver' in window) || reduce()) return;
    const els = Array.from(document.querySelectorAll('[data-reveal], .wo-wrap'));
    document.documentElement.classList.add('anim');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add('in'); io.unobserve(e.target);
          const shell = e.target.querySelector && e.target.querySelector('.wo-shell'); if (shell) shell.classList.add('in');   /* the shell is clipped until it prints, so its wrapper is what gets observed */
        }
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* the fixed nav turns light while it sits over a day sheet */
  function initNavTone() {
    const nav = document.querySelector('.nav');
    const sheets = Array.from(document.querySelectorAll('[data-tone]'));
    if (!nav || !sheets.length) return;
    let queued = false;
    const check = () => {
      queued = false;
      const y = nav.offsetHeight * .5;
      let light = false;
      for (const s of sheets) { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { light = s.getAttribute('data-tone') === 'day'; break; } }
      nav.classList.toggle('light', light);
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    check();
  }

  SW.ui.init = function () { initReveal(); initNavTone(); };
})(window.SW);
