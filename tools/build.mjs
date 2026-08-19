// Renders the HTML pages from content/*.json.
//
// The pages remain real, complete HTML committed to the repo, so the site still
// works as plain static files and GitHub Pages would still serve it. The build
// only rewrites the regions between BUILD:name markers, so anything outside
// them stays hand-authored.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8'));

const site = read('site.json');
const rates = read('rates.json');
const home = read('home.json');
const gallery = read('gallery.json');
const area = read('area.json');
const amenities = read('amenities.json');

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Mirrors tools/apply-picture-markup.py so the build produces identical markup.
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'image-manifest.json'), 'utf8'));

function picture(src, alt, sizes, { eager = false, indent = '', cls = '' } = {}) {
  const file = src.replace(/^assets\/images\//, '');
  const entry = manifest[file];
  const pad = indent + '  ';
  const klass = cls ? `class="${esc(cls)}" ` : '';
  if (!entry) {
    return `<img ${klass}src="${esc(src)}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  }
  const base = file.replace(/\.jpe?g$/i, '');
  const set = ext => entry.widths.map(w => `assets/images/${base}-${w}.${ext} ${w}w`).join(', ');
  const loading = eager
    ? 'loading="eager" fetchpriority="high" decoding="async"'
    : 'loading="lazy" decoding="async"';
  return [
    `<picture>`,
    `${pad}<source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">`,
    `${pad}<source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">`,
    `${pad}<img ${klass}src="${esc(src)}" alt="${esc(alt)}" width="${entry.width}" height="${entry.height}" ${loading}>`,
    `${indent}</picture>`,
  ].join('\n');
}

const S_FEATURE = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 280px';
const S_TILE = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px';
const S_CARD = '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px';

const icon = n => `<svg class="icon" aria-hidden="true"><use href="#i-${n}"></use></svg>`;

const blocks = {
  hero: () => `    ${picture(home.hero.image, home.hero.alt, '100vw', { eager: true, indent: '    ', cls: 'hero__media' })}
    <div class="container hero__inner">
      <p class="eyebrow">${esc(home.hero.eyebrow)}</p>
      <h1>${esc(home.hero.heading)}</h1>
      <p>${esc(home.hero.text)}</p>
      <div class="hero__actions">
        <a class="btn btn--primary" href="Contact.html">Check availability</a>
        <a class="btn btn--ghost" href="Pictures.html">View the gallery</a>
      </div>
    </div>`,

  about: () => `        <p class="eyebrow">${esc(home.about_eyebrow)}</p>
        <h2>${esc(home.about_heading)}</h2>
        <p class="lede">${esc(home.about_text)}</p>`,

  features: () => home.features.map(f => `        <article class="feature">
          <div class="feature__media">
            ${picture(f.image, f.alt, S_FEATURE, { indent: '            ' })}
          </div>
          <div class="feature__body">
            <h3>${esc(f.title)}</h3>
            <p>${esc(f.text)}</p>
          </div>
        </article>`).join('\n\n'),

  rates: () => rates.seasons.map(s => `        <article class="price-card${s.peak ? ' price-card--peak' : ''}">
          <div class="price-card__top">
            <h3>${esc(s.name)}</h3>${s.peak ? '\n            <span class="tag">Peak season</span>' : ''}
          </div>
          <p class="price-card__amount"><b>&euro;${esc(s.price)}</b><span>${esc(s.unit)}</span></p>
          <ul>
${s.includes.map(i => `            <li>${icon('check')}${esc(i)}</li>`).join('\n')}
          </ul>
          <a class="btn btn--${s.peak ? 'primary' : 'outline'}" href="Contact.html">Enquire about ${esc(s.name.toLowerCase())}</a>
        </article>`).join('\n\n'),

  ratesintro: () => `        <p class="lede">${esc(rates.intro)}</p>`,

  location: () => `        <h2>${esc(home.location_heading)}</h2>
        <p class="lede">${esc(home.location_text)}</p>`,

  gallery: () => gallery.items.map(g => `        <button class="gallery-item" type="button" aria-label="Open photograph">
          ${picture(g.image, g.alt, S_TILE, { indent: '          ' })}
        </button>`).join('\n\n'),

  areaintro: () => `        <p class="lede">${esc(area.intro)}</p>`,

  area: () => area.cards.map(c => `        <button class="area-card" type="button" aria-expanded="false">
          ${picture(c.image, c.alt, S_CARD, { indent: '          ' })}
          <span class="area-card__body">
            <span class="area-card__title">${esc(c.title)}</span>
            <span class="area-card__text">${esc(c.text)}</span>
          </span>
        </button>`).join('\n\n'),

  amenintro: () => `        <p class="lede">${esc(amenities.intro)}</p>`,

  amenities: () => amenities.groups.map(g => `        <div class="amenity-group">
          <h2>${esc(g.title)}</h2>
          <div class="amenity-list">
${g.items.map(i => `            <span class="amenity">${icon('check')}${esc(i)}</span>`).join('\n')}
          </div>${g.note ? `\n          <p class="amenity-note">${esc(g.note)}</p>` : ''}
        </div>`).join('\n\n'),

  rules: () => amenities.rules.map(r => `        <div class="rule">
          <h3>${esc(r.title)}</h3>
          <p>${esc(r.text)}</p>
        </div>`).join('\n\n'),

  footeraddress: () => `        <p>${esc(site.address_line1)}<br>${esc(site.address_line2)}<br>${esc(site.address_line3)}</p>`,

  footercontact: () => {
    const rows = [`          <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`];
    if (site.phone) rows.push(`          <a href="tel:${esc(site.phone.replace(/\s+/g, ''))}">${esc(site.phone)}</a>`);
    if (site.whatsapp) rows.push(`          <a href="https://wa.me/${esc(site.whatsapp.replace(/\D/g, ''))}">WhatsApp</a>`);
    return rows.join('\n');
  },

  copyright: () => `      <p>&copy; ${esc(site.name)} ${esc(site.copyright_year)}</p>`,
};

let changed = 0;
for (const file of fs.readdirSync(ROOT).filter(f => f.endsWith('.html'))) {
  const p = path.join(ROOT, file);
  const before = fs.readFileSync(p, 'utf8');
  const after = before.replace(
    /(<!-- BUILD:([a-z]+) -->)[\s\S]*?(<!-- \/BUILD:\2 -->)/g,
    (m, open, name, close) => {
      const fn = blocks[name];
      if (!fn) throw new Error(`${file}: no block named "${name}"`);
      return `${open}\n${fn()}\n${' '.repeat(m.match(/\n(\s*)<!-- \/BUILD/)?.[1].length ?? 0)}${close}`;
    });
  if (after !== before) { fs.writeFileSync(p, after); changed++; console.log(`  rebuilt ${file}`); }
}
console.log(changed ? `\n${changed} pages rebuilt from content/` : '\nno changes, pages already match content/');
