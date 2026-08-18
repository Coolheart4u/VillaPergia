# Villa Pergia

Marketing and direct-booking site for a three bedroom private beach villa in Latchi,
Cyprus. Live at https://villapergia.com, served from GitHub Pages via the `CNAME` file.

The business goal is direct bookings. Every technical decision should be weighed against
two things: whether Google can find the page, and how fast the photos load on a phone
over a hotel wifi connection. Those are the only two metrics that convert.

## Current state

Static HTML, CSS and JavaScript with no build step. Files are served exactly as they sit
in the repository root. There is no bundler, no package manager and no test suite, so
every change must be verified by opening the page in a browser.

A migration to Astro is planned. Until it lands, treat this as a plain static site and do
not introduce a build step, a framework or an npm dependency without discussing it first.

## Style rules

- **No em dashes.** Anywhere. Not in page copy, not in code comments, not in commit
  messages, not in this file. Use a colon, a comma, parentheses or two sentences.
- Two space indentation in HTML, CSS and JavaScript.
- Double quotes for HTML attributes. Single quotes in JavaScript.
- Lowercase, hyphenated filenames for new assets: `pool-terrace-01.jpg`, never
  `24052011 073.JPG`. Spaces need URL encoding in every reference and uppercase
  extensions resolve differently on a case sensitive host than on a local machine.

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
- Every page gets the shared header nav and footer. A visitor landing on any page from
  search must be able to reach the booking form in one click.
- Interactive controls are `<button>`, never a `<div>` with a click handler. Buttons need
  `aria-expanded` and `aria-controls` when they toggle something.
- The lightbox uses `<dialog>`, which provides focus trapping and Escape handling for
  free. Do not hand roll either.
- Alt text describes what is in the photo and where it is. `alt="Avatar"` and
  `alt="Image 3"` are not acceptable: they lose both screen reader users and image search
  traffic.

## Images

The single biggest performance problem on this site. Rules:

- Never commit a camera original. Keep those in cloud storage or a local archive outside
  the repository. Git stores binaries badly and every re-export adds its full size to
  history permanently.
- Resize before committing. Nothing needs to be wider than 2000px, and gallery thumbnails
  should be around 800px.
- Always set `width` and `height` attributes so the browser can reserve space. Missing
  dimensions are what causes the layout to jump while scrolling.
- Always set `loading="lazy"` and `decoding="async"` on anything below the fold. Never on
  the hero image, which should be `loading="eager"` with `fetchpriority="high"`.
- Self host everything. Do not hotlink third party CDNs: those URLs are not under our
  control and can change or disappear without warning.

## CSS

The stylesheet grew by accretion and class names collide. Three rules stop it getting
worse:

- Prefix new class names by their section, for example `gallery-grid` and `nav-toggle`,
  not `grid` and `toggle`. `.overlay`, `.gallery` and `.container` each already mean two
  different things in this file, which is why changes have unpredictable effects.
- Define colors once as custom properties on `:root` and reference them by name. Do not
  paste hex values inline.
- Group related rules under a comment banner and keep them together. Do not append new
  rules to the bottom of the file.

Watch for silently invalid CSS. It does not warn, it just does nothing:
`float: center`, `border-radius: solid 10px` and `rgba(0, 0, 0, 0.5s)` were all live in
this file and all did nothing at all.

## JavaScript

`script.js` is shared across pages, so an element present on one page will be absent on
another. Every DOM lookup must be guarded:

```js
document.querySelector('.close')?.addEventListener('click', handler);
```

An unguarded lookup throws on the page where the element is missing, and that kills every
line after it in the file. This exact bug disabled the sticky navbar on the homepage for
most of the project's history, silently, because nobody had the console open.

## Analytics and privacy

Cyprus is in the EU, so GDPR and the ePrivacy Directive apply. Google Analytics
(`G-Y9VL5H3MKV`) sets cookies before consent, which is not compliant without a banner.

The planned fix is to switch to cookieless analytics (Plausible or Umami) rather than add
a consent banner, because cookieless analytics stores nothing on the visitor's device and
needs no banner at all. Until then, keep the existing tag consistent across all pages so
the numbers are at least trustworthy.

Any page that collects personal data needs a link to a privacy policy. The contact form
posts names and email addresses to `formsubmit.co`.

## Content accuracy

Amenity copy was originally pasted from a Booking.com listing and described a shared
property. This is a private villa: there is no shared kitchen, no shared toilet and no
shared lounge. Do not reintroduce that language.

Do not claim accessibility features the property does not have. The upper floor is
reachable by stairs only.

## Commits

Small, focused commits with an imperative subject line under 72 characters. One logical
change per commit so a single fix can be reverted without unpicking anything else.

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

Ninety four of the first ninety four commits on this project were named after the file
they touched, which makes the history unusable for finding when something broke.

## Verification before committing

There is no test suite, so check by hand:

1. Open the changed page and confirm the browser console is clean. A single uncaught
   error stops all remaining JavaScript on the page.
2. Check at 375px, 768px and 1440px widths.
3. Tab through the page. Every interactive element must be reachable and must show a
   visible focus ring.
4. Confirm no request 404s in the network tab, especially images.
