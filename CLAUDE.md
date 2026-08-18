# Villa Pergia

Marketing and direct-booking site for a three bedroom private beach villa in Latchi,
Cyprus. Live at https://villapergia.com, served from GitHub Pages via the `CNAME` file.

The business goal is direct bookings. Every technical decision should be weighed against
two things: whether Google can find the page, and how fast the photos load on a phone
over a hotel wifi connection. Those are the only two metrics that convert.

## Current state

Static HTML, CSS and JavaScript with no build step. Files are served exactly as they sit
in the repository. There is no bundler, no package manager and no test suite, so every
change must be verified by opening the page in a browser.

A migration to Astro is planned. Until it lands, treat this as a plain static site and do
not introduce a build step, a framework or an npm dependency without discussing it first.

## Layout

```
index.html          Home
Pictures.html       Gallery
Amenities.html      Amenities and house rules
Visits.html         The area
Contact.html        Enquiry form
thank-you.html      Form confirmation, noindex
privacy.html        Privacy policy
sitemap.xml
robots.txt
CNAME
tools/
  build-images.js         regenerates AVIF and WebP derivatives
  apply-picture-markup.py rewrites img tags from the manifest
  image-manifest.json
assets/
  css/styles.css
  js/script.js
  favicon.svg
  images/           .jpg fallback plus -640/-1280/-1920 .avif and .webp
  images/unsorted/  unidentified, needs review before use
```

Page filenames keep their original capitalisation on purpose. Renaming them would break
every URL Google has indexed, and GitHub Pages cannot issue redirects. Lowercase them
during the Astro migration, where redirects can be configured properly.

## Style rules

- **No em dashes.** Anywhere. Not in page copy, not in code comments, not in commit
  messages, not in this file. Use a colon, a comma, parentheses or two sentences.
- Two space indentation in HTML, CSS and JavaScript.
- Double quotes for HTML attributes. Single quotes in JavaScript.
- Lowercase, hyphenated filenames for new assets: `pool-terrace.jpg`, never
  `24052011 073.JPG`. Spaces need URL encoding in every reference and uppercase
  extensions resolve differently on a case sensitive host than on a local machine.

## Design system

Defined at the top of `assets/css/styles.css`. Reference tokens by name and never paste a
hex value into a component.

| Role | Token | Value |
|---|---|---|
| Page ground | `--sand-50` | `#FBF8F3` |
| Tinted band | `--sand-100` | `#F3EDE3` |
| Hairlines | `--sand-200` | `#E4DACB` |
| Body text | `--ink-900` | `#1B211F` |
| Muted text | `--ink-500` | `#5A6663` |
| Footer ground | `--sea-800` | `#0E5561` |
| Actions | `--sea-600` | `#167C8C` |
| Peak season only | `--clay-600` | `#B4573A` |

Spacing runs `--space-1` through `--space-10` on a 4px base. Radii are `--radius-s` (4px)
for controls and `--radius-m` (10px) for cards. There is one elevation, `--lift`, used on
cards only.

Type is Cormorant Garamond for display and Work Sans for everything else. Both carry
Greek and Cyrillic, which the advertised languages will need if translated routes are
added.

**Breakpoints are 1024, 900, 768 and 480.** Do not add a fifth. The stylesheet previously
had eight, none of them aligned, and layouts broke in the gaps between them. 900 is the
navigation breakpoint specifically, because the horizontal nav overflows above 768.

Cards lift 2px on hover. They never scale: scaling a grid item overlaps its neighbours and
overflows small screens, which is exactly what the old pricing cards did.

## HTML conventions

Every page must have, in this order inside `<head>`:

1. `<meta charset="UTF-8">` and the viewport meta
2. A unique, descriptive `<title>` that names the property and the location
3. A unique `<meta name="description">` between 140 and 160 characters
4. `<link rel="canonical">` pointing at the https://villapergia.com URL
5. Open Graph and Twitter card tags with an absolute image URL
6. Favicon links
7. Stylesheets, then deferred scripts

Never ship a page titled "Document". That string is what Google prints as the headline.

Structural requirements:

- Close every non void element. Validate with https://validator.w3.org before committing
  markup changes.
- Every page gets the shared header and footer. A visitor landing on any page from search
  must be able to reach the enquiry form in one click.
- Interactive controls are `<button>`, never a `<div>` with a click handler. Buttons need
  `aria-expanded` and `aria-controls` when they toggle something.
- The lightbox uses `<dialog>`, which provides focus trapping and Escape handling for
  free. Do not hand roll either.
- Nothing may reveal content on `:hover` alone. Touch devices have no hover, and this bug
  made the entire area page unreadable on a phone for most of the project's life.
- Alt text describes what is in the photo and where it is. `alt="Avatar"` and
  `alt="Image 3"` are not acceptable: they lose both screen reader users and image search
  traffic.

## Images

