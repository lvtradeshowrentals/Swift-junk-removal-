/* ============================================================================
   The quote section: a three-step work order, and a truck beside it that loads
   whatever you pick. Steps validate one at a time; nothing is sent until step 3.
   ========================================================================== */
(function (SW) {
  'use strict';
  const $ = SW.$;
  const SERVICES = { garage: 'Home, garage or estate', furniture: 'Furniture and appliances', construction: 'Construction debris', commercial: 'Office or property', yard: 'Yard or outdoor', general: 'Not sure yet' };
  const SHORT = { garage: 'Home or garage', furniture: 'Furniture', construction: 'Construction', commercial: 'Commercial', yard: 'Yard', general: 'To be confirmed' };
  const WHEN = { today: 'Today', tomorrow: 'Tomorrow', week: 'This week', flexible: "I'm flexible" };
  const NEXT = ['Next: where and when', 'Next: your details', 'Send my request'];
  const FINE = ['Takes about a minute. Nothing is sent until the last step.', 'We use the ZIP to pick the nearest crew.', "We'll only use your number to text or call about this job."];

  /* where each service's items sit in the truck bed. x across the bed (22..252), y is the base line (negative is up), s scale, r rotation. */
  const SLOTS = {
    garage: [['boxStack', 40, -170, .55, 0], ['bike', 98, -219, .56, -5]],
    furniture: [['couch', 104, -170, .62, 0], ['fridge', 180, -170, .6, 2]],
    construction: [['bags', 244, -170, .6, 0], ['lumber', 196, -250, .5, -4]],
    commercial: [['desk', 40, -214, .46, -3], ['chair', 142, -219, .52, 6]],
    yard: [['brush', 214, -170, .5, 0], ['bags', 244, -170, .52, 0]],
  };

  const S = { step: 1, sel: new Set(), files: [], no: '' };
  let form, card, panes, stepLis, nextBtn, backBtn, loader, loadItems, loadCap, fine;

  function orderNo() {
    const d = new Date(), p = (n) => String(n).padStart(2, '0');
    return 'SW-' + p(d.getMonth() + 1) + p(d.getDate()) + '-' + String(Math.floor(1000 + Math.random() * 9000));
  }

  /* ---------- the truck ---------- */
  function buildLoader() {
    const svg = $('loadSvg'), vb = SW.truck.VB;
    svg.setAttribute('viewBox', `${vb.x} -310 ${vb.w} 330`);
    /* this copy sits beside the ride's own truck, so its ids must go (the shared gradients and clips live in the sprite) */
    svg.innerHTML = SW.truck.markup().replace('<g id="bedItems"></g>', '<g class="ld-items"></g>').replace(/ id="[^"]*"/g, '');
    loadItems = svg.querySelector('.ld-items');
    let n = 0, html = '';
    Object.keys(SLOTS).forEach((k) => {
      html += `<g class="ld-svc" data-svc="${k}">`;
      SLOTS[k].forEach((it) => { html += `<g transform="translate(${it[1]} ${it[2]}) rotate(${it[4]}) scale(${it[3]})"><g class="ld-in" style="--i:${n++ % 2}"><use href="#it-${it[0]}"/></g></g>`; });
      html += '</g>';
    });
    loadItems.innerHTML = html;
  }
  function updateLoader() {
    loadItems.querySelectorAll('.ld-svc').forEach((g) => g.classList.toggle('ld-on', S.sel.has(g.getAttribute('data-svc'))));
    const names = Array.from(S.sel).map((k) => SHORT[k]);
    loader.classList.toggle('has', names.length > 0);
    loadCap.textContent = names.length ? 'Loading: ' + names.join(', ') : "Pick what's going and we'll load the truck.";
  }

  /* ---------- barcode ---------- */
  function buildBarcode() {
    const r = SW.mk(7);
    let h = '';
    for (let i = 0; i < 64; i++) { const w = 1 + Math.floor(r() * 4); h += `<i style="flex:${w}"></i><b style="flex:${1 + Math.floor(r() * 3)}"></b>`; }
    $('barcode').innerHTML = h;
    $('barcode').querySelectorAll('b').forEach((b) => { b.style.display = 'block'; });
  }

  /* ---------- summary ---------- */
  function setDd(el, text, empty) { el.textContent = text; el.classList.toggle('empty', !!empty); }
  function updateSummary() {
    const names = Array.from(S.sel).map((k) => SHORT[k]);
    setDd($('sumSvc'), names.length ? names.join(', ') : 'Not picked yet', !names.length);
    const z = SW.zone($('f-zip').value);
    setDd($('sumZip'), z ? z.zip + (z.city ? ' · ' + z.city : '') : 'ZIP needed', !z);
    const w = form.querySelector('input[name="when"]:checked');
    setDd($('sumWhen'), w ? WHEN[w.value] : "I'm flexible", false);
  }

  /* ---------- steps ---------- */
  function setStep(n, dir) {
    dir = dir || (n > S.step ? 1 : -1);
    const from = panes[S.step - 1], to = panes[n - 1];
    if (from !== to) {
      to.style.transition = 'none'; to.classList.toggle('back', dir < 0); void to.offsetWidth; to.style.transition = '';
      from.classList.toggle('back', dir > 0);
      from.classList.remove('on'); from.inert = true;
      to.classList.add('on'); to.inert = false;
    }
    S.step = n;
    stepLis.forEach((li, i) => {
      li.classList.toggle('on', i === n - 1); li.classList.toggle('done', i < n - 1);
      li.style.setProperty('--fill', i < n - 1 ? '100%' : '0%');
      const b = li.querySelector('button'); b.disabled = i >= n; if (i === n - 1) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    backBtn.hidden = n === 1;
    nextBtn.firstChild.textContent = NEXT[n - 1] + ' ';
    fine.textContent = FINE[n - 1];
    const h = to.querySelector('h3'); if (h && from !== to) h.focus({ preventScroll: true });
    if (from !== to && card.getBoundingClientRect().top < 70) card.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  const err = (field, errId, msg) => {
    const f = typeof field === 'string' ? $(field) : field, e = $(errId);
    if (f) { if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); }
    e.textContent = msg || '';
    return !msg;
  };
  function validate(n) {
    if (n === 1) return err(null, 'e-service', S.sel.size ? '' : 'Pick at least one, or choose Not sure yet.');
    if (n === 2) {
      const v = $('f-zip').value.trim();
      return err('f-zip', 'e-zip', !v ? 'Enter your ZIP so we know where to send the crew.' : /^\d{5}(-\d{4})?$/.test(v) ? '' : 'Use a 5-digit ZIP code, like 89101.');
    }
    const name = $('f-name').value.trim(), phone = $('f-phone').value.replace(/\D/g, '');
    const a = err('f-name', 'e-name', name ? '' : 'Enter your name so we know who to ask for.');
    const b = err('f-phone', 'e-phone', phone.length >= 10 ? '' : 'Enter a number with area code so we can text you.');
    return a && b;
  }
  function advance() {
    if (!validate(S.step)) { const bad = panes[S.step - 1].querySelector('[aria-invalid="true"]'); if (bad) bad.focus(); return; }
    if (S.step < 3) setStep(S.step + 1, 1); else send();
  }

  /* ---------- photos ---------- */
  function renderThumbs() {
    const ul = $('thumbs'); ul.innerHTML = '';
    S.files.forEach((f, i) => {
      const li = document.createElement('li'), img = document.createElement('img'), b = document.createElement('button');
      img.alt = ''; img.src = f._url; b.type = 'button'; b.textContent = '×'; b.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      b.addEventListener('click', () => { URL.revokeObjectURL(f._url); S.files.splice(i, 1); syncFiles(); renderThumbs(); });
      li.appendChild(img); li.appendChild(b); ul.appendChild(li);
    });
    $('dropLabel').innerHTML = S.files.length ? '<b>' + S.files.length + (S.files.length === 1 ? ' photo' : ' photos') + ' added</b>. Add more' : '<b>Add photos</b> or drop them here';
  }
  function syncFiles() {
    try { const dt = new DataTransfer(); S.files.forEach((f) => dt.items.add(f)); $('f-photos').files = dt.files; } catch (e) { /* older browsers keep the picker's own list */ }
  }
  function addFiles(list) {
    Array.from(list || []).forEach((f) => {
      if (!/^image\//.test(f.type) || f.size > 15 * 1024 * 1024 || S.files.length >= 6) return;
      f._url = URL.createObjectURL(f); S.files.push(f);
    });
    syncFiles(); renderThumbs();
  }

  /* ---------- send ---------- */
  function send() {
    const endpoint = form.getAttribute('data-endpoint'), fail = $('sendFail'), btn = nextBtn;
    const done = () => {
      fail.hidden = true;
      $('doneNo').textContent = S.no;
      card.classList.add('sent'); loader.classList.add('sent'); loadCap.textContent = "Loaded. We'll text you the price.";
      const s = $('success'); s.focus({ preventScroll: true });
      if (card.getBoundingClientRect().top < 70) card.scrollIntoView({ block: 'start', behavior: 'smooth' });
    };
    const failed = () => {
      btn.disabled = false; btn.classList.remove('busy'); fail.hidden = false;
      fail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };
    const fd = new FormData(form);
    fd.append('reference', S.no);
    fd.append('_subject', 'New quote request ' + S.no + ' (Swift Junk Removal)');
    fd.append('_template', 'table'); fd.append('_captcha', 'false');
    fd.append('services', Array.from(S.sel).map((k) => SERVICES[k]).join(', '));
    btn.disabled = true; btn.classList.add('busy');
    /* a request only counts as sent when the inbox service says so; anything else tells the visitor and offers the phone */
    fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
      .then((r) => r.json().catch(() => ({})).then((j) => { if (r.ok && j.success !== 'false' && j.success !== false) { btn.disabled = false; btn.classList.remove('busy'); done(); } else failed(); }))
      .catch(failed);
  }
  function reset() {
    form.reset(); S.sel.clear(); S.files.forEach((f) => URL.revokeObjectURL(f._url)); S.files = []; renderThumbs();
    form.querySelectorAll('.tile').forEach((t) => t.classList.remove('is-on'));
    form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
    form.querySelectorAll('.err').forEach((e) => { e.textContent = ''; });
    $('zipNote').textContent = ''; $('zipNote').className = 'zip-note';
    S.no = orderNo(); $('woNo').textContent = S.no;
    card.classList.remove('sent'); loader.classList.remove('sent'); $('sendFail').hidden = true; S.step = 1;
    panes.forEach((p, i) => { p.classList.toggle('on', i === 0); p.classList.remove('back'); p.inert = i !== 0; });
    setStep(1, -1); updateSummary(); updateLoader();
  }

  /* ---------- wiring ---------- */
  function setService(list) {
    S.sel.clear(); list.forEach((k) => S.sel.add(k));
    form.querySelectorAll('input[name="service"]').forEach((i) => { i.checked = S.sel.has(i.value); i.closest('.tile').classList.toggle('is-on', i.checked); });
    updateLoader(); updateSummary();
  }

  SW.quote = {
    init() {
      form = $('quoteForm'); card = $('formCard');
      if (!form) return;
      panes = Array.from(form.querySelectorAll('.pane')); stepLis = Array.from(form.querySelectorAll('.wo-steps li'));
      nextBtn = $('woNext'); backBtn = $('woBack'); loader = $('loader'); loadCap = $('loadCap'); fine = $('woFine');
      buildLoader(); buildBarcode();
      S.no = orderNo(); $('woNo').textContent = S.no;
      $('woDate').textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      form.querySelectorAll('.tile').forEach((t) => t.querySelectorAll('.tile-art g > use, .tile-art g > text').forEach((u, i) => u.style.setProperty('--k', i)));

      form.querySelectorAll('input[name="service"]').forEach((i) => i.addEventListener('change', () => {
        if (i.checked && i.value === 'general') S.sel.clear(); else if (i.checked) S.sel.delete('general');
        if (i.checked) S.sel.add(i.value); else S.sel.delete(i.value);
        if (i.value === 'general' && i.checked) { /* "not sure" stands alone */ }
        setService(Array.from(S.sel)); err(null, 'e-service', '');
      }));
      form.querySelectorAll('input[name="when"]').forEach((i) => i.addEventListener('change', updateSummary));
      $('f-zip').addEventListener('input', () => {
        const v = $('f-zip').value, z = SW.zone(v), n = $('zipNote');
        n.className = 'zip-note';
        if (z && z.level === 'ok') { n.textContent = 'Yes, we cover ' + z.city + '.'; n.classList.add('ok'); }
        else if (z && z.level === 'near') { n.textContent = z.city + ' is just outside our usual area. Send it and we will confirm.'; n.classList.add('warn'); }
        else if (z) { n.textContent = "That's outside our usual area. Send it anyway and we'll tell you."; n.classList.add('warn'); }
        else n.textContent = '';
        if ($('f-zip').getAttribute('aria-invalid')) validate(2);
        updateSummary();
      });
      ['f-name', 'f-phone'].forEach((id) => $(id).addEventListener('input', () => { if ($(id).getAttribute('aria-invalid')) validate(3); }));

      nextBtn.addEventListener('click', advance);
      backBtn.addEventListener('click', () => setStep(S.step - 1, -1));
      stepLis.forEach((li, i) => li.querySelector('button').addEventListener('click', () => { if (i + 1 < S.step) setStep(i + 1, -1); }));
      form.addEventListener('submit', (e) => { e.preventDefault(); advance(); });
      form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.type !== 'checkbox' && e.target.type !== 'radio' && e.target.tagName !== 'BUTTON') { e.preventDefault(); advance(); } });

      const drop = $('drop');
      $('f-photos').addEventListener('change', (e) => { const picked = Array.from(e.target.files); S.files.forEach((f) => URL.revokeObjectURL(f._url)); S.files = []; addFiles(picked); });
      ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', (e) => addFiles(e.dataTransfer && e.dataTransfer.files));
      $('woAgain').addEventListener('click', reset);

      /* "Get a quote" buttons elsewhere on the page choose their service before the page scrolls here */
      document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[data-service]');
        if (!a) return;
        const k = a.getAttribute('data-service');
        if (card.classList.contains('sent')) reset();
        if (k && k !== 'general') { S.sel.delete('general'); S.sel.add(k); setService(Array.from(S.sel)); err(null, 'e-service', ''); }
        if (S.step !== 1) setStep(1, -1);
      });
      updateLoader(); updateSummary();
    },
  };
})(window.SW);
