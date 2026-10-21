/* ============================================================================
   Page glue: boot order, quote-form behaviour, and pre-selecting the service
   from whichever "Get a quote" button was used.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$;

  function boot() {
    const t0 = performance.now();
    SW.ride.init();
    SW.bootMs = Math.round(performance.now() - t0);
    if (SW.splash && SW.splash.active) SW.splash.start();
    SW.quote.init();
    SW.services.init();
    SW.how.init();
    SW.proof.init();
    SW.faq.init();
    SW.finale.init();
    SW.ui.init();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.SW);