Every photograph has AVIF and WebP variants at 640, 1280 and 1920, plus one at its own
width where the source falls between those breakpoints. The `.jpg` is the fallback,
resized to 1600px at quality 82. Markup is `<picture>` with `sizes` scoped to how wide the
image actually renders in that context.

### Adding a photograph

1. Drop the original into `assets/images/` with a lowercase, hyphenated, descriptive name.
2. Install sharp somewhere outside the repo and run the generator:
   ```
   mkdir -p /tmp/imgtool && cd /tmp/imgtool && npm init -y && npm install sharp
   node ~/repos/VillaPergia/tools/build-images.js
   ```
3. Run `python3 tools/apply-picture-markup.py` to rewrite the markup and refresh every
   `width`, `height` and `srcset` from `tools/image-manifest.json`.
4. Check `git status`. Only the files you expect should have changed.

**`build-images.js` rewrites the JPEGs in place.** The files in `assets/images/` are
already compressed derivatives, so running it a second time re-encodes its own output and
compounds the quality loss. Run it against fresh originals only.

Neither script is wired to a `package.json`. The site has no build step and adding one is
a decision for the Astro migration.

### Rules

- Never commit a camera original. Keep those in cloud storage or a local archive outside
  the repository. Git stores binaries badly and every re-export adds its full size to
  history permanently.
- Always set `width` and `height`, read from the actual file rather than guessed. Wrong
  values cause exactly the layout shift the attributes exist to prevent.
- Always set `loading="lazy"` and `decoding="async"` below the fold. Never on the hero,
  which is `loading="eager"` with `fetchpriority="high"`.
- Keep `sizes` honest. It must describe the rendered width, or the browser picks a variant
  that is too large and the whole exercise is wasted.
- Self host everything. Do not hotlink third party CDNs.

## CSS

- Prefix new class names by their block, for example `gallery-grid` and `nav__link`, not
  `grid` and `link`. Before the rewrite, `.overlay`, `.gallery` and `.container` each
  meant two different things in one file, which made every change unpredictable.
- Do not set `font-size` on `html`. It overrides the reader's own browser preference.
- Watch for silently invalid CSS. It does not warn, it just does nothing:
  `float: center`, `border-radius: solid 10px` and `rgba(0, 0, 0, 0.5s)` were all live in
  this file and all did nothing at all.

## JavaScript

`assets/js/script.js` is shared across pages, so an element present on one page will be
absent on another. Every DOM lookup must be guarded:

```js
document.querySelector('.close')?.addEventListener('click', handler);
```

An unguarded lookup throws on the page where the element is missing, and that kills every
line after it in the file. This exact bug disabled the sticky navbar on the homepage for
most of the project's history, silently, because nobody had the console open.

Each feature lives in its own IIFE that returns early when its elements are not present.

## Analytics and privacy

Cyprus is in the EU, so GDPR and the ePrivacy Directive apply: no cookie may be set before
the visitor agrees.

Google Analytics is therefore **not in the page markup**. Do not put a `gtag` snippet back
into any HTML file. `initConsent` in `assets/js/script.js` injects it only after an
explicit accept. Declining, or ignoring the banner, means Google is never contacted.

`privacy.html` documents what the enquiry form collects, the third parties involved,
retention and GDPR rights. Update it whenever a new third party script or form field is
added, and keep the "last updated" date current.

Moving to a cookieless provider such as Plausible or Umami would remove the banner
altogether and is still worth doing. It needs an account, so it is not done.

## Content accuracy

Amenity copy was originally pasted from a Booking.com listing and described a shared
property. This is a private villa: there is no shared kitchen, no shared toilet and no
shared lounge. Do not reintroduce that language.

Do not claim accessibility features the property does not have. The upper floor is
reachable by stairs only.

Two things need confirming with the owner before they are stated again:

- The interior photographs date from 2011 and show a CRT television, so "flat-screen TV"
  is currently written as "television".
- `pool-terrace.jpg` shows a stone clad building and hills that do not match the setting
  in the 2011 photographs. It may be a different property or a renovation.

## Commits

Small, focused commits with an imperative subject line under 72 characters. One logical
change per commit so a single fix can be reverted without unpicking anything else.

No `Co-Authored-By` trailers.

Good:

```
Fix TypeError that disabled all homepage JavaScript
Add meta descriptions and Open Graph tags to all pages
Remove duplicate club website directory
```

Bad:

```
Update index.html
```

The first ninety four commits on this project were all named after the file they touched,
which makes the history useless for finding when something broke.

## Verification before committing

There is no test suite, so check by hand:

1. Open the changed page and confirm the browser console is clean. A single uncaught
   error stops all remaining JavaScript on the page.
2. Check at 375px, 768px and 1440px widths, and confirm the page never scrolls sideways.
3. Tab through the page. Every interactive element must be reachable and must show a
   visible focus ring.
4. Confirm no request 404s in the network tab, especially images.
5. On a touch device or in device emulation, confirm nothing is reachable only by hover.
