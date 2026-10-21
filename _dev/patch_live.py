import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf8').read()
def wr(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf8').write(s)

PHONE_TEL, PHONE = '+17029296544', '(702) 929-6544'
EMAIL = 'swift-junkremoval@outlook.com'

h = rd('index.html')
def hrep(a, b, n=1):
    global h
    assert a in h, a[:90]
    h = h.replace(a, b, n)

# ---- contact details ----
h = h.replace('tel:+17020000000', 'tel:' + PHONE_TEL).replace('(702) 000-0000', PHONE)
h = h.replace('mailto:hello@example.com', 'mailto:' + EMAIL).replace('hello@example.com', EMAIL)
# the phone field's hint is a format example, not a number
h = re.sub(r'(id="f-phone"[^>]*placeholder=")[^"]*"', r'\1(702) 555-0123"', h)

# ---- the form posts to a real inbox ----
hrep('<form class="wo" id="quoteForm" novalidate>', '<form class="wo" id="quoteForm" novalidate data-endpoint="https://formsubmit.co/ajax/' + EMAIL + '">')
a = h.index('          <p class="demo-note" id="demoNote">')
b = h.index('</p>', a) + 4
h = h[:a].rstrip() + '\n' + h[b:].lstrip('\n')
hrep('<p class="done-lede">A real person reads every request. We\'ll text you with your price, and you approve it before we lift anything.</p>',
     '<p class="done-lede">We\'ll text you with your price, and you approve it before we lift anything. Need us sooner? Call <a href="tel:' + PHONE_TEL + '">' + PHONE + '</a>.</p>')
hrep('<p class="done-ref">', '<p class="fail" id="sendFail" role="alert" hidden>That didn\'t go through. Please try again, or call <a href="tel:' + PHONE_TEL + '">' + PHONE + '</a> and we\'ll take it by phone.</p>\n          <p class="done-ref">')

# ---- step 2 vignette: no sample customer, no placeholder price ----
hrep("Hi Dana, here's your price for the garage cleanout.", "Here's your price for the garage cleanout.")
hrep('<div class="pc-top"><span>Your price</span><em>Placeholder</em></div>', '<div class="pc-top"><span>Your price</span><em>In writing</em></div>')
hrep('<div class="pc-amt">$&bull;&bull;&bull;</div>', '<div class="pc-amt">One flat price</div>')
hrep("Booked. We'll see you Tuesday morning.", "Booked. Your crew is on the way.")

# ---- before / after: honest about being an illustration ----
hrep('<span class="ba-ph">Placeholder art</span>', '<span class="ba-ph">Illustration</span>')
hrep('Garage cleanout, one visit. Real before-and-after photos from our jobs will go here.', 'A packed garage cleared in one visit.')

# ---- reviews: no invented testimonials. The promises move into that night sheet as the closing proof. ----
a = h.index('<ul class="promises">')
b = h.index('</ul>', a) + 5
promises = h[a:b]
h = h[:a] + h[b:]
a = h.index('<section class="sheet sheet--night reviews-sec"')
b = h.index('</section>', a) + len('</section>')
h = h[:a] + '''<section class="sheet sheet--night promise-sec" id="promise" data-tone="night" aria-labelledby="pr-h">
  <div class="wrap">
    <h2 class="h2" id="pr-h" data-reveal>What you can count on.</h2>
    ''' + promises.replace('<ul class="promises">', '<ul class="promises">') + '''
  </div>
</section>''' + h[b:]

# ---- search and sharing metadata ----
hrep('<meta name="theme-color" content="#0b1220">', '''<meta name="theme-color" content="#0b1220">
<meta property="og:type" content="website"><meta property="og:title" content="Swift Junk Removal | Las Vegas &amp; Henderson">
<meta property="og:description" content="Fast junk removal and cleanouts across Las Vegas and Henderson. Free quote, and you approve the price before we lift anything.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 172 108'%3E%3Crect width='172' height='108' fill='%230b1220'/%3E%3Cpath d='M0 0H30L64 54L30 108H0L34 54Z' fill='%237a4630' transform='translate(10 0) scale(.9 1)'/%3E%3Cpath d='M54 0H84L118 54L84 108H54L88 54Z' fill='%23c4632d' transform='translate(10 0) scale(.9 1)'/%3E%3Cpath d='M108 0H138L172 54L138 108H108L142 54Z' fill='%23eef1fa' transform='translate(10 0) scale(.9 1)'/%3E%3C/svg%3E">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"LocalBusiness","name":"Swift Junk Removal","description":"Junk removal and cleanouts across Las Vegas and Henderson.","telephone":"''' + PHONE_TEL + '''","email":"''' + EMAIL + '''","areaServed":[{"@type":"City","name":"Las Vegas"},{"@type":"City","name":"Henderson"}],"priceRange":"Free quotes"}</script>''')
wr('index.html', h)

# ---- js ----
t = rd('js/truck.js')
t = t.replace('(702) 000-0000', PHONE); wr('js/truck.js', t)
t = rd('js/trailer.js')
t = t.replace('(702) 000-0000', PHONE); wr('js/trailer.js', t)

q = rd('js/quote.js')
a = q.index("  function send() {")
b = q.index("  function reset() {")
q = q[:a] + """  function send() {
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
      card.classList.add('sent'); card.classList.add('failed');
      const s = $('success'); s.focus({ preventScroll: true });
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
""" + q[b:]
q = q.replace("    card.classList.remove('sent'); loader.classList.remove('sent'); S.step = 1;", "    card.classList.remove('sent', 'failed'); loader.classList.remove('sent'); $('sendFail').hidden = true; S.step = 1;")
wr('js/quote.js', q)

# comments that still said "placeholder"
for f, a, b in [('js/proof.js', 'The art is a placeholder: one garage drawn twice,', 'The art is an illustration: one garage drawn twice,'),
                ('js/scenes.js', 'Placeholder art: swap any scene for a real photo later without touching the layout.', 'Any scene can be swapped for a real photo without touching the layout.'),
                ('js/ui.js', 'Placeholder coverage until the real service area is confirmed.', 'The valley ZIP ranges we serve.')]:
    s = rd(f); assert a in s, f; wr(f, s.replace(a, b))

# ---- css ----
c = rd('css/sections.css')
c = c.replace(".demo-note {", ".fail { margin: 14px 0 0; padding: 12px 14px; border-radius: 10px; background: #fdecea; border: 1px solid #f0a79e; color: #9a2a1b; font: 600 14px/1.45 var(--body); }\n.fail a { color: inherit; }\n.fail[hidden] { display: none; }\n.wo-wrap.failed .stamp, .wo-wrap.failed .next-list, .wo-wrap.failed .done-ref { display: none; }\n.wo-wrap.failed .wo-done h3, .wo-wrap.failed .done-lede { display: none; }\n.btn.busy { opacity: .7; pointer-events: none; }\n.demo-note {", 1)
c += """
/* the promises sit on a night sheet now */
.promise-sec .h2 { max-width: 14ch; color: #fff; }
.promise-sec .promises { margin-top: clamp(32px, 5vw, 60px); }
.promise-sec .promises li { border-top-color: rgba(238, 241, 250, .34); }
.promise-sec .promises svg { color: #fff; }
.promise-sec .promises h3 { color: #fff; }
.promise-sec .promises p { color: var(--ice-dim); }
"""
wr('css/sections.css', c)
print('ok')
