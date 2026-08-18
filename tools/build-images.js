// Generate responsive AVIF and WebP derivatives, and shrink the JPEG fallback.
//
// WARNING: this rewrites assets/images/*.jpg IN PLACE. The files there are
// already compressed derivatives, so running this again re-encodes an
// already-encoded image and compounds the quality loss.
//
// Run it only against fresh camera originals. Put them in assets/images/,
// confirm with `git status` that the files you expect are the ones changing,
// and check the result before committing. Originals from the first pass are
// recoverable from git history at commit 83abece and earlier.
//
// Usage:
//   mkdir -p /tmp/imgtool && cd /tmp/imgtool && npm init -y && npm install sharp
//   node /path/to/VillaPergia/tools/build-images.js
//
// Deliberately not wired to a package.json in this repo: the site itself has
// no build step, and adding one is a decision for the Astro migration.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'assets', 'images');
const WIDTHS = [640, 1280, 1920];
const FALLBACK_MAX = 1600;

(async () => {
  const files = fs.readdirSync(DIR).filter(f => /\.jpe?g$/i.test(f));
  let before = 0, after = 0;
  const manifest = {};

  for (const file of files) {
    const src = path.join(DIR, file);
    const base = file.replace(/\.jpe?g$/i, '');
    const meta = await sharp(src).metadata();
    before += fs.statSync(src).size;

    // Never enlarge. Several sources are already smaller than 640px.
    const widths = WIDTHS.filter(w => w <= meta.width);
    if (widths.length === 0) widths.push(meta.width);

    // A source sitting between breakpoints also needs a variant at its own
    // width, otherwise the browser drops to the JPEG at full render size.
    const capped = Math.min(meta.width, FALLBACK_MAX);
    if (!widths.includes(capped)) widths.push(capped);
    widths.sort((a, b) => a - b);

    for (const w of widths) {
      await sharp(src).resize({ width: w, withoutEnlargement: true })
        .avif({ quality: 58, effort: 4 })
        .toFile(path.join(DIR, `${base}-${w}.avif`));
      await sharp(src).resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(path.join(DIR, `${base}-${w}.webp`));
    }

    const buf = await sharp(src)
      .resize({ width: FALLBACK_MAX, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    fs.writeFileSync(src, buf);

    const finalMeta = await sharp(src).metadata();
    after += fs.statSync(src).size;
    manifest[file] = { width: finalMeta.width, height: finalMeta.height, widths };
    console.log(`  ${file.padEnd(34)} ${meta.width}x${meta.height} -> ${finalMeta.width}x${finalMeta.height}  variants: ${widths.join(', ')}`);
  }

  fs.writeFileSync(path.join(__dirname, 'image-manifest.json'), JSON.stringify(manifest, null, 2));
  const mb = n => (n / 1024 / 1024).toFixed(1) + 'MB';
  console.log(`\n  fallback JPEGs: ${mb(before)} -> ${mb(after)}`);
  console.log('  wrote tools/image-manifest.json');
  console.log('\n  Now re-run the markup step so width, height and srcset match.');
})();
