var open = document.getElementById('hamburger');
var changeIcon = true;

open.addEventListener("click", function() {
    var overlay = document.querySelector('.overlay');
    var nav = document.querySelector('nav');
    var icon = document.querySelector('.menu-toggle i');

    // Toggle the overlay and navbar visibility
    overlay.classList.toggle("show");
    nav.querySelector('ul').classList.toggle("show");

    // Toggle the hamburger icon to a close (X) icon and vice versa
    if (changeIcon) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
        changeIcon = false;
    } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        changeIcon = true;
    }
});

// Gallery functions (unchanged)
document.querySelectorAll('.item').forEach(item => {
    item.addEventListener('click', e => {
        const imgSrc = e.target.getAttribute('src');
        document.querySelector('.overlay-image').setAttribute('src', imgSrc);
        document.querySelector('.overlay').style.display = 'flex';
        document.querySelector('body').style.overflow = 'hidden';
    });
});

// Close overlay when close button is clicked
document.querySelector('.close').addEventListener('click', e => {
    document.querySelector('.overlay').style.display = 'none';
    document.querySelector('body').style.overflow = 'auto';
});

// Navigation Gallery Next/Previous functionality
const images = document.querySelectorAll('.item img');
let currentIndex = 0;

function showNextImage() {
    currentIndex++;
    if (currentIndex >= images.length) {
        currentIndex = 0;
    }
    const imgSrc = images[currentIndex].getAttribute('src');
    document.querySelector('.overlay-image').setAttribute('src', imgSrc);
}

function showPrevImage() {
    currentIndex--;
    if (currentIndex < 0) {
        currentIndex = images.length - 1;
    }
    const imgSrc = images[currentIndex].getAttribute('src');
    document.querySelector('.overlay-image').setAttribute('src', imgSrc);
}

document.querySelector('.prev').addEventListener('click', showPrevImage);
document.querySelector('.next').addEventListener('click', showNextImage);

// Bind left and right arrow keys to gallery navigation
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        showPrevImage();
    }
    if (e.key === 'ArrowRight') {
        showNextImage();
    }
});

// Get the hamburger icon and menu toggle state
var open = document.getElementById('hamburger');
var changeIcon = true;

// When the hamburger icon is clicked
open.addEventListener("click", function() {
    var overlay = document.querySelector('.overlay');
    var nav = document.querySelector('nav');
    var icon = document.querySelector('.menu-toggle i');
    var ul = nav.querySelector('ul');

    // Toggle menu and overlay visibility
    overlay.classList.toggle("show");
    ul.classList.toggle("show");

    // Toggle the icon between hamburger and close
    if (changeIcon) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
        changeIcon = false;
    } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        changeIcon = true;
    }
});

// Close menu when clicking on the overlay
document.querySelector('.overlay').addEventListener('click', function() {
    document.querySelector('.overlay').classList.remove("show");
    document.querySelector('nav ul').classList.remove("show");
    document.querySelector('.menu-toggle i').classList.remove("fa-times");
    document.querySelector('.menu-toggle i').classList.add("fa-bars");
    changeIcon = true;
});

// Sticky Navbar
const navbar = document.querySelector('nav');
const sticky = navbar.offsetTop;

function toggleSticky() {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add('sticky');
    } else {
        navbar.classList.remove('sticky');
    }
}

window.addEventListener('scroll', toggleSticky);


window.addEventListener('scroll', toggleSticky);
