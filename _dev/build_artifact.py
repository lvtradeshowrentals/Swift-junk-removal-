"""Builds the single-file version of the site for the Artifact viewer: scripts inlined, html/head/body wrappers removed.
Also writes _dev/artifact-test.html, the same content inside a wrapper shaped like the viewer's skeleton, for local testing."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = r'C:\Users\Cleo\AppData\Local\Temp\claude\C--Users-Cleo-Desktop-world2\9b2e45ac-5881-48cf-9372-d7d24bba78d0\scratchpad\swift-junk-removal.html'

s = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
for name in ['core', 'items', 'landmarks', 'bg', 'world', 'truck', 'trailer', 'hero-world', 'human', 'crew', 'splash', 'ride', 'scenes', 'ui', 'quote', 'services', 'how', 'proof', 'faq', 'finale', 'page']:
    tag = '<script src="js/%s.js"></script>' % name
    assert tag in s, tag
    js = open(os.path.join(ROOT, 'js', name + '.js'), encoding='utf-8').read()
    assert '</script' not in js
    s = s.replace(tag, '<script>\n' + js + '\n</script>')

css = open(os.path.join(ROOT, 'css', 'sections.css'), encoding='utf-8').read()
s = s.replace('<link rel="stylesheet" href="css/sections.css">', '<style>\n' + css + '\n</style>')
links = ''.join(re.findall(r'<link[^>]*>\n?', s))
style = ''.join(re.findall(r'<style>.*?</style>', s, re.S))
body = re.search(r'<body>(.*)</body>', s, re.S).group(1)
out = '<title>Swift Junk Removal</title>\n' + links + style + '\n' + body
open(OUT, 'w', encoding='utf-8').write(out)

wrap = ('<!doctype html><html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'
        + out + '</body></html>')
open(os.path.join(ROOT, '_dev', 'artifact-test.html'), 'w', encoding='utf-8').write(wrap)
print('built', len(out), 'bytes')
