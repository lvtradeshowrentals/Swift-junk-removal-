import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hp = os.path.join(ROOT, 'index.html')
s = open(hp, encoding='utf8').read()

# 1. drop the old below-ride css (now in css/sections.css)
a = s.index("  /* ---------- below the ride ---------- */")
b = s.index("  /* ---------- splash intro ---------- */")
s = s[:a] + s[b:]

# 2. responsive rules that only served the old sections
s = s.replace("""  @media (max-width: 1000px) {
    .quote-grid { grid-template-columns: 1fr; }
    .cards, .steps { grid-template-columns: 1fr 1fr; }
  }
""", "")
s = s.replace("    .cards, .steps, .areas, .form-grid { grid-template-columns: 1fr; }\n", "")
s = s.replace("    .h2 { max-width: none; }\n", "")

# 3. fonts + stylesheet link
s = s.replace("&family=Instrument+Sans:wght@400;500;600;700&display=swap",
              "&family=Instrument+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap")
if 'css/sections.css' not in s:
    s = s.replace("</style>\n</head>", "</style>\n<link rel=\"stylesheet\" href=\"css/sections.css\">\n</head>", 1)

# 4. nav: a second mark for bright sheets
s = s.replace('<svg viewBox="0 0 172 108" aria-hidden="true"><use href="#mark-dark"/></svg>\n    <span class="brand-text">',
              '<svg class="mk-d" viewBox="0 0 172 108" aria-hidden="true"><use href="#mark-dark"/></svg><svg class="mk-l" viewBox="0 0 172 108" aria-hidden="true"><use href="#mark-light"/></svg>\n    <span class="brand-text">', 1)

# 5. icons
if 'id="i-arrow"' not in s:
    s = s.replace('  <symbol id="i-camera"', '  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>\n  <symbol id="i-camera"', 1)

# 6. the quote section
a = s.index('<section class="section" id="quote"')
b = s.index('<section class="section alt" id="services"')
frag = open(os.path.join(ROOT, '_dev', 'quote_fragment.html'), encoding='utf8').read()
s = s[:a] + frag + '\n' + s[b:]

# 7. scripts
if 'js/ui.js' not in s:
    s = s.replace('<script src="js/page.js"></script>', '<script src="js/ui.js"></script>\n<script src="js/quote.js"></script>\n<script src="js/page.js"></script>')
open(hp, 'w', encoding='utf8').write(s)

# page.js: boot the new modules, drop the old form code
pp = os.path.join(ROOT, 'js', 'page.js')
p = open(pp, encoding='utf8').read()
a = p.index("    initForm();\n    initLinks();\n")
p = p.replace("    initForm();\n    initLinks();\n", "    SW.quote.init();\n    SW.ui.init();\n")
a = p.index("  /* any button that carries data-service")
b = p.index("  if (document.readyState === 'loading')")
p = p[:a] + p[b:]
open(pp, 'w', encoding='utf8').write(p)

# build script
bp = os.path.join(ROOT, '_dev', 'build_artifact.py')
b = open(bp, encoding='utf8').read()
b = b.replace("'ride', 'page']", "'ride', 'ui', 'quote', 'page']")
if 'sections.css' not in b:
    b = b.replace("links = ''.join", "css = open(os.path.join(ROOT, 'css', 'sections.css'), encoding='utf-8').read()\ns = s.replace('<link rel=\"stylesheet\" href=\"css/sections.css\">', '<style>\\n' + css + '\\n</style>')\nlinks = ''.join")
    b = b.replace("style = re.search(r'<style>.*?</style>', s, re.S).group(0)", "style = ''.join(re.findall(r'<style>.*?</style>', s, re.S))")
open(bp, 'w', encoding='utf8').write(b)
print('ok')
