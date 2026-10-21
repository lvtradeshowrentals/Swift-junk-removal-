import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(p): return open(os.path.join(ROOT, p), encoding='utf8').read()
def wr(p, s): open(os.path.join(ROOT, p), 'w', encoding='utf8').write(s)

# ============ how.js: a portrait photo composition that fills the frame, and an earlier trigger ============
s = rd('js/how.js')
a = s.index("  function pileArt() {")
b = s.index("\n  }\n", a) + 5
s = s[:a] + """  /* the photo: a stack of junk shot close, portrait, so the pile is what you see. Used by the viewfinder and the sent picture. */
  function pileArt() {
    return `<g id="pileArt">
      <rect width="120" height="210" fill="#dfe9f4"/>
      <rect width="120" height="126" fill="url(#svSky)"/>
      <rect y="40" width="120" height="104" fill="#e9d3bb"/><rect y="40" width="120" height="104" fill="url(#svShade)"/>
      <path d="M0 56 H120 M0 76 H120 M0 96 H120 M0 116 H120" stroke="#d3b99c" stroke-width="1" opacity=".55"/>
      <rect y="144" width="120" height="66" fill="#d6cdbc"/><path d="M0 144 H120" stroke="#b9ad98" stroke-width="2"/>
      <ellipse cx="60" cy="182" rx="58" ry="6" fill="#1b2440" opacity=".22"/>
      <g transform="translate(100 180) scale(.74)"><use href="#it-mattressUp"/></g>
      <g transform="translate(60 180) scale(.7)"><use href="#it-couch"/></g>
      <g transform="translate(60 128) rotate(-3) scale(.62)"><use href="#it-mattress"/></g>
      <g transform="translate(20 181) scale(.66)"><use href="#it-boxStack"/></g>
      <g transform="translate(94 182) scale(.5)"><use href="#it-lamp"/></g>
    </g>`;
  }
""" + s[b:]
s = s.replace("    const y = window.innerHeight * .6 - rb.top;", "    const y = window.innerHeight * .74 - rb.top;")
wr('js/how.js', s)

# ============ index.html: the photo bubble crop ============
h = rd('index.html')
a = '<div class="bub out b-photo"><svg viewBox="20 130 200 130"><use href="#pileArt"/></svg></div>'
assert a in h
h = h.replace(a, '<div class="bub out b-photo"><svg viewBox="-4 76 128 112"><use href="#pileArt"/></svg></div>')
a = '<svg class="vf" viewBox="0 0 240 300" preserveAspectRatio="xMidYMid slice"><use href="#pileArt"/></svg>'
assert a in h
h = h.replace(a, '<svg class="vf" viewBox="0 0 120 210" preserveAspectRatio="xMidYMid slice"><use href="#pileArt"/></svg>\n                <span class="af-ring"></span><b class="af-tag">AF</b>')
wr('index.html', h)

# ============ css ============
c = rd('css/sections.css')
def rep(a, b):
    global c
    assert a in c, a[:90]
    c = c.replace(a, b, 1)

