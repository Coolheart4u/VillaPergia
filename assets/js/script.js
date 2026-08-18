// Shared across every page, so an element present on one page will be absent on
// another. Guard every DOM lookup: an unguarded one throws and kills the rest of
// this file on the page where the element is missing.

var hamburger = document.getElementById('hamburger');
var changeIcon = true;

if (hamburger) {
  hamburger.addEventListener('click', function () {
    var overlay = document.querySelector('.overlay');
    var nav = document.querySelector('nav');
    var icon = document.querySelector('.menu-toggle i');

    if (overlay) overlay.classList.toggle('menu-open');
    if (nav) nav.classList.toggle('menu-open');

    if (icon) {
      if (changeIcon) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        changeIcon = false;
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        changeIcon = true;
      }
    }
  });
}

// Sticky navbar
var navbar = document.querySelector('nav');

if (navbar) {
  var sticky = navbar.offsetTop;

  window.addEventListener(
    'scroll',
    function () {
      navbar.classList.toggle('sticky', window.pageYOffset >= sticky);
    },
    { passive: true }
  );
}
