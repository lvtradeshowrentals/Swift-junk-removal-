import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf8').read()
def wr(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf8').write(s)

CARDS = [
    ('garage', 'Garage and home cleanouts', 'Garages, attics, basements, sheds and spare rooms. We carry it out and haul it away.', ['Boxes and bins', 'Bikes', 'Old mattresses', 'Storage']),
    ('furniture', 'Furniture and appliances', 'Couches, mattresses, fridges, TVs and exercise equipment. From inside the house or from the curb.', ['Couches', 'Mattresses', 'Refrigerators', 'TVs']),
    ('construction', 'Construction cleanup', 'Drywall, lumber, tile, cabinets and demo debris from remodels and builds.', ['Drywall', 'Lumber', 'Cabinets', 'Debris bags']),
    ('commercial', 'Commercial and property', 'Offices, storefronts, apartment turnovers and vacant units. One-time or recurring.', ['Desks and chairs', 'File cabinets', 'Monitors', 'Turnovers']),
    ('estate', 'Estate and move-out', 'Full-house cleanouts for estates, sales and move-outs, on your timeline.', ['Dressers', 'Armchairs', 'Lamps and frames', 'Whole homes']),
]
cards = ''
for i, (k, t, p, chips) in enumerate(CARDS):
    cards += f'''        <li class="dk-card" data-key="{k}" aria-roledescription="slide" aria-label="{i + 1} of 5: {t}">
          <div class="dk-art" aria-hidden="true"></div>
          <div class="dk-body">
            <span class="dk-n">{i + 1:02d}<i>/ 05</i></span>
            <h3>{t}</h3>
            <p>{p}</p>
            <ul class="dk-chips">{''.join(f'<li>{c}</li>' for c in chips)}</ul>
            <a class="dk-cta" href="#quote" data-service="{k}">Get a quote for this <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </div>
        </li>
'''

section = f'''<section class="sheet sheet--dusk services" id="services" data-tone="night" aria-labelledby="svc-h">
  <div class="wrap dk-head">
    <h2 class="h2" id="svc-h" data-reveal>What we remove.</h2>
    <p class="lede" data-reveal style="--d:.08s">From a single couch to a whole house. Swipe through the jobs we do every week.</p>
  </div>

  <div class="deck" id="deck" data-reveal style="--d:.12s">
    <ul class="dk-track" id="dkTrack" aria-label="What we remove" tabindex="0">
{cards}    </ul>
    <div class="dk-ui wrap">
      <button class="dk-arrow" id="dkPrev" type="button" aria-label="Previous service"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <ol class="dk-dots" id="dkDots" aria-label="Choose a service">{''.join(f'<li><button type="button" aria-label="{t}"><span>{t.split(" and ")[0].split(" ")[0]}</span></button></li>' for k, t, p, c in CARDS)}</ol>
      <button class="dk-arrow" id="dkNext" type="button" aria-label="Next service"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
    </div>
  </div>

  <div class="wrap">
    <aside class="svc-help" data-reveal>
      <svg class="svc-help-marks" viewBox="0 0 172 108" aria-hidden="true"><use href="#mark-dark"/></svg>
      <div>
        <h3>Not sure what to call it?</h3>
        <p>Send us a photo or give us a call. We'll tell you what we can take and what it costs.</p>
      </div>
      <div class="svc-help-actions">
        <a class="btn btn-primary" href="#quote" data-service="general">Send a photo</a>
        <a class="btn btn-ghost" href="tel:+17029296544"><svg aria-hidden="true"><use href="#i-phone"/></svg>(702) 929-6544</a>
      </div>
    </aside>
    <p class="svc-note" data-reveal>For safety and legal reasons we can't haul hazardous materials such as paint, chemicals, asbestos, medical waste or propane tanks. Not sure about something? Ask us before the day.</p>
  </div>
</section>'''

h = rd('index.html')
a = h.index('<section class="sheet sheet--day services"')
b = h.index('</section>', a) + len('</section>')
h = h[:a] + section + h[b:]
wr('index.html', h)

# ---------------- js ----------------
wr('js/services.js', r'''/* ============================================================================
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
      const arts = cards.map((c) => {
        const art = c.querySelector('.dk-art');
        art.innerHTML = '<div class="scene on"><svg viewBox="0 0 800 680" preserveAspectRatio="xMidYMax slice" focusable="false" aria-hidden="true">' + SW.scenes.build[c.getAttribute('data-key')]() + '</svg></div>';
        return art.firstChild;
      });

      let cur = -1, raf = 0;
      const centre = () => track.scrollLeft + track.clientWidth / 2;
      function measure() {
        const c = centre();
        let best = 0, bd = 1e9;
        cards.forEach((card, i) => {
          const mid = card.offsetLeft + card.offsetWidth / 2, d = (mid - c) / (card.offsetWidth + 20);
          const dd = clamp(d, -2, 2);
          card.style.setProperty('--d', dd.toFixed(3));
          card.style.setProperty('--ad', Math.abs(dd).toFixed(3));
          if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
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
        const card = cards[i];
        track.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      };
      $('dkPrev').addEventListener('click', () => go(cur - 1));
      $('dkNext').addEventListener('click', () => go(cur + 1));
      dots.forEach((b, i) => b.addEventListener('click', () => go(i)));
      cards.forEach((c, i) => c.addEventListener('click', (e) => { if (i !== cur && !e.target.closest('a')) { e.preventDefault(); go(i); } }));
      track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });

      /* a mouse can drag the deck too (touch and trackpads already swipe natively) */
      let drag = null;
      track.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a,button')) return; drag = { x: e.clientX, l: track.scrollLeft, moved: false }; track.classList.add('grabbing'); });
      window.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; track.scrollLeft = drag.l - dx; });
      window.addEventListener('pointerup', () => {
        if (!drag) return; track.classList.remove('grabbing');
        const moved = drag.moved; drag = null;
        if (moved) { const c = centre(); let best = 0, bd = 1e9; cards.forEach((card, i) => { const d = Math.abs(card.offsetLeft + card.offsetWidth / 2 - c); if (d < bd) { bd = d; best = i; } }); go(best); }
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
''')

# ---------------- css ----------------
c = rd('css/sections.css')
a = c.index('/* ============================================================================\n   SERVICES')
b = c.index('/* ============================================================================\n   HOW IT WORKS')
keep_help = re.search(r'\.svc-help \{.*?\n\.svc-note \{[^\n]*\n', c[a:b], re.S).group(0)
c = c[:a] + '''/* ============================================================================
   SERVICES: a deck of tall job cards on a dusk sheet (between the bright work
   order and the night road). Sideways only, native swipe and snap; depth comes
   from each card's distance to the centre (--d, -2..2).
   ========================================================================== */
.sheet--dusk {
  --bg: #120f24; --fg: #fff; --fg-2: #d7d2ea; --fg-3: #a59fc4; --rule: rgba(255, 255, 255, .14);
  background: radial-gradient(120% 70% at 50% 108%, rgba(232, 128, 63, .42), transparent 62%), radial-gradient(70% 50% at 15% 0%, rgba(92, 72, 160, .45), transparent 70%), linear-gradient(180deg, #0f1430 0%, #1d1838 46%, #3a2340 78%, #5a2c35 100%);
  box-shadow: 0 -24px 60px -30px rgba(0, 0, 0, .55);
  overflow-x: clip;
}
.dk-head { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); align-items: end; gap: 12px clamp(28px, 5vw, 72px); margin-bottom: clamp(26px, 4vw, 48px); }
.dk-head .lede { margin: 0 0 8px; }

.deck { position: relative; }
.dk-track {
  --cw: min(420px, 74vw);
  display: flex; gap: clamp(14px, 2vw, 26px); margin: 0; padding: 26px calc(50% - var(--cw) / 2) 40px; list-style: none;
  overflow-x: auto; overscroll-behavior-x: contain; scroll-snap-type: x mandatory; scrollbar-width: none; perspective: 1400px; outline: none; cursor: grab;
}
.dk-track::-webkit-scrollbar { display: none; }
.dk-track.grabbing { cursor: grabbing; scroll-snap-type: none; user-select: none; }
.dk-track:focus-visible { box-shadow: inset 0 0 0 3px var(--copper-300); border-radius: 24px; }
.dk-card {
  --d: 0; --ad: 0;
  position: relative; flex: 0 0 var(--cw); scroll-snap-align: center; border-radius: 30px; overflow: hidden; isolation: isolate;
  aspect-ratio: 3 / 4.25; background: #0b1020;
  transform: rotateY(calc(var(--d) * -14deg)) scale(calc(1 - var(--ad) * .1)) translateZ(0);
  filter: brightness(calc(1 - var(--ad) * .38)) saturate(calc(1 - var(--ad) * .3));
  box-shadow: 0 50px 80px -40px rgba(0, 0, 0, .85), 0 0 0 1px rgba(255, 255, 255, .1), inset 0 1px 0 rgba(255, 255, 255, .18);
  transition: box-shadow .5s;
  will-change: transform;
}
.dk-card.on { box-shadow: 0 60px 90px -36px rgba(0, 0, 0, .9), 0 0 0 1.5px rgba(246, 163, 104, .75), 0 0 60px -10px rgba(232, 128, 63, .45); }
/* the scene sits in the top of the card and moves at its own depth as the card slides */
.dk-art { position: absolute; inset: 0 0 34% 0; overflow: hidden; }
.dk-art .scene { position: absolute; inset: -4% -14%; display: block; transform: translateX(calc(var(--d) * 9%)); }
.dk-art svg { display: block; width: 100%; height: 100%; }
.dk-art::after { content: ""; position: absolute; inset: auto 0 0 0; height: 42%; background: linear-gradient(rgba(11, 16, 32, 0), #0b1020); }
.dk-body { position: absolute; inset: auto 0 0 0; padding: 0 clamp(20px, 2.4vw, 28px) clamp(20px, 2.4vw, 26px); display: grid; gap: 10px; }
.dk-n { font: 600 12px/1 var(--mono); letter-spacing: .14em; color: var(--copper-300); }
.dk-n i { font-style: normal; margin-left: 6px; color: rgba(255, 255, 255, .45); }
.dk-card h3 { margin: 0; font: 800 clamp(1.45rem, 2.2vw, 1.85rem)/1.04 var(--display); letter-spacing: -.03em; color: #fff; text-wrap: balance; }
.dk-card p { margin: 0; font: 400 15px/1.5 var(--body); color: #cfd4e6; }
.dk-chips { margin: 2px 0 4px; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
.dk-chips li { padding: 6px 10px; border-radius: 999px; background: rgba(255, 255, 255, .08); border: 1px solid rgba(255, 255, 255, .14); font: 500 12.5px/1 var(--body); color: #e6e9f4; }
.dk-cta { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; border-radius: 999px; font: 700 15.5px/1 var(--body); text-decoration: none; color: #0b1220; background: linear-gradient(180deg, #f59a58, var(--copper-500) 55%, #d96d2f); box-shadow: 0 10px 24px -10px rgba(232, 128, 63, .8), inset 0 1px 0 rgba(255, 255, 255, .35); opacity: calc(1 - var(--ad) * 1.4); transition: transform .2s; }
.dk-cta svg { width: 17px; height: 17px; transition: transform .25s; }
.dk-cta:hover svg { transform: translateX(3px); }
.dk-card:not(.on) .dk-cta { pointer-events: none; }
/* the card's text arrives as it reaches the centre */
.dk-body > * { transform: translateY(calc(var(--ad) * 14px)); opacity: calc(1 - var(--ad) * .7); }

.dk-ui { display: flex; align-items: center; justify-content: center; gap: 16px; }
.dk-arrow { display: grid; place-items: center; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; color: #fff; background: rgba(255, 255, 255, .08); border: 1px solid rgba(255, 255, 255, .22); transition: background .2s, border-color .2s, opacity .2s; }
.dk-arrow svg { width: 22px; height: 22px; }
.dk-arrow:hover { background: rgba(255, 255, 255, .16); border-color: var(--copper-300); }
.dk-arrow:disabled { opacity: .3; cursor: default; }
.dk-dots { margin: 0; padding: 0; list-style: none; display: flex; gap: 6px; }
.dk-dots button { display: flex; align-items: center; min-height: 40px; padding: 0 12px; border-radius: 999px; cursor: pointer; background: transparent; border: 1px solid rgba(255, 255, 255, .18); color: #c9c4e0; font: 600 13px/1 var(--body); transition: all .3s var(--ease); }
.dk-dots button:hover { border-color: rgba(246, 163, 104, .7); color: #fff; }
.dk-dots button.on { background: var(--copper-500); border-color: var(--copper-500); color: #0b1220; }

.services .svc-help { margin-top: clamp(36px, 5vw, 64px); background: rgba(8, 10, 24, .55); border: 1px solid rgba(255, 255, 255, .12); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
''' + keep_help + '''
@media (max-width: 900px) {
  .dk-head { grid-template-columns: 1fr; }
  .dk-head .lede { margin: 12px 0 0; }
  .dk-dots span { display: none; }
  .dk-dots button { width: 12px; min-height: 12px; padding: 0; border-radius: 50%; background: rgba(255, 255, 255, .25); border: 0; }
  .dk-dots button.on { width: 30px; border-radius: 999px; }
  .dk-dots { gap: 8px; }
  .svc-help { grid-template-columns: 1fr; }
  .svc-help-marks { width: 64px; }
}
@media (max-width: 520px) {
  .dk-track { --cw: 80vw; padding-top: 18px; padding-bottom: 28px; }
  .dk-card { aspect-ratio: 3 / 4.6; border-radius: 26px; }
  .dk-card p { font-size: 14.5px; }
  .dk-arrow { width: 44px; height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .dk-card, .dk-body > *, .dk-art .scene { transform: none !important; }
  .dk-card { filter: none; }
}

''' + c[b:]
wr('css/sections.css', c)
print('ok')
