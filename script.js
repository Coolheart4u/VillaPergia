var open = document.getElementById('hamburger');
var changeIcon = true;

open.addEventListener("click", function(){

    var overlay = document.querySelector('.overlay');
    var nav = document.querySelector('nav');
    var icon = document.querySelector('.menu-toggle i');

    overlay.classList.toggle("menu-open");
    nav.classList.toggle("menu-open");

    if (changeIcon) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");

        changeIcon = false;
    }
    else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        changeIcon = true;
    }
});


// START In the GAllery

// Open overlay when image is clicked
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
  
  // Previous and next buttons
  // Get all images in the gallery
const images = document.querySelectorAll('.item img');

// Set index of current image
let currentIndex = 0;

// Show next image
function showNextImage() {
  currentIndex++;
  if (currentIndex >= images.length) {
    currentIndex = 0;
  }
  const imgSrc = images[currentIndex].getAttribute('src');
  document.querySelector('.overlay-image').setAttribute('src', imgSrc);
}

// Show previous image
function showPrevImage() {
  currentIndex--;
  if (currentIndex < 0) {
    currentIndex = images.length - 1;
  }
  const imgSrc = images[currentIndex].getAttribute('src');
  document.querySelector('.overlay-image').setAttribute('src', imgSrc);
}

// Bind previous and next buttons to functions
document.querySelector('.prev').addEventListener('click', showPrevImage);
document.querySelector('.next').addEventListener('click', showNextImage);

// Bind left and right arrow keys to functions
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') {
    showPrevImage();
  }
  if (e.key === 'ArrowRight') {
    showNextImage();
  }
});

// END inthe Gallery



  // navbar script from chatgpr
// Get the navbar element
const navbar = document.querySelector('nav');

// Get the offset position of the navbar
const sticky = navbar.offsetTop;

// Function to add or remove the "sticky" class
function toggleSticky() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add('sticky');
  } else {
    navbar.classList.remove('sticky');
  }
}

// Add a scroll event listener to toggle the "sticky" class
window.addEventListener('scroll', toggleSticky);


// navbar script end from cht Gpt/

