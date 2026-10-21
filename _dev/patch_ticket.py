import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hp = os.path.join(ROOT, 'index.html')
s = open(hp, encoding='utf8').read()

# ---- remove the old ticket css (rules live on single lines, plus the multi-line .ticket {} block)
a = s.index("  .tickets { position: absolute; z-index: 8;")
b = s.index("  .tk-actions .btn { min-height: 48px; padding: 0 22px; font-size: 15.5px; }") + len("  .tk-actions .btn { min-height: 48px; padding: 0 22px; font-size: 15.5px; }")
new_css = r'''  .tickets { position: absolute; z-index: 8; right: var(--gutter); top: clamp(92px, 14vh, 140px); width: min(410px, 36vw); perspective: 1200px; }
  /* the closing card is the next work order: the same paper, the same perforation, stamped "cleared" as the truck leaves */
  .ticket {
    --notch: 13px; --paper: #f5f8fd; --ink: #0b1220;
    position: absolute; top: 0; left: 0; width: 100%; color: var(--ink);
    filter: drop-shadow(0 34px 40px rgba(4, 7, 18, .5)) drop-shadow(0 2px 0 rgba(255, 255, 255, .18));
    opacity: 0; visibility: hidden; transform: translate3d(0, 26px, 0) rotateX(10deg) scale(.97); transform-origin: 50% 100%;
    transition: opacity .5s ease, transform .9s cubic-bezier(.16, 1, .3, 1), visibility 0s linear .5s;
  }
  .ticket.on { opacity: 1; visibility: visible; transform: none; transition-delay: 0s; }
  .tk-main, .tk-stub { display: block; background: var(--paper); }
  .tk-main { position: relative; padding: 22px 24px 22px; border-radius: 22px 22px 0 0; overflow: hidden;
    -webkit-mask-image: radial-gradient(circle var(--notch) at 0 100%, #0000 96%, #000), radial-gradient(circle var(--notch) at 100% 100%, #0000 96%, #000);
    mask-image: radial-gradient(circle var(--notch) at 0 100%, #0000 96%, #000), radial-gradient(circle var(--notch) at 100% 100%, #0000 96%, #000);
    -webkit-mask-composite: source-in; mask-composite: intersect; }
  .tk-main::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 5px; background: repeating-linear-gradient(115deg, #7a4630 0 18px, #c4632d 18px 36px, #e8803f 36px 54px); }
  .tk-top { display: flex; align-items: center; gap: 10px; margin: 6px 0 16px; }
  .tk-top svg { width: 34px; height: auto; flex: none; }
  .tk-top b { font: 500 11px/1 var(--mono); letter-spacing: .12em; text-transform: uppercase; color: #5b6684; }
  .tk-stamp { margin-left: auto; padding: 6px 11px 5px; border: 2px solid #b0501a; outline: 1.5px solid #b0501a; outline-offset: -6px; border-radius: 7px; color: #b0501a; font: 800 12px/1 var(--display); letter-spacing: .16em; text-transform: uppercase; transform: rotate(-6deg); opacity: 0; }
  .ticket.on .tk-stamp { animation: tkStamp .5s cubic-bezier(.2, 1.4, .4, 1) .55s both; }
  @keyframes tkStamp { from { transform: rotate(-14deg) scale(2.3); opacity: 0; } to { transform: rotate(-6deg) scale(1); opacity: .92; } }
  .ticket p.tk-step { margin: 0 0 8px; font: 700 12.5px/1 var(--body); letter-spacing: .02em; color: #b0501a; }
  .ticket h2 { margin: 0; font: 800 clamp(1.7rem, 2.8vw, 2.25rem)/1.02 var(--display); letter-spacing: -.035em; color: var(--ink); text-wrap: balance; }
  .tk-flow { margin: 14px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; }
  .tk-flow li { display: inline-flex; align-items: center; gap: 8px; font: 600 13px/1 var(--body); color: #36415d; }
  .tk-flow li + li::before { content: ""; width: 7px; height: 11px; margin-right: 2px; background: #e8803f; clip-path: polygon(0 0, 55% 0, 100% 50%, 55% 100%, 0 100%, 45% 50%); }
  .ticket p.tk-sub { margin: 12px 0 0; font: 400 15px/1.45 var(--body); color: #36415d; }
  .tk-actions { margin-top: 16px; }
  .tk-actions .btn { width: 100%; min-height: 54px; padding: 0 22px; font-size: 16.5px; position: relative; overflow: hidden; }
  .tk-actions .btn svg { width: 18px; height: 18px; }
  .tk-actions .btn::after { content: ""; position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, .5) 50%, transparent 65%); transform: translateX(-120%); }
  .ticket.on .tk-actions .btn::after { animation: tkShine 1.1s ease 1.1s 1 both; }
  @keyframes tkShine { to { transform: translateX(120%); } }
  .tk-stub { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 24px 16px; border-radius: 0 0 22px 22px; background: #e9eef8;
    background-image: repeating-linear-gradient(90deg, rgba(11, 18, 32, .32) 0 7px, transparent 7px 14px); background-size: 100% 2px; background-repeat: no-repeat; background-position: 0 0;
    -webkit-mask-image: radial-gradient(circle var(--notch) at 0 0, #0000 96%, #000), radial-gradient(circle var(--notch) at 100% 0, #0000 96%, #000);
    mask-image: radial-gradient(circle var(--notch) at 0 0, #0000 96%, #000), radial-gradient(circle var(--notch) at 100% 0, #0000 96%, #000);
    -webkit-mask-composite: source-in; mask-composite: intersect; }
  .tk-stub span { font: 500 11px/1.2 var(--mono); letter-spacing: .1em; text-transform: uppercase; color: #5b6684; }
  .tk-stub a { font: 800 19px/1 var(--display); letter-spacing: -.01em; color: var(--ink); text-decoration: none; white-space: nowrap; }
  .tk-stub a:hover { color: #b0501a; }'''
