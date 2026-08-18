# Villa Pergia

Website for a three bedroom private beach villa in Latchi, Cyprus.
Live at [villapergia.com](https://villapergia.com).

Static HTML, CSS and JavaScript. No build step, no framework, no dependencies at runtime.
Files are served exactly as they sit in this repository, from GitHub Pages via `CNAME`.

## Running it locally

Any static file server will do. There is nothing to compile.

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

Open it over HTTP rather than `file://`, otherwise the shared `assets/js/script.js` and
the relative asset paths will not resolve the way they do in production.

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: hero, the villa, rates, location |
| `Pictures.html` | Photo gallery with a `<dialog>` lightbox |
| `Amenities.html` | What is included, and house rules |
| `Visits.html` | Things to do nearby |
| `Contact.html` | Booking enquiry form |
| `thank-you.html` | Form confirmation, `noindex` |
| `privacy.html` | Privacy policy |

Filenames keep their original capitalisation deliberately. Renaming them would break every
URL Google has indexed, and GitHub Pages cannot issue redirects.

## Layout

```
assets/
  css/styles.css    design tokens, then components by section
  js/script.js      consent, nav, sticky header, area cards, lightbox
  favicon.svg
  images/           .jpg fallback plus -640/-1280/-1920 .avif and .webp
tools/
  build-images.js           regenerates image derivatives
  apply-picture-markup.py   rewrites <img> tags from the manifest
```

## Images

Photographs are served as `<picture>` with AVIF and WebP variants and a resized JPEG
fallback. To add one, see the image section of [CLAUDE.md](CLAUDE.md): `build-images.js`
rewrites JPEGs in place and must not be run twice over its own output.

## Analytics

Google Analytics is deliberately **not** in the page markup. Cyprus is in the EU, so no
cookie may be set before the visitor agrees. `script.js` injects the tag only after an
explicit accept on the consent banner.

Do not paste a `gtag` snippet back into an HTML file.

## Contributing

[CLAUDE.md](CLAUDE.md) carries the conventions: naming, the design tokens, the four
breakpoints, the guard-every-DOM-lookup rule for the shared script, and the manual
checklist to run before committing. Read it first.
