/* FAQ: one question open at a time, and four filters that hide the rest. */
(function (SW) {
  'use strict';
  const $ = SW.$;
  SW.faq = {
    init() {
      const list = $('faqList');
      if (!list) return;
      const items = Array.from(list.querySelectorAll('.qa'));
      const filters = Array.from(document.querySelectorAll('.faq-filter button'));
      const open = (item, on) => { item.classList.toggle('on', on); item.querySelector('button').setAttribute('aria-expanded', on ? 'true' : 'false'); };
      items.forEach((it) => it.querySelector('button').addEventListener('click', () => {
        const on = !it.classList.contains('on');
        items.forEach((o) => { if (o !== it) open(o, false); });
        open(it, on);
      }));
      filters.forEach((b) => b.addEventListener('click', () => {
        const f = b.getAttribute('data-f');
        filters.forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        let first = null;
        items.forEach((it) => { const show = f === 'all' || it.getAttribute('data-c') === f; it.hidden = !show; if (show && !first) first = it; });
        /* keep one answer open so the list never looks empty */
        if (first && !items.some((it) => !it.hidden && it.classList.contains('on'))) { items.forEach((o) => open(o, false)); open(first, true); }
      }));
    },
  };
})(window.SW);
