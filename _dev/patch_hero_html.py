import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hp = os.path.join(ROOT, 'index.html')
s = open(hp, encoding='utf8').read()

# 1. hero copy
a = s.index('<h1>Junk gone.<br>Same day.</h1>')
b = s.index('</h1>', a) + 5
s = s[:a] + '<h1>Whatever it is,<br>we take it all.</h1>' + s[b:]
s = s.replace('Junk removal and cleanouts across Las Vegas and Henderson. Get a free quote, and approve the price before we lift a thing.',
              'Junk removal and cleanouts across Las Vegas and Henderson. Free quote, and you approve the price before we lift a thing.')

# 2. one card, no rail
a = s.index('<!-- one card per stop')
b = s.index('<div class="cue"')
card = '''<!-- the closing card, shown once the truck has parked for the night -->
    <div class="tickets" id="tickets" aria-live="polite">
      <article class="ticket" aria-label="Get your free quote">
        <p class="tk-step">Your place is next</p>
        <h2>Tell us what needs to go.</h2>
        <p>We'll send your price before we lift a thing. Free, with no obligation.</p>
        <div class="tk-actions"><a class="btn btn-primary" href="#quote" data-service="general">Get your free quote</a><a class="btn btn-ghost" href="tel:+17020000000"><svg aria-hidden="true"><use href="#i-phone"/></svg>Call (702) 000-0000</a></div>
      </article>
    </div>

    '''
s = s[:a] + card + s[b:]

# 3. scripts
if 'js/trailer.js' not in s:
    s = s.replace('<script src="js/truck.js"></script>', '<script src="js/truck.js"></script>\n<script src="js/trailer.js"></script>\n<script src="js/hero-world.js"></script>')
open(hp, 'w', encoding='utf8').write(s)

bp = os.path.join(ROOT, '_dev', 'build_artifact.py')
b = open(bp, encoding='utf8').read()
if "'trailer'" not in b:
    b = b.replace("'world', 'truck',", "'world', 'truck', 'trailer', 'hero-world',")
open(bp, 'w', encoding='utf8').write(b)
print('ok')
