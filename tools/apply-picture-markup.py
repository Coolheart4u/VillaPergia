#!/usr/bin/env python3
"""Rewrite every local <img> into a <picture> with AVIF and WebP sources.

Idempotent: an <img> already inside a <picture> is skipped.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).parent.parent
MANIFEST = json.loads((pathlib.Path(__file__).parent / 'image-manifest.json').read_text())

# How wide the image actually renders, per context. Wrong sizes means the
# browser picks a variant that is too big, which wastes the whole exercise.
SIZES = {
    'hero__media':   '100vw',
    'gallery-item':  '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px',
    'area-card':     '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px',
    'feature__media':'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px',
}
DEFAULT_SIZES = '(max-width: 768px) 100vw, 50vw'


def srcset(base, widths, ext):
    return ', '.join(f'assets/images/{base}-{w}.{ext} {w}w' for w in widths)


def context_sizes(html, start):
    """Look back a little for the class that tells us the render width."""
    window = html[max(0, start - 400):start]
    for key, value in SIZES.items():
        if key in window:
            return value
    return DEFAULT_SIZES


for page in sorted(ROOT.glob('*.html')):
    html = page.read_text(encoding='utf-8')
    out, cursor, count = [], 0, 0

    for m in re.finditer(r'<img\b[^>]*>', html):
        tag = m.group(0)
        src_m = re.search(r'src="assets/images/([^"]+)"', tag)
        if not src_m:
            continue
        # Already wrapped?
        if '<picture>' in html[max(0, m.start() - 500):m.start()] and \
           '</picture>' not in html[max(0, m.start() - 500):m.start()]:
            continue

        filename = src_m.group(1)
        entry = MANIFEST.get(filename)
        if not entry:
            continue

        base = re.sub(r'\.jpe?g$', '', filename)
        widths = entry['widths']

        # Refresh width/height to the resized fallback.
        new_tag = re.sub(r'width="\d+"', f'width="{entry["width"]}"', tag)
        new_tag = re.sub(r'height="\d+"', f'height="{entry["height"]}"', new_tag)

        sizes = context_sizes(html, m.start())
        indent = ' ' * (m.start() - html.rfind('\n', 0, m.start()) - 1)

        block = (
            f'<picture>\n'
            f'{indent}  <source type="image/avif" srcset="{srcset(base, widths, "avif")}" sizes="{sizes}">\n'
            f'{indent}  <source type="image/webp" srcset="{srcset(base, widths, "webp")}" sizes="{sizes}">\n'
            f'{indent}  {new_tag}\n'
            f'{indent}</picture>'
        )

        out.append(html[cursor:m.start()])
        out.append(block)
        cursor = m.end()
        count += 1

    if count:
        out.append(html[cursor:])
        page.write_text(''.join(out), encoding='utf-8')
        print(f'  {page.name}: wrapped {count} images')

print('done')