# viewfinder: brackets start wide, close in and lock on the pile; the picture pulls from soft to sharp
rep(".vf { display: block; width: 100%; height: 100%; }", ".vf { display: block; width: 100%; height: 100%; filter: blur(3.2px); transform: scale(1.05); }")
a = c.index(".corner { position: absolute;")
b = c.index(".flash {")
c = c[:a] + """.screen { --bl: 8%; --bt: 10%; --br: 8%; --bb: 22%; }
.corner { position: absolute; width: 15px; height: 15px; border: 0 solid #fff; opacity: .95; filter: drop-shadow(0 0 3px rgba(0, 0, 0, .45)); }
.corner.tl { left: var(--bl); top: var(--bt); border-width: 2.5px 0 0 2.5px; } .corner.tr { right: var(--br); top: var(--bt); border-width: 2.5px 2.5px 0 0; }
.corner.bl { left: var(--bl); bottom: var(--bb); border-width: 0 0 2.5px 2.5px; } .corner.br { right: var(--br); bottom: var(--bb); border-width: 0 2.5px 2.5px 0; }
.af-ring { position: absolute; left: 50%; top: 56%; width: 46px; height: 46px; margin: -23px; border-radius: 50%; border: 2px solid #ffd54a; opacity: 0; }
.af-tag { position: absolute; left: 50%; bottom: 17%; transform: translateX(-50%); padding: 3px 7px; border-radius: 5px; background: rgba(0, 0, 0, .55); color: #fff; font: 600 9px/1 var(--mono); letter-spacing: .1em; opacity: 0; }
""" + c[b:]
rep(".step.on .v1 .flash { animation: flash .55s ease-out 1.15s both; }\n.step.on .v1 .shutter { animation: press .32s ease 1.1s both; }\n.step.on .v1 .b-photo { animation: bubIn .65s var(--spring) 1.6s both; }\n.step.on .v1 .b-dots { animation: dotsLife 1s ease 2.5s both; }\n.step.on .v1 .b-dots i { animation: dotBlink .9s ease-in-out 2.5s 2; }\n.step.on .v1 .b-text { animation: bubIn .65s var(--spring) 3.5s both; }\n.step.on .v1 .sent { animation: bubIn .5s ease 4.2s both; }",
    """/* focus pull: soft at first, brackets close in and snap onto the pile (0.15 to 0.85 s), the ring confirms lock, then the shutter fires */
.step.on .v1 .vf { animation: focusPull .8s cubic-bezier(.3, .7, .2, 1) .1s both; }
.step.on .v1 .screen { animation: bracketLock .8s cubic-bezier(.3, .7, .2, 1) .1s both; }
.step.on .v1 .corner { animation: lockColor .25s ease .85s both; }
.step.on .v1 .af-ring { animation: afRing .6s ease .8s both; }
.step.on .v1 .af-tag { animation: afTag .2s ease .85s both; }
.step.on .v1 .flash { animation: flash .45s ease-out 1.25s both; }
.step.on .v1 .shutter { animation: press .28s ease 1.2s both; }
.step.on .v1 .b-photo { animation: bubIn .55s var(--spring) 1.5s both; }
.step.on .v1 .b-dots { animation: dotsLife .75s ease 2.05s both; }
.step.on .v1 .b-dots i { animation: dotBlink .75s ease-in-out 2.05s 1; }
.step.on .v1 .b-text { animation: bubIn .55s var(--spring) 2.55s both; }
.step.on .v1 .sent { animation: bubIn .45s ease 3.05s both; }
@keyframes focusPull { from { filter: blur(3.2px); transform: scale(1.05); } to { filter: blur(0); transform: scale(1); } }
@keyframes bracketLock { from { --bl: 8%; --bt: 10%; --br: 8%; --bb: 22%; } to { --bl: 17%; --bt: 41%; --br: 10%; --bb: 20%; } }
@keyframes lockColor { to { border-color: #ffd54a; } }
@keyframes afRing { 0% { opacity: 1; transform: scale(1.7); } 60% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(.8); } }
@keyframes afTag { to { opacity: 1; } }""")
# register the bracket vars so they can animate
rep(".screen { --bl: 8%;", "@property --bl { syntax: '<percentage>'; inherits: true; initial-value: 8%; }\n@property --bt { syntax: '<percentage>'; inherits: true; initial-value: 10%; }\n@property --br { syntax: '<percentage>'; inherits: true; initial-value: 8%; }\n@property --bb { syntax: '<percentage>'; inherits: true; initial-value: 22%; }\n.screen { --bl: 8%;")

# vignette 2: the price card conversation, about 35% faster
rep(".step.on .v2 .b-hi { animation: bubIn .6s var(--spring) .3s both; }\n.step.on .v2 .pcard { animation: cardIn .8s var(--ease-out) .9s both; }\n.step.on .v2 .tap { animation: tapMove 1.1s ease 2.2s both, tapRing .5s ease 3.3s both; }\n.step.on .v2 .pc-approve { animation: approveBg .3s ease 3.35s both; }\n.step.on .v2 .pc-approve b:first-child { animation: swapOut .2s ease 3.35s both; }\n.step.on .v2 .pc-approve .done { animation: swapIn .35s var(--spring) 3.4s both; }\n.step.on .v2 .b-conf { animation: bubIn .6s var(--spring) 4.1s both; }",
    ".step.on .v2 .b-hi { animation: bubIn .5s var(--spring) .1s both; }\n.step.on .v2 .pcard { animation: cardIn .6s var(--ease-out) .55s both; }\n.step.on .v2 .tap { animation: tapMove .75s ease 1.3s both, tapRing .4s ease 2.05s both; }\n.step.on .v2 .pc-approve { animation: approveBg .25s ease 2.1s both; }\n.step.on .v2 .pc-approve b:first-child { animation: swapOut .15s ease 2.1s both; }\n.step.on .v2 .pc-approve .done { animation: swapIn .3s var(--spring) 2.15s both; }\n.step.on .v2 .b-conf { animation: bubIn .5s var(--spring) 2.6s both; }")
wr('css/sections.css', c)
print('ok')
