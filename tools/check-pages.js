// Render every page at three widths. Report console errors, failed requests,
// horizontal overflow and focus visibility, then screenshot.
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:8123';
const PAGES = ['index.html', 'Pictures.html', 'Amenities.html', 'Visits.html',
               'Contact.html', 'thank-you.html', 'privacy.html'];
const VIEWPORTS = [
  { name: 'mobile',  width: 375,  height: 812 },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

(async () => {
  const browser = await chromium.launch();
  const problems = [];
  fs.mkdirSync('out', { recursive: true });

  for (const vp of VIEWPORTS) {
    for (const page of PAGES) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      });
      const p = await ctx.newPage();
      const errors = [], failed = [];

      p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      p.on('pageerror', e => errors.push('UNCAUGHT: ' + e.message));
      p.on('requestfailed', r => failed.push(r.url().replace(BASE, '') + ' :: ' + (r.failure() || {}).errorText));
      p.on('response', r => { if (r.status() >= 400) failed.push(r.url().replace(BASE, '') + ' :: HTTP ' + r.status()); });

      await p.goto(`${BASE}/${page}`, { waitUntil: 'networkidle', timeout: 30000 });

      const metrics = await p.evaluate(() => {
        const de = document.documentElement;
        // Which elements stick out past the viewport?
        const wide = [];
        document.querySelectorAll('body *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)) {
            wide.push(el.tagName.toLowerCase() + (el.className && typeof el.className === 'string'
              ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '') +
              ` [${Math.round(r.left)}..${Math.round(r.right)}]`);
          }
        });
        return {
          scrollW: de.scrollWidth,
          clientW: de.clientWidth,
          overflowing: [...new Set(wide)].slice(0, 6),
          consent: !!document.querySelector('.consent'),
          gtag: !!window.__vpAnalyticsLoaded,
          cookies: document.cookie.length,
          navToggleVisible: (() => {
            const t = document.getElementById('nav-toggle');
            if (!t) return null;
            return getComputedStyle(t).display !== 'none';
          })(),
        };
      });

      if (metrics.scrollW > metrics.clientW + 1) {
        problems.push(`${page} @${vp.name}: horizontal overflow ${metrics.scrollW} > ${metrics.clientW} :: ${metrics.overflowing.join(' | ')}`);
      }
      errors.forEach(e => problems.push(`${page} @${vp.name}: console ${e}`));
      failed.forEach(f => problems.push(`${page} @${vp.name}: request ${f}`));
      if (metrics.gtag) problems.push(`${page} @${vp.name}: analytics loaded before consent`);
      if (metrics.cookies > 0) problems.push(`${page} @${vp.name}: cookie set before consent (${metrics.cookies} chars)`);
      if (!metrics.consent) problems.push(`${page} @${vp.name}: consent banner missing`);

      // Expect the hamburger below 900px and not above it.
      const expectToggle = vp.width < 900;
      if (metrics.navToggleVisible !== null && metrics.navToggleVisible !== expectToggle) {
        problems.push(`${page} @${vp.name}: nav toggle visible=${metrics.navToggleVisible}, expected ${expectToggle}`);
      }

      await p.screenshot({ path: `out/${vp.name}-${page.replace('.html','')}.png`, fullPage: vp.name === 'desktop' });
      await ctx.close();
    }
  }

  await browser.close();
  console.log(problems.length ? 'PROBLEMS:' : 'No problems found.');
  problems.forEach(p => console.log('  ' + p));
})();