s = s[:a] + new_css + s[b:]

# ---- responsive overrides: replace the old per-ticket phone rules
a = s.index("    .tickets { left: max(16px, env(safe-area-inset-left, 0px));")
b = s.index("    .tk-actions .btn { min-height: 46px; font-size: 15px; padding: 0 18px; }") + len("    .tk-actions .btn { min-height: 46px; font-size: 15px; padding: 0 18px; }")
s = s[:a] + '''    /* on a phone the card is centred on the screen, over the skyline, with the truck still showing below it */
    .tickets { left: max(14px, env(safe-area-inset-left, 0px)); right: max(14px, env(safe-area-inset-right, 0px)); top: 50%; width: auto; }
    .ticket { top: 0; transform: translate3d(0, calc(-50% + 26px), 0) rotateX(10deg) scale(.97); }
    .ticket.on { transform: translate3d(0, -50%, 0); }
    .tk-main { padding: 18px 20px 18px; }
    .tk-top { margin: 4px 0 12px; }
    .ticket h2 { font-size: 1.7rem; }
    .ticket p.tk-sub { font-size: 14.5px; margin-top: 10px; }
    .tk-flow { margin-top: 12px; }
    .tk-actions { margin-top: 14px; }
    .tk-actions .btn { min-height: 52px; }
    .tk-stub { padding: 13px 20px; }''' + s[b:]
s = s.replace("    .tk-actions .btn { flex: 1 1 auto; }\n", "")
s = s.replace("    .tk-actions .btn-ghost { display: none; }\n", "")
s = s.replace("  @media (max-width: 860px) and (max-height: 720px) { .ticket ul { display: none; } .ticket p { margin-top: 6px; } }", "  @media (max-width: 860px) and (max-height: 700px) { .tk-flow, .ticket p.tk-sub { display: none; } .tk-top { margin-bottom: 8px; } }")

# ---- markup
a = s.index('      <article class="ticket" aria-label="Get your free quote">')
b = s.index('</article>', a) + len('</article>')
s = s[:a] + '''      <article class="ticket" aria-label="Get your free quote">
        <div class="tk-main">
          <div class="tk-top"><svg viewBox="0 0 172 108" aria-hidden="true"><use href="#mark-light"/></svg><b>Job ticket</b><span class="tk-stamp" aria-hidden="true">Cleared</span></div>
          <p class="tk-step">Your place is next</p>
          <h2>Tell us what needs to go.</h2>
          <ol class="tk-flow" aria-label="How it works"><li>Send a photo</li><li>Approve the price</li><li>We haul it</li></ol>
          <p class="tk-sub">We'll send your price before we lift a thing. Free, with no obligation.</p>
          <div class="tk-actions"><a class="btn btn-primary" href="#quote" data-service="general">Get your free quote <svg aria-hidden="true"><use href="#i-arrow"/></svg></a></div>
        </div>
        <div class="tk-stub"><span>Prefer to talk?</span><a href="tel:+17020000000">(702) 000-0000</a></div>
      </article>''' + s[b:]
open(hp, 'w', encoding='utf8').write(s)
print('ok')
