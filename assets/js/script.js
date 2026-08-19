// Shared across every page, so an element present on one page will be absent on
// another. Guard every DOM lookup: an unguarded one throws and kills the rest of
// this file on the page where the element is missing.

// --------------------------------------------------------------------------
// Analytics consent
//
// Cyprus is in the EU, so GDPR and the ePrivacy Directive apply: no cookie may
// be set before the visitor agrees. Google Analytics is therefore not in the
// page markup at all. Nothing loads and nothing is written until consent is
// explicitly granted, and ignoring the banner counts as refusal.
// --------------------------------------------------------------------------
(function initConsent() {
  const KEY = 'vp-analytics-consent';
  const GA_ID = 'G-Y9VL5H3MKV';

  function readChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* private mode */ }
  }

  function loadAnalytics() {
    if (window.__vpAnalyticsLoaded) return;
    window.__vpAnalyticsLoaded = true;

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(tag);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
  }

  function showBanner() {
    const bar = document.createElement('div');
    bar.className = 'consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Analytics consent');
    bar.innerHTML =
      '<p class="consent__text">We would like to count visits so we know which pages are useful. ' +
      'No cookies are set unless you agree. ' +
      '<a href="privacy.html">Privacy policy</a>.</p>' +
      '<div class="consent__actions">' +
      '<button class="btn btn--outline consent__no" type="button">Decline</button>' +
      '<button class="btn btn--primary consent__yes" type="button">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);

    bar.querySelector('.consent__yes').addEventListener('click', function () {
      saveChoice('granted');
      loadAnalytics();
      bar.remove();
    });
    bar.querySelector('.consent__no').addEventListener('click', function () {
      saveChoice('denied');
      bar.remove();
    });
  }

  // Lets the privacy page hand the choice back to the visitor.
  const reset = document.getElementById('reset-consent');
  if (reset) {
    reset.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
      if (!document.querySelector('.consent')) showBanner();
    });
  }

  const choice = readChoice();
  if (choice === 'granted') loadAnalytics();
  else if (choice !== 'denied') showBanner();
})();

// --------------------------------------------------------------------------
// Mobile navigation
// --------------------------------------------------------------------------
(function initNav() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  const scrim = document.querySelector('.nav-scrim');
  if (!toggle || !nav) return;

  function setOpen(isOpen) {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    nav.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('nav-locked', isOpen);

    if (scrim) {
      scrim.hidden = false;
      scrim.classList.toggle('menu-open', isOpen);
    }

    const icon = toggle.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars', !isOpen);
      icon.classList.toggle('fa-times', isOpen);
    }
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  if (scrim) {
    scrim.addEventListener('click', function () {
      setOpen(false);
      toggle.focus();
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Close on navigation so the back button never restores a stuck open menu
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
})();

// --------------------------------------------------------------------------
// Sticky header
// --------------------------------------------------------------------------
(function initStickyHeader() {
  // Only the overlay header changes appearance on scroll. Every other page has
  // a solid header from the start, and toggling this class there would strip
  // the solid background and leave white type on a cream ground.
  const header = document.querySelector('.site-header--overlay');
  if (!header || !('IntersectionObserver' in window)) return;

  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  header.parentNode.insertBefore(sentinel, header);

  new IntersectionObserver(function (entries) {
    header.classList.toggle('is-stuck', !entries[0].isIntersecting);
  }).observe(sentinel);
})();

// --------------------------------------------------------------------------
// Area page: tap to expand a card's description
// --------------------------------------------------------------------------
(function initAreaCards() {
  const cards = document.querySelectorAll('.area-card');
  if (!cards.length) return;

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      const open = card.getAttribute('aria-expanded') === 'true';
      card.setAttribute('aria-expanded', String(!open));
    });
  });
})();

// --------------------------------------------------------------------------
// Gallery lightbox, built on <dialog> for focus trapping and Escape handling
// --------------------------------------------------------------------------
(function initLightbox() {
  const dialog = document.getElementById('lightbox');
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  if (!dialog || !items.length) return;

  const img = dialog.querySelector('.lightbox__img');
  const caption = dialog.querySelector('.lightbox__caption');
  const prev = dialog.querySelector('.lightbox__prev');
  const next = dialog.querySelector('.lightbox__next');
  const close = dialog.querySelector('.lightbox__close');
  if (!img) return;

  let index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    const source = items[index].querySelector('img');
    if (!source) return;
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    if (caption) caption.textContent = source.alt;
  }

  items.forEach(function (item, i) {
    item.addEventListener('click', function () {
      show(i);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });

  if (prev) prev.addEventListener('click', function () { show(index - 1); });
  if (next) next.addEventListener('click', function () { show(index + 1); });
  if (close) close.addEventListener('click', function () { dialog.close(); });

  dialog.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
  });

  // Click the backdrop to dismiss. The dialog fills the viewport, so compare
  // against the figure's box rather than the dialog's.
  dialog.addEventListener('click', function (event) {
    const figure = dialog.querySelector('.lightbox__figure');
    if (!figure) return;
    if (event.target === dialog || event.target === figure) dialog.close();
  });

  // Swipe, so a phone can move between images without hitting the arrows
  let startX = null;
  dialog.addEventListener('touchstart', function (event) {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });

  dialog.addEventListener('touchend', function (event) {
    if (startX === null) return;
    const delta = event.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 50) show(delta < 0 ? index + 1 : index - 1);
    startX = null;
  }, { passive: true });
})();

// --------------------------------------------------------------------------
// Map facade
//
// The Google Maps embed costs roughly 1.6MB of JavaScript and sets its own
// cookies, so it is not loaded until someone asks for it.
// --------------------------------------------------------------------------
(function initMapFacade() {
  const button = document.getElementById('map-load');
  if (!button) return;

  button.addEventListener('click', function () {
    const frame = document.createElement('iframe');
    frame.src = button.dataset.mapSrc;
    frame.title = button.dataset.mapTitle;
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.allowFullscreen = true;
    button.replaceWith(frame);
  });
})();
